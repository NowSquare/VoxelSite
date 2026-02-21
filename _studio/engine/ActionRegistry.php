<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Maps user-facing actions to structured prompt flows.
 *
 * Each action (create_site, edit_page, change_design, etc.) has:
 * - Metadata: label, description, icon, category
 * - Steps: ordered wizard steps for future multi-step UIs
 * - Prompt template: the .md file in _studio/prompts/actions/
 * - Context builder: merges user inputs into the prompt
 *
 * The AI endpoint uses this to convert a button click ("Create a website")
 * into a structured prompt that includes the action template, user
 * preferences, and any wizard step data.
 *
 * Why a registry instead of hardcoded logic?
 * - New actions are added by dropping a .md file and registering here
 * - Each action's steps can be customized without touching the AI code
 * - The GET /ai/actions endpoint reads this to populate the UI
 */
class ActionRegistry
{
    /**
     * All registered actions.
     *
     * @var array<string, array{
     *   id: string,
     *   label: string,
     *   description: string,
     *   icon: string,
     *   category: string,
     *   promptFile: string,
     *   steps: array
     * }>
     */
    private array $actions;

    /** @var string Path to the prompts/actions/ directory */
    private string $promptsPath;

    public function __construct()
    {
        $this->promptsPath = dirname(__DIR__) . '/prompts/actions';
        $this->actions = $this->defineActions();
    }

    // ═══════════════════════════════════════════
    //  Public API
    // ═══════════════════════════════════════════

    /**
     * Get all available actions.
     *
     * Returns the action list for the GET /ai/actions endpoint.
     * The promptFile and internal fields are stripped — only
     * user-facing metadata is returned.
     *
     * @return array<int, array>
     */
    public function getActions(): array
    {
        $result = [];

        foreach ($this->actions as $action) {
            $result[] = [
                'id'          => $action['id'],
                'label'       => $action['label'],
                'description' => $action['description'],
                'icon'        => $action['icon'],
                'category'    => $action['category'],
                'hasSteps'    => !empty($action['steps']),
            ];
        }

        return $result;
    }

    /**
     * Get the wizard steps for an action.
     *
     * Returns an ordered list of steps, each with:
     * - id: step identifier
     * - label: display name
     * - type: input type (text, select, textarea, cards)
     * - options: available choices (for select/cards)
     * - required: whether the step must be completed
     *
     * @return array<int, array>
     */
    public function getSteps(string $actionId): array
    {
        $action = $this->actions[$actionId] ?? null;

        if ($action === null) {
            return [];
        }

        return $action['steps'];
    }

    /**
     * Check if an action ID exists.
     */
    public function exists(string $actionId): bool
    {
        return isset($this->actions[$actionId]);
    }

    /**
     * Load the prompt template for an action.
     *
     * Returns the raw markdown content of the action's prompt file.
     * Returns null if the file doesn't exist.
     */
    public function loadPromptTemplate(string $actionId): ?string
    {
        $action = $this->actions[$actionId] ?? null;

        if ($action === null) {
            return null;
        }

        $path = $this->promptsPath . '/' . $action['promptFile'];

        if (!file_exists($path)) {
            return null;
        }

        return file_get_contents($path);
    }

    /**
     * Build the enriched prompt context for an action.
     *
     * Takes the user's free-form prompt and the structured action data
     * (from wizard steps or quick-prompt buttons), and combines them
     * into a detailed prompt that the AI can act on.
     *
     * This is the bridge between "Create a website" button click
     * and the actual prompt that hits Claude.
     *
     * @param string $actionId   The action type (e.g., 'create_site')
     * @param string $userPrompt The user's free-form text
     * @param array  $actionData Structured data from wizard steps
     * @return string The enriched prompt ready for the AI
     */
    public function buildPromptContext(
        string $actionId,
        string $userPrompt,
        array $actionData = []
    ): string {
        return match ($actionId) {
            'create_site'   => $this->buildCreateSitePrompt($userPrompt, $actionData),
            'edit_page'     => $this->buildEditPagePrompt($userPrompt, $actionData),
            'change_design' => $this->buildChangeDesignPrompt($userPrompt, $actionData),
            'add_page'      => $this->buildAddPagePrompt($userPrompt, $actionData),
            'optimize_aeo'  => $this->buildOptimizeAeoPrompt($userPrompt),
            'inline_edit'   => $this->buildInlineEditPrompt($userPrompt, $actionData),
            'section_edit'  => $this->buildSectionEditPrompt($userPrompt, $actionData),
            default         => $userPrompt, // free_prompt passes through unchanged
        };
    }

