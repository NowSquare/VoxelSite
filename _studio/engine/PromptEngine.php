<?php

declare(strict_types=1);

namespace VoxelSite;

use RuntimeException;

/**
 * The orchestrator — the central engine that drives every AI interaction.
 *
 * This is the most important class in the system. It coordinates:
 * 1. SiteContext  → reads current website state
 * 2. PromptEngine → assembles system prompt + context + user input
 * 3. AIProvider   → streams the response
 * 4. ResponseParser → extracts file operations
 * 5. RevisionManager → captures before/after for undo
 * 6. FileManager  → writes files to preview
 *
 * The flow is described in Genesis Doc Part VI. Every step must
 * execute in order. A failure at any step must leave the system
 * in a consistent state.
 */
class PromptEngine
{
    private Database $db;
    private Settings $settings;
    private AIProviderInterface $provider;
    private ResponseParser $parser;
    private FileManager $fileManager;
    private RevisionManager $revisionManager;
    private SiteContext $siteContext;
    private ActionRegistry $actionRegistry;
    private bool $headless = false;
    private int $headlessJobId = 0;
    private ?int $activePromptLogId = null;
    private float $lastCancelCheckTime = 0;

    public function __construct(
        ?Database $db = null,
        ?Settings $settings = null,
        ?AIProviderInterface $provider = null,
        ?ResponseParser $parser = null,
        ?FileManager $fileManager = null,
        ?RevisionManager $revisionManager = null,
        ?SiteContext $siteContext = null,
        ?ActionRegistry $actionRegistry = null
    ) {
        $this->db = $db ?? Database::getInstance();
        $this->settings = $settings ?? new Settings($this->db);
        $this->parser = $parser ?? new ResponseParser();
        $this->fileManager = $fileManager ?? new FileManager($this->db);
        $this->revisionManager = $revisionManager ?? new RevisionManager($this->db, $this->settings, $this->fileManager);
        $this->siteContext = $siteContext ?? new SiteContext($this->db, $this->settings, $this->fileManager);
        $this->actionRegistry = $actionRegistry ?? new ActionRegistry();

        // Provider is created lazily or injected
        if ($provider !== null) {
            $this->provider = $provider;
        }
    }

