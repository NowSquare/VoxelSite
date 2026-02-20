<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * VoxelSite Structured Logger
 *
 * Production-grade logging for debugging AI generation failures, form
 * submission errors, file operation issues, and every other critical path.
 *
 * Design decisions:
 * ─────────────────
 * 1. **Daily rotation**: One file per day (YYYY-MM-DD.log), not one giant file.
 *    Easy to find yesterday's bug, easy to clean up old logs.
 *
 * 2. **JSON lines**: Each log entry is a single JSON line. Grep-friendly,
 *    jq-friendly, parseable by any tool. No ambiguous multi-line formats.
 *
 * 3. **Channels**: Each log entry has a channel (ai, parser, files, forms,
 *    api, auth, system) so you can filter by subsystem.
 *
 * 4. **Context**: Every entry can carry arbitrary structured context:
 *    file paths, error details, stack traces, request data, AI model info.
 *    This is where the debugging gold lives.
 *
 * 5. **Levels**: DEBUG, INFO, WARNING, ERROR, CRITICAL (PSR-3 inspired).
 *    Default minimum level is WARNING in production, DEBUG in development.
 *
 * 6. **Request ID**: Every request gets a unique ID that's included in all
 *    log entries. Trace a complete request across multiple log calls.
 *
 * 7. **Auto-cleanup**: Logs older than 30 days are pruned automatically
 *    (~1% chance per request to avoid overhead).
 *
 * Usage:
 *   use VoxelSite\Logger;
 *
 *   Logger::info('ai', 'Stream started', ['model' => 'claude-3.5']);
 *   Logger::error('files', 'PHP syntax error after write', [
 *       'path'  => 'contact.php',
 *       'error' => 'Parse error: unexpected token...',
 *       'content_length' => 4523,
 *   ]);
 *   Logger::critical('forms', 'Submission handler crashed', [
 *       'form_id'   => 'contact',
 *       'exception' => $e->getMessage(),
 *       'trace'     => $e->getTraceAsString(),
 *   ]);
 *
 * Log format (each line):
 *   {"ts":"2026-02-15T11:00:00.123Z","level":"ERROR","ch":"ai","rid":"a1b2c3","msg":"...","ctx":{...}}
 *
 * Grepping:
 *   grep '"level":"ERROR"' _studio/logs/2026-02-15.log
 *   grep '"ch":"ai"' _studio/logs/2026-02-15.log | jq .
 *   grep '"ch":"forms"' _studio/logs/*.log
 */
class Logger
{
    // ── Log levels (lower = more verbose) ──
    public const DEBUG    = 0;
    public const INFO     = 1;
    public const WARNING  = 2;
    public const ERROR    = 3;
    public const CRITICAL = 4;

    private const LEVEL_NAMES = [
        self::DEBUG    => 'DEBUG',
        self::INFO     => 'INFO',
        self::WARNING  => 'WARNING',
        self::ERROR    => 'ERROR',
        self::CRITICAL => 'CRITICAL',
    ];

    /** @var int Minimum level to log. Entries below this are silently discarded. */
    private static int $minLevel = self::DEBUG;

    /** @var string|null Request ID for correlating entries within a single request. */
    private static ?string $requestId = null;

    /** @var string Path to the logs directory. */
    private static string $logDir = '';

    /** @var bool Whether the logger has been initialized. */
    private static bool $initialized = false;

    /** @var int Max age of log files in days. */
    private const MAX_AGE_DAYS = 30;

    // ═══════════════════════════════════════════
    //  Public API — static convenience methods
    // ═══════════════════════════════════════════

    /**
     * Log a DEBUG entry.
     *
     * Use for: detailed tracing during development.
     * Examples: token counts, context sizes, file contents before/after.
     */
    public static function debug(string $channel, string $message, array $context = []): void
    {
        self::log(self::DEBUG, $channel, $message, $context);
    }

    /**
     * Log an INFO entry.
     *
     * Use for: significant events during normal operation.
     * Examples: stream started, file written, form submitted, user logged in.
     */
    public static function info(string $channel, string $message, array $context = []): void
    {
        self::log(self::INFO, $channel, $message, $context);
    }

    /**
     * Log a WARNING entry.
     *
     * Use for: recoverable issues that indicate something is off.
     * Examples: PHP syntax error in generated file (auto-repair will try),
     *           AI response truncated, rate limit approaching.
     */
    public static function warning(string $channel, string $message, array $context = []): void
    {
        self::log(self::WARNING, $channel, $message, $context);
    }

    /**
     * Log an ERROR entry.
     *
     * Use for: failures that affect the user but don't crash the system.
     * Examples: AI call failed, form submission rejected by validation,
     *           file write permission denied, auto-repair failed.
     */
    public static function error(string $channel, string $message, array $context = []): void
    {
        self::log(self::ERROR, $channel, $message, $context);
    }

    /**
     * Log a CRITICAL entry.
     *
     * Use for: severe failures that require immediate attention.
     * Examples: database corruption, config.json missing, complete stream
     *           failure with data loss, unrecoverable exception.
     */
    public static function critical(string $channel, string $message, array $context = []): void
    {
        self::log(self::CRITICAL, $channel, $message, $context);
    }

    // ═══════════════════════════════════════════
    //  Core logging
    // ═══════════════════════════════════════════

