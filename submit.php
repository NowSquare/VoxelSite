<?php
/**
 * VoxelSite Form Submission Handler
 *
 * SHIPPED CODE — DO NOT MODIFY VIA AI
 *
 * Handles ALL form submissions by reading the schema from
 * assets/forms/{form_id}.json. The AI defines forms via JSON schemas;
 * this file processes them generically.
 *
 * Flow: validate form_id → load schema → spam check → validate fields
 *       → handle file uploads → store in SQLite → send notification → respond
 *
 * Validation logic is shared with the MCP server via FormValidator.
 * File uploads and spam protection are web-only (this file only).
 *
 * @see assets/forms/{form_id}.json for schema definitions
 * @see _studio/engine/FormValidator.php for shared validation
 */

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use VoxelSite\FormValidator;
use VoxelSite\Logger;

class FormHandler
{
    private string $dataDir;
    private ?PDO $db = null;
    private FormValidator $validator;

    public function __construct()
    {
        // Use __DIR__ instead of DOCUMENT_ROOT — Herd/Valet leaves DOCUMENT_ROOT
        // empty because all requests proxy through server.php. __DIR__ is reliable
        // since submit.php lives at the project root.
        $root = __DIR__;
        $this->dataDir   = $root . '/_data';
        $this->validator = new FormValidator($root . '/assets/forms', $root . '/assets/data');
    }

    /**
     * Main entry point — process the form submission.
     */
    public function handle(): void
    {
        // 1. Only accept POST
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->respond(405, 'Method not allowed');
            return;
        }

        // 2. Extract and validate form_id, load schema
        $formId = $_POST['form_id'] ?? null;
        if (!$formId || !is_string($formId)) {
            $this->respond(400, 'Invalid form identifier');
            return;
        }

        $schema = $this->validator->loadSchema($formId);
        if (!$schema) {
            Logger::warning('forms', 'Form schema not found', ['form_id' => $formId]);
            $this->respond(404, 'Form not found');
            return;
        }

