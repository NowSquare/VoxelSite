<?php

declare(strict_types=1);

/**
 * SiteImporter test suite.
 *
 * Run: php _studio/tests/SiteImporterTest.php
 *
 * Tests URL validation, robots.txt parsing, HTML cleaning,
 * truncation, and link extraction. Uses fixtures, no network calls.
 */

require_once dirname(__DIR__) . '/engine/SiteImporter.php';

if (!class_exists('VoxelSite\Logger')) {
    $loggerPath = dirname(__DIR__) . '/engine/Logger.php';
    if (file_exists($loggerPath)) {
        require_once $loggerPath;
    } else {
        eval('namespace VoxelSite; class Logger { public static function __callStatic($m, $a) {} }');
    }
}

$passed = 0;
$failed = 0;
$errors = [];

function record(bool $condition, string $message, array &$errors, int &$passed, int &$failed): void
{
    if ($condition) {
        $passed++;
        return;
    }
    $failed++;
    $errors[] = $message;
}

echo "=== SiteImporter Test Suite ===\n\n";

// ─────────────────────────────────────────
//  URL Validation (via reflection)
// ─────────────────────────────────────────

echo "--- URL Validation ---\n";

$importer = new \VoxelSite\SiteImporter();
$validateUrl = new ReflectionMethod($importer, 'validateUrl');
$validateUrl->setAccessible(true);

// Valid URLs
foreach ([
    'https://example.com',
    'https://www.apple.com/iphone/',
    'http://example.org/page?q=1',
    'https://sub.domain.co.uk/path',
] as $url) {
    try {
        $result = $validateUrl->invoke($importer, $url);
        record(
            !empty($result),
            "FAIL valid URL '{$url}': expected success but got empty",
            $errors, $passed, $failed
        );
    } catch (\Exception $e) {
        record(false, "FAIL valid URL '{$url}': threw {$e->getMessage()}", $errors, $passed, $failed);
    }
}

// Invalid URLs
foreach ([
    'not-a-url',
    'ftp://files.example.com',
    'javascript:alert(1)',
    'http://localhost/admin',
    'http://127.0.0.1/secrets',
    'http://0.0.0.0',
    '',
    '   ',
] as $url) {
    try {
        $validateUrl->invoke($importer, $url);
        record(false, "FAIL invalid URL '{$url}': should have thrown", $errors, $passed, $failed);
    } catch (\RuntimeException $e) {
        record(true, '', $errors, $passed, $failed);
    }
}

// SSRF: Literal private/reserved IP addresses
echo "--- SSRF: Literal Private IPs ---\n";

$ssrfUrls = [
    'http://10.0.0.5',
    'http://10.255.255.255/path',
    'http://192.168.1.1',
    'http://192.168.0.100/admin',
    'http://172.16.0.1',
    'http://172.31.255.255',
    'http://169.254.169.254/latest/meta-data/',  // AWS metadata endpoint
    'http://127.0.0.2',                          // localhost alt
];

foreach ($ssrfUrls as $url) {
    try {
        $validateUrl->invoke($importer, $url);
        record(false, "FAIL SSRF '{$url}': should have been rejected", $errors, $passed, $failed);
    } catch (\RuntimeException $e) {
        record(true, '', $errors, $passed, $failed);
    }
}

// Direct isPrivateOrReservedIp() tests
$isPrivate = new ReflectionMethod($importer, 'isPrivateOrReservedIp');
$isPrivate->setAccessible(true);

// IPv6 private/reserved
foreach (['::1', 'fe80::1', 'fc00::1', 'fd12:3456::1'] as $ip) {
    record(
        $isPrivate->invoke($importer, $ip) === true,
        "FAIL isPrivate({$ip}): should be private",
        $errors, $passed, $failed
    );
}

// Public IPs should NOT be flagged
foreach (['8.8.8.8', '93.184.216.34', '2607:f8b0:4004:800::200e'] as $ip) {
    record(
        $isPrivate->invoke($importer, $ip) === false,
        "FAIL isPrivate({$ip}): should NOT be private",
        $errors, $passed, $failed
    );
}

// Direct resolveAllIps() tests
echo "--- DNS Resolution ---\n";

$resolveAllIps = new ReflectionMethod($importer, 'resolveAllIps');
$resolveAllIps->setAccessible(true);

