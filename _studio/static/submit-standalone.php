<?php
/**
 * VoxelSite Standalone Form Handler
 *
 * SHIPPED CODE — included in exported sites (PHP and HTML downloads).
 *
 * Self-contained form handler with zero dependencies — no Composer, no
 * SQLite, no vendor directory. Reads form schemas from assets/forms/
 * and stores submissions as JSON files in _submissions/.
 *
 * This is a stripped-down cousin of the full submit.php. Same schema
 * contract, same response format for form-handler.js compatibility,
 * simpler storage.
 *
 * Features:
 *  - Schema-driven validation (reads assets/forms/{form_id}.json)
 *  - Honeypot + timing spam protection (stateless — no rate limiting)
 *  - JSON file storage in _submissions/{form_id}/
 *  - Email notification via mail() (best-effort)
 *  - AJAX (JSON) and non-AJAX (redirect) responses
 *
 * Does NOT support:
 *  - File uploads (skipped gracefully)
 *  - Rate limiting (needs persistent state)
 *  - SQLite storage (that's the full version)
 *
 * @see assets/forms/{form_id}.json for schema definitions
 */

declare(strict_types=1);

// ── Only accept POST ──

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, 'Method not allowed');
    exit;
}

// ── Extract and validate form_id ──

$formId = $_POST['form_id'] ?? null;
if (!$formId || !is_string($formId) || !preg_match('/^[a-z0-9]([a-z0-9_\-]*[a-z0-9])?$/', $formId)) {
    respond(400, 'Invalid form identifier');
    exit;
}

// ── Load schema ──

$schemaPath = __DIR__ . '/assets/forms/' . $formId . '.json';
if (!file_exists($schemaPath)) {
    respond(404, 'Form not found');
    exit;
}

$schema = json_decode(file_get_contents($schemaPath), true);
if (!is_array($schema) || empty($schema['fields'])) {
    respond(404, 'Form not found');
    exit;
}

// ── Spam protection (stateless — honeypot + timing only) ──

$spam = $schema['spam_protection'] ?? [];

// Honeypot: field must be empty
$honeypotField = $spam['honeypot_field'] ?? '_website';
if (!empty($_POST[$honeypotField])) {
    respond(429, 'Submission rejected');
    exit;
}

// Timing: form must have been open for N seconds
$minTime = $spam['min_time_seconds'] ?? 3;
$timestamp = (int) ($_POST['_timestamp'] ?? 0);
if ($timestamp > 0 && (time() - $timestamp) < $minTime) {
    respond(429, 'Please take a moment before submitting');
    exit;
}

// ── Validate fields ──

$errors = [];
$cleanData = [];

foreach ($schema['fields'] as $field) {
    $name = $field['name'];
    $value = $_POST[$name] ?? null;
    $type = $field['type'] ?? 'text';
    $required = $field['required'] ?? $field['validation']['required'] ?? false;
    $validation = $field['validation'] ?? [];

    // Skip file fields — not supported in standalone handler
    if ($type === 'file') {
        continue;
    }

    // Trim string values
    if (is_string($value)) {
        $value = trim($value);
    }

    // Required check
    if ($required && ($value === null || $value === '' || $value === [])) {
        $errors[$name] = $validation['custom_message'] ?? ($field['label'] ?? $name) . ' is required';
        continue;
    }

    // Skip further validation if empty and not required
    if ($value === null || $value === '' || $value === []) {
        continue;
    }

    // Type-specific validation
    switch ($type) {
        case 'email':
            if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                $errors[$name] = 'Please enter a valid email address';
            }
            break;

        case 'url':
            if (!filter_var($value, FILTER_VALIDATE_URL)) {
                $errors[$name] = 'Please enter a valid URL';
            }
            break;

        case 'number':
            if (!is_numeric($value)) {
                $errors[$name] = 'Please enter a valid number';
            } else {
                $value = (float) $value;
                if (isset($validation['min']) && $value < $validation['min']) {
                    $errors[$name] = 'Minimum value is ' . $validation['min'];
                }
                if (isset($validation['max']) && $value > $validation['max']) {
                    $errors[$name] = 'Maximum value is ' . $validation['max'];
                }
            }
            break;

        case 'select':
        case 'radio':
            $validOptions = array_column($field['options'] ?? [], 'value');
            if (!in_array($value, $validOptions, true)) {
                $errors[$name] = 'Please select a valid option';
            }
            break;

        case 'checkbox':
            $value = in_array($value, ['on', '1', 'true', true], true);
            break;
    }

    // String length validations
    if (is_string($value) && !isset($errors[$name])) {
        if (isset($validation['min_length']) && mb_strlen($value) < $validation['min_length']) {
            $errors[$name] = $validation['pattern_message']
                ?? 'Must be at least ' . $validation['min_length'] . ' characters';
        }
        if (isset($validation['max_length']) && mb_strlen($value) > $validation['max_length']) {
            $errors[$name] = 'Must be no more than ' . $validation['max_length'] . ' characters';
        }
        if (isset($validation['pattern']) && !preg_match('/' . $validation['pattern'] . '/', $value)) {
            $errors[$name] = $validation['pattern_message'] ?? 'Invalid format';
        }
    }

    if (!isset($errors[$name])) {
        $cleanData[$name] = $value;
    }
}

