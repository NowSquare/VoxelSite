import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const php = process.env.VOXELSITE_TEST_PHP || 'php';

function runtime(prefix) {
    const base = `${prefix}/_studio/api/router.php?_path=%2Fpreview&path=`;
    const source = execFileSync(php, ['-r', `require ${JSON.stringify(root + '/_studio/engine/InstallationUrl.php')}; require ${JSON.stringify(root + '/_studio/engine/PreviewAssetRouter.php')}; require ${JSON.stringify(root + '/_studio/engine/PreviewRenderer.php')}; echo VoxelSite\\PreviewRenderer::injectHotReload('<body></body>', $argv[1]);`, base], {encoding:'utf8'});
    const listeners = {};
    let style = `${base}assets/css/style.css&v=2#sheet`;
    const location = {origin:'https://site.example.test', search:'?path=services/team.php', href:`https://site.example.test${base}services/team.php`};
    const document = {addEventListener:(name, fn)=>{listeners[name]=fn;}, querySelectorAll:()=>[{
        getAttribute:()=>style, setAttribute:(_, value)=>{style=value;},
    }]};
    const window = {location, parent:{postMessage(){}}, addEventListener:(name, fn)=>{listeners[name]=fn;}};
    vm.runInNewContext(source.match(/<script>([\s\S]*?)<\/script>/)[1], {document, window, URL, URLSearchParams});
    return {base, css:()=>style, refresh:()=>listeners.message({data:'voxelsite:reload-css'}), navigate(href) {
        let prevented = false;
        const oldHref = location.href;
        const link = {getAttribute:()=>href, hasAttribute:()=>false, target:''};
        listeners.click({target:{closest:()=>link}, button:0, preventDefault(){prevented=true;}});
        return {prevented, href:prevented ? location.href : oldHref};
    }};
}

for (const prefix of ['/tenant', '/tenant.v1', '/tenant%2Ev1', '/tenant&review']) {
    test(`${prefix}: dynamic links use the draft source directory and retain ordinary queries`, ()=>{
        const nav = runtime(prefix);
        assert.deepEqual(nav.navigate('../about?lang=nl#team'), {prevented:true, href:nav.base+'about.php&lang=nl#team'});
        assert.deepEqual(nav.navigate(`${prefix}/contact?path=private.php&%76iew=manifest&_path=/settings&lang=nl#form`),
            {prevented:true, href:nav.base+'contact.php&lang=nl#form'});
    });
    test(`${prefix}: existing Studio and other-origin routes are not remapped`, ()=>{
        const nav = runtime(prefix);
        for (const href of [nav.base+'about.php', '/other/_studio/api/router.php?_path=/preview', 'https://other.example/contact']) {
            assert.equal(nav.navigate(href).prevented, false);
        }
    });
    test(`${prefix}: CSS refresh preserves authenticated route and dependency`, ()=>{
        const nav = runtime(prefix);
        nav.refresh();
        const url = new URL(nav.css(), 'https://site.example.test');
        assert.equal(url.pathname, new URL(prefix+'/_studio/api/router.php','https://site.example.test').pathname);
        assert.equal(url.searchParams.get('_path'), '/preview');
        assert.equal(url.searchParams.get('path'), 'assets/css/style.css');
        assert.equal(url.searchParams.get('v'), '2');
        assert.match(url.searchParams.get('t'), /^[0-9]+$/);
        assert.equal(url.hash, '#sheet');
    });
}
