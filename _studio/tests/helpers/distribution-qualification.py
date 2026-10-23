#!/usr/bin/env python3
"""Run only after explicit owner approval of a committed qualification ZIP.

This never creates a commit/ZIP or replaces installed/source files. It requires
actual fresh/upgrade ZIPs, their committed candidate checkout, and a Git 1.32.0 baseline.
Harnesses stay outside the unpacked package. Local adapter coverage is not client
qualification or proof of Apache/cPanel .htaccess behavior.
"""
import argparse, base64, contextlib, hashlib, http.cookiejar, json, os, pathlib, re
import shutil, signal, socket, stat, subprocess, tarfile, tempfile, time
import urllib.error, urllib.parse, urllib.request, zipfile

HERE = pathlib.Path(__file__).resolve().parent
DIAGNOSTIC = re.compile(r'(?:PHP )?(?:Warning|Deprecated|Notice|Fatal error|Parse error):')
PRESERVED_ROOT = {'index.php', 'favicon.ico', '.htaccess', 'LocalValetDriver.php'}


def legacy_transition(ordering):
    if ordering <= 0:
        raise RuntimeError('Candidate must be newer than the real 1.32.0 baseline')
    return 'increasing_version'


def digest(path):
    return hashlib.sha256(pathlib.Path(path).read_bytes()).hexdigest()


def inventory(root):
    return {str(path.relative_to(root)): digest(path) for path in sorted(root.rglob('*')) if path.is_file()}


def assert_hashes(site, expected, description):
    for relative, sha256 in expected.items():
        target = site / relative
        if target.is_symlink() or not target.is_file() or digest(target) != sha256:
            raise RuntimeError(description + ': ' + relative)


def preserved_inventory(site):
    paths = set(PRESERVED_ROOT) | {'_studio/data/config.json', '_studio/data/published-manifest.json',
                                   '_data/qualification-preserved.json', 'hosting-preserved.txt'}
    preview = site / '_studio/preview'
    # The real 1.32 publisher only publishes root pages and direct partials.
    # Its retained manifest identifies live files; nested draft pages remain
    # private and must independently survive both update and activation.
    manifest = json.loads((site / '_studio/data/published-manifest.json').read_text())
    published = manifest.get('files')
    if not isinstance(published, list) or not published or any(not isinstance(path, str) for path in published):
        raise RuntimeError('Real legacy publisher did not retain its file inventory')
    for path in published:
        safe_name(path)
        paths.add(path)
    paths.update('_studio/preview/' + path for path in inventory(preview) if not path.startswith('assets/')
                 and not any(part.startswith('.') for part in pathlib.PurePosixPath(path).parts))
    for directory in ['_partials', 'assets/images', 'assets/files', 'assets/fonts', 'assets/data',
                      'assets/css', 'assets/js', 'assets/forms']:
        paths.update(directory + '/' + path for path in inventory(site / directory))
    result = {}
    for relative in sorted(paths):
        path = site / relative
        if path.is_symlink() or not path.is_file():
            raise RuntimeError('Preservation fixture lacks an expected regular file: ' + relative)
        result[relative] = digest(path)
    return result


