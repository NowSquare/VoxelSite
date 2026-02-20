<?php

declare(strict_types=1);

/**
 * Collections API Endpoints
 *
 * GET    /collections                      — List collections
 * POST   /collections                      — Create a collection
 * GET    /collections/:slug                — Get collection detail
 * PUT    /collections/:slug                — Update collection metadata/schema
 * DELETE /collections/:slug                — Delete collection
 * GET    /collections/:slug/items          — List collection items
 * POST   /collections/:slug/items          — Create an item
 * PUT    /collections/:slug/items/:itemId  — Update an item
 * DELETE /collections/:slug/items/:itemId  — Delete an item
 *
 * Collection metadata lives in SQLite (`collections` table).
 * Collection schema and items live in JSON files under:
 *   _studio/data/collections/{slug}/schema.json
 *   _studio/data/collections/{slug}/items.json
 */

use VoxelSite\Database;
use VoxelSite\Logger;

$method = $_REQUEST['_route_method'];
$path = $_REQUEST['_route_path'];
$params = $_REQUEST['_route_params'] ?? [];
$db = Database::getInstance();

$collectionsRoot = dirname(__DIR__, 2) . '/data/collections';
if (!is_dir($collectionsRoot)) {
    mkdir($collectionsRoot, 0755, true);
}

// ═══════════════════════════════════════════
//  GET /collections — List collections
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/collections') {
    $rows = $db->query(
        'SELECT id, slug, name, description, schema_version, item_count, index_page_id, created_at, updated_at
         FROM collections
         ORDER BY name ASC'
    );

    jsonResponse(['ok' => true, 'data' => [
        'collections' => $rows,
        'count'       => count($rows),
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /collections — Create
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/collections') {
    $body = getJsonBody();
    $name = trim((string) ($body['name'] ?? ''));
    $slugInput = trim((string) ($body['slug'] ?? ''));
    $description = trim((string) ($body['description'] ?? ''));
    $schema = is_array($body['schema'] ?? null) ? $body['schema'] : [];

    if ($name === '') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Collection name is required.',
        ]], 422);
        return;
    }

    $slug = $slugInput !== '' ? normalizeSlug($slugInput) : normalizeSlug($name);
    if ($slug === '' || !isValidSlug($slug)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Collection slug must contain only lowercase letters, numbers, and hyphens.',
        ]], 422);
        return;
    }

    $exists = $db->queryOne('SELECT id FROM collections WHERE slug = ?', [$slug]);
    if ($exists !== null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'slug_taken',
            'message' => "Collection slug '{$slug}' already exists.",
        ]], 409);
        return;
    }

    $paths = getCollectionPaths($collectionsRoot, $slug);

    if (!is_dir($paths['dir'])) {
        mkdir($paths['dir'], 0755, true);
    }

    if (!saveJson($paths['schema'], $schema)) {
        Logger::error('collections', 'Failed to write schema file', [
            'slug' => $slug,
            'path' => $paths['schema'],
        ]);
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'write_failed',
            'message' => 'Failed to create collection schema file.',
        ]], 500);
        return;
    }

    if (!saveJson($paths['items'], [])) {
        Logger::error('collections', 'Failed to write items file', [
            'slug' => $slug,
            'path' => $paths['items'],
        ]);
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'write_failed',
            'message' => 'Failed to create collection item file.',
        ]], 500);
        return;
    }

    $now = now();
    $id = $db->insert('collections', [
        'slug'           => $slug,
        'name'           => $name,
        'description'    => $description !== '' ? $description : null,
        'schema_version' => 1,
        'item_count'     => 0,
        'index_page_id'  => null,
        'created_at'     => $now,
        'updated_at'     => $now,
    ]);

    Logger::info('collections', 'Collection created', [
        'id'   => $id,
        'slug' => $slug,
        'name' => $name,
    ]);

    jsonResponse(['ok' => true, 'data' => [
        'collection' => [
            'id'             => $id,
            'slug'           => $slug,
            'name'           => $name,
            'description'    => $description !== '' ? $description : null,
            'schema_version' => 1,
            'item_count'     => 0,
            'schema'         => $schema,
            'created_at'     => $now,
            'updated_at'     => $now,
        ],
    ]], 201);
    return;
}

// ═══════════════════════════════════════════
//  GET /collections/:slug — Detail
// ═══════════════════════════════════════════

