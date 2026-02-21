<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Parse AI responses into file operations and user messages.
 *
 * This class is deceptively critical. A single parsing bug means
 * corrupted files or lost content. The AI wraps file output in
 * <file path="..." action="write|delete"> tags, and the user
 * message in <message> tags.
 *
 * Edge cases handled:
 * - Truncated responses (AI hit token limit)
 * - No file tags (AI asked a clarifying question)
 * - Path traversal attempts
 * - Duplicate paths (last wins)
 * - Malformed/incomplete file tags
 * - Empty file content
 * - HTML tags inside file content that could confuse parsing
 */
class ResponseParser
{
    /** Maximum file size we'll accept (500KB) */
    private const MAX_FILE_SIZE = 512000;

    /** Allowed file path patterns */
    private const ALLOWED_PATTERNS = [
        '/^[a-zA-Z0-9_-]+\.php$/',                     // Root PHP page files
        '/^_partials\/[a-zA-Z0-9_.-]+\.php$/',          // Shared partials (header, footer, nav)
        '/^assets\/css\/[a-zA-Z0-9_.-]+\.css$/',        // CSS files
        '/^assets\/js\/[a-zA-Z0-9_.-]+\.js$/',          // JS files
        '/^assets\/data\/[a-zA-Z0-9_.-]+\.json$/',      // Data layer JSON files
        '/^assets\/forms\/[a-zA-Z0-9_.-]+\.json$/',     // Form schema definitions
    ];

    /** Files the AI sometimes generates but should be silently ignored (shipped infrastructure) */
    private const SILENTLY_IGNORED = [
        '.htaccess',
        'assets/css/tailwind.css', // Compiled by TailwindCompiler — AI must never write this
    ];

    /**
     * Cursor for incremental streaming parse.
     *
     * Tracks how far into the buffer we've already scanned so
     * parseStreaming() only examines new content on each call.
     * Without this, every token triggers a full-buffer regex — O(n²).
     */
    private int $streamCursor = 0;
    private int $streamDeleteCursor = 0;

    /**
     * Reset streaming state between conversations.
     *
     * Must be called before starting a new streaming session,
     * otherwise the cursor from a previous stream would skip
     * the beginning of the new response.
     */
    public function resetStreamState(): void
    {
        $this->streamCursor = 0;
        $this->streamDeleteCursor = 0;
    }

