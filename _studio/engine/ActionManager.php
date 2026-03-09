<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Action Engine.
 *
 * Manages user-defined business actions (reservations, appointments,
 * quotes) that are exposed as MCP tools and human-accessible via the
 * Actions Bar. This is NOT related to ActionRegistry (the AI wizard
 * action system) — see Phase 1 build guide for naming disambiguation.
 *
 * Architecture:
 * - Action definitions: JSON files in _studio/data/actions/
 * - Record storage: Single universal table in _data/actions.db (JSON blobs)
 * - Constraints: Composable (capacity, uniqueness, operating hours)
 * - Confirmation: Human-readable codes (no ambiguous chars)
 * - Zero AI in the execution path — deterministic validate-check-write
 */
class ActionManager
{
    private string $actionsDir;
    private string $templatesDir;
    private string $dbPath;
    private string $siteDataPath;
    private string $uploadsDir;
    private ?\PDO $db = null;

    /** @var array<string, array> Cache of loaded action definitions */
    private array $definitionCache = [];

    public function __construct(
        ?string $actionsDir = null,
        ?string $dbPath = null,
        ?string $siteDataPath = null
    ) {
        $studioDir = dirname(__DIR__);
        $root = dirname($studioDir);
        $this->actionsDir    = $actionsDir   ?? $studioDir . '/data/actions';
        $this->templatesDir  = $studioDir . '/action-templates';
        $this->dbPath        = $dbPath       ?? $root . '/_data/actions.db';
        $this->siteDataPath  = $siteDataPath ?? $studioDir . '/assets/data/site.json';
        $this->uploadsDir    = $root . '/_data/uploads/actions';
    }

    // ══════════════════════════════════════════════
    //  MCP Interface
    // ══════════════════════════════════════════════

    /**
     * List all active actions as MCP tool definitions (including companions).
     *
     * @return array<int, array{name: string, description: string, inputSchema: array}>
     */
    public function listTools(): array
    {
        $tools = [];

        foreach ($this->listActions() as $action) {
            if (!($action['active'] ?? false)) {
                continue;
            }

            $id = $action['id'];
            $toolName = $this->actionIdToToolName($id, 'make');

            // Main action tool (write)
            $properties = [];
            $required = [];
            foreach ($action['fields'] ?? [] as $field) {
                // File fields are not supported via MCP — skip entirely
                if (($field['type'] ?? 'text') === 'file') {
                    continue;
                }

                $prop = ['type' => $this->fieldTypeToJsonSchemaType($field['type'])];
                if (!empty($field['description'])) {
                    $prop['description'] = $field['description'];
                } elseif (!empty($field['label'])) {
                    $prop['description'] = $field['label'];
                }
                if (isset($field['min'])) $prop['minimum'] = $field['min'];
                if (isset($field['max'])) $prop['maximum'] = $field['max'];
                if (isset($field['min_length'])) $prop['minLength'] = $field['min_length'];
                if (isset($field['max_length'])) $prop['maxLength'] = $field['max_length'];
                if (!empty($field['options'])) {
                    if (($field['type'] ?? 'text') === 'multiselect') {
                        $prop['items'] = ['type' => 'string', 'enum' => $field['options']];
                    } else {
                        $prop['enum'] = $field['options'];
                    }
                }
                if (!empty($field['require_future'])) $prop['description'] = ($prop['description'] ?? $field['name']) . ' (must be in the future)';

                $properties[$field['name']] = $prop;
                if ($field['required'] ?? false) {
                    $required[] = $field['name'];
                }
            }

            $tools[] = [
                'name' => $toolName,
                'description' => $action['description'] ?? $action['name'],
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => $properties,
                    'required' => $required,
                ],
            ];

            // Companion: check_availability
            $companions = $action['companion_tools'] ?? [];
            $constraints = $action['constraints'] ?? [];

            if (($companions['check_availability'] ?? false) && !empty($constraints['capacity']['enabled'])) {
                $checkProps = [];
                $checkRequired = [];
                $slotFields = $constraints['capacity']['slot_fields'] ?? [];

                foreach ($action['fields'] ?? [] as $field) {
                    if (in_array($field['name'], $slotFields, true)) {
                        $checkProps[$field['name']] = [
                            'type' => $this->fieldTypeToJsonSchemaType($field['type']),
                            'description' => $field['label'] ?? $field['name'],
                        ];
                        if (!empty($field['options'])) {
                            $checkProps[$field['name']]['enum'] = $field['options'];
                        }
                        $checkRequired[] = $field['name'];
                    }
                }

                $tools[] = [
                    'name' => "check_{$id}_availability",
                    'description' => "Check available slots for: {$action['name']}",
                    'inputSchema' => [
                        'type' => 'object',
                        'properties' => $checkProps,
                        'required' => $checkRequired,
                    ],
                ];
            }

            // Companion: cancel_by_code
            if ($companions['cancel_by_code'] ?? false) {
                $tools[] = [
                    'name' => "cancel_{$id}",
                    'description' => "Cancel a {$action['name']} using the confirmation code",
                    'inputSchema' => [
                        'type' => 'object',
                        'properties' => [
                            'confirmation_code' => [
                                'type' => 'string',
                                'description' => 'The confirmation code received when the action was created',
                            ],
                        ],
                        'required' => ['confirmation_code'],
                    ],
                ];
            }
        }