if ($method === 'GET' && isset($params['slug']) && $path === '/collections/' . $params['slug']) {
    $slug = (string) $params['slug'];
    $collection = $db->queryOne(
        'SELECT id, slug, name, description, schema_version, item_count, index_page_id, created_at, updated_at
         FROM collections
         WHERE slug = ?',
        [$slug]
    );

    if ($collection === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => "Collection '{$slug}' not found.",
        ]], 404);
        return;
    }

    $paths = getCollectionPaths($collectionsRoot, $slug);
    $schema = loadJson($paths['schema'], []);

    jsonResponse(['ok' => true, 'data' => [
        'collection' => array_merge($collection, [
            'schema' => is_array($schema) ? $schema : [],
        ]),
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  PUT /collections/:slug — Update metadata/schema
// ═══════════════════════════════════════════

if ($method === 'PUT' && isset($params['slug']) && $path === '/collections/' . $params['slug']) {
    $slug = (string) $params['slug'];
    $body = getJsonBody();

    $collection = $db->queryOne('SELECT * FROM collections WHERE slug = ?', [$slug]);
    if ($collection === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => "Collection '{$slug}' not found.",
        ]], 404);
        return;
    }

    $updates = [];

    if (array_key_exists('name', $body)) {
        $name = trim((string) $body['name']);
        if ($name === '') {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'validation',
                'message' => 'Collection name cannot be empty.',
            ]], 422);
            return;
        }
        $updates['name'] = $name;
    }

    if (array_key_exists('description', $body)) {
        $description = trim((string) $body['description']);
        $updates['description'] = $description !== '' ? $description : null;
    }

    if (array_key_exists('schema', $body)) {
        if (!is_array($body['schema'])) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'validation',
                'message' => 'Schema must be an array.',
            ]], 422);
            return;
        }

        $paths = getCollectionPaths($collectionsRoot, $slug);
        if (!is_dir($paths['dir'])) {
            mkdir($paths['dir'], 0755, true);
        }

        $oldSchema = loadJson($paths['schema'], []);

        if (!saveJson($paths['schema'], $body['schema'])) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'write_failed',
                'message' => 'Failed to update collection schema file.',
            ]], 500);
            return;
        }

        $updates['schema_version'] = (int) $collection['schema_version'] + 1;
        $schemaChanged = true;
    }

    if (!empty($updates)) {
        $updates['updated_at'] = now();
        $db->update('collections', $updates, 'slug = ?', [$slug]);
    }

    $fresh = $db->queryOne('SELECT * FROM collections WHERE slug = ?', [$slug]);
    $paths = getCollectionPaths($collectionsRoot, $slug);
    $schema = loadJson($paths['schema'], []);

    $suggestedPrompt = null;
    if (!empty($schemaChanged)) {
        $collectionName = $fresh['name'] ?? $collection['name'] ?? $slug;
        $suggestedPrompt = buildCollectionSchemaChangePrompt(
            $slug,
            $collectionName,
            $oldSchema ?? [],
            $body['schema']
        );
    }

    jsonResponse(['ok' => true, 'data' => [
        'collection'       => array_merge($fresh ?? [], ['schema' => is_array($schema) ? $schema : []]),
        'suggested_prompt' => $suggestedPrompt,
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  DELETE /collections/:slug — Delete collection + files
// ═══════════════════════════════════════════

if ($method === 'DELETE' && isset($params['slug']) && $path === '/collections/' . $params['slug']) {
    $slug = (string) $params['slug'];
    $collection = $db->queryOne('SELECT id, slug FROM collections WHERE slug = ?', [$slug]);

    if ($collection === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => "Collection '{$slug}' not found.",
        ]], 404);
        return;
    }

    $db->delete('collections', 'slug = ?', [$slug]);

    $paths = getCollectionPaths($collectionsRoot, $slug);
    removeDirectory($paths['dir']);

    jsonResponse(['ok' => true, 'data' => [
        'message' => "Collection '{$slug}' deleted.",
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  GET /collections/:slug/items — List items
// ═══════════════════════════════════════════

if ($method === 'GET' && isset($params['slug']) && $path === '/collections/' . $params['slug'] . '/items') {
    $slug = (string) $params['slug'];
    $collection = $db->queryOne('SELECT id, slug, name, item_count FROM collections WHERE slug = ?', [$slug]);

    if ($collection === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => "Collection '{$slug}' not found.",
        ]], 404);
        return;
    }

    $paths = getCollectionPaths($collectionsRoot, $slug);
    $items = loadJson($paths['items'], []);
    if (!is_array($items)) {
        $items = [];
    }

    usort($items, static function (array $a, array $b): int {
        return strcmp((string) ($b['updated_at'] ?? ''), (string) ($a['updated_at'] ?? ''));
    });

    jsonResponse(['ok' => true, 'data' => [
        'collection' => $collection,
        'items'      => $items,
        'count'      => count($items),
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /collections/:slug/items — Create item
// ═══════════════════════════════════════════

if ($method === 'POST' && isset($params['slug']) && $path === '/collections/' . $params['slug'] . '/items') {
    $slug = (string) $params['slug'];
    $collection = $db->queryOne('SELECT id, slug FROM collections WHERE slug = ?', [$slug]);

    if ($collection === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => "Collection '{$slug}' not found.",
        ]], 404);
        return;
    }

    $body = getJsonBody();
    $fields = $body['fields'] ?? ($body['data'] ?? []);
    if (!is_array($fields)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Item fields must be an object.',
        ]], 422);
        return;
    }

    $paths = getCollectionPaths($collectionsRoot, $slug);
    if (!is_dir($paths['dir'])) {
        mkdir($paths['dir'], 0755, true);
    }
    $items = loadJson($paths['items'], []);
    if (!is_array($items)) {
        $items = [];
    }

    $now = now();
    $item = [
        'id'         => generateItemId(),
        'fields'     => $fields,
        'status'     => normalizeStatus((string) ($body['status'] ?? 'published')),
        'created_at' => $now,
        'updated_at' => $now,
    ];

    $items[] = $item;
    if (!saveJson($paths['items'], $items)) {
        Logger::error('collections', 'Failed to persist collection item', [
            'slug'    => $slug,
            'item_id' => $item['id'],
            'path'    => $paths['items'],
        ]);
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'write_failed',
            'message' => 'Failed to persist collection item.',
        ]], 500);
        return;
    }

    touchCollection($db, $slug, count($items));

    jsonResponse(['ok' => true, 'data' => ['item' => $item]], 201);
    return;
}