    /**
     * Parse a complete AI response into structured operations.
     *
     * Returns an associative array with:
     * - operations: array of {path, action, content} for file writes/deletes
     * - message: the human-readable explanation
     * - warnings: any issues encountered during parsing
     * - raw_response: the original response for debugging
     *
     * @return array{operations: array, message: string, warnings: array, raw_response: string}
     */
    public function parse(string $response): array
    {
        $structured = $this->parseStructuredPayload($response);
        if ($structured !== null) {
            Logger::debug('parser', 'Using structured payload format', [
                'operation_count' => count($structured['operations']),
                'warning_count'  => count($structured['warnings']),
            ]);
            return [
                'operations'   => $structured['operations'],
                'message'      => $structured['message'],
                'warnings'     => $structured['warnings'],
                'raw_response' => $response,
            ];
        }

        $operations = [];
        $warnings = [];
        $message = '';
        $seenPaths = [];

        // ── Pass 1: Extract write operations ──
        // The </file> closing tag appears on its own line (system prompt
        // instructs the AI to do this). We match accordingly.
        preg_match_all(
            '/<file\s+path="([^"]+)"\s+action="write"\s*>(.*?)\n<\/file>/s',
            $response,
            $writeMatches,
            PREG_SET_ORDER
        );

        foreach ($writeMatches as $match) {
            $path = trim($match[1]);
            $content = $match[2];

            // Remove leading newline if present (artifact of tag placement)
            $content = ltrim($content, "\n");

            // ── Validate path ──
            $pathError = $this->validatePath($path);
            if ($pathError !== null) {
                if ($pathError !== '%%SILENT%%') {
                    $warnings[] = "Skipped '{$path}': {$pathError}";
                }
                continue;
            }

            // ── Validate content ──
            $contentError = $this->validateContent($path, $content);
            if ($contentError !== null) {
                $warnings[] = "Skipped '{$path}': {$contentError}";
                continue;
            }

            // ── Handle duplicates (last wins) ──
            if (isset($seenPaths[$path])) {
                $warnings[] = "Duplicate path '{$path}' — using the last version.";
            }
            $seenPaths[$path] = true;

            $operations[$path] = [
                'path'    => $path,
                'action'  => 'write',
                'content' => $content,
            ];
        }

        // ── Pass 2: Extract delete operations ──
        // Support both self-closing <file ... action="delete"/>
        // and body form <file ... action="delete"></file>
        preg_match_all(
            '/<file\s+path="([^"]+)"\s+action="delete"\s*\/>/s',
            $response,
            $deleteMatches,
            PREG_SET_ORDER
        );
        // Also match <file path="..." action="delete">...</file>
        preg_match_all(
            '/<file\s+path="([^"]+)"\s+action="delete"\s*>.*?\n<\/file>/s',
            $response,
            $deleteBodyMatches,
            PREG_SET_ORDER
        );

        foreach (array_merge($deleteMatches, $deleteBodyMatches) as $match) {
            $path = trim($match[1]);

            $pathError = $this->validatePath($path);
            if ($pathError !== null) {
                if ($pathError !== '%%SILENT%%') {
                    $warnings[] = "Skipped delete of '{$path}': {$pathError}";
                }
                continue;
            }

            $operations[$path] = [
                'path'    => $path,
                'action'  => 'delete',
                'content' => null,
            ];
        }

        // ── Pass 2b: Extract merge operations ──
        // <file path="assets/data/memory.json" action="merge">{"set":{...},"remove":[...]}</file>
        preg_match_all(
            '/<file\s+path="([^"]+)"\s+action="merge"\s*>(.*?)\n<\/file>/s',
            $response,
            $mergeMatches,
            PREG_SET_ORDER
        );

        foreach ($mergeMatches as $match) {
            $path = trim($match[1]);
            $rawContent = trim($match[2]);

            $pathError = $this->validatePath($path);
            if ($pathError !== null) {
                if ($pathError !== '%%SILENT%%') {
                    $warnings[] = "Skipped merge of '{$path}': {$pathError}";
                }
                continue;
            }

            // Parse the JSON merge payload
            $mergeData = json_decode($rawContent, true);
            if (!is_array($mergeData)) {
                $warnings[] = "Skipped merge of '{$path}': content is not valid JSON.";
                continue;
            }

            $operations[$path] = [
                'path'    => $path,
                'action'  => 'merge',
                'content' => $mergeData,
            ];
        }

        // ── Pass 3: Extract message ──
        if (preg_match('/<message>(.*?)<\/message>/s', $response, $msgMatch)) {
            $message = trim($msgMatch[1]);
        }

        // If no file tags found, the entire response is the message
        // (AI asked a clarifying question or gave a text-only answer)
        if (empty($operations) && empty($message)) {
            // Strip any file tags that were malformed, keep the rest
            $message = trim(preg_replace('/<\/?file[^>]*>/', '', $response));
        }

        // ── Check for truncation ──
        $this->detectTruncation($response, $operations, $warnings);

        return [
            'operations'   => array_values($operations),
            'message'      => $message,
            'warnings'     => $warnings,
            'raw_response' => $response,
        ];
    }

    /**
     * Extract assistant-facing message text from a stored AI response.
     *
     * Supports:
     * - Legacy XML-like envelope (<message>...</message>)
     * - Structured JSON envelope ({assistant_message, operations})
     * - Plain-text fallback
     */
    public function extractAssistantMessage(string $response): string
    {
        if ($response === '') {
            return '';
        }

        if (preg_match('/<message>(.*?)<\/message>/s', $response, $msgMatch)) {
            return trim((string) $msgMatch[1]);
        }

        $structured = $this->parseStructuredPayload($response);
        if ($structured !== null && $structured['message'] !== '') {
            return $structured['message'];
        }

        // Fallback: strip legacy file tags if present and return the rest.
        return trim((string) preg_replace('/<\/?file[^>]*>/', '', $response));
    }