    // ═══════════════════════════════════════════
    //  Action Definitions
    // ═══════════════════════════════════════════

    /**
     * Define all registered actions.
     *
     * Each action has metadata, a prompt file reference,
     * and optional wizard steps.
     */
    private function defineActions(): array
    {
        return [
            'create_site' => [
                'id'          => 'create_site',
                'label'       => 'Create Website',
                'description' => 'Generate a complete website from a description',
                'icon'        => 'sparkles',
                'category'    => 'site',
                'promptFile'  => 'create_site.md',
                'steps'       => [
                    [
                        'id'       => 'description',
                        'label'    => 'Describe your business',
                        'type'     => 'textarea',
                        'required' => true,
                        'placeholder' => 'Tell us about your business, what you do, and who your customers are...',
                    ],
                    [
                        'id'       => 'pages',
                        'label'    => 'Pages to create',
                        'type'     => 'text',
                        'required' => false,
                        'placeholder' => 'Home, About, Services, Contact (leave blank for AI to decide)',
                    ],
                    [
                        'id'       => 'style',
                        'label'    => 'Visual style',
                        'type'     => 'cards',
                        'required' => false,
                        'options'  => [
                            ['id' => 'modern_minimal',   'label' => 'Modern Minimal',   'description' => 'Clean lines, whitespace, one accent color'],
                            ['id' => 'bold_vibrant',     'label' => 'Bold & Vibrant',   'description' => 'Strong colors, large type, energetic'],
                            ['id' => 'elegant_classic',  'label' => 'Elegant Classic',  'description' => 'Serif fonts, refined, understated luxury'],
                            ['id' => 'playful_creative', 'label' => 'Playful Creative', 'description' => 'Rounded shapes, bright colors, personality'],
                            ['id' => 'dark_premium',     'label' => 'Dark & Premium',   'description' => 'Dark backgrounds, dramatic contrast'],
                        ],
                    ],
                    [
                        'id'       => 'content_mode',
                        'label'    => 'Content approach',
                        'type'     => 'cards',
                        'required' => false,
                        'options'  => [
                            ['id' => 'ai_writes',    'label' => 'AI writes content',    'description' => 'Generate realistic copy based on your description'],
                            ['id' => 'placeholder',  'label' => 'Placeholder text',     'description' => 'Structured placeholders you can fill in later'],
                            ['id' => 'user_provides', 'label' => 'I\'ll provide text',  'description' => 'Labeled content blocks for you to replace'],
                        ],
                    ],
                ],
            ],

            'edit_page' => [
                'id'          => 'edit_page',
                'label'       => 'Edit Page',
                'description' => 'Modify content, layout, or sections on a page',
                'icon'        => 'file-pen',
                'category'    => 'pages',
                'promptFile'  => 'edit_page.md',
                'steps'       => [
                    [
                        'id'       => 'page',
                        'label'    => 'Which page?',
                        'type'     => 'select',
                        'required' => true,
                        'source'   => 'pages', // Populated dynamically from the pages table
                    ],
                    [
                        'id'       => 'instruction',
                        'label'    => 'What to change',
                        'type'     => 'textarea',
                        'required' => true,
                        'placeholder' => 'Add a testimonials section below the hero...',
                    ],
                ],
            ],

            'change_design' => [
                'id'          => 'change_design',
                'label'       => 'Change Design',
                'description' => 'Update colors, typography, spacing, or overall aesthetic',
                'icon'        => 'palette',
                'category'    => 'design',
                'promptFile'  => 'change_design.md',
                'steps'       => [
                    [
                        'id'       => 'change_type',
                        'label'    => 'What to change',
                        'type'     => 'cards',
                        'required' => false,
                        'options'  => [
                            ['id' => 'colors',     'label' => 'Colors',     'description' => 'Change the color palette'],
                            ['id' => 'typography', 'label' => 'Typography', 'description' => 'Change fonts and text styling'],
                            ['id' => 'spacing',    'label' => 'Spacing',    'description' => 'Adjust whitespace and density'],
                            ['id' => 'aesthetic',  'label' => 'Overall',    'description' => 'Change the entire visual feel'],
                        ],
                    ],
                    [
                        'id'       => 'instruction',
                        'label'    => 'Describe the change',
                        'type'     => 'textarea',
                        'required' => true,
                        'placeholder' => 'Make it warmer and more inviting...',
                    ],
                ],
            ],

            'add_page' => [
                'id'          => 'add_page',
                'label'       => 'Add Page',
                'description' => 'Create a new page for your website',
                'icon'        => 'file-plus',
                'category'    => 'pages',
                'promptFile'  => 'edit_page.md', // Reuses edit_page prompt with "add" context
                'steps'       => [
                    [
                        'id'       => 'page_name',
                        'label'    => 'Page name',
                        'type'     => 'text',
                        'required' => true,
                        'placeholder' => 'e.g., Team, Portfolio, FAQ, Blog',
                    ],
                    [
                        'id'       => 'instruction',
                        'label'    => 'Page description',
                        'type'     => 'textarea',
                        'required' => false,
                        'placeholder' => 'What should this page contain?',
                    ],
                ],
            ],

            'optimize_aeo' => [
                'id'          => 'optimize_aeo',
                'label'       => 'Optimize for AI',
                'description' => 'Enhance your site for AI search engines and assistants',
                'icon'        => 'brain',
                'category'    => 'general',
                'promptFile'  => 'optimize_aeo.md',
                'steps'       => [], // One-click action — no wizard needed
            ],

            'section_edit' => [
                'id'          => 'section_edit',
                'label'       => 'Edit Section',
                'description' => 'Modify a specific section using natural language',
                'icon'        => 'sparkles',
                'category'    => 'general',
                'promptFile'  => 'section_edit.md',
                'steps'       => [],
            ],

            'inline_edit' => [
                'id'          => 'inline_edit',
                'label'       => 'Inline Edit',
                'description' => 'Edit a specific block of code inside the editor',
                'icon'        => 'code',
                'category'    => 'general',
                'promptFile'  => 'inline_edit.md',
                'steps'       => [],
            ],

            'free_prompt' => [
                'id'          => 'free_prompt',
                'label'       => 'Free Prompt',
                'description' => 'Tell the AI anything — modify, fix, or explore',
                'icon'        => 'message-square',
                'category'    => 'general',
                'promptFile'  => '', // No specific prompt template
                'steps'       => [],  // No wizard — direct text input
            ],
        ];
    }

