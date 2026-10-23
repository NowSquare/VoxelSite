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
        'description' => 'REST API for external AI agents, automation tools, and CI/CD pipelines to manage a VoxelSite installation. Supports page CRUD, asset management, CSS compilation, site publishing, form submissions, settings, tool invocation, and asynchronous AI prompt execution.',
        'version'     => '1.0.0',
        'contact'     => [
            'name' => 'VoxelSite',
            'url'  => 'https://voxelsite.com',
        ],
        'x-capabilities' => [
            'prompt_execution' => [
                'available'   => function_exists('exec'),
                'description' => 'AI prompt execution via background CLI worker. Requires exec() and a usable PHP CLI executable on the server.',
                'scope'       => 'prompt:execute',
                'note'        => 'This scope is opt-in — not included in any role defaults.',
            ],
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
                'is_homepage' => ['type'=>'integer','enum'=>[0,1]],
                'content_sha256' => ['type'=>'string','pattern'=>'^[a-f0-9]{64}$'],
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
                'record_id'  => ['type' => 'integer'],
                'entity_id'  => ['type' => 'string', 'description' => 'Form or Action identifier'],
                'kind'       => ['type' => 'string', 'enum' => ['form', 'action']],
                'version'    => ['type' => 'string', 'description' => 'Exact record version'],
                'data'       => ['type' => 'object', 'description' => 'Submitted form field values'],
                'status'     => ['type' => 'string', 'description' => 'Submission status (e.g. "new", "read")'],
                'source'     => ['type' => 'string', 'description' => 'Original record channel, such as web, api, mcp, or studio'],
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
                'version' => ['type'=>'string','description'=>'Action definition version; pass unchanged in the invocation envelope.'],
                'action_id' => ['type'=>'string','description'=>'Exact Action identity; pass unchanged in the invocation envelope.'],
                'required_request_fields' => ['type'=>'array','items'=>['type'=>'string']],
            ],
            'required' => ['name', 'description', 'inputSchema'],
        ],
        'PromptResult' => [
            'type' => 'object',
            'properties' => [
                'id'              => ['type' => 'integer', 'description' => 'Prompt log ID'],
                'conversation_id' => ['type' => 'string', 'description' => 'Conversation UUID'],
                'action_type'     => ['type' => 'string', 'description' => 'Action type (e.g. free_prompt, edit_page)'],
                'prompt'          => ['type' => 'string', 'description' => 'The original user prompt text'],
                'status'          => [
                    'type' => 'string',
                    'enum' => ['queued', 'streaming', 'success', 'partial', 'error'],
                    'description' => 'Current execution status',
                ],
                'status_message'  => ['type' => 'string', 'nullable' => true, 'description' => 'Human-readable progress message'],
                'ai_provider'     => ['type' => 'string'],
                'ai_model'        => ['type' => 'string'],
                'files_modified'  => ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'File paths modified (only in terminal states)'],
                'tokens'          => [
                    'type' => 'object',
                    'properties' => [
                        'input'  => ['type' => 'integer', 'nullable' => true],
                        'output' => ['type' => 'integer', 'nullable' => true],
                    ],
                ],
                'cost_estimate'   => ['type' => 'number', 'nullable' => true, 'description' => 'Estimated cost in USD'],
                'duration_ms'     => ['type' => 'integer', 'nullable' => true],
                'error_message'   => ['type' => 'string', 'nullable' => true],
                'created_at'      => ['type' => 'string', 'format' => 'date-time'],
            ],
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
                schema_param('draft_version', 'query', 'string', 'Captured version required for page 2 and later.', false),
            ],
            'responses' => [
                '200' => schema_jsonResponse('Page list', [
                    'data' => [
                        'type' => 'object',
                        'properties' => [
                            'pages'    => ['type' => 'array', 'items' => ['$ref' => '#/components/schemas/Page']],
                            'total'    => ['type' => 'integer'],
                            'draft_version' => ['type' => 'string'],
                            'next_offset' => ['type' => ['integer', 'null']],
                            'pagination' => ['type' => 'object'],
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
            'description' => 'Creates a private draft page through a retained exact review. Requires an explicitly account-bound REST credential. Slug must already be canonical. Revisions retain that account and credential attribution.',
            'tags'        => ['Pages'],
            'requestBody' => schema_jsonBody([
                'operation_id' => ['type' => 'string', 'description' => 'Caller-generated stable operation identity. Reuse the exact request after a lost response.'],
                'base_draft_version' => ['type' => 'string', 'pattern' => '^draft:[0-9]+$', 'description' => 'Version returned by the displayed page/list.'],
                'checkpoint' => ['type' => 'integer', 'description' => 'Explicit continuation checkpoint returned by an applying operation.'],

                'slug'    => ['type' => 'string', 'description' => 'Canonical root slug, such as about-us.'],
                'title'   => ['type' => 'string', 'description' => 'Human-readable page title'],
                'content' => ['type' => 'string', 'description' => 'Full PHP/HTML page content'],
                'expected_content_sha256' => ['type' => 'null', 'description' => 'Explicit absence precondition.'],
            ], ['operation_id', 'base_draft_version', 'expected_content_sha256', 'slug', 'title', 'content']),
            'responses' => [
                '201' => schema_jsonResponse('Page created'),
                '409' => schema_errorRef('Page with this slug already exists'),
                '422' => schema_errorRef('Validation error (empty slug, path traversal, etc.)'),
                '409' => schema_errorRef('Stale source/version, changed retry intent, or credential_migration_required.'),
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
            'description' => 'Atomically updates private page source and metadata with exact captured preconditions. Rename rewrites supported static references. Reuse the same identity and input for retries; explicitly continue an applying operation.',
            'tags'        => ['Pages'],
            'parameters'  => [schema_param('slug', 'path', 'string', 'Current page slug', true)],
            'requestBody' => schema_jsonBody([
                'operation_id' => ['type' => 'string', 'description' => 'Caller-generated stable operation identity. Reuse the exact request after a lost response.'],
                'base_draft_version' => ['type' => 'string', 'pattern' => '^draft:[0-9]+$', 'description' => 'Version returned by the displayed page/list.'],
                'checkpoint' => ['type' => 'integer', 'description' => 'Explicit continuation checkpoint returned by an applying operation.'],

                'title'   => ['type' => 'string', 'description' => 'New page title (optional)'],
                'content' => ['type' => 'string', 'description' => 'New PHP/HTML page content (optional)'],
                'slug'    => ['type' => 'string', 'description' => 'Canonical root slug to rename the page.'],
                'nav_label' => ['type' => ['string', 'null']],
                'nav_order' => ['type' => ['integer', 'null']],
                'is_published' => ['type' => 'boolean'],
                'is_homepage' => ['type' => 'boolean'],
                'expected_content_sha256' => ['type' => 'string', 'pattern' => '^[a-f0-9]{64}$', 'description' => 'Exact hash returned by page detail.'],
            ], ['operation_id', 'base_draft_version', 'expected_content_sha256']),
            'responses' => [
                '200' => schema_jsonResponse('Page updated'),
                '404' => schema_errorRef('Page not found'),
                '409' => schema_errorRef('Conflict: new slug already exists'),
                '422' => schema_errorRef('Validation error'),
                '409' => schema_errorRef('Stale source/version, changed retry intent, or credential_migration_required.'),
            ],
        ],
        'delete' => [
            'operationId' => 'deletePage',
            'summary'     => 'Delete a page',
            'description' => 'Permanently deletes a page and cleans up all references in navigation and internal links.',
            'tags'        => ['Pages'],
            'parameters'  => [schema_param('slug', 'path', 'string', 'Page slug to delete', true)],
            'requestBody' => schema_jsonBody([
                'operation_id' => ['type' => 'string', 'description' => 'Caller-generated stable operation identity. Reuse the exact request after a lost response.'],
                'base_draft_version' => ['type' => 'string', 'pattern' => '^draft:[0-9]+$', 'description' => 'Version returned by the displayed page/list.'],
                'checkpoint' => ['type' => 'integer', 'description' => 'Explicit continuation checkpoint returned by an applying operation.'],
                'expected_content_sha256' => ['type'=>'string','pattern'=>'^[a-f0-9]{64}$'],
                'replacementHref' => ['type'=>'string','description'=>'# or a surviving application-relative page route.'],
            ], ['operation_id','base_draft_version','expected_content_sha256']),
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
            'description' => 'Reviews and applies deterministic private draft compilation with the same captured version and retained operation identity. A no-change compile retains success without a new revision. Never publishes.',
            'tags'        => ['Build & Publish'],
            'requestBody' => schema_jsonBody([
                'operation_id' => ['type' => 'string', 'description' => 'Caller-generated stable operation identity. Reuse the exact request after a lost response.'],
                'base_draft_version' => ['type' => 'string', 'pattern' => '^draft:[0-9]+$', 'description' => 'Version returned by the displayed page/list.'],
                'checkpoint' => ['type' => 'integer', 'description' => 'Explicit continuation checkpoint returned by an applying operation.'],
            ], ['operation_id','base_draft_version']),
            'responses' => [
                '200' => schema_jsonResponse('Compilation result', [
                    'data' => [
                        'type' => 'object',
                        'properties' => [
                            'operation' => ['type'=>'object','description'=>'Retained operation state, identity and continuation checkpoint.'],
                            'draft_version' => ['type'=>'string'],
                            'changed' => ['type'=>'boolean'],
                            'content_sha256' => ['type'=>['string','null']],
                        ],
                    ],
                ]),
            ],
        ],
    ];

    // ── Publish ──
    $publishData = [
        'type'=>'object',
        'properties'=>[
            'published'=>['type'=>'array','items'=>['type'=>'string']],
            'removed'=>['type'=>'array','items'=>['type'=>'string']],
            'snapshot_id'=>['type'=>'string','nullable'=>true],
            'message'=>['type'=>'string'],
            'provider_calls'=>['type'=>'integer','enum'=>[0]],
            'recovery_snapshot_required'=>['type'=>'boolean','enum'=>[true]],
            'optional_archive_requested'=>['type'=>'boolean'],
            'operation'=>[
                'type'=>'object',
                'required'=>['operation_id','kind','status','checkpoint'],
                'properties'=>[
                    'operation_id'=>['type'=>'string'],
                    'kind'=>['type'=>'string','enum'=>['publish.apply']],
                    'status'=>['type'=>'string','enum'=>['prepared','applying','succeeded','failed_restored','recovery_required','expired','cancelled']],
                    'phase'=>['type'=>'string'],
                    'checkpoint'=>['type'=>'integer','minimum'=>0],
                    'before_version'=>['type'=>'string','nullable'=>true],
                    'after_version'=>['type'=>'string','nullable'=>true],
                    'result'=>['type'=>'object','nullable'=>true],
                    'next_action'=>['type'=>'string','nullable'=>true],
                    'provider_calls'=>['type'=>'integer','enum'=>[0]],
                    'result_retention_seconds'=>['type'=>'integer'],
                    'result_pruned'=>['type'=>'boolean'],
                ],
            ],
        ],
    ];
    $paths['/publish'] = [
        'post' => [
            'operationId' => 'publishSite',
            'summary' => 'Publish the private draft through a retained operation',
            'description' => 'Requires an account-bound REST credential with publish:trigger. The first request seals the current draft and starts publication. Reuse the same operation_id after a lost response; it returns the original retained operation instead of preparing another release. When status is applying, POST the same operation_id with its returned checkpoint to continue. A recovery snapshot is always required. Publication failures retain their operation under error.details.operation and may require explicit owner recovery.',
            'tags' => ['Build & Publish'],
            'requestBody' => schema_jsonBody([
                'operation_id'=>['type'=>'string','pattern'=>'^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$','description'=>'Stable caller identity. Reuse unchanged for retries and continuation.'],
                'checkpoint'=>['type'=>'integer','minimum'=>0,'description'=>'The exact checkpoint returned by an applying operation. Omit on the initial request and ordinary acknowledgement retry.'],
                'create_snapshot'=>['type'=>'boolean','default'=>true,'description'=>'Retained legacy optional-archive preference. It cannot disable the required recovery snapshot.'],
            ], ['operation_id']),
            'responses' => [
                '200'=>schema_jsonResponse('Publication succeeded, or the same succeeded receipt was replayed', ['data'=>$publishData]),
                '202'=>schema_jsonResponse('Publication is retained and needs continuation with the returned checkpoint', ['data'=>$publishData]),
                '401'=>schema_errorRef('Authentication failed'),
                '403'=>schema_errorRef('The current bound account or credential lacks publication authority'),
                '409'=>schema_errorRef('Invalid identity, stale checkpoint, ownership conflict or retained failed/recovery-required operation'),
                '500'=>schema_errorRef('Publication storage or runtime failed'),
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
            'description' => 'Returns a bounded inbox page under current account permissions. Follow next_cursor with the same filters. The first page pins per-source ID watermarks; later inserts are excluded. Offset page numbers beyond 1 are rejected.',
            'tags'        => ['Submissions'],
            'parameters'  => [
                schema_param('form_id', 'query', 'string', 'Filter by form ID (prefix with "action_" for action submissions)', false),
                schema_param('status', 'query', 'string', 'Filter by status (e.g. "new", "read")', false),
                schema_param('source', 'query', 'string', 'Filter by source: "form", "action", or omit for both', false),
                schema_param('cursor', 'query', 'string', 'Opaque continuation returned by the previous page', false),
                schema_param('per_page', 'query', 'integer', 'Results per page (1–100, default: 50)', false),
            ],
            'responses' => [
                '200' => schema_jsonResponse('Submissions list', [
                    'data' => [
                        'type' => 'object',
                        'properties' => [
                            'submissions' => ['type' => 'array', 'items' => ['$ref' => '#/components/schemas/Submission']],
                            'next_cursor'=> ['type' => 'string','nullable'=>true],
                            'consistency'=> ['type' => 'string','enum'=>['keyset_with_initial_id_watermarks']],
                            'provider_calls'=> ['type'=>'integer','enum'=>[0]],
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
            'description' => 'Returns published data/form tools and a bounded page of Action tools. Continue with next_offset and the same inventory version. Real mutations require the original version and request_id in the invocation envelope; Action calls also require action_id. Email needs explicit owner mail:send access.',
            'tags'        => ['Tools'],
            'parameters' => [
                schema_param('offset','query','integer','Action offset; continuation requires version',false),
                schema_param('limit','query','integer','Actions per page (1–50)',false),
                schema_param('version','query','string','Original Action inventory version',false),
            ],
            'responses' => [
                '200' => schema_jsonResponse('Tool list', [
                    'data' => [
                        'type' => 'object',
                        'properties' => [
                            'tools' => ['type' => 'array', 'items' => ['$ref' => '#/components/schemas/Tool']],
                            'version'=>['type'=>'string'],
                            'next_offset'=>['type'=>'integer','nullable'=>true],
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
            'description' => 'Executes a discovered tool through the shared business service. Arguments follow inputSchema. Send the required_request_fields as top-level envelope fields, retaining them unchanged for retries. Reusing request_id with different input fails. Notifications require an explicit mail:send grant.',
            'tags'        => ['Tools'],
            'requestBody' => schema_jsonBody([
                'name'      => ['type' => 'string', 'description' => 'Tool name (e.g. "get_business_info", "submit_form")'],
                'arguments' => ['type' => 'object', 'description' => 'Tool arguments matching the tool\'s inputSchema'],
                'version' => ['type'=>'string','description'=>'Reviewed form or Action version, required for writes'],
                'request_id' => ['type'=>'string','description'=>'Stable caller identity, required for writes'],
                'action_id' => ['type'=>'string','description'=>'Exact discovered Action identity'],
            ], ['name','arguments']),
            'responses' => [
                '200' => schema_jsonResponse('Tool execution result'),
                '404' => schema_errorRef('Tool not found'),
                '422' => schema_errorRef('Validation failed'),
                '429' => schema_errorRef('Rate limited (for submit_form)'),
            ],
        ],
    ];

    // ── Prompt Execution ──
    $paths['/prompt'] = [
        'post' => [
            'operationId' => 'queuePrompt',
            'summary'     => 'Queue an AI prompt for background execution',
            'description' => 'Submits a prompt for AI processing. The prompt runs in a detached background worker. Verifies PHP CLI access before allocating a conversation or job, then returns 202 Accepted and a poll URL. Requires the opt-in `prompt:execute` scope.',
            'tags'        => ['Prompt'],
            'requestBody' => schema_jsonBody([
                'prompt'      => ['type' => 'string', 'description' => 'The user prompt text. This is what the AI will process.'],
                'action_type' => [
                    'type' => 'string',
                    'enum' => ['free_prompt', 'edit_page', 'change_design', 'add_section', 'section_edit', 'optimize_aeo', 'inline_edit'],
                    'default' => 'free_prompt',
                    'description' => 'The type of AI action to perform.',
                ],
                'action_data' => ['type' => 'object', 'description' => 'Additional data for the action (e.g. page slug for edit_page)'],
                'page_scope'  => ['type' => 'string', 'nullable' => true, 'description' => 'Scope the prompt to a specific page slug'],
                'continue_from' => ['type' => 'integer', 'nullable' => true, 'description' => 'Prompt ID to continue from (uses its conversation). Must belong to the same API key.'],
            ], ['prompt']),
            'responses' => [
                '202' => schema_jsonResponse('Prompt queued', [
                    'data' => [
                        'type' => 'object',
                        'properties' => [
                            'id'              => ['type' => 'integer', 'description' => 'Prompt log ID'],
                            'conversation_id' => ['type' => 'string', 'description' => 'Conversation UUID'],
                            'status'          => ['type' => 'string', 'enum' => ['queued']],
                            'poll_url'        => ['type' => 'string', 'description' => 'URL to poll for status'],
                        ],
                    ],
                ]),
                '422' => schema_errorRef('Validation error'),
                '503' => schema_errorRef('exec() unavailable (exec_unavailable) or no usable PHP CLI executable (php_cli_unavailable)'),
            ],
        ],
    ];

    $paths['/prompt/{id}'] = [
        'get' => [
            'operationId' => 'getPromptStatus',
            'summary'     => 'Poll prompt execution status',
            'description' => 'Returns the current status of a prompt. Includes results (files modified, tokens, cost) when the prompt has completed. Per-key isolated: only returns prompts created by the authenticated key.',
            'tags'        => ['Prompt'],
            'parameters'  => [
                schema_param('id', 'path', 'integer', 'Prompt log ID', true),
            ],
            'responses' => [
                '200' => schema_jsonResponse('Prompt status', [
                    'data' => ['$ref' => '#/components/schemas/PromptResult'],
                ]),
                '404' => schema_errorRef('Prompt not found or belongs to a different key'),
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
