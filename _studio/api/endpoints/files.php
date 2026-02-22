<?php

declare(strict_types=1);

/**
 * File Editor API Endpoints
 *
 * GET /files                — List editable PHP/CSS/JS files
 * GET /files/content?path=  — Read one editable file
 * PUT /files/content        — Save one editable file
 */

use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\RevisionManager;

/**
 * Core system files that must not be deleted.
 * These are essential for site rendering and cannot be recreated by the user.
 */
const PROTECTED_FILES = [
    'index.php',
    '_partials/header.php',
    '_partials/nav.php',
    '_partials/footer.php',
    '_partials/schema.php',
    'assets/css/style.css',
    'assets/css/tailwind.css',
    'assets/js/main.js',
    'assets/js/navigation.js',
    'assets/js/form-handler.js',
    'assets/data/site.json',
    'assets/data/memory.json',
    'assets/data/design-intelligence.json',
];

$method = $_REQUEST['_route_method'];
$path = $_REQUEST['_route_path'];
$user = $_REQUEST['_user'] ?? null;

$db = Database::getInstance();
$fileManager = new FileManager($db);

if ($method === 'GET' && $path === '/files') {
    $fileManager->syncPageRegistry();
    $files = listEditableFiles();

    jsonResponse(['ok' => true, 'data' => [
        'files' => $files,
    ]]);
    return;
}

if ($method === 'GET' && $path === '/files/content') {
    $rawPath = (string) ($_GET['path'] ?? '');
    $editablePath = normalizeEditablePath($rawPath);
    if ($editablePath === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'validation',
            'message' => 'Invalid file path.',
        ]], 422);
        return;
    }

    $absolutePath = resolveEditableAbsolutePath($editablePath);
    if ($absolutePath === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'not_found',
            'message' => 'File not found.',
        ]], 404);
        return;
    }

    // Root config files (_root/*) are read directly, not through FileManager
    if (str_starts_with($editablePath, '_root/')) {
        $content = file_get_contents($absolutePath);
    } else {
        $content = $fileManager->readFile($editablePath);
    }
    if ($content === null || $content === false) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'not_found',
            'message' => 'File not found.',
        ]], 404);
        return;
    }

    jsonResponse(['ok' => true, 'data' => [
        'path' => $editablePath,
        'content' => $content,
        'file' => buildEditableFileMeta($editablePath, $absolutePath),
    ]]);
    return;
}

if ($method === 'PUT' && $path === '/files/content') {
    $body = getJsonBody();
    $editablePath = normalizeEditablePath((string) ($body['path'] ?? ''));
    $content = $body['content'] ?? null;

    if ($editablePath === null || !is_string($content)) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'validation',
            'message' => 'Path and content are required.',
        ]], 422);
        return;
    }

    if ($editablePath === 'assets/css/tailwind.css') {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'forbidden',
            'message' => 'Cannot edit the auto-generated tailwind CSS file.',
        ]], 403);
        return;
    }

    $absolutePath = resolveEditableAbsolutePath($editablePath);
    if ($absolutePath === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'not_found',
            'message' => 'File not found.',
        ]], 404);
        return;
    }

    // Root config files (_root/*) are read directly, not through FileManager
    if (str_starts_with($editablePath, '_root/')) {
        $current = file_get_contents($absolutePath);
    } else {
        $current = $fileManager->readFile($editablePath);
    }
    if ($current === null || $current === false) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'not_found',
            'message' => 'File not found.',
        ]], 404);
        return;
    }

    if ($current === $content) {
        jsonResponse(['ok' => true, 'data' => [
            'path' => $editablePath,
            'changed' => false,
            'revision_id' => null,
            'file' => buildEditableFileMeta($editablePath, $absolutePath),
        ]]);
        return;
    }

    $userId = (int) ($user['id'] ?? 0);
    if ($userId <= 0) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'unauthorized',
            'message' => 'Invalid user session.',
        ]], 401);
        return;
    }

    try {
        $revisionManager = new RevisionManager($db, null, $fileManager);
        $operations = [[
            'path' => $editablePath,
            'action' => 'write',
        ]];

        $revisionId = $revisionManager->createRevision(
            $operations,
            "Edited {$editablePath}",
            $userId,
            null,
            [$editablePath => $current]
        );

        // Root config files are written directly to disk
        if (str_starts_with($editablePath, '_root/')) {
            file_put_contents($absolutePath, $content);
        } else {
            $fileManager->writeFile($editablePath, $content);
        }

        // Keep the page registry in sync when editing top-level page PHP files.
        if (preg_match('/^[A-Za-z0-9._-]+\.php$/', $editablePath) === 1) {
            $fileManager->syncPageRegistry();
        }

        if ($fileManager->pathAffectsTailwind($editablePath)) {
            $fileManager->compileTailwind();
        }

        $revisionManager->captureAfterState($revisionId, $operations);
        $latestAbsolute = resolveEditableAbsolutePath($editablePath);

        jsonResponse(['ok' => true, 'data' => [
            'path' => $editablePath,
            'changed' => true,
            'revision_id' => $revisionId,
            'file' => $latestAbsolute !== null
                ? buildEditableFileMeta($editablePath, $latestAbsolute)
                : null,
        ]]);
        return;
    } catch (\Throwable $e) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'write_failed',
            'message' => 'Could not save file.',
        ]], 500);
        return;
    }
}