// Literal IPs should return empty (Phase 1 handles them, no DNS needed)
foreach (['10.0.0.5', '192.168.1.1', '8.8.8.8', '::1', '2607:f8b0:4004:800::200e'] as $literalIp) {
    record(
        $resolveAllIps->invoke($importer, $literalIp) === [],
        "FAIL resolveAllIps({$literalIp}): should return empty for literal IPs",
        $errors, $passed, $failed
    );
}

// Empty/invalid hostnames should return empty (no crash)
record(
    $resolveAllIps->invoke($importer, '') === [],
    'FAIL resolveAllIps(""): should return empty for empty string',
    $errors, $passed, $failed
);

// Return type is always array
record(
    is_array($resolveAllIps->invoke($importer, 'thishostnamedoesnotexist.invalid')),
    'FAIL resolveAllIps(invalid): should always return array',
    $errors, $passed, $failed
);

// ─────────────────────────────────────────
//  robots.txt Parsing (via reflection)
// ─────────────────────────────────────────

echo "--- robots.txt Parsing ---\n";

$isPathAllowed = new ReflectionMethod($importer, 'isPathAllowed');
$isPathAllowed->setAccessible(true);

// Simple Disallow
$robots1 = "User-agent: *\nDisallow: /admin\nDisallow: /private/\n";

record(
    $isPathAllowed->invoke($importer, $robots1, '/') === true,
    'FAIL robots: root should be allowed',
    $errors, $passed, $failed
);

record(
    $isPathAllowed->invoke($importer, $robots1, '/about') === true,
    'FAIL robots: /about should be allowed',
    $errors, $passed, $failed
);

record(
    $isPathAllowed->invoke($importer, $robots1, '/admin') === false,
    'FAIL robots: /admin should be disallowed',
    $errors, $passed, $failed
);

record(
    $isPathAllowed->invoke($importer, $robots1, '/admin/login') === false,
    'FAIL robots: /admin/login should be disallowed (prefix match)',
    $errors, $passed, $failed
);

record(
    $isPathAllowed->invoke($importer, $robots1, '/private/docs') === false,
    'FAIL robots: /private/docs should be disallowed',
    $errors, $passed, $failed
);

// Disallow all
$robots2 = "User-agent: *\nDisallow: /\n";

record(
    $isPathAllowed->invoke($importer, $robots2, '/') === false,
    'FAIL robots: / should be disallowed when Disallow: /',
    $errors, $passed, $failed
);

// Empty robots.txt (all allowed)
record(
    $isPathAllowed->invoke($importer, '', '/anything') === true,
    'FAIL robots: empty robots should allow everything',
    $errors, $passed, $failed
);

// Only bot-specific rules (should not block *)
$robots3 = "User-agent: Googlebot\nDisallow: /private\n\nUser-agent: *\nDisallow:\n";

record(
    $isPathAllowed->invoke($importer, $robots3, '/private') === true,
    'FAIL robots: /private should be allowed for * when only Googlebot is blocked',
    $errors, $passed, $failed
);

// ─────────────────────────────────────────
//  HTML Cleaning (via reflection)
// ─────────────────────────────────────────

echo "--- HTML Cleaning ---\n";

$cleanHtml = new ReflectionMethod($importer, 'cleanHtml');
$cleanHtml->setAccessible(true);

// Script removal
$html1 = '<div>Hello</div><script>alert("evil")</script><p>World</p>';
$cleaned = $cleanHtml->invoke($importer, $html1);
record(
    !str_contains($cleaned, 'script') && !str_contains($cleaned, 'alert'),
    'FAIL clean: scripts should be removed: ' . $cleaned,
    $errors, $passed, $failed
);
record(
    str_contains($cleaned, 'Hello') && str_contains($cleaned, 'World'),
    'FAIL clean: content should be preserved: ' . $cleaned,
    $errors, $passed, $failed
);

// SVG removal
$html2 = '<div>Content</div><svg viewBox="0 0 100 100"><circle r="50"/></svg><span>More</span>';
$cleaned = $cleanHtml->invoke($importer, $html2);
record(
    !str_contains($cleaned, 'svg') && !str_contains($cleaned, 'circle'),
    'FAIL clean: SVGs should be removed: ' . $cleaned,
    $errors, $passed, $failed
);

// data: URI removal
$html3 = '<img src="data:image/png;base64,iVBOR..." /><img src="/images/logo.png" />';
$cleaned = $cleanHtml->invoke($importer, $html3);
record(
    !str_contains($cleaned, 'base64'),
    'FAIL clean: data URIs should be removed: ' . $cleaned,
    $errors, $passed, $failed
);
record(
    str_contains($cleaned, '/images/logo.png'),
    'FAIL clean: regular src should be preserved: ' . $cleaned,
    $errors, $passed, $failed
);