        return $tools;
    }

    /**
     * Execute an action (write) or companion (read).
     *
     * @return array{ok: bool, message?: string, confirmation_code?: string, error?: string, data?: array}
     */
    public function execute(string $toolName, array $input, string $ip = '', bool $sandbox = false): array
    {
        // Parse tool name to determine action and operation
        foreach ($this->listActions() as $action) {
            if (!($action['active'] ?? false)) {
                continue;
            }
            $id = $action['id'];

            // Main action: make_{id} or {id}
            $mainToolName = $this->actionIdToToolName($id, 'make');
            if ($toolName === $mainToolName || $toolName === $id) {
                $input['action_id'] = $id;
                return $this->createRecord($action, $input, $ip, $sandbox);
            }

            // Companion: check_{id}_availability
            if ($toolName === "check_{$id}_availability") {
                return $this->checkAvailability($action, $input);
            }

            // Companion: cancel_{id}
            if ($toolName === "cancel_{$id}") {
                return $this->cancelByCode($action, $input['confirmation_code'] ?? '');
            }
        }

        return ['ok' => false, 'error' => "Unknown action tool: {$toolName}"];
    }

    // ══════════════════════════════════════════════
    //  Core Operations
    // ══════════════════════════════════════════════

    /**
     * Validate input against action schema, check constraints, insert record.
     */
    private function createRecord(array $action, array $input, string $ip, bool $sandbox = false): array
    {
        $actionId = $action['id'];

        // Rate limit check (skip in sandbox)
        if (!$sandbox && !$this->checkRateLimit($actionId, $ip, $action)) {
            return [
                'ok' => false,
                'error' => 'rate_limited',
                'message' => 'Too many requests. Please try again later.',
            ];
        }

        // Validate required fields and types
        $validationErrors = $this->validateInput($action, $input);
        if (!empty($validationErrors)) {
            return [
                'ok' => false,
                'error' => 'validation_failed',
                'message' => 'Please fill in all required fields.',
                'errors' => $validationErrors,
            ];
        }

        // Extract field data (only defined fields, ignore extras)
        $data = [];
        foreach ($action['fields'] ?? [] as $field) {
            $name = $field['name'];
            $type = $field['type'] ?? 'text';

            // File fields: process upload from $_FILES, not from $input
            if ($type === 'file') {
                $fileResult = $this->processFileUpload($field, $action['id']);
                if ($fileResult !== null) {
                    $data[$name] = $fileResult;
                }
                continue;
            }

            if (array_key_exists($name, $input)) {
                $data[$name] = $input[$name];
            }
        }

        // Check constraints (inside transaction for atomicity)
        $db = $this->db();

        if ($sandbox) {
            // Sandbox mode: check constraints but don't actually write
            $constraintError = $this->checkConstraints($action, $data);
            if ($constraintError !== null) {
                $responses = $action['responses'] ?? [];
                $message = $this->interpolate($responses[$constraintError] ?? 'Request could not be completed.', $data);
                return [
                    'ok' => false,
                    'error' => $constraintError,
                    'message' => $message,
                    'test' => true,
                ];
            }

            $code = $this->generateCode(
                $action['confirmation']['code_length'] ?? 8,
                1,
                $action['confirmation']['code_alphabet'] ?? 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
            );
            $data['confirmation_code'] = $code;
            $responses = $action['responses'] ?? [];
            $message = $this->interpolate($responses['success'] ?? "Confirmed. Code: {confirmation_code}", $data);

            return [
                'ok' => true,
                'message' => $message,
                'confirmation_code' => $code,
                'test' => true,
            ];
        }

        // Real execution with BEGIN IMMEDIATE for atomic read-then-write
        $db->exec('BEGIN IMMEDIATE');

        try {
            $constraintError = $this->checkConstraints($action, $data);
            if ($constraintError !== null) {
                $db->exec('ROLLBACK');
                $responses = $action['responses'] ?? [];
                $message = $this->interpolate($responses[$constraintError] ?? 'Request could not be completed.', $data);
                return [
                    'ok' => false,
                    'error' => $constraintError,
                    'message' => $message,
                ];
            }

            // Generate confirmation code
            $confirmation = $action['confirmation'] ?? [];
            $codeLength = $confirmation['code_length'] ?? 8;
            $codeAlphabet = $confirmation['code_alphabet'] ?? 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            $code = $this->generateCode($codeLength, 3, $codeAlphabet);

            $defaultStatus = $confirmation['default_status'] ?? 'confirmed';
            if (($confirmation['auto_confirm'] ?? true) === false) {
                $defaultStatus = 'pending';
            }

            $locale = $input['locale'] ?? $input['language'] ?? null;
            $source = $input['_source'] ?? 'web';
            $now = date('c');

            $stmt = $db->prepare(
                'INSERT INTO action_records (action_id, data, status, confirmation_code, locale, meta, ip_address, source, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );

            $stmt->execute([
                $actionId,
                json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                $defaultStatus,
                $code,
                $locale,
                json_encode([], JSON_FORCE_OBJECT),
                $ip,
                $source,
                $now,
                $now,
            ]);

            $db->exec('COMMIT');
        } catch (\Throwable $e) {
            $db->exec('ROLLBACK');
            error_log('ActionManager: createRecord failed: ' . $e->getMessage());
            return [
                'ok' => false,
                'error' => 'internal_error',
                'message' => 'Something went wrong. Please try again.',
            ];
        }

        // Probabilistic rate limit cleanup
        $this->maybePurgeExpiredRateLimits();

        // Record rate limit hit
        $this->recordRateLimitHit($actionId, $ip);

        // Build success response
        $data['confirmation_code'] = $code;
        $responses = $action['responses'] ?? [];
        $message = $this->interpolate(
            $responses['success'] ?? "Confirmed. Your confirmation code is {confirmation_code}.",
            $data
        );

        // Send notifications (fire-and-forget)
        try {
            $this->sendGuestNotification($action, $data, $code);
        } catch (\Throwable $e) {
            error_log('ActionManager: notification failed: ' . $e->getMessage());
        }

        return [
            'ok' => true,
            'message' => $message,
            'confirmation_code' => $code,
            'status' => $defaultStatus,
        ];
    }

    /**
     * Cancel a record by confirmation code.
     */
    private function cancelByCode(array $action, string $code): array
    {
        if (empty($code)) {
            return ['ok' => false, 'error' => 'missing_code', 'message' => 'Confirmation code is required.'];
        }

        $code = strtoupper(trim($code));
        $db = $this->db();

        $stmt = $db->prepare(
            'SELECT id, status, data FROM action_records WHERE action_id = ? AND confirmation_code = ?'
        );
        $stmt->execute([$action['id'], $code]);

        $row = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$row) {
            return ['ok' => false, 'error' => 'not_found', 'message' => 'No record found with that confirmation code.'];
        }

        if ($row['status'] === 'cancelled') {
            return ['ok' => false, 'error' => 'already_cancelled', 'message' => 'This has already been cancelled.'];
        }

        $db->prepare('UPDATE action_records SET status = ?, updated_at = ? WHERE id = ?')
            ->execute(['cancelled', date('c'), $row['id']]);

        $data = json_decode($row['data'], true) ?: [];
        $data['confirmation_code'] = $code;
        $responses = $action['responses'] ?? [];
        $message = $this->interpolate(
            $responses['cancelled'] ?? "Cancelled. Code: {confirmation_code}",
            $data
        );

        return ['ok' => true, 'message' => $message, 'confirmation_code' => $code];
    }

    /**
     * Check availability for constrained actions.
     */
    private function checkAvailability(array $action, array $input): array
    {
        $constraints = $action['constraints'] ?? [];
        $capacity = $constraints['capacity'] ?? [];

        if (empty($capacity['enabled'])) {
            return ['ok' => true, 'message' => 'No capacity constraints configured.', 'available' => true];
        }

        $slotFields = $capacity['slot_fields'] ?? [];
        $maxPerSlot = $capacity['max_per_slot'] ?? PHP_INT_MAX;
        $countStatuses = $capacity['count_statuses'] ?? ['confirmed', 'pending'];

        // If specific slot values provided, check that slot
        $hasAllSlotFields = true;
        foreach ($slotFields as $sf) {
            if (!isset($input[$sf])) {
                $hasAllSlotFields = false;
                break;
            }
        }

        if ($hasAllSlotFields && !empty($slotFields)) {
            $count = $this->countRecordsForSlot($action['id'], $slotFields, $input, $countStatuses);
            $remaining = max(0, $maxPerSlot - $count);

            return [
                'ok' => true,
                'available' => $remaining > 0,
                'remaining' => $remaining,
                'max_per_slot' => $maxPerSlot,
            ];
        }

        // If partial slot info provided (e.g., date but not time), return all slots for that date
        $available = [];
        // Find options for missing slot fields
        foreach ($action['fields'] ?? [] as $field) {
            if (in_array($field['name'], $slotFields, true) && !empty($field['options']) && !isset($input[$field['name']])) {
                // Enumerate options for this field
                foreach ($field['options'] as $option) {
                    $slotInput = array_merge($input, [$field['name'] => $option]);
                    $count = $this->countRecordsForSlot($action['id'], $slotFields, $slotInput, $countStatuses);
                    $remaining = max(0, $maxPerSlot - $count);
                    $available[] = [
                        $field['name'] => $option,
                        'remaining' => $remaining,
                        'available' => $remaining > 0,
                    ];
                }
            }
        }

        if (!empty($available)) {
            return ['ok' => true, 'slots' => $available];
        }

        return ['ok' => true, 'message' => 'Provide slot field values to check specific availability.'];
    }

    // ══════════════════════════════════════════════
    //  Constraint Engine
    // ══════════════════════════════════════════════

    /**
     * Composable constraint checks. Returns error response key or null.
     */
    private function checkConstraints(array $action, array $data): ?string
    {
        $constraints = $action['constraints'] ?? [];

        // Operating hours check
        if (!empty($constraints['operating_hours']['enabled'])) {
            if (!$this->checkOperatingHours($constraints['operating_hours'], $data)) {
                return 'outside_hours';
            }
        }

        // Capacity check
        if (!empty($constraints['capacity']['enabled'])) {
            if (!$this->checkCapacity($constraints['capacity'], $data, $action['id'])) {
                return 'capacity_full';
            }
        }

        // Uniqueness check
        if (!empty($constraints['uniqueness']['enabled'])) {
            if (!$this->checkUniqueness($constraints['uniqueness'], $data, $action['id'])) {
                return 'duplicate';
            }
        }

        return null;
    }

    private function checkCapacity(array $config, array $data, string $actionId): bool
    {
        $maxPerSlot = $config['max_per_slot'] ?? PHP_INT_MAX;
        $slotFields = $config['slot_fields'] ?? [];
        $countStatuses = $config['count_statuses'] ?? ['confirmed', 'pending'];

        if (empty($slotFields)) {
            return true;
        }

        $count = $this->countRecordsForSlot($actionId, $slotFields, $data, $countStatuses);
        return $count < $maxPerSlot;
    }

    private function checkUniqueness(array $config, array $data, string $actionId): bool
    {
        $fields = $config['fields'] ?? [];
        $scopeStatuses = $config['scope_statuses'] ?? ['confirmed', 'pending'];

        if (empty($fields)) {
            return true;
        }

        $sql = 'SELECT COUNT(*) FROM action_records WHERE action_id = ?';
        $params = [$actionId];

        // Status scope
        $placeholders = implode(',', array_fill(0, count($scopeStatuses), '?'));
        $sql .= " AND status IN ({$placeholders})";
        $params = array_merge($params, $scopeStatuses);

        // Field conditions
        foreach ($fields as $fieldName) {
            $value = $data[$fieldName] ?? null;
            if ($value === null) {
                continue;
            }
            $sql .= " AND json_extract(data, ?) = ?";
            $params[] = '$.' . $fieldName;
            $params[] = (string) $value;
        }

        $stmt = $this->db()->prepare($sql);
        $stmt->execute($params);
        $count = (int) $stmt->fetchColumn();

        return $count === 0;
    }

    private function checkOperatingHours(array $config, array $data): bool
    {
        $timeField = $config['time_field'] ?? 'time';
        $dateField = $config['date_field'] ?? 'date';

        $requestedTime = $data[$timeField] ?? null;
        if ($requestedTime === null) {
            return true; // No time specified — let it through
        }

        // Load operating hours from site.json or use fallback
        $hours = $this->getOperatingHours();
        if ($hours === null) {
            // Use fallback from constraint config
            $fallback = $config['fallback_hours'] ?? null;
            if ($fallback === null) {
                return true; // No hours defined — allow everything
            }
            $hours = ['open' => $fallback['open'] ?? '00:00', 'close' => $fallback['close'] ?? '23:59'];
        }

        // Check if day-specific hours exist
        $requestedDate = $data[$dateField] ?? null;
        if ($requestedDate !== null && isset($hours['schedule'])) {
            $dayOfWeek = strtolower(date('l', strtotime($requestedDate)));
            if (isset($hours['schedule'][$dayOfWeek])) {
                $dayHours = $hours['schedule'][$dayOfWeek];
                if (isset($dayHours['closed']) && $dayHours['closed'] === true) {
                    return false;
                }
                $hours = $dayHours;
            }
        }

        $open = $hours['open'] ?? '00:00';
        $close = $hours['close'] ?? '23:59';

        return $requestedTime >= $open && $requestedTime <= $close;
    }

    /**
     * Count records matching a slot combination.
     */
    private function countRecordsForSlot(string $actionId, array $slotFields, array $data, array $countStatuses): int
    {
        $sql = 'SELECT COUNT(*) FROM action_records WHERE action_id = ?';
        $params = [$actionId];

        $placeholders = implode(',', array_fill(0, count($countStatuses), '?'));
        $sql .= " AND status IN ({$placeholders})";
        $params = array_merge($params, $countStatuses);

        foreach ($slotFields as $fieldName) {
            $value = $data[$fieldName] ?? null;
            if ($value === null) {
                continue;
            }
            $sql .= " AND json_extract(data, ?) = ?";
            $params[] = '$.' . $fieldName;
            $params[] = (string) $value;
        }

        $stmt = $this->db()->prepare($sql);
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }

    // ══════════════════════════════════════════════
    //  Input Validation
    // ══════════════════════════════════════════════

    /**
     * Validate input against action field definitions.
     *
     * @return string[] Validation error messages
     */
    private function validateInput(array $action, array $input): array
    {
        $errors = [];

        foreach ($action['fields'] ?? [] as $field) {
            $name = $field['name'];
            $label = $field['label'] ?? $name;
            $value = $input[$name] ?? null;

            // Required check
            if (($field['required'] ?? false) && ($value === null || $value === '')) {
                $errors[] = "{$label} is required.";
                continue;
            }

            if ($value === null || $value === '') {
                continue;
            }

            // Type-specific validation
            $type = $field['type'] ?? 'text';
            switch ($type) {
                case 'email':
                    if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        $errors[] = "{$label} must be a valid email address.";
                    }
                    break;

                case 'number':
                    if (!is_numeric($value)) {
                        $errors[] = "{$label} must be a number.";
                    } else {
                        $numVal = (float) $value;
                        if (isset($field['min']) && $numVal < $field['min']) {
                            $errors[] = "{$label} must be at least {$field['min']}.";
                        }
                        if (isset($field['max']) && $numVal > $field['max']) {
                            $errors[] = "{$label} must be at most {$field['max']}.";
                        }
                    }
                    break;

                case 'url':
                    if (!filter_var($value, FILTER_VALIDATE_URL)) {
                        $errors[] = "{$label} must be a valid URL.";
                    }
                    break;

                case 'select':
                case 'radio':
                    if (!empty($field['options']) && !in_array($value, $field['options'], true)) {
                        $errors[] = "{$label} must be one of: " . implode(', ', $field['options']) . '.';
                    }
                    break;

                case 'multiselect':
                    if (!is_array($value)) {
                        $errors[] = "{$label} must be an array of values.";
                    } elseif (!empty($field['options'])) {
                        foreach ($value as $v) {
                            if (!in_array($v, $field['options'], true)) {
                                $errors[] = "{$label}: invalid option '{$v}'.";
                            }
                        }
                    }
                    break;

                case 'tel':
                    // At least 7 digits, only digits/+/spaces/dashes/parens
                    $digitsOnly = preg_replace('/\D/', '', (string) $value);
                    if (strlen($digitsOnly) < 7 || !preg_match('/^[+\d\s\-().]+$/', (string) $value)) {
                        $errors[] = "{$label} must be a valid phone number.";
                    }
                    break;

                case 'date':
                    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $value) && !strtotime((string) $value)) {
                        $errors[] = "{$label} must be a valid date.";
                    } elseif (!empty($field['require_future']) || ($field['min'] ?? '') === 'today') {
                        $today = new \DateTime('today');
                        $selected = new \DateTime((string) $value);
                        if ($selected < $today) {
                            $errors[] = "{$label} must be a date in the future.";
                        }
                    }
                    break;

                case 'checkbox':
                    // Required checkbox must be checked (truthy)
                    if (($field['required'] ?? false) && !$value) {
                        $errors[] = "{$label} must be checked.";
                    }
                    break;

                case 'file':
                    // File validation happens in processFileUpload() during data extraction.
                    // Here we only check the required constraint against $_FILES.
                    if (($field['required'] ?? false)) {
                        $filePresent = isset($_FILES[$name])
                            && $_FILES[$name]['error'] !== UPLOAD_ERR_NO_FILE
                            && $_FILES[$name]['error'] === UPLOAD_ERR_OK;
                        if (!$filePresent) {
                            $errors[] = "{$label} is required.";
                        }
                    }
                    break;
            }

            // Min length
            if (isset($field['min_length']) && is_string($value) && mb_strlen($value) < $field['min_length']) {
                $errors[] = "{$label} must be at least {$field['min_length']} characters.";
            }

            // Max length
            if (isset($field['max_length']) && is_string($value) && mb_strlen($value) > $field['max_length']) {
                $errors[] = "{$label} must be {$field['max_length']} characters or less.";
            }
        }

        return $errors;
    }

    // ══════════════════════════════════════════════
    //  File Upload Processing
    // ══════════════════════════════════════════════

    /** @var string[] Default allowed extensions when none configured */
    private const DEFAULT_ALLOWED_EXTENSIONS = [
        'pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp',
        'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'zip',
    ];

    /** @var int Maximum allowed file size in bytes (50 MB hard cap) */
    private const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

    /**
     * Known magic bytes for common file types.
     * Maps binary prefix → list of allowed extensions.
     * Used to reject files whose content doesn't match their extension.
     */
    private const MAGIC_BYTES = [
        "\xFF\xD8\xFF"          => ['jpg', 'jpeg'],       // JPEG
        "\x89PNG\r\n\x1A\n"    => ['png'],               // PNG
        "GIF87a"               => ['gif'],               // GIF87
        "GIF89a"               => ['gif'],               // GIF89
        "RIFF"                 => ['webp'],              // WebP (RIFF container)
        "%PDF"                 => ['pdf'],               // PDF
        "PK\x03\x04"           => ['zip', 'docx', 'xlsx', 'pptx'],  // ZIP / Office Open XML
        // RAR signature
        "Rar!\x1A\x07"        => ['rar'],
    ];

    /**
     * Extensions that are always blocked, regardless of configuration.
     * These are executable or script types that should never be uploaded
     * to a shared hosting environment.
     */
    private const BLOCKED_EXTENSIONS = [
        'php', 'php3', 'php4', 'php5', 'php7', 'php8', 'phtml', 'phar',
        'exe', 'bat', 'cmd', 'com', 'msi', 'scr', 'pif',
        'sh', 'bash', 'csh', 'ksh', 'zsh',
        'pl', 'py', 'rb', 'cgi',
        'asp', 'aspx', 'jsp', 'jspx',
        'htaccess', 'htpasswd',
        'svg',  // SVG can contain JavaScript — block by default
    ];

    /**
     * Process a file upload for a file-type field.
     *
     * Validates extension, size, and magic bytes. Moves the file to
     * _data/uploads/actions/{action_id}/ with a safe random filename.
     *
     * @return array|null Structured file data on success, null if no file provided
     */
    private function processFileUpload(array $field, string $actionId): ?array
    {
        $name = $field['name'];

        // No file uploaded for this field
        if (!isset($_FILES[$name]) || $_FILES[$name]['error'] === UPLOAD_ERR_NO_FILE) {
            return null;
        }

        $file = $_FILES[$name];

        // PHP upload error
        if ($file['error'] !== UPLOAD_ERR_OK) {
            Logger::warning('actions', 'File upload PHP error', [
                'field' => $name,
                'error_code' => $file['error'],
                'action_id' => $actionId,
            ]);
            return null;
        }

        $originalName = basename($file['name']);
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

        // Block dangerous extensions (hard block, not configurable)
        if (in_array($ext, self::BLOCKED_EXTENSIONS, true)) {
            Logger::warning('actions', 'Blocked dangerous file extension', [
                'field' => $name,
                'extension' => $ext,
                'original_name' => $originalName,
                'action_id' => $actionId,
            ]);
            return null;
        }

        // Extension whitelist check
        $allowed = $field['allowed_extensions'] ?? self::DEFAULT_ALLOWED_EXTENSIONS;
        $allowed = array_map('strtolower', $allowed);
        if (!in_array($ext, $allowed, true)) {
            Logger::warning('actions', 'File extension not in allowed list', [
                'field' => $name,
                'extension' => $ext,
                'allowed' => $allowed,
                'action_id' => $actionId,
            ]);
            return null;
        }

        // Size check
        $maxMb = $field['max_size_mb'] ?? 10;
        $maxBytes = min($maxMb * 1024 * 1024, self::MAX_FILE_SIZE_BYTES);
        if ($file['size'] > $maxBytes) {
            Logger::warning('actions', 'File too large', [
                'field' => $name,
                'size' => $file['size'],
                'max_bytes' => $maxBytes,
                'action_id' => $actionId,
            ]);
            return null;
        }

        // Magic bytes validation — reject content/extension mismatches
        if (!$this->validateFileMagicBytes($file['tmp_name'], $ext)) {
            Logger::warning('actions', 'File magic bytes mismatch', [
                'field' => $name,
                'extension' => $ext,
                'original_name' => $originalName,
                'action_id' => $actionId,
            ]);
            return null;
        }

        // Ensure upload directory exists with .htaccess protection
        $actionUploadsDir = $this->uploadsDir . '/' . preg_replace('/[^a-z0-9_-]/', '', $actionId);
        if (!is_dir($actionUploadsDir)) {
            mkdir($actionUploadsDir, 0755, true);
        }
        $htaccess = $this->uploadsDir . '/.htaccess';
        if (!file_exists($htaccess)) {
            file_put_contents($htaccess, "Order deny,allow\nDeny from all\n");
        }

        // Generate safe filename
        $safeFilename = date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $destPath = $actionUploadsDir . '/' . $safeFilename;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            Logger::error('actions', 'Failed to move uploaded file', [
                'field' => $name,
                'dest' => $destPath,
                'action_id' => $actionId,
            ]);
            return null;
        }

        Logger::info('actions', 'File uploaded', [
            'field' => $name,
            'path' => $destPath,
            'original_name' => $originalName,
            'size' => $file['size'],
            'action_id' => $actionId,
        ]);

        // Determine MIME type from extension (don't trust browser-reported type)
        $mimeType = $this->extensionToMimeType($ext);

        return [
            'path' => '_data/uploads/actions/' . preg_replace('/[^a-z0-9_-]/', '', $actionId) . '/' . $safeFilename,
            'original_name' => $originalName,
            'size' => $file['size'],
            'mime_type' => $mimeType,
        ];
    }

    /**
     * Validate that a file's magic bytes match its declared extension.
     *
     * For known file types (JPEG, PNG, GIF, PDF, ZIP/Office, WebP, RAR),
     * reads the first 8 bytes and checks against known signatures.
     * Unknown types pass through — we only block mismatches, not unknowns.
     */
    private function validateFileMagicBytes(string $filePath, string $extension): bool
    {
        $header = @file_get_contents($filePath, false, null, 0, 8);
        if ($header === false || strlen($header) < 4) {
            return false; // Cannot read file — reject
        }

        // Check each known signature
        foreach (self::MAGIC_BYTES as $signature => $validExtensions) {
            if (str_starts_with($header, $signature)) {
                // We found a match for the binary content.
                // The extension must be in the valid list for this signature.
                return in_array($extension, $validExtensions, true);
            }
        }

        // No known signature matched — allow the file through.
        // We only block KNOWN mismatches (e.g., PHP script pretending to be JPEG).
        // Unknown types (TXT, CSV, DOC binary) pass through.
        //
        // Extra safety: check for PHP/script markers in text-like files
        $textExtensions = ['txt', 'csv', 'json', 'xml', 'html', 'htm', 'css', 'js'];
        if (in_array($extension, $textExtensions, true)) {
            $content = @file_get_contents($filePath, false, null, 0, 4096);
            if ($content !== false) {
                // Block files containing PHP open tags or shebangs
                if (str_contains($content, '<?php') || str_contains($content, '<?=') || str_starts_with(trim($content), '#!/')) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Map file extension to MIME type.
     * Used instead of trusting browser-reported Content-Type.
     */
    private function extensionToMimeType(string $ext): string
    {
        return match ($ext) {
            'pdf'  => 'application/pdf',
            'jpg', 'jpeg' => 'image/jpeg',
            'png'  => 'image/png',
            'gif'  => 'image/gif',
            'webp' => 'image/webp',
            'doc'  => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls'  => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'csv'  => 'text/csv',
            'txt'  => 'text/plain',
            'zip'  => 'application/zip',
            'rar'  => 'application/x-rar-compressed',
            default => 'application/octet-stream',
        };
    }

    /**
     * Get the absolute filesystem path for a stored upload.
     * Returns null if the path looks suspicious or file doesn't exist.
     */
    public function getUploadAbsolutePath(string $relativePath): ?string
    {
        // Prevent directory traversal
        if (str_contains($relativePath, '..') || str_starts_with($relativePath, '/')) {
            return null;
        }

        // Must be within _data/uploads/actions/
        if (!str_starts_with($relativePath, '_data/uploads/actions/')) {
            return null;
        }

        $root = dirname(dirname(__DIR__));
        $absPath = $root . '/' . $relativePath;

        if (!file_exists($absPath) || !is_file($absPath)) {
            return null;
        }

        // Verify the resolved path is actually within our uploads directory
        $realPath = realpath($absPath);
        $realUploadsDir = realpath($this->uploadsDir);
        if ($realPath === false || $realUploadsDir === false || !str_starts_with($realPath, $realUploadsDir)) {
            return null;
        }

        return $realPath;
    }

    // ══════════════════════════════════════════════
    //  Rate Limiting
    // ══════════════════════════════════════════════

    private function checkRateLimit(string $actionId, string $ip, array $action): bool
    {
        if (empty($ip)) {
            return true; // No IP available (CLI, etc.)
        }

        $rateLimit = $action['rate_limit'] ?? [];
        $maxPerHour = $rateLimit['max_per_ip_per_hour'] ?? 20;
        $burstMax = $rateLimit['burst_max'] ?? 5;
        $burstWindow = $rateLimit['burst_window_seconds'] ?? 60;

        $db = $this->db();

        // Check burst limit
        $burstStart = date('c', time() - $burstWindow);
        $stmt = $db->prepare(
            'SELECT COALESCE(SUM(count), 0) FROM rate_limits
             WHERE ip_address = ? AND action_id = ? AND window_start >= ?'
        );
        $stmt->execute([$ip, $actionId, $burstStart]);
        $burstCount = (int) $stmt->fetchColumn();

        if ($burstCount >= $burstMax) {
            return false;
        }

        // Check hourly limit
        $hourStart = date('c', time() - 3600);
        $stmt = $db->prepare(
            'SELECT COALESCE(SUM(count), 0) FROM rate_limits
             WHERE ip_address = ? AND action_id = ? AND window_start >= ?'
        );
        $stmt->execute([$ip, $actionId, $hourStart]);
        $hourCount = (int) $stmt->fetchColumn();

        return $hourCount < $maxPerHour;
    }

    private function recordRateLimitHit(string $actionId, string $ip): void
    {
        if (empty($ip)) {
            return;
        }

        $windowStart = date('c', (int) (time() / 60) * 60); // Round to minute

        try {
            $this->db()->prepare(
                'INSERT INTO rate_limits (ip_address, action_id, window_start, count)
                 VALUES (?, ?, ?, 1)
                 ON CONFLICT (ip_address, action_id, window_start) DO UPDATE SET count = count + 1'
            )->execute([$ip, $actionId, $windowStart]);
        } catch (\Throwable $e) {
            // Rate limit recording is best-effort
            error_log('ActionManager: rate limit record failed: ' . $e->getMessage());
        }
    }

    // ══════════════════════════════════════════════
    //  Studio API
    // ══════════════════════════════════════════════

    /**
     * List records with filtering, search, pagination, and sorting.
     *
     * @return array{records: array, total: int, page: int, per_page: int}
     */
    public function listRecords(string $actionId, array $filters = []): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));
        $status = $filters['status'] ?? null;
        $search = $filters['search'] ?? null;
        $dateFrom = $filters['date_from'] ?? null;
        $dateTo = $filters['date_to'] ?? null;

        $sql = 'SELECT * FROM action_records WHERE action_id = ?';
        $countSql = 'SELECT COUNT(*) FROM action_records WHERE action_id = ?';
        $params = [$actionId];

        if ($status !== null && $status !== '') {
            $sql .= ' AND status = ?';
            $countSql .= ' AND status = ?';
            $params[] = $status;
        }

        if ($search !== null && $search !== '') {
            $searchParam = '%' . $search . '%';
            $sql .= ' AND (data LIKE ? OR confirmation_code LIKE ?)';
            $countSql .= ' AND (data LIKE ? OR confirmation_code LIKE ?)';
            $params[] = $searchParam;
            $params[] = $searchParam;
        }

        if ($dateFrom !== null && $dateFrom !== '') {
            $sql .= ' AND created_at >= ?';
            $countSql .= ' AND created_at >= ?';
            $params[] = $dateFrom;
        }

        if ($dateTo !== null && $dateTo !== '') {
            $sql .= ' AND created_at <= ?';
            $countSql .= ' AND created_at <= ?';
            $params[] = $dateTo;
        }

        // Get total count
        $stmt = $this->db()->prepare($countSql);
        $stmt->execute($params);
        $total = (int) $stmt->fetchColumn();

        // Get paginated records
        $offset = ($page - 1) * $perPage;
        $sql .= ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        $params[] = $perPage;
        $params[] = $offset;

        $stmt = $this->db()->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Decode JSON data for each record
        $records = [];
        foreach ($rows as $row) {
            $row['data'] = json_decode($row['data'], true) ?: [];
            $row['meta'] = json_decode($row['meta'] ?? '{}', true) ?: [];
            $records[] = $row;
        }

        return [
            'records' => $records,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
        ];
    }

    /**
     * Update a record's status.
     */
    public function updateStatus(int $recordId, string $status): bool
    {
        $allowed = ['confirmed', 'pending', 'cancelled', 'completed', 'no-show'];
        if (!in_array($status, $allowed, true)) {
            return false;
        }

        $stmt = $this->db()->prepare('UPDATE action_records SET status = ?, updated_at = ? WHERE id = ?');
        return $stmt->execute([$status, date('c'), $recordId]);
    }

    /**
     * Bulk status update for multiple records.
     */
    public function bulkUpdateStatus(array $recordIds, string $status): int
    {
        $allowed = ['confirmed', 'pending', 'cancelled', 'completed', 'no-show'];
        if (!in_array($status, $allowed, true) || empty($recordIds)) {
            return 0;
        }

        $placeholders = implode(',', array_fill(0, count($recordIds), '?'));
        $params = array_merge([$status, date('c')], array_map('intval', $recordIds));

        $stmt = $this->db()->prepare(
            "UPDATE action_records SET status = ?, updated_at = ? WHERE id IN ({$placeholders})"
        );
        $stmt->execute($params);

        return $stmt->rowCount();
    }

    /**
     * Delete a record permanently.
     */
    public function deleteRecord(int $recordId): bool
    {
        $stmt = $this->db()->prepare('DELETE FROM action_records WHERE id = ?');
        return $stmt->execute([$recordId]);
    }

    /**
     * Get aggregate stats for an action.
     */
    public function getStats(string $actionId): array
    {
        $db = $this->db();

        $stmt = $db->prepare('SELECT COUNT(*) FROM action_records WHERE action_id = ?');
        $stmt->execute([$actionId]);
        $total = (int) $stmt->fetchColumn();

        // Counts by status
        $stmt = $db->prepare(
            'SELECT status, COUNT(*) as count FROM action_records WHERE action_id = ? GROUP BY status'
        );
        $stmt->execute([$actionId]);
        $byStatus = [];
        foreach ($stmt->fetchAll(\PDO::FETCH_ASSOC) as $row) {
            $byStatus[$row['status']] = (int) $row['count'];
        }

        // Today count
        $todayStart = date('Y-m-d') . 'T00:00:00';
        $stmt = $db->prepare('SELECT COUNT(*) FROM action_records WHERE action_id = ? AND created_at >= ?');
        $stmt->execute([$actionId, $todayStart]);
        $todayCount = (int) $stmt->fetchColumn();

        // Last activity
        $stmt = $db->prepare('SELECT MAX(created_at) FROM action_records WHERE action_id = ?');
        $stmt->execute([$actionId]);
        $lastActivity = $stmt->fetchColumn() ?: null;

        return [
            'total' => $total,
            'by_status' => $byStatus,
            'today_count' => $todayCount,
            'last_activity' => $lastActivity,
        ];
    }

    /**
     * Export records as CSV.
     */
    public function exportCsv(string $actionId, array $filters = []): string
    {
        $action = $this->loadAction($actionId);
        if ($action === null) {
            return '';
        }

        $result = $this->listRecords($actionId, array_merge($filters, ['per_page' => 10000]));
        $records = $result['records'];

        if (empty($records)) {
            return '';
        }

        // Build columns: Ref, then field labels (user-friendly), then Status, Source, Created
        $fields = $action['fields'] ?? [];
        $fieldNames = array_map(fn($f) => $f['name'], $fields);
        $fieldLabels = array_map(fn($f) => $f['label'] ?? $f['name'], $fields);
        $headers = array_merge(['Ref'], $fieldLabels, ['Status', 'Source', 'Created']);

        $output = fopen('php://temp', 'r+');
        fputcsv($output, $headers);

        foreach ($records as $record) {
            $row = [$record['confirmation_code']];
            foreach ($fieldNames as $idx => $name) {
                $value = $record['data'][$name] ?? '';
                if (is_array($value)) {
                    // File fields store structured data — show original filename
                    if (isset($value['original_name'])) {
                        $value = $value['original_name'];
                    } else {
                        $value = implode(', ', $value);
                    }
                }
                $row[] = $value;
            }
            $row[] = $record['status'];
            $sourceLabel = match($record['source'] ?? '') {
                'web' => 'Website',
                'mcp' => 'MCP',
                default => $record['source'] ?? 'API',
            };
            $row[] = $sourceLabel;
            $row[] = $record['created_at'];
            fputcsv($output, $row);
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    /**
     * Purge records older than N days.
     * Also deletes any associated uploaded files from disk.
     */
    public function purgeOldRecords(string $actionId, int $olderThanDays): int
    {
        $cutoff = date('c', time() - ($olderThanDays * 86400));
        $db = $this->db();

        // Collect file paths from records about to be deleted
        $selectStmt = $db->prepare(
            'SELECT data FROM action_records WHERE action_id = ? AND created_at < ?'
        );
        $selectStmt->execute([$actionId, $cutoff]);
        $rows = $selectStmt->fetchAll(\PDO::FETCH_COLUMN);

        // Delete the records
        $deleteStmt = $db->prepare(
            'DELETE FROM action_records WHERE action_id = ? AND created_at < ?'
        );
        $deleteStmt->execute([$actionId, $cutoff]);
        $deletedCount = $deleteStmt->rowCount();

        // Clean up uploaded files from purged records
        $root = dirname(dirname(__DIR__));
        foreach ($rows as $dataJson) {
            $data = json_decode($dataJson, true);
            if (!is_array($data)) continue;

            foreach ($data as $value) {
                if (is_array($value) && isset($value['path']) && str_starts_with($value['path'], '_data/uploads/actions/')) {
                    $filePath = $root . '/' . $value['path'];
                    if (file_exists($filePath) && is_file($filePath)) {
                        @unlink($filePath);
                    }
                }
            }
        }

        return $deletedCount;
    }

    // ══════════════════════════════════════════════
    //  Definition Management
    // ══════════════════════════════════════════════

    /**
     * Load an action definition by ID.
     */
    public function loadAction(string $actionId): ?array
    {
        if (isset($this->definitionCache[$actionId])) {
            return $this->definitionCache[$actionId];
        }

        $path = $this->actionsDir . '/' . $actionId . '.json';
        if (!file_exists($path)) {
            return null;
        }

        $content = file_get_contents($path);
        if ($content === false) {
            return null;
        }

        $definition = json_decode($content, true);
        if (!is_array($definition)) {
            return null;
        }

        $this->definitionCache[$actionId] = $definition;
        return $definition;
    }

    /**
     * List all action definitions.
     *
     * @return array<int, array>
     */
    public function listActions(): array
    {
        if (!is_dir($this->actionsDir)) {
            return [];
        }

        $actions = [];
        foreach (glob($this->actionsDir . '/*.json') as $file) {
            $content = file_get_contents($file);
            if ($content === false) continue;
            $def = json_decode($content, true);
            if (!is_array($def)) continue;
            $actions[] = $def;
        }

        // Sort: active first, then by order (lower = first), then alphabetical
        usort($actions, function ($a, $b) {
            $aActive = ($a['active'] ?? false) ? 0 : 1;
            $bActive = ($b['active'] ?? false) ? 0 : 1;
            if ($aActive !== $bActive) return $aActive - $bActive;
            $aOrder = $a['order'] ?? 999;
            $bOrder = $b['order'] ?? 999;
            if ($aOrder !== $bOrder) return $aOrder - $bOrder;
            return strcasecmp($a['name'] ?? '', $b['name'] ?? '');
        });

        return $actions;
    }

    /**
     * Save an action definition.
     */
    public function saveAction(array $definition): bool
    {
        $id = $definition['id'] ?? '';
        if (empty($id)) {
            return false;
        }

        if (!is_dir($this->actionsDir)) {
            mkdir($this->actionsDir, 0755, true);
        }

        $path = $this->actionsDir . '/' . $id . '.json';
        $json = json_encode($definition, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $tmpPath = $path . '.tmp.' . getmypid();
        if (file_put_contents($tmpPath, $json) === false) {
            @unlink($tmpPath);
            return false;
        }

        if (!rename($tmpPath, $path)) {
            @unlink($tmpPath);
            return false;
        }

        // Clear cache
        unset($this->definitionCache[$id]);

        return true;
    }

    /**
     * Delete an action definition.
     * Records are NOT deleted — they remain in the database but are no longer accessible via MCP.
     */
    public function deleteAction(string $actionId): bool
    {
        $path = $this->actionsDir . '/' . $actionId . '.json';
        if (file_exists($path)) {
            unlink($path);
            unset($this->definitionCache[$actionId]);
            return true;
        }
        return false;
    }

    /**
     * Duplicate an action definition.
     * If $newId is empty, auto-generates a unique ID by incrementing a suffix.
     */
    public function duplicateAction(string $sourceId, string $newId = ''): ?array
    {
        $source = $this->loadAction($sourceId);
        if ($source === null) {
            return null;
        }

        // Auto-generate a unique ID if none provided
        if ($newId === '') {
            $base = preg_replace('/-\d+$/', '', $sourceId); // Strip existing numeric suffix
            for ($i = 2; $i <= 99; $i++) {
                $candidate = $base . '-' . $i;
                if ($this->loadAction($candidate) === null) {
                    $newId = $candidate;
                    break;
                }
            }
            if ($newId === '') {
                return null; // Exhausted 99 variants — astronomically unlikely
            }
        }

        $duplicate = $source;
        $duplicate['id'] = $newId;
        $duplicate['name'] = $source['name'] . ' (Copy)';
        $duplicate['active'] = false; // Start as draft
        $duplicate['version'] = 1;

        if ($this->saveAction($duplicate)) {
            return $duplicate;
        }

        return null;
    }

    /**
     * List available templates.
     */
    public function listTemplates(): array
    {
        if (!is_dir($this->templatesDir)) {
            return [];
        }

        $templates = [];
        foreach (glob($this->templatesDir . '/*.json') as $file) {
            $content = file_get_contents($file);
            if ($content === false) continue;
            $def = json_decode($content, true);
            if (!is_array($def)) continue;
            $templates[] = $def;
        }

        return $templates;
    }

    /**
     * Create a new action from a template.
     */
    public function createFromTemplate(string $templateId, ?string $customId = null): ?array
    {
        $templatePath = $this->templatesDir . '/' . $templateId . '.json';
        if (!file_exists($templatePath)) {
            return null;
        }

        $content = file_get_contents($templatePath);
        if ($content === false) return null;
        $template = json_decode($content, true);
        if (!is_array($template)) return null;

        $id = $customId ?? $template['id'] ?? $templateId;

        // Ensure unique ID
        $originalId = $id;
        $counter = 1;
        while (file_exists($this->actionsDir . '/' . $id . '.json')) {
            $id = $originalId . '-' . $counter;
            $counter++;
        }

        $template['id'] = $id;
        $template['active'] = false; // Start as draft
        $template['version'] = 1;

        if ($this->saveAction($template)) {
            return $template;
        }

        return null;
    }

    // ══════════════════════════════════════════════
    //  Definition Validation
    // ══════════════════════════════════════════════

    /**
     * Validate an action definition for correctness.
     *
     * @return array{valid: bool, errors: string[], warnings: string[]}
     */
    public function validateDefinition(array $definition): array
    {
        $errors = [];
        $warnings = [];

        // Required fields
        if (empty($definition['id'])) {
            $errors[] = 'Action ID is required.';
        } elseif (!preg_match('/^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/', $definition['id'])) {
            $errors[] = 'Action ID must be 3-50 characters, lowercase alphanumeric with hyphens.';
        }

        if (empty($definition['name'])) {
            $errors[] = 'Action name is required.';
        }

        if (empty($definition['fields']) || !is_array($definition['fields'])) {
            $errors[] = 'At least one field is required.';
        } else {
            $allowedTypes = ['text', 'email', 'number', 'select', 'date', 'textarea', 'tel', 'url', 'checkbox', 'radio', 'multiselect', 'time', 'hidden', 'file'];
            $fieldNames = [];

            foreach ($definition['fields'] as $i => $field) {
                $fieldLabel = $field['label'] ?? $field['name'] ?? "Field " . ($i + 1);

                if (empty($field['name'])) {
                    $errors[] = "Field '{$fieldLabel}': name is required.";
                    continue;
                }

                if (!preg_match('/^[a-z][a-z0-9_]*$/', $field['name'])) {
                    $errors[] = "Field '{$field['name']}': name must be lowercase alphanumeric with underscores.";
                }

                if (in_array($field['name'], $fieldNames, true)) {
                    $errors[] = "Field '{$field['name']}': duplicate field name.";
                }
                $fieldNames[] = $field['name'];

                $type = $field['type'] ?? '';
                if (!in_array($type, $allowedTypes, true)) {
                    $errors[] = "Field '{$field['name']}': type '{$type}' is not valid. Use one of: " . implode(', ', $allowedTypes);
                }

                if (in_array($type, ['select', 'radio', 'multiselect'], true) && empty($field['options'])) {
                    $warnings[] = "Field '{$field['name']}': type '{$type}' should have options defined.";
                }
            }

            // Validate constraint field references
            $constraints = $definition['constraints'] ?? [];
            if (!empty($constraints['capacity']['slot_fields'])) {
                foreach ($constraints['capacity']['slot_fields'] as $sf) {
                    if (!in_array($sf, $fieldNames, true)) {
                        $errors[] = "Capacity constraint references field '{$sf}' which is not defined.";
                    }
                }
            }

            if (!empty($constraints['uniqueness']['fields'])) {
                foreach ($constraints['uniqueness']['fields'] as $uf) {
                    if (!in_array($uf, $fieldNames, true)) {
                        $errors[] = "Uniqueness constraint references field '{$uf}' which is not defined.";
                    }
                }
            }

            // Validate notification field reference
            $guestEmailField = $definition['notifications']['guest_email_field'] ?? null;
            if ($guestEmailField && !in_array($guestEmailField, $fieldNames, true)) {
                $warnings[] = "Guest email field '{$guestEmailField}' not found in fields.";
            }

            // Validate response template placeholders
            $responses = $definition['responses'] ?? [];
            foreach ($responses as $key => $template) {
                if (!is_string($template)) continue;
                if (preg_match_all('/\{(\w+)\}/', $template, $matches)) {
                    foreach ($matches[1] as $placeholder) {
                        if ($placeholder !== 'confirmation_code' && !in_array($placeholder, $fieldNames, true)) {
                            $warnings[] = "Response '{$key}' references {$placeholder} which is not a defined field.";
                        }
                    }
                }
            }
        }

        // Rate limit validation
        $rateLimit = $definition['rate_limit'] ?? [];
        if (isset($rateLimit['max_per_ip_per_hour']) && $rateLimit['max_per_ip_per_hour'] < 1) {
            $errors[] = 'Rate limit per IP/hour must be at least 1.';
        }
        if (isset($rateLimit['burst_max']) && $rateLimit['burst_max'] < 1) {
            $errors[] = 'Burst max must be at least 1.';
        }
        if (isset($rateLimit['burst_window_seconds']) && $rateLimit['burst_window_seconds'] < 10) {
            $errors[] = 'Burst window must be at least 10 seconds.';
        }

        // Active action count warning
        $activeCount = 0;
        foreach ($this->listActions() as $existing) {
            if (($existing['active'] ?? false) && ($existing['id'] ?? '') !== ($definition['id'] ?? '')) {
                $activeCount++;
            }
        }
        if (($definition['active'] ?? false)) {
            $activeCount++;
        }
        if ($activeCount > 10) {
            $errors[] = 'Maximum 10 active actions allowed.';
        } elseif ($activeCount > 5) {
            $warnings[] = 'More than 5 active actions may confuse AI agents. Consider deactivating unused actions.';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'warnings' => $warnings,
        ];
    }

    // ══════════════════════════════════════════════
    //  Manifest Generation (for Actions Bar)
    // ══════════════════════════════════════════════

    /**
     * Generate the public manifest for the Actions Bar.
     * Strips internal-only fields (rate_limits, notifications config, etc.).
     */
    public function generateManifest(): ?array
    {
        $actions = [];

        foreach ($this->listActions() as $action) {
            if (!($action['active'] ?? false)) {
                continue;
            }

            $publicAction = [
                'id' => $action['id'],
                'name' => $action['bar_button_label'] ?? $action['name'],
                'description' => $action['description'] ?? '',
                'icon' => $action['icon'] ?? 'circle',
                'fields' => [],
                'responses' => $action['responses'] ?? [],
            ];

            // Include i18n fields for future translations
            if (!empty($action['name_i18n'])) {
                $publicAction['name_i18n'] = $action['name_i18n'];
            }
            if (!empty($action['bar_button_label_i18n'])) {
                $publicAction['name_i18n'] = $action['bar_button_label_i18n'];
            }
            if (!empty($action['responses_i18n'])) {
                $publicAction['responses_i18n'] = $action['responses_i18n'];
            }

            foreach ($action['fields'] ?? [] as $field) {
                $publicField = [
                    'name' => $field['name'],
                    'type' => $field['type'],
                    'label' => $field['label'] ?? $field['name'],
                    'required' => $field['required'] ?? false,
                ];

                if (!empty($field['placeholder'])) $publicField['placeholder'] = $field['placeholder'];
                if (!empty($field['default_value'])) $publicField['default_value'] = $field['default_value'];
                if (!empty($field['description'])) $publicField['description'] = $field['description'];
                if (!empty($field['options'])) $publicField['options'] = $field['options'];
                if (isset($field['min'])) $publicField['min'] = $field['min'];
                if (isset($field['max'])) $publicField['max'] = $field['max'];
                if (isset($field['min_length'])) $publicField['min_length'] = $field['min_length'];
                if (isset($field['max_length'])) $publicField['max_length'] = $field['max_length'];
                if (!empty($field['require_future'])) $publicField['require_future'] = true;
                if (isset($field['label_i18n'])) $publicField['label_i18n'] = $field['label_i18n'];
                if (isset($field['placeholder_i18n'])) $publicField['placeholder_i18n'] = $field['placeholder_i18n'];
                // File field config — pass through so Actions Bar can set accept attribute and validate
                if (!empty($field['allowed_extensions'])) $publicField['allowed_extensions'] = $field['allowed_extensions'];
                if (isset($field['max_size_mb'])) $publicField['max_size_mb'] = $field['max_size_mb'];
                // Checkbox "selected by default"
                if (!empty($field['checked_default'])) $publicField['checked_default'] = true;

                $publicAction['fields'][] = $publicField;
            }

            $actions[] = $publicAction;
        }

        if (empty($actions)) {
            return ['actions' => [], 'submit_url' => '/actions/submit.php'];
        }

        // Load bar settings from site.json
        $barSettings = $this->getBarSettings();

        $siteName = $this->getSiteName();

        return [
            'actions' => $actions,
            'site_name' => $siteName,
            'submit_url' => '/actions/submit.php',
            'bar_settings' => $barSettings,
        ];
    }

    // ══════════════════════════════════════════════
    //  Helpers
    // ══════════════════════════════════════════════

    /**
     * Generate confirmation code (no ambiguous chars: 0/O, 1/I/L).
     */
    private function generateCode(int $length = 8, int $maxRetries = 3, string $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'): string
    {
        $alphaLen = strlen($alphabet);

        for ($attempt = 0; $attempt < $maxRetries; $attempt++) {
            $code = '';
            for ($i = 0; $i < $length; $i++) {
                $code .= $alphabet[random_int(0, $alphaLen - 1)];
            }

            // Check uniqueness in DB (astronomically rare collision with 29^8 = 20B combinations)
            try {
                $stmt = $this->db()->prepare(
                    'SELECT COUNT(*) FROM action_records WHERE confirmation_code = ?'
                );
                $stmt->execute([$code]);
                if ((int) $stmt->fetchColumn() === 0) {
                    return $code;
                }
            } catch (\Throwable $e) {
                // If DB check fails, accept the code (collision is vanishingly rare)
                return $code;
            }
        }

        // Max 3 retries — collision probability is astronomically low (29^8 ≈ 20 billion combos)
        // If we hit this, something is seriously wrong (e.g., bad alphabet or DB corruption)
        error_log("CRITICAL: Confirmation code collision after {$maxRetries} retries — "
            . "length={$length}, alphabet_size={$alphaLen}, last_code={$code}");

        // Return last generated code anyway — at this point a duplicate code
        // in a constraint check is infinitely better than no code at all.
        // The record insert will succeed even with a duplicate code; the only
        // consequence is two records sharing a confirmation code (which the
        // cancel-by-code path already handles by matching action_id + code).
        return $code;
    }

    /**
     * Interpolate {field} placeholders in response templates.
     */
    private function interpolate(string $template, array $data): string
    {
        return preg_replace_callback('/\{(\w+)\}/', function ($matches) use ($data) {
            $key = $matches[1];
            $value = $data[$key] ?? '';
            if (is_array($value)) {
                return implode(', ', $value);
            }
            return (string) $value;
        }, $template);
    }

    /**
     * Get business operating hours from site.json.
     */
    private function getOperatingHours(): ?array
    {
        $siteData = $this->loadSiteData();
        return $siteData['operating_hours'] ?? $siteData['hours'] ?? null;
    }

    /**
     * Get bar settings from site.json.
     */
    private function getBarSettings(): array
    {
        $siteData = $this->loadSiteData();
        return $siteData['actions_bar'] ?? [
            'visibility' => 'all-pages',
            'pages' => [],
            'position' => 'bottom-bar',
        ];
    }

    /**
     * Get site name from site.json.
     */
    private function getSiteName(): string
    {
        $siteData = $this->loadSiteData();
        return $siteData['name'] ?? $siteData['site_name'] ?? '';
    }

    /**
     * Load site.json data.
     */
    private function loadSiteData(): array
    {
        static $cache = null;
        if ($cache !== null) return $cache;

        if (!file_exists($this->siteDataPath)) {
            $cache = [];
            return $cache;
        }

        $content = file_get_contents($this->siteDataPath);
        if ($content === false) {
            $cache = [];
            return $cache;
        }

        $cache = json_decode($content, true) ?: [];
        return $cache;
    }

    /**
     * Lazy-init the database connection + ensure schema exists.
     */
    private function db(): \PDO
    {
        if ($this->db !== null) {
            return $this->db;
        }

        // Ensure _data directory exists
        $dataDir = dirname($this->dbPath);
        if (!is_dir($dataDir)) {
            mkdir($dataDir, 0755, true);
        }

        try {
            $this->db = new \PDO('sqlite:' . $this->dbPath);
            $this->db->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
            $this->db->exec('PRAGMA journal_mode=WAL');
            $this->db->exec('PRAGMA busy_timeout=5000');
            $this->ensureSchema();
            return $this->db;
        } catch (\PDOException $e) {
            error_log('ActionManager: database connection failed: ' . $e->getMessage());
            throw new \RuntimeException('Action database unavailable');
        }
    }

    /**
     * Create tables if they don't exist.
     */
    private function ensureSchema(): void
    {
        $this->db->exec('
            CREATE TABLE IF NOT EXISTS action_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action_id TEXT NOT NULL,
                data TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT \'confirmed\',
                confirmation_code TEXT NOT NULL,
                locale TEXT DEFAULT NULL,
                meta TEXT DEFAULT \'{}\',
                ip_address TEXT,
                source TEXT NOT NULL DEFAULT \'mcp\',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        ');

        $this->db->exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_records_code ON action_records(confirmation_code)');
        $this->db->exec('CREATE INDEX IF NOT EXISTS idx_records_action ON action_records(action_id, status)');
        $this->db->exec('CREATE INDEX IF NOT EXISTS idx_records_created ON action_records(action_id, created_at)');

        $this->db->exec('
            CREATE TABLE IF NOT EXISTS rate_limits (
                ip_address TEXT NOT NULL,
                action_id TEXT NOT NULL,
                window_start TEXT NOT NULL,
                count INTEGER NOT NULL DEFAULT 1,
                PRIMARY KEY (ip_address, action_id, window_start)
            )
        ');
    }

    /**
     * Probabilistic cleanup of expired rate limit rows.
     * Called on ~5% of requests to avoid unbounded table growth.
     */
    private function maybePurgeExpiredRateLimits(): void
    {
        if (mt_rand(1, 20) !== 1) {
            return;
        }

        try {
            $cutoff = date('c', time() - 86400); // 24 hours ago
            $this->db()->prepare('DELETE FROM rate_limits WHERE window_start < ?')->execute([$cutoff]);
        } catch (\Throwable $e) {
            // Non-critical — log and continue
            error_log('ActionManager: rate limit purge failed: ' . $e->getMessage());
        }
    }

    /**
     * Send guest notification email if configured.
     *
     * Looks for an email field in the action data (using `guest_email_field` config,
     * defaulting to 'email'). If found, sends a confirmation email with the
     * booking code and a summary of their submitted data.
     *
     * Fire-and-forget: failures are logged, never thrown.
     */
    private function sendGuestNotification(array $action, array $data, string $code): void
    {
        $emailField = $action['notifications']['guest_email_field'] ?? 'email';
        $guestEmail = $data[$emailField] ?? null;

        if (empty($guestEmail) || !filter_var($guestEmail, FILTER_VALIDATE_EMAIL)) {
            return; // No valid guest email — skip silently
        }

        $mailer = Mailer::getInstance();
        $siteName = $this->getSiteName();
        $actionName = $action['name'] ?? $action['id'];

        // Build subject
        $subject = "{$actionName} Confirmed — {$code}";

        // Build body with field summary
        $body = "Hi,\n\n";
        $body .= "Your {$actionName} has been confirmed.\n\n";
        $body .= "Confirmation Code: {$code}\n";
        $body .= "Keep this code for your records.\n\n";
        $body .= "Details:\n";

        foreach ($action['fields'] ?? [] as $field) {
            $name = $field['name'];
            if (isset($data[$name]) && $name !== $emailField) {
                $label = $field['label'] ?? $name;
                $value = is_array($data[$name]) ? implode(', ', $data[$name]) : (string) $data[$name];
                $body .= "  {$label}: {$value}\n";
            }
        }

        $body .= "\n" . ($action['responses']['email_footer'] ?? "Thank you for choosing {$siteName}.");

        $mailer->send($guestEmail, $subject, $body, [
            'from_name' => $siteName,
        ]);

        // Owner notification
        $this->sendOwnerNotification($action, $data, $code);
    }

    /**
     * Send owner notification email for a new record.
     *
     * Reads the owner email from Settings. If not configured, skips.
     * Summarizes the new record so the owner can act on it.
     */
    private function sendOwnerNotification(array $action, array $data, string $code): void
    {
        // Get owner email from settings
        $settings = new Settings();
        $ownerEmail = $settings->get('notifications.owner_email') ?? $settings->get('owner_email') ?? null;

        if (empty($ownerEmail)) {
            return; // No owner email configured — skip
        }

        $mailer = Mailer::getInstance();
        $siteName = $this->getSiteName();
        $actionName = $action['name'] ?? $action['id'];

        $subject = "New {$actionName} — {$code}";

        $body = "New {$actionName} received on {$siteName}.\n\n";
        $body .= "Code: {$code}\n";
        $body .= "Status: " . ($action['confirmation']['auto_confirm'] ?? true ? 'Confirmed' : 'Pending') . "\n\n";

        foreach ($action['fields'] ?? [] as $field) {
            $name = $field['name'];
            if (isset($data[$name])) {
                $label = $field['label'] ?? $name;
                $value = is_array($data[$name]) ? implode(', ', $data[$name]) : (string) $data[$name];
                $body .= "{$label}: {$value}\n";
            }
        }

        $body .= "\nManage in Studio: Actions > {$actionName}";

        $mailer->send($ownerEmail, $subject, $body, [
            'from_name' => "{$siteName} Studio",
        ]);
    }

    /**
     * Convert action id to tool name.
     * reservation → make_reservation
     */
    private function actionIdToToolName(string $actionId, string $prefix = 'make'): string
    {
        return $prefix . '_' . str_replace('-', '_', $actionId);
    }

    /**
     * Map field type to JSON Schema type.
     */
    private function fieldTypeToJsonSchemaType(string $fieldType): string
    {
        return match ($fieldType) {
            'number' => 'number',
            'checkbox' => 'boolean',
            'multiselect' => 'array',
            default => 'string',
        };
    }
}