if ($method === 'POST' && $path === '/files/create') {
    $body = getJsonBody();
    $editablePath = normalizeEditablePath((string) ($body['path'] ?? ''));

    if ($editablePath === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'validation',
            'message' => 'Invalid file path. Allowed: *.php, _partials/*.php, assets/css/*.css, assets/js/*.js, assets/data/*.json',
        ]], 422);
        return;
    }

    // Resolve the absolute directory where this file would live
    $studioRoot = dirname(__DIR__, 2);
    $projectRoot = dirname(__DIR__, 3);

    if (str_starts_with($editablePath, '_prompts/')) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'forbidden',
            'message' => 'Cannot create new system prompts.',
        ]], 403);
        return;
    }

    if (str_starts_with($editablePath, 'assets/')) {
        $absolutePath = $projectRoot . '/' . $editablePath;
    } else {
        $absolutePath = $studioRoot . '/preview/' . $editablePath;
    }

    // Prevent overwriting existing files
    if (file_exists($absolutePath)) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'already_exists',
            'message' => "File \"{$editablePath}\" already exists.",
        ]], 409);
        return;
    }

    // Create parent directories if needed
    $dir = dirname($absolutePath);
    if (!is_dir($dir)) {
        if (!mkdir($dir, 0755, true)) {
            jsonResponse(['ok' => false, 'error' => [
                'code' => 'write_failed',
                'message' => 'Could not create directory.',
            ]], 500);
            return;
        }
    }

    // Determine initial content
    $ext = pathinfo($editablePath, PATHINFO_EXTENSION);
    $initial = match ($ext) {
        'php' => "<?php\n\n",
        'css' => "/* {$editablePath} */\n",
        'js'  => "// {$editablePath}\n",
        'json' => "{\n}\n",
        default => '',
    };

    if (file_put_contents($absolutePath, $initial) === false) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'write_failed',
            'message' => 'Could not create file.',
        ]], 500);
        return;
    }

    // Sync page registry if it's a top-level PHP file
    if (preg_match('/^[A-Za-z0-9._-]+\.php$/', $editablePath) === 1) {
        $fileManager->syncPageRegistry();
    }

    jsonResponse(['ok' => true, 'data' => [
        'path' => $editablePath,
        'file' => buildEditableFileMeta($editablePath, $absolutePath),
    ]], 201);
    return;
}

// ── Recompile Tailwind CSS from current preview files ──
if ($method === 'POST' && $path === '/files/compile-tailwind') {
    try {
        $result = $fileManager->compileTailwind();
        if (!($result['ok'] ?? false)) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'compile_failed',
                'message' => 'Tailwind compilation failed.',
            ]], 500);
            return;
        }

        // Read the freshly compiled file to return its content
        $twPath = 'assets/css/tailwind.css';
        $absoluteTw = dirname(__DIR__, 3) . '/' . $twPath;
        // Also try the realpath-resolved location (Forge symlinks)
        if (!is_file($absoluteTw)) {
            $resolvedDir = realpath(dirname($absoluteTw));
            if ($resolvedDir !== false) {
                $absoluteTw = $resolvedDir . '/tailwind.css';
            }
        }
        $content = is_file($absoluteTw) ? file_get_contents($absoluteTw) : '';

        jsonResponse(['ok' => true, 'data' => [
            'path'        => $twPath,
            'content'     => $content,
            'class_count' => $result['class_count'] ?? 0,
        ]]);
        return;
    } catch (\Throwable $e) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'compile_failed',
            'message' => 'Tailwind compilation error: ' . $e->getMessage(),
        ]], 500);
        return;
    }
}

