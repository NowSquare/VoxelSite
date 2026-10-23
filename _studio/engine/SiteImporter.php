<?php

declare(strict_types=1);

namespace VoxelSite;

use RuntimeException;

require_once __DIR__ . '/PublicReferenceFetcher.php';

/**
 * Web-to-Design Import — URL Fetcher + HTML Cleaner
 *
 * Fetches a public URL's HTML, validates it, checks robots.txt,
 * cleans the HTML for AI consumption, and returns a structured result.
 *
 * This class is the *only* PHP code that touches the source website.
 * All design extraction and conversion is done by the AI using the
 * import_site.md prompt template.
 *
 * Architecture:
 *   - PHP fetches HTML. That's it.
 *   - AI converts HTML → VoxelSite files.
 *   - No DOM parser, no CSS extraction, no headless browser.
 *
 * Usage:
 *   $importer = new SiteImporter();
 *   $result = $importer->fetch('https://example.com');
 *   // $result = ['url' => ..., 'html' => ..., 'title' => ..., 'internal_links' => [...]]
 */
class SiteImporter
{
    public function __construct(private PublicReferenceFetcher $fetcher = new PublicReferenceFetcher()) {}

    /**
     * Maximum HTML size after cleaning, in characters.
     * ~30K tokens × 4 chars/token = 120K chars.
     */
    private const MAX_CLEAN_HTML_CHARS = 120000;

    /**
     * Fetch timeout in seconds.
     */
    private const FETCH_TIMEOUT = 15;

    /**
     * Minimum HTML length to consider valid (characters).
     * Pages shorter than this likely require JavaScript to render.
     */
    private const MIN_HTML_LENGTH = 500;

    /**
     * Real browser User-Agent. Many sites serve different content
     * or block requests that don't look like a real browser.
     */
    private const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

    /**
     * Fetch and clean HTML from a public URL.
     *
     * @param string $url The URL to fetch
     * @return array{url: string, html: string, title: string, internal_links: string[]}
     * @throws RuntimeException On validation errors, fetch failures, or robots.txt blocks
     */
    public function fetch(string $url): array
    {
        // ── Step 1: Validate URL ──
        $url = $this->validateUrl($url);

        // ── Step 2: Check robots.txt ──
        if (!$this->checkRobotsTxt($url)) {
            throw new RuntimeException(
                "This page is restricted by the site's robots.txt. Choose a different URL."
            );
        }

        // ── Step 3: Fetch raw HTML ──
        $rawHtml = $this->fetchHtml($url);

        // ── Step 4: Validate HTML quality ──
        if (strlen($rawHtml) < self::MIN_HTML_LENGTH) {
            throw new RuntimeException(
                'The page returned insufficient HTML. It may require JavaScript to render.'
            );
        }

        // ── Step 5: Extract metadata before cleaning ──
        $title = $this->extractTitle($rawHtml);

        // Detect blocked / CAPTCHA / anti-bot pages that returned HTTP 200
        // but contain no useful design content. Without this, the AI wastes
        // a full generation cycle on an empty reference.
        $this->detectBlockedPage($title, $rawHtml);

        $internalLinks = $this->extractInternalLinks($rawHtml, $url);

        // ── Step 6: Clean HTML for AI consumption ──
        $cleanedHtml = $this->cleanHtml($rawHtml);

        Logger::info('ai', 'SiteImporter: fetch complete', [
            'url_host'         => parse_url($url, PHP_URL_HOST),
            'title'            => $title,
            'raw_length'       => strlen($rawHtml),
            'cleaned_length'   => strlen($cleanedHtml),
            'internal_links'   => count($internalLinks),
        ]);

        return [
            'url'            => $url,
            'html'           => $cleanedHtml,
            'title'          => $title,
            'internal_links' => $internalLinks,
        ];
    }

