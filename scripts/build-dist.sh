#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════
#  VoxelSite Build Script
#
#  Produces two distributable archives from the same committed source:
#  - voxelsite-vVERSION.zip for fresh installation
#  - voxelsite-vVERSION-upgrade.zip for existing installations
#    (preserves website homepage, favicon and hosting configuration)
#
#  How it works:
#  - Uses `git archive HEAD`, so only committed files enter the ZIP.
#    Ignored/untracked files and uncommitted changes are not included.
#  - Only committed files end up in the ZIP (no runtime data, no
#    AI-generated pages, no user uploads, no snapshots, etc.)
#  - A small set of dev-only files that ARE tracked in git but should
#    NOT ship are excluded via --worktree-attributes (.gitattributes)
#    or explicit tar --delete
#
#  Usage:
#    ./scripts/build-dist.sh           # Uses version from VERSION file
#    ./scripts/build-dist.sh 1.2.0     # Override version
#    ./scripts/build-dist.sh --verify-staging /path/to/staging --mode fresh
#    ./scripts/build-dist.sh --verify-staging /path/to/staging --mode upgrade
# ═══════════════════════════════════════════════════════

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
PHP_BIN="${PHP_BIN:-php}"

verify_package() {
  "$PHP_BIN" "$ROOT_DIR/scripts/verify-package.php" --mode "${2:-fresh}" "$1"
  "$PHP_BIN" "$ROOT_DIR/_studio/tests/McpParityManifestTest.php" --package-root "$1"
}