    /**
     * Execute a streaming AI interaction.
     *
     * This is the main entry point. Called from the /ai/prompt endpoint.
     * Sets up SSE headers, streams tokens to the browser, and handles
     * all post-processing when the stream completes.
     *
     * @param array{
     *   action_type?: string,
     *   action_data?: array,
     *   user_prompt: string,
     *   page_scope?: string,
     *   conversation_id?: string,
     *   user_id: int
     * } $request
     */
    public function execute(array $request): void
    {
        $userId = $request['user_id'];
        $userPrompt = $request['user_prompt'];
        $pageScope = $request['page_scope'] ?? null;
        $actionType = $request['action_type'] ?? 'free_prompt';
        $actionData = $request['action_data'] ?? [];
        $conversationId = $request['conversation_id'] ?? null;
        $images = $request['images'] ?? [];
        $promptLogId = $request['prompt_log_id'] ?? null;

        // Headless mode: used by the CLI prompt-runner for Agent API.
        // Skips SSE output, uses pre-allocated prompt_log_id, writes
        // heartbeats to last_progress_at instead of streaming to browser.
        $this->headless = !empty($request['headless']);
        $this->headlessJobId = (int) ($request['prompt_log_id'] ?? 0);

        // Drawn for new sites only (see DesignDirection). Also handed to the design critic.
        $designDirection = null;

        // ── Set up SSE (skipped in headless mode) ──
        if (!$this->headless) {
            $this->beginSSE();
        }

        Logger::info('ai', 'AI stream started', [
            'action_type'     => $actionType,
            'user_prompt'     => mb_substr($userPrompt, 0, 200),
            'page_scope'      => $pageScope,
            'conversation_id' => $conversationId,
            'user_id'         => $userId,
            'image_count'     => count($images),
            'headless'        => $this->headless,
        ]);

        // ── Shutdown safety net ──
        // If the PHP process is killed mid-stream (e.g. PHP-FPM
        // request_terminate_timeout), this ensures:
        //  1. Prompt status is updated from 'streaming' so the UI
        //     doesn't get stuck in an infinite polling loop.
        //  2. style.css fallback exists so pages don't 404 on CSS.
        //  3. Tailwind is compiled from whatever files were written.
        $shutdownDone = false;
        $streamStartTime = microtime(true);
        register_shutdown_function(function () use (&$promptLogId, &$shutdownDone, &$streamStartTime) {
            if ($shutdownDone) {
                return; // Normal completion already handled everything
            }
            try {
                $elapsed = round(microtime(true) - $streamStartTime, 1);
                Logger::warning('ai', 'Shutdown handler fired — process terminated mid-stream', [
                    'prompt_log_id'      => $promptLogId,
                    'elapsed_seconds'    => $elapsed,
                    'connection_aborted' => connection_aborted(),
                    'connection_status'  => connection_status(),
                    'last_error'         => error_get_last(),
                ]);

                // Update prompt status so UI stops polling
                if ($promptLogId !== null) {
                    $db = Database::getInstance();
                    $row = $db->query(
                        'SELECT status FROM prompt_log WHERE id = ? LIMIT 1',
                        [$promptLogId]
                    );
                    if (!empty($row) && ($row[0]['status'] ?? '') === 'streaming') {
                        $db->update('prompt_log', [
                            'status'        => 'partial',
                            'error_message' => 'Process terminated mid-generation. Files written before termination are preserved.',
                        ], 'id = ?', [$promptLogId]);
                    }
                }

                // Ensure style.css exists
                $fm = new FileManager();
                $fm->ensureStyleCssExists();
                $fm->compileTailwind();
            } catch (\Throwable $e) {
                // Last resort — at least try to log
                Logger::critical('ai', 'Shutdown handler itself failed', [
                    'error' => $e->getMessage(),
                ]);
            }
        });

        try {
            // ── Ensure a conversation exists ──
            if (empty($conversationId)) {
                $conversationId = $this->createConversation($userId, $pageScope, $userPrompt);
            } else {
                // Verify the conversation still exists (it may have been deleted by a site reset)
                $exists = $this->db->query(
                    'SELECT id FROM conversations WHERE id = ? AND user_id = ? LIMIT 1',
                    [$conversationId, $userId]
                );

                if (empty($exists)) {
                    // Conversation was deleted — create a fresh one
                    $conversationId = $this->createConversation($userId, $pageScope, $userPrompt);
                } else {
                    // Touch the conversation's updated_at
                    $this->db->update('conversations', [
                        'updated_at' => now(),
                    ], 'id = ? AND user_id = ?', [$conversationId, $userId]);
                }
            }

            // Emit conversation ID immediately so the frontend can persist it
            // before the generation finishes.
            $this->emitSSE('conversation', ['conversation_id' => $conversationId]);

            // Lazy-load provider if not injected
            if (!isset($this->provider)) {
                $this->provider = AIProviderFactory::create($this->settings);
            }
            $configuredModel = $this->getConfiguredModel($this->provider->getId());

            // In headless mode, the prompt_log row was pre-allocated by the API
            // endpoint with status 'queued' — we just need to update it.
            // In interactive mode, create it now so refresh/disconnect won't
            // lose the fact that generation started.
            if ($promptLogId === null) {
                $promptLogId = $this->db->insert('prompt_log', [
                    'conversation_id' => $conversationId,
                    'user_id'         => $userId,
                    'action_type'     => $actionType,
                    'action_data'     => !empty($actionData) ? json_encode($actionData) : null,
                    'user_prompt'     => $userPrompt,
                    'ai_provider'     => $this->provider->getId(),
                    'ai_model'        => $configuredModel !== '' ? $configuredModel : 'unknown',
                    'status'          => 'streaming',
                    'created_at'      => now(),
                ]);
            }

            // Emit prompt_log_id immediately so the client can cancel
            // generation by calling POST /ai/cancel-generation.
            $this->activePromptLogId = $promptLogId;
            $this->emitSSE('prompt_id', ['prompt_id' => $promptLogId]);

            // ── Load system prompt with context budget awareness ──
            // Use the model's actual context window for budget calculations,
            // not the output token limit (ai_max_tokens).
            $maxTokens = (int) $this->settings->get('ai_max_tokens', 32000);

            // Visual editor actions (section_edit, add_section) are single-file
            // operations. They don't need the full 72KB system prompt or 64K
            // output budget — the compact prompt + action addon is sufficient.
            // This reduces input tokens by ~15K and speeds up TTFT dramatically.
            $isVisualEditorAction = in_array($actionType, ['section_edit', 'add_section'], true);

            // Boost output budget for full site generation.
            // Creating a complete website (partials + CSS + JS + 6-10 pages +
            // data files) routinely needs 35-45K tokens. The default 32K
            // almost guarantees truncation, leaving pages missing.
            // Sonnet 4/4.5 supports 64K output — use it when generating sites.
            if (in_array($actionType, ['free_prompt', 'import_site', 'restyle_site'], true) && $maxTokens <= 32000) {
                $maxTokens = 64000;
                Logger::debug('ai', 'Boosted max_tokens for site generation', [
                    'original'  => (int) $this->settings->get('ai_max_tokens', 32000),
                    'boosted'   => $maxTokens,
                ]);
            }

            // Cap visual editor actions — a single page file rarely exceeds 8K tokens.
            // 16K gives generous headroom while avoiding the 32-64K budgets that
            // make the model over-think (and over-generate) for a section tweak.
            if ($isVisualEditorAction && $maxTokens > 16000) {
                $maxTokens = 16000;
            }

            $configuredModelForBudget = $configuredModel !== '' ? $configuredModel : ($this->provider->getModels()[0]['id'] ?? '');
            $contextWindow = $this->provider->getContextWindow($configuredModelForBudget);

            // Visual editor actions use the compact system prompt + their
            // action-specific addon. No need for the full 72KB system.md —
            // that includes site generation rules, multi-page strategies,
            // data layer schemas, etc. that section_edit never uses.
            if ($isVisualEditorAction) {
                $systemPrompt = $this->getDefaultSystemPrompt();
                // Append the action-specific prompt (section_edit.md / add_section.md)
                $actionPromptPath = dirname(__DIR__) . '/prompts/actions/' . $actionType . '.md';
                if (file_exists($actionPromptPath)) {
                    $actionPrompt = trim(file_get_contents($actionPromptPath));
                    if ($actionPrompt !== '') {
                        $systemPrompt .= "\n\n" . $actionPrompt;
                    }
                }
                $systemPrompt .= "\n\n" . $this->getStructuredOutputContract();
            } elseif ($maxTokens <= 8000) {
                // If max_tokens is small (≤8K), use the compact fallback prompt
                // instead of the full 33KB system.md
                $systemPrompt = $this->getDefaultSystemPrompt();
            } else {
                $systemPrompt = $this->loadSystemPrompt($actionType);
            }

            // Calculate context character budget using the model's context window.
            //
            // Formula: available_input = context_window - output_reserved - safety_buffer
            // Then subtract the system prompt to get what's left for site context.
            //
            // Rough estimate: 1 token ≈ 4 characters.
            $systemPromptChars = strlen($systemPrompt);
            $contextWindowChars = $contextWindow * 4;
            $outputReservedChars = $maxTokens * 4;
            $safetyBuffer = 4000; // ~1000 tokens for user prompt + message overhead
            $inputBudgetChars = $contextWindowChars - $outputReservedChars - $safetyBuffer;
            $contextBudget = $inputBudgetChars - $systemPromptChars;

            // Guardrail: if the budget is non-positive (e.g. very small local model),
            // provide a minimal floor for essentials-only context, but NEVER exceed
            // the actual remaining input budget. This prevents overflow on compact models.
            if ($contextBudget < 0) {
                // Floor: enough for site info + design tokens, but capped at reality
                $contextBudget = max(0, min(4000, $inputBudgetChars));
            }

            // Single-file actions edit one file — they don't need
            // 40K of CSS, 25K of icon names, or 20K of image library paths.
            // Cap the context to ~10K tokens so the AI gets the focus page,
            // design tokens, and essential structure — nothing more.
            // Budget: essentials ~13.5K + focus page ~19K = ~33K, so 40K
            // gives a comfortable margin without pulling in irrelevant bulk.
            $isSingleFileAction = $isVisualEditorAction || $actionType === 'inline_edit';
            if ($isSingleFileAction) {
                $contextBudget = min($contextBudget, 40000);
            }

            // ── Import: fetch reference site HTML and reserve budget ──
            // Must happen BEFORE context building so we can subtract the
            // HTML size from the context budget, preventing context overflow.
            $importHtml = null;
            if (in_array($actionType, ['import_site', 'restyle_site'], true) && !empty($actionData['url'])) {
                try {
                    $this->emitSSE('status', ['message' => 'Fetching reference site...']);
                    $importer = new SiteImporter();
                    $importResult = $importer->fetch($actionData['url']);
                    $importHtml = $importResult['html'];

                    Logger::info('ai', 'Reference site fetched', [
                        'url'            => $importResult['url'],
                        'title'          => $importResult['title'],
                        'html_length'    => strlen($importHtml),
                        'internal_links' => count($importResult['internal_links']),
                    ]);
                } catch (RuntimeException $e) {
                    // Import-specific errors — surface to user, don't crash
                    $this->emitSSE('error', [
                        'message' => $e->getMessage(),
                        'code'    => 'import_failed',
                    ]);
                    if ($promptLogId !== null) {
                        $this->db->update('prompt_log', [
                            'status'        => 'error',
                            'error_message' => $e->getMessage(),
                        ], 'id = ?', [$promptLogId]);
                    }
                    $shutdownDone = true;
                    return;
                }

                // Reserve import HTML budget from the context budget.
                // The import HTML will be injected into the user message,
                // so its size must be subtracted from what's available
                // for site context.
                $importHtmlChars = strlen($importHtml) + 200; // +200 for wrapper text

                // Minimum context for site info on imports, but capped at reality
                $minContextForImport = min(2000, $contextBudget);
                $availableForImport = $contextBudget - $minContextForImport;

                // Clamp import HTML to whatever actually fits in the budget.
                // Three scenarios:
                //   1. importHtml fits alongside minContext → no truncation
                //   2. importHtml exceeds availableForImport → truncate, keep minContext
                //   3. contextBudget is tiny → truncate importHtml to contextBudget, zero context
                if ($importHtmlChars > $contextBudget) {
                    // Scenario 3: model too small — import gets everything, context gets nothing
                    $importHtml = substr($importHtml, 0, max(0, $contextBudget - 200));
                    $importHtml .= "\n<!-- HTML truncated to fit model context -->";
                    $importHtmlChars = strlen($importHtml) + 200;
                } elseif ($importHtmlChars > $availableForImport && $availableForImport > 0) {
                    // Scenario 2: truncate import to fit, leaving room for minContext
                    $importHtml = substr($importHtml, 0, max(0, $availableForImport - 200));
                    $importHtml .= "\n<!-- HTML truncated to fit model context -->";
                    $importHtmlChars = strlen($importHtml) + 200;
                }
                // Scenario 1: importHtml fits → no changes needed

                $contextBudget = max(0, $contextBudget - $importHtmlChars);

                Logger::debug('ai', 'Import HTML budget reserved', [
                    'import_html_chars' => $importHtmlChars,
                    'adjusted_budget'   => $contextBudget,
                ]);
            }

            // ── Build context — read the actual current state of the website ──
            // import_site: null scope (site-level info only — design comes from reference HTML)
            // restyle_site: '__all__' scope (include ALL current page files so the AI
            //   can preserve content while transforming visual design)
            // everything else: passed through from client (page-specific or null)
            if ($actionType === 'restyle_site') {
                $effectivePageScope = '__all__';
            } elseif ($actionType === 'import_site') {
                $effectivePageScope = null;
            } else {
                $effectivePageScope = $pageScope;
            }

            // Normalize: the visual editor sends filenames ('index.php', 'about.php')
            // but SiteContext::buildFocusPage() expects slugs ('index', 'about').
            // Strip trailing .php so the focus page is found correctly.
            if ($effectivePageScope !== null
                && $effectivePageScope !== '__all__'
                && str_ends_with($effectivePageScope, '.php')
            ) {
                $effectivePageScope = basename($effectivePageScope, '.php');
            }
            $this->emitSSE('status', ['message' => 'Reading your site...']);
            $contextResult = $this->siteContext->build($effectivePageScope, $conversationId, $userId, $contextBudget, $actionType);
            $context = $contextResult['context'];
            $contextMetrics = $contextResult['metrics'];

            // ── Design direction (new sites only) ──
            // Variety has to come from outside the model. Draw a direction
            // brief and append it to the context so it sits directly before
            // the user's request. Edits, imports and restyles never get one:
            // the existing site or the reference is their direction.
            if ($this->shouldDrawDesignDirection($actionType)) {
                $designDirection = DesignDirection::draw([
                    'style'  => (string) ($actionData['style'] ?? ''),
                    'memory' => $this->readMemoryForDirection(),
                ]);
                $context = rtrim($context) . "\n\n" . $designDirection['rendered'];

                Logger::info('ai', 'Design direction drawn', [
                    'seed'    => $designDirection['seed'],
                    'choices' => $designDirection['ids'],
                    'style'   => (string) ($actionData['style'] ?? ''),
                ]);

                // Persist the draw with the prompt so a result can be traced
                // back to its brief.
                if ($promptLogId !== null) {
                    try {
                        $persisted = $actionData;
                        $persisted['design_direction'] = ['seed' => $designDirection['seed']] + $designDirection['ids'];
                        $this->db->update('prompt_log', [
                            'action_data' => json_encode($persisted),
                        ], 'id = ?', [$promptLogId]);
                    } catch (\Throwable $e) {
                        Logger::warning('ai', 'Could not persist design direction', ['error' => $e->getMessage()]);
                    }
                }
            }

            Logger::debug('ai', 'Context built', [
                'context_length'    => strlen($context),
                'context_budget'    => $contextBudget,
                'budget_used_pct'   => $contextMetrics['budget_used_pct'],
                'context_window'    => $contextWindow,
                'system_prompt_len' => $systemPromptChars,
                'max_tokens'        => $maxTokens,
                'model'             => $configuredModel,
                'provider'          => $this->provider->getId(),
                'sections'          => $contextMetrics['sections'],
                'trimmed'           => $contextMetrics['trimmed'],
                'focus_page_chars'  => $contextMetrics['focus_page_chars'],
                'history_chars'     => $contextMetrics['history_chars'],
            ]);

            // ── Build messages array ──
            $messages = $this->buildMessages(
                $userPrompt,
                $context,
                $conversationId,
                $userId,
                $actionType,
                $actionData,
                $images,
                $importHtml
            );

            // ── Stream the response ──
            $this->emitSSE('status', ['message' => 'Generating...']);

            Logger::info('ai', 'Calling provider->stream', [
                'provider'   => $this->provider->getId(),
                'model'      => $configuredModel,
                'max_tokens' => $maxTokens,
                'msg_count'  => count($messages),
            ]);

            $fullResponse = '';
            $completedPaths = [];
            $beforeStateByPath = [];
            $operationErrors = [];
            $usage = [];
            $lastTokenTime = microtime(true);
            $tailwindCompiledOnce = false; // Debounce: only compile once mid-stream

            // Reset incremental parser cursor from any previous stream.
            $this->parser->resetStreamState();

            $this->provider->stream(
                $systemPrompt,
                $messages,

                // onToken: stream each chunk to the browser
                function (string $token) use (&$fullResponse, &$completedPaths, &$lastTokenTime, &$beforeStateByPath, &$tailwindCompiledOnce, &$tokenCount) {
                    // Check for user cancellation every 50 tokens (throttled to
                    // at most once per second to avoid hammering the DB).
                    $tokenCount = ($tokenCount ?? 0) + 1;
                    if ($tokenCount % 50 === 0) {
                        if ($this->isCancelled()) {
                            throw new RuntimeException('generation_cancelled');
                        }
                    }

                    $fullResponse .= $token;
                    $this->emitSSE('token', ['content' => $token]);
                    $lastTokenTime = microtime(true);

                    // Check for completed file blocks during streaming
                    $newCompleted = $this->parser->parseStreaming($fullResponse);
                    foreach ($newCompleted as $file) {
                        if (!in_array($file['path'], $completedPaths, true)) {
                            $completedPaths[] = $file['path'];

                            // Capture the original file state before the first streamed operation.
                            // This preserves correct undo behavior even with progressive writes.
                            if (!array_key_exists($file['path'], $beforeStateByPath)) {
                                $beforeStateByPath[$file['path']] = $this->fileManager->readFile($file['path']);
                            }

                            if ($file['action'] === 'delete') {
                                // Progressive delete: remove file immediately
                                $this->fileManager->deleteFile($file['path']);

                                Logger::info('ai', 'Progressive file delete', [
                                    'path' => $file['path'],
                                ]);

                                $this->emitSSE('file_complete', [
                                    'path'   => $file['path'],
                                    'action' => 'delete',
                                ]);

                                $pageName = pathinfo($file['path'], PATHINFO_FILENAME);
                                $this->emitSSE('status', [
                                    'message' => 'Removed ' . $pageName . ' page...',
                                ]);
                            } else {
                                // Skip virtual paths (like __section_snippet__) —
                                // they'll be transformed during post-processing.
                                if (str_starts_with($file['path'], '__')) {
                                    continue;
                                }

                                // Progressive preview: write file immediately.
                                // Wrapped in try/catch so a single file write failure
                                // (e.g. path resolution issue on Nginx servers) does not
                                // abort the entire cURL stream. The file will be retried
                                // during post-stream executeOperations().
                                try {
                                    $warning = $this->fileManager->writeFile($file['path'], $file['content']);

                                    Logger::info('ai', 'Progressive file write', [
                                        'path'           => $file['path'],
                                        'content_length' => strlen($file['content']),
                                        'has_warning'    => $warning !== null,
                                        'warning'        => $warning,
                                    ]);

                                    // Compile Tailwind after EVERY PHP/CSS file write.
                                    // The process can be killed mid-stream (SIGKILL) at
                                    // any moment — each write must leave tailwind.css
                                    // in a usable state so the site has CSS even if the
                                    // stream is interrupted. The compiler is fast (<500ms).
                                    if (str_ends_with($file['path'], '.php') || str_ends_with($file['path'], '.css')) {
                                        $compileResult = $this->fileManager->compileTailwind();
                                        $twPath = dirname(__DIR__, 2) . '/assets/css/tailwind.css';
                                        Logger::info('files', 'Mid-stream Tailwind compile', [
                                            'trigger'     => $file['path'],
                                            'success'     => $compileResult['ok'] ?? false,
                                            'class_count' => $compileResult['class_count'] ?? 0,
                                            'output_size' => file_exists($twPath) ? filesize($twPath) : 0,
                                        ]);
                                    }

                                    $this->emitSSE('file_complete', [
                                        'path'   => $file['path'],
                                        'action' => 'write',
                                    ]);

                                    // Emit status narration
                                    $pageName = pathinfo($file['path'], PATHINFO_FILENAME);
                                    $this->emitSSE('status', [
                                        'message' => 'Created ' . $pageName . ' page...',
                                    ]);
                                } catch (\Throwable $writeErr) {
                                    Logger::error('ai', 'Progressive file write FAILED', [
                                        'path'      => $file['path'],
                                        'error'     => $writeErr->getMessage(),
                                        'trace'     => $writeErr->getTraceAsString(),
                                    ]);
                                    // Continue streaming — don't abort the whole generation
                                }
                            }
                        }
                    }
                },

                // onComplete: use the provider's processed response
                // For structured output (tool use), the provider normalizes
                // the accumulated tool arguments into clean JSON and passes
                // it here. We must use that instead of the raw token stream.
                function (string $response, array $usageData) use (&$fullResponse, &$usage) {
                    $usage = $usageData;
                    if ($response !== '') {
                        $fullResponse = $response;
                    }
                },

                [
                    'model'      => $configuredModel,
                    'max_tokens' => $maxTokens,
                    // Structured output (tool use) is deliberately DISABLED.
                    // When PHP code is embedded inside JSON strings, the AI
                    // must handle two layers of escaping simultaneously and
                    // frequently generates broken syntax. The <file> tag
                    // format avoids this entirely — the AI outputs raw PHP
                    // between XML-like tags with zero escaping required.
                    // The ResponseParser handles both formats as fallback.
                    'structured_output' => false,
                ]
            );

            // ── Parse the complete response ──
            $parsed = $this->parser->parse($fullResponse);

            // ── add_section snippet insertion ──
            // When the AI returns a __section_snippet__ instead of the full file,
            // we surgically insert the snippet into the target file ourselves.
            // This is 5-6x faster because the AI only outputs ~2K tokens instead of ~12K.
            if ($actionType === 'add_section' && !empty($actionData['path'])) {
                $parsed['operations'] = $this->transformSectionSnippet(
                    $parsed['operations'],
                    $actionData
                );
            }

            // ── section_edit snippet replacement ──
            // Same virtual path (__section_snippet__), different transform:
            // the AI returns only the modified section, and we replace the
            // original section HTML (sent as actionData.sectionHtml) in the
            // target file. Reduces output tokens by ~85%.
            if ($actionType === 'section_edit' && !empty($actionData['path'])) {
                $parsed['operations'] = $this->transformSectionEditSnippet(
                    $parsed['operations'],
                    $actionData
                );
            }

            // ── inline_edit snippet replacement ──
            // When the user selects code in Monaco and uses Cmd+K, the AI
            // returns only the replacement snippet (__inline_snippet__).
            // We swap it into the file at the selection position.
            // Reduces output tokens by ~95% for selection-based edits.
            if ($actionType === 'inline_edit' && !empty($actionData['selection'])) {
                $parsed['operations'] = $this->transformInlineEditSnippet(
                    $parsed['operations'],
                    $actionData
                );
            }

            Logger::info('ai', 'Response parsed', [
                'operation_count' => count($parsed['operations']),
                'warning_count'   => count($parsed['warnings']),
                'message_length'  => strlen($parsed['message']),
                'response_length' => strlen($fullResponse),
                'operations'      => array_map(fn($op) => $op['path'] . ' (' . $op['action'] . ')', $parsed['operations']),
            ]);

            // Check if the AI performed knowledge extraction
            $hasMemoryMerge = false;
            $hasDIMerge = false;
            foreach ($parsed['operations'] as $op) {
                if ($op['path'] === 'assets/data/memory.json') $hasMemoryMerge = true;
                if ($op['path'] === 'assets/data/design-intelligence.json') $hasDIMerge = true;
            }

            Logger::info('ai', 'Knowledge extraction check', [
                'action_type'     => $actionType,
                'memory_merge'    => $hasMemoryMerge,
                'di_merge'        => $hasDIMerge,
                'user_prompt_len' => strlen($userPrompt),
            ]);

            // ── Check for cancellation before post-processing ──
            if ($this->isCancelled()) {
                Logger::info('ai', 'Generation cancelled after streaming — rolling back', [
                    'prompt_log_id' => $promptLogId,
                    'files_written' => count($beforeStateByPath),
                ]);
                $rolledBack = $this->rollbackProgressiveWrites($beforeStateByPath);
                if ($rolledBack > 0) {
                    $this->fileManager->compileTailwind();
                }
                $shutdownDone = true;
                $this->emitSSE('done', [
                    'cancelled'      => true,
                    'files_modified' => [],
                    'message'        => 'Generation cancelled.',
                    'rolled_back'    => $rolledBack,
                ]);
                return;
            }

            // ── Create revision (before state already captured during streaming) ──
            $revisionId = null;
            if (!empty($parsed['operations'])) {
                $description = $this->generateRevisionDescription($userPrompt, $parsed['operations']);

                $this->emitSSE('status', ['message' => 'Saving revision...']);

                // Capture before state (for files not yet written during streaming)
                $revisionId = $this->revisionManager->createRevision(
                    $parsed['operations'],
                    $description,
                    $userId,
                    null,
                    $beforeStateByPath
                );

                // Write any remaining files not written during streaming
                $this->emitSSE('status', ['message' => 'Writing files...']);
                $result = $this->fileManager->executeOperations($parsed['operations']);

                Logger::info('files', 'File operations executed', [
                    'written'  => $result['written'] ?? [],
                    'deleted'  => $result['deleted'] ?? [],
                    'errors'   => $result['errors'] ?? [],
                    'warnings' => $result['warnings'] ?? [],
                ]);
                $operationErrors = $result['errors'] ?? [];
                foreach ($operationErrors as $operationError) {
                    Logger::warning('files', 'File operation reported an error', ['error' => $operationError]);
                    $this->emitSSE('warning', ['message' => "File apply issue: {$operationError}"]);
                }

                // Validate data-lucide icon names against assets/icons/.
                // Logs unresolved names for supportability. Does not block the pipeline.
                $writtenPaths = $result['written'] ?? [];
                if (!empty($writtenPaths)) {
                    $iconValidation = $this->fileManager->validateIconNames($writtenPaths);
                    if (!empty($iconValidation['missing'])) {
                        $missingNames = array_keys($iconValidation['missing']);
                        Logger::warning('ai', 'AI used unresolved icon names', [
                            'missing' => $missingNames,
                            'valid'   => $iconValidation['valid'],
                        ]);
                    }
                }

                // Auto-repair PHP syntax errors via a focused AI call.
                // The same model that generated the bug fixes it — a small,
                // non-streaming call with just the broken file + error message.
                // CRITICAL: Wrapped in try-catch because repair is non-critical.
                // A repair failure must NEVER roll back the entire generation.
                $phpWarnings = $result['warnings'] ?? [];
                if (!empty($phpWarnings)) {
                    Logger::warning('ai', 'PHP syntax errors detected, attempting auto-repair', [
                        'warnings' => $phpWarnings,
                        'model'    => $configuredModel,
                    ]);
                    try {
                        $repairResults = $this->repairBrokenPhpFiles($phpWarnings, $configuredModel);
                        Logger::info('ai', 'Auto-repair results', $repairResults);
                        foreach ($repairResults['repaired'] as $msg) {
                            $this->emitSSE('status', ['message' => $msg]);
                        }
                        foreach ($repairResults['failed'] as $msg) {
                            $this->emitSSE('warning', ['message' => $msg]);
                        }
                    } catch (\Throwable $repairEx) {
                        Logger::error('ai', 'Auto-repair failed (non-fatal)', [
                            'exception' => $repairEx->getMessage(),
                            'warnings'  => $phpWarnings,
                        ]);
                        $this->emitSSE('warning', [
                            'message' => 'Could not auto-repair PHP syntax error — the file may need manual fixes.',
                        ]);
                    }
                }

                // Compile Tailwind CSS from preview files.
                $this->emitSSE('status', ['message' => 'Compiling styles...']);
                $this->fileManager->compileTailwind();

                // Ensure style.css exists — if the AI response was truncated
                // (token limit hit before CSS file was generated), the <head>
                // links to /assets/css/style.css which 404s on Nginx servers.
                // Create a minimal fallback so the site has basic styling.
                $this->fileManager->ensureStyleCssExists();

                // Ensure shipped JS assets are deployed unconditionally.
                // These files must exist on disk for the published site to work —
                // the AI is told NOT to generate them, so ensureShipped*() is the
                // only mechanism that puts them in assets/js/.
                $this->fileManager->ensureShippedNavigation();
                $this->fileManager->ensureShippedIconResolver();
                $this->fileManager->injectIconResolverIntoFooter();
                $this->fileManager->versionShippedScripts();

                // Capture after state
                $this->emitSSE('status', ['message' => 'Finalizing...']);
                $this->revisionManager->captureAfterState($revisionId, $parsed['operations']);

                // Sync page registry
                $this->fileManager->syncPageRegistry();

                // Integrity check: verify every page linked in the nav exists.
                // Catches broken links caused by truncation, AI oversight, or
                // manual deletions — regardless of root cause.
                $missingNavPages = $this->findMissingNavPages();
                if (!empty($missingNavPages)) {
                    Logger::warning('ai', 'Navigation references missing pages', [
                        'missing' => $missingNavPages,
                    ]);
                }

                // Auto-regenerate AEO files (llms.txt, robots.txt, mcp.php, schema.php)
                // when data-layer files were modified. This keeps AEO content in sync
                // with every AI edit — not just on publish.
                $this->autoRegenerateAEO($parsed['operations']);

                // ── Post-generation quality evaluation ──
                // Runs only when opted in via Settings → AI Provider → Review.
                // Uses a separate non-streaming AI call with structured output
                // to check for broken links, missing alt text, heading errors, etc.
                // Results are emitted via SSE so the frontend can surface them.
                // The evaluator is advisory — exceptions return empty issues and
                // never block the pipeline.
                if ($this->settings->get('evaluator_enabled', false)) {
                    try {
                        $this->emitSSE('status', ['message' => 'Reviewing quality...']);

                        // Build files map from write operations (skip deletes)
                        $evalFiles = [];
                        foreach ($parsed['operations'] as $op) {
                            if (($op['action'] ?? '') !== 'delete' && isset($op['content'])) {
                                $evalFiles[$op['path']] = $op['content'];
                            }
                        }

                        if (!empty($evalFiles)) {
                            // Merge preview pages + shipped root files that the AI
                            // legitimately references (e.g. submit.php form handler).
                            // Without this, the evaluator flags shipped files as
                            // broken links — a false positive.
                            $existingPages = array_column(
                                $this->fileManager->listPreviewFiles(), 'path'
                            );
                            $shippedRootFiles = ['submit.php'];
                            $rootDir = dirname(dirname(__DIR__));
                            foreach ($shippedRootFiles as $shipped) {
                                if (file_exists($rootDir . '/' . $shipped)) {
                                    $existingPages[] = $shipped;
                                }
                            }

                            $evaluator = new EvaluatorEngine($this->provider);
                            $evalResult = $evaluator->evaluate(
                                $evalFiles,
                                $this->fileManager->readFile('assets/css/style.css') ?? '',
                                $existingPages,
                                ['model' => $configuredModel]
                            );

                            $evalIssues = $evalResult['issues'] ?? [];
                            if (!empty($evalIssues)) {
                                Logger::info('evaluator', 'Post-generation review found issues', [
                                    'count' => count($evalIssues),
                                    'severities' => array_count_values(array_column($evalIssues, 'severity')),
                                ]);

                                $this->emitSSE('evaluation', [
                                    'issues' => $evalIssues,
                                ]);

                                // Persist for history reload
                                $storedEvalIssues = json_encode($evalIssues);
                            }
                        }
                    } catch (\Throwable $evalError) {
                        // Advisory only — never block generation
                        Logger::warning('evaluator', 'Post-generation evaluation failed (non-blocking)', [
                            'error' => $evalError->getMessage(),
                        ]);
                    }
                }
            }

            // ── Log to prompt_log ──
            $cost = $this->provider->estimateCost(
                $usage['input_tokens'] ?? 0,
                $usage['output_tokens'] ?? 0,
                $usage['model'] ?? 'claude-sonnet-4-5-20250514'
            );

            $logPayload = [
                'revision_id'        => $revisionId,
                'system_prompt_hash' => md5($systemPrompt),
                'ai_response'        => $fullResponse,
                'ai_provider'        => $this->provider->getId(),
                'ai_model'           => $usage['model'] ?? 'unknown',
                'files_modified'     => !empty($parsed['operations'])
                    ? json_encode(array_map(fn($op) => $op['path'], $parsed['operations']))
                    : null,
                'tokens_input'       => $usage['input_tokens'] ?? null,
                'tokens_output'      => $usage['output_tokens'] ?? null,
                'cost_estimate'      => $cost['total_cost'],
                'duration_ms'        => $usage['duration_ms'] ?? null,
                'status'             => empty($operationErrors) ? 'success' : 'partial',
                'error_message'      => empty($operationErrors) ? null : implode("\n", $operationErrors),
                'evaluation_issues'  => $storedEvalIssues ?? null,
            ];

            if ($promptLogId !== null) {
                $this->db->update('prompt_log', $logPayload, 'id = ?', [$promptLogId]);
            } else {
                // Defensive fallback if early streaming row could not be created.
                $promptLogId = $this->db->insert('prompt_log', [
                    'conversation_id'    => $conversationId,
                    'user_id'            => $userId,
                    'action_type'        => $actionType,
                    'action_data'        => !empty($actionData) ? json_encode($actionData) : null,
                    'user_prompt'        => $userPrompt,
                    'created_at'         => now(),
                ] + $logPayload);
            }

            // Update revision with prompt_log_id
            if ($revisionId !== null) {
                $this->db->update('revisions', [
                    'prompt_log_id' => $promptLogId,
                ], 'id = ?', [$revisionId]);
            }

            // ── Emit warnings ──
            foreach ($parsed['warnings'] as $warning) {
                Logger::warning('parser', 'Response warning', ['warning' => $warning]);
                $this->emitSSE('warning', ['message' => $warning]);
            }

            // ── Done ──
            $filesModified = array_map(function ($op) {
                return ['path' => $op['path'], 'action' => $op['action']];
            }, $parsed['operations']);

            // Check for truncation (AI hit token limit mid-file)
            $isTruncated = !empty($parsed['warnings']) && 
                array_filter($parsed['warnings'], fn($w) => str_contains($w, 'truncat'));

            // Combine truncation + nav integrity: if the response was truncated
            // OR the nav references pages that don't exist, include the specific
            // missing files so the frontend can auto-continue with a targeted prompt.
            $missingFiles = $missingNavPages ?? [];

            Logger::info('ai', 'AI stream completed', [
                'files_modified'  => count($filesModified),
                'revision_id'     => $revisionId,
                'conversation_id' => $conversationId,
                'partial'         => !empty($operationErrors),
                'tokens_in'       => $usage['input_tokens'] ?? 0,
                'tokens_out'      => $usage['output_tokens'] ?? 0,
                'cost'            => $cost['total_cost'],
                'truncated'       => !empty($isTruncated),
                'missing_files'   => $missingFiles,
                'duration_ms'     => $usage['duration_ms'] ?? null,
            ]);

            // Mark shutdown as done so the safety net doesn't fire
            $shutdownDone = true;

            $this->emitSSE('done', [
                'files_modified'  => $filesModified,
                'message'         => $parsed['message'],
                'revision_id'     => $revisionId,
                'conversation_id' => $conversationId,
                'partial'         => !empty($operationErrors),
                'tokens'          => [
                    'input'  => $usage['input_tokens'] ?? 0,
                    'output' => $usage['output_tokens'] ?? 0,
                ],
                'cost'            => $cost['total_cost'],
                'truncated'       => !empty($isTruncated),
                'missing_files'   => $missingFiles,
            ]);

        } catch (RuntimeException $e) {
            $shutdownDone = true; // Error handled, don't double-process

            // ── Cancellation: roll back and exit cleanly ──
            if ($e->getMessage() === 'generation_cancelled' || $this->isCancelled()) {
                Logger::info('ai', 'Generation cancelled — rolling back progressive writes', [
                    'prompt_log_id' => $promptLogId,
                    'files_written' => count($beforeStateByPath),
                ]);
                $rolledBack = $this->rollbackProgressiveWrites($beforeStateByPath);
                if ($rolledBack > 0) {
                    $this->fileManager->compileTailwind();
                }
                // Update status to cancelled (the cancel endpoint may have
                // already set 'error' — this is fine, idempotent)
                if ($promptLogId !== null) {
                    $this->db->update('prompt_log', [
                        'status'        => 'error',
                        'error_message' => 'Generation was cancelled.',
                    ], 'id = ?', [$promptLogId]);
                }
                $this->emitSSE('done', [
                    'cancelled'      => true,
                    'files_modified' => [],
                    'message'        => 'Generation cancelled.',
                    'rolled_back'    => $rolledBack,
                ]);
                return;
            }

            $elapsed = round(microtime(true) - $streamStartTime, 1);
            Logger::error('ai', 'RuntimeException during AI stream', [
                'exception'          => $e->getMessage(),
                'elapsed_seconds'    => $elapsed,
                'file'               => $e->getFile() . ':' . $e->getLine(),
                'connection_aborted' => connection_aborted(),
                'user_prompt'        => mb_substr($userPrompt, 0, 200),
                'action_type'        => $actionType,
                'conversation_id'    => $conversationId,
                'prompt_log_id'      => $promptLogId,
                'trace'              => $e->getTraceAsString(),
            ]);
            $rolledBack = $this->rollbackProgressiveWrites($beforeStateByPath);
            if ($rolledBack > 0) {
                Logger::info('ai', 'Rolled back progressive writes', ['count' => $rolledBack]);
                $this->emitSSE('status', [
                    'message' => "Reverted {$rolledBack} file(s) changed before the error.",
                ]);
            }
            $this->handleStreamError(
                $e,
                $userId,
                $conversationId ?? null,
                $promptLogId,
                $userPrompt,
                $rolledBack > 0
            );
        } catch (\Throwable $e) {
            $shutdownDone = true; // Error handled, don't double-process
            $elapsed = round(microtime(true) - $streamStartTime, 1);
            Logger::critical('ai', 'Unhandled exception during AI stream', [
                'exception'          => get_class($e),
                'message'            => $e->getMessage(),
                'elapsed_seconds'    => $elapsed,
                'file'               => $e->getFile() . ':' . $e->getLine(),
                'connection_aborted' => connection_aborted(),
                'user_prompt'        => mb_substr($userPrompt, 0, 200),
                'action_type'        => $actionType,
                'conversation_id'    => $conversationId,
                'prompt_log_id'      => $promptLogId,
                'trace'              => $e->getTraceAsString(),
            ]);

            if ($promptLogId !== null) {
                $this->db->update('prompt_log', [
                    'status'        => 'error',
                    'error_message' => $e->getMessage(),
                ], 'id = ?', [$promptLogId]);
            } else {
                $this->db->insert('prompt_log', [
                    'conversation_id' => $conversationId,
                    'user_id'         => $userId,
                    'action_type'     => $actionType,
                    'action_data'     => !empty($actionData) ? json_encode($actionData) : null,
                    'user_prompt'     => $userPrompt,
                    'ai_provider'     => isset($this->provider) ? $this->provider->getId() : 'unknown',
                    'ai_model'        => isset($this->provider)
                        ? ($this->getConfiguredModel($this->provider->getId()) ?: 'unknown')
                        : 'unknown',
                    'status'          => 'error',
                    'error_message'   => $e->getMessage(),
                    'created_at'      => now(),
                ]);
            }

            // ── Roll back any progressive writes that happened before the error ──
            $rolledBack = $this->rollbackProgressiveWrites($beforeStateByPath);
            if ($rolledBack > 0) {
                Logger::info('ai', 'Rolled back progressive writes after crash', ['count' => $rolledBack]);
                $this->emitSSE('status', [
                    'message' => "Reverted {$rolledBack} file(s) changed before the error.",
                ]);
            }

            $this->emitSSE('error', [
                'message' => $rolledBack > 0
                    ? 'An error occurred. Changes made before the failure have been reverted.'
                    : 'An unexpected error occurred. Your site is safe — nothing was changed.',
                'code'    => 'internal_error',
            ]);
        }

        // Probabilistic cleanup: ~5% of requests prune old logs.
        // This prevents the prompt_log table from growing unbounded
        // without adding latency to every AI request.
        if (random_int(1, 20) === 1) {
            $this->pruneOldPromptLogs($userId);
        }
    }

