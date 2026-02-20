<?php
/**
 * FormValidator — Schema-driven form field validation.
 *
 * Shared between submit.php (web forms) and mcp.php (agent submissions).
 * The schema is the contract. This class enforces it.
 *
 * File uploads and spam protection are NOT handled here — they are
 * context-specific (submit.php handles files via $_FILES; MCP doesn't
 * support file uploads; spam protection differs between web and agent).
 */

declare(strict_types=1);

namespace VoxelSite;

class FormValidator
{
    private string $formsDir;
    private string $dataDir;

    public function __construct(?string $formsDir = null, ?string $dataDir = null)
    {
        $this->formsDir = $formsDir ?? $_SERVER['DOCUMENT_ROOT'] . '/assets/forms';
        $this->dataDir = $dataDir ?? $_SERVER['DOCUMENT_ROOT'] . '/assets/data';
    }

    /**
     * Load and return a form schema by ID.
     *
     * Validates the form_id format (lowercase alphanumeric + hyphens)
     * and reads the corresponding JSON file from the forms directory.
     *
     * @return array|null The schema array, or null if not found/invalid
     */
    public function loadSchema(string $formId): ?array
    {
        if (!preg_match('/^[a-z0-9]([a-z0-9_\-]*[a-z0-9])?$/', $formId)) {
            return null;
        }

        $schemaPath = $this->formsDir . '/' . $formId . '.json';
        if (!file_exists($schemaPath)) {
            return null;
        }

        $schema = json_decode(file_get_contents($schemaPath), true);
        return is_array($schema) && !empty($schema['fields']) ? $schema : null;
    }

    /**
     * List all available form schemas.
     *
     * Scans the forms directory and returns a summary of each form
     * including its ID, name, description, and field summaries.
     *
     * @return array Array of schema summaries
     */
    public function listForms(): array
    {
        $forms = [];

        if (!is_dir($this->formsDir)) {
            return $forms;
        }

        foreach (glob($this->formsDir . '/*.json') as $file) {
            $schema = json_decode(file_get_contents($file), true);
            if (!is_array($schema)) {
                continue;
            }

            $fieldSummaries = [];
            foreach ($schema['fields'] ?? [] as $field) {
                $req = ($field['required'] ?? false) ? ', required' : '';
                $fieldSummaries[] = ($field['name'] ?? '?') . ' (' . ($field['type'] ?? 'text') . $req . ')';
            }

            $forms[] = [
                'id' => $schema['id'] ?? pathinfo($file, PATHINFO_FILENAME),
                'name' => $schema['name'] ?? ucfirst(pathinfo($file, PATHINFO_FILENAME)),
                'description' => $schema['description'] ?? '',
                'fields_summary' => $fieldSummaries,
                'field_count' => count($schema['fields'] ?? []),
            ];
        }

        return $forms;
    }

    /**
     * Validate submitted data against a form schema.
     *
     * Checks required fields, type-specific validation (email, URL,
     * number ranges, date ranges, option validity), and string
     * constraints (min/max length, regex patterns).
     *
     * File fields are skipped — they require $_FILES context that
     * only submit.php has. MCP doesn't support file uploads.
     *
     * @param array $schema The form schema
     * @param array $inputData Key-value pairs of submitted data
     * @return array{valid: bool, data: array, errors: array}
     */
    public function validate(array $schema, array $inputData): array
    {
        $errors = [];
        $cleanData = [];

        foreach ($schema['fields'] as $field) {
            $name = $field['name'];
            $value = $inputData[$name] ?? null;
            $type = $field['type'] ?? 'text';
            $required = $field['required'] ?? $field['validation']['required'] ?? false;
            $validation = $field['validation'] ?? [];

            // Skip file fields — handled by submit.php only
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

                case 'date':
                    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) || !strtotime($value)) {
                        $errors[$name] = 'Please enter a valid date';
                    } else {
                        $date = strtotime($value);
                        if (isset($validation['min'])) {
                            $minDate = $this->resolveRelativeDate($validation['min']);
                            if ($date < $minDate) {
                                $errors[$name] = 'Date is too early';
                            }
                        }
                        if (isset($validation['max'])) {
                            $maxDate = $this->resolveRelativeDate($validation['max']);
                            if ($date > $maxDate) {
                                $errors[$name] = 'Date is too far in the future';
                            }
                        }
                    }
                    break;

                case 'time':
                    if (!preg_match('/^\d{2}:\d{2}$/', $value)) {
                        $errors[$name] = 'Please enter a valid time';
                    }
                    break;

                case 'select':
                case 'radio':
                    $validOptions = $this->getValidOptions($field);
                    if (!in_array($value, $validOptions, true)) {
                        $errors[$name] = 'Please select a valid option';
                    }
                    break;

                case 'multiselect':
                    $value = is_array($value) ? $value : [$value];
                    $validOptions = $this->getValidOptions($field);
                    foreach ($value as $v) {
                        if (!in_array($v, $validOptions, true)) {
                            $errors[$name] = 'One or more selected options are invalid';
                            break;
                        }
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

        return [
            'valid' => empty($errors),
            'data' => $cleanData,
            'errors' => $errors,
        ];
    }

    /**
     * Get valid option values for select/radio/multiselect fields.
     *
     * Supports both static options defined in the schema and dynamic
     * options referenced from data layer files via `options_from`.
     */
    public function getValidOptions(array $field): array
    {
        // Dynamic options from data layer
        if (isset($field['options_from'])) {
            $filename = basename($field['options_from']); // Security: strip path components
            $dataFile = $this->dataDir . '/' . $filename;
            if (file_exists($dataFile)) {
                $fileData = json_decode(file_get_contents($dataFile), true);
                if (is_array($fileData)) {
                    $options = [];
                    array_walk_recursive($fileData, function ($value, $key) use (&$options) {
                        if ($key === 'name' || $key === 'title') {
                            $options[] = $value;
                        }
                    });
                    return $options;
                }
            }
        }

        // Static options from schema
        return array_column($field['options'] ?? [], 'value');
    }

    /**
     * Resolve relative date specifications to timestamps.
     *
     * Supports "today", relative specs like "+7 days", "+3 months",
     * and absolute date strings parseable by strtotime().
     */
    public function resolveRelativeDate(string $spec): int
    {
        if ($spec === 'today') {
            return strtotime('today');
        }
        if (preg_match('/^[+-]\d+\s+(day|days|week|weeks|month|months)$/', $spec)) {
            return strtotime($spec);
        }
        return strtotime($spec) ?: time();
    }
}
