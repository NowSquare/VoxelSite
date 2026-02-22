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
        $promptLogId = null;

        // ── Set up SSE ──
        $this->beginSSE();

        Logger::info('ai', 'AI stream started', [
            'action_type'     => $actionType,
            'user_prompt'     => mb_substr($userPrompt, 0, 200),
            'page_scope'      => $pageScope,
            'conversation_id' => $conversationId,
            'user_id'         => $userId,
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

            // Create a prompt row immediately so refresh/disconnect won't
            // lose the fact that generation started.
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

            // ── Load system prompt with context budget awareness ──
            // Use the model's actual context window for budget calculations,
            // not the output token limit (ai_max_tokens).
            $maxTokens = (int) $this->settings->get('ai_max_tokens', 32000);
            $configuredModelForBudget = $configuredModel !== '' ? $configuredModel : ($this->provider->getModels()[0]['id'] ?? '');
            $contextWindow = $this->provider->getContextWindow($configuredModelForBudget);

            // If max_tokens is small (≤8K), use the compact fallback prompt
            // instead of the full 33KB system.md
            if ($maxTokens <= 8000) {
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
            // force essentials-only context instead of treating 0 as "unlimited".
            // A minimum of 4000 chars (~1K tokens) ensures at least site info + design tokens.
            if ($contextBudget < 4000) {
                $contextBudget = 4000;
            }

            // ── Build context — read the actual current state of the website ──
            $this->emitSSE('status', ['message' => 'Reading your site...']);
            $context = $this->siteContext->build($pageScope, $conversationId, $userId, $contextBudget);

            Logger::debug('ai', 'Context built', [
                'context_length'    => strlen($context),
                'context_budget'    => $contextBudget,
                'context_window'    => $contextWindow,
                'system_prompt_len' => $systemPromptChars,
                'max_tokens'        => $maxTokens,
                'model'             => $configuredModel,
                'provider'          => $this->provider->getId(),
            ]);

            // ── Build messages array ──
            $messages = $this->buildMessages(
                $userPrompt,
                $context,
                $conversationId,
                $userId,
                $actionType,
                $actionData
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
                function (string $token) use (&$fullResponse, &$completedPaths, &$lastTokenTime, &$beforeStateByPath, &$tailwindCompiledOnce) {
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

            Logger::info('ai', 'Response parsed', [
                'operation_count' => count($parsed['operations']),
                'warning_count'   => count($parsed['warnings']),
                'message_length'  => strlen($parsed['message']),
                'response_length' => strlen($fullResponse),
                'operations'      => array_map(fn($op) => $op['path'] . ' (' . $op['action'] . ')', $parsed['operations']),
            ]);

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

                // Auto-repair PHP syntax errors via a focused AI call.
                // The same model that generated the bug fixes it — a small,
                // non-streaming call with just the broken file + error message.
                $phpWarnings = $result['warnings'] ?? [];
                if (!empty($phpWarnings)) {
                    Logger::warning('ai', 'PHP syntax errors detected, attempting auto-repair', [
                        'warnings' => $phpWarnings,
                        'model'    => $configuredModel,
                    ]);
                    $repairResults = $this->repairBrokenPhpFiles($phpWarnings, $configuredModel);
                    Logger::info('ai', 'Auto-repair results', $repairResults);
                    foreach ($repairResults['repaired'] as $msg) {
                        $this->emitSSE('status', ['message' => $msg]);
                    }
                    foreach ($repairResults['failed'] as $msg) {
                        $this->emitSSE('warning', ['message' => $msg]);
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

                // Capture after state
                $this->emitSSE('status', ['message' => 'Finalizing...']);
                $this->revisionManager->captureAfterState($revisionId, $parsed['operations']);

                // Sync page registry
                $this->fileManager->syncPageRegistry();

                // Auto-regenerate AEO files (llms.txt, robots.txt, mcp.php, schema.php)
                // when data-layer files were modified. This keeps AEO content in sync
                // with every AI edit — not just on publish.
                $this->autoRegenerateAEO($parsed['operations']);
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

            Logger::info('ai', 'AI stream completed', [
                'files_modified'  => count($filesModified),
                'revision_id'     => $revisionId,
                'conversation_id' => $conversationId,
                'partial'         => !empty($operationErrors),
                'tokens_in'       => $usage['input_tokens'] ?? 0,
                'tokens_out'      => $usage['output_tokens'] ?? 0,
                'cost'            => $cost['total_cost'],
                'truncated'       => !empty($isTruncated),
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
            ]);

        } catch (RuntimeException $e) {
            $shutdownDone = true; // Error handled, don't double-process
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
            $actionPrompt = trim(file_get_contents($actionPath));
            if ($actionPrompt !== '') {
                if (str_contains($actionPrompt, '<request>')) {
                    $systemPrompt = $actionPrompt;
                } else {
                    $systemPrompt .= "\n\n" . $actionPrompt;
                }
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

        // Provider-agnostic contract: require a deterministic JSON envelope.
        // ResponseParser still accepts legacy <file>/<message> output as fallback.
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
        array $actionData
    ): array {
        $messages = [];

        // Enrich the user prompt with structured action data.
        $enrichedPrompt = $this->actionRegistry->buildPromptContext(
            $actionType,
            $userPrompt,
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
                    'content' => $entry['user_prompt'],
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
        if (!empty($context)) {
            $messages[] = [
                'role'    => 'user',
                'content' => $context . "\n\n---\n\n" . $enrichedPrompt,
            ];
        } else {
            $messages[] = [
                'role'    => 'user',
                'content' => $enrichedPrompt,
            ];
        }

        return $messages;
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
        $title = mb_substr($userPrompt, 0, 60);
        if (mb_strlen($userPrompt) > 60) {
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
     * Roll back files that were progressively written during streaming.
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
            // "PHP syntax error in _partials/nav.php: Parse error: ..."
            if (!preg_match('/PHP syntax error in ([^:]+):\s*(.*)/', $warning, $m)) {
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
     * @param string $type Event type (token, status, file_complete, warning, done, error)
     * @param array  $data Event payload
     */
    private function emitSSE(string $type, array $data): void
    {
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

## Output Format

Return a single strict JSON object with:
- assistant_message (string)
- operations (array of write/delete operations)

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
  <link rel="stylesheet" href="/assets/css/tailwind.css">
  <link rel="stylesheet" href="/assets/css/style.css">
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
- Mobile menus must use `fixed inset-0 z-[60]` to sit above all content, with close button always reachable

**Footer must always:**
- Include copyright with year
- Close `</main>`, `</body>`, `</html>`
- Load scripts: `main.js`, `navigation.js`
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
  /* Design tokens: palette, fonts, spacing */
}
html { scroll-behavior: smooth; }
body { font-family: var(--font-body); background: var(--color-bg); color: var(--color-text); line-height:1.7; }

/* ONLY @keyframes and [data-reveal] below — NEVER component classes like .hero, .card, .btn */
```

Preflight resets (box-sizing, link underlines, list bullets, img block display, heading/form normalization) are automatically prepended to `tailwind.css` by the TailwindCompiler.

## Rules

1. Use PHP includes for header/nav/footer. Never duplicate nav across pages.
2. **ALL HTML styling uses Tailwind utility classes** (`flex`, `bg-gray-900`, `px-6`, `py-24`, `text-white`, `hover:bg-primary-600`, `md:grid-cols-3`). Use `style.css` ONLY for `:root` design tokens + `@keyframes` + `[data-reveal]`.
3. Semantic HTML5 with proper heading hierarchy.
4. Never output `assets/css/tailwind.css` — it is compiled automatically from your HTML.
5. Custom CSS in `assets/css/style.css` only for design tokens and effects Tailwind can't express (complex animations, scroll-driven effects).
6. JavaScript in `assets/js/main.js` + `assets/js/navigation.js`. Vanilla ES6 only.
7. Responsive design from 320px to 2560px. Mobile-first approach.
8. No external scripts or CDN assets. Google Fonts `<link>` tags are allowed in header.php.
9. Use Tailwind-styled `<div>` placeholders with descriptive text instead of missing images.
10. Two-space indentation. Commented sections.
11. Forms use the schema-driven system: create `assets/forms/{form_id}.json` with the schema AND the HTML form with `action="/submit.php"` and `<input type="hidden" name="form_id" value="{form_id}">`. Form AJAX handling is shipped code (auto-injected by the engine) — never generate form JavaScript. Never use PHP mail() or $_POST handling.
12. CRITICAL: Never put raw HTML directly after `<?php` without closing the PHP block first with `?>`. Partials that start with HTML should NOT open with `<?php`.
13. Home page links MUST use `href="/"` — never `/home`, `/index`, or `/index.php`. The home page is `index.php` served at `/`.
14. All color custom properties in `style.css` MUST use the `--color-` prefix (e.g. `--color-primary`, `--color-bg`, `--color-dark-800`). This enables the Tailwind compiler to resolve classes like `bg-primary`, `text-accent`, `bg-dark-800` automatically.
15. **NEVER create custom component classes** like `.hero-section`, `.btn-primary`, `.card`, `.section-header`, `.fragrance-card`, `.collection-grid`. These bypass the TailwindCompiler. Use Tailwind utilities in HTML instead. For one-off effects, use inline `style="..."` attributes.
16. When REMOVING a page, you MUST emit a `<file path="page.php" action="delete" />` tag for each file AND update `_partials/nav.php`. Both are required — without the delete tag, the file stays on disk.
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
- In PHP: ALWAYS use double-quoted strings for ANY text that contains apostrophes — in array values, echo statements, variable assignments, or any other PHP string context:
  WRONG: 'description' => 'We're here to help'
  RIGHT: 'description' => "We're here to help"
  WRONG: echo 'It's easy';
  RIGHT: echo "It's easy";
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
