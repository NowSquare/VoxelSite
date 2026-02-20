<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Answer Engine Optimization (AEO) & Agentic Web Readiness generator.
 *
 * The invisible moat. Every site VoxelSite publishes is automatically
 * the best-optimized site for AI discovery — without the user knowing
 * or caring. This class makes that happen.
 *
 * Reads the structured data layer (assets/data/*.json) and generates:
 * - llms.txt       — plain-text site summary for AI models
 * - robots.txt     — crawler directives with AI bot allowances
 * - Schema.org     — _partials/schema.php for JSON-LD structured data
 * - MCP server     — mcp.php endpoint for AI agent interaction
 *
 * Called during publish to auto-generate these files at the document
 * root. The data layer is the single source of truth — this class
 * simply translates it into formats that different consumers expect.
 *
 * Why auto-generate instead of asking the AI to create these?
 * - Reliability: the AI might forget or produce incorrect structured data
 * - Consistency: every site gets the same AEO treatment
 * - Simplicity: the user never needs to think about it
 * - Correctness: Schema.org and llms.txt have strict format requirements
 */
class AEOGenerator
{
    private string $assetsPath;
    private string $previewPath;
    private string $docRoot;

    public function __construct()
    {
        $this->assetsPath = dirname(__DIR__, 2) . '/assets';
        $this->previewPath = dirname(__DIR__) . '/preview';
        $this->docRoot = dirname(__DIR__, 2);
    }

    // ═══════════════════════════════════════════
    //  Public API
    // ═══════════════════════════════════════════

    /**
     * Generate all AEO files during publish.
     *
     * Called from publish.php after all preview files have been
     * copied to production. Reads the data layer and creates
     * machine-readable files at the document root.
     *
     * @param string $baseUrl The site's public URL (e.g., "https://bakkerij.nl")
     * @return array{generated: string[], skipped?: string}
     */
    public function generateAll(string $baseUrl = ''): array
    {
        $site = $this->loadSiteData();
        if ($site === null) {
            return ['generated' => [], 'skipped' => 'No assets/data/site.json found'];
        }

        $generated = [];

        // 1. llms.txt — AI model discovery
        $llmsTxt = $this->generateLlmsTxt($site, $baseUrl);
        if ($llmsTxt !== null) {
            $this->writeFileAtomic($this->docRoot . '/llms.txt', $llmsTxt);
            $generated[] = 'llms.txt';
        }

        // 2. robots.txt — crawler directives
        $robotsTxt = $this->generateRobotsTxt($baseUrl);
        $this->writeFileAtomic($this->docRoot . '/robots.txt', $robotsTxt);
        $generated[] = 'robots.txt';

        // 3. _partials/schema.php — JSON-LD structured data
        $schemaPhp = $this->generateSchemaPartial();
        $this->ensureDirectory($this->previewPath . '/_partials');
        $this->writeFileAtomic($this->previewPath . '/_partials/schema.php', $schemaPhp);
        $this->ensureDirectory($this->docRoot . '/_partials');
        $this->writeFileAtomic($this->docRoot . '/_partials/schema.php', $schemaPhp);
        $generated[] = '_partials/schema.php';

        // 4. mcp.php — MCP server for AI agent interaction
        $mcpPhp = $this->generateMcpServer();
        $this->writeFileAtomic($this->docRoot . '/mcp.php', $mcpPhp);
        $generated[] = 'mcp.php';

        // 5. Inject schema include into head.php if not already present
        $this->ensureSchemaInclude();
        $generated[] = '_partials/head.php (schema include)';

        return ['generated' => $generated];
    }

    // ═══════════════════════════════════════════
    //  llms.txt Generation
    // ═══════════════════════════════════════════

    /**
     * Generate llms.txt content from the data layer.
     *
     * llms.txt is an emerging standard that provides AI models with
     * a structured, plain-text summary of the website's content.
     * Think of it as robots.txt for AI — but welcoming instead of blocking.
     *
     * Format follows llmstxt.org specification:
     *   # Title
     *   > Description
     *   Details and structured content
     *
     * @see https://llmstxt.org
     */
    public function generateLlmsTxt(array $site, string $baseUrl = ''): ?string
    {
        $name = $site['name'] ?? '';
        if (empty($name)) {
            return null;
        }

        $lines = [];

        // Header
        $lines[] = "# {$name}";
        $lines[] = '';

        if (!empty($site['tagline'])) {
            $lines[] = "> {$site['tagline']}";
            $lines[] = '';
        }

        if (!empty($site['description'])) {
            $lines[] = $site['description'];
            $lines[] = '';
        }

        // Contact information (only real data, no placeholders)
        $contact = $this->sanitizeContactData($site['contact'] ?? []);
        if (!empty($contact)) {
            $lines[] = '## Contact';
            $lines[] = '';

            if (!empty($contact['email'])) {
                $lines[] = "- Email: {$contact['email']}";
            }
            if (!empty($contact['phone'])) {
                $lines[] = "- Phone: {$contact['phone']}";
            }
            if (!empty($contact['address'])) {
                $addr = $contact['address'];
                $parts = array_filter([
                    $addr['street'] ?? '',
                    $addr['city'] ?? '',
                    $addr['region'] ?? '',
                    $addr['postal_code'] ?? '',
                    $addr['country'] ?? '',
                ]);
                if (!empty($parts)) {
                    $lines[] = '- Address: ' . implode(', ', $parts);
                }
            }
            $lines[] = '';
        }

        // Opening hours
        $hours = $site['hours'] ?? [];
        if (!empty($hours)) {
            $lines[] = '## Opening Hours';
            $lines[] = '';
            foreach ($hours as $schedule) {
                $days = $schedule['days'] ?? '';
                if (!empty($schedule['closed'])) {
                    $lines[] = "- {$days}: Closed";
                } else {
                    $open = $schedule['open'] ?? '';
                    $close = $schedule['close'] ?? '';
                    $lines[] = "- {$days}: {$open}–{$close}";
                }
            }
            $lines[] = '';
        }

        // Pages (from page registry, verified to exist on disk)
        $pages = $this->loadVerifiedPagesList();
        if (!empty($pages)) {
            $lines[] = '## Pages';
            $lines[] = '';
            foreach ($pages as $page) {
                $slug = $page['slug'];
                $title = $page['title'];
                $url = $baseUrl . '/' . ($slug === 'index' ? '' : $slug);
                $lines[] = "- [{$title}]({$url})";
            }
            $lines[] = '';
        }

        // Feature-specific content
        $features = $site['features'] ?? [];
        foreach ($features as $feature) {
            $featureContent = $this->generateLlmsFeatureSection($feature);
            if ($featureContent !== null) {
                $lines[] = $featureContent;
            }
        }

        // Social links (only real URLs, not placeholders)
        $social = $this->sanitizeSocialLinks($site['social'] ?? []);
        if (!empty($social)) {
            $lines[] = '## Social';
            $lines[] = '';
            foreach ($social as $platform => $url) {
                $platformName = ucfirst($platform);
                $lines[] = "- [{$platformName}]({$url})";
            }
            $lines[] = '';
        }

        // Interactive forms (from assets/forms/)
        $formsContent = $this->generateLlmsFormsSection();
        if ($formsContent !== null) {
            $lines[] = $formsContent;
        }

        // Footer
        $lines[] = '---';
        $lines[] = "This information is provided for AI assistants and language models to better understand and represent {$name}.";

        return implode("\n", $lines) . "\n";
    }

    /**
     * Generate a feature-specific section for llms.txt.
     *
     * Reads the corresponding {feature}.json and formats it
     * as a readable text section.
     */
    private function generateLlmsFeatureSection(string $feature): ?string
    {
        // Skip features that don't have queryable data
        if (in_array($feature, ['contact_form'], true)) {
            return null;
        }

        $data = $this->loadFeatureData($feature);
        if ($data === null) {
            return null;
        }

        $lines = [];

        switch ($feature) {
            case 'menu':
                $lines[] = '## Menu';
                $lines[] = '';
                $categories = $data['categories'] ?? [$data];
                foreach ($categories as $category) {
                    if (!empty($category['name'])) {
                        $lines[] = "### {$category['name']}";
                        $lines[] = '';
                    }
                    $items = $category['items'] ?? [];
                    foreach ($items as $item) {
                        $name = $item['name'] ?? '';
                        $desc = $item['description'] ?? '';
                        $price = isset($item['price']) ? ' — ' . ($item['currency'] ?? '€') . number_format((float) $item['price'], 2) : '';
                        $dietary = !empty($item['dietary']) ? ' (' . implode(', ', (array) $item['dietary']) . ')' : '';
                        $lines[] = "- **{$name}**{$price}{$dietary}";
                        if (!empty($desc)) {
                            $lines[] = "  {$desc}";
                        }
                    }
                    $lines[] = '';
                }
                break;

            case 'services':
                $lines[] = '## Services';
                $lines[] = '';
                $items = $data['services'] ?? $data['items'] ?? $data;
                if (is_array($items)) {
                    foreach ($items as $item) {
                        if (!is_array($item)) continue;
                        $name = $item['name'] ?? '';
                        $desc = $item['description'] ?? '';
                        $price = !empty($item['price_range']) ? " — {$item['price_range']}" : '';
                        $lines[] = "- **{$name}**{$price}";
                        if (!empty($desc)) {
                            $lines[] = "  {$desc}";
                        }
                    }
                }
                $lines[] = '';
                break;

            case 'products':
                $lines[] = '## Products';
                $lines[] = '';
                $items = $data['products'] ?? $data['items'] ?? $data;
                if (is_array($items)) {
                    foreach ($items as $item) {
                        if (!is_array($item)) continue;
                        $name = $item['name'] ?? '';
                        $price = isset($item['price']) ? ' — ' . ($item['currency'] ?? '$') . number_format((float) $item['price'], 2) : '';
                        $lines[] = "- **{$name}**{$price}";
                        if (!empty($item['description'])) {
                            $lines[] = "  {$item['description']}";
                        }
                    }
                }
                $lines[] = '';
                break;

            case 'team':
                $lines[] = '## Team';
                $lines[] = '';
                $members = $data['members'] ?? $data['team'] ?? $data;
                if (is_array($members)) {
                    foreach ($members as $member) {
                        if (!is_array($member)) continue;
                        $name = $member['name'] ?? '';
                        $role = !empty($member['role']) ? " — {$member['role']}" : '';
                        $lines[] = "- **{$name}**{$role}";
                        if (!empty($member['bio'])) {
                            $lines[] = "  {$member['bio']}";
                        }
                    }
                }
                $lines[] = '';
                break;

            case 'faq':
                $lines[] = '## Frequently Asked Questions';
                $lines[] = '';
                $items = $data['questions'] ?? $data['faq'] ?? $data['items'] ?? $data;
                if (is_array($items)) {
                    foreach ($items as $item) {
                        if (!is_array($item)) continue;
                        $q = $item['question'] ?? '';
                        $a = $item['answer'] ?? '';
                        if (!empty($q)) {
                            $lines[] = "**Q: {$q}**";
                            $lines[] = "A: {$a}";
                            $lines[] = '';
                        }
                    }
                }
                break;

            case 'pricing':
                $lines[] = '## Pricing';
                $lines[] = '';
                $plans = $data['plans'] ?? $data['pricing'] ?? $data;
                if (is_array($plans)) {
                    foreach ($plans as $plan) {
                        if (!is_array($plan)) continue;
                        $name = $plan['name'] ?? '';
                        $price = isset($plan['price']) ? ($plan['currency'] ?? '$') . number_format((float) $plan['price'], 2) : '';
                        $interval = !empty($plan['interval']) ? "/{$plan['interval']}" : '';
                        $lines[] = "- **{$name}** — {$price}{$interval}";
                        if (!empty($plan['features']) && is_array($plan['features'])) {
                            foreach ($plan['features'] as $feat) {
                                $lines[] = "  - {$feat}";
                            }
                        }
                    }
                }
                $lines[] = '';
                break;

            case 'events':
                $lines[] = '## Events';
                $lines[] = '';
                $events = $data['events'] ?? $data['items'] ?? $data;
                if (is_array($events)) {
                    foreach ($events as $event) {
                        if (!is_array($event)) continue;
                        $title = $event['title'] ?? $event['name'] ?? '';
                        $date = $event['date'] ?? '';
                        $lines[] = "- **{$title}** ({$date})";
                        if (!empty($event['description'])) {
                            $lines[] = "  {$event['description']}";
                        }
                    }
                }
                $lines[] = '';
                break;

            case 'testimonials':
                $lines[] = '## Testimonials';
                $lines[] = '';
                $reviews = $data['testimonials'] ?? $data['reviews'] ?? $data;
                if (is_array($reviews)) {
                    foreach ($reviews as $review) {
                        if (!is_array($review)) continue;
                        $author = $review['author'] ?? '';
                        $role = !empty($review['role']) ? ", {$review['role']}" : '';
                        $company = !empty($review['company']) ? " at {$review['company']}" : '';
                        $text = $review['text'] ?? $review['content'] ?? '';
                        $rating = isset($review['rating']) ? " ★{$review['rating']}/5" : '';
                        $lines[] = "> \"{$text}\"";
                        $lines[] = "> — {$author}{$role}{$company}{$rating}";
                        $lines[] = '';
                    }
                }
                break;

            default:
                // For unknown features, just dump the data structure overview
                $lines[] = '## ' . ucfirst(str_replace('_', ' ', $feature));
                $lines[] = '';
                $lines[] = "Detailed {$feature} data available via the site's API.";
                $lines[] = '';
                break;
        }

        return implode("\n", $lines);
    }

    /**
     * Generate the Interactive Features section for llms.txt.
     *
     * Lists available forms so AI agents know what submissions
     * the site accepts and how to interact via MCP.
     */
    private function generateLlmsFormsSection(): ?string
    {
        $formsDir = $this->assetsPath . '/forms';
        if (!is_dir($formsDir)) {
            return null;
        }

        $files = @scandir($formsDir);
        if ($files === false) {
            return null;
        }

        $forms = [];
        foreach ($files as $file) {
            if ($file[0] === '.' || !str_ends_with($file, '.json')) {
                continue;
            }
            $content = @file_get_contents($formsDir . '/' . $file);
            if ($content === false) {
                continue;
            }
            $schema = json_decode($content, true);
            if (!is_array($schema)) {
                continue;
            }
            $forms[] = $schema;
        }

        if (empty($forms)) {
            return null;
        }

        $lines = [];
        $lines[] = '## Interactive Features';
        $lines[] = '';
        $lines[] = 'This site accepts the following submissions:';
        $lines[] = '';

        foreach ($forms as $form) {
            $id = $form['id'] ?? 'unknown';
            $name = $form['name'] ?? ucfirst($id);
            $desc = $form['description'] ?? '';

            // Build a brief field summary
            $fieldSummary = [];
            foreach ($form['fields'] ?? [] as $field) {
                $fieldSummary[] = $field['name'] ?? 'field';
            }
            $fieldsStr = !empty($fieldSummary) ? implode(', ', $fieldSummary) : 'various fields';

            $lines[] = "- **{$name}** (`{$id}`): {$desc} — {$fieldsStr}";
        }

        $lines[] = '';
        $lines[] = 'These can be submitted via web forms or via the MCP endpoint at /mcp.php.';
        $lines[] = '';

        return implode("\n", $lines);
    }

    // ═══════════════════════════════════════════
    //  robots.txt Generation
    // ═══════════════════════════════════════════

    /**
     * Generate robots.txt with AI crawler allowances.
     *
     * Unlike traditional robots.txt that blocks crawlers, VoxelSite's
     * version explicitly welcomes AI bots. This is the invisible moat:
     * while other builders block or ignore AI crawlers, every VoxelSite
     * site says "come in, everything is organized for you."
     */
    public function generateRobotsTxt(string $baseUrl = ''): string
    {
        $lines = [];

        // Standard crawlers — allow everything except _studio/
        $lines[] = 'User-agent: *';
        $lines[] = 'Allow: /';
        $lines[] = 'Disallow: /_studio/';
        $lines[] = '';

        // AI crawlers — explicitly welcomed
        $aiCrawlers = [
            'GPTBot'           => 'OpenAI',
            'ChatGPT-User'     => 'ChatGPT browsing',
            'Google-Extended'   => 'Google AI (Gemini)',
            'Googlebot'        => 'Google Search',
            'anthropic-ai'     => 'Anthropic',
            'ClaudeBot'        => 'Claude',
            'Bytespider'       => 'ByteDance AI',
            'CCBot'            => 'Common Crawl',
            'PerplexityBot'    => 'Perplexity AI',
            'Cohere-ai'        => 'Cohere',
            'YouBot'           => 'You.com',
        ];

        $lines[] = '# AI crawlers are welcome — this site is optimized for AI discovery';
        foreach ($aiCrawlers as $bot => $desc) {
            $lines[] = "User-agent: {$bot}";
            $lines[] = 'Allow: /';
            $lines[] = 'Disallow: /_studio/';
            $lines[] = '';
        }

        // Reference llms.txt for AI-specific content
        $lines[] = '# AI-readable site summary';
        $llmsUrl = $baseUrl ? "{$baseUrl}/llms.txt" : '/llms.txt';
        $lines[] = "# See {$llmsUrl} for structured site information";
        $lines[] = '';

        // Sitemap (if we know the URL)
        if (!empty($baseUrl)) {
            $lines[] = "Sitemap: {$baseUrl}/sitemap.xml";
        }

        return implode("\n", $lines) . "\n";
    }

    // ═══════════════════════════════════════════
    //  Schema.org JSON-LD Generation
    // ═══════════════════════════════════════════

    /**
     * Generate the _partials/schema.php PHP partial.
     *
     * This generates a PHP file that, when included in <head>,
     * reads assets/data/site.json at runtime and outputs the
     * appropriate Schema.org JSON-LD structured data.
     *
     * Why a PHP file instead of static JSON?
     * - The data changes when the user updates via Studio
     * - A PHP file always reads the latest data
     * - No regeneration needed after data changes
     * - Works identically in preview and production
     */
    public function generateSchemaPartial(): string
    {
        return <<<'SCHEMA_PHP'
<?php
/**
 * Schema.org JSON-LD Structured Data
 *
 * Auto-generated by VoxelSite AEO Engine.
 * Reads from assets/data/site.json and outputs appropriate
 * Schema.org markup for search engines and AI assistants.
 *
 * Include this in _partials/head.php:
 *   <?php if (file_exists(__DIR__ . '/schema.php')) include __DIR__ . '/schema.php'; ?>
 */

$_vxSchemaPath = $_SERVER['DOCUMENT_ROOT'] . '/assets/data/site.json';
if (!file_exists($_vxSchemaPath)) return;

$_vxSite = @json_decode(file_get_contents($_vxSchemaPath), true);
if (!is_array($_vxSite) || empty($_vxSite['name'])) return;

// Map site_type to Schema.org type
$_vxTypeMap = [
    'restaurant'   => 'Restaurant',
    'bakery'       => 'Bakery',
    'cafe'         => 'CafeOrCoffeeShop',
    'bar'          => 'BarOrPub',
    'salon'        => 'BeautySalon',
    'spa'          => 'DaySpa',
    'dentist'      => 'Dentist',
    'doctor'       => 'Physician',
    'clinic'       => 'MedicalClinic',
    'gym'          => 'SportsActivityLocation',
    'fitness'      => 'SportsActivityLocation',
    'hotel'        => 'Hotel',
    'store'        => 'Store',
    'shop'         => 'Store',
    'retail'       => 'Store',
    'agency'       => 'ProfessionalService',
    'consulting'   => 'ProfessionalService',
    'law'          => 'LegalService',
    'legal'        => 'LegalService',
    'accounting'   => 'AccountingService',
    'finance'      => 'FinancialService',
    'education'    => 'EducationalOrganization',
    'school'       => 'School',
    'tutoring'     => 'EducationalOrganization',
    'photography'  => 'ProfessionalService',
    'creative'     => 'ProfessionalService',
    'construction' => 'HomeAndConstructionBusiness',
    'plumbing'     => 'Plumber',
    'electrical'   => 'Electrician',
    'auto'         => 'AutoRepair',
    'mechanic'     => 'AutoRepair',
    'veterinary'   => 'VeterinaryCare',
    'pet'          => 'PetStore',
    'real_estate'  => 'RealEstateAgent',
    'travel'       => 'TravelAgency',
    'tech'         => 'Organization',
    'saas'         => 'Organization',
    'startup'      => 'Organization',
    'nonprofit'    => 'NGO',
    'church'       => 'Church',
    'florist'      => 'Florist',
];

$_vxSchemaType = $_vxTypeMap[$_vxSite['site_type'] ?? ''] ?? 'LocalBusiness';

// Build the schema object
$_vxSchema = [
    '@context' => 'https://schema.org',
    '@type'    => $_vxSchemaType,
    'name'     => $_vxSite['name'],
];

if (!empty($_vxSite['description'])) {
    $_vxSchema['description'] = $_vxSite['description'];
}
if (!empty($_vxSite['url'])) {
    $_vxSchema['url'] = $_vxSite['url'];
}

// Contact info
if (!empty($_vxSite['contact'])) {
    $c = $_vxSite['contact'];

    if (!empty($c['phone'])) {
        $_vxSchema['telephone'] = $c['phone'];
    }
    if (!empty($c['email'])) {
        $_vxSchema['email'] = $c['email'];
    }

    if (!empty($c['address'])) {
        $a = $c['address'];
        $_vxSchema['address'] = [
            '@type'           => 'PostalAddress',
            'streetAddress'   => $a['street'] ?? '',
            'addressLocality' => $a['city'] ?? '',
            'addressRegion'   => $a['region'] ?? '',
            'postalCode'      => $a['postal_code'] ?? '',
            'addressCountry'  => $a['country'] ?? '',
        ];
        // Remove empty address fields
        $_vxSchema['address'] = array_filter($_vxSchema['address'], fn($v) => $v !== '');
        $_vxSchema['address']['@type'] = 'PostalAddress';
    }

    if (!empty($c['coordinates'])) {
        $_vxSchema['geo'] = [
            '@type'     => 'GeoCoordinates',
            'latitude'  => $c['coordinates']['lat'] ?? 0,
            'longitude' => $c['coordinates']['lng'] ?? 0,
        ];
    }
}

// Opening hours
if (!empty($_vxSite['hours']) && is_array($_vxSite['hours'])) {
    $hours = [];
    $dayMap = [
        'Monday' => 'Mo', 'Tuesday' => 'Tu', 'Wednesday' => 'We',
        'Thursday' => 'Th', 'Friday' => 'Fr', 'Saturday' => 'Sa', 'Sunday' => 'Su',
    ];

    foreach ($_vxSite['hours'] as $h) {
        if (!empty($h['closed'])) continue;
        $days = $h['days'] ?? '';
        $open = $h['open'] ?? '09:00';
        $close = $h['close'] ?? '17:00';

        // Convert "Monday-Friday" to "Mo-Fr"
        foreach ($dayMap as $full => $abbr) {
            $days = str_replace($full, $abbr, $days);
        }

        $hours[] = "{$days} {$open}-{$close}";
    }

    if (!empty($hours)) {
        $_vxSchema['openingHours'] = $hours;
    }
}

// Social links (filter out placeholders like '#', 'example.com')
if (!empty($_vxSite['social']) && is_array($_vxSite['social'])) {
    $_vxRealSocial = array_filter($_vxSite['social'], function($u) {
        return is_string($u) && str_starts_with($u, 'http') && $u !== '#' && !str_contains($u, 'example.com');
    });
    if (!empty($_vxRealSocial)) {
        $_vxSchema['sameAs'] = array_values($_vxRealSocial);
    }
}

// Output JSON-LD
echo '<script type="application/ld+json">' . "\n";
echo json_encode($_vxSchema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
echo "\n" . '</script>' . "\n";

// Additional FAQ schema if faq.json exists
$_vxFaqPath = $_SERVER['DOCUMENT_ROOT'] . '/assets/data/faq.json';
if (file_exists($_vxFaqPath)) {
    $_vxFaq = @json_decode(file_get_contents($_vxFaqPath), true);
    $_vxFaqItems = $_vxFaq['questions'] ?? $_vxFaq['faq'] ?? $_vxFaq['items'] ?? $_vxFaq ?? [];

    if (is_array($_vxFaqItems) && !empty($_vxFaqItems)) {
        $faqEntries = [];
        foreach ($_vxFaqItems as $item) {
            if (!is_array($item) || empty($item['question'])) continue;
            $faqEntries[] = [
                '@type'          => 'Question',
                'name'           => $item['question'],
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text'  => $item['answer'] ?? '',
                ],
            ];
        }

        if (!empty($faqEntries)) {
            $faqSchema = [
                '@context'   => 'https://schema.org',
                '@type'      => 'FAQPage',
                'mainEntity' => $faqEntries,
            ];
            echo '<script type="application/ld+json">' . "\n";
            echo json_encode($faqSchema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            echo "\n" . '</script>' . "\n";
        }
    }
}
SCHEMA_PHP;
    }

    // ═══════════════════════════════════════════
    //  MCP Server Generation
    // ═══════════════════════════════════════════

    /**
     * Generate the MCP (Model Context Protocol) server endpoint.
     *
     * Creates a mcp.php file at the document root that implements
     * the MCP Streamable HTTP transport. AI agents can POST JSON-RPC
     * requests to discover and query site data.
     *
     * This is the agentic web piece: AI agents visiting the site
     * can programmatically access structured information instead
     * of scraping HTML.
     *
     * @see https://modelcontextprotocol.io
     */
    public function generateMcpServer(): string
    {
        return <<<'MCP_PHP'
<?php
/**
 * VoxelSite MCP Server — Model Context Protocol Endpoint
 *
 * AI agents can POST JSON-RPC 2.0 requests here to discover
 * and query structured site data. This enables agentic web
 * interactions: an AI assistant can programmatically ask
 * "what's on the menu?" or "what are the business hours?"
 * instead of scraping HTML.
 *
 * Transport: Streamable HTTP (JSON-RPC 2.0 over HTTP POST)
 *
 * Auto-generated by VoxelSite AEO Engine.
 * @see https://modelcontextprotocol.io
 */

// Load shared components (FormValidator for form tools)
require_once $_SERVER['DOCUMENT_ROOT'] . '/vendor/autoload.php';

// Only accept POST with JSON content
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: application/json');
    header('Allow: POST');
    http_response_code(405);
    echo json_encode(['jsonrpc' => '2.0', 'error' => ['code' => -32600, 'message' => 'Method not allowed. Use POST.'], 'id' => null]);
    exit;
}

$input = file_get_contents('php://input');
$request = json_decode($input, true);

if (!is_array($request) || ($request['jsonrpc'] ?? '') !== '2.0') {
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode(['jsonrpc' => '2.0', 'error' => ['code' => -32700, 'message' => 'Parse error'], 'id' => null]);
    exit;
}

$method = $request['method'] ?? '';
$params = $request['params'] ?? [];
$id = $request['id'] ?? null;

header('Content-Type: application/json');

// Load site data
$dataDir = $_SERVER['DOCUMENT_ROOT'] . '/assets/data';
$siteData = null;
$siteJsonPath = $dataDir . '/site.json';
if (file_exists($siteJsonPath)) {
    $siteData = json_decode(file_get_contents($siteJsonPath), true);
}

// MCP Protocol Implementation
switch ($method) {
    case 'initialize':
        echo json_encode([
            'jsonrpc' => '2.0',
            'result' => [
                'protocolVersion' => '2025-03-26',
                'capabilities' => [
                    'resources' => ['listChanged' => false],
                    'tools' => ['listChanged' => false],
                ],
                'serverInfo' => [
                    'name' => ($siteData['name'] ?? 'VoxelSite') . ' MCP Server',
                    'version' => '1.0.0',
                ],
            ],
            'id' => $id,
        ]);
        break;

    case 'resources/list':
        $resources = [];

        // Always expose site info
        if ($siteData) {
            $resources[] = [
                'uri' => 'site://info',
                'name' => 'Business Information',
                'description' => 'Core business identity, contact details, and opening hours',
                'mimeType' => 'application/json',
            ];
        }

        // Dynamic resources from data files
        if (is_dir($dataDir)) {
            // Internal working files — not exposed to external agents
            $internalFiles = ['site.json', 'memory.json', 'design-intelligence.json'];
            $files = scandir($dataDir);
            foreach ($files as $file) {
                if ($file[0] === '.' || in_array($file, $internalFiles, true) || !str_ends_with($file, '.json')) continue;
                $feature = basename($file, '.json');
                $resources[] = [
                    'uri' => "site://{$feature}",
                    'name' => ucfirst(str_replace('_', ' ', $feature)),
                    'description' => ucfirst($feature) . ' data for this business',
                    'mimeType' => 'application/json',
                ];
            }
        }

        echo json_encode([
            'jsonrpc' => '2.0',
            'result' => ['resources' => $resources],
            'id' => $id,
        ]);
        break;

    case 'resources/read':
        $uri = $params['uri'] ?? '';

        if ($uri === 'site://info' && $siteData) {
            echo json_encode([
                'jsonrpc' => '2.0',
                'result' => [
                    'contents' => [[
                        'uri' => $uri,
                        'mimeType' => 'application/json',
                        'text' => json_encode($siteData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
                    ]],
                ],
                'id' => $id,
            ]);
        } elseif (preg_match('/^site:\/\/([a-z][a-z0-9_-]*)$/', $uri, $m)) {
            $feature = $m[1];

            // Block access to internal working files
            $internalResources = ['memory', 'design-intelligence'];
            if (in_array($feature, $internalResources, true)) {
                echo json_encode([
                    'jsonrpc' => '2.0',
                    'error' => ['code' => -32602, 'message' => "Resource not found: {$uri}"],
                    'id' => $id,
                ]);
                break;
            }

            $featurePath = $dataDir . '/' . $feature . '.json';
            if (file_exists($featurePath)) {
                echo json_encode([
                    'jsonrpc' => '2.0',
                    'result' => [
                        'contents' => [[
                            'uri' => $uri,
                            'mimeType' => 'application/json',
                            'text' => file_get_contents($featurePath),
                        ]],
                    ],
                    'id' => $id,
                ]);
            } else {
                echo json_encode([
                    'jsonrpc' => '2.0',
                    'error' => ['code' => -32602, 'message' => "Resource not found: {$uri}"],
                    'id' => $id,
                ]);
            }
        } else {
            echo json_encode([
                'jsonrpc' => '2.0',
                'error' => ['code' => -32602, 'message' => "Invalid resource URI: {$uri}"],
                'id' => $id,
            ]);
        }
        break;

    case 'tools/list':
        $tools = [];

        $tools[] = [
            'name' => 'get_business_info',
            'description' => 'Get business name, description, contact details, and opening hours',
            'inputSchema' => ['type' => 'object', 'properties' => new \stdClass()],
        ];

        if (file_exists($dataDir . '/menu.json')) {
            $tools[] = [
                'name' => 'get_menu',
                'description' => 'Get the restaurant/cafe menu with items, prices, and dietary information',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'category' => ['type' => 'string', 'description' => 'Filter by menu category name'],
                    ],
                ],
            ];
        }

        if (file_exists($dataDir . '/services.json')) {
            $tools[] = [
                'name' => 'get_services',
                'description' => 'Get available services with descriptions and pricing',
                'inputSchema' => ['type' => 'object', 'properties' => new \stdClass()],
            ];
        }

        if (file_exists($dataDir . '/faq.json')) {
            $tools[] = [
                'name' => 'get_faq',
                'description' => 'Get frequently asked questions and answers',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'query' => ['type' => 'string', 'description' => 'Search query to find relevant FAQ entries'],
                    ],
                ],
            ];
        }

        // Form-related tools (from assets/forms/)
        $formsDir = $_SERVER['DOCUMENT_ROOT'] . '/assets/forms';
        $hasForms = false;
        if (is_dir($formsDir)) {
            $formFiles = scandir($formsDir);
            foreach ($formFiles as $ff) {
                if ($ff[0] === '.' || !str_ends_with($ff, '.json')) continue;
                $hasForms = true;
                break;
            }
        }

        if ($hasForms) {
            $tools[] = [
                'name' => 'list_forms',
                'description' => 'List all available forms with names, descriptions, and field summaries',
                'inputSchema' => ['type' => 'object', 'properties' => new \stdClass()],
            ];

            $tools[] = [
                'name' => 'get_form_schema',
                'description' => 'Get the full field definitions for a specific form (so you know what to submit)',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'form_id' => ['type' => 'string', 'description' => 'The form identifier (e.g., "contact", "reservation")'],
                    ],
                    'required' => ['form_id'],
                ],
            ];

            $tools[] = [
                'name' => 'submit_form',
                'description' => 'Submit data to a form. Validates against the form schema before storing.',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'form_id' => ['type' => 'string', 'description' => 'The form identifier'],
                        'data' => ['type' => 'object', 'description' => 'Key-value pairs of form field values'],
                    ],
                    'required' => ['form_id', 'data'],
                ],
            ];
        }

        echo json_encode([
            'jsonrpc' => '2.0',
            'result' => ['tools' => $tools],
            'id' => $id,
        ]);
        break;

    case 'tools/call':
        $toolName = $params['name'] ?? '';
        $args = $params['arguments'] ?? [];

        switch ($toolName) {
            case 'get_business_info':
                if ($siteData) {
                    echo json_encode([
                        'jsonrpc' => '2.0',
                        'result' => [
                            'content' => [[
                                'type' => 'text',
                                'text' => json_encode($siteData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
                            ]],
                        ],
                        'id' => $id,
                    ]);
                } else {
                    echo json_encode([
                        'jsonrpc' => '2.0',
                        'result' => ['content' => [['type' => 'text', 'text' => 'No business information available.']]],
                        'id' => $id,
                    ]);
                }
                break;

            case 'get_menu':
                $menuPath = $dataDir . '/menu.json';
                if (file_exists($menuPath)) {
                    $menuData = json_decode(file_get_contents($menuPath), true);
                    $category = $args['category'] ?? null;

                    if ($category && isset($menuData['categories'])) {
                        $filtered = array_filter($menuData['categories'], fn($c) =>
                            stripos($c['name'] ?? '', $category) !== false
                        );
                        $menuData['categories'] = array_values($filtered);
                    }

                    echo json_encode([
                        'jsonrpc' => '2.0',
                        'result' => ['content' => [['type' => 'text', 'text' => json_encode($menuData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)]]],
                        'id' => $id,
                    ]);
                } else {
                    echo json_encode([
                        'jsonrpc' => '2.0',
                        'result' => ['content' => [['type' => 'text', 'text' => 'No menu data available.']]],
                        'id' => $id,
                    ]);
                }
                break;

            case 'get_services':
                $servicesPath = $dataDir . '/services.json';
                if (file_exists($servicesPath)) {
                    echo json_encode([
                        'jsonrpc' => '2.0',
                        'result' => ['content' => [['type' => 'text', 'text' => file_get_contents($servicesPath)]]],
                        'id' => $id,
                    ]);
                } else {
                    echo json_encode([
                        'jsonrpc' => '2.0',
                        'result' => ['content' => [['type' => 'text', 'text' => 'No services data available.']]],
                        'id' => $id,
                    ]);
                }
                break;

            case 'get_faq':
                $faqPath = $dataDir . '/faq.json';
                if (file_exists($faqPath)) {
                    $faqData = json_decode(file_get_contents($faqPath), true);
                    $query = $args['query'] ?? null;

                    if ($query) {
                        $items = $faqData['questions'] ?? $faqData['faq'] ?? $faqData['items'] ?? [];
                        $filtered = array_filter($items, fn($item) =>
                            stripos($item['question'] ?? '', $query) !== false ||
                            stripos($item['answer'] ?? '', $query) !== false
                        );
                        $faqData = array_values($filtered);
                    }

                    echo json_encode([
                        'jsonrpc' => '2.0',
                        'result' => ['content' => [['type' => 'text', 'text' => json_encode($faqData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)]]],
                        'id' => $id,
                    ]);
                } else {
                    echo json_encode([
                        'jsonrpc' => '2.0',
                        'result' => ['content' => [['type' => 'text', 'text' => 'No FAQ data available.']]],
                        'id' => $id,
                    ]);
                }
                break;

            case 'list_forms':
                $validator = new \VoxelSite\FormValidator();
                $forms = $validator->listForms();
                echo json_encode([
                    'jsonrpc' => '2.0',
                    'result' => ['content' => [['type' => 'text', 'text' => json_encode(['forms' => $forms], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)]]],
                    'id' => $id,
                ]);
                break;

            case 'get_form_schema':
                $fid = $args['form_id'] ?? '';
                $fid = preg_replace('/[^a-z0-9_-]/', '', $fid);
                $fPath = $_SERVER['DOCUMENT_ROOT'] . '/assets/forms/' . $fid . '.json';
                if (file_exists($fPath)) {
                    echo json_encode([
                        'jsonrpc' => '2.0',
                        'result' => ['content' => [['type' => 'text', 'text' => file_get_contents($fPath)]]],
                        'id' => $id,
                    ]);
                } else {
                    echo json_encode([
                        'jsonrpc' => '2.0',
                        'error' => ['code' => -32602, 'message' => "Form not found: {$fid}"],
                        'id' => $id,
                    ]);
                }
                break;

            case 'submit_form':
                $validator = new \VoxelSite\FormValidator();
                $fid = $args['form_id'] ?? '';
                $fSchema = $validator->loadSchema($fid);
                if (!$fSchema) {
                    echo json_encode([
                        'jsonrpc' => '2.0',
                        'error' => ['code' => -32602, 'message' => "Form not found: {$fid}"],
                        'id' => $id,
                    ]);
                    break;
                }

                $fData = $args['data'] ?? [];
                if (!is_array($fData)) {
                    echo json_encode([
                        'jsonrpc' => '2.0',
                        'error' => ['code' => -32602, 'message' => 'Invalid submission data'],
                        'id' => $id,
                    ]);
                    break;
                }

                // Prepare submissions DB (shared with web submissions)
                $dDir = $_SERVER['DOCUMENT_ROOT'] . '/_data';
                if (!is_dir($dDir)) mkdir($dDir, 0755, true);
                $htacc = $dDir . '/.htaccess';
                if (!file_exists($htacc)) file_put_contents($htacc, "Order deny,allow\nDeny from all\n");

                $sDb = new \PDO('sqlite:' . $dDir . '/submissions.db');
                $sDb->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
                $sDb->exec('PRAGMA journal_mode=WAL');
                $sDb->exec('CREATE TABLE IF NOT EXISTS submissions (id INTEGER PRIMARY KEY AUTOINCREMENT, form_id TEXT NOT NULL, data TEXT NOT NULL, status TEXT NOT NULL DEFAULT \'new\', ip_address TEXT, user_agent TEXT, referrer TEXT, source TEXT DEFAULT \'web\', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, read_at TEXT, notes TEXT)');
                $sDb->exec('CREATE INDEX IF NOT EXISTS idx_submissions_form ON submissions(form_id)');
                $sDb->exec('CREATE INDEX IF NOT EXISTS idx_submissions_source ON submissions(source)');
                $sDb->exec('CREATE TABLE IF NOT EXISTS rate_limits (ip_address TEXT NOT NULL, form_id TEXT NOT NULL, window_start TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 1, PRIMARY KEY (ip_address, form_id, window_start))');

                // MCP rate limit: per-IP, per-form, hourly (same contract as submit.php)
                $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
                $windowStart = date('Y-m-d\TH:00:00');
                $maxPerHour = max(1, (int) ($fSchema['spam_protection']['max_per_ip_per_hour'] ?? 10));

                $rlRead = $sDb->prepare('SELECT count FROM rate_limits WHERE ip_address = ? AND form_id = ? AND window_start = ?');
                $rlRead->execute([$ipAddress, $fid, $windowStart]);
                $rlRow = $rlRead->fetch(\PDO::FETCH_ASSOC);
                if ($rlRow && (int) $rlRow['count'] >= $maxPerHour) {
                    $retryAfter = max(1, 3600 - ((int) date('i') * 60 + (int) date('s')));
                    echo json_encode([
                        'jsonrpc' => '2.0',
                        'result' => ['content' => [[
                            'type' => 'text',
                            'text' => json_encode([
                                'success' => false,
                                'code' => 'rate_limited',
                                'message' => 'Too many submissions. Please try again later.',
                                'retry_after' => $retryAfter,
                            ], JSON_UNESCAPED_UNICODE),
                        ]]],
                        'id' => $id,
                    ]);
                    break;
                }

                $rlWrite = $sDb->prepare(
                    'INSERT INTO rate_limits (ip_address, form_id, window_start, count)
                     VALUES (?, ?, ?, 1)
                     ON CONFLICT(ip_address, form_id, window_start)
                     DO UPDATE SET count = count + 1'
                );
                $rlWrite->execute([$ipAddress, $fid, $windowStart]);

                if (random_int(1, 100) === 1) {
                    $sDb->exec("DELETE FROM rate_limits WHERE window_start < datetime('now', '-24 hours')");
                }

                // Validate using shared FormValidator
                $fResult = $validator->validate($fSchema, $fData);
                if (!$fResult['valid']) {
                    echo json_encode([
                        'jsonrpc' => '2.0',
                        'result' => ['content' => [['type' => 'text', 'text' => json_encode(['success' => false, 'errors' => $fResult['errors']], JSON_UNESCAPED_UNICODE)]]],
                        'id' => $id,
                    ]);
                    break;
                }

                // Store submission

                $sNow = date('c');
                $sStmt = $sDb->prepare('INSERT INTO submissions (form_id, data, status, ip_address, user_agent, referrer, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
                $sStmt->execute([
                    $fid,
                    json_encode($fResult['data'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    $fSchema['default_status'] ?? 'new',
                    $ipAddress,
                    $_SERVER['HTTP_USER_AGENT'] ?? '',
                    '',
                    'mcp',
                    $sNow,
                    $sNow,
                ]);
                $sId = $sDb->lastInsertId();

                echo json_encode([
                    'jsonrpc' => '2.0',
                    'result' => ['content' => [['type' => 'text', 'text' => json_encode(['success' => true, 'submission_id' => (int)$sId, 'message' => $fSchema['submission']['success_message'] ?? 'Submission received.'], JSON_UNESCAPED_UNICODE)]]],
                    'id' => $id,
                ]);
                break;

            default:
                echo json_encode([
                    'jsonrpc' => '2.0',
                    'error' => ['code' => -32601, 'message' => "Unknown tool: {$toolName}"],
                    'id' => $id,
                ]);
        }
        break;

    case 'notifications/initialized':
        // Acknowledge initialization notification (no response needed for notifications)
        // But since we're using HTTP, send an empty success
        http_response_code(204);
        break;

    default:
        echo json_encode([
            'jsonrpc' => '2.0',
            'error' => ['code' => -32601, 'message' => "Method not found: {$method}"],
            'id' => $id,
        ]);
}
MCP_PHP;
    }

    // ═══════════════════════════════════════════
    //  Schema Include Injection
    // ═══════════════════════════════════════════

    /**
     * Ensure the schema.php include exists in head.php.
     *
     * Checks both preview and production head.php (or header.php)
     * and injects the schema include before </head> if not already present.
     *
     * This is the safety net: even if the AI doesn't add the include,
     * publish will inject it automatically. The invisible moat.
     */
    public function ensureSchemaInclude(): void
    {
        $targets = [
            $this->previewPath . '/_partials/head.php',
            $this->docRoot . '/_partials/head.php',
            $this->previewPath . '/_partials/header.php',
            $this->docRoot . '/_partials/header.php',
        ];

        $includeSnippet = '<?php if (file_exists(__DIR__ . \'/schema.php\')) include __DIR__ . \'/schema.php\'; ?>';

        foreach ($targets as $target) {
            if (!file_exists($target)) {
                continue;
            }

            $content = file_get_contents($target);
            if ($content === false) {
                continue;
            }

            // Already has schema include? Skip.
            if (str_contains($content, 'schema.php')) {
                continue;
            }

            // Inject before </head> if present
            if (stripos($content, '</head>') !== false) {
                $content = str_ireplace(
                    '</head>',
                    "  {$includeSnippet}\n</head>",
                    $content
                );
                file_put_contents($target, $content);
            }
        }
    }

    // ═══════════════════════════════════════════
    //  Data Layer Access
    // ═══════════════════════════════════════════

    /**
     * Load the site data from assets/data/site.json.
     */
    private function loadSiteData(): ?array
    {
        $path = $this->assetsPath . '/data/site.json';
        if (!file_exists($path)) {
            return null;
        }

        $content = file_get_contents($path);
        if ($content === false) {
            return null;
        }

        $data = json_decode($content, true);
        return is_array($data) ? $data : null;
    }

    /**
     * Load a feature data file.
     */
    private function loadFeatureData(string $feature): ?array
    {
        // Sanitize feature name
        $feature = preg_replace('/[^a-z0-9_]/', '', $feature);
        $path = $this->assetsPath . '/data/' . $feature . '.json';
        if (!file_exists($path)) {
            return null;
        }

        $content = file_get_contents($path);
        if ($content === false) {
            return null;
        }

        $data = json_decode($content, true);
        return is_array($data) ? $data : null;
    }

    /**
     * Sanitize contact data — strip placeholder/fabricated values.
     *
     * AI models frequently generate fake contact info that looks real.
     * This filter catches common placeholder patterns and removes them
     * so they don't propagate to llms.txt, Schema.org, or MCP.
     */
    private function sanitizeContactData(array $contact): array
    {
        // Remove placeholder emails
        if (!empty($contact['email'])) {
            $email = strtolower($contact['email']);
            if (
                str_contains($email, 'example.com') ||
                str_contains($email, 'placeholder') ||
                str_contains($email, 'test@') ||
                str_contains($email, 'info@your') ||
                str_contains($email, 'contact@your') ||
                preg_match('/^(info|hello|contact)@[a-z]+\.(com|net|org)$/', $email)
            ) {
                unset($contact['email']);
            }
        }

        // Remove placeholder phone numbers
        if (!empty($contact['phone'])) {
            $phone = preg_replace('/[\s\-\(\)]/', '', $contact['phone']);
            if (
                str_contains($phone, '555') ||
                str_contains($phone, '1234567') ||
                str_contains($phone, '0000000') ||
                preg_match('/(\d)\1{6,}/', $phone) // 7+ repeated digits
            ) {
                unset($contact['phone']);
            }
        }

        // Remove placeholder addresses
        if (!empty($contact['address'])) {
            $addr = $contact['address'];
            $street = strtolower($addr['street'] ?? '');
            if (
                str_contains($street, 'main st') ||
                str_contains($street, 'example') ||
                str_contains($street, '123 ') ||
                empty(trim($street))
            ) {
                unset($contact['address']);
            }
        }

        return $contact;
    }

    /**
     * Sanitize social links — remove placeholders.
     *
     * AI models frequently generate social links as '#' or with
     * example.com URLs. These are not real links and must not
     * appear in llms.txt or Schema.org sameAs.
     */
    private function sanitizeSocialLinks(array $social): array
    {
        return array_filter($social, function ($url) {
            if (!is_string($url)) return false;
            $url = trim($url);
            if (empty($url) || $url === '#' || $url === '/') return false;
            if (str_contains($url, 'example.com')) return false;
            if (str_contains($url, 'your-')) return false;
            if (str_contains($url, 'placeholder')) return false;
            // Must start with http(s) to be a real social URL
            if (!str_starts_with($url, 'http://') && !str_starts_with($url, 'https://')) return false;
            return true;
        });
    }

    /**
     * Load the pages list and verify each page exists on disk.
     *
     * Pages may have been deleted but still exist in the database.
     * This method cross-references to ensure llms.txt only lists
     * pages that actually exist.
     *
     * @return array<int, array{slug: string, title: string}>
     */
    private function loadVerifiedPagesList(): array
    {
        $pages = $this->loadPagesList();

        return array_values(array_filter($pages, function ($page) {
            $slug = $page['slug'];
            // Check both preview and production paths
            $previewPath = $this->previewPath . '/' . $slug . '.php';
            $prodPath = $this->docRoot . '/' . $slug . '.php';
            return file_exists($previewPath) || file_exists($prodPath);
        }));
    }

    /**
     * Load the pages list from the database or preview directory.
     *
     * @return array<int, array{slug: string, title: string}>
     */
    private function loadPagesList(): array
    {
        try {
            $db = Database::getInstance();
            return $db->query(
                "SELECT slug, title FROM pages
                 ORDER BY nav_order IS NULL, nav_order ASC, title ASC"
            );
        } catch (\Throwable $e) {
            // Fall back to scanning preview directory
            $pages = [];
            $pattern = $this->previewPath . '/*.php';
            foreach (glob($pattern) ?: [] as $file) {
                $basename = basename($file, '.php');
                $pages[] = [
                    'slug' => $basename,
                    'title' => ucfirst(str_replace('-', ' ', $basename)),
                ];
            }
            return $pages;
        }
    }

    // ═══════════════════════════════════════════
    //  File Helpers
    // ═══════════════════════════════════════════

    /**
     * Write a file atomically.
     */
    private function writeFileAtomic(string $path, string $content): void
    {
        $dir = dirname($path);
        $this->ensureDirectory($dir);

        $tmpPath = $path . '.tmp.' . getmypid();
        file_put_contents($tmpPath, $content);
        rename($tmpPath, $path);
    }

    /**
     * Create directory if it doesn't exist.
     */
    private function ensureDirectory(string $dir): void
    {
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }
}