    /**
     * Write a log entry.
     *
     * Each entry is a single JSON line in the daily log file.
     * Silent on failure — logging must never crash the application.
     */
    public static function log(int $level, string $channel, string $message, array $context = []): void
    {
        if (!self::$initialized) {
            self::init();
        }

        if ($level < self::$minLevel) {
            return;
        }

        $entry = [
            'ts'    => self::timestamp(),
            'level' => self::LEVEL_NAMES[$level] ?? 'UNKNOWN',
            'ch'    => $channel,
            'rid'   => self::getRequestId(),
            'msg'   => $message,
        ];

        // Add context only if non-empty (keeps lines short for simple entries)
        if (!empty($context)) {
            // Truncate very large values to prevent log bloat
            $entry['ctx'] = self::sanitizeContext($context);
        }

        $line = json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";

        $file = self::$logDir . '/' . gmdate('Y-m-d') . '.log';

        // Append atomically — file_put_contents with LOCK_EX prevents interleaving
        @file_put_contents($file, $line, FILE_APPEND | LOCK_EX);

        // Probabilistic cleanup: ~1% of requests
        if (random_int(1, 100) === 1) {
            self::cleanup();
        }
    }

    // ═══════════════════════════════════════════
    //  Convenience: log an exception
    // ═══════════════════════════════════════════

    /**
     * Log an exception with full context.
     *
     * Automatically extracts message, code, file, line, and a truncated trace.
     */
    public static function exception(string $channel, \Throwable $e, array $extraContext = []): void
    {
        $context = array_merge([
            'exception' => get_class($e),
            'message'   => $e->getMessage(),
            'code'      => $e->getCode(),
            'file'      => self::shortenPath($e->getFile()),
            'line'      => $e->getLine(),
            'trace'     => self::truncateTrace($e->getTraceAsString()),
        ], $extraContext);

        self::error($channel, 'Exception: ' . $e->getMessage(), $context);
    }

    // ═══════════════════════════════════════════
    //  Configuration
    // ═══════════════════════════════════════════

    /**
     * Set the minimum log level.
     */
    public static function setMinLevel(int $level): void
    {
        self::$minLevel = $level;
    }

    /**
     * Get the current request ID (lazy-generated).
     */
    public static function getRequestId(): string
    {
        if (self::$requestId === null) {
            self::$requestId = substr(bin2hex(random_bytes(4)), 0, 8);
        }
        return self::$requestId;
    }

    // ═══════════════════════════════════════════
    //  Internals
    // ═══════════════════════════════════════════

    /**
     * Initialize the logger: set log directory, ensure it exists.
     */
    private static function init(): void
    {
        self::$initialized = true;
        self::$logDir = dirname(__DIR__) . '/logs';

        if (!is_dir(self::$logDir)) {
            @mkdir(self::$logDir, 0755, true);
        }

        // Ensure .htaccess blocks web access
        $htaccess = self::$logDir . '/.htaccess';
        if (!file_exists($htaccess)) {
            @file_put_contents($htaccess, "deny from all\n");
        }
    }

    /**
     * Generate a high-precision UTC timestamp.
     */
    private static function timestamp(): string
    {
        $now = \DateTimeImmutable::createFromFormat('U.u', sprintf('%.6f', microtime(true)));
        return $now->setTimezone(new \DateTimeZone('UTC'))->format('Y-m-d\TH:i:s.v\Z');
    }

    /**
     * Sanitize context values to prevent log bloat.
     *
     * - Truncates strings longer than 10KB
     * - Converts non-serializable types to strings
     */
    private static function sanitizeContext(array $context, int $depth = 0): array
    {
        if ($depth > 5) {
            return ['__truncated' => 'max depth exceeded'];
        }

        $sanitized = [];
        foreach ($context as $key => $value) {
            if (is_string($value) && strlen($value) > 10000) {
                $sanitized[$key] = substr($value, 0, 10000) . '...[truncated at 10KB]';
            } elseif (is_array($value)) {
                $sanitized[$key] = self::sanitizeContext($value, $depth + 1);
            } elseif (is_object($value)) {
                $sanitized[$key] = get_class($value) . '(...)';
            } elseif (is_resource($value)) {
                $sanitized[$key] = 'resource(' . get_resource_type($value) . ')';
            } else {
                $sanitized[$key] = $value;
            }
        }
        return $sanitized;
    }

    /**
     * Remove the server-specific prefix from file paths.
     */
    private static function shortenPath(string $path): string
    {
        $root = $_SERVER['DOCUMENT_ROOT'] ?? '';
        if ($root && str_starts_with($path, $root)) {
            return ltrim(substr($path, strlen($root)), '/');
        }
        return $path;
    }

    /**
     * Truncate a stack trace to a reasonable length.
     */
    private static function truncateTrace(string $trace): string
    {
        $lines = explode("\n", $trace);
        if (count($lines) > 15) {
            return implode("\n", array_slice($lines, 0, 15)) . "\n...[" . (count($lines) - 15) . " more frames]";
        }
        return $trace;
    }

    /**
     * Delete log files older than MAX_AGE_DAYS.
     */
    private static function cleanup(): void
    {
        $cutoff = strtotime('-' . self::MAX_AGE_DAYS . ' days');
        $files = glob(self::$logDir . '/*.log');

        if (!$files) return;

        foreach ($files as $file) {
            // Parse date from filename (YYYY-MM-DD.log)
            $basename = basename($file, '.log');
            $fileDate = strtotime($basename);
            if ($fileDate && $fileDate < $cutoff) {
                @unlink($file);
            }
        }
    }
}