def preserved_after_activation(site, expected, original_schema_mode):
    """Permit only the proved canonical legacy draft-template conversion."""
    manifest = json.loads((site / '_studio/data/workspace-migration/manifest.json').read_text())
    transforms = manifest.get('source_transforms')
    path = '_partials/schema.php'
    private_path = '_studio/preview/' + path
    before = '3ed8baec160d3c89b82a8f06bf5a10e75e74621c0291af1e71eb241757e2fe0e'
    after = 'eef1d3bdd2b55582f34da009d9658fa549368d3378dbe0b5939c47c9da8a8ce5'
    if not isinstance(transforms, dict) or set(transforms) != {path}:
        raise RuntimeError('Canonical legacy schema conversion lacks its exact retained receipt')
    receipt = transforms[path]
    if not isinstance(receipt, dict) or receipt.get('before_sha256') != before or receipt.get('after_sha256') != after:
        raise RuntimeError('Legacy schema conversion hashes differ from the reviewed template')
    try:
        original = base64.b64decode(receipt['before_base64'], validate=True)
    except (KeyError, TypeError, ValueError) as error:
        raise RuntimeError('Legacy schema original bytes are not retained') from error
    if len(original) != 6391 or hashlib.sha256(original).hexdigest() != before or expected.get(private_path) != before:
        raise RuntimeError('Legacy schema original bytes do not match the real pre-upgrade source')
    target = site / private_path
    if receipt.get('mode') != original_schema_mode or stat.S_IMODE(target.stat().st_mode) != original_schema_mode:
        raise RuntimeError('Legacy schema conversion changed the original file mode')
    retained = dict(expected)
    retained[private_path] = after
    assert_hashes(site, retained, 'Workspace activation changed preserved bytes outside its exact canonical conversion')
    return {'path':private_path,'before_sha256':before,'after_sha256':after,
            'original_bytes_retained':len(original),'mode':original_schema_mode,
            'receipt_manifest_sha256':digest(site / '_studio/data/workspace-migration/manifest.json')}


def assert_legacy_pages(response, site):
    """REST uses a data envelope; prove retained access and exact draft identities."""
    data = response.get('data') if isinstance(response, dict) else None
    if not isinstance(data, dict) or 'error' in response or data.get('provider_calls') != 0:
        raise RuntimeError('Old REST credential did not return the governed pages envelope')
    pages = data.get('pages')
    expected = {'index.php', 'about.php', 'services/repairs.php'}
    if not isinstance(pages, list) or len(pages) != len(expected) or data.get('total') != len(expected):
        raise RuntimeError('Old REST credential did not retain the complete seeded page inventory')
    if any(not isinstance(page, dict) for page in pages) or {page.get('path') for page in pages} != expected:
        raise RuntimeError('Old REST page identities differ from the retained draft')
    for page in pages:
        if page.get('content_sha256') != digest(site / '_studio/preview' / page['path']):
            raise RuntimeError('Old REST page content hash differs from its retained draft bytes')
    if not isinstance(data.get('draft_version'), str) or not data['draft_version'].startswith('draft:'):
        raise RuntimeError('Old REST pages lack the captured workspace version')
    return data


def command(args, cwd=None, env=None, log=None):
    result = subprocess.run([str(x) for x in args], cwd=cwd, env=env, capture_output=True, text=True)
    if log is not None:
        pathlib.Path(log).write_text(result.stdout + result.stderr)
    if result.returncode:
        raise RuntimeError(f'Command failed ({result.returncode}): {args[0]}\n{result.stdout}\n{result.stderr}')
    return result


def safe_name(name):
    if '\\' in name or '\x00' in name or name.startswith('/'):
        raise RuntimeError('Unsafe archive path')
    parts = pathlib.PurePosixPath(name).parts
    if '..' in parts or any(len(p) > 240 for p in parts):
        raise RuntimeError('Unsafe archive path')
    return parts


