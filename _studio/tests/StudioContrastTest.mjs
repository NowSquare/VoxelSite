import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = (await readFile(new URL('../ui/src/studio.src.css', import.meta.url), 'utf8'))
  .replace(/@(import|source)[^;]*;/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(match => ({
  selectors: match[1].trim().split(',').map(selector => selector.trim()),
  declarations: Object.fromEntries(match[2].split(';').flatMap(declaration => {
    const separator = declaration.indexOf(':');
    return separator < 0 ? [] : [[declaration.slice(0, separator).trim(), declaration.slice(separator + 1).trim()]];
  })),
}));
const declarations = selector => Object.assign({}, ...rules.filter(rule => rule.selectors.includes(selector)).map(rule => rule.declarations));
const variables = dark => ({ ...declarations('@theme'), ...declarations(':root'), ...(dark ? declarations('[data-theme="dark"]') : {}) });
function resolve(value, vars) {
  assert.equal(typeof value, 'string', 'The semantic CSS value must exist');
  for (let count = 0; value.includes('var(') && count < 12; count++) {
    value = value.replace(/var\((--[\w-]+)(?:,\s*([^()]+))?\)/g, (_, name, fallback) => {
      assert.ok(vars[name] || fallback, `Missing CSS variable ${name}`);
      return vars[name] || fallback;
    });
  }
  assert.ok(!value.includes('var('), `Unresolved CSS variable in ${value}`);
  return value;
}
function luminance(color) {
  assert.match(color, /^#[\da-f]{3}(?:[\da-f]{3})?$/i, 'Contrast assertions use the resolved solid sRGB colors');
  let hex = color.slice(1); if (hex.length === 3) hex = [...hex].map(char => char + char).join('');
  const channels = [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(foreground, background) {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}
function button(dark, state, publish = false) {
  return Object.assign({}, declarations('.vs-btn-primary'),
    state === 'hover' ? declarations('.vs-btn-primary:hover') : {},
    dark ? declarations('[data-theme="dark"] .vs-btn-primary') : {},
    dark && state === 'hover' ? declarations('[data-theme="dark"] .vs-btn-primary:hover') : {},
    state === 'focus' ? declarations('.vs-btn-primary:focus-visible') : {},
    publish && state === 'hover' ? declarations('.vs-publish-split .vs-btn-primary.vs-publish-chevron:hover') : {});
}
for (const dark of [false, true]) {
  const theme = dark ? 'dark' : 'light';
  for (const state of ['rest', 'hover', 'focus']) {
    test(`${theme} primary ${state}: actual CSS text/fill meets normal-text AA`, () => {
      const vars = variables(dark); const style = button(dark, state);
      const foreground = resolve(style.color, vars); const background = resolve(style.background, vars);
      assert.ok(contrast(foreground, background) >= 4.5, `${foreground} on ${background} has contrast ${contrast(foreground, background)}; needs4.5`);
    });
  }
  test(`${theme} publish split hover keeps the primary action fill`, () => {
    const vars = variables(dark); const style = button(dark, 'hover', true);
    assert.equal(resolve(style.background, vars), resolve(button(dark, 'rest').background, vars));
    assert.ok(contrast(resolve(style.color, vars), resolve(style.background, vars)) >= 4.5);
  });
  test(`${theme} action-fill token is independent of the unchanged brand/focus accent`, () => {
    const vars = variables(dark);
    assert.equal(resolve('var(--vs-action-fill)', vars).toUpperCase(), '#C2410C');
    assert.equal(resolve('var(--border-focus)', vars).toUpperCase(), '#EA580C');
    assert.equal(resolve('var(--vs-accent)', vars).toUpperCase(), '#EA580C');
    assert.equal(resolve('var(--color-vs-accent)', vars).toUpperCase(), '#EA580C');
  });
}
const connection = await readFile(new URL('../ui/src/views/settings-mcp.js', import.meta.url), 'utf8');
const settings = await readFile(new URL('../ui/src/views/settings.js', import.meta.url), 'utf8');
const links = [
  ['Official setup guide', connection.match(/<a\b[^>]*id="mcp-setup-docs"[^>]*>/)?.[0]],
  ['Finish private draft setup', connection.match(/<a\b[^>]*>Finish private draft setup<\/a>/)?.[0]],
  ['Provider help', settings.match(/<a\b[^>]*href="\$\{f.help_url\}"[^>]*>/)?.[0]],
];
for (const [name, tag] of links) {
  test(`${name}: actual markup has a persistent underline and contrast-safe theme text`, () => {
    assert.ok(tag, 'The reviewed link must still exist');
    const classes = tag.match(/class="([^"]*)"/)[1].split(/\s+/);
    assert.ok(classes.includes('underline'), 'The link is distinguishable before hover');
    assert.ok(classes.includes('text-vs-text-secondary'));
    assert.ok(!classes.includes('text-vs-accent'));
    for (const dark of [false, true]) {
      const vars = variables(dark); const foreground = resolve('var(--color-vs-text-secondary)', vars);
      for (const surface of ['--vs-bg-base', '--vs-bg-surface', '--vs-bg-raised', '--vs-bg-hover']) {
        const background = resolve(`var(${surface})`, vars);
        assert.ok(contrast(foreground, background) >= 4.5, `${name}: ${foreground} on ${background} must meet AA`);
      }
    }
  });
}

const app = await readFile(new URL('../ui/app.js', import.meta.url), 'utf8');
const morePublish = app.match(/<button\b[^>]*id="btn-mobile-publish"[^>]*>/)?.[0];
for (const dark of [false, true]) {
  const theme = dark ? 'dark' : 'light';
  const vars = variables(dark);
  const navigation = [
    ['Notes Back', declarations('.vs-note-mobile-back').color, [declarations('.vs-notes-mobile-detail').background]],
    ['active mobile navigation', declarations('.vs-mobile-nav-item-active').color, [declarations('.vs-mobile-nav').background]],
    ['More Publish', morePublish?.match(/color:\s*([^;]+)/)?.[1], [declarations('.vs-mobile-more-content').background, declarations('.vs-mobile-more-item:hover').background]],
  ];
  for (const [name, color, backgrounds] of navigation) {
    test(`${theme} ${name}: actual label color meets normal-text AA on its surfaces`, () => {
      const foreground = resolve(color, vars);
      for (const value of backgrounds) {
        const background = resolve(value, vars);
        assert.ok(contrast(foreground, background) >= 4.5, `${name}: ${foreground} on ${background} has contrast ${contrast(foreground, background)}`);
      }
      assert.equal(resolve(declarations('.vs-mobile-nav-item-active::before').background, vars).toUpperCase(), '#EA580C', 'The separate active-state indicator keeps the existing general accent');
    });
  }
}