if ($method === 'DELETE' && $path === '/files') {
    $rawPath = (string) ($_GET['path'] ?? '');
    $editablePath = normalizeEditablePath($rawPath);

    if ($editablePath === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'validation',
            'message' => 'Invalid file path.',
        ]], 422);
        return;
    }

    $isPrompt = str_starts_with($editablePath, '_prompts/');
    
    // Allow deleting custom prompt overrides to reset them to original system prompts
    $isCustomPrompt = false;
    $customPath = null;
    if ($isPrompt) {
        $studioRoot = dirname(__DIR__, 2);
        $customPromptsRoot = $studioRoot . '/custom_prompts';
        $relativeTail = substr($editablePath, strlen('_prompts/'));
        $customPath = $customPromptsRoot . '/' . $relativeTail;
        if (is_file($customPath)) {
            $isCustomPrompt = true;
        }
    }

    if (!$isCustomPrompt && (in_array($editablePath, PROTECTED_FILES, true) || $isPrompt)) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'forbidden',
            'message' => 'This is a core system file and cannot be deleted.',
        ]], 403);
        return;
    }

    if ($isCustomPrompt) {
        $absolutePath = $customPath;
    } else {
        $absolutePath = resolveEditableAbsolutePath($editablePath);
    }
    
    if ($absolutePath === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'not_found',
            'message' => 'File not found.',
        ]], 404);
        return;
    }

    $userId = (int) ($_REQUEST['_user']['id'] ?? 0);

    try {
        // Create a revision before deleting
        $revisionManager = new RevisionManager($db, null, $fileManager);
        $current = $fileManager->readFile($editablePath);
        $operations = [['path' => $editablePath, 'action' => 'delete']];

        $revisionId = $revisionManager->createRevision(
            $operations,
            "Deleted {$editablePath}",
            $userId,
            null,
            $current !== null ? [$editablePath => $current] : []
        );

        if (!unlink($absolutePath)) {
            jsonResponse(['ok' => false, 'error' => [
                'code' => 'delete_failed',
                'message' => 'Could not delete file.',
            ]], 500);
            return;
        }

        // Sync page registry if it was a top-level PHP page
        if (preg_match('/^[A-Za-z0-9._-]+\.php$/', $editablePath) === 1) {
            $fileManager->syncPageRegistry();
        }

        jsonResponse(['ok' => true, 'data' => [
            'path' => $editablePath,
            'revision_id' => $revisionId,
        ]]);
        return;
    } catch (\Throwable $e) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'delete_failed',
            'message' => 'Could not delete file.',
        ]], 500);
        return;
    }
}

jsonResponse(['ok' => false, 'error' => [
    'code' => 'not_found',
    'message' => 'Endpoint not found.',
]], 404);

/**
 * @return array<int, array{path: string, group: string, language: string, size: int, modified: string}>
 */