def extract_zip(archive, target):
    with zipfile.ZipFile(archive) as z:
        entries = z.infolist()
        if len(entries) > 12000 or sum(x.file_size for x in entries) > 768 * 1024 * 1024:
            raise RuntimeError('ZIP exceeds bounded qualification inventory')
        versions = [x.filename for x in entries if x.filename == 'VERSION' or x.filename.endswith('/VERSION')]
        # VERSION must identify a single root, not a nested vendor file.
        versions = [x for x in versions if len(safe_name(x)) <= 2]
        if len(versions) != 1:
            raise RuntimeError('ZIP needs one package VERSION entry')
        prefix = versions[0][:-7]
        seen = set()
        for item in entries:
            safe_name(item.filename)
            if not item.filename.startswith(prefix):
                raise RuntimeError('ZIP entries escape its package root')
            relative = item.filename[len(prefix):].rstrip('/')
            if not relative:
                continue
            if relative in seen or item.flag_bits & 1:
                raise RuntimeError('Duplicate or encrypted ZIP entry')
            seen.add(relative)
            mode = item.external_attr >> 16
            if stat.S_IFMT(mode) not in (0, stat.S_IFREG, stat.S_IFDIR):
                raise RuntimeError('ZIP links/special files are forbidden')
            dest = target / relative
            if item.is_dir():
                dest.mkdir(parents=True, exist_ok=True)
            else:
                dest.parent.mkdir(parents=True, exist_ok=True)
                with z.open(item) as src, dest.open('wb') as out:
                    shutil.copyfileobj(src, out)
                dest.chmod(0o755 if mode & 0o111 else 0o644)
        return z.read(versions[0]).decode().strip()


def baseline_archive(source, commit, target, archive):
    command(['git', '-C', source, 'archive', '--format=tar', '--output', archive, commit])
    with tarfile.open(archive) as tar:
        for item in tar.getmembers():
            safe_name(item.name)
            if not item.isdir() and not item.isfile():
                raise RuntimeError('Baseline Git archive contains a link/special file')
            dest = target / item.name
            if item.isdir():
                dest.mkdir(parents=True, exist_ok=True)
            else:
                dest.parent.mkdir(parents=True, exist_ok=True)
                with tar.extractfile(item) as src, dest.open('wb') as out:
                    shutil.copyfileobj(src, out)
                dest.chmod(item.mode & 0o777)
    # Apply the 1.32 builder's canonical fresh-install seed, never its working tree.
    shutil.copy2(target / '_studio/data/default-index.php', target / 'index.php')
    for name in ['actions-bar.js', 'actions-bar.css']:
        if (target / '_studio/static' / name).is_file():
            shutil.copy2(target / '_studio/static' / name, target / name)


@contextlib.contextmanager
def server(php, root):
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0)); port = sock.getsockname()[1]
    env = os.environ.copy(); env['VS_DISTRIBUTION_ROOT'] = str(root)
    log = (root / 'server.log').open('w')
    process = subprocess.Popen([php, '-d', 'display_errors=0', '-d', 'error_reporting=32767',
                                '-S', f'127.0.0.1:{port}', '-t', str(root / 'site'),
                                str(HERE / 'distribution-qualification-router.php')],
                               cwd=root, env=env, stdout=log, stderr=log, start_new_session=True)
    base = f'http://127.0.0.1:{port}'
    try:
        for _ in range(100):
            if process.poll() is not None:
                raise RuntimeError('Loopback server exited before readiness')
            try:
                with socket.create_connection(('127.0.0.1', port), 0.1):
                    break
            except OSError:
                time.sleep(0.05)
        else:
            raise RuntimeError('Loopback server did not become ready')
        yield base
    finally:
        if process.poll() is None:
            os.killpg(process.pid, signal.SIGTERM)
        try: process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid, signal.SIGKILL); process.wait()
        log.close()


class Requests:
    def __init__(self, base, root):
        self.base, self.root = base, root
        self.cookies = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cookies))
        self.events = []

    def request(self, path, method='GET', body=None, headers=None, expected=200, parse=True):
        headers = dict(headers or {})
        if body is not None:
            headers.setdefault('Content-Type', 'application/json')
        for cookie in self.cookies:
            if cookie.name == 'vs_session':
                headers.setdefault('X-VS-Token', cookie.value)
        request = urllib.request.Request(self.base + path, data=None if body is None else json.dumps(body).encode(),
                                         headers=headers, method=method)
        try: response = self.opener.open(request, timeout=60)
        except urllib.error.HTTPError as error: response = error
        data = response.read(); status = response.code
        self.events.append({'method': method, 'path': path, 'status': status, 'bytes': len(data)})
        (self.root / 'requests.json').write_text(json.dumps(self.events, indent=2))
        if status != expected:
            raise RuntimeError(f'Unexpected HTTP {status} for {path}; expected {expected}: {data[:300]!r}')
        return json.loads(data) if parse else data