    /**
     * Load and assemble the system prompt.
     *
     * Combines the master prompt with action-specific additions.
     * The master prompt lives at _studio/prompts/system.md.
     */
    private function loadSystemPrompt(string $actionType): string
    {
        $promptsPath = dirname(__DIR__) . '/prompts';
        $customPromptsPath = dirname(__DIR__) . '/custom_prompts';

        // Determine system prompt source — with diagnostic logging for Forge debugging
        $promptSource = 'default_fallback';
        $masterPath = null;

        if (file_exists($customPromptsPath . '/system.md')) {
            $masterPath = $customPromptsPath . '/system.md';
            $promptSource = 'custom_prompts';
        } elseif (file_exists($promptsPath . '/system.md')) {
            $masterPath = $promptsPath . '/system.md';
            $promptSource = 'prompts';
        }

        if ($masterPath !== null) {
            $systemPrompt = file_get_contents($masterPath);
            if ($systemPrompt === false || $systemPrompt === '') {
                $promptSource = 'default_fallback (read failed)';
                $systemPrompt = $this->getDefaultSystemPrompt();
            }
        } else {
            $systemPrompt = $this->getDefaultSystemPrompt();
        }

        // Action-specific addition
        $actionSource = 'none';
        $actionPath = null;

        if (file_exists($customPromptsPath . '/actions/' . $actionType . '.md')) {
            $actionPath = $customPromptsPath . '/actions/' . $actionType . '.md';
            $actionSource = 'custom_prompts';
        } elseif (file_exists($promptsPath . '/actions/' . $actionType . '.md')) {
            $actionPath = $promptsPath . '/actions/' . $actionType . '.md';
            $actionSource = 'prompts';
        }

        if ($actionPath !== null) {
            $actionPrompt = trim((string) file_get_contents($actionPath));
            if ($actionPrompt !== '') {
                $systemPrompt .= "\n\n" . $actionPrompt;
            }
        }

        Logger::debug('ai', 'System prompt loaded', [
            'prompt_source' => $promptSource,
            'action_type'   => $actionType,
            'action_source' => $actionSource,
            'prompts_path'  => $promptsPath,
            'prompts_exist' => is_dir($promptsPath),
            'master_path'   => $masterPath,
            'prompt_length' => strlen($systemPrompt),
        ]);

        // Provider-agnostic output contract: <message> plus <file> tags, appended
        // last so it is the most recent instruction the model reads. It must
        // agree with system.md — never state a rule here that system.md contradicts.
        $systemPrompt .= "\n\n" . $this->getStructuredOutputContract();

        return $systemPrompt;
    }