function listEditableFiles(): array
{
    $studioRoot = dirname(__DIR__, 2);
    $projectRoot = dirname(__DIR__, 3);
    $previewRoot = $studioRoot . '/preview';
    $assetsRoot = $projectRoot . '/assets';
    $files = [];

    $pageFiles = glob($previewRoot . '/*.php') ?: [];
    foreach ($pageFiles as $absolutePath) {
        if (!is_file($absolutePath)) {
            continue;
        }
        $relativePath = basename($absolutePath);
        $files[] = buildEditableFileMeta($relativePath, $absolutePath, 'page');
    }

    $partialsRoot = $previewRoot . '/_partials';
    if (is_dir($partialsRoot)) {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($partialsRoot, FilesystemIterator::SKIP_DOTS)
        );
        foreach ($iterator as $item) {
            if (!$item->isFile()) {
                continue;
            }
            if (strtolower($item->getExtension()) !== 'php') {
                continue;
            }
            $absolutePath = $item->getPathname();
            $relativeTail = substr($absolutePath, strlen($partialsRoot) + 1);
            $relativePath = '_partials/' . str_replace('\\', '/', $relativeTail);
            $files[] = buildEditableFileMeta($relativePath, $absolutePath, 'partial');
        }
    }

    $assetCodeDirs = [
        ['dir' => $assetsRoot . '/css',  'prefix' => 'assets/css',  'extension' => 'css',  'group' => 'style'],
        ['dir' => $assetsRoot . '/js',   'prefix' => 'assets/js',   'extension' => 'js',   'group' => 'script'],
        ['dir' => $assetsRoot . '/data', 'prefix' => 'assets/data', 'extension' => 'json', 'group' => 'data'],
    ];

    foreach ($assetCodeDirs as $config) {
        $dir = (string) $config['dir'];
        if (!is_dir($dir)) {
            continue;
        }

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS)
        );
        foreach ($iterator as $item) {
            if (!$item->isFile()) {
                continue;
            }
            if (strtolower($item->getExtension()) !== $config['extension']) {
                continue;
            }

            $absolutePath = $item->getPathname();
            $relativeTail = substr($absolutePath, strlen($dir) + 1);
            $relativePath = $config['prefix'] . '/' . str_replace('\\', '/', $relativeTail);
            $files[] = buildEditableFileMeta($relativePath, $absolutePath, (string) $config['group']);
        }
    }

    $promptsRoot = $studioRoot . '/prompts';
    $customPromptsRoot = $studioRoot . '/custom_prompts';
    if (is_dir($promptsRoot)) {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($promptsRoot, FilesystemIterator::SKIP_DOTS)
        );
        foreach ($iterator as $item) {
            if (!$item->isFile()) {
                continue;
            }
            if (strtolower($item->getExtension()) !== 'md') {
                continue;
            }
            $absolutePath = $item->getPathname();
            $relativeTail = substr($absolutePath, strlen($promptsRoot) + 1);
            $relativePath = '_prompts/' . str_replace('\\', '/', $relativeTail);
            
            $customPath = $customPromptsRoot . '/' . $relativeTail;
            $isCustom = is_file($customPath);
            if ($isCustom) {
                $absolutePath = $customPath;
            }
            
            $meta = buildEditableFileMeta($relativePath, $absolutePath, 'prompt');
            $meta['custom'] = $isCustom;
            $files[] = $meta;
        }
    }

    // Add root config files (robots.txt, llms.txt) — these live in the project root
    // and are auto-generated by AEO but editable by the user.
    $rootConfigFiles = ['robots.txt', 'llms.txt'];
    foreach ($rootConfigFiles as $rootFile) {
        $absolutePath = $projectRoot . '/' . $rootFile;
        if (is_file($absolutePath)) {
            $files[] = buildEditableFileMeta('_root/' . $rootFile, $absolutePath, 'config');
        }
    }

    $groupOrder = [
        'page' => 0,
        'partial' => 1,
        'style' => 2,
        'script' => 3,
        'data' => 4,
        'config' => 5,
    ];

    usort($files, static function (array $a, array $b) use ($groupOrder): int {
        $leftOrder = $groupOrder[$a['group']] ?? 99;
        $rightOrder = $groupOrder[$b['group']] ?? 99;
        if ($leftOrder !== $rightOrder) {
            return $leftOrder <=> $rightOrder;
        }
        return strnatcasecmp($a['path'], $b['path']);
    });

    return $files;
}

/**
 * @return array{path: string, group: string, language: string, size: int, modified: string}
 */
function buildEditableFileMeta(string $relativePath, string $absolutePath, ?string $group = null): array
{
    $language = editableLanguage($relativePath);
    $resolvedGroup = $group ?? editableGroup($relativePath, $language);

    return [
        'path' => $relativePath,
        'group' => $resolvedGroup,
        'language' => $language,
        'size' => (int) filesize($absolutePath),
        'modified' => gmdate('Y-m-d\TH:i:s\Z', (int) filemtime($absolutePath)),
        'protected' => in_array($relativePath, PROTECTED_FILES, true) || str_starts_with($relativePath, '_prompts/'),
        'readonly' => $relativePath === 'assets/css/tailwind.css',
    ];
}