def phase(php, root, name, base):
    result = command([php, '-d', 'display_errors=stderr', HERE / 'distribution-qualification-driver.php', root, name, base],
                     log=root / (name + '.log'))
    if DIAGNOSTIC.search(result.stdout + result.stderr):
        raise RuntimeError(f'PHP diagnostics in {name}; retained at {root}')
    data = json.loads(result.stdout)
    if data['provider_attempts']:
        raise RuntimeError('Provider dispatch attempted')
    (root / (name + '.json')).write_text(json.dumps(data, indent=2))
    return data


def run_one(args, php, mode, candidate_version, baseline_commit):
    root = pathlib.Path(tempfile.mkdtemp(prefix='vs-distribution-')).resolve()
    args.active_root = str(root)
    (root / '.distribution-fixture').write_text('Explicit approved ZIP qualification only')
    (root / '.distribution-mode').write_text(mode)
    site = root / 'site'; site.mkdir()
    package = site if mode == 'fresh' else root / 'upgrade-package'
    package.mkdir(exist_ok=True)
    extract_zip(getattr(args, mode + '_zip'), package)
    env = os.environ.copy(); env['PHP_BIN'] = php
    checked = command(['bash', args.candidate_source / 'scripts/build-dist.sh', '--verify-staging', package, '--mode', mode],
                      cwd=args.candidate_source, env=env, log=root / 'package-gate.log')
    if DIAGNOSTIC.search(checked.stdout + checked.stderr):
        raise RuntimeError('Package gate emitted PHP diagnostics')
    runtime = {path: digest(package / path) for path in args.required[mode]}
    (root / 'runtime-expected.json').write_text(json.dumps(runtime, indent=2))
    if mode == 'upgrade':
        baseline_archive(args.baseline_source, baseline_commit, site, root / 'baseline.tar')
    for private in ['_studio/data/studio.db', '_studio/data/config.json', '_data/actions.db', '_data/submissions.db']:
        if (site / private).exists(): raise RuntimeError('Input archive contains installed private data')
    with server(php, root) as base:
        http = Requests(base, root)
        requirements = http.request('/_studio/api/router.php?_path=/install/check', 'POST', {})
        if not requirements.get('can_proceed'): raise RuntimeError('Installer requirements failed')
        install_input = {'admin_name': 'ZIP qualification owner', 'admin_email': 'zip-owner@example.invalid',
                         'admin_password': 'Disposable-ZIP-owner-2026!', 'site_name': 'ZIP qualification',
                         'mail_config': {'driver': 'none'}}
        if mode == 'fresh':
            install_input['ai_setup_mode'] = 'external'
        else:
            # Real 1.32 predates external mode. Its supported keyless provider
            # configuration is inert; tripwires prohibit any model dispatch.
            install_input.update(ai_provider='openai_compatible', ai_base_url='http://127.0.0.1:9')
        install = http.request('/_studio/api/router.php?_path=/install/complete', 'POST', install_input)
        if not install.get('ok'): raise RuntimeError('Actual installer endpoint did not succeed')
        (root / 'installation.json').write_text(json.dumps(install, indent=2))
        if mode == 'upgrade':
            before = phase(php, root, 'legacy-seed', base)
            preserved = preserved_inventory(site)
            (root / 'preservation-before.json').write_text(json.dumps(preserved, indent=2))
            protected_templates = {path: digest(site / path) for path in runtime if path.startswith('_studio/data/')}
            assert_hashes(package, protected_templates, 'Protected legacy runtime template differs from candidate; explicit upgrade compatibility required')
            (site / 'dist').mkdir(exist_ok=True)
            shutil.copy2(args.upgrade_zip, site / 'dist/qualification-candidate.zip')
            updated = http.request('/_studio/api/router.php?_path=/update/apply-local', 'POST',
                                   {'filename': 'qualification-candidate.zip'})
            (root / 'upgrade.json').write_text(json.dumps(updated, indent=2))
            if not updated.get('ok') or updated.get('data', {}).get('errors') != []:
                raise RuntimeError('Actual 1.32 updater did not succeed with an empty extraction-error list')
            if updated['data'].get('from_version') != '1.32.0' or updated['data'].get('to_version') != candidate_version:
                raise RuntimeError('Actual legacy updater reported an unexpected version transition')
            assert_hashes(site, preserved, 'Legacy updater changed preserved site bytes')
            assert_hashes(site, protected_templates, 'Legacy updater changed a protected runtime template')
            (root / 'preservation-after-update.json').write_text(json.dumps({path:digest(site/path) for path in preserved}, indent=2))
        else:
            http.request('/_studio/mcp.php', 'POST', {}, expected=503)
        assert_hashes(site, runtime, 'Installed runtime differs from the mode-verified ZIP closure')
        (root / 'runtime-installed.json').write_text(json.dumps({path:digest(site/path) for path in runtime}, indent=2))
        original_schema_mode = stat.S_IMODE((site / '_studio/preview/_partials/schema.php').stat().st_mode) if mode == 'upgrade' else None
        activated = phase(php, root, 'activate', base)
        if activated['version'] != candidate_version: raise RuntimeError('Installed version differs from ZIP')
        if mode == 'upgrade':
            source_transform = preserved_after_activation(site, preserved, original_schema_mode)
            (root / 'source-transform-proof.json').write_text(json.dumps(source_transform, indent=2))
            for key in ['config_sha256', 'business_canary_sha256', 'hosting_canary_sha256', 'public_index_sha256']:
                if activated[key] != before[key]: raise RuntimeError('Upgrade changed preserved field: ' + key)
            legacy_token = (root / 'legacy-credential.txt').read_text()
            legacy = http.request('/_studio/api/agent/v1/pages', headers={'Authorization': 'Bearer ' + legacy_token})
            retained_pages = assert_legacy_pages(legacy, site)
            (root / 'legacy-pages.json').write_text(json.dumps(retained_pages, indent=2))
        lifecycle = phase(php, root, 'lifecycle', base)
        http.request('/_studio/preview/index.php', expected=403, parse=False)
        http.request('/_studio/tests/example.php', expected=403, parse=False)
        http.request('/', parse=False)
        http.request('/mcp.php', 'POST', {'jsonrpc':'2.0','id':1,'method':'tools/list','params':{}})
        token = (root / 'mcp-credential.txt').read_text()
        headers = {'Authorization':'Bearer ' + token, 'Accept':'application/json, text/event-stream',
                   'MCP-Protocol-Version':'2025-11-25'}
        request = {'jsonrpc':'2.0','id':1,'method':'tools/list','params':{}}
        catalog = http.request('/_studio/mcp.php', 'POST', request, headers)
        if not catalog.get('result', {}).get('tools'): raise RuntimeError('ZIP MCP catalog is empty')
        read = http.request('/_studio/mcp.php', 'POST', {'jsonrpc':'2.0','id':2,'method':'tools/call',
                            'params':{'name':'voxelsite_files_read','arguments':{'path':'index.php'}}}, headers)
        if read.get('result', {}).get('isError'): raise RuntimeError('ZIP MCP file read failed')
        phase(php, root, 'revoke', base)
        http.request('/_studio/mcp.php', 'POST', request, headers, expected=401)
        final = phase(php, root, 'inspect', base)
    diagnostics = DIAGNOSTIC.findall((root / 'server.log').read_text())
    events = [json.loads(line) for line in (root / 'http-events.ndjson').read_text().splitlines()]
    if diagnostics or any(event['provider_attempts'] for event in events):
        raise RuntimeError(f'HTTP diagnostics/provider attempts retained under {root}')
    return {'root':str(root),'mode':mode,'php':lifecycle['php'],'version':candidate_version,
            'installed_runtime_files_verified':len(runtime),
            'preserved_files_verified':len(preserved) if mode == 'upgrade' else None,
            'canonical_draft_source_transform':source_transform if mode == 'upgrade' else None,
            'protected_templates_verified':protected_templates if mode == 'upgrade' else None,
            'checks':lifecycle['checks'],'final':final,'http_events':len(events)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--fresh-zip', required=True, type=pathlib.Path)
    parser.add_argument('--upgrade-zip', required=True, type=pathlib.Path)
    parser.add_argument('--candidate-source', required=True, type=pathlib.Path)
    parser.add_argument('--approved-candidate-commit', required=True)
    parser.add_argument('--baseline-source', required=True, type=pathlib.Path)
    parser.add_argument('--php82', required=True)
    parser.add_argument('--php85', required=True)
    parser.add_argument('--output', required=True, type=pathlib.Path)
    args = parser.parse_args()
    args.fresh_zip=args.fresh_zip.resolve(strict=True);args.upgrade_zip=args.upgrade_zip.resolve(strict=True)
    args.candidate_source=args.candidate_source.resolve(strict=True);args.baseline_source=args.baseline_source.resolve(strict=True)
    commit = command(['git','-C',args.candidate_source,'rev-parse','HEAD']).stdout.strip()
    if commit != args.approved_candidate_commit: raise RuntimeError('Candidate HEAD differs from the explicitly approved commit')
    command(['git','-C',args.candidate_source,'diff','--exit-code','HEAD'])
    baseline = command(['git','-C',args.baseline_source,'rev-parse','HEAD']).stdout.strip()
    if command(['git','-C',args.baseline_source,'show',baseline+':VERSION']).stdout.strip() != '1.32.0':
        raise RuntimeError('Baseline Git HEAD must be the real 1.32.0 source')
    artifact_root = pathlib.Path(tempfile.mkdtemp(prefix='vs-distribution-artifacts-')).resolve()
    artifacts = {}
    manifests = {}
    for mode in ['fresh', 'upgrade']:
        path = getattr(args, mode + '_zip'); target = artifact_root / mode; target.mkdir()
        version = extract_zip(path, target); manifests[mode] = inventory(target)
        artifacts[mode] = {'path':str(path), 'sha256':digest(path), 'bytes':path.stat().st_size, 'version':version,
                           'file_count':len(manifests[mode])}
        (artifact_root / (mode + '-manifest.json')).write_text(json.dumps(manifests[mode], indent=2))
    if artifacts['fresh']['version'] != artifacts['upgrade']['version']:
        raise RuntimeError('Fresh and upgrade ZIPs have different versions')
    version = artifacts['fresh']['version']
    if not PRESERVED_ROOT.issubset(manifests['fresh']) or PRESERVED_ROOT.intersection(manifests['upgrade']):
        raise RuntimeError('Fresh/upgrade ZIPs do not have the required preserved-root distinction')
    if {path:sha for path,sha in manifests['fresh'].items() if path not in PRESERVED_ROOT} != manifests['upgrade']:
        raise RuntimeError('Fresh/upgrade ZIPs differ beyond the four deliberately excluded root files')
    if (args.candidate_source / 'VERSION').read_text().strip() != version:
        raise RuntimeError('ZIP version differs from the approved candidate VERSION')
    qualification = json.loads((args.candidate_source / '_studio/mcp-client-qualification.json').read_text())
    if qualification['product_version'] != version:
        raise RuntimeError('Qualification record is not bound to the approved candidate version')
    args.required = {}
    for mode in ['fresh', 'upgrade']:
        args.required[mode] = json.loads(command([args.php82, '-r',
            'require $argv[1]."/scripts/verify-package.php"; echo json_encode(DistributionVerifier::requiredFiles($argv[1], $argv[2]), JSON_THROW_ON_ERROR);',
            args.candidate_source, mode]).stdout)
    tracked = set(command(['git','-C',args.candidate_source,'ls-tree','-r','--name-only',commit]).stdout.splitlines())
    required_hashes = {}
    for path in sorted(set(args.required['fresh']) | set(args.required['upgrade'])):
        origin = {'index.php':'_studio/data/default-index.php', 'actions-bar.js':'_studio/static/actions-bar.js',
                  'actions-bar.css':'_studio/static/actions-bar.css'}.get(path,path)
        if origin not in tracked:
            raise RuntimeError('Package-required source is not in the approved commit: ' + origin)
        committed = subprocess.run(['git','-C',str(args.candidate_source),'show',commit+':'+origin],capture_output=True)
        if committed.returncode or hashlib.sha256(committed.stdout).hexdigest() != digest(args.candidate_source/origin):
            raise RuntimeError('Package-required source differs from approved commit: ' + origin)
        required_hashes[origin] = hashlib.sha256(committed.stdout).hexdigest()
        for mode in ['fresh', 'upgrade']:
            if path in args.required[mode] and manifests[mode].get(path) != required_hashes[origin]:
                raise RuntimeError(mode + ' ZIP required file differs from the approved commit: ' + path)
    ordering = int(command([args.php82,'-r','echo version_compare($argv[1], "1.32.0");',version]).stdout)
    version_transition = legacy_transition(ordering)
    report={'artifacts':artifacts,'artifact_inventory_root':str(artifact_root),
            'candidate_commit':commit,'candidate_version':version,'required_source_hashes':required_hashes,'baseline_commit':baseline,'baseline_version':'1.32.0',
            'legacy_version_transition':version_transition,
            'legacy_version_policy':'The owner-selected candidate must increase from the real 1.32.0 baseline. The product UpdateService downgrade guard is unchanged.',
            'external_harness_hashes':{name:digest(HERE/name) for name in ['distribution-qualification.py',
                'distribution-qualification-driver.php','distribution-qualification-router.php','distribution-provider-trap.php','lifecycle-provider-trap.php']},
            'synthetic_content_hashes':inventory(HERE.parent/'fixtures/mcp/site-lifecycle/site'),
            'scope':'ZIP install/upgrade service and loopback HTTP coverage; not client or shared-host qualification',
            'legacy_upgrade_boundary':'The first 1.32 updater writes files in place without an atomic activation or retained journal; this run proves completed upgrade behavior only.',
            'legacy_tests_boundary':'The upgrade artifact excludes tests; old tracked tests may remain. The loopback adapter denies requests, and runtime must not include them.',
            'runs':[]}
    args.output = args.output.resolve()
    temporary = pathlib.Path(tempfile.gettempdir()).resolve()
    if temporary not in args.output.parents or args.output.exists():
        raise RuntimeError('Use a new report path under the canonical system temporary directory')
    args.output.parent.mkdir(parents=True,exist_ok=True)
    try:
        for expected,php in [('8.2.',args.php82),('8.5.',args.php85)]:
            actual=command([php,'-r','echo PHP_VERSION;']).stdout
            if not actual.startswith(expected):raise RuntimeError('Wrong PHP runtime: '+actual)
            for mode in ['fresh','upgrade']:
                report['runs'].append(run_one(args,php,mode,version,baseline))
                args.output.write_text(json.dumps(report,indent=2)+'\n')
        report['status']='passed'
    except Exception as error:
        report['status']='failed';report['error']=str(error);report['failed_root']=getattr(args,'active_root',None);raise
    finally:
        args.output.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'status':report['status'],'report':str(args.output),'artifacts':artifacts}))

if __name__ == '__main__':
    main()