// Style block preservation
$html4 = '<style>body { color: red; }</style><div class="main">Content</div>';
$cleaned = $cleanHtml->invoke($importer, $html4);
record(
    str_contains($cleaned, 'body { color: red; }'),
    'FAIL clean: style blocks should be PRESERVED: ' . $cleaned,
    $errors, $passed, $failed
);

// Short inline style preservation
$html5 = '<div style="color: blue; font-size: 16px;">Text</div>';
$cleaned = $cleanHtml->invoke($importer, $html5);
record(
    str_contains($cleaned, 'color: blue'),
    'FAIL clean: short inline styles should be preserved: ' . $cleaned,
    $errors, $passed, $failed
);

// Long inline style removal (>200 chars)
$longStyle = str_repeat('padding: 10px; ', 20); // ~300 chars
$html6 = '<div style="' . $longStyle . '">Text</div>';
$cleaned = $cleanHtml->invoke($importer, $html6);
record(
    !str_contains($cleaned, 'padding: 10px'),
    'FAIL clean: long inline styles should be removed: ' . substr($cleaned, 0, 100),
    $errors, $passed, $failed
);

// HTML comment removal
$html7 = '<!-- This is a comment --><div>Keep this</div><!-- Another comment -->';
$cleaned = $cleanHtml->invoke($importer, $html7);
record(
    !str_contains($cleaned, '<!--'),
    'FAIL clean: HTML comments should be removed: ' . $cleaned,
    $errors, $passed, $failed
);

// srcset removal
$html8 = '<img src="/img.jpg" srcset="/img-2x.jpg 2x, /img-3x.jpg 3x" />';
$cleaned = $cleanHtml->invoke($importer, $html8);
record(
    !str_contains($cleaned, 'srcset'),
    'FAIL clean: srcset should be removed: ' . $cleaned,
    $errors, $passed, $failed
);

// noscript removal
$html9 = '<noscript><p>Enable JavaScript</p></noscript><div>Content</div>';
$cleaned = $cleanHtml->invoke($importer, $html9);
record(
    !str_contains($cleaned, 'noscript') && !str_contains($cleaned, 'Enable JavaScript'),
    'FAIL clean: noscript should be removed: ' . $cleaned,
    $errors, $passed, $failed
);

// ─────────────────────────────────────────
//  HTML Truncation
// ─────────────────────────────────────────

echo "--- HTML Truncation ---\n";

$longHtml = str_repeat('<p>' . str_repeat('x', 1000) . '</p>', 200); // ~200KB
$cleaned = $cleanHtml->invoke($importer, $longHtml);
record(
    strlen($cleaned) <= 120100, // MAX_CLEAN_HTML_CHARS + truncation comment
    'FAIL truncation: cleaned HTML exceeds limit: ' . strlen($cleaned),
    $errors, $passed, $failed
);
record(
    str_contains($cleaned, '<!-- HTML truncated at token limit -->'),
    'FAIL truncation: should contain truncation comment',
    $errors, $passed, $failed
);

// ─────────────────────────────────────────
//  Link Extraction (via reflection)
// ─────────────────────────────────────────

echo "--- Link Extraction ---\n";

$extractLinks = new ReflectionMethod($importer, 'extractInternalLinks');
$extractLinks->setAccessible(true);

$html10 = '
<a href="/about">About</a>
<a href="/contact">Contact</a>
<a href="https://example.com/team">Team</a>
<a href="https://other-site.com/page">External</a>
<a href="mailto:test@example.com">Email</a>
<a href="tel:+1234567890">Phone</a>
<a href="/images/logo.png">Logo</a>
<a href="#section">Anchor</a>
<a href="/about?ref=nav">About with query</a>
';

$links = $extractLinks->invoke($importer, $html10, 'https://example.com/');

record(
    in_array('https://example.com/about', $links, true),
    'FAIL links: /about should be extracted: ' . json_encode($links),
    $errors, $passed, $failed
);

record(
    in_array('https://example.com/contact', $links, true),
    'FAIL links: /contact should be extracted: ' . json_encode($links),
    $errors, $passed, $failed
);

record(
    in_array('https://example.com/team', $links, true),
    'FAIL links: /team should be extracted: ' . json_encode($links),
    $errors, $passed, $failed
);