    /**
     * Lightweight URL check for the "Add" button.
     *
     * Runs validation + robots.txt + quick fetch + blocked page detection
     * without the heavy cleaning/extraction pipeline. Designed to return
     * in ~2-3 seconds so the user gets instant feedback.
     *
     * @param string $url The URL to check
     * @return array{ok: bool, url: string, title: string, error: string|null}
     */
    public function checkUrl(string $url): array
    {
        try {
            $url = $this->validateUrl($url);

            if (!$this->checkRobotsTxt($url)) {
                return [
                    'ok'    => false,
                    'url'   => $url,
                    'title' => '',
                    'error' => "This page is restricted by the site's robots.txt. Choose a different URL.",
                ];
            }

            $rawHtml = $this->fetchHtml($url);

            if (strlen($rawHtml) < self::MIN_HTML_LENGTH) {
                return [
                    'ok'    => false,
                    'url'   => $url,
                    'title' => '',
                    'error' => 'The page returned insufficient HTML. It may require JavaScript to render.',
                ];
            }

            $title = $this->extractTitle($rawHtml);
            $this->detectBlockedPage($title, $rawHtml);

            // Check for JS-rendered shell pages (React/Vue/Angular SPAs).
            // These return valid HTML that passes length checks but contain
            // no real design content — just a <div id="root"> or similar.
            // Count structural HTML elements the AI needs for design extraction.
            $structuralCount = 0;
            $structuralTags = ['<section', '<article', '<main', '<header', '<footer', '<nav', '<h1', '<h2', '<h3'];
            foreach ($structuralTags as $tag) {
                $structuralCount += substr_count(strtolower($rawHtml), $tag);
            }
            if ($structuralCount < 3) {
                return [
                    'ok'    => false,
                    'url'   => $url,
                    'title' => $title,
                    'error' => 'This page appears to be a JavaScript app that requires a browser to render. Choose a more traditional website as reference.',
                ];
            }

            return [
                'ok'    => true,
                'url'   => $url,
                'title' => $title,
                'error' => null,
            ];
        } catch (RuntimeException $e) {
            return [
                'ok'    => false,
                'url'   => $url,
                'title' => '',
                'error' => $e->getMessage(),
            ];
        }
    }

    // ═══════════════════════════════════════════
    //  URL Validation
    // ═══════════════════════════════════════════

    /**
     * Validate and normalize a URL.
     *
     * @throws RuntimeException If the URL is invalid
     */
    private function validateUrl(string $url): string
    {
        return $this->fetcher->validateUrl(trim($url));
    }

    // ═══════════════════════════════════════════
    //  DNS Resolution
    // ═══════════════════════════════════════════

    /**
     * Resolve a hostname to all its IP addresses (A + AAAA records).
     *
     * Uses dns_get_record() for both IPv4 and IPv6 resolution.
     * Falls back to gethostbyname() if dns_get_record() is unavailable
     * or fails (some shared hosts disable it).
     *
     * @param string $host Hostname to resolve
     * @return string[] Array of IP addresses (may be empty)
     */
    private function resolveAllIps(string $host): array
    {
        $ips = [];

        // If the host is already a literal IP, no resolution needed
        // (Phase 1 already checked it against isPrivateOrReservedIp)
        if (filter_var($host, FILTER_VALIDATE_IP) !== false) {
            return [];
        }

        // Try dns_get_record for A + AAAA records
        if (function_exists('dns_get_record')) {
            // A records (IPv4)
            $aRecords = @dns_get_record($host, DNS_A);
            if (is_array($aRecords)) {
                foreach ($aRecords as $rec) {
                    if (!empty($rec['ip'])) {
                        $ips[] = $rec['ip'];
                    }
                }
            }

            // AAAA records (IPv6)
            $aaaaRecords = @dns_get_record($host, DNS_AAAA);
            if (is_array($aaaaRecords)) {
                foreach ($aaaaRecords as $rec) {
                    if (!empty($rec['ipv6'])) {
                        $ips[] = $rec['ipv6'];
                    }
                }
            }
        }

        // Fallback: gethostbyname (A records only)
        if (empty($ips)) {
            $resolved = @gethostbyname($host);
            if ($resolved !== $host) {
                $ips[] = $resolved;
            }
        }

        return $ips;
    }

    // ═══════════════════════════════════════════
    //  Private/Reserved IP Detection
    // ═══════════════════════════════════════════

    /**
     * Check if an IP address string falls within private or reserved ranges.
     *
     * Covers:
     *   IPv4: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8,
     *         169.254.0.0/16, 0.0.0.0/8
     *   IPv6: ::1, fe80::/10, fc00::/7
     *
     * @param string $ip IP address or hostname to test
     * @return bool True if the address is private/reserved
     */
    private function isPrivateOrReservedIp(string $ip): bool
    {
        $ip = trim($ip, '[]');
        return filter_var($ip, FILTER_VALIDATE_IP) !== false && !PublicReferenceFetcher::isPublicIp($ip);
    }

    // ═══════════════════════════════════════════
    //  robots.txt Check
    // ═══════════════════════════════════════════

    /**
     * Check if the target path is allowed by the site's robots.txt.
     *
     * Missing robots.txt is allowed. Other HTTP or transport failures stop
     * the import so a failed policy read cannot silently authorize fetching.
     *
     * @return bool True if allowed, false if disallowed
     */
    private function checkRobotsTxt(string $url): bool
    {
        $parsed = parse_url($url);
        $robotsUrl = $parsed['scheme'] . '://' . $parsed['host'] . (isset($parsed['port']) ? ':' . $parsed['port'] : '') . '/robots.txt';
        $response = $this->fetcher->fetch($robotsUrl, ['text/plain'], 65536);
        if ($response['status'] === 404 || $response['status'] === 410) return true;
        if ($response['status'] < 200 || $response['status'] >= 300) throw new RuntimeException('Cannot check this public reference’s robots.txt.');
        return $this->isPathAllowed($response['body'], $parsed['path'] ?? '/');
    }