    /**
     * Parse a streaming response for completed file blocks.
     *
     * Called during streaming to detect when a file block has been
     * fully received. Returns completed operations without waiting
     * for the full response. This enables progressive preview updates.
     *
     * Uses a cursor to avoid re-scanning earlier content. On each
     * call, only the region from the cursor to the buffer end is
     * examined — making total work O(n) instead of O(n²).
     *
     * @return array<int, array{path: string, action: string, content: string|null}>
     */
    public function parseStreaming(string $bufferSoFar): array
    {
        $completed = [];
        $closingTag = "\n</file>";
        $closingLen = strlen($closingTag);
        $bufferLen = strlen($bufferSoFar);

        // Start scanning from where we left off last time.
        $searchFrom = $this->streamCursor;

        while ($searchFrom < $bufferLen) {
            // Look for the next </file> closing tag from our cursor.
            $closePos = strpos($bufferSoFar, $closingTag, $searchFrom);
            if ($closePos === false) {
                break; // No more complete blocks yet
            }

            // Found a closing tag — now back-scan to find the matching opener.
            // We search backwards from the close position for the opening <file> tag.
            // The region between cursor start and close position is bounded.
            $searchRegion = substr($bufferSoFar, $this->streamCursor, ($closePos + $closingLen) - $this->streamCursor);

            if (preg_match(
                '/<file\s+path="([^"]+)"\s+action="write"\s*>(.*?)\n<\/file>$/s',
                $searchRegion,
                $match
            )) {
                $path = trim($match[1]);
                $content = ltrim($match[2], "\n");

                if ($this->validatePath($path) === null && $this->validateContent($path, $content) === null) {
                    $completed[] = [
                        'path'    => $path,
                        'action'  => 'write',
                        'content' => $content,
                    ];
                }
            }

            // Advance cursor past this closing tag so we never re-scan it.
            $this->streamCursor = $closePos + $closingLen;
            $searchFrom = $this->streamCursor;
        }

        // Also detect self-closing delete tags: <file path="..." action="delete" />
        // These don't have a </file> closing tag, so scan separately.
        $newRegion = substr($bufferSoFar, $this->streamDeleteCursor ?? 0);
        if (preg_match_all(
            '/<file\s+path="([^"]+)"\s+action="delete"\s*\/>/s',
            $newRegion,
            $deleteMatches,
            PREG_SET_ORDER | PREG_OFFSET_CAPTURE
        )) {
            foreach ($deleteMatches as $match) {
                $path = trim($match[1][0]);
                if ($this->validatePath($path) === null) {
                    $completed[] = [
                        'path'    => $path,
                        'action'  => 'delete',
                        'content' => null,
                    ];
                }
                // Advance the delete cursor past this match
                $matchEnd = ($this->streamDeleteCursor ?? 0) + $match[0][1] + strlen($match[0][0]);
                $this->streamDeleteCursor = $matchEnd;
            }
        }

        return $completed;
    }

    /**
     * Validate a file path for security and correctness.
     *
     * @return string|null Error message, or null if valid.
     *                     Returns '%%SILENT%%' for files that should be dropped without warning.
     */
    private function validatePath(string $path): ?string
    {
        if (empty($path)) {
            return 'Empty path.';
        }

        // Silently ignore shipped infrastructure files the AI sometimes generates
        if (in_array($path, self::SILENTLY_IGNORED, true)) {
            return '%%SILENT%%';
        }

        // Block directory traversal
        if (str_contains($path, '..')) {
            return 'Path traversal blocked.';
        }

        // Block absolute paths
        if (str_starts_with($path, '/')) {
            return 'Absolute paths not allowed.';
        }

        // Block writes to _studio
        if (str_starts_with($path, '_studio')) {
            return 'Cannot write to _studio directory.';
        }

        // Normalize path separators
        $path = str_replace('\\', '/', $path);

        // Check against allowed patterns
        $allowed = false;
        foreach (self::ALLOWED_PATTERNS as $pattern) {
            if (preg_match($pattern, $path)) {
                $allowed = true;
                break;
            }
        }

        if (!$allowed) {
            return "Path doesn't match any allowed pattern.";
        }

        return null;
    }

