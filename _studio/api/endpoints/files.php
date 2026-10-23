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
use VoxelSite\SiteWorkspace;

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
$workspace = new SiteWorkspace($db);
$authoring = new \VoxelSite\Agent\StudioAuthoringService($db,$workspace);
$actor = \VoxelSite\Agent\StudioAuthoringService::actor();

// Prompt overrides have their own authority, versions and operation history.
$promptPath = $method === 'GET' || $method === 'DELETE' ? (string) ($_GET['path'] ?? '') : '';
if ($method === 'PUT' && $path === '/files/content') $promptPath = (string) (getJsonBody()['path'] ?? '');
if (str_starts_with($promptPath, '_prompts/')) {
    try {
        $configuration = new \VoxelSite\StudioConfigurationService($db, new SiteWorkspace($db));
        $actor = new \VoxelSite\Agent\OperationActor('user', (int) ($user['id'] ?? 0), null, [], 'studio_configured', null);
        if ($method === 'GET') jsonResponse(['ok' => true, 'data' => $configuration->promptFile($actor, $promptPath)]);
        else throw new \VoxelSite\Agent\OperationException('invalid_schema', 'Save or reset prompt overrides through the versioned Settings prompt endpoint.');
    } catch (\VoxelSite\Agent\OperationException $error) {
        jsonResponse(['ok' => false, 'error' => ['code' => $error->errorCode, 'message' => $error->getMessage()]], $error->errorCode === 'permission_denied' ? 403 : 409);
    }
    return;
}


try {
    if ($method === 'GET' && $path === '/files') {
        (new \VoxelSite\Agent\ActorPolicy($db))->require($actor,['files:read']);
        $lock=\VoxelSite\SiteMutationLock::acquire($workspace->mutationLockPath(),$db);
        $files=listEditableFiles();
        try {(new \VoxelSite\Agent\ActorPolicy($db))->require($actor,['prompts:read']);}
        catch (\VoxelSite\Agent\OperationException) {$files=array_values(array_filter($files,fn($file)=>!str_starts_with($file['path'],'_prompts/')));}
        jsonResponse(['ok'=>true,'data'=>['files'=>$files,'draft_version'=>'draft:'.$workspace->status()['draft_version']]]);return;
    }
    if ($method === 'GET' && $path === '/files/content') {
        $data=$authoring->read($actor,(string)($_GET['path']??''));
        $data['file']=buildEditableFileMeta($data['path'],$workspace->resolveDraft($data['path']));
        jsonResponse(['ok'=>true,'data'=>$data]);return;
    }
    $action=match(true){$method==='PUT'&&$path==='/files/content'=>'save',
        $method==='POST'&&$path==='/files/create'=>'create',
        $method==='POST'&&$path==='/files/compile-tailwind'=>'compile',
        $method==='DELETE'&&$path==='/files'=>'delete',default=>null};
    if($action!==null){
        $input=getJsonBody();
        if($action==='delete')$input['path']=(string)($_GET['path']??$input['path']??'');
        $data=$authoring->fileChange($actor,$action,$input);
        jsonResponse(['ok'=>true,'data'=>$data],$action==='create'?201:200);return;
    }
    jsonResponse(['ok'=>false,'error'=>['code'=>'not_found','message'=>'Endpoint not found.']],404);
} catch (\VoxelSite\Agent\OperationException $error) {
    jsonResponse(['ok'=>false,'error'=>['code'=>$error->errorCode,'message'=>$error->getMessage(),'details'=>$error->details]],
        match($error->errorCode){'permission_denied'=>403,'not_found'=>404,'invalid_schema','invalid_path','size_limit'=>422,default=>409});
}

function listEditableFiles(): array
{
    $studioRoot = dirname(__DIR__, 2);
    $workspace=new \VoxelSite\SiteWorkspace(Database::getInstance());
    $workspace->assertReady();
    $previewRoot=$workspace->draftRoot();
    $assetsRoot=$workspace->draftAssetsRoot();
    $files = [];

    foreach (\VoxelSite\Agent\WorkspaceFiles::read($workspace) as $relativePath=>$content) {
        if (\VoxelSite\Agent\SitePathPolicy::type($relativePath)==='binary') continue;
        $files[] = buildEditableFileMeta($relativePath,$workspace->resolveDraft($relativePath),str_starts_with($relativePath,'_root/')?'config':null)
            + ['content_sha256'=>hash('sha256',$content)];
    }
    $promptsRoot = $studioRoot . '/prompts';
    $customPromptsRoot = $studioRoot . '/custom_prompts';
    if (is_dir($promptsRoot)) {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($promptsRoot, FilesystemIterator::SKIP_DOTS)
        );
        $promptEntries=0;
        foreach ($iterator as $item) {
            if (++$promptEntries>512) throw new \VoxelSite\Agent\OperationException('size_limit','Prompt inventory exceeds its bounded limit.');
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

    // Preview page PHP files — root or nested (e.g. about.php, work/about.php)
    if (preg_match('#^[A-Za-z0-9._-]+(/[A-Za-z0-9._-]+)*\.php$#', $path) === 1) {
        // Reject paths that look like partials or prompts entering through this gate
        if (!str_starts_with($path, '_')) {
            return $path;
        }
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
    if (!str_starts_with($relativePath,'_prompts/')) {
        $absolute=(new \VoxelSite\SiteWorkspace(Database::getInstance()))->resolveDraft($relativePath);
        return is_file($absolute)?$absolute:null;
    }
    if (str_starts_with($relativePath, '_prompts/')) {
        $relativeTail = substr($relativePath, 9);
        $customPath = $studioRoot . '/custom_prompts/' . $relativeTail;
        if (is_file($customPath)) {
            $absolute = $customPath;
            $allowedRoot = $studioRoot . '/custom_prompts';
        } else {
            $absolute = $studioRoot . '/prompts/' . $relativeTail;
            $allowedRoot = $studioRoot . '/prompts';
        }
    }

    if (!is_file($absolute)) {
        return null;
    }

    return \VoxelSite\SiteWorkspace::resolveWithin($allowedRoot,$relativeTail);
}

/**
 * Check if a normalized editable path is a preview page PHP file
 * (as opposed to a partial, asset, prompt, or config file).
 *
 * Matches: about.php, work/about.php, blog/2025/post.php
 * Rejects: _partials/nav.php, _prompts/foo.md, assets/css/style.css
 */
function isPreviewPagePhp(string $path): bool
{
    if (!str_ends_with($path, '.php')) return false;
    if (str_starts_with($path, '_partials/')) return false;
    if (str_starts_with($path, '_prompts/')) return false;
    if (str_starts_with($path, 'assets/')) return false;
    if (str_starts_with($path, '_root/')) return false;
    return true;
}
