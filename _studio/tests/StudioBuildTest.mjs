import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { Scanner } from '@tailwindcss/oxide';
import { compile } from '@tailwindcss/node';
import { transform } from 'lightningcss';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function classSelectors(css) {
  const classes = new Set();
  function visit(value) {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === 'object') {
      if (value.type === 'class') classes.add(value.name);
      Object.values(value).forEach(visit);
    }
  }
  transform({ code: Buffer.from(css), visitor: { Selector(selector) { visit(selector); } } });
  return classes;
}

test('Shipped Studio CSS covers every generated utility found in the source modules', async () => {
  const base = path.join(repository, '_studio/ui/src');
  const scanner = new Scanner({ sources: [{ base, pattern: '**/*.js', negated: false }] });
  const compiler = await compile(await readFile(path.join(base, 'studio.src.css'), 'utf8'), { base, onDependency() {} });
  const expected = classSelectors(compiler.build(scanner.scan()));
  const actual = classSelectors(await readFile(path.join(repository, '_studio/ui/dist/studio.css'), 'utf8'));
  const missing = [...expected].filter(name => !actual.has(name)).sort();
  assert.deepEqual(missing, [], `Source classes missing from shipped CSS: ${missing.join(', ')}`);
  for (const name of ['max-h-64', 'max-h-48', 'my-3']) assert.ok(actual.has(name), `${name} bounds review and recovery lists`);
});

test('Every Studio font URL resolves from its shipped stylesheet location', async () => {
  for (const entry of ['index.php', 'install.php', 'workspace.php']) {
    const html = await readFile(path.join(repository, '_studio', entry), 'utf8');
    assert.ok(html.includes('ui/fonts/inter/inter.css'), `${entry} must load the self-hosted font stylesheet`);
  }
  for (const relative of ['fonts/inter/inter.css', 'dist/studio.css']) {
    const stylesheet = path.join(repository, '_studio/ui', relative);
    const css = await readFile(stylesheet, 'utf8');
    const fonts = [...css.matchAll(/url\(\s*['"]?([^'"\s)]+\.woff2(?:\?[^'"\s)]*)?)['"]?\s*\)/g)];
    if (relative.startsWith('fonts/')) assert.ok(fonts.length, 'The font stylesheet declares a font');
    for (const [, source] of fonts) {
      const resolved = new URL(source, pathToFileURL(stylesheet));
      assert.equal(resolved.protocol, 'file:', 'Studio fonts must be self-hosted');
      const bytes = await readFile(resolved);
      assert.equal(bytes.subarray(0, 4).toString(), 'wOF2', `${relative}: ${source} must resolve to a shipped WOFF2 font`);
    }
  }
});

test('Production build matches shipped bytes and ignores generated pages, tests and prior bundles', { timeout: 120000 }, async () => {
  assert.ok(Number(process.versions.node.split('.')[0]) >= 22, 'Run the Studio build verification with Node 22 or later');
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'vs-studio-build-')));
  try {
    for (const file of ['package.json', 'package-lock.json', 'esbuild.config.js']) {
      await cp(path.join(repository, file), path.join(root, file));
    }
    await cp(path.join(repository, 'node_modules'), path.join(root, 'node_modules'), { recursive: true });
    await cp(path.join(repository, '_studio/ui'), path.join(root, '_studio/ui'), {
      recursive: true, filter: source => !source.startsWith(path.join(repository, '_studio/ui/lib')),
    });
    for (const file of await readdir(path.join(repository, '_studio'))) {
      if (file.endsWith('.php')) await cp(path.join(repository, '_studio', file), path.join(root, '_studio', file));
    }
    function build() {
      const result = spawnSync('npm', ['run', 'build'], {
        cwd: root, encoding: 'utf8', timeout: 60000,
        env: { ...process.env, PATH: `${path.dirname(process.execPath)}${path.delimiter}${process.env.PATH ?? ''}`,
          npm_config_offline: 'true', npm_config_yes: 'false' },
      });
      assert.equal(result.status, 0, `Production build failed: ${result.error ?? ''}\n${result.stdout}\n${result.stderr}`);
    }
    build();
    const outputs = ['studio.css', 'studio.js'];
    const first = await Promise.all(outputs.map(file => readFile(path.join(root, '_studio/ui/dist', file))));
    await writeFile(path.join(root, 'unrelated-generated-page.html'), '<div class="w-[314159px]">Outside Studio</div>');
    await writeFile(path.join(root, '_studio/ui/dist/studio.js'), 'const obsolete = "w-[271828px]";');
    build();
    for (let index = 0; index < outputs.length; index++) {
      const file = outputs[index];
      const second = await readFile(path.join(root, '_studio/ui/dist', file));
      assert.ok(first[index].equals(second), `${file} must not depend on generated website files or an old bundle`);
      const shipped = await readFile(path.join(repository, '_studio/ui/dist', file));
      assert.ok(second.equals(shipped), `${file} is stale: rebuild Studio before shipping`);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
