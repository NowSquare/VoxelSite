<?php
declare(strict_types=1);

/** Developer-only staging verification. Does not load the application or an installation database. */
final class DistributionVerifier
{
    public const PRESERVED_ROOT_FILES = ['index.php', 'favicon.ico', '.htaccess', 'LocalValetDriver.php'];

    public static function requiredFiles(string $source, string $mode = 'fresh'): array
    {
        if (!in_array($mode, ['fresh', 'upgrade'], true)) throw new RuntimeException('Unknown package mode: ' . $mode);
        $files = ['VERSION', 'submit.php', 'actions-bar.js', 'actions-bar.css', 'composer.json', 'composer.lock', 'vendor/autoload.php',
            '_studio/api/router.php', '_studio/ui/dist/studio.css', '_studio/ui/dist/studio.js',
            'assets/icons/phone.svg', '_studio/.htaccess', '_studio/mcp.php', '_studio/workspace.php',
            '_studio/update-gate.php', '_studio/update-runtime.php', '_studio/factory-reset.php',
            '_studio/factory-reset-gate.php', '_studio/static/update-runtime-core.php',
            '_studio/static/factory-reset-runtime.php', '_studio/static/mcp-standalone.php',
            '_studio/agent-capabilities.json', '_studio/mcp-client-qualification.json',
            '_studio/engine/migrations/039_connection_telemetry.php',
            '_studio/data/demo-root-actions-bar.php', '_studio/data/default-index.php',
            '_studio/data/default-unpublish-index.php'];
        if ($mode === 'fresh') $files = array_merge($files, self::PRESERVED_ROOT_FILES);
        // Include new, not-yet-committed runtime classes too: git archive HEAD
        // must never appear complete merely because its entrypoints were present.
        foreach (['_studio/engine', '_studio/api', '_studio/ui', '_studio/static', '_studio/worker',
            '_studio/prompts', '_studio/action-templates', 'assets/icons', 'assets/library', 'vendor'] as $directory) {
            $path = $source . '/' . $directory;
            if (!is_dir($path)) throw new RuntimeException('Missing package source directory: ' . $directory);
            foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS)) as $item) {
                if ($item->isLink()) throw new RuntimeException('Package source contains a symlink: ' . $item->getPathname());
                if (!$item->isFile() || $item->getFilename() === '.DS_Store') continue;
                $relative = substr($item->getPathname(), strlen($source) + 1);
                // Composer licenses/docs need not be in the tracked runtime. Its
                // PHP closure and installed metadata must be complete.
                if ($directory === 'vendor' && !str_ends_with($relative, '.php') && $relative !== 'vendor/composer/installed.json') continue;
                $files[] = $relative;
            }
        }
        foreach (glob($source . '/_studio/*.php') ?: [] as $path) $files[] = substr($path, strlen($source) + 1);
        $files = array_values(array_unique($files)); sort($files, SORT_STRING); return $files;
    }

    public static function inspect(string $package, string $source, string $mode = 'fresh'): array
    {
        $package = realpath($package) ?: throw new RuntimeException('Package staging directory is unavailable.');
        $source = realpath($source) ?: throw new RuntimeException('Package source directory is unavailable.');
        if ($package === $source || !is_dir($package)) throw new RuntimeException('Verify a separate package staging directory.');
        $errors = []; $files = self::requiredFiles($source, $mode);
        // The loaded 1.32 updater overwrites root files without a site-content
        // allowlist. Absence is the compatibility guarantee for that updater.
        if ($mode === 'upgrade') foreach (self::PRESERVED_ROOT_FILES as $path) {
            if (file_exists($package . '/' . $path) || is_link($package . '/' . $path)) $errors[] = 'Upgrade package must preserve installed root file: ' . $path;
        }
        foreach ($files as $path) {
            $target = $package . '/' . $path;
            if (!is_file($target) || is_link($target)) { $errors[] = 'Missing critical file: ' . $path; continue; }
            $expected = $source . '/' . match ($path) {
                'index.php' => '_studio/data/default-index.php',
                'actions-bar.js', 'actions-bar.css' => '_studio/static/' . $path,
                default => $path,
            };
            if ($path !== 'VERSION' && (!is_file($expected) || hash_file('sha256', $target) !== hash_file('sha256', $expected))) {
                $errors[] = 'Package differs from reviewed source: ' . $path . ' (commit the intended runtime and build output before archiving)';
            }
        }
        foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($package, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::SELF_FIRST) as $item) {
            if ($item->isLink()) $errors[] = 'Package contains a symlink: ' . substr($item->getPathname(), strlen($package) + 1);
        }
        $migrations = static function (string $root): array { $names = array_map('basename', glob($root . '/_studio/engine/migrations/*.php') ?: []); sort($names, SORT_STRING); return $names; };
        $expectedMigrations = $migrations($source); $actualMigrations = $migrations($package);
        if (count($expectedMigrations) < 39 || $actualMigrations !== $expectedMigrations) $errors[] = 'Migration inventory must exactly match the reviewed source through migration 039.';
        foreach ($expectedMigrations as $offset => $name) if (!str_starts_with($name, sprintf('%03d_', $offset + 1))) $errors[] = 'Migration sequence is incomplete: ' . $name;
        foreach (['_studio/tests', 'docs', '.ai', '.agent', '.agents', 'scripts', 'node_modules', '.git',
            '_studio/data/studio.db', '_studio/data/config.json', '_data/studio.db', '_data/actions.db', '_data/submissions.db'] as $path) {
            if (file_exists($package . '/' . $path) || is_link($package . '/' . $path)) $errors[] = 'Development or private installation data must not ship: ' . $path;
        }
        // An old installation may retain tests even though this ZIP excludes
        // them. Pin the unconditional Apache denial before any serving rule;
        // byte parity alone would also accept an unsafe committed .htaccess.
        $rules = is_file($package . '/_studio/.htaccess') ? file_get_contents($package . '/_studio/.htaccess') : '';
        $lines = array_values(array_filter(array_map(static fn(string $line): string => preg_replace('/[ \t]+/', ' ', trim($line)), preg_split('/\R/', $rules)),
            static fn(string $line): bool => $line !== '' && !str_starts_with($line, '#')));
        $denial = array_search('RewriteRule ^tests(?:/|$) - [F,L]', $lines, true);
        $engine = array_search('RewriteEngine On', $lines, true);
        $safeDenial = $denial !== false && $engine !== false && $engine < $denial
            && ($denial === 0 || !str_starts_with($lines[$denial - 1], 'RewriteCond '));
        if ($safeDenial) foreach (array_slice($lines, 0, $denial) as $line) {
            if (str_starts_with($line, 'RewriteRule ') && !preg_match('/\[[^\]]*\bF\b[^\]]*\]$/', $line)) $safeDenial = false;
        }
        if (!$safeDenial) $errors[] = 'Retained development tests must be denied before Studio routing: _studio/.htaccess';
        $manifestPath = $package . '/_studio/agent-capabilities.json';
        if (is_file($manifestPath)) {
            try {
                $manifest = json_decode(file_get_contents($manifestPath), true, 512, JSON_THROW_ON_ERROR);
                if (($manifest['evidence_policy']['scope'] ?? null) !== 'development_only' || ($manifest['evidence_policy']['shipped'] ?? null) !== false) $errors[] = 'The shipped capability manifest must label evidence references as development-only.';
            } catch (JsonException) { $errors[] = 'The shipped capability manifest is invalid JSON.'; }
        }
        return ['mode' => $mode, 'required_files' => count($files), 'migrations' => count($actualMigrations), 'errors' => $errors];
    }
}

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    try {
        $mode = 'fresh'; $package = $argv[1] ?? '';
        if ($argc === 4 && $argv[1] === '--mode') { $mode = $argv[2]; $package = $argv[3]; }
        elseif ($argc !== 2) throw new RuntimeException('Usage: php scripts/verify-package.php [--mode fresh|upgrade] /absolute/staging/root');
        $result = DistributionVerifier::inspect($package, dirname(__DIR__), $mode);
        foreach ($result['errors'] as $error) fwrite(STDERR, 'FAIL ' . $error . "\n");
        echo ucfirst($mode) . ' package: ' . $result['required_files'] . ' required runtime files; ' . $result['migrations'] . " migrations.\n";
        echo "Staging verification only; this does not qualify a ZIP install or MCP client.\n";
        exit($result['errors'] === [] ? 0 : 1);
    } catch (Throwable $error) { fwrite(STDERR, 'FAIL ' . $error->getMessage() . "\n"); exit(1); }
}