// External links should be excluded
$externalFound = false;
foreach ($links as $link) {
    if (str_contains($link, 'other-site.com')) {
        $externalFound = true;
    }
}
record(
    !$externalFound,
    'FAIL links: external links should be excluded: ' . json_encode($links),
    $errors, $passed, $failed
);

// mailto/tel should be excluded
record(
    !in_array('mailto:test@example.com', $links, true),
    'FAIL links: mailto should be excluded: ' . json_encode($links),
    $errors, $passed, $failed
);

// Asset URLs should be excluded
$assetFound = false;
foreach ($links as $link) {
    if (str_contains($link, '.png')) {
        $assetFound = true;
    }
}
record(
    !$assetFound,
    'FAIL links: asset URLs should be excluded: ' . json_encode($links),
    $errors, $passed, $failed
);

// Deduplication: /about and /about?ref=nav should merge to one /about
$aboutCount = count(array_filter($links, fn($l) => str_contains($l, '/about')));
record(
    $aboutCount === 1,
    'FAIL links: /about should be deduplicated: ' . json_encode($links),
    $errors, $passed, $failed
);

// ─────────────────────────────────────────
//  Title Extraction (via reflection)
// ─────────────────────────────────────────

echo "--- Title Extraction ---\n";

$extractTitle = new ReflectionMethod($importer, 'extractTitle');
$extractTitle->setAccessible(true);

record(
    $extractTitle->invoke($importer, '<html><head><title>My Site</title></head></html>') === 'My Site',
    'FAIL title: basic title extraction',
    $errors, $passed, $failed
);

record(
    $extractTitle->invoke($importer, '<html><head><title>Test &amp; Demo</title></head></html>') === 'Test & Demo',
    'FAIL title: HTML entity decoding',
    $errors, $passed, $failed
);

record(
    $extractTitle->invoke($importer, '<html><head></head></html>') === '',
    'FAIL title: missing title should return empty',
    $errors, $passed, $failed
);

// ─────────────────────────────────────────
//  Blocked Page Detection (via reflection)
// ─────────────────────────────────────────

echo "--- Blocked Page Detection ---\n";

$detectBlocked = new ReflectionMethod($importer, 'detectBlockedPage');
$detectBlocked->setAccessible(true);

// Should throw for blocked title patterns
$blockedTitles = [
    'Your request has been blocked',
    'Access Denied - Forbidden',
    'Attention Required! | Cloudflare',
    'Just a moment...',
    'Please verify you are a human',
    'CAPTCHA Required',
    'Security Check | MySite',
    'Pardon Our Interruption',
];

foreach ($blockedTitles as $title) {
    try {
        $detectBlocked->invoke($importer, $title, '<html><body>Blocked</body></html>');
        record(false, "FAIL blocked: should throw for title: {$title}", $errors, $passed, $failed);
    } catch (\RuntimeException $e) {
        record(
            str_contains($e->getMessage(), 'anti-bot protection'),
            "FAIL blocked: wrong error message for title: {$title}",
            $errors, $passed, $failed
        );
    }
}

// Should throw for body patterns on minimal pages
try {
    $detectBlocked->invoke($importer, 'Checking your browser', '<html><body><div id="cf-browser-verification">Please wait</div></body></html>');
    record(false, 'FAIL blocked: should throw for Cloudflare challenge body', $errors, $passed, $failed);
} catch (\RuntimeException $e) {
    record(
        str_contains($e->getMessage(), 'anti-bot protection'),
        'FAIL blocked: wrong error for Cloudflare body',
        $errors, $passed, $failed
    );
}

// Should NOT throw for normal page titles
$normalTitles = [
    'Microsoft – Cloud, Computers, Apps & Gaming',
    'Apple',
    'Google Search',
    'My Awesome Website',
    '',
];
foreach ($normalTitles as $title) {
    try {
        $detectBlocked->invoke($importer, $title, '<html><body><main><section><h1>Hello</h1></section><section>Content</section></main></body></html>');
        record(true, '', $errors, $passed, $failed);
    } catch (\RuntimeException $e) {
        record(false, "FAIL blocked: normal title falsely blocked: {$title}", $errors, $passed, $failed);
    }
}