    /**
     * Build the messages array for the AI call.
     *
     * Combines context, conversation history, and the current
     * user prompt into the messages format expected by the provider.
     *
     * If an action type is specified and the ActionRegistry has
     * a prompt builder for it, the user's free-form prompt is
     * enriched with structured action data (from wizard steps
     * or quick-prompt buttons).
     */
    private function buildMessages(
        string $userPrompt,
        string $context,
        ?string $conversationId,
        int $userId,
        string $actionType,
        array $actionData,
        array $images = [],
        ?string $importHtml = null
    ): array {
        $messages = [];

        // Strip [vx-img:...] and [vx-ref:...] persistence markers before AI consumption.
        // These markers are for frontend display only — never sent to the model.
        $cleanPrompt = self::stripVxMarkers($userPrompt);

        // Enrich the user prompt with structured action data.
        $enrichedPrompt = $this->actionRegistry->buildPromptContext(
            $actionType,
            $cleanPrompt,
            $actionData
        );

        // ── Load conversation history as proper message pairs ──
        // This gives the AI real multi-turn context instead of a text summary.
        if (!empty($conversationId)) {
            $history = $this->db->query(
                "SELECT user_prompt, ai_response
                 FROM prompt_log
                 WHERE conversation_id = ? AND user_id = ? AND status = 'success'
                 ORDER BY created_at ASC
                 LIMIT 10",
                [$conversationId, $userId]
            );

            foreach ($history as $entry) {
                $messages[] = [
                    'role'    => 'user',
                    'content' => self::stripVxMarkers($entry['user_prompt']),
                ];
                if (!empty($entry['ai_response'])) {
                    // Keep only assistant-facing narrative for context continuity.
                    $assistantContent = $this->parser->extractAssistantMessage((string) $entry['ai_response']);
                    // Truncate to avoid blowing context window
                    if (mb_strlen($assistantContent) > 500) {
                        $assistantContent = mb_substr($assistantContent, 0, 500) . '...';
                    }
                    $messages[] = [
                        'role'    => 'assistant',
                        'content' => $assistantContent,
                    ];
                }
            }
        }

        // ── Add current context + user prompt as the final message ──
        $textContent = !empty($context)
            ? $context . "\n\n---\n\n"
            : '';

        // Inject fetched HTML for import actions (between context and prompt)
        if ($importHtml !== null) {
            $textContent .= "=== REFERENCE SITE HTML ===\n"
                . "The following is the cleaned HTML of the reference website. "
                . "Extract the design language from this HTML.\n\n"
                . $importHtml
                . "\n\n---\n\n";
        }

        $textContent .= $enrichedPrompt;

        // When images are attached, build a multi-content message block
        // that all major providers support (Claude, OpenAI, Gemini).
        if (!empty($images)) {
            $contentBlocks = [
                ['type' => 'text', 'text' => $textContent],
            ];

            foreach ($images as $img) {
                $contentBlocks[] = [
                    'type'   => 'image',
                    'source' => [
                        'type'       => 'base64',
                        'media_type' => $img['media_type'],
                        'data'       => $img['data'],
                    ],
                ];
            }

            $messages[] = [
                'role'    => 'user',
                'content' => $contentBlocks,
            ];
        } else {
            $messages[] = [
                'role'    => 'user',
                'content' => $textContent,
            ];
        }

        return $messages;
    }

    /**
     * Strip all [vx-*:...] persistence markers from a prompt.
     *
     * The frontend embeds these for chat history display:
     *   [vx-img:data:image/...;base64,...] — thumbnail previews
     *   [vx-ref:https://...]               — attached web reference URL
     *
     * The AI should never see them — images arrive via multi-content blocks,
     * and references are passed in action_data. Strip both and trim.
     */
    public static function stripVxMarkers(string $text): string
    {
        // Strip image thumbnails
        $text = preg_replace('/\[vx-img:data:image\/[^;]+;base64,[A-Za-z0-9+\/=]+\]/', '', $text);
        // Strip web reference URLs
        $text = preg_replace('/\[vx-ref:https?:\/\/[^\]]+\]/', '', $text);
        return trim($text);
    }