if (!empty($errors)) {
    respond(422, 'Validation failed', $errors);
    exit;
}

// ── Store submission as JSON file ──

$submissionsDir = __DIR__ . '/_submissions';
$formDir = $submissionsDir . '/' . $formId;

// Create directories on first use
if (!is_dir($formDir)) {
    mkdir($formDir, 0755, true);

    // Protect submissions directory from web access
    $htaccess = $submissionsDir . '/.htaccess';
    if (!file_exists($htaccess)) {
        file_put_contents($htaccess, "Order deny,allow\nDeny from all\n");
    }
}

$filename = date('Y-m-d_His') . '_' . bin2hex(random_bytes(4)) . '.json';
$submission = [
    'form_id'      => $formId,
    'submitted_at' => date('c'),
    'ip'           => $_SERVER['REMOTE_ADDR'] ?? '',
    'user_agent'   => mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 200),
    'referrer'     => $_SERVER['HTTP_REFERER'] ?? '',
    'data'         => $cleanData,
];

$written = file_put_contents(
    $formDir . '/' . $filename,
    json_encode($submission, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
);

if ($written === false) {
    respond(500, 'Could not save submission. Please try again.');
    exit;
}

// ── Send notification email (best-effort via mail()) ──

$emailConfig = $schema['notifications']['email'] ?? null;
if ($emailConfig && ($emailConfig['enabled'] ?? false)) {
    $siteJsonPath = __DIR__ . '/assets/data/site.json';
    $siteData = file_exists($siteJsonPath)
        ? json_decode(file_get_contents($siteJsonPath), true) ?? []
        : [];

    $recipient = resolveTemplate($emailConfig['recipient'] ?? '', $cleanData, $siteData);
    $subject = resolveTemplate($emailConfig['subject'] ?? 'New form submission', $cleanData, $siteData);

    if (filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
        $body = 'New submission from ' . ($siteData['name'] ?? 'your website') . "\n";
        $body .= 'Form: ' . ($schema['name'] ?? $formId) . "\n";
        $body .= 'Date: ' . date('Y-m-d H:i:s') . "\n";
        $body .= str_repeat('─', 40) . "\n\n";

        foreach ($cleanData as $key => $val) {
            $label = $key;
            foreach ($schema['fields'] as $f) {
                if ($f['name'] === $key) {
                    $label = $f['label'] ?? $key;
                    break;
                }
            }
            $body .= $label . ': ' . (is_array($val) ? implode(', ', $val) : (string) $val) . "\n";
        }

        $body .= "\n" . str_repeat('─', 40) . "\n";
        $body .= 'IP: ' . ($submission['ip'] ?: 'unknown') . "\n";

        $headers = 'From: noreply@' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . "\r\n";

        $replyTo = $emailConfig['reply_to'] ?? null;
        if ($replyTo) {
            $resolved = resolveTemplate($replyTo, $cleanData, $siteData);
            if (filter_var($resolved, FILTER_VALIDATE_EMAIL)) {
                $headers .= 'Reply-To: ' . $resolved . "\r\n";
            }
        }

        @mail($recipient, $subject, $body, $headers);
    }
}

// ── Respond ──

$successMessage = $schema['submission']['success_message'] ?? 'Thank you for your submission.';
$redirect = $schema['submission']['success_redirect'] ?? null;

if (isAjax()) {
    respond(200, $successMessage, null, $redirect);
} elseif ($redirect) {
    header('Location: ' . $redirect);
    exit;
} else {
    $referrer = $_SERVER['HTTP_REFERER'] ?? '/';
    $separator = str_contains($referrer, '?') ? '&' : '?';
    header('Location: ' . $referrer . $separator . 'form_success=' . urlencode($formId));
    exit;
}

// ═══════════════════════════════════════════
//  Helper Functions
// ═══════════════════════════════════════════

/**
 * Send response — JSON for AJAX, redirect for standard POST.
 */
function respond(int $status, string $message, ?array $errors = null, ?string $redirect = null): void
{
    http_response_code($status);

    if (isAjax()) {
        header('Content-Type: application/json');
        $response = ['success' => $status === 200, 'message' => $message];
        if ($errors !== null) {
            $response['errors'] = $errors;
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
 * Detect AJAX request.
 */
function isAjax(): bool
{
    return (
        ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'XMLHttpRequest' ||
        str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json')
    );
}

/**
 * Resolve {{placeholder}} tokens in template strings.
 */
function resolveTemplate(string $template, array $data, array $siteData): string
{
    return preg_replace_callback('/\{\{([^}]+)\}\}/', function ($matches) use ($data, $siteData) {
        $key = trim($matches[1]);

        // Site data references (e.g., {{site.contact.email}})
        if (str_starts_with($key, 'site.')) {
            $path = explode('.', substr($key, 5));
            $value = $siteData;
            foreach ($path as $segment) {
                $value = $value[$segment] ?? null;
                if ($value === null) return '';
            }
            return is_string($value) ? $value : json_encode($value);
        }

        // Field values
        $value = $data[$key] ?? '';
        return is_array($value) ? implode(', ', $value) : (string) $value;
    }, $template);
}