        Logger::info('forms', 'Form submission received', [
            'form_id'    => $formId,
            'ip'         => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'referrer'   => $_SERVER['HTTP_REFERER'] ?? '',
            'user_agent' => mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 120),
            'is_ajax'    => $this->isAjax(),
            'fields'     => array_keys($_POST),
        ]);

        // 3. Spam protection (web-only — MCP has its own rate limiting)
        $spamResult = $this->checkSpam($schema, $formId);
        if ($spamResult !== true) {
            $this->respond(429, $spamResult);
            return;
        }

        // 4. Validate non-file fields via shared FormValidator
        $result = $this->validator->validate($schema, $_POST);

        // 5. Handle file uploads (web-only — MCP doesn't support file uploads)
        $fileData = $this->processFileUploads($schema);
        if (!empty($fileData['errors'])) {
            foreach ($fileData['errors'] as $name => $error) {
                $result['errors'][$name] = $error;
            }
            $result['valid'] = false;
        }

        if (!$result['valid']) {
            Logger::warning('forms', 'Validation failed', [
                'form_id' => $formId,
                'errors'  => $result['errors'],
            ]);
            $this->respond(422, 'Validation failed', $result['errors']);
            return;
        }

        // Merge file paths into validated data
        $data = array_merge($result['data'], $fileData['paths']);

        // 6. Store submission
        $submissionId = $this->store($formId, $data, $schema);

        Logger::info('forms', 'Submission stored', [
            'form_id'       => $formId,
            'submission_id' => $submissionId,
            'field_count'   => count($data),
        ]);

        // 7. Send notification (best-effort)
        $this->notify($schema, $data, $submissionId);

        // 8. Respond
        $successMessage = $schema['submission']['success_message'] ?? 'Thank you for your submission.';
        $redirect = $schema['submission']['success_redirect'] ?? null;

        if ($this->isAjax()) {
            $this->respond(200, $successMessage, null, $submissionId, $redirect);
        } elseif ($redirect) {
            header('Location: ' . $redirect);
            exit;
        } else {
            // Redirect back to referrer with success parameter
            $referrer = $_SERVER['HTTP_REFERER'] ?? '/';
            $separator = str_contains($referrer, '?') ? '&' : '?';
            header('Location: ' . $referrer . $separator . 'form_success=' . urlencode($formId));
            exit;
        }
    }

    // ═══════════════════════════════════════════
    //  Spam Protection (web-only)
    // ═══════════════════════════════════════════

    /**
     * Three-layer spam protection: honeypot, timing, rate limiting.
     *
     * MCP submissions bypass this — they have their own rate limiting
     * in the generated mcp.php endpoint.
     *
     * @return bool|string True on pass, error message string on failure
     */
    private function checkSpam(array $schema, string $formId): bool|string
    {
        $spam = $schema['spam_protection'] ?? [];

        // Honeypot check — field must be empty
        $honeypotField = $spam['honeypot_field'] ?? '_website';
        if (!empty($_POST[$honeypotField])) {
            return 'Submission rejected';
        }

        // Timing check — form must have been open for N seconds
        $minTime = $spam['min_time_seconds'] ?? 3;
        $timestamp = (int) ($_POST['_timestamp'] ?? 0);
        if ($timestamp <= 0) {
            // Missing timestamp — likely a bot stripping hidden fields
            return 'Submission rejected';
        }
        if ((time() - $timestamp) < $minTime) {
            return 'Please take a moment before submitting';
        }

        // Rate limit check
        $maxPerHour = $spam['max_per_ip_per_hour'] ?? 10;
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $db = $this->getDb();
        $windowStart = date('Y-m-d\TH:00:00');

        $stmt = $db->prepare(
            'SELECT count FROM rate_limits WHERE ip_address = ? AND form_id = ? AND window_start = ?'
        );
        $stmt->execute([$ip, $formId, $windowStart]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row && (int) $row['count'] >= $maxPerHour) {
            return 'Too many submissions. Please try again later.';
        }

        // Increment rate limit counter
        $stmt = $db->prepare(
            'INSERT INTO rate_limits (ip_address, form_id, window_start, count)
             VALUES (?, ?, ?, 1)
             ON CONFLICT(ip_address, form_id, window_start)
             DO UPDATE SET count = count + 1'
        );
        $stmt->execute([$ip, $formId, $windowStart]);

        // Periodic cleanup (~1 in 100 requests)
        if (random_int(1, 100) === 1) {
            $db->exec("DELETE FROM rate_limits WHERE window_start < datetime('now', '-24 hours')");
        }

        return true;
    }

    // ═══════════════════════════════════════════
    //  File Upload Processing (web-only)
    // ═══════════════════════════════════════════

    /**
     * Process all file uploads from a form submission.
     *
     * MCP doesn't support file uploads, so this only runs in submit.php.
     *
     * @return array{paths: array<string, string>, errors: array<string, string>}
     */
    private function processFileUploads(array $schema): array
    {
        $paths = [];
        $errors = [];

        foreach ($schema['fields'] as $field) {
            if (($field['type'] ?? '') !== 'file') {
                continue;
            }

            $fileResult = $this->validateFile($field);
            if ($fileResult['error']) {
                $errors[$field['name']] = $fileResult['error'];
            } elseif ($fileResult['path'] !== null) {
                $paths[$field['name']] = $fileResult['path'];
            }
        }

        return ['paths' => $paths, 'errors' => $errors];
    }

    /**
     * Validate and process a single file upload.
     *
     * @return array{error: ?string, path: ?string}
     */
    private function validateFile(array $field): array
    {
        $name = $field['name'];
        $validation = $field['validation'] ?? [];
        $required = $field['required'] ?? false;

        if (!isset($_FILES[$name]) || $_FILES[$name]['error'] === UPLOAD_ERR_NO_FILE) {
            if ($required) {
                return ['error' => $field['label'] . ' is required', 'path' => null];
            }
            return ['error' => null, 'path' => null];
        }

        $file = $_FILES[$name];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['error' => 'File upload failed', 'path' => null];
        }

        // Size check
        $maxMb = $validation['max_size_mb'] ?? 10;
        if ($file['size'] > $maxMb * 1024 * 1024) {
            return ['error' => 'File too large (max ' . $maxMb . 'MB)', 'path' => null];
        }

        // Extension check
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = $validation['allowed_extensions'] ?? ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'doc', 'docx'];
        if (!in_array($ext, $allowed, true)) {
            return ['error' => 'File type not allowed', 'path' => null];
        }

        // Move to _data/uploads/
        $uploadsDir = $this->dataDir . '/uploads';
        if (!is_dir($uploadsDir)) {
            mkdir($uploadsDir, 0755, true);
            // Protect uploads directory
            $htaccess = $uploadsDir . '/.htaccess';
            if (!file_exists($htaccess)) {
                file_put_contents($htaccess, "Order deny,allow\nDeny from all\n");
            }
        }

        $filename = date('Y-m-d_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $destPath = $uploadsDir . '/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            return ['error' => 'Failed to save file', 'path' => null];
        }

        return ['error' => null, 'path' => '_data/uploads/' . $filename];
    }

    // ═══════════════════════════════════════════
    //  Storage
    // ═══════════════════════════════════════════

    /**
     * Store submission in SQLite. Returns submission ID.
     */
    private function store(string $formId, array $data, array $schema): int
    {
        if (!($schema['submission']['store'] ?? true)) {
            return 0;
        }

        $db = $this->getDb();
        $stmt = $db->prepare(
            'INSERT INTO submissions (form_id, data, status, ip_address, user_agent, referrer, source, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        $now = date('c');
        $stmt->execute([
            $formId,
            json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            $schema['default_status'] ?? 'new',
            $_SERVER['REMOTE_ADDR'] ?? '',
            $_SERVER['HTTP_USER_AGENT'] ?? '',
            $_SERVER['HTTP_REFERER'] ?? '',
            'web',
            $now,
            $now,
        ]);

        return (int) $db->lastInsertId();
    }

    // ═══════════════════════════════════════════
    //  Email Notification
    // ═══════════════════════════════════════════

    /**
     * Send email notification to site owner. Best-effort.
     *
     * Uses the Mailer class which reads delivery config from Studio
     * settings (driver, SMTP credentials, etc.) and handles fallback
     * from SMTP → php_mail automatically.
     */
    private function notify(array $schema, array $data, int $submissionId): void
    {
        $emailConfig = $schema['notifications']['email'] ?? null;
        if (!$emailConfig || !($emailConfig['enabled'] ?? false)) {
            return;
        }

        // Load site.json for template placeholders
        $siteJsonPath = __DIR__ . '/assets/data/site.json';
        $siteData = file_exists($siteJsonPath)
            ? json_decode(file_get_contents($siteJsonPath), true)
            : [];

        // Resolve recipient
        $recipient = $this->resolveTemplate($emailConfig['recipient'], $data, $siteData ?? [], $submissionId);
        if (!filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
            return;
        }

        // Resolve subject line
        $subject = $this->resolveTemplate($emailConfig['subject'], $data, $siteData ?? [], $submissionId);

        // Build plain-text body
        $body = 'New submission from ' . ($siteData['name'] ?? 'your website') . "\n";
        $body .= 'Form: ' . ($schema['name'] ?? $schema['id'] ?? 'Unknown') . "\n";
        $body .= 'Date: ' . date('Y-m-d H:i:s') . "\n";
        $body .= 'Source: Web form' . "\n";
        $body .= str_repeat('─', 40) . "\n\n";

        foreach ($data as $key => $value) {
            // Find the human-readable label from the schema
            $label = $key;
            foreach ($schema['fields'] as $field) {
                if ($field['name'] === $key) {
                    $label = $field['label'] ?? $key;
                    break;
                }
            }
            $displayValue = is_array($value) ? implode(', ', $value) : (string) $value;
            $body .= $label . ': ' . $displayValue . "\n";
        }

        $body .= "\n" . str_repeat('─', 40) . "\n";
        $body .= 'Submission ID: #' . $submissionId . "\n";
        $body .= 'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";

        // Build options for Mailer
        $options = [];

        $replyTo = $emailConfig['reply_to'] ?? null;
        if ($replyTo) {
            $resolvedReplyTo = $this->resolveTemplate($replyTo, $data, $siteData ?? [], $submissionId);
            if (filter_var($resolvedReplyTo, FILTER_VALIDATE_EMAIL)) {
                $options['reply_to'] = $resolvedReplyTo;
            }
        }

        // Send via Mailer (handles driver selection, SMTP, fallback, logging)
        // Best-effort — never fail the submission if mail fails
        try {
            \VoxelSite\Mailer::getInstance()->send($recipient, $subject, $body, $options);
            Logger::info('forms', 'Notification email sent', [
                'recipient' => $recipient,
                'subject'   => $subject,
            ]);
        } catch (\Throwable $e) {
            Logger::error('forms', 'Notification email failed', [
                'recipient' => $recipient,
                'subject'   => $subject,
                'exception' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Resolve {{placeholder}} tokens in template strings.
     *
     * Supports: {{field_name}}, {{site.path.to.value}},
     * {{form.name}}, {{submission.id}}, {{submission.date}}, {{submission.ip}}
     */
    private function resolveTemplate(string $template, array $data, array $siteData, int $submissionId): string
    {
        return preg_replace_callback('/\{\{([^}]+)\}\}/', function ($matches) use ($data, $siteData, $submissionId) {
            $key = trim($matches[1]);

            // Site data references (e.g., {{site.contact.email}})
            if (str_starts_with($key, 'site.')) {
                $path = explode('.', substr($key, 5));
                $value = $siteData;
                foreach ($path as $segment) {
                    $value = $value[$segment] ?? null;
                    if ($value === null) {
                        return '';
                    }
                }
                return is_string($value) ? $value : json_encode($value);
            }

            // Form metadata
            if ($key === 'form.name') {
                return $data['_form_name'] ?? '';
            }
            if ($key === 'submission.id') {
                return (string) $submissionId;
            }
            if ($key === 'submission.date') {
                return date('Y-m-d H:i:s');
            }
            if ($key === 'submission.ip') {
                return $_SERVER['REMOTE_ADDR'] ?? '';
            }

            // Field values
            $value = $data[$key] ?? '';
            return is_array($value) ? implode(', ', $value) : (string) $value;
        }, $template);
    }

    // ═══════════════════════════════════════════
    //  Database
    // ═══════════════════════════════════════════

    /**
     * Get or create the SQLite database connection.
     * Auto-creates tables and directories on first use.
     */
    private function getDb(): PDO
    {
        if ($this->db !== null) {
            return $this->db;
        }

        // Ensure _data directory exists
        if (!is_dir($this->dataDir)) {
            mkdir($this->dataDir, 0755, true);
        }

        // Ensure .htaccess protection exists
        $htaccess = $this->dataDir . '/.htaccess';
        if (!file_exists($htaccess)) {
            file_put_contents($htaccess, "Order deny,allow\nDeny from all\n");
        }

        $dbPath = $this->dataDir . '/submissions.db';
        $this->db = new PDO('sqlite:' . $dbPath);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->db->exec('PRAGMA journal_mode=WAL');
        $this->db->exec('PRAGMA foreign_keys=ON');

        // Auto-create tables
        $this->db->exec('
            CREATE TABLE IF NOT EXISTS submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                form_id TEXT NOT NULL,
                data TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT \'new\',
                ip_address TEXT,
                user_agent TEXT,
                referrer TEXT,
                source TEXT DEFAULT \'web\',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                read_at TEXT,
                notes TEXT
            )
        ');
        $this->db->exec('CREATE INDEX IF NOT EXISTS idx_submissions_form ON submissions(form_id)');
        $this->db->exec('CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(form_id, status)');
        $this->db->exec('CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at DESC)');
        $this->db->exec('CREATE INDEX IF NOT EXISTS idx_submissions_source ON submissions(source)');

        $this->db->exec('
            CREATE TABLE IF NOT EXISTS rate_limits (
                ip_address TEXT NOT NULL,
                form_id TEXT NOT NULL,
                window_start TEXT NOT NULL,
                count INTEGER NOT NULL DEFAULT 1,
                PRIMARY KEY (ip_address, form_id, window_start)
            )
        ');

        return $this->db;
    }

    // ═══════════════════════════════════════════
    //  Response
    // ═══════════════════════════════════════════

    /**
     * Send response — JSON for AJAX, redirect for standard POST.
     */
    private function respond(int $status, string $message, ?array $errors = null, ?int $submissionId = null, ?string $redirect = null): void
    {
        http_response_code($status);

        if ($this->isAjax()) {
            header('Content-Type: application/json');
            $response = ['success' => $status === 200, 'message' => $message];
            if ($errors !== null) {
                $response['errors'] = $errors;
            }
            if ($submissionId !== null) {
                $response['submission_id'] = $submissionId;
            }
            if ($redirect !== null && $status === 200) {
                $response['redirect'] = $redirect;
            }
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
        } else {
            if ($status !== 200) {
                $referrer = $_SERVER['HTTP_REFERER'] ?? '/';
                $separator = str_contains($referrer, '?') ? '&' : '?';
                header('Location: ' . $referrer . $separator . 'form_error=' . urlencode($message));
            }
        }
    }

    /**
     * Detect AJAX request (XMLHttpRequest or JSON accept header).
     */
    private function isAjax(): bool
    {
        return (
            ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'XMLHttpRequest' ||
            str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json')
        );
    }
}

// ═══════════════════════════════════════════
//  Execute
// ═══════════════════════════════════════════

try {
    $handler = new FormHandler();
    $handler->handle();
} catch (\Throwable $e) {
    Logger::critical('forms', 'Unhandled exception in form handler', [
        'exception' => get_class($e),
        'message'   => $e->getMessage(),
        'file'      => $e->getFile() . ':' . $e->getLine(),
        'trace'     => $e->getTraceAsString(),
        'form_id'   => $_POST['form_id'] ?? 'unknown',
        'ip'        => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    ]);

    http_response_code(500);
    $isAjax = ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'XMLHttpRequest'
           || str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');
    if ($isAjax) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'An error occurred. Please try again.']);
    } else {
        $referrer = $_SERVER['HTTP_REFERER'] ?? '/';
        $sep = str_contains($referrer, '?') ? '&' : '?';
        header('Location: ' . $referrer . $sep . 'form_error=' . urlencode('An error occurred. Please try again.'));
    }
}