    /**
     * Parse robots.txt and check if a path is allowed.
     *
     * Only checks rules under User-agent: * (the wildcard).
     * Returns true if no matching Disallow rule is found.
     */
    private function isPathAllowed(string $robotsTxt, string $path): bool
    {
        $lines = preg_split('/\r?\n/', $robotsTxt);
        $inWildcard = false;
        $disallows = [];

        foreach ($lines as $line) {
            $line = trim($line);

            // Skip comments and empty lines
            if ($line === '' || $line[0] === '#') {
                continue;
            }

            // Detect User-agent blocks
            if (preg_match('/^User-agent:\s*(.+)/i', $line, $m)) {
                $agent = trim($m[1]);
                $inWildcard = ($agent === '*');
                continue;
            }

            // Collect Disallow rules under User-agent: *
            if ($inWildcard && preg_match('/^Disallow:\s*(.*)/i', $line, $m)) {
                $rule = trim($m[1]);
                if ($rule !== '') {
                    $disallows[] = $rule;
                }
            }
        }

        // Check if any Disallow rule matches the path
        foreach ($disallows as $rule) {
            // robots.txt Disallow is a prefix match
            if (str_starts_with($path, $rule)) {
                return false;
            }
        }

        return true;
    }

    // ═══════════════════════════════════════════
    //  HTML Fetching
    // ═══════════════════════════════════════════

    /**
     * Fetch bounded HTML through the same pinned public-reference transport as MCP.
     *
     * @throws RuntimeException On network failure, auth errors, or timeout
     */
    private function fetchHtml(string $url): string
    {
        $response = $this->fetcher->fetch($url, ['text/html', 'application/xhtml+xml']);
        if ($response['status'] === 401 || $response['status'] === 403) throw new RuntimeException('This page requires authentication. Import only works with public pages.');
        if ($response['status'] < 200 || $response['status'] >= 300 || $response['body'] === '') throw new RuntimeException('The public reference did not return a successful HTML response.');
        return $response['body'];
    }

    /**
     * Clean HTML for AI consumption.
     *
     * Removes non-visual payload that burns tokens without helping
     * design extraction. Preserves <style> blocks — they contain
     * the typography and color signals the AI needs.
     *
     * Strips: <script>, <noscript>, <svg>, data: URIs, HTML comments,
     *         srcset attributes, excessively long inline styles (>200 chars).
     * Keeps:  <style> blocks (design signals), structural HTML, class attributes.
     */
    private function cleanHtml(string $html): string
    {
        // Strip <script> blocks (including inline JS)
        $html = preg_replace('#<script\b[^>]*>.*?</script>#si', '', $html);

        // Strip <noscript> blocks
        $html = preg_replace('#<noscript\b[^>]*>.*?</noscript>#si', '', $html);

        // Strip <svg> elements (large vector data, not useful for design extraction)
        $html = preg_replace('#<svg\b[^>]*>.*?</svg>#si', '', $html);

        // Strip HTML comments
        $html = preg_replace('/<!--.*?-->/s', '', $html);

        // Strip data: URIs (base64 images/fonts burn enormous tokens)
        $html = preg_replace('/(?:src|href)=["\']data:[^"\']*["\']/i', '', $html);

        // Strip srcset attributes (responsive image sets, token-heavy)
        $html = preg_replace('/\s+srcset=["\'][^"\']*["\']/i', '', $html);

        // Strip excessively long inline style attributes (>200 chars)
        // Keep short inline styles — they may contain meaningful design hints.
        $html = preg_replace_callback(
            '/\s+style=["\']([^"\']*?)["\']/i',
            function ($match) {
                return strlen($match[1]) > 200 ? '' : $match[0];
            },
            $html
        );

        // Collapse whitespace sequences
        $html = preg_replace('/\s+/', ' ', $html);

        // Trim leading/trailing whitespace
        $html = trim($html);

        // Truncate to token budget if still too large
        if (strlen($html) > self::MAX_CLEAN_HTML_CHARS) {
            $html = substr($html, 0, self::MAX_CLEAN_HTML_CHARS);
            $html .= "\n<!-- HTML truncated at token limit -->";
        }

        return $html;
    }

    // ═══════════════════════════════════════════
    //  Metadata Extraction
    // ═══════════════════════════════════════════