// Should NOT flag real pages that happen to have CAPTCHAs on forms (they have real content)
try {
    $detectBlocked->invoke($importer, 'Contact Us', '<html><body><main><section><h1>Contact</h1></section><section><form><div class="g-recaptcha"></div></form></section></main></body></html>');
    record(true, '', $errors, $passed, $failed);
} catch (\RuntimeException $e) {
    record(false, 'FAIL blocked: normal page with form CAPTCHA was falsely blocked', $errors, $passed, $failed);
}

// ─────────────────────────────────────────
//  checkUrl() — Public Return Contract
// ─────────────────────────────────────────

echo "--- checkUrl() Return Contract ---\n";

// Invalid URL should return {ok: false, error: string}
$result = $importer->checkUrl('not-a-url');
record(
    $result['ok'] === false && !empty($result['error']) && is_string($result['error']),
    'FAIL checkUrl: invalid URL should return ok=false with error string',
    $errors, $passed, $failed
);

// Private IP should return ok=false
$result = $importer->checkUrl('http://192.168.1.1');
record(
    $result['ok'] === false && !empty($result['error']),
    'FAIL checkUrl: private IP should return ok=false',
    $errors, $passed, $failed
);

// Empty URL should return ok=false
$result = $importer->checkUrl('');
record(
    $result['ok'] === false && !empty($result['error']),
    'FAIL checkUrl: empty URL should return ok=false',
    $errors, $passed, $failed
);

// All results should have the correct shape
$result = $importer->checkUrl('https://nonexistent-domain-that-does-not-exist-xyz123.com');
record(
    array_key_exists('ok', $result) && array_key_exists('url', $result)
    && array_key_exists('title', $result) && array_key_exists('error', $result),
    'FAIL checkUrl: result must have ok, url, title, error keys',
    $errors, $passed, $failed
);

// ─────────────────────────────────────────
//  stripVxMarkers() — Marker Stripping
// ─────────────────────────────────────────

echo "--- stripVxMarkers() ---\n";

// Inline the strip logic to test without PromptEngine dependencies.
// Must match PromptEngine::stripVxMarkers() exactly.
function testStripVxMarkers(string $text): string {
    $text = preg_replace('/\[vx-img:data:image\/[^;]+;base64,[A-Za-z0-9+\/=]+\]/', '', $text);
    $text = preg_replace('/\[vx-ref:https?:\/\/[^\]]+\]/', '', $text);
    return trim($text);
}

// No markers — pass through unchanged
record(
    testStripVxMarkers('Hello world') === 'Hello world',
    'FAIL stripVx: plain text should pass through',
    $errors, $passed, $failed
);

// Image markers only
record(
    testStripVxMarkers('[vx-img:data:image/jpeg;base64,abc123]Make it blue') === 'Make it blue',
    'FAIL stripVx: should strip image marker',
    $errors, $passed, $failed
);

// Ref marker only
record(
    testStripVxMarkers('[vx-ref:https://example.com]Make it blue') === 'Make it blue',
    'FAIL stripVx: should strip ref marker',
    $errors, $passed, $failed
);

// Both markers + text
record(
    testStripVxMarkers('[vx-img:data:image/png;base64,XYZ][vx-ref:https://example.com/path?q=1]Restyle my site') === 'Restyle my site',
    'FAIL stripVx: should strip both image and ref markers',
    $errors, $passed, $failed
);

// Ref-only send (no user text, just fallback)
$result = testStripVxMarkers('[vx-ref:https://microsoft.com](import from: microsoft.com)');
record(
    $result === '(import from: microsoft.com)',
    'FAIL stripVx: ref-only should preserve fallback text',
    $errors, $passed, $failed
);

// Empty string
record(
    testStripVxMarkers('') === '',
    'FAIL stripVx: empty string should return empty',
    $errors, $passed, $failed
);

// Multiple image markers + ref + text
$input = '[vx-img:data:image/jpeg;base64,AAA][vx-img:data:image/png;base64,BBB][vx-ref:https://test.com]Design from reference';
record(
    testStripVxMarkers($input) === 'Design from reference',
    'FAIL stripVx: multiple images + ref + text',
    $errors, $passed, $failed
);

// ─────────────────────────────────────────
//  Results
// ─────────────────────────────────────────

echo "\n=== Results ===\n";
echo "Passed: {$passed}\n";
echo "Failed: {$failed}\n";

if (!empty($errors)) {
    echo "\n--- Failures ---\n";
    foreach ($errors as $error) {
        echo "  {$error}\n";
    }
}

echo "\nTotal: " . ($passed + $failed) . " tests\n";
exit($failed > 0 ? 1 : 0);
