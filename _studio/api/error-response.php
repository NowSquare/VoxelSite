<?php

declare(strict_types=1);

// Register before bootstrap: configuration and service construction can fail
// before an endpoint gets a chance to return its own structured error.
set_exception_handler(static function (Throwable $exception): void {
    // Exception messages and traces may contain credentials or request input.
    // Keep diagnostic location information in the server log only.
    error_log(sprintf('VoxelSite API: uncaught %s in %s:%d',
        get_class($exception), $exception->getFile(), $exception->getLine()));

    $error = [
        'code' => 'internal_error',
        'message' => 'The server could not complete the request. Try again. If it keeps happening, check the server error log.',
    ];

    if (!headers_sent()) {
        // Discard unfinished endpoint output, including nested buffers. A
        // non-removable compression/callback buffer must remain installed;
        // clear it when allowed and stop instead of looping at the same level.
        for ($remaining = ob_get_level(); $remaining > 0; $remaining--) {
            $buffer = ob_get_status();
            if ($buffer === false) break;
            if (($buffer['flags'] & PHP_OUTPUT_HANDLER_REMOVABLE) !== 0) {
                if (!@ob_end_clean()) break;
                continue;
            }
            if (($buffer['flags'] & PHP_OUTPUT_HANDLER_CLEANABLE) !== 0) @ob_clean();
            break;
        }
        http_response_code(500);
        header_remove('Content-Length');
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        echo json_encode(['ok' => false, 'error' => $error]);
        return;
    }

    // A live event stream cannot change its HTTP status or switch to JSON.
    // A terminal SSE error lets the client stop instead of treating a close as
    // success. Leave other committed response bodies untouched.
    foreach (headers_list() as $header) {
        if (preg_match('/^Content-Type:\s*text\/event-stream\b/i', $header)) {
            echo "\n\ndata: " . json_encode(['type' => 'error'] + $error + ['outcome_unknown' => true]) . "\n\n";
            flush();
            break;
        }
    }
});