    /**
     * Extract the <title> from HTML.
     */
    private function extractTitle(string $html): string
    {
        if (preg_match('#<title\b[^>]*>(.*?)</title>#si', $html, $m)) {
            return trim(html_entity_decode($m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        }
        return '';
    }

    /**
     * Extract internal links from HTML for multi-page follow-up.
     *
     * Finds href values that point to pages on the same domain.
     * Deduplicates and caps at 20 links.
     *
     * @return string[] Array of absolute URLs
     */
    private function extractInternalLinks(string $html, string $baseUrl): array
    {
        $parsed = parse_url($baseUrl);
        $scheme = $parsed['scheme'] ?? 'https';
        $host = $parsed['host'] ?? '';
        $baseOrigin = $scheme . '://' . $host;
        if (!empty($parsed['port'])) {
            $baseOrigin .= ':' . $parsed['port'];
        }

        $links = [];

        // Match href attributes
        if (!preg_match_all('/href=["\']([^"\'#]+)["\']/i', $html, $matches)) {
            return [];
        }

        foreach ($matches[1] as $href) {
            $href = trim($href);

            // Skip non-page links
            if (str_starts_with($href, 'mailto:') ||
                str_starts_with($href, 'tel:') ||
                str_starts_with($href, 'javascript:') ||
                str_starts_with($href, 'data:') ||
                str_starts_with($href, '#')) {
                continue;
            }

            // Convert relative URLs to absolute
            if (str_starts_with($href, '/')) {
                $href = $baseOrigin . $href;
            } elseif (!preg_match('#^https?://#i', $href)) {
                // Relative path without leading /
                $basePath = rtrim(dirname($parsed['path'] ?? '/'), '/');
                $href = $baseOrigin . $basePath . '/' . $href;
            }

            // Only keep links to the same domain
            $linkHost = parse_url($href, PHP_URL_HOST);
            if ($linkHost !== $host) {
                continue;
            }

            // Skip asset URLs
            $linkPath = parse_url($href, PHP_URL_PATH) ?? '/';
            if (preg_match('/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|pdf|zip)$/i', $linkPath)) {
                continue;
            }

            // Normalize: remove trailing slash, query string, fragment
            $href = strtok($href, '?');
            $href = strtok($href, '#');
            $href = rtrim($href, '/');

            if (!empty($href) && $href !== rtrim($baseUrl, '/')) {
                $links[$href] = true;
            }
        }

        // Deduplicate and cap
        return array_slice(array_keys($links), 0, 20);
    }

    // ═══════════════════════════════════════════
    //  Blocked Page Detection
    // ═══════════════════════════════════════════

    /**
     * Detect if the fetched HTML is a blocked/CAPTCHA/anti-bot page.
     *
     * Many sites return HTTP 200 with a block page instead of a 403.
     * This wastes a full AI generation cycle on useless reference HTML.
     * Detect common patterns and fail fast with a clear user message.
     *
     * @throws RuntimeException If the page appears to be a block/CAPTCHA page
     */
    private function detectBlockedPage(string $title, string $html): void
    {
        $titleLower = strtolower($title);
        $htmlLower = strtolower($html);

        // Common block page title patterns
        $blockedTitlePatterns = [
            'request has been blocked',
            'access denied',
            'attention required',    // Cloudflare
            'just a moment',         // Cloudflare challenge
            'please verify',
            'are you a robot',
            'captcha',
            'bot detection',
            'security check',
            'pardon our interruption', // Imperva/Incapsula
            'please wait while we verify', // PerimeterX
        ];

        foreach ($blockedTitlePatterns as $pattern) {
            if (str_contains($titleLower, $pattern)) {
                throw new RuntimeException(
                    'This website blocked our request (anti-bot protection). Try a different URL — some sites block automated access.'
                );
            }
        }

        // Common block page body patterns (only check first 5KB to stay fast)
        $bodySnippet = substr($htmlLower, 0, 5000);
        $blockedBodyPatterns = [
            'cf-browser-verification',   // Cloudflare
            'cf_chl_opt',                // Cloudflare challenge
            'akamai-ghost',              // Akamai
            '_im_cplp',                  // Imperva
            'px-captcha',                // PerimeterX
            'g-recaptcha',               // reCAPTCHA on block page
            'hcaptcha',                  // hCaptcha on block page
        ];

        // Only flag body patterns if the page also has very few content elements
        // (real sites with CAPTCHAs on forms shouldn't be blocked)
        $hasMinimalContent = substr_count($htmlLower, '<section') < 2
            && substr_count($htmlLower, '<article') < 1
            && substr_count($htmlLower, '<main') < 1;

        if ($hasMinimalContent) {
            foreach ($blockedBodyPatterns as $pattern) {
                if (str_contains($bodySnippet, $pattern)) {
                    throw new RuntimeException(
                        'This website blocked our request (anti-bot protection). Try a different URL — some sites block automated access.'
                    );
                }
            }
        }
    }
}