function editableLanguage(string $path): string
{
    $lower = strtolower($path);
    if (str_ends_with($lower, '.php')) {
        return 'php';
    }
    if (str_ends_with($lower, '.css')) {
        return 'css';
    }
    if (str_ends_with($lower, '.json')) {
        return 'json';
    }
    if (str_ends_with($lower, '.md')) {
        return 'markdown';
    }
    if (str_ends_with($lower, '.txt')) {
        return 'plaintext';
    }
    return 'javascript';
}

function editableGroup(string $path, string $language): string
{
    if (str_starts_with($path, '_partials/')) {
        return 'partial';
    }
    if (str_starts_with($path, '_prompts/')) {
        return 'prompt';
    }
    if ($language === 'php') {
        return 'page';
    }
    if ($language === 'json') {
        return 'data';
    }
    return $language === 'css' ? 'style' : 'script';
}

function normalizeEditablePath(string $rawPath): ?string
{
    $path = trim(str_replace('\\', '/', $rawPath));

    if ($path === '' || str_contains($path, "\0")) {
        return null;
    }
    if (str_starts_with($path, '/') || str_contains($path, '../') || str_contains($path, '/./')) {
        return null;
    }
    if (!preg_match('/^[A-Za-z0-9._\/-]+$/', $path)) {
        return null;
    }

    if (preg_match('/^[A-Za-z0-9._-]+\.php$/', $path) === 1) {
        return $path;
    }
    if (preg_match('#^_partials/[A-Za-z0-9._/-]+\.php$#', $path) === 1) {
        return $path;
    }
    if (preg_match('#^assets/[A-Za-z0-9._/-]+\.(css|js|json)$#', $path) === 1) {
        return $path;
    }
    if (preg_match('#^_prompts/[A-Za-z0-9._/-]+\.md$#', $path) === 1) {
        return $path;
    }
    // Root config files: _root/robots.txt, _root/llms.txt
    if (preg_match('#^_root/(robots\.txt|llms\.txt)$#', $path) === 1) {
        return $path;
    }

    return null;
}

function resolveEditableAbsolutePath(string $relativePath): ?string
{
    $studioRoot = dirname(__DIR__, 2);
    $projectRoot = dirname(__DIR__, 3);

    if (str_starts_with($relativePath, '_root/')) {
        // Root config files live directly in the project root
        $filename = substr($relativePath, 6); // strip _root/
        $absolute = $projectRoot . '/' . $filename;
        $allowedRoot = $projectRoot;
    } elseif (str_starts_with($relativePath, 'assets/')) {
        $absolute = $projectRoot . '/' . $relativePath;
        $allowedRoot = $projectRoot . '/assets';
    } elseif (str_starts_with($relativePath, '_prompts/')) {
        $relativeTail = substr($relativePath, 9);
        $customPath = $studioRoot . '/custom_prompts/' . $relativeTail;
        if (is_file($customPath)) {
            $absolute = $customPath;
            $allowedRoot = $studioRoot . '/custom_prompts';
        } else {
            $absolute = $studioRoot . '/prompts/' . $relativeTail;
            $allowedRoot = $studioRoot . '/prompts';
        }
    } else {
        $absolute = $studioRoot . '/preview/' . $relativePath;
        $allowedRoot = $studioRoot . '/preview';
    }

    if (!is_file($absolute)) {
        return null;
    }

    // Security: check containment using both logical and resolved paths
    $normAbsolute = rtrim(str_replace('//', '/', $absolute), '/');
    $normRoot = rtrim(str_replace('//', '/', $allowedRoot), '/');
    if (str_starts_with($normAbsolute, $normRoot . '/')) {
        return $absolute;
    }

    // Fallback: check via realpath
    $resolved = realpath($absolute);
    $resolvedRoot = realpath($allowedRoot);
    if ($resolved !== false && $resolvedRoot !== false && str_starts_with($resolved, $resolvedRoot . '/')) {
        return $resolved;
    }

    return null;
}
