<?php

declare(strict_types=1);

/**
 * Agent API — Schema Endpoint (Public, no auth)
 *
 * GET /_studio/api/agent/v1/schema  (canonical; /schema.php also accepted)
 *
 * File is named _schema-handler.php (with underscore prefix) so Nginx's
 * try_files cannot match it when the URL "/schema" is requested. Without the
 * prefix, Nginx resolves "schema" → "schema.php" and serves the raw PHP
 * source as application/octet-stream instead of routing through PHP-FPM.
 *
 * Returns a machine-readable JSON schema describing the full Agent API surface.
 * This is the tool-calling contract: every endpoint, every parameter, every
 * response shape, every error code — verified against the live router.
 *
 * Designed for consumption by:
 * - OpenAI function calling (via the /tools format adapter)
 * - Claude/Anthropic tool use
 * - MCP servers
 * - Custom agent frameworks
 * - Documentation generators
 *
 * This file is PUBLIC — no authentication required.
 * It describes the API contract; it does not execute anything.
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: public, max-age=86400');

// ─── Build the schema from source truth ───

$schema = [
    'openapi'  => '3.0.3',
    'info'     => [
        'title'       => 'VoxelSite Agent API',
        'description' => 'REST API for external AI agents, automation tools, and CI/CD pipelines to manage a VoxelSite installation. Supports page CRUD, asset management, CSS compilation, site publishing, form submissions, settings, and tool invocation.',
        'version'     => '1.0.0',
        'contact'     => [
            'name' => 'VoxelSite',
            'url'  => 'https://voxelsite.com',
        ],
    ],
    'servers'  => [
        [
            'url'         => '/_studio/api/agent/v1',
            'description' => 'Agent API v1 (relative to site root)',
        ],
    ],
    'security' => [
        ['BearerAuth' => []],
    ],
    'components' => [
        'securitySchemes' => [
            'BearerAuth' => [
                'type'         => 'http',
                'scheme'       => 'bearer',
                'description'  => 'API key prefixed with vxs_. Pass as: Authorization: Bearer vxs_<key>',
            ],
        ],
        'schemas' => schema_buildComponentSchemas(),
    ],
    'paths' => schema_buildPaths(),
];

echo json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);


// ═══════════════════════════════════════════
//  Schema Builders
// ═══════════════════════════════════════════

function schema_buildComponentSchemas(): array
{
    return [
        'ErrorResponse' => [
            'type' => 'object',
            'properties' => [
                'error' => [
                    'type' => 'object',
                    'properties' => [
                        'code'    => ['type' => 'string', 'description' => 'Machine-readable error code'],
                        'message' => ['type' => 'string', 'description' => 'Human-readable error description'],
                        'details' => ['type' => 'object', 'description' => 'Additional error context (optional)'],
                    ],
                    'required' => ['code', 'message'],
                ],
            ],
        ],
        'Page' => [
            'type' => 'object',
            'properties' => [
                'slug'      => ['type' => 'string', 'description' => 'URL slug (e.g. "about", "contact")'],
                'title'     => ['type' => 'string', 'description' => 'Page title'],
                'file_path' => ['type' => 'string', 'description' => 'Relative file path (e.g. "about.php")'],
                'content'   => ['type' => 'string', 'description' => 'Full PHP/HTML page content (only in single-page responses)'],
                'is_index'  => ['type' => 'boolean', 'description' => 'Whether this is the homepage (index.php)'],
            ],
        ],
        'Asset' => [
            'type' => 'object',
            'properties' => [
                'path'      => ['type' => 'string', 'description' => 'Web-accessible path (e.g. "/assets/images/logo.png")'],
                'filename'  => ['type' => 'string'],
                'extension' => ['type' => 'string'],
                'category'  => ['type' => 'string', 'enum' => ['images', 'css', 'js', 'fonts', 'files']],
                'size'      => ['type' => 'integer', 'description' => 'File size in bytes'],
                'modified'  => ['type' => 'string', 'format' => 'date-time'],
                'width'     => ['type' => 'integer', 'description' => 'Image width in pixels (images only)'],
                'height'    => ['type' => 'integer', 'description' => 'Image height in pixels (images only)'],
            ],
        ],
        'Submission' => [
            'type' => 'object',
            'properties' => [
                'id'         => ['type' => 'integer'],
                'form_id'    => ['type' => 'string', 'description' => 'Form identifier or "action_<id>" for action submissions'],
                'data'       => ['type' => 'object', 'description' => 'Submitted form field values'],
                'status'     => ['type' => 'string', 'description' => 'Submission status (e.g. "new", "read")'],
                'source'     => ['type' => 'string', 'enum' => ['form', 'action']],
                'ip_address' => ['type' => 'string'],
                'created_at' => ['type' => 'string', 'format' => 'date-time'],
                'updated_at' => ['type' => 'string', 'format' => 'date-time'],
            ],
        ],
        'Tool' => [
            'type' => 'object',
            'properties' => [
                'name'        => ['type' => 'string', 'description' => 'Tool identifier (e.g. "get_business_info", "submit_form")'],
                'description' => ['type' => 'string', 'description' => 'What the tool does'],
                'inputSchema' => [
                    'type' => 'object',
                    'description' => 'JSON Schema describing the tool\'s input parameters',
                ],
            ],
            'required' => ['name', 'description', 'inputSchema'],
        ],
    ];
}

function schema_buildPaths(): array
{
    $paths = [];

    // ── Pages ──
    $paths['/pages'] = [
        'get' => [
            'operationId' => 'listPages',
            'summary'     => 'List all pages',
            'description' => 'Returns a paginated list of all pages in the site. Each page includes slug, title, and file path but not content (use GET /pages/:slug for content).',
            'tags'        => ['Pages'],
            'parameters'  => [
                schema_param('page', 'query', 'integer', 'Page number (default: 1)', false),
                schema_param('per_page', 'query', 'integer', 'Results per page (1–100, default: 50)', false),
            ],
            'responses' => [
                '200' => schema_jsonResponse('Page list', [
                    'data' => [
                        'type' => 'object',
                        'properties' => [
                            'pages'    => ['type' => 'array', 'items' => ['$ref' => '#/components/schemas/Page']],
                            'total'    => ['type' => 'integer'],
                            'page'     => ['type' => 'integer'],
                            'per_page' => ['type' => 'integer'],
                        ],
                    ],
                ]),
                '401' => schema_errorRef('Authentication failed'),
                '403' => schema_errorRef('Insufficient scope (requires pages:read)'),
            ],
        ],
        'post' => [
            'operationId' => 'createPage',
            'summary'     => 'Create a new page',
            'description' => 'Creates a new page with the given slug, title, and content. The slug is auto-normalized (lowercased, special chars removed). A revision is created automatically.',
            'tags'        => ['Pages'],
            'requestBody' => schema_jsonBody([
                'slug'    => ['type' => 'string', 'description' => 'URL slug for the page (e.g. "about-us"). Auto-normalized.'],
                'title'   => ['type' => 'string', 'description' => 'Human-readable page title'],
                'content' => ['type' => 'string', 'description' => 'Full PHP/HTML page content'],
            ], ['slug', 'title']),
            'responses' => [
                '201' => schema_jsonResponse('Page created'),
                '409' => schema_errorRef('Page with this slug already exists'),
                '422' => schema_errorRef('Validation error (empty slug, path traversal, etc.)'),
            ],
        ],
    ];

    $paths['/pages/{slug}'] = [
        'get' => [
            'operationId' => 'getPage',
            'summary'     => 'Get a single page with content',
            'description' => 'Returns the full page including its PHP/HTML content.',
            'tags'        => ['Pages'],
            'parameters'  => [schema_param('slug', 'path', 'string', 'Page slug', true)],
            'responses' => [
                '200' => schema_jsonResponse('Page detail with content'),
                '404' => schema_errorRef('Page not found'),
            ],
        ],
        'put' => [
            'operationId' => 'updatePage',
            'summary'     => 'Update page content or metadata',
            'description' => 'Updates a page\'s title, content, and/or slug. Renaming a page (changing slug) automatically updates all internal links and navigation references across the entire site. A revision is created.',
            'tags'        => ['Pages'],
            'parameters'  => [schema_param('slug', 'path', 'string', 'Current page slug', true)],
            'requestBody' => schema_jsonBody([
                'title'   => ['type' => 'string', 'description' => 'New page title (optional)'],
                'content' => ['type' => 'string', 'description' => 'New PHP/HTML page content (optional)'],
                'slug'    => ['type' => 'string', 'description' => 'New slug to rename the page (optional, triggers site-wide link rewrite)'],
            ]),
            'responses' => [
                '200' => schema_jsonResponse('Page updated'),
                '404' => schema_errorRef('Page not found'),
                '409' => schema_errorRef('Conflict: new slug already exists'),
                '422' => schema_errorRef('Validation error'),
            ],
        ],
        'delete' => [
            'operationId' => 'deletePage',
            'summary'     => 'Delete a page',
            'description' => 'Permanently deletes a page and cleans up all references in navigation and internal links.',
            'tags'        => ['Pages'],
            'parameters'  => [schema_param('slug', 'path', 'string', 'Page slug to delete', true)],
            'responses' => [
                '200' => schema_jsonResponse('Page deleted'),
                '404' => schema_errorRef('Page not found'),
                '422' => schema_errorRef('Cannot delete (e.g. index page)'),
            ],
        ],
    ];

    // ── Compile ──
    $paths['/compile'] = [
        'post' => [
            'operationId' => 'compileCss',
            'summary'     => 'Recompile Tailwind CSS',
            'description' => 'Triggers a Tailwind CSS recompilation. Call this after modifying page content that uses new utility classes.',
            'tags'        => ['Build & Publish'],
            'requestBody' => ['content' => ['application/json' => ['schema' => ['type' => 'object']]]],
            'responses' => [
                '200' => schema_jsonResponse('Compilation result', [
                    'data' => [
                        'type' => 'object',
                        'properties' => [
                            'success'   => ['type' => 'boolean'],
                            'output'    => ['type' => 'string', 'description' => 'Compiler output'],
                            'file_size' => ['type' => 'integer', 'description' => 'Compiled CSS file size in bytes'],
                        ],
                    ],
                ]),
            ],
        ],
    ];

    // ── Publish ──
    $paths['/publish'] = [
        'post' => [
            'operationId' => 'publishSite',
            'summary'     => 'Publish preview → production',
            'description' => 'Publishes the current preview state to the live production site. Optionally creates a snapshot (backup) before publishing.',
            'tags'        => ['Build & Publish'],
            'requestBody' => schema_jsonBody([
                'create_snapshot' => ['type' => 'boolean', 'default' => true, 'description' => 'Create a snapshot backup before publishing (default: true)'],
            ]),
            'responses' => [
                '200' => schema_jsonResponse('Publish result', [
                    'data' => [
                        'type' => 'object',
                        'properties' => [
                            'published'     => ['type' => 'boolean'],
                            'snapshot_id'   => ['type' => 'string', 'description' => 'Snapshot ID (if create_snapshot was true)'],
                            'files_copied'  => ['type' => 'integer'],
                            'published_at'  => ['type' => 'string', 'format' => 'date-time'],
                        ],
                    ],
                ]),
                '422' => schema_errorRef('Nothing to publish (no changes since last publish)'),
                '500' => schema_errorRef('Publish failed'),
            ],
        ],
    ];

    // ── Settings ──
    $paths['/settings'] = [
        'get' => [
            'operationId' => 'getSettings',
            'summary'     => 'Read site settings (redacted)',
            'description' => 'Returns public-safe settings. Sensitive values (API keys, encryption keys, passwords) are never exposed.',
            'tags'        => ['Settings'],
            'responses' => [
                '200' => schema_jsonResponse('Settings object', [
                    'data' => [
                        'type' => 'object',
                        'properties' => [
                            'settings' => [
                                'type' => 'object',
                                'properties' => [
                                    'site_name'                  => ['type' => 'string'],
                                    'site_tagline'               => ['type' => 'string'],
                                    'site_language'              => ['type' => 'string'],
                                    'site_url'                   => ['type' => 'string'],
                                    'site_favicon'               => ['type' => 'string'],
                                    'ai_provider'                => ['type' => 'string'],
                                    'nav_style'                  => ['type' => 'string'],
                                    'mobile_nav_style'           => ['type' => 'string'],
                                    'footer_style'               => ['type' => 'string'],
                                    'auto_snapshot'              => ['type' => 'boolean'],
                                    'max_snapshots'              => ['type' => 'integer'],
                                    'max_revisions'              => ['type' => 'integer'],
                                    'last_published_at'          => ['type' => 'string', 'format' => 'date-time', 'nullable' => true],
                                    'publish_count'              => ['type' => 'integer'],
                                    'agent_api_enabled'          => ['type' => 'boolean'],
                                    'agent_api_allowed_origins'  => ['type' => 'string'],
                                ],
                            ],
                        ],
                    ],
                ]),
            ],
        ],
        'put' => [
            'operationId' => 'updateSettings',
            'summary'     => 'Update site settings',
            'description' => 'Updates whitelisted settings only. Sensitive settings (AI API keys, agent_api_enabled, agent_api_allowed_origins) cannot be changed via Agent API for security.',
            'tags'        => ['Settings'],
            'requestBody' => schema_jsonBody([
                'site_name'        => ['type' => 'string', 'description' => 'Site name'],
                'site_tagline'     => ['type' => 'string', 'description' => 'Site tagline/description'],
                'site_language'    => ['type' => 'string', 'description' => 'Site language code (e.g. "en")'],
                'site_url'         => ['type' => 'string', 'description' => 'Canonical site URL'],
                'site_favicon'     => ['type' => 'string', 'description' => 'Favicon path'],
                'nav_style'        => ['type' => 'string', 'description' => 'Navigation style'],
                'mobile_nav_style' => ['type' => 'string', 'description' => 'Mobile navigation style'],
                'footer_style'     => ['type' => 'string', 'description' => 'Footer style'],
                'auto_snapshot'    => ['type' => 'boolean', 'description' => 'Auto-create snapshot before publish'],
                'max_snapshots'    => ['type' => 'integer', 'description' => 'Maximum snapshots to keep'],
                'max_revisions'    => ['type' => 'integer', 'description' => 'Maximum revisions per file'],
            ]),
            'responses' => [
                '200' => schema_jsonResponse('Update result', [
                    'data' => [
                        'type' => 'object',
                        'properties' => [
                            'updated'  => ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'Keys that were updated'],
                            'rejected' => ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'Keys that were rejected (not in whitelist)'],
                        ],
                    ],
                ]),
                '422' => schema_errorRef('No valid settings provided'),
            ],
        ],
    ];

    // ── Submissions ──
    $paths['/submissions'] = [
        'get' => [
            'operationId' => 'listSubmissions',
            'summary'     => 'List form and action submissions',
            'description' => 'Returns paginated list of submissions from both form and action sources. When mixing sources (default), results are globally sorted by created_at DESC and paginated once — ensuring stable, duplicate-free page boundaries.',
            'tags'        => ['Submissions'],
            'parameters'  => [
                schema_param('form_id', 'query', 'string', 'Filter by form ID (prefix with "action_" for action submissions)', false),
                schema_param('status', 'query', 'string', 'Filter by status (e.g. "new", "read")', false),
                schema_param('source', 'query', 'string', 'Filter by source: "form", "action", or omit for both', false),
                schema_param('page', 'query', 'integer', 'Page number (default: 1)', false),
                schema_param('per_page', 'query', 'integer', 'Results per page (1–100, default: 50)', false),
            ],
            'responses' => [
                '200' => schema_jsonResponse('Submissions list', [
                    'data' => [
                        'type' => 'object',
                        'properties' => [
                            'submissions' => ['type' => 'array', 'items' => ['$ref' => '#/components/schemas/Submission']],
                            'total'       => ['type' => 'integer'],
                            'page'        => ['type' => 'integer'],
                            'per_page'    => ['type' => 'integer'],
                        ],
                    ],
                ]),
            ],
        ],
    ];

    // ── Assets ──
    $paths['/assets'] = [
        'get' => [
            'operationId' => 'listAssets',
            'summary'     => 'List uploaded assets',
            'description' => 'Returns a paginated list of files in the assets directory. Filter by category. Image assets include width/height dimensions.',
            'tags'        => ['Assets'],
            'parameters'  => [
                schema_param('category', 'query', 'string', 'Filter by category: images, css, js, fonts, files', false),
                schema_param('page', 'query', 'integer', 'Page number (default: 1)', false),
                schema_param('per_page', 'query', 'integer', 'Results per page (1–100, default: 50)', false),
            ],
            'responses' => [
                '200' => schema_jsonResponse('Asset list', [
                    'data' => [
                        'type' => 'object',
                        'properties' => [
                            'assets'   => ['type' => 'array', 'items' => ['$ref' => '#/components/schemas/Asset']],
                            'total'    => ['type' => 'integer'],
                            'page'     => ['type' => 'integer'],
                            'per_page' => ['type' => 'integer'],
                        ],
                    ],
                ]),
                '422' => schema_errorRef('Invalid category'),
            ],
        ],
        'post' => [
            'operationId' => 'uploadAsset',
            'summary'     => 'Upload an asset file',
            'description' => 'Upload a file via multipart/form-data. Category is auto-detected from extension but can be overridden. Filenames are sanitized. Executable file types (.php, .sh, etc.) are blocked. Max 10 MB.',
            'tags'        => ['Assets'],
            'requestBody' => [
                'required' => true,
                'content' => [
                    'multipart/form-data' => [
                        'schema' => [
                            'type' => 'object',
                            'properties' => [
                                'file'     => ['type' => 'string', 'format' => 'binary', 'description' => 'The file to upload (max 10 MB)'],
                                'category' => ['type' => 'string', 'enum' => ['images', 'css', 'js', 'fonts', 'files'], 'description' => 'Target category (auto-detected if omitted)'],
                            ],
                            'required' => ['file'],
                        ],
                    ],
                ],
            ],
            'responses' => [
                '201' => schema_jsonResponse('Upload result', [
                    'data' => [
                        'type' => 'object',
                        'properties' => [
                            'path'      => ['type' => 'string', 'description' => 'Web-accessible path'],
                            'filename'  => ['type' => 'string', 'description' => 'Sanitized filename'],
                            'original'  => ['type' => 'string', 'description' => 'Original filename'],
                            'extension' => ['type' => 'string'],
                            'category'  => ['type' => 'string'],
                            'size'      => ['type' => 'integer'],
                            'width'     => ['type' => 'integer', 'description' => 'Image width (images only)'],
                            'height'    => ['type' => 'integer', 'description' => 'Image height (images only)'],
                        ],
                    ],
                ]),
                '400' => schema_errorRef('No file uploaded or upload error'),
                '422' => schema_errorRef('File too large, blocked type, or invalid category'),
            ],
        ],
    ];

    // ── Tools ──
    $paths['/tools'] = [
        'get' => [
            'operationId' => 'listTools',
            'summary'     => 'List available tools',
            'description' => 'Returns all tools available for invocation. Includes data tools (business info, menu, services, FAQ), form tools (list, schema, submit), and custom Action tools defined in the Studio.',
            'tags'        => ['Tools'],
            'responses' => [
                '200' => schema_jsonResponse('Tool list', [
                    'data' => [
                        'type' => 'object',
                        'properties' => [
                            'tools' => ['type' => 'array', 'items' => ['$ref' => '#/components/schemas/Tool']],
                        ],
                    ],
                ]),
            ],
        ],
    ];

    $paths['/tools/invoke'] = [
        'post' => [
            'operationId' => 'invokeTool',
            'summary'     => 'Invoke a tool by name',
            'description' => 'Executes a tool and returns its result. The tool name must match one returned by GET /tools. Arguments are validated against the tool\'s inputSchema.',
            'tags'        => ['Tools'],
            'requestBody' => schema_jsonBody([
                'name'      => ['type' => 'string', 'description' => 'Tool name (e.g. "get_business_info", "submit_form")'],
                'arguments' => ['type' => 'object', 'description' => 'Tool arguments matching the tool\'s inputSchema'],
            ], ['name']),
            'responses' => [
                '200' => schema_jsonResponse('Tool execution result'),
                '404' => schema_errorRef('Tool not found'),
                '422' => schema_errorRef('Validation failed'),
                '429' => schema_errorRef('Rate limited (for submit_form)'),
            ],
        ],
    ];

    return $paths;
}


// ═══════════════════════════════════════════
//  Helpers (keep the main paths clean)
// ═══════════════════════════════════════════

function schema_param(string $name, string $in, string $type, string $desc, bool $required): array
{
    return [
        'name'        => $name,
        'in'          => $in,
        'required'    => $required,
        'description' => $desc,
        'schema'      => ['type' => $type],
    ];
}

function schema_jsonBody(array $properties, array $required = []): array
{
    $schema = ['type' => 'object', 'properties' => $properties];
    if (!empty($required)) {
        $schema['required'] = $required;
    }
    return [
        'required' => !empty($required),
        'content' => ['application/json' => ['schema' => $schema]],
    ];
}

function schema_jsonResponse(string $description, array $schema = []): array
{
    $response = ['description' => $description];
    if (!empty($schema)) {
        $response['content'] = ['application/json' => ['schema' => ['type' => 'object', 'properties' => $schema]]];
    }
    return $response;
}

function schema_errorRef(string $description): array
{
    return [
        'description' => $description,
        'content' => [
            'application/json' => [
                'schema' => ['$ref' => '#/components/schemas/ErrorResponse'],
            ],
        ],
    ];
}
