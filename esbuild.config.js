/**
 * VoxelSite Studio — Esbuild Configuration
 *
 * Bundles all Studio JS modules into a single minified file.
 * Compiles in milliseconds (~15ms typical), no runtime dependency.
 *
 * Usage:
 *   node esbuild.config.js           # Production build (minified)
 *   node esbuild.config.js --watch   # Dev watcher (rebuilds on change)
 */

import * as esbuild from 'esbuild';

const isWatch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const config = {
  entryPoints: ['_studio/ui/src/entry.js'],
  bundle: true,
  outfile: '_studio/ui/dist/studio.js',
  format: 'iife',  // Self-executing — no import map needed
  target: ['es2020', 'chrome90', 'firefox90', 'safari15'],
  minify: !isWatch,
  sourcemap: isWatch ? 'inline' : false,
  logLevel: 'info',

  // Monaco is loaded separately via AMD — exclude it from the bundle
  external: [],
};

if (isWatch) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log('⚡ Watching for JS changes...');
} else {
  const result = await esbuild.build(config);
  const bytes = result?.metafile
    ? Object.values(result.metafile.outputs)[0]?.bytes
    : null;
  if (bytes) {
    console.log(`📦 studio.js: ${(bytes / 1024).toFixed(1)} KB`);
  }
}