# Exercise the exact Step 8 gate without building, committing, or creating a ZIP.
if [[ "${1:-}" == "--verify-staging" ]]; then
  [[ $# -eq 2 || ( $# -eq 4 && "${3:-}" == "--mode" ) ]] || { echo 'Usage: build-dist.sh --verify-staging /path/to/staging [--mode fresh|upgrade]' >&2; exit 1; }
  verify_package "$2" "${4:-fresh}"
  exit
fi

# ── Read version ──
if [[ -n "${1:-}" ]]; then
  VERSION="$1"
  echo "📌 Package version set to $VERSION"
else
  VERSION="$(cat "$ROOT_DIR/VERSION" 2>/dev/null || echo '1.0.0')"
fi

# Trim whitespace/newlines from version
VERSION="$(echo "$VERSION" | tr -d '[:space:]')"
[[ "$VERSION" =~ ^[0-9]{1,4}(\.[0-9]{1,4}){2,4}(-[A-Za-z0-9.-]{1,40})?$ ]] || { echo 'Invalid package version.' >&2; exit 1; }

SLUG="voxelsite-v${VERSION}"
PKG_DIR="$DIST_DIR/$SLUG"
ZIP_FILE="$DIST_DIR/$SLUG.zip"
UPGRADE_SLUG="${SLUG}-upgrade"
UPGRADE_DIR="$DIST_DIR/$UPGRADE_SLUG"
UPGRADE_ZIP="$DIST_DIR/$UPGRADE_SLUG.zip"

echo ""
echo "══════════════════════════════════════════"
echo "  VoxelSite Build — v${VERSION}"
echo "══════════════════════════════════════════"
echo ""

# ── Step 1: Clean previous build ──
echo "🧹 Cleaning previous build..."
rm -rf "$PKG_DIR" "$UPGRADE_DIR"
rm -f "$ZIP_FILE" "$UPGRADE_ZIP"
mkdir -p "$DIST_DIR"

# ── Step 2: Build Studio CSS + JS ──
echo "🎨 Building Studio assets (CSS + JS)..."
(cd "$ROOT_DIR" && npm run build)

# ── Step 3: Copy Lucide icons ──
echo "🖼️  Copying Lucide icons..."
(cd "$ROOT_DIR" && npm run icons)

# ── Step 4: Copy Monaco editor ──
echo "📝 Vendoring Monaco editor..."
(cd "$ROOT_DIR" && npm run vendor:monaco)

# ── Step 5: Export git-tracked files ──
# git archive exports the committed HEAD tree, not the working tree or index.
# This means no runtime data, no AI-generated pages, no user uploads,
# no snapshots, no databases — only clean framework files.
echo "📦 Exporting tracked files..."
mkdir -p "$PKG_DIR"
git -C "$ROOT_DIR" archive HEAD | tar -x -C "$PKG_DIR"

# Stamp the current version (git archive uses the committed version,
# but VERSION may have been bumped in the working tree and not yet committed)
echo "$VERSION" > "$PKG_DIR/VERSION"

# Safety fallback: ensure the default index.php placeholder exists.
# index.php is tracked in git, so git archive already includes it.
# This cp overwrites it with the canonical default to guarantee fresh
# installs always show the branded placeholder instead of a 403.
cp "$ROOT_DIR/_studio/data/default-index.php" "$PKG_DIR/index.php"
echo "   📄 Added index.php placeholder"

# ── Step 6: Remove internal dev files that shouldn't ship ──
# Source files (src/, app.js, etc.) and package.json ARE kept so buyers can modify and rebuild
echo "🧹 Removing internal dev files..."
rm -rf "$PKG_DIR/scripts"              # Build scripts
rm -rf "$PKG_DIR/.gitignore"           # Not needed in dist
rm -rf "$PKG_DIR/.gitattributes"       # Not needed in dist
rm -rf "$PKG_DIR/.github"              # GitHub config
rm -rf "$PKG_DIR/.ai"                  # AI docs (internal)
rm -rf "$PKG_DIR/.docs"                # Internal docs
rm -rf "$PKG_DIR/_studio/docs"          # Studio internal docs
rm -rf "$PKG_DIR/_studio/tests"         # Development fixtures and executable test handlers
rm -rf "$PKG_DIR/.agent"               # Agent workflows (internal)
rm -rf "$PKG_DIR/.agents"              # Local skills (internal)
rm -rf "$PKG_DIR/.gemini"              # Gemini config
rm -rf "$PKG_DIR/docs"                 # Internal documentation
rm -f  "$PKG_DIR/CLAUDE.md"            # Claude instructions
rm -f  "$PKG_DIR/package-lock.json"    # npm lockfile (regenerated by npm install)

# ── Step 7: Ensure .gitkeep files exist in empty dirs ──
# These directories must exist for the app to function but start empty
echo "📁 Ensuring directory structure..."
for dir in \
  "_studio/preview" \
  "_studio/revisions" \
  "_studio/snapshots" \
  "_studio/backups" \
  "_studio/logs" \
  "assets/images" \
  "assets/files" \
  "assets/fonts" \
  "assets/css" \
  "assets/js" \
  "assets/data" \
  "assets/forms" \
  "_data"; do
  mkdir -p "$PKG_DIR/$dir"
  touch "$PKG_DIR/$dir/.gitkeep"
done

# ── Step 8: Verify critical files ──
echo "✅ Verifying package..."
verify_package "$PKG_DIR"

# Count files for sanity check
FILE_COUNT=$(find "$PKG_DIR" -type f | wc -l | tr -d ' ')
ICON_COUNT=$(find "$PKG_DIR/assets/icons" -name "*.svg" | wc -l | tr -d ' ')
echo "   📄 ${FILE_COUNT} files total"
echo "   🎨 ${ICON_COUNT} Lucide icons"

# ── Step 9: Verify NO user data leaked into the package ──
LEAKED=()
[[ ! -f "$PKG_DIR/_studio/data/studio.db" ]]       || LEAKED+=("_studio/data/studio.db")
[[ ! -f "$PKG_DIR/_studio/data/config.json" ]]     || LEAKED+=("_studio/data/config.json")
[[ ! -d "$PKG_DIR/_partials" ]]                    || LEAKED+=("_partials/")
[[ ! -f "$PKG_DIR/llms.txt" ]]                     || LEAKED+=("llms.txt")
[[ ! -f "$PKG_DIR/robots.txt" ]]                   || LEAKED+=("robots.txt")
# Check no AI-generated page dirs (anything in root that's not a known dir)
for d in "$PKG_DIR"/*/; do
  dirname="$(basename "$d")"
  case "$dirname" in
    _studio|_data|assets|vendor|i18n) ;; # known framework dirs
    *) LEAKED+=("$dirname/ (AI-generated page directory)") ;;
  esac
done

if [[ ${#LEAKED[@]} -gt 0 ]]; then
  echo "❌ ERROR: User/runtime data found in package:"
  printf "   - %s\n" "${LEAKED[@]}"
  echo "   These files should not be in the distributable."
  exit 1
fi

# ── Step 10: Derive the legacy-compatible upgrade archive ──
# 1.32's already-loaded updater only protects directory prefixes. Omitting
# these four root destinations preserves existing live/hosting bytes without
# installing a partial bridge or changing the old updater in memory.
cp -a "$PKG_DIR" "$UPGRADE_DIR"
for file in index.php favicon.ico .htaccess LocalValetDriver.php; do
  rm -f "$UPGRADE_DIR/$file"
done
verify_package "$UPGRADE_DIR" upgrade

echo "🗜️  Creating fresh-install and upgrade zip archives..."
(
  cd "$DIST_DIR"
  zip -rq "$ZIP_FILE" "$SLUG/" -x "*.DS_Store" "*__MACOSX*"
  zip -rq "$UPGRADE_ZIP" "$UPGRADE_SLUG/" -x "*.DS_Store" "*__MACOSX*"
)

# ── Step 11: Cleanup staging directory ──
rm -rf "$PKG_DIR" "$UPGRADE_DIR"

# ── Done ──
ZIP_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
UPGRADE_SIZE=$(du -h "$UPGRADE_ZIP" | cut -f1)
echo ""
echo "══════════════════════════════════════════"
echo "  ✅ Build complete!"
echo ""
echo "  📦 Fresh install: $ZIP_FILE ($ZIP_SIZE)"
echo "  📦 Existing site upgrade: $UPGRADE_ZIP ($UPGRADE_SIZE)"
echo "  🏷️  Version: $VERSION"
echo ""
echo "  Use only the -upgrade.zip for an existing installation."
echo "  The fresh-install ZIP includes a replacement homepage and hosting defaults."
echo "══════════════════════════════════════════"
echo ""