    // ═══════════════════════════════════════════
    //  Prompt Builders
    // ═══════════════════════════════════════════

    /**
     * Build an enriched prompt for site creation.
     *
     * Takes the user's description and wizard data, and creates
     * a detailed instruction that contains all the structured info
     * the AI needs.
     *
     * When wizard steps are skipped (quick-prompt button), sensible
     * defaults are injected so the AI can generate immediately
     * without asking clarifying questions.
     */
    private function buildCreateSitePrompt(string $userPrompt, array $data): string
    {
        $parts = ["Create a complete website based on the following:"];

        // User's primary description
        $parts[] = "\n## Business Description\n{$userPrompt}";

        // Pages — default to standard set if not specified
        if (!empty($data['pages'])) {
            $parts[] = "\n## Requested Pages\n{$data['pages']}";
        } else {
            $parts[] = "\n## Requested Pages\nHome, About, Services, Contact";
        }

        // Style — default to Modern Minimal
        if (!empty($data['style'])) {
            $styleLabel = $this->getOptionLabel('create_site', 'style', $data['style']);
            $parts[] = "\n## Style Preference\n{$styleLabel}";
        } else {
            $parts[] = "\n## Style Preference\nModern Minimal — Clean lines, whitespace, one accent color";
        }

        // Content mode — default to AI-written
        if (!empty($data['content_mode'])) {
            $modeLabel = $this->getOptionLabel('create_site', 'content_mode', $data['content_mode']);
            $parts[] = "\n## Content Approach\n{$modeLabel}";
        } else {
            $parts[] = "\n## Content Approach\nAI writes content — Generate realistic copy based on the business description";
        }

        // Key instruction: generate immediately, no questions
        $parts[] = "\n## IMPORTANT\nDo NOT ask clarifying questions. Generate the complete website now using the details above. Make reasonable assumptions for anything not specified.";

        return implode("\n", $parts);
    }

    /**
     * Build an enriched prompt for page editing.
     */
    private function buildEditPagePrompt(string $userPrompt, array $data): string
    {
        $parts = [];

        if (!empty($data['page'])) {
            $parts[] = "Edit the page: {$data['page']}";
        }

        // The user prompt is the instruction
        $instruction = $data['instruction'] ?? $userPrompt;
        $parts[] = "\n## Changes Requested\n{$instruction}";

        return implode("\n", $parts);
    }

