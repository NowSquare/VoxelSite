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

    $content = $fileManager->readFile($editablePath);
    if ($content === null) {
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

    $absolutePath = resolveEditableAbsolutePath($editablePath);
    if ($absolutePath === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'not_found',
            'message' => 'File not found.',
        ]], 404);
        return;
    }

    $current = $fileManager->readFile($editablePath);
    if ($current === null) {
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

        $fileManager->writeFile($editablePath, $content);

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

    // Protect critical files
    if (in_array($editablePath, PROTECTED_FILES, true)) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'forbidden',
            'message' => 'This is a core system file and cannot be deleted.',
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

    $groupOrder = [
        'page' => 0,
        'partial' => 1,
        'style' => 2,
        'script' => 3,
        'data' => 4,
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
        'protected' => in_array($relativePath, PROTECTED_FILES, true),
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
    return 'javascript';
}

function editableGroup(string $path, string $language): string
{
    if (str_starts_with($path, '_partials/')) {
        return 'partial';
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

    return null;
}

function resolveEditableAbsolutePath(string $relativePath): ?string
{
    $studioRoot = dirname(__DIR__, 2);
    $projectRoot = dirname(__DIR__, 3);
    $previewRoot = realpath($studioRoot . '/preview');
    $assetsRoot = realpath($projectRoot . '/assets');

    if (str_starts_with($relativePath, 'assets/')) {
        $absolute = $projectRoot . '/' . $relativePath;
        $allowedRoot = $assetsRoot;
    } else {
        $absolute = $studioRoot . '/preview/' . $relativePath;
        $allowedRoot = $previewRoot;
    }

    $resolved = realpath($absolute);
    if ($resolved === false || $allowedRoot === false || !is_file($resolved)) {
        return null;
    }

    if (!str_starts_with($resolved, $allowedRoot)) {
        return null;
    }

    return $resolved;
}