    /**
     * Create a new conversation record.
     *
     * Generates a UUID for the conversation ID and inserts
     * a row into the conversations table. Returns the new ID.
     */
    private function createConversation(int $userId, ?string $pageScope, string $userPrompt): string
    {
        $id = $this->generateUuid();
        $cleanTitle = self::stripVxMarkers($userPrompt);
        $title = mb_substr($cleanTitle, 0, 60);
        if (mb_strlen($cleanTitle) > 60) {
            $title .= '...';
        }

        $this->db->insert('conversations', [
            'id'         => $id,
            'user_id'    => $userId,
            'title'      => $title,
            'page_scope' => $pageScope,
            'is_active'  => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }

    /**
     * Generate a UUID v4.
     */
    private function generateUuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // Version 4
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // Variant 1

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * Generate a human-readable description for a revision.
     *
     * Used in undo/redo tooltips: "Undo: Created 5 pages for bakery site"
     */
    private function generateRevisionDescription(string $userPrompt, array $operations): string
    {
        $writeCount = count(array_filter($operations, fn($op) => $op['action'] === 'write'));
        $deleteCount = count(array_filter($operations, fn($op) => $op['action'] === 'delete'));

        // Use a truncated version of the user prompt
        $shortPrompt = mb_substr($userPrompt, 0, 80);
        if (mb_strlen($userPrompt) > 80) {
            $shortPrompt .= '...';
        }

        $parts = [];
        if ($writeCount > 0) {
            $parts[] = "{$writeCount} file" . ($writeCount > 1 ? 's' : '') . ' modified';
        }
        if ($deleteCount > 0) {
            $parts[] = "{$deleteCount} file" . ($deleteCount > 1 ? 's' : '') . ' removed';
        }

        return $shortPrompt . ' (' . implode(', ', $parts) . ')';
    }

    /**
     * Auto-regenerate AEO files if data-layer files were modified.
     *
     * AEO files (llms.txt, robots.txt, mcp.php, schema.php) are derived
     * from site.json, form schemas, and page files. When any of these
     * change, the AEO files must be regenerated to stay in sync.
     *
     * Runs silently — errors are logged but don't interrupt the AI flow.
     */
    private function autoRegenerateAEO(array $operations): void
    {
        // Patterns that indicate AEO-relevant changes
        $aeoTriggerPatterns = [
            'assets/data/site.json',    // Core site identity
            'assets/data/',             // Any data layer change
            'assets/forms/',            // Form schema changes
            '.php',                     // Page additions/deletions affect page list
        ];

        $shouldRegenerate = false;
        foreach ($operations as $op) {
            $path = $op['path'] ?? '';
            foreach ($aeoTriggerPatterns as $pattern) {
                if (str_contains($path, $pattern)) {
                    $shouldRegenerate = true;
                    break 2;
                }
            }
        }

        if (!$shouldRegenerate) {
            return;
        }

        try {
            $this->emitSSE('status', ['message' => 'Syncing AI discovery files...']);

            $aeo = new AEOGenerator();
            $siteUrl = '';
            try {
                $siteUrl = $this->settings->get('site_url', '');
            } catch (\Throwable $e) {
                // Settings might not have site_url yet
            }

            $result = $aeo->generateAll($siteUrl);

            Logger::info('aeo', 'Auto-regenerated AEO files after AI edit', [
                'generated' => $result['generated'] ?? [],
                'trigger_ops' => array_map(fn($op) => $op['path'], $operations),
            ]);
        } catch (\Throwable $e) {
            // AEO regeneration is best-effort — don't break the AI flow
            Logger::warning('aeo', 'AEO auto-regeneration failed', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Transform a __section_snippet__ operation into a real file write.
     *
     * When the AI returns only the new section HTML (not the full file),
     * this method reads the target file, finds the correct insertion point
     * by counting top-level <section> tags, and creates a proper write
     * operation with the snippet inserted.
     *
     * Falls through gracefully if the AI returned a full file write instead.
     */
    private function transformSectionSnippet(array $operations, array $actionData): array
    {
        // Find the snippet operation
        $snippetIndex = null;
        $snippetContent = null;
        foreach ($operations as $i => $op) {
            if ($op['path'] === '__section_snippet__' && $op['action'] === 'write') {
                $snippetIndex = $i;
                $snippetContent = $op['content'];
                break;
            }
        }

        // No snippet found — the AI returned a full file write (backward compatible)
        if ($snippetIndex === null) {
            return $operations;
        }

        $targetPath = $actionData['path'];
        $insertPosition = $actionData['insertPosition'] ?? '';

        // Read the current file content
        $currentContent = $this->fileManager->readFile($targetPath);
        if ($currentContent === null) {
            Logger::warning('ai', 'Cannot read target file for section insertion', [
                'path' => $targetPath,
            ]);
            return $operations;
        }

        // Parse the insert position to determine the section index
        // Formats: "After section N" or "At the very beginning..."
        $insertAfterIndex = -1; // -1 means "before the first section"
        if (preg_match('/After section (\d+)/', $insertPosition, $m)) {
            $insertAfterIndex = (int) $m[1] - 1; // Convert 1-based to 0-based
        }

        // Find insertion point in the source file
        $newContent = $this->insertSectionAtIndex($currentContent, $snippetContent, $insertAfterIndex);

        if ($newContent === null) {
            // Couldn't find insertion point — append before closing </main> or at end
            Logger::warning('ai', 'Could not find section insertion point, appending before </main>', [
                'insertAfterIndex' => $insertAfterIndex,
            ]);
            $mainClosePos = strripos($currentContent, '</main>');
            if ($mainClosePos !== false) {
                $newContent = substr($currentContent, 0, $mainClosePos)
                    . "\n\n" . trim($snippetContent) . "\n\n"
                    . substr($currentContent, $mainClosePos);
            } else {
                // No </main> — just append
                $newContent = $currentContent . "\n\n" . trim($snippetContent) . "\n";
            }
        }

        Logger::info('ai', 'Section snippet inserted', [
            'target_path'       => $targetPath,
            'insert_after_index' => $insertAfterIndex,
            'snippet_length'    => strlen($snippetContent),
            'original_length'   => strlen($currentContent),
            'new_length'        => strlen($newContent),
        ]);

        // Replace the snippet operation with a real file write
        $operations[$snippetIndex] = [
            'path'    => $targetPath,
            'action'  => 'write',
            'content' => $newContent,
        ];

        return $operations;
    }

    /**
     * Insert a section snippet at the correct index in the file content.
     *
     * Counts top-level <section> opening tags to find the Nth section,
     * then finds its closing </section> tag and inserts the snippet after it.
     *
     * @return string|null The new file content, or null if insertion point not found
     */
    private function insertSectionAtIndex(string $content, string $snippet, int $afterIndex): ?string
    {
        // Find all <section positions (top-level pattern)
        preg_match_all('/<section[\s>]/i', $content, $matches, PREG_OFFSET_CAPTURE);

        if (empty($matches[0])) {
            return null;
        }

        $sectionStarts = $matches[0]; // Array of [match, offset]

        if ($afterIndex === -1) {
            // Insert BEFORE the first section
            $firstSectionPos = $sectionStarts[0][1];

            // Walk back to include any HTML comment above the first section
            // (e.g., <!-- HERO SECTION -->)
            $insertPos = $firstSectionPos;

            return substr($content, 0, $insertPos)
                . trim($snippet) . "\n\n"
                . substr($content, $insertPos);
        }

        // Insert AFTER section at $afterIndex
        if ($afterIndex >= count($sectionStarts)) {
            return null; // Index out of range
        }

        // Find the closing </section> for the section at $afterIndex
        $searchFrom = $sectionStarts[$afterIndex][1];

        // Count nested <section>...</section> to find the matching close
        $depth = 0;
        $pos = $searchFrom;
        $contentLen = strlen($content);

        while ($pos < $contentLen) {
            // Find next <section or </section>
            $nextOpen = stripos($content, '<section', $pos + 1);
            $nextClose = stripos($content, '</section>', $pos + ($depth === 0 ? 0 : 1));

            if ($nextClose === false) {
                return null; // Malformed HTML
            }

            if ($nextOpen !== false && $nextOpen < $nextClose) {
                // Another section opens before this one closes — nested
                $depth++;
                $pos = $nextOpen;
            } else {
                if ($depth === 0) {
                    // This is our matching close tag
                    $insertPos = $nextClose + strlen('</section>');

                    // Skip any trailing whitespace/newline
                    while ($insertPos < $contentLen && ($content[$insertPos] === "\n" || $content[$insertPos] === "\r")) {
                        $insertPos++;
                    }

                    return substr($content, 0, $insertPos)
                        . "\n\n" . trim($snippet) . "\n\n"
                        . substr($content, $insertPos);
                }
                $depth--;
                $pos = $nextClose + 1;
            }
        }

        return null;
    }

    /**
     * Transform a __section_snippet__ for section_edit into a real file write.
     *
     * When section_edit returns only the modified section HTML (not the full
     * file), this method reads the target file, finds the original section
     * using the sectionHtml anchor from actionData, and replaces it with
     * the AI's modified snippet.
     *
     * Falls through gracefully if the AI returned a full file write instead.
     */
    private function transformSectionEditSnippet(array $operations, array $actionData): array
    {
        // Find the snippet operation
        $snippetIndex = null;
        $snippetContent = null;
        foreach ($operations as $i => $op) {
            if ($op['path'] === '__section_snippet__' && $op['action'] === 'write') {
                $snippetIndex = $i;
                $snippetContent = $op['content'];
                break;
            }
        }

        // No snippet found — the AI returned a full file write (backward compatible)
        if ($snippetIndex === null) {
            return $operations;
        }

        $targetPath = $actionData['path'] ?? '';
        $originalHtml = $actionData['sectionHtml'] ?? '';

        // The visual editor injects data-vx-* attributes, data-vx-editable,
        // and style="" into the outerHTML for its own tracking. These don't
        // exist in the source file, so we must strip them before matching.
        $originalHtml = $this->stripVisualEditorAttributes($originalHtml);

        if (empty($targetPath) || empty($originalHtml)) {
            Logger::warning('ai', 'Section edit snippet missing path or sectionHtml — fallback to full write', [
                'has_path'         => !empty($targetPath),
                'has_section_html' => !empty($originalHtml),
            ]);
            return $operations;
        }

        // Read the current file content
        $currentContent = $this->fileManager->readFile($targetPath);
        if ($currentContent === null) {
            Logger::warning('ai', 'Cannot read target file for section edit snippet', [
                'path' => $targetPath,
            ]);
            return $operations;
        }

        // Find and replace the original section in the file.
        // Also sanitize the AI's snippet: it may echo runtime state
        // like is-visible or data-reveal="" that shouldn't be persisted.
        $cleanSnippet = $this->stripVisualEditorAttributes(trim($snippetContent));
        $newContent = $this->replaceSectionHtml(
            $currentContent,
            trim($originalHtml),
            $cleanSnippet
        );

        if ($newContent === null) {
            Logger::warning('ai', 'Could not find section anchor for replacement — AI output used as-is', [
                'target_path'    => $targetPath,
                'anchor_length'  => strlen($originalHtml),
                'anchor_preview' => substr($originalHtml, 0, 300),
                'file_preview'   => substr($currentContent, 0, 300),
            ]);
            // Cannot locate the original section — fall through.
            // The snippet operation will fail validation (virtual path),
            // so remove it to avoid a confusing error.
            unset($operations[$snippetIndex]);
            return array_values($operations);
        }

        // Replace the snippet operation with a real file write
        $operations[$snippetIndex] = [
            'path'    => $targetPath,
            'action'  => 'write',
            'content' => $newContent,
        ];

        Logger::info('ai', 'Section edit snippet replaced', [
            'target_path'     => $targetPath,
            'anchor_length'   => strlen($originalHtml),
            'snippet_length'  => strlen($snippetContent),
            'original_length' => strlen($currentContent),
            'new_length'      => strlen($newContent),
        ]);

        return $operations;
    }

    /**
     * Replace a section's HTML in the full file content.
     *
     * Uses exact match first, then falls back to whitespace-normalized
     * matching. The visual editor captures outerHTML from the rendered
     * DOM, which may normalize whitespace differently from the source
     * file (e.g., collapsing runs of spaces, trimming newlines inside
     * attributes).
     *
     * @return string|null The new file content, or null if anchor not found
     */
    private function replaceSectionHtml(string $fileContent, string $originalHtml, string $newHtml): ?string
    {
        // Strategy 1: exact substring match (fast path)
        $pos = strpos($fileContent, $originalHtml);
        if ($pos !== false) {
            return substr($fileContent, 0, $pos)
                . $newHtml
                . substr($fileContent, $pos + strlen($originalHtml));
        }

        // Strategy 2: whitespace-normalized match
        $normalizedOriginal = preg_replace('/\s+/', ' ', $originalHtml);
        $normalizedFile = preg_replace('/\s+/', ' ', $fileContent);

        $normPos = strpos($normalizedFile, $normalizedOriginal);
        if ($normPos !== false) {
            $realStart = $this->mapNormalizedOffset($fileContent, $normPos);
            $realEnd = $this->mapNormalizedOffset($fileContent, $normPos + strlen($normalizedOriginal));

            if ($realStart !== null && $realEnd !== null) {
                return substr($fileContent, 0, $realStart)
                    . $newHtml
                    . substr($fileContent, $realEnd);
            }
        }

        // Strategy 3: runtime-artifact-tolerant match
        // If a previous write leaked runtime state (is-visible, data-reveal="")
        // into the file, the anchor (which is now clean) won't match the file.
        // Strip runtime artifacts from BOTH sides before matching, then map
        // positions back via the cleaned file.
        $cleanedFile = $this->stripRuntimeArtifacts($fileContent);
        $cleanedAnchor = $this->stripRuntimeArtifacts($originalHtml);

        // Try exact match on cleaned versions
        $cleanPos = strpos($cleanedFile, $cleanedAnchor);
        if ($cleanPos === false) {
            // Try whitespace-normalized match on cleaned versions
            $normCleanedAnchor = preg_replace('/\s+/', ' ', $cleanedAnchor);
            $normCleanedFile = preg_replace('/\s+/', ' ', $cleanedFile);

            $normCleanPos = strpos($normCleanedFile, $normCleanedAnchor);
            if ($normCleanPos === false) {
                return null; // Anchor not found even after all normalization
            }

            $cleanPos = $this->mapNormalizedOffset($cleanedFile, $normCleanPos);
            $cleanEnd = $this->mapNormalizedOffset($cleanedFile, $normCleanPos + strlen($normCleanedAnchor));
            if ($cleanPos === null || $cleanEnd === null) {
                return null;
            }
        } else {
            $cleanEnd = $cleanPos + strlen($cleanedAnchor);
        }

        // Build the result from the cleaned file (strip leaked runtime state)
        // rather than the contaminated original. This heals the file.
        return substr($cleanedFile, 0, $cleanPos)
            . $newHtml
            . substr($cleanedFile, $cleanEnd);
    }

    /**
     * Strip runtime-only artifacts that may have leaked into source files.
     *
     * This is a lighter version of stripVisualEditorAttributes focused on
     * the specific artifacts that JS runtime code injects into the DOM and
     * that may have been accidentally persisted. Used for both anchor
     * matching and file healing.
     */
    private function stripRuntimeArtifacts(string $html): string
    {
        // Remove "is-visible" class added by data-reveal animation (main.js)
        $html = preg_replace('/ is-visible\b/', '', $html);
        $html = preg_replace('/\bis-visible /', '', $html);

        // Normalize data-reveal="" → data-reveal (DOM serialization of boolean attrs)
        $html = str_replace('data-reveal=""', 'data-reveal', $html);
        $html = str_replace('data-reveal-stagger=""', 'data-reveal-stagger', $html);

        return $html;
    }

    /**
     * Map a character offset in whitespace-normalized text back to the
     * corresponding offset in the original text.
     *
     * Whitespace normalization collapses runs of whitespace to single
     * spaces. This method walks the original text, counting how many
     * normalized characters have been consumed, to find the real offset
     * that corresponds to a given normalized offset.
     */
    private function mapNormalizedOffset(string $original, int $normalizedOffset): ?int
    {
        $len = strlen($original);
        $normCount = 0;
        $inWhitespace = false;

        for ($i = 0; $i < $len; $i++) {
            if ($normCount >= $normalizedOffset) {
                return $i;
            }

            $c = $original[$i];
            $isWs = ($c === ' ' || $c === "\t" || $c === "\n" || $c === "\r");

            if ($isWs) {
                if (!$inWhitespace) {
                    // First whitespace char in a run → counts as one space
                    $normCount++;
                    $inWhitespace = true;
                }
                // Subsequent whitespace chars in the run → don't count
            } else {
                $normCount++;
                $inWhitespace = false;
            }
        }

        // If we consumed exactly the right amount, the offset is at the end
        if ($normCount >= $normalizedOffset) {
            return $len;
        }

        return null;
    }

    /**
     * Strip visual editor tracking attributes from HTML.
     *
     * The visual editor injects data-vx-* attributes (source mapping,
     * editability flags) and empty style="" into the DOM for overlay
     * positioning. These don't exist in the source file and must be
     * removed before we can match the HTML against the source.
     *
     * Also reverses icon hydration: icon-resolver.js replaces
     * <i data-lucide="name"> with <svg data-lucide="name" ...>...</svg>
     * in the rendered DOM. The source file still has the <i> placeholders,
     * so we must collapse hydrated SVGs back to <i> for matching.
     */
    private function stripVisualEditorAttributes(string $html): string
    {
        // Remove data-vx-* attributes (source file, source kind, node key, editable, etc.)
        $html = preg_replace('/\s+data-vx-[a-z-]+="[^"]*"/', '', $html);

        // Remove empty style="" that the visual editor adds
        $html = preg_replace('/\s+style=""/', '', $html);

        // Remove the "is-visible" class added by data-reveal animation at runtime.
        // The source file doesn't have this class — it's added by main.js
        // when the element enters the viewport.
        $html = preg_replace('/\s+is-visible\b/', '', $html);
        // Also handle when is-visible is at the start or middle of a class list
        $html = str_replace('is-visible ', '', $html);

        // Normalize DOM-serialized boolean attributes: data-reveal="" → data-reveal
        // data-reveal-stagger="" → data-reveal-stagger
        // The DOM serializes valueless HTML attributes as attr="" in outerHTML,
        // but the source file has bare attributes without ="".
        $html = str_replace('data-reveal=""', 'data-reveal', $html);
        $html = str_replace('data-reveal-stagger=""', 'data-reveal-stagger', $html);

        // Reverse icon hydration: collapse <svg ... data-lucide="name" ...>...</svg>
        // back to <i ... data-lucide="name" ...></i>.
        // The icon-resolver.js replaces <i> with <svg> at runtime, copying class,
        // id, style, aria-*, and data-* attributes, and adding viewBox, fill,
        // stroke, stroke-width, etc. We strip the SVG-specific attributes and
        // inner content so the anchor matches the source <i> placeholder.
        $html = preg_replace_callback(
            '/<svg\b([^>]*\bdata-lucide="[^"]*"[^>]*)>.*?<\/svg>/s',
            function (array $m): string {
                $attrs = $m[1];

                // Remove SVG-specific attributes that weren't on the original <i>
                $attrs = preg_replace('/\s+(?:viewBox|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|xmlns|width|height)="[^"]*"/', '', $attrs);

                // Remove data-lucide-missing attribute (fallback marker)
                $attrs = preg_replace('/\s+data-lucide-missing="[^"]*"/', '', $attrs);

                return '<i' . $attrs . '></i>';
            },
            $html
        );

        return $html;
    }

    /**
     * Transform a __inline_snippet__ operation into a real file write.
     *
     * When inline_edit returns only the replacement for the selected code
     * (not the full file), this method reads the target file, finds the
     * selected text, and replaces it with the AI's snippet.
     *
     * Falls through gracefully if the AI returned a full file write instead.
     */
    private function transformInlineEditSnippet(array $operations, array $actionData): array
    {
        // Find the snippet operation
        $snippetIndex = null;
        $snippetContent = null;
        foreach ($operations as $i => $op) {
            if ($op['path'] === '__inline_snippet__' && $op['action'] === 'write') {
                $snippetIndex = $i;
                $snippetContent = $op['content'];
                break;
            }
        }

        // No snippet found — the AI returned a full file write (backward compatible)
        if ($snippetIndex === null) {
            return $operations;
        }

        $targetPath = $actionData['path'] ?? '';
        $selection = $actionData['selection'] ?? '';

        if (empty($targetPath) || empty($selection)) {
            Logger::warning('ai', 'Inline edit snippet missing path or selection — fallback', [
                'has_path'      => !empty($targetPath),
                'has_selection' => !empty($selection),
            ]);
            return $operations;
        }

        // Read the current file content
        $currentContent = $this->fileManager->readFile($targetPath);
        if ($currentContent === null) {
            Logger::warning('ai', 'Cannot read target file for inline edit snippet', [
                'path' => $targetPath,
            ]);
            return $operations;
        }

        // Find the selection in the file
        $pos = strpos($currentContent, $selection);
        if ($pos === false) {
            Logger::warning('ai', 'Inline edit: selection text not found in file — fallback', [
                'target_path'      => $targetPath,
                'selection_length' => strlen($selection),
                'file_length'      => strlen($currentContent),
            ]);
            // Remove the virtual path operation to avoid confusing errors
            unset($operations[$snippetIndex]);
            return array_values($operations);
        }

        // Replace the selection with the snippet
        $newContent = substr($currentContent, 0, $pos)
            . $snippetContent
            . substr($currentContent, $pos + strlen($selection));

        $operations[$snippetIndex] = [
            'path'    => $targetPath,
            'action'  => 'write',
            'content' => $newContent,
        ];

        Logger::info('ai', 'Inline edit snippet replaced', [
            'target_path'      => $targetPath,
            'selection_length' => strlen($selection),
            'snippet_length'   => strlen($snippetContent),
            'original_length'  => strlen($currentContent),
            'new_length'       => strlen($newContent),
        ]);

        return $operations;
    }

    /**
     * Check if the current generation has been cancelled.
     *
     * The /ai/cancel-generation endpoint sets the prompt_log status
     * to 'error' with message "Generation was cancelled." This method
     * reads that flag from the database. Called from the onToken
     * callback during streaming and at key checkpoints.
     *
     * Throttled: queries the DB at most once per second to avoid
     * write amplification during fast token delivery.
     */
    private function isCancelled(): bool
    {
        if ($this->activePromptLogId === null) {
            return false;
        }

        $now = microtime(true);
        if ($now - $this->lastCancelCheckTime < 1.0) {
            return false; // Throttle: already checked within the last second
        }
        $this->lastCancelCheckTime = $now;

        try {
            $row = $this->db->queryOne(
                'SELECT status, error_message FROM prompt_log WHERE id = ? LIMIT 1',
                [$this->activePromptLogId]
            );

            if ($row && $row['status'] === 'error'
                && str_contains((string) ($row['error_message'] ?? ''), 'cancelled')) {
                return true;
            }
        } catch (\Throwable) {
            // Database error — don't cancel, let the generation continue
        }

        return false;
    }

    /**
     * Roll back progressive file writes that occurred before an error.
     *
     * @param array<string, string|null> $beforeStateByPath
     */
    private function rollbackProgressiveWrites(array $beforeStateByPath): int
    {
        if (empty($beforeStateByPath)) {
            return 0;
        }

        $rolledBack = 0;
        foreach ($beforeStateByPath as $path => $originalContent) {
            try {
                if ($originalContent === null) {
                    // File did not exist before streaming started.
                    $this->fileManager->deleteFile($path);
                } else {
                    $this->fileManager->writeFile($path, $originalContent);
                }
                $rolledBack++;
            } catch (\Throwable) {
                // Best effort: keep error handling resilient.
            }
        }

        return $rolledBack;
    }

    /**
     * Prune old prompt_log entries beyond retention limit.
     *
     * Keeps the most recent MAX_PROMPT_LOGS entries per user and
     * removes the rest. Also cleans up orphaned conversations
     * (conversations with no remaining prompt_log entries).
     *
     * Called probabilistically from execute() — not on every request.
     */
    private function pruneOldPromptLogs(int $userId): void
    {
        $maxLogs = 500;

        $total = (int) $this->db->scalar(
            'SELECT COUNT(*) FROM prompt_log WHERE user_id = ?',
            [$userId]
        );

        if ($total <= $maxLogs) {
            return;
        }

        // Find the created_at cutoff: keep the newest $maxLogs entries
        $cutoff = $this->db->scalar(
            "SELECT created_at FROM prompt_log
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 1 OFFSET ?",
            [$userId, $maxLogs - 1]
        );

        if ($cutoff === null) {
            return;
        }

        $deleted = $this->db->delete(
            'prompt_log',
            'user_id = ? AND created_at < ?',
            [$userId, $cutoff]
        );

        // Clean up orphaned conversations (no prompt_log entries left)
        $this->db->delete(
            'conversations',
            'user_id = ? AND id NOT IN (SELECT DISTINCT conversation_id FROM prompt_log WHERE conversation_id IS NOT NULL)',
            [$userId]
        );

        if ($deleted > 0) {
            Logger::info('ai', 'Pruned old prompt logs', [
                'user_id' => $userId,
                'deleted' => $deleted,
                'remaining' => $total - $deleted,
            ]);
        }
    }

    /**
     * Handle errors during streaming, mapping to user-friendly messages.
     */
    private function handleStreamError(
        RuntimeException $e,
        int $userId,
        ?string $conversationId,
        ?int $promptLogId = null,
        ?string $userPrompt = null,
        bool $changesReverted = false
    ): void
    {
        $message = $e->getMessage();
        $providerName = isset($this->provider) ? $this->provider->getName() : 'AI provider';

        // Provider-specific API key hints
        $apiKeyHints = [
            'claude'              => 'Check that you copied the full key from console.anthropic.com. It starts with "sk-ant-".',
            'openai'              => 'Check that you copied the full key from platform.openai.com. It starts with "sk-".',
            'gemini'              => 'Check that you copied the full key from aistudio.google.com.',
            'deepseek'            => 'Check that you copied the full key from platform.deepseek.com.',
            'openai_compatible'   => 'Check the API key and server URL in Settings.',
        ];
        $providerId = isset($this->provider) ? $this->provider->getId() : '';
        $keyHint = $apiKeyHints[$providerId] ?? 'Check the API key in Settings.';

        $errorMap = [
            'rate_limited'         => [
                'message' => "{$providerName} is busy. Retrying in 30 seconds...",
                'code'    => 'rate_limited',
            ],
            'invalid_api_key'      => [
                'message' => "That API key didn't work. {$keyHint}",
                'code'    => 'invalid_api_key',
            ],
            'provider_unavailable' => [
                'message' => "{$providerName} is temporarily unavailable. Try again in a minute, or switch to a different model in Settings.",
                'code'    => 'provider_unavailable',
            ],
        ];

        $error = $errorMap[$message] ?? [
            'message' => "Something went wrong: {$message}",
            'code'    => 'ai_error',
        ];
        if ($changesReverted) {
            $error['message'] .= ' Partial file changes made before the failure were reverted.';
        }

        // Log/update the error
        if ($promptLogId !== null) {
            $this->db->update('prompt_log', [
                'status'        => 'error',
                'error_message' => $message,
            ], 'id = ?', [$promptLogId]);
        } else {
            $this->db->insert('prompt_log', [
                'conversation_id' => $conversationId,
                'user_id'         => $userId,
                'user_prompt'     => $userPrompt ?: '(error during generation)',
                'ai_provider'     => isset($this->provider) ? $this->provider->getId() : 'claude',
                'ai_model'        => isset($this->provider)
                    ? ($this->getConfiguredModel($this->provider->getId()) ?: 'unknown')
                    : 'unknown',
                'status'          => 'error',
                'error_message'   => $message,
                'created_at'      => now(),
            ]);
        }

        $this->emitSSE('error', $error);
    }

    /**
     * Auto-repair PHP files that failed syntax check.
     *
     * Sends each broken file + its `php -l` error back to the AI
     * via a lightweight non-streaming `complete()` call. The AI
     * returns the full corrected file, which we write and re-lint.
     *
     * Key improvements:
     * - max_tokens scales with file size (file bytes / 2.5)
     * - Retries once if the first repair attempt still has errors
     * - System prompt specifically mentions common AI mistakes
     *
     * @param array<int, string> $warnings Warning strings from FileManager
     * @param string $model The AI model to use for repairs
     * @return array{repaired: string[], failed: string[]}
     */
    private function repairBrokenPhpFiles(array $warnings, string $model): array
    {
        $repaired = [];
        $failed = [];

        foreach ($warnings as $warning) {
            // Extract file path from warning format:
            // "PHP syntax error in about.php on line 56: syntax error, ..."
            // "PHP syntax error in _partials/nav.php: Parse error: ..."
            // The "on line N" part is optional and must not be included in the path.
            if (!preg_match('/PHP syntax error in (.+?)(?:\s+on line \d+)?:\s*(.*)/', $warning, $m)) {
                $failed[] = $warning;
                continue;
            }

            $relativePath = trim($m[1]);
            $errorDetail = trim($m[2]);

            // Read the broken file content
            $content = $this->fileManager->readFile($relativePath);
            if ($content === null) {
                $failed[] = $warning;
                continue;
            }

            // Scale max_tokens to file size — the AI must output the FULL file.
            // ~2.5 bytes per token is conservative for PHP/HTML content.
            $repairMaxTokens = max(4096, (int) ceil(strlen($content) / 2.5));
            // Cap at a reasonable limit
            $repairMaxTokens = min($repairMaxTokens, 16384);

            $systemPrompt = 'You are a PHP code repair tool. You receive a PHP file with a syntax error and must return the COMPLETE fixed file. '
                . 'Common AI-generated PHP mistakes: '
                . '(1) Unescaped apostrophes in single-quoted strings: \'We\'re\' should be "We\'re" or \'We\\\'re\'. '
                . '(2) Unclosed HTML tags in PHP output. '
                . '(3) Missing semicolons or closing brackets. '
                . 'Return ONLY the corrected PHP code — no explanations, no markdown fences, no commentary. '
                . 'Output the full file contents exactly as they should be saved to disk.';

            $maxAttempts = 2;
            $fixed = false;

            for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
                $this->emitSSE('status', [
                    'message' => "Fixing syntax error in {$relativePath}" . ($attempt > 1 ? " (attempt {$attempt})" : '') . '...',
                ]);

                try {
                    $fixedContent = $this->provider->complete(
                        $systemPrompt,
                        [
                            [
                                'role' => 'user',
                                'content' => "This PHP file has a syntax error:\n\nFile: {$relativePath}\nError: {$errorDetail}\n\nFile contents:\n```\n{$content}\n```\n\nReturn the complete fixed file. Output ONLY the file contents, nothing else.",
                            ],
                        ],
                        [
                            'model' => $model,
                            'max_tokens' => $repairMaxTokens,
                        ]
                    );

                    // Strip markdown fences if the AI included them despite instructions
                    $fixedContent = trim($fixedContent);
                    if (preg_match('/^```(?:php)?\s*\n(.*)\n```$/s', $fixedContent, $fenceMatch)) {
                        $fixedContent = $fenceMatch[1];
                    }

                    // Basic sanity: must not be empty
                    if (strlen($fixedContent) < 10) {
                        $content = $fixedContent; // Use for next attempt context
                        continue;
                    }

                    // Write the repaired file and re-lint
                    $writeWarning = $this->fileManager->writeFile($relativePath, $fixedContent);

                    if ($writeWarning === null) {
                        $repaired[] = "Auto-repaired syntax error in {$relativePath}";
                        $fixed = true;
                        break;
                    }

                    // First attempt failed — update content and error for retry
                    $content = $fixedContent;
                    if (preg_match('/PHP syntax error in [^:]+:\s*(.*)/', $writeWarning, $retryMatch)) {
                        $errorDetail = trim($retryMatch[1]);
                    }
                } catch (\Throwable $e) {
                    // If first attempt throws, try once more
                    if ($attempt >= $maxAttempts) {
                        $failed[] = "Auto-repair failed for {$relativePath}: {$e->getMessage()}";
                        $fixed = true; // Mark as handled
                    }
                }
            }

            if (!$fixed) {
                $failed[] = "Auto-repair failed for {$relativePath}: still has syntax errors after {$maxAttempts} attempts";
            }
        }

        return ['repaired' => $repaired, 'failed' => $failed];
    }

    /**
     * Begin Server-Sent Events stream.
     */
    private function beginSSE(): void
    {
        // Long generations (full websites) can take 2-3 minutes.
        // Don't let PHP kill us mid-stream.
        set_time_limit(0);
        ini_set('max_execution_time', '0');
        ignore_user_abort(true); // Continue generation even if client disconnects

        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('X-Accel-Buffering: no'); // Disable nginx buffering

        // Disable output buffering
        while (ob_get_level()) {
            ob_end_flush();
        }
    }

    /**
     * Emit a Server-Sent Event.
     *
     * After Nginx closes the FastCGI connection (fastcgi_read_timeout),
     * echo/flush can trigger a fatal error that kills the PHP-FPM worker.
     * All output is wrapped in error suppression so the AI stream and
     * file writes continue uninterrupted even after the client disconnects.
     *
     * In headless mode (Agent API worker): SSE output is skipped entirely.
     * Instead, periodic heartbeats are written to prompt_log.last_progress_at
     * so the polling endpoint can detect stale workers.
     *
     * Status events are enriched with a normalized `step` key so the
     * frontend can show a machine-readable phase (resolving_context,
     * streaming, writing_files, etc.) without parsing the human message.
     *
     * @param string $type Event type (token, status, file_complete, warning, done, error)
     * @param array  $data Event payload
     */
    private function emitSSE(string $type, array $data): void
    {
        // ── Enrich status events with a normalized step key ──
        if ($type === 'status' && isset($data['message']) && !isset($data['step'])) {
            $data['step'] = $this->normalizeStepFromMessage($data['message']);
        }

        // In headless mode, skip SSE output but write heartbeat.
        // Heartbeat fires on ALL events (including tokens) so the polling
        // endpoint's stale detection never misclassifies a healthy long-running
        // prompt as dead. The 3-second throttle in writeHeadlessHeartbeat()
        // prevents database write amplification.
        if ($this->headless) {
            // Only write status_message for meaningful events, not every token
            $statusMessage = null;
            if ($type !== 'token') {
                $statusMessage = $data['message']
                    ?? ($type === 'file_complete' ? 'Writing ' . ($data['path'] ?? '') : null);
            }
            $this->writeHeadlessHeartbeat($statusMessage);
            return;
        }

        // ── Interactive mode: persist status_message + liveness ──

        // Status events: persist both the human-readable step text and
        // last_progress_at. This enables the resumed-generation UX.
        if ($type === 'status' && $this->activePromptLogId !== null) {
            $this->persistStatusMessage($data['message'] ?? null, $data['step'] ?? null);
        }

        // Non-status events (tokens, file_complete, etc.): refresh
        // last_progress_at so the stale sweeps in ai.php don't falsely
        // expire a healthy run. Skipped for status events because
        // persistStatusMessage() above already writes last_progress_at.
        // Throttled to every 5 seconds — the 180-second stale threshold
        // is well clear of this interval.
        if ($type !== 'status') {
            $this->refreshInteractiveLiveness();
        }

        static $outputFailed = false;

        $data['type'] = $type;
        $payload = "data: " . json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n\n";
        try {
            // file_put_contents is a function (unlike echo), so @ suppression works.
            // After Nginx drops the FastCGI connection, writing to php://output
            // can trigger a fatal error that kills the PHP-FPM worker. Suppressing
            // it lets the AI stream and file writes continue.
            $result = @file_put_contents('php://output', $payload);
            if ($result === false && !$outputFailed) {
                $outputFailed = true;
                Logger::info('ai', 'Client connection lost (first SSE output failure)', [
                    'event_type'         => $type,
                    'connection_aborted' => connection_aborted(),
                    'connection_status'  => connection_status(),
                ]);
            }
            @flush();
        } catch (\Throwable $e) {
            // Connection closed — silently continue.
            if (!$outputFailed) {
                $outputFailed = true;
                Logger::info('ai', 'Client connection lost (SSE exception)', [
                    'event_type' => $type,
                    'error'      => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Map a human-readable status message to a normalized step key.
     *
     * The step key is a machine-readable identifier that the frontend
     * uses to render the current phase. The message is the display string.
     */
    private function normalizeStepFromMessage(string $message): string
    {
        // Exact matches first, then prefix matches for dynamic messages
        return match (true) {
            $message === 'Reading your site...'       => 'resolving_context',
            $message === 'Fetching reference site...' => 'resolving_context',
            $message === 'Generating...'              => 'streaming',
            $message === 'Saving revision...'         => 'writing_files',
            $message === 'Writing files...'           => 'writing_files',
            $message === 'Compiling styles...'        => 'compiling_css',
            $message === 'Finalizing...'              => 'finalizing',
            $message === 'Reviewing quality...'       => 'evaluating',
            $message === 'Syncing AI discovery files...' => 'finalizing',
            str_starts_with($message, 'Repaired ')    => 'writing_files',
            str_starts_with($message, 'Fixed ')       => 'writing_files',
            default                                   => 'processing',
        };
    }

    /**
     * Persist the current step/status to prompt_log for interactive runs.
     *
     * Writes both the human-readable status_message AND the last_progress_at
     * liveness timestamp. Without last_progress_at, the stale-run recovery
     * logic (ai.php) falls back to created_at and may falsely expire a
     * healthy long-running generation on slow hosting.
     *
     * Throttled to at most once every 2 seconds to avoid DB write amplification.
     */
    private function persistStatusMessage(?string $message, ?string $step): void
    {
        static $lastPersist = 0;
        static $lastStep = null;
        static $failureLogged = false;
        $now = microtime(true);

        // Bypass throttle on phase transitions — e.g. streaming → writing_files
        // → compiling_css can happen within seconds. Only identical repeated
        // statuses within the same phase get throttled.
        $phaseChanged = ($step !== null && $step !== $lastStep);
        if (!$phaseChanged && ($now - $lastPersist < 2.0)) {
            return;
        }
        $lastPersist = $now;
        $lastStep = $step;

        try {
            $data = ['last_progress_at' => now()];
            if ($message !== null) {
                $data['status_message'] = mb_substr($message, 0, 200);
            }
            $this->db->update('prompt_log', $data, 'id = ? AND status = ?', [
                $this->activePromptLogId, 'streaming',
            ]);
        } catch (\Throwable $e) {
            // Don't crash the generation over a status write, but DO log
            // the failure once — this is critical for diagnosing SQLite lock
            // issues, schema drift, or permission problems on customer servers.
            if (!$failureLogged) {
                $failureLogged = true;
                Logger::warning('ai', 'Failed to persist status_message (interactive mode)', [
                    'prompt_log_id' => $this->activePromptLogId,
                    'step'          => $step,
                    'error'         => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Refresh last_progress_at for interactive runs — liveness only.
     *
     * This is the token-stream liveness signal. Unlike persistStatusMessage()
     * which writes both status_message and last_progress_at on status events,
     * this method writes ONLY the timestamp. It fires on ALL SSE events
     * (including tokens) so the stale sweeps in ai.php never falsely expire
     * a healthy run during long token-streaming phases.
     *
     * Throttled to every 5 seconds (vs 2s for persistStatusMessage) because
     * the only goal is keeping last_progress_at fresh enough that the
     * 180-second stale threshold is never reached.
     */
    private function refreshInteractiveLiveness(): void
    {
        if ($this->activePromptLogId === null) {
            return;
        }

        static $lastLiveness = 0;
        $now = microtime(true);
        if ($now - $lastLiveness < 5.0) {
            return;
        }
        $lastLiveness = $now;

        try {
            $this->db->update('prompt_log', [
                'last_progress_at' => now(),
            ], 'id = ? AND status = ?', [
                $this->activePromptLogId, 'streaming',
            ]);
        } catch (\Throwable $e) {
            // Log the first failure — during token-only phases,
            // persistStatusMessage() never fires, so this is the only
            // diagnostic breadcrumb if liveness stops refreshing.
            static $livenessFailureLogged = false;
            if (!$livenessFailureLogged) {
                $livenessFailureLogged = true;
                Logger::warning('ai', 'Failed to refresh interactive liveness', [
                    'prompt_log_id' => $this->activePromptLogId,
                    'error'         => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Write a heartbeat timestamp and optional status message to prompt_log.
     *
     * Used in headless mode to signal liveness. The GET /prompt/:id polling
     * endpoint reads last_progress_at to detect stale workers:
     * - queued jobs older than 60s → spawn failed
     * - streaming jobs older than 300s → worker died
     */
    private function writeHeadlessHeartbeat(?string $statusMessage = null): void
    {
        // Throttle: don't write more than once every 3 seconds
        static $lastHeartbeat = 0;
        $now = microtime(true);
        if ($now - $lastHeartbeat < 3.0) {
            return;
        }
        $lastHeartbeat = $now;

        try {
            $data = ['last_progress_at' => now()];
            if ($statusMessage !== null) {
                $data['status_message'] = mb_substr($statusMessage, 0, 200);
            }
            // Use the prompt_log_id from the request context.
            // In headless mode this is always set by the worker.
            $this->db->update('prompt_log', $data, 'id = ? AND status = ?', [
                $this->headlessJobId ?? 0, 'streaming',
            ]);
        } catch (\Throwable $e) {
            // Don't crash the generation over a heartbeat write, but DO log
            // the failure once — critical for diagnosing SQLite lock issues,
            // schema drift, or permission problems on customer servers.
            static $heartbeatFailureLogged = false;
            if (!$heartbeatFailureLogged) {
                $heartbeatFailureLogged = true;
                Logger::warning('ai', 'Failed to write headless heartbeat', [
                    'prompt_log_id' => $this->headlessJobId ?? 0,
                    'error'         => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Default system prompt when prompts/system.md doesn't exist yet.
     *
     * This is a minimal prompt that ensures the AI produces correctly
     * formatted output. The full system prompt (Phase 5) will replace it.
     */
    private function getDefaultSystemPrompt(): string
    {
        return <<<'PROMPT'
You are a professional web developer building a website using PHP includes for shared elements. You produce complete, production-ready PHP/HTML/CSS/JS files.

## Language
Always match the user's language. If they write in French, all content is in French. If Japanese, everything in Japanese. Code syntax stays English.

## Bias to Action
Build immediately using your best judgment. Never ask more than one question. Make design choices yourself — the user can refine afterward. When pages already exist, treat requests as incremental changes to the existing site.

## Facts and Sample Content
Never invent contact details, addresses, phone numbers, emails, opening hours, prices, statistics, ratings, review counts, client logos or awards. If the user or the context did not supply a fact, leave it out. No placeholders like `#`, `example.com` or `555` numbers. Data files feed llms.txt, Schema.org and MCP, so invented values become false public claims. If a layout needs testimonials and none were supplied, write at most three clearly generic sample quotes in the page HTML only, put `<!-- sample content: replace before publishing -->` above them, and say in your message that they are placeholders.

## Copy
Match the tone and specificity of the existing page copy. Specific beats vague; one strong word beats three weak ones; buttons name the action. No clichés (elevate, seamless, unlock, passion, curated), no triple adjectives, no invented numbers, no icon on every card.

## Architecture

Pages use PHP includes for shared partials. Styling uses **Tailwind utility classes** — the TailwindCompiler reads your HTML and compiles a static `assets/css/tailwind.css` automatically. You never write that file.

### File structure
- `_partials/header.php` — The SINGLE layout partial that pages include. Contains DOCTYPE, `<head>` (with CSS links), opening `<body>`, and includes nav. **Pages ONLY include this file** — never a separate `head.php`.
- `_partials/nav.php` — The entire navigation component (AI-designed, unique per site)
- `_partials/footer.php` — Footer + closing `</body></html>`
- `index.php`, `about.php`, etc. — Root-level page content between header/footer includes
- CRITICAL: Do NOT create a separate `_partials/head.php`. All `<head>` content goes inside `_partials/header.php`.

### Template: `_partials/header.php`
```php
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($page['title'] ?? 'Home') ?> — <?= htmlspecialchars($siteName ?? 'My Site') ?></title>
  <meta name="description" content="<?= htmlspecialchars($page['description'] ?? '') ?>">
  <link rel="stylesheet" href="/assets/css/style.css">
  <link rel="stylesheet" href="/assets/css/tailwind.css">
</head>
<body class="bg-white text-gray-900 antialiased">
<?php include __DIR__ . '/nav.php'; ?>
<main>
```

### Template: Page files (e.g. `about.php`)
```php
<?php
$siteName = 'My Site';
$page = [
    'title'       => 'About',
    'description' => 'Learn more about us.',
    'slug'        => 'about',
];
include '_partials/header.php';
?>
<!-- Page content styled with Tailwind classes -->
<section class="max-w-5xl mx-auto px-6 py-20">
  <h1 class="text-4xl font-bold mb-6">About Us</h1>
</section>
<?php include '_partials/footer.php'; ?>
```

Keep page files at the root level (`*.php`), not inside nested directories.

### Nav & Footer: Fully AI-designed

The AI creates `_partials/nav.php` and `_partials/footer.php` from scratch using Tailwind classes. The design should match the site's personality — there is no fixed template. A restaurant might have a centered logo with a reservation CTA. A SaaS might have a dark nav with dropdowns. A portfolio might be ultra-minimal.

**Nav must always:**
- Be responsive — choose the mobile pattern that fits the site (compact persistent, bottom tab bar, text toggle, full-screen overlay, slide-in panel, or hamburger)
- Use `aria-current="page"` on the active link
- Include the site name/logo
- Use Tailwind utility classes for ALL styling including colors, backgrounds, hover states, and transitions
- The TailwindCompiler supports ALL standard Tailwind colors (gray-*, yellow-*, blue-*, red-*, etc.) plus design tokens (primary-*, accent-*, etc.) — use them freely
- All `<ul>` elements must use `list-none` to remove default browser bullets
- Any `<button>` must include `bg-transparent border-0 cursor-pointer` to neutralize browser defaults
- Include a styled CTA button (colored background, rounded, hover effects)
- Use backdrop-blur or background color for sticky/fixed navs
- First content section must have `pt-24` or `pt-32` to clear the fixed nav
- Mobile menus are `position: fixed; inset: 0; z-index: 9999` via the `.mobile-menu` class in `style.css`, below `.site-header` at 10000 so the toggle stays clickable, with the close button always reachable

**Footer must always:**
- Include copyright with year
- Close `</main>`, `</body>`, `</html>`
- Load scripts: `main.js`, `navigation.js`, `icon-resolver.js`
- Use a distinctive background (e.g. dark footer: `bg-gray-900 text-gray-400`)
- Style with proper grid/flex layouts for multi-column content
- Remove list bullets with `list-none` on link lists
- Include hover effects on links (e.g. `hover:text-white`)

### CSS strategy

1. **`assets/css/tailwind.css`** — Auto-compiled by TailwindCompiler. Includes Preflight resets. Never write this file manually.
2. **`assets/css/style.css`** — ONLY for design tokens (`:root` custom properties) and effects Tailwind cannot express (`@keyframes`, `[data-reveal]` transitions). NEVER add component classes.

`style.css` structure — tokens and animations only:
```css
:root {
  --color-primary: hsl(220, 60%, 50%);
  --color-primary-light: hsl(220, 40%, 95%);
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', system-ui, sans-serif;
  /* Design tokens: palette, fonts, spacing */
}
html { scroll-behavior: smooth; }
body { font-family: var(--font-body); background: var(--color-bg); color: var(--color-text); line-height:1.7; }

/* ONLY @keyframes and [data-reveal] below — NEVER component classes like .hero, .card, .btn */
```

**Font-family classes:** Use `font-heading` for headings/display text and `font-body` for body text. These resolve to `var(--font-heading)` and `var(--font-body)` from your `:root` tokens. **Do NOT use `font-['Font_Name']`** — the semantic classes keep font names in one place and enable user-facing font changes via the Style panel.

Preflight resets (box-sizing, link underlines, list bullets, img block display, heading/form normalization) are automatically prepended to `tailwind.css` by the TailwindCompiler.

## Rules

1. Use PHP includes for header/nav/footer. Never duplicate nav across pages.
2. **ALL HTML styling uses Tailwind utility classes** (`flex`, `bg-gray-900`, `px-6`, `py-24`, `text-white`, `hover:bg-primary-600`, `md:grid-cols-3`). Use `style.css` ONLY for `:root` design tokens + `@keyframes` + `[data-reveal]`.
3. Semantic HTML5 with proper heading hierarchy.
4. Never output `assets/css/tailwind.css` — it is compiled automatically from your HTML.
5. Custom CSS in `assets/css/style.css` only for design tokens and effects Tailwind can't express (complex animations, scroll-driven effects).
6. JavaScript in `assets/js/main.js` + `assets/js/navigation.js` (shipped) + `assets/js/icon-resolver.js` (shipped). Vanilla ES6 only.
7. Responsive design from 320px to 2560px. Mobile-first approach.
8. No external scripts or CDN assets. Google Fonts `<link>` tags are allowed in header.php.
9. When no user-uploaded image fits, use images from the built-in library at `/assets/library/` listed in the IMAGE LIBRARY context section when present. Never use external image URLs or placeholder services.
10. Two-space indentation. Commented sections.
11. Forms use the schema-driven system: create `assets/forms/{form_id}.json` with the schema AND the HTML form with `action="/submit.php"` and `<input type="hidden" name="form_id" value="{form_id}">`. Form AJAX handling is shipped code (auto-injected by the engine) — never generate form JavaScript. Never use PHP mail() or $_POST handling.
12. CRITICAL: Never put raw HTML directly after `<?php` without closing the PHP block first with `?>`. Partials that start with HTML should NOT open with `<?php`.
13. Home page links MUST use `href="/"` — never `/home`, `/index`, or `/index.php`. The home page is `index.php` served at `/`.
14. All color custom properties in `style.css` MUST use the `--color-` prefix (e.g. `--color-primary`, `--color-bg`, `--color-dark-800`). This enables the Tailwind compiler to resolve classes like `bg-primary`, `text-accent`, `bg-dark-800` automatically.
15. **NEVER create custom component classes** like `.hero-section`, `.btn-primary`, `.card`, `.section-header`, `.fragrance-card`, `.collection-grid`. These bypass the TailwindCompiler. Use Tailwind utilities in HTML instead. For one-off effects, use inline `style="..."` attributes.
16. When REMOVING a page, you MUST emit a `<file path="page.php" action="delete" />` tag for each file AND update `_partials/nav.php`. Both are required — without the delete tag, the file stays on disk.
17. **Icons:** Use `<i class="icon" data-lucide="phone" aria-hidden="true"></i>` placeholders. Never output raw SVG `<path>` data for Lucide icons. Never use `<img src="/assets/icons/...">` for theme-colored icons. The shipped `icon-resolver.js` hydrates placeholders into inline SVGs at runtime from `/assets/icons/`. Do NOT generate `icon-resolver.js`.
PROMPT;
    }

    /**
     * Enforce structured output from all providers.
     */
    private function getStructuredOutputContract(): string
    {
        return <<<'PROMPT'
OUTPUT FORMAT (STRICT)

Begin with a one-paragraph <message> explaining what you changed.
Then output each file operation using <file> tags.

<message>
Short human-facing summary of what changed.
</message>

<file path="index.php" action="write">
<?php
// Full file contents here — written verbatim, no escaping needed.
include '_partials/header.php';
?>
<main>Hello World</main>
<?php include '_partials/footer.php'; ?>
</file>

<file path="old-page.php" action="delete">
</file>

<file path="assets/data/memory.json" action="merge">
{"set":{"phone":{"value":"040-555-0187","confidence":"stated"}},"remove":["old_key"]}
</file>

Rules:
- "action" must be "write", "delete", or "merge".
- For "write": include the COMPLETE file contents between the tags, verbatim.
- For "delete": the tag body must be empty.
- For "merge": the tag body must be a JSON object with:
  - "set": key-value pairs to add or overwrite
  - "remove": array of top-level keys to delete
- ALWAYS use "merge" for "assets/data/memory.json" and "assets/data/design-intelligence.json". Never "write" these files.
- NEVER use "merge" on files outside "assets/data/". All others use "write" or "delete".
- Do NOT wrap file contents in markdown fences or JSON strings.
- Do NOT add commentary between file blocks.
- When REMOVING a page, you MUST emit a <file path="page.php" action="delete" /> tag for each page AND update _partials/nav.php. Both are required — the delete tag removes the file from disk.
- NEVER put inline <script> tags in PHP files. JavaScript MUST go in separate "assets/js/*.js" files. Use <script src="/assets/js/filename.js"></script> to include them. This prevents syntax conflicts between PHP and JavaScript parsers.
- NEVER put inline <style> tags in PHP files. CSS MUST go in "assets/css/*.css" files.
- PHP strings use single quotes. Escape apostrophes inside them as \' (e.g. 'don\'t', 'We\'re here to help'). Do not switch to double quotes to avoid escaping: they interpolate $ and a price like "$49" breaks the page.
- Allowed paths:
  - root PHP pages: "*.php"
  - partials: "_partials/*.php"
  - styles: "assets/css/*.css"
  - scripts: "assets/js/*.js"
  - data files: "assets/data/*.json"
  - form schemas: "assets/forms/*.json"
PROMPT;
    }

    /**
     * Draw a design direction for new sites only.
     *
     * create_site always gets one. free_prompt gets one when the site has
     * no pages yet (the first prompt on an empty Studio). Everything else
     * edits or references an existing design and must not introduce a new
     * direction.
     */
    private function shouldDrawDesignDirection(string $actionType): bool
    {
        if ($actionType === 'create_site') {
            return true;
        }
        if ($actionType === 'free_prompt') {
            try {
                return $this->db->count('pages') === 0;
            } catch (\Throwable $e) {
                return false;
            }
        }
        return false;
    }

    /**
     * Site Memory as constraints for the direction draw (rejected
     * directions, stated preferences, brand color). Empty when absent.
     *
     * @return array<string, mixed>
     */
    private function readMemoryForDirection(): array
    {
        try {
            $raw = $this->fileManager->readFile('assets/data/memory.json');
        } catch (\Throwable $e) {
            return [];
        }
        if ($raw === null || trim($raw) === '') {
            return [];
        }
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }

    /**
     * Find pages linked in the navigation that don't exist on disk.
     *
     * Reads _partials/nav.php and _partials/footer.php, extracts all
     * internal href="/page" references, and checks whether each
     * corresponding .php file exists in the preview directory.
     *
     * Returns an array of missing filenames (e.g. ['shop.php']).
     * Returns empty array if nav doesn't exist or all links resolve.
     */
    private function findMissingNavPages(): array
    {
        $previewDir = dirname(__DIR__) . '/preview';
        $filesToScan = [
            $previewDir . '/_partials/nav.php',
            $previewDir . '/_partials/footer.php',
        ];

        $referencedPages = [];
        foreach ($filesToScan as $filePath) {
            if (!file_exists($filePath)) {
                continue;
            }
            $content = file_get_contents($filePath);
            if ($content === false) {
                continue;
            }

            // Match href="/pagename" patterns (internal page links)
            // Captures: /about, /shop, /contact — but not /assets/..., /#anchor,
            // external URLs, or mailto:/tel: links.
            if (preg_match_all('/href=["\']\/((?!assets\/|_studio\/|#|http|\/)[a-z0-9_-]+)["\']/', $content, $matches)) {
                foreach ($matches[1] as $page) {
                    $referencedPages[$page] = true;
                }
            }
        }

        if (empty($referencedPages)) {
            return [];
        }

        $missing = [];
        foreach (array_keys($referencedPages) as $page) {
            $pagePath = $previewDir . '/' . $page . '.php';
            if (!file_exists($pagePath)) {
                $missing[] = $page . '.php';
            }
        }

        return $missing;
    }

    /**
     * Resolve the configured model setting key for a provider.
     */
    private function getConfiguredModel(string $providerId): string
    {
        $settingKey = "ai_{$providerId}_model";
        $model = (string) ($this->settings->get($settingKey, '') ?? '');
        if ($model !== '') {
            return $model;
        }

        // Legacy fallback for older installs that only have Claude model configured.
        return (string) ($this->settings->get('ai_claude_model', '') ?? '');
    }
}