// ═══════════════════════════════════════════
//  PUT /collections/:slug/items/:itemId — Update item
// ═══════════════════════════════════════════

if (
    $method === 'PUT'
    && isset($params['slug'], $params['itemId'])
    && $path === '/collections/' . $params['slug'] . '/items/' . $params['itemId']
) {
    $slug = (string) $params['slug'];
    $itemId = (string) $params['itemId'];
    $collection = $db->queryOne('SELECT id, slug FROM collections WHERE slug = ?', [$slug]);

    if ($collection === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => "Collection '{$slug}' not found.",
        ]], 404);
        return;
    }

    $body = getJsonBody();
    $paths = getCollectionPaths($collectionsRoot, $slug);
    $items = loadJson($paths['items'], []);
    if (!is_array($items)) {
        $items = [];
    }

    $found = false;
    $updatedItem = null;
    foreach ($items as &$item) {
        if ((string) ($item['id'] ?? '') !== $itemId) {
            continue;
        }

        $found = true;
        if (array_key_exists('fields', $body) || array_key_exists('data', $body)) {
            $fields = $body['fields'] ?? $body['data'];
            if (!is_array($fields)) {
                jsonResponse(['ok' => false, 'error' => [
                    'code'    => 'validation',
                    'message' => 'Item fields must be an object.',
                ]], 422);
                return;
            }
            $item['fields'] = $fields;
        }

        if (array_key_exists('status', $body)) {
            $item['status'] = normalizeStatus((string) $body['status']);
        }

        $item['updated_at'] = now();
        $updatedItem = $item;
        break;
    }
    unset($item);

    if (!$found) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => "Item '{$itemId}' not found in collection '{$slug}'.",
        ]], 404);
        return;
    }

    if (!saveJson($paths['items'], $items)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'write_failed',
            'message' => 'Failed to persist updated item.',
        ]], 500);
        return;
    }

    touchCollection($db, $slug, count($items));

    jsonResponse(['ok' => true, 'data' => ['item' => $updatedItem]]);
    return;
}

// ═══════════════════════════════════════════
//  DELETE /collections/:slug/items/:itemId — Delete item
// ═══════════════════════════════════════════

if (
    $method === 'DELETE'
    && isset($params['slug'], $params['itemId'])
    && $path === '/collections/' . $params['slug'] . '/items/' . $params['itemId']
) {
    $slug = (string) $params['slug'];
    $itemId = (string) $params['itemId'];
    $collection = $db->queryOne('SELECT id, slug FROM collections WHERE slug = ?', [$slug]);

    if ($collection === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => "Collection '{$slug}' not found.",
        ]], 404);
        return;
    }

    $paths = getCollectionPaths($collectionsRoot, $slug);
    $items = loadJson($paths['items'], []);
    if (!is_array($items)) {
        $items = [];
    }

    $beforeCount = count($items);
    $items = array_values(array_filter($items, static function (array $item) use ($itemId): bool {
        return (string) ($item['id'] ?? '') !== $itemId;
    }));

    if (count($items) === $beforeCount) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => "Item '{$itemId}' not found in collection '{$slug}'.",
        ]], 404);
        return;
    }

    if (!saveJson($paths['items'], $items)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'write_failed',
            'message' => 'Failed to persist item deletion.',
        ]], 500);
        return;
    }

    touchCollection($db, $slug, count($items));

    jsonResponse(['ok' => true, 'data' => [
        'message' => "Item '{$itemId}' deleted.",
    ]]);
    return;
}

jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'Collections endpoint not found.',
]], 404);

// ═══════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════

/**
 * @return array{dir: string, schema: string, items: string}
 */
function getCollectionPaths(string $root, string $slug): array
{
    $dir = $root . '/' . $slug;
    return [
        'dir'    => $dir,
        'schema' => $dir . '/schema.json',
        'items'  => $dir . '/items.json',
    ];
}

function loadJson(string $path, mixed $fallback): mixed
{
    if (!file_exists($path)) {
        return $fallback;
    }

    $raw = file_get_contents($path);
    if ($raw === false || trim($raw) === '') {
        return $fallback;
    }

    $decoded = json_decode($raw, true);
    return $decoded === null ? $fallback : $decoded;
}

function saveJson(string $path, mixed $data): bool
{
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    $encoded = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($encoded === false) {
        return false;
    }

    $tmp = $path . '.tmp.' . getmypid();
    if (file_put_contents($tmp, $encoded . "\n") === false) {
        @unlink($tmp);
        return false;
    }

    if (!rename($tmp, $path)) {
        @unlink($tmp);
        return false;
    }

    return true;
}

function removeDirectory(string $path): void
{
    if (!is_dir($path)) {
        return;
    }

    $items = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );

    foreach ($items as $item) {
        if ($item->isDir()) {
            rmdir($item->getPathname());
        } else {
            unlink($item->getPathname());
        }
    }

    rmdir($path);
}

function normalizeSlug(string $value): string
{
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';
    $value = trim($value, '-');
    return $value;
}

function isValidSlug(string $slug): bool
{
    return (bool) preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug);
}

function generateItemId(): string
{
    return bin2hex(random_bytes(8));
}

function normalizeStatus(string $status): string
{
    $status = strtolower(trim($status));
    return in_array($status, ['draft', 'published', 'archived'], true)
        ? $status
        : 'published';
}

function touchCollection(Database $db, string $slug, int $itemCount): void
{
    $db->update('collections', [
        'item_count'  => $itemCount,
        'updated_at'  => now(),
    ], 'slug = ?', [$slug]);
}

/**
 * Build a suggested AI prompt for post-schema-change page updates.
 *
 * Compares old and new schemas to describe exactly what changed,
 * so the AI can update index pages, forms, and views accordingly.
 */
function buildCollectionSchemaChangePrompt(string $slug, string $name, array $oldSchema, array $newSchema): string
{
    $oldKeys = [];
    $newKeys = [];
    foreach ($oldSchema as $field) {
        if (is_array($field) && isset($field['key'])) {
            $oldKeys[$field['key']] = $field;
        }
    }
    foreach ($newSchema as $field) {
        if (is_array($field) && isset($field['key'])) {
            $newKeys[$field['key']] = $field;
        }
    }

    $added   = array_diff_key($newKeys, $oldKeys);
    $removed = array_diff_key($oldKeys, $newKeys);
    $kept    = array_intersect_key($newKeys, $oldKeys);

    $changes = [];
    if (!empty($added)) {
        $addedLabels = array_map(fn($f) => ($f['label'] ?? $f['key']) . ' (' . ($f['type'] ?? 'text') . ')', $added);
        $changes[] = 'Added fields: ' . implode(', ', $addedLabels);
    }
    if (!empty($removed)) {
        $removedLabels = array_map(fn($f) => ($f['label'] ?? $f['key']), $removed);
        $changes[] = 'Removed fields: ' . implode(', ', $removedLabels);
    }

    // Detect type changes
    foreach ($kept as $key => $newField) {
        $oldField = $oldKeys[$key];
        if (($oldField['type'] ?? 'text') !== ($newField['type'] ?? 'text')) {
            $changes[] = "Changed '{$key}' type from {$oldField['type']} to {$newField['type']}";
        }
    }

    $changeDesc = empty($changes) ? 'The schema was updated.' : implode('. ', $changes) . '.';

    return "The \"{$name}\" collection ({$slug}) schema has been updated. {$changeDesc} "
        . "Please review and update any pages that display this collection's data: "
        . "1) Update the index/listing page to reflect the new fields (add new columns/cards, remove deleted ones). "
        . "2) If there are individual item pages, update their templates too. "
        . "3) Update any forms that reference this collection's fields. "
        . "4) Ensure the design remains balanced after the field changes.";
}