    /**
     * Validate file content for completeness and correctness.
     *
     * @return string|null Error message, or null if valid
     */
    private function validateContent(string $path, string $content): ?string
    {
        // Check for empty content
        if (trim($content) === '') {
            return 'Empty file content.';
        }

        // Check file size
        if (strlen($content) > self::MAX_FILE_SIZE) {
            return 'File exceeds ' . self::MAX_FILE_SIZE . ' bytes.';
        }

        // PHP page file validation (root-level .php files like index.php, about.php)
        if (str_ends_with($path, '.php') && !str_starts_with($path, '_partials/')) {
            if (!str_contains($content, '<?php') && !str_contains($content, '<?=')) {
                return 'PHP page file missing <?php tag — likely truncated.';
            }
        }

        // Partial file validation (_partials/header.php, _partials/footer.php, etc.)
        // Accept any file with PHP tags, HTML tags, or common partial content
        if (str_starts_with($path, '_partials/') && str_ends_with($path, '.php')) {
            $hasValidContent =
                str_contains($content, '<?php') ||
                str_contains($content, '<?=') ||
                str_contains($content, '<!DOCTYPE') ||
                str_contains($content, '<script') ||
                str_contains($content, '<style') ||
                str_contains($content, '<link') ||
                str_contains($content, '<nav') ||
                str_contains($content, '<header') ||
                str_contains($content, '<footer') ||
                str_contains($content, '<div') ||
                str_contains($content, '<section') ||
                str_contains($content, '<form') ||
                str_contains($content, '<ul') ||
                str_contains($content, '<meta');
            if (!$hasValidContent) {
                return 'Partial file missing PHP or HTML markers — likely truncated.';
            }
        }

        // CSS file validation
        if (str_ends_with($path, '.css')) {
            $hasRules = str_contains($content, '{');
            $hasAtRules = (bool) preg_match('/@(tailwind|import|layer|apply|theme|config|charset|font-face|media|keyframes|supports|use)\b/', $content);
            if (!$hasRules && !$hasAtRules) {
                return 'CSS file has no rules — likely truncated or empty.';
            }
        }

        return null;
    }

    /**
     * Detect if the AI response was truncated (hit token limit).
     *
     * A truncated response typically has an unclosed <file> tag
     * at the end. We warn the user and suggest continuing.
     */
    private function detectTruncation(string $response, array $operations, array &$warnings): void
    {
        // Count opening vs closing file tags
        $openCount = preg_match_all('/<file\s+path="[^"]+"\s+action="write"\s*>/', $response);
        $closeCount = preg_match_all('/\n<\/file>/', $response);
        $deleteCount = preg_match_all('/<file\s+path="[^"]+"\s+action="delete"\s*\/>/', $response);

        $expectedCloses = $openCount; // Each write needs a close
        $actualCloses = $closeCount;

        if ($expectedCloses > $actualCloses) {
            $saved = count($operations);
            $total = $openCount + $deleteCount;
            $warnings[] = "Response was truncated. {$saved} of {$total} files saved. Send 'continue' to finish the remaining files.";
        }
    }

    /**
     * Parse structured JSON output envelope.
     *
     * Expected shape:
     * {
     *   "assistant_message": "...",
     *   "operations": [
     *     {"path":"index.php","action":"write","content":"..."},
     *     {"path":"old.php","action":"delete"}
     *   ]
     * }
     *
     * @return array{operations: array, message: string, warnings: array}|null
     */
    private function parseStructuredPayload(string $response): ?array
    {
        $decoded = $this->decodeStructuredJson($response);
        if (!is_array($decoded)) {
            return null;
        }

        $decoded = $this->extractStructuredEnvelope($decoded);
        if (!is_array($decoded)) {
            return null;
        }

        $looksStructured = array_key_exists('operations', $decoded)
            || array_key_exists('assistant_message', $decoded)
            || array_key_exists('assistant_text', $decoded)
            || array_key_exists('message', $decoded);

        if (!$looksStructured) {
            Logger::debug('parser', 'Response does not look structured, falling back to XML parsing');
            return null;
        }

        $warnings = [];
        $message = trim((string) (
            $decoded['assistant_message']
            ?? $decoded['assistant_text']
            ?? $decoded['message']
            ?? ''
        ));

        $rawOps = $decoded['operations'] ?? [];
        if (!is_array($rawOps)) {
            $warnings[] = 'Structured response had non-array "operations"; ignoring operations.';
            $rawOps = [];
        }

        $operations = [];
        $seenPaths = [];

        foreach ($rawOps as $entry) {
            if (!is_array($entry)) {
                $warnings[] = 'Skipped malformed operation entry.';
                continue;
            }

            $path = trim((string) ($entry['path'] ?? ''));
            $action = strtolower(trim((string) ($entry['action'] ?? '')));
            if ($action === 'remove') {
                $action = 'delete';
            }

            if ($action !== 'write' && $action !== 'delete' && $action !== 'merge') {
                $warnings[] = "Skipped '{$path}': invalid action '{$action}'.";
                continue;
            }

            $pathError = $this->validatePath($path);
            if ($pathError !== null) {
                if ($pathError !== '%%SILENT%%') {
                    $warnings[] = "Skipped '{$path}': {$pathError}";
                }
                continue;
            }

            $content = null;
            if ($action === 'merge') {
                // Merge content must be a JSON object. LLMs may send it as
                // a native object or as a stringified JSON blob — accept both.
                $rawContent = $entry['content'] ?? null;
                if (is_string($rawContent)) {
                    $decoded = json_decode($rawContent, true);
                    if (is_array($decoded)) {
                        $rawContent = $decoded;
                    }
                }
                if (!is_array($rawContent)) {
                    $warnings[] = "Skipped '{$path}': merge content must be a JSON object.";
                    continue;
                }
                $content = $rawContent;
            } elseif ($action === 'write') {
                $content = (string) ($entry['content'] ?? '');
                $contentError = $this->validateContent($path, $content);
                if ($contentError !== null) {
                    $warnings[] = "Skipped '{$path}': {$contentError}";
                    continue;
                }
            }

            if (isset($seenPaths[$path])) {
                $warnings[] = "Duplicate path '{$path}' — using the last version.";
            }
            $seenPaths[$path] = true;

            $operations[$path] = [
                'path' => $path,
                'action' => $action,
                'content' => $content,
            ];
        }

        return [
            'operations' => array_values($operations),
            'message' => $message,
            'warnings' => $warnings,
        ];
    }