    /**
     * Build an enriched prompt for design changes.
     */
    private function buildChangeDesignPrompt(string $userPrompt, array $data): string
    {
        $parts = ["Change the website's design:"];

        if (!empty($data['change_type'])) {
            $typeLabel = $this->getOptionLabel('change_design', 'change_type', $data['change_type']);
            $parts[] = "\n## Change Type\n{$typeLabel}";
        }

        $instruction = $data['instruction'] ?? $userPrompt;
        $parts[] = "\n## Design Direction\n{$instruction}";

        return implode("\n", $parts);
    }

    /**
     * Build an enriched prompt for adding a new page.
     */
    private function buildAddPagePrompt(string $userPrompt, array $data): string
    {
        $parts = [];

        if (!empty($data['page_name'])) {
            $parts[] = "Create a new page called \"{$data['page_name']}\" and add it to the site's navigation.";
        }

        $instruction = $data['instruction'] ?? $userPrompt;
        if (!empty($instruction)) {
            $parts[] = "\n## Page Description\n{$instruction}";
        }

        // If user just used the quick-prompt button
        if (empty($parts)) {
            return $userPrompt;
        }

        return implode("\n", $parts);
    }
    /**
     * Build the prompt for AEO optimization.
     *
     * This is a one-click action — no wizard data. The AI
     * reads the current site context (including data layer)
     * and optimizes everything for AI discovery.
     */
    private function buildOptimizeAeoPrompt(string $userPrompt): string
    {
        $prompt = "Analyze this website and optimize it for AI discovery (AEO).";

        if (!empty($userPrompt) && $userPrompt !== 'Optimize for AI') {
            $prompt .= "\n\n## Additional Instructions\n{$userPrompt}";
        }

        $prompt .= "\n\n## IMPORTANT\nReview the current data layer context. Create or update data files as needed. Do NOT ask questions — analyze and optimize immediately. Preserve all existing design and layout.";

        return $prompt;
    }

    /**
     * Build the prompt for inline code edits via Cmd+K.
     * Instructs the AI to focus precisely on replacing a highlighted block.
     */
    private function buildInlineEditPrompt(string $userPrompt, array $data): string
    {
        $parts = ["Modify the specific file and code block requested. Integrate your changes into the exact location of the selected code, and return THE ENTIRE REWRITTEN FILE using the standard <file> tags. DO NOT return partial files."];

        if (!empty($data['path'])) {
            $parts[] = "\n## Target File\n{$data['path']}";
        }

        if (!empty($data['selection'])) {
            $parts[] = "\n## Selected Code to Replace\n```php\n{$data['selection']}\n```";
        }

        $parts[] = "\n## Instruction\n{$userPrompt}";

        return implode("\n", $parts);
    }

    /**
     * Build the prompt for section-level AI edits from the visual editor.
     * Sends the section's outerHTML so the AI knows exactly what to modify.
     */
    private function buildSectionEditPrompt(string $userPrompt, array $data): string
    {
        $parts = ["Modify the specific section described below. Apply the user's instruction to this section only, preserving the page's overall design language. Return THE ENTIRE REWRITTEN FILE using the standard <file> tags."];

        if (!empty($data['path'])) {
            $parts[] = "\n## Target File\n{$data['path']}";
        }

        if (!empty($data['sectionHtml'])) {
            $parts[] = "\n## Section HTML (the exact section the user clicked)\n```html\n{$data['sectionHtml']}\n```";
        }

        $parts[] = "\n## User's Instruction\n{$userPrompt}";

        $parts[] = "\n## IMPORTANT\nModify ONLY this section. Do NOT change other parts of the page. Preserve existing Tailwind classes and design tokens unless explicitly asked to change them. Generate the complete rewritten file.";

        return implode("\n", $parts);
    }

    // ═══════════════════════════════════════════
    //  Helpers
    // ═══════════════════════════════════════════

    /**
     * Get the human-readable label for a step option.
     *
     * Used when building prompts — converts 'modern_minimal'
     * to 'Modern Minimal: Clean lines, whitespace, one accent color'.
     */
    private function getOptionLabel(string $actionId, string $stepId, string $optionId): string
    {
        $action = $this->actions[$actionId] ?? null;
        if ($action === null) {
            return $optionId;
        }

        foreach ($action['steps'] as $step) {
            if ($step['id'] === $stepId && isset($step['options'])) {
                foreach ($step['options'] as $option) {
                    if ($option['id'] === $optionId) {
                        $label = $option['label'];
                        if (!empty($option['description'])) {
                            $label .= ': ' . $option['description'];
                        }
                        return $label;
                    }
                }
            }
        }

        return $optionId;
    }
}
