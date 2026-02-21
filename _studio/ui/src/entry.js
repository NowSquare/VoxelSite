/**
 * VoxelSite Studio — Bundle Entry Point
 *
 * This is the esbuild entry point. It imports the main app module
 * (which in turn imports state, router, api, theme, visual-editor)
 * so that esbuild can bundle everything into a single minified file.
 *
 * The output is _studio/ui/dist/studio.js — a single file that replaces
 * the import map + multiple module requests in production.
 *
 * During development, esbuild runs in watch mode for instant rebuilds.
 */

// Core application — app.js imports state.js, router.js, api.js,
// theme.js, and visual-editor.js, so everything gets pulled in.
import '../app.js';