    /**
     * Decode structured JSON from raw model output.
     *
     * Accepts:
     * - raw JSON object
     * - JSON inside ```json fences
     * - JSON object surrounded by extra text
     * - Truncated JSON with missing closing braces/brackets (repaired)
     *
     * @return array<string, mixed>|null
     */
    private function decodeStructuredJson(string $response): ?array
    {
        $trimmed = trim($response);
        if ($trimmed === '') {
            return null;
        }

        // Strip leading "[]" or "{}" junk that can leak from Claude's
        // tool-use streaming (empty initial input prepended to deltas).
        $trimmed = preg_replace('/^\[\]\s*(?=\{)/', '', $trimmed);
        $trimmed = preg_replace('/^\{\}\s*(?=\{)/', '', $trimmed);

        $candidates = [$trimmed];

        if (preg_match('/```(?:json)?\s*(\{[\s\S]*\})\s*```/i', $trimmed, $match)) {
            $candidates[] = trim((string) $match[1]);
        }

        $firstBrace = strpos($trimmed, '{');
        $lastBrace = strrpos($trimmed, '}');
        if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
            $candidates[] = substr($trimmed, $firstBrace, $lastBrace - $firstBrace + 1);
        }

        foreach ($candidates as $candidate) {
            // First try to fix flattened operations (duplicate keys) before decoding
            $fixed = $this->splitFlattenedOperations($candidate);
            if ($fixed !== null) {
                $decoded = json_decode($fixed, true);
                if (is_array($decoded)) {
                    return $decoded;
                }
            }

            $decoded = json_decode($candidate, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        // ── Attempt JSON repair for truncated responses ──
        // If the AI hit its token limit, the JSON may be missing closing
        // braces/brackets. Count unbalanced openers (outside string literals)
        // and append the matching closers.
        if ($firstBrace !== false) {
            $json = substr($trimmed, $firstBrace);
            $repaired = $this->repairTruncatedJson($json);
            if ($repaired !== null) {
                // Also try splitting flattened operations on the repaired JSON
                $fixed = $this->splitFlattenedOperations($repaired);
                if ($fixed !== null) {
                    $decoded = json_decode($fixed, true);
                    if (is_array($decoded)) {
                        return $decoded;
                    }
                }

                $decoded = json_decode($repaired, true);
                if (is_array($decoded)) {
                    return $decoded;
                }
            }
        }

        return null;
    }

    /**
     * Fix flattened operations where the AI merged all operations
     * into a single JSON object with duplicate keys.
     *
     * Detects the pattern:
     *   {"path":"a","action":"write","content":"...","path":"b","action":"write","content":"..."}
     *
     * And transforms it to:
     *   [{"path":"a","action":"write","content":"..."},{"path":"b","action":"write","content":"..."}]
     *
     * This works by walking the JSON string character by character (respecting
     * string boundaries and escape sequences) to find operation boundaries inside
     * the operations array. It looks for consecutive `"path"` keys at the same
     * nesting depth — each one starts a new operation object.
     *
     * @return string|null Fixed JSON string, or null if pattern not detected
     */
    private function splitFlattenedOperations(string $json): ?string
    {
        // Quick check: does the raw string contain multiple "path" keys?
        // (indicating flattened operations)
        $pathCount = substr_count($json, '"path"');
        if ($pathCount <= 1) {
            return null; // Not flattened or only one operation
        }

        // Find the operations array opening bracket
        $opsKey = strpos($json, '"operations"');
        if ($opsKey === false) {
            return null;
        }

        // Find the opening '[' after "operations":
        $bracketPos = strpos($json, '[', $opsKey);
        if ($bracketPos === false) {
            return null;
        }

        // Find the first '{' after the bracket (start of first operation)
        $firstObjBrace = strpos($json, '{', $bracketPos);
        if ($firstObjBrace === false) {
            return null;
        }

        // Extract everything inside the operations array (from after '[' to the end)
        // We'll walk the JSON to find each operation boundary
        $opsContent = substr($json, $firstObjBrace);

        // Walk character by character to find "path" keys at depth=1 (inside the array object)
        $operations = [];
        $depth = 0;
        $inString = false;
        $escape = false;
        $len = strlen($opsContent);
        $currentOpStart = 0;
        $firstOp = true;
        $pathPositions = [];

        for ($i = 0; $i < $len; $i++) {
            $c = $opsContent[$i];

            if ($escape) {
                $escape = false;
                continue;
            }

            if ($c === '\\' && $inString) {
                $escape = true;
                continue;
            }

            if ($c === '"') {
                $inString = !$inString;

                // Check if this starts a "path" key at depth 1
                if (!$inString && $depth === 1) {
                    // We just closed a string — check if it was "path"
                    // Look back to find the opening quote
                    if ($i >= 5 && substr($opsContent, $i - 5, 6) === '"path"') {
                        // Check that there's no alphanumeric char before (to avoid matching partial keys)
                        $beforeQuote = ($i >= 6) ? $opsContent[$i - 6] : ',';
                        if (!$firstOp && ($beforeQuote === ',' || $beforeQuote === '{')) {
                            // This is a new operation boundary
                            $pathPositions[] = $i - 5;
                        }
                        $firstOp = false;
                    }
                }
                continue;
            }

            if ($inString) {
                continue;
            }

            if ($c === '{') {
                $depth++;
            } elseif ($c === '[') {
                $depth++;
            } elseif ($c === '}') {
                $depth--;
            } elseif ($c === ']') {
                $depth--;
            }
        }

        if (empty($pathPositions)) {
            return null; // No split points found
        }

        // Split the operations content at each boundary
        $opStrings = [];
        $prevPos = 0;
        foreach ($pathPositions as $pos) {
            // The boundary is at the comma before "path"
            // Go back from $pos to find the comma
            $commaPos = $pos;
            for ($j = $pos - 1; $j >= 0; $j--) {
                if ($opsContent[$j] === ',') {
                    $commaPos = $j;
                    break;
                }
            }

            $chunk = substr($opsContent, $prevPos, $commaPos - $prevPos);
            // Ensure the chunk starts with { and ends with }
            $chunk = trim($chunk);
            if (!str_starts_with($chunk, '{')) {
                $chunk = '{' . $chunk;
            }
            if (!str_ends_with($chunk, '}')) {
                $chunk .= '}';
            }
            $opStrings[] = $chunk;
            $prevPos = $commaPos + 1; // Skip the comma
        }

        // Last operation: from the last split to end
        $lastChunk = substr($opsContent, $prevPos);
        $lastChunk = trim($lastChunk);
        // Clean up any trailing ]} from the outer structure
        $lastChunk = rtrim($lastChunk, " \t\n\r\0\x0B]}");
        if (!str_starts_with($lastChunk, '{')) {
            $lastChunk = '{' . $lastChunk;
        }
        if (!str_ends_with($lastChunk, '}')) {
            $lastChunk .= '}';
        }
        $opStrings[] = $lastChunk;

        // Validate each chunk is valid JSON
        $validOps = [];
        foreach ($opStrings as $opStr) {
            $decoded = json_decode($opStr, true);
            if (is_array($decoded) && isset($decoded['path'])) {
                $validOps[] = $decoded;
            }
        }

        if (count($validOps) <= 1) {
            return null; // Splitting didn't help
        }

        // Extract the prefix (everything before operations array content)
        $prefix = substr($json, 0, $bracketPos + 1); // up to and including '['

        // Reconstruct as proper array
        $opsJson = array_map('json_encode', $validOps);
        $result = $prefix . implode(',', $opsJson) . ']}';

        // Extract assistant_message from the original prefix
        if (preg_match('/"assistant_message"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"/s', $json, $msgMatch)) {
            // Already in the prefix, will be preserved
        }

        return $result;
    }

    /**
     * Attempt to repair truncated JSON by closing unbalanced braces/brackets.
     *
     * Walks the JSON string character by character, tracking whether we're
     * inside a string literal (and handling escapes). Counts unbalanced
     * `{` and `[` openers and appends the corresponding closers.
     *
     * This is intentionally conservative: it only appends closers, never
     * modifies existing content. The last incomplete value (e.g. a truncated
     * string in the final operation's content field) will be lost, but all
     * prior complete operations are preserved.
     *
     * @return string|null Repaired JSON string, or null if repair isn't applicable
     */
    private function repairTruncatedJson(string $json): ?string
    {
        $stack = [];
        $inString = false;
        $escape = false;
        $len = strlen($json);

        for ($i = 0; $i < $len; $i++) {
            $c = $json[$i];

            if ($escape) {
                $escape = false;
                continue;
            }

            if ($c === '\\' && $inString) {
                $escape = true;
                continue;
            }

            if ($c === '"') {
                $inString = !$inString;
                continue;
            }

            if ($inString) {
                continue;
            }

            if ($c === '{') {
                $stack[] = '}';
            } elseif ($c === '[') {
                $stack[] = ']';
            } elseif ($c === '}' || $c === ']') {
                if (!empty($stack) && end($stack) === $c) {
                    array_pop($stack);
                }
            }
        }

        if (empty($stack)) {
            // Already balanced — repair not applicable
            return null;
        }

        // If we're still inside a string, close it first
        if ($inString) {
            $json .= '"';
        }

        // Trim any trailing incomplete key/value (e.g. a dangling comma or colon)
        $json = rtrim($json);
        $lastChar = substr($json, -1);
        if ($lastChar === ',' || $lastChar === ':') {
            $json = substr($json, 0, -1);
        }

        // Append closers in reverse order
        $json .= implode('', array_reverse($stack));

        return $json;
    }

    /**
     * Unwrap tool-calling envelopes to the canonical structured payload.
     *
     * Supported wrappers:
     * - {"arguments": {...}} or {"arguments":"{...}"}
     * - {"function":{"arguments": ...}}
     * - {"tool_calls":[{"function":{"arguments":"{...}"}}]}
     * - {"content":[{"type":"tool_use","input":{...}}]}
     *
     * @param array<string, mixed> $decoded
     * @return array<string, mixed>|null
     */
    private function extractStructuredEnvelope(array $decoded): ?array
    {
        $queue = [$decoded];

        while (!empty($queue)) {
            $candidate = array_shift($queue);
            if (!is_array($candidate)) {
                continue;
            }

            if (
                array_key_exists('operations', $candidate)
                || array_key_exists('assistant_message', $candidate)
                || array_key_exists('assistant_text', $candidate)
                || array_key_exists('message', $candidate)
            ) {
                return $candidate;
            }

            $arguments = $candidate['arguments'] ?? null;
            if (is_array($arguments)) {
                $queue[] = $arguments;
            } elseif (is_string($arguments)) {
                $decodedArguments = json_decode($arguments, true);
                if (is_array($decodedArguments)) {
                    $queue[] = $decodedArguments;
                }
            }

            $function = $candidate['function'] ?? null;
            if (is_array($function)) {
                $queue[] = $function;
            }

            $toolCalls = $candidate['tool_calls'] ?? null;
            if (is_array($toolCalls)) {
                foreach ($toolCalls as $toolCall) {
                    if (is_array($toolCall)) {
                        $queue[] = $toolCall;
                    }
                }
            }

            $content = $candidate['content'] ?? null;
            if (is_array($content)) {
                foreach ($content as $block) {
                    if (!is_array($block)) {
                        continue;
                    }
                    if (($block['type'] ?? '') === 'tool_use' && isset($block['input'])) {
                        if (is_array($block['input'])) {
                            $queue[] = $block['input'];
                        } elseif (is_string($block['input'])) {
                            $decodedInput = json_decode($block['input'], true);
                            if (is_array($decodedInput)) {
                                $queue[] = $decodedInput;
                            }
                        }
                    }
                }
            }
        }

        return null;
    }
}
