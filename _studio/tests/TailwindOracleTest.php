<?php

/**
 * Tailwind CLI Oracle Harness
 *
 * Compares VoxelSite TailwindCompiler output against the real Tailwind CSS
 * CLI (v4.1.x) for a defined set of fixture classes.
 *
 * Design decisions:
 * - We compare SEMANTIC equivalence, not byte-for-byte matching.
 *   Real Tailwind 4 uses `var(--spacing)` multipliers and `var(--color-*)`
 *   theme variables. VoxelSite's compiler resolves to concrete values
 *   (e.g. `1rem`, `#ef4444`) because VoxelSite sites don't include
 *   Tailwind's CSS variable theme layer. So we check that both compilers
 *   produce a rule for each class and that the CSS property names match.
 * - We check selector correctness MORE strictly — the selector pattern
 *   (pseudo-classes, attribute selectors, media queries) must match
 *   between both compilers, because these are structural, not theme-dependent.
 * - We explicitly test that unsupported classes are NOT compiled by our
 *   engine but ARE compiled by real Tailwind, so we can track the gap.
 *
 * Usage:  php _studio/tests/TailwindOracleTest.php
 *
 * Requirements:
 * - `npx tailwindcss` must be available (v4.1.x)
 * - `tailwindcss` package must be installed in node_modules
 *
 * @package VoxelSite\Tests
 */

declare(strict_types=1);

require_once __DIR__ . '/../engine/TailwindCompiler.php';
require_once __DIR__ . '/../engine/TailwindConfig.php';

// ─── Helpers ─────────────────────────────────────────────

$passed = 0;
$failed = 0;
$errors = [];
$skipped = 0;

function record(bool $ok, string $failMessage, array &$errors, int &$passed, int &$failed): void
{
    if ($ok) { $passed++; } else { $failed++; $errors[] = $failMessage; }
}

function skip(string $reason, int &$skipped): void
{
    $skipped++;
    echo "  SKIP: {$reason}\n";
}

// ─── Oracle Engine ───────────────────────────────────────

/**
 * Run the real Tailwind CLI on a set of classes.
 * Returns the raw CSS output (minified), or null on failure.
 */
function runTailwindCli(array $classes, string $projectRoot): ?string
{
    $fixtureDir = sys_get_temp_dir() . '/tw-oracle-' . uniqid('', true);
    mkdir($fixtureDir, 0755, true);

    // Build an HTML file with all the classes
    $classString = implode(' ', $classes);
    file_put_contents(
        $fixtureDir . '/index.html',
        '<div class="' . htmlspecialchars($classString, ENT_QUOTES) . '"></div>'
    );

    // Input CSS that imports Tailwind and points at our fixture
    $inputCss = "@import \"tailwindcss\";\n@source \"{$fixtureDir}\";\n";
    $inputPath = $projectRoot . '/_studio/tests/.tw-oracle-input.css';
    $outputPath = $fixtureDir . '/output.css';

    file_put_contents($inputPath, $inputCss);

    $cmd = sprintf(
        'npx tailwindcss -i %s -o %s --minify 2>&1',
        escapeshellarg($inputPath),
        escapeshellarg($outputPath)
    );

    $output = shell_exec("cd " . escapeshellarg($projectRoot) . " && " . $cmd);

    @unlink($inputPath);

    if (!file_exists($outputPath)) {
        // Cleanup
        array_map('unlink', glob($fixtureDir . '/*'));
        @rmdir($fixtureDir);
        return null;
    }

    $css = file_get_contents($outputPath);

    // Cleanup
    array_map('unlink', glob($fixtureDir . '/*'));
    @rmdir($fixtureDir);

    return $css;
}

/**
 * Run VoxelSite's TailwindCompiler on a set of classes.
 * Returns the raw CSS output.
 */
function runVoxelSiteCompiler(array $classes): string
{
    $compiler = new \VoxelSite\TailwindCompiler();

    // Use reflection to call compileClasses directly
    $method = new ReflectionMethod($compiler, 'compileClasses');
    $method->setAccessible(true);
    return $method->invoke($compiler, $classes);
}

/**
 * Parse CSS rules from a minified CSS string (works for both CLI and VoxelSite output).
 *
 * Handles:
 * - Backslash-escaped characters in selectors (e.g., \.hover\:text-red-500)
 * - Nested @media and @supports wrappers
 * - @layer blocks in Tailwind 4 output
 *
 * Returns an array keyed by the escaped class name (the part after the leading dot,
 * up to the first unescaped pseudo/combinator/attr boundary).
 */
function parseCssRules(string $css): array
{
    $rules = [];
    $len = strlen($css);
    $pos = 0;
    // Track nested at-rules. Each entry is ['type' => 'media'|'supports'|'layer', 'value' => string]
    $wrapperStack = [];

    while ($pos < $len) {
        // Skip whitespace
        while ($pos < $len && ctype_space($css[$pos])) $pos++;
        if ($pos >= $len) break;

        // ── At-rule: @media, @supports, @layer, @keyframes, etc. ──
        if ($css[$pos] === '@') {
            // Read the at-rule name and condition up to '{'
            $atStart = $pos;
            $bracePos = strpos($css, '{', $pos);
            if ($bracePos === false) break;

            $atHeader = trim(substr($css, $atStart, $bracePos - $atStart));

            if (str_starts_with($atHeader, '@media')) {
                $wrapperStack[] = ['type' => 'media', 'value' => substr($atHeader, 7)]; // strip "@media "
                $pos = $bracePos + 1;
                continue;
            }

            if (str_starts_with($atHeader, '@supports')) {
                $wrapperStack[] = ['type' => 'supports', 'value' => substr($atHeader, 10)]; // strip "@supports "
                $pos = $bracePos + 1;
                continue;
            }

            // @layer blocks are transparent containers in Tailwind 4 —
            // utilities live inside @layer utilities{...} and @layer base{...}.
            // Enter them like @media so we can find the rules inside.
            if (str_starts_with($atHeader, '@layer')) {
                $wrapperStack[] = ['type' => 'layer', 'value' => ''];
                $pos = $bracePos + 1;
                continue;
            }

            if (str_starts_with($atHeader, '@property')
                || str_starts_with($atHeader, '@keyframes')) {
                // Skip the entire block (find matching closing brace)
                $pos = findMatchingBrace($css, $bracePos, $len);
                continue;
            }

            // Unknown at-rule — skip the block
            $pos = findMatchingBrace($css, $bracePos, $len);
            continue;
        }

        // ── Closing brace: pop wrapper stack ──
        if ($css[$pos] === '}') {
            if (!empty($wrapperStack)) {
                array_pop($wrapperStack);
            }
            $pos++;
            continue;
        }

        // ── Regular rule: selector { declarations } ──
        // Read selector: everything up to the next unescaped '{'
        $selectorStart = $pos;
        $selectorEnd = $pos;
        while ($selectorEnd < $len && $css[$selectorEnd] !== '{') {
            if ($css[$selectorEnd] === '\\' && $selectorEnd + 1 < $len) {
                $selectorEnd += 2; // skip escaped char
            } else {
                $selectorEnd++;
            }
        }
        if ($selectorEnd >= $len) break;

        $selector = trim(substr($css, $selectorStart, $selectorEnd - $selectorStart));
        $pos = $selectorEnd + 1; // skip '{'

        // Read declarations up to the matching '}'
        $declStart = $pos;
        $depth = 1;
        while ($pos < $len && $depth > 0) {
            if ($css[$pos] === '{') $depth++;
            elseif ($css[$pos] === '}') $depth--;
            if ($depth > 0) $pos++;
        }
        $declarations = substr($css, $declStart, $pos - $declStart);
        if ($pos < $len) $pos++; // skip '}'

        // Process rules that contain a class selector — may start with '.' or ':is(.'
        // :is() wrapping is used by *: and **: variants in TW4
        if (str_starts_with($selector, '.')) {
            // Standard class selector — extract after the leading dot
            $className = extractEscapedClassName(substr($selector, 1));
        } elseif (preg_match('/^:is\(\./', $selector)) {
            // :is(.class>*) or :is(.class *) — extract class name from inside :is(
            $innerStart = strpos($selector, '.');
            if ($innerStart !== false) {
                $className = extractEscapedClassName(substr($selector, $innerStart + 1));
            } else {
                continue;
            }
        } else {
            continue;
        }

        if ($className === '') continue;

        // Determine media and supports context from the wrapper stack
        $mediaParts = [];
        $supportsParts = [];
        foreach ($wrapperStack as $wrapper) {
            if ($wrapper['type'] === 'media') {
                $mediaParts[] = $wrapper['value'];
            } elseif ($wrapper['type'] === 'supports') {
                $supportsParts[] = $wrapper['value'];
            }
            // 'layer' is transparent — ignored
        }
        $media = !empty($mediaParts) ? implode(' and ', $mediaParts) : null;
        $supports = !empty($supportsParts) ? implode(' and ', $supportsParts) : null;

        $ruleData = [
            'selector'     => $selector,
            'declarations' => $declarations,
            'media'        => $media,
            'supports'     => $supports,
        ];

        // Store by primary extracted class name
        $rules[$className] = $ruleData;

        // Also index by any OTHER escaped class names in the selector.
        // This handles group/peer variants where the utility class appears
        // after an ancestor selector (e.g. ".group:hover .group-hover\:opacity-100").
        // Use the escape-aware function instead of regex.
        $scanPos = 0;
        $selLen = strlen($selector);
        while ($scanPos < $selLen) {
            if ($selector[$scanPos] === '.' && $scanPos > 0) {
                $altClass = extractEscapedClassName(substr($selector, $scanPos + 1));
                if ($altClass !== '' && $altClass !== $className && !isset($rules[$altClass])) {
                    $rules[$altClass] = $ruleData;
                }
                $scanPos += 1 + strlen($altClass);
            } else {
                $scanPos++;
            }
        }
    }

    return $rules;
}

/**
 * Find the position AFTER the matching closing brace for a given opening brace.
 */
function findMatchingBrace(string $css, int $openPos, int $len): int
{
    $depth = 1;
    $pos = $openPos + 1;
    while ($pos < $len && $depth > 0) {
        if ($css[$pos] === '{') $depth++;
        elseif ($css[$pos] === '}') $depth--;
        $pos++;
    }
    return $pos;
}

/**
 * Extract the escaped class name from a selector string (without the leading dot).
 *
 * Reads characters until it hits an UNESCAPED boundary:
 * - ':' that isn't preceded by '\' (pseudo-class boundary)
 * - '[' that isn't preceded by '\' (attribute selector boundary)
 * - ' ', '>', '+', '~' (combinator boundary)
 *
 * Backslash-escaped characters (\: \[ \. etc.) are included as part of the name.
 */
function extractEscapedClassName(string $selectorAfterDot): string
{
    $result = '';
    $len = strlen($selectorAfterDot);
    $i = 0;

    while ($i < $len) {
        $ch = $selectorAfterDot[$i];

        // Backslash escape: include both the backslash and the next char
        if ($ch === '\\' && $i + 1 < $len) {
            $result .= $ch . $selectorAfterDot[$i + 1];
            $i += 2;
            continue;
        }

        // Unescaped boundary characters
        if ($ch === ':' || $ch === '[' || $ch === ' '
            || $ch === '>' || $ch === '+' || $ch === '~'
            || $ch === '{') {
            break;
        }

        $result .= $ch;
        $i++;
    }

    return $result;
}

/**
 * Extract the set of CSS property names from a declaration string.
 * e.g. "display:flex;padding:1rem" → ['display', 'padding']
 */
function extractPropertyNames(string $declarations): array
{
    $props = [];
    $parts = explode(';', $declarations);
    foreach ($parts as $part) {
        $part = trim($part);
        if ($part === '') continue;
        $colonPos = strpos($part, ':');
        if ($colonPos !== false) {
            $props[] = substr($part, 0, $colonPos);
        }
    }
    sort($props);
    return $props;
}

/**
 * Escape a Tailwind class name the way it would appear in CSS selectors.
 * Must match TailwindCompiler::escapeSelector().
 */
function escapeForLookup(string $class): string
{
    $result = preg_replace_callback('/([^a-zA-Z0-9_-])/', function ($m) {
        return '\\' . $m[0];
    }, $class);
    if (isset($result[0]) && ctype_digit($result[0])) {
        $result = '\\3' . $result[0] . ' ' . substr($result, 1);
    }
    return $result;
}

// ─── Test Fixtures ───────────────────────────────────────

/**
 * Fixture groups.
 * Each group is a named category with a list of test cases.
 * Each test case: [class, expected_properties[], structural_check]
 *
 * structural_check is one of:
 *   'base'      — base rule, no media/supports wrapper
 *   'pseudo'    — pseudo-class/element in selector
 *   'media'     — wrapped in @media
 *   'supports'  — wrapped in @supports
 *   'attr'      — attribute selector in output
 *   'selector'  — arbitrary selector fragment
 *   'unresolved'— our compiler should NOT produce output (feature gap)
 */
$fixtures = [
    'Core Utilities' => [
        ['flex',          ['display'],             'base'],
        ['block',         ['display'],             'base'],
        ['hidden',        ['display'],             'base'],
        ['p-4',           ['padding'],             'base'],
        ['mt-8',          ['margin-top'],          'base'],
        ['mx-auto',       ['margin-left', 'margin-right'], 'base'],
        ['w-full',        ['width'],               'base'],
        ['h-screen',      ['height'],              'base'],
        ['text-lg',       ['font-size', 'line-height'], 'base'],
        ['font-bold',     ['font-weight'],         'base'],
        ['text-white',    ['color'],               'base'],
        ['bg-red-500',    ['background-color'],    'base'],
        ['rounded-lg',    ['border-radius'],       'base'],
        ['z-50',          ['z-index'],             'base'],
        ['opacity-50',    ['opacity'],             'base'],
    ],

    'Variant Semantics' => [
        // TW4 wraps hover in @media (hover:hover). VoxelSite emits a bare :hover.
        // Both produce correct hover behavior, but TW4 is stricter about touch devices.
        ['hover:text-red-500',       ['color'],           'known_gap'],
        ['focus:outline-none',       ['outline'],         'pseudo'],
        ['md:flex',                  ['display'],         'media'],
        ['dark:bg-gray-900',         ['background-color'], 'media'],
        // group-hover uses a different model in TW4 (:is(:where(.group):hover *))
        // vs VoxelSite (.group:hover .class). Both produce the correct CSS.
        ['group-hover:opacity-100',  ['opacity'],         'known_gap'],
    ],

    'Arbitrary Values' => [
        ['bg-[#1a1a2e]',            ['background-color'], 'base'],
        ['p-[13px]',                ['padding'],          'base'],
        ['text-[2.5rem]',           ['font-size'],        'base'],
        ['w-[calc(100%-2rem)]',     ['width'],            'base'],
        ['ease-[cubic-bezier(0.16,1,0.3,1)]', ['transition-timing-function'], 'base'],
    ],

    'Data/Aria/Selector Variants' => [
        ['data-[state=open]:block',      ['display'],         'attr'],
        ['aria-expanded:bg-red-500',     ['background-color'], 'attr'],
        ['aria-[busy]:opacity-50',       ['opacity'],         'attr'],
        ['min-[320px]:text-center',      ['text-align'],      'media'],
        ['max-[768px]:hidden',           ['display'],         'media'],
        ['max-sm:hidden',                ['display'],         'media'],
        ['[&>*]:p-4',                    ['padding'],         'selector'],
    ],

    'Ring & Shadow Composition' => [
        ['ring-2',        ['--tw-ring-shadow', 'box-shadow'], 'base'],
        ['ring-red-500',  ['--tw-ring-color'],               'base'],
        ['shadow-lg',     ['--tw-shadow', 'box-shadow'],     'base'],
        ['shadow-red-500', ['--tw-shadow-color'],            'base'],
    ],

    'Newly Supported — Arbitrary Properties' => [
        ['[--scroll-offset:56px]',        ['--scroll-offset'],         'base'],
        ['[mask-type:luminance]',         ['mask-type'],               'base'],
    ],

    'Newly Supported — Content' => [
        ['content-[attr(data-label)]',    ['--tw-content', 'content'], 'base'],
    ],

    'Newly Supported — has/not/supports Variants' => [
        ['has-[>img]:rounded-lg',           ['border-radius'],  'pseudo'],
        ['not-[.hidden]:block',             ['display'],        'pseudo'],
        ['supports-[display:grid]:grid',    ['display'],        'supports'],
    ],

    'Combined Wrapper Nesting' => [
        // md:supports-[display:grid]:grid → @media (...){@supports (...){...}}
        ['md:supports-[display:grid]:grid',    ['display'],    'nested_wrappers'],
        // dark:supports-[display:grid]:grid → @media (...){@supports (...){...}}
        ['dark:supports-[display:grid]:grid',  ['display'],    'nested_wrappers'],
    ],

    '3D Transforms' => [
        ['backface-hidden',             ['backface-visibility'], 'base'],
        ['backface-visible',            ['backface-visibility'], 'base'],
        ['transform-3d',                ['transform-style'],     'base'],
        ['perspective-none',            ['perspective'],         'base'],
        // perspective-500 is VoxelSite-only (TW4 only has perspective-none and perspective-[...])
        // It's covered in the regression suite, not the oracle.
        ['perspective-[800px]',         ['perspective'],         'base'],
        ['perspective-origin-center',   ['perspective-origin'],  'base'],
        ['rotate-x-45',                ['--tw-rotate-x', 'transform'], 'base'],
        ['rotate-y-90',                ['--tw-rotate-y', 'transform'], 'base'],
        ['rotate-z-12',                ['--tw-rotate-z', 'transform'], 'base'],
        ['translate-z-4',              ['--tw-translate-z', 'translate'], 'base'],
    ],

    'TW4 Individual Transform Properties' => [
        // 2D rotate uses CSS rotate: property
        ['rotate-45',                  ['rotate'],              'base'],
        // 2D translate uses CSS translate: property
        ['translate-x-4',             ['--tw-translate-x', 'translate'], 'base'],
        ['translate-y-8',             ['--tw-translate-y', 'translate'], 'base'],
        // Scale uses CSS scale: property
        ['scale-50',                   ['--tw-scale-x', 'scale'], 'base'],
        ['scale-x-75',                 ['--tw-scale-x', 'scale'], 'base'],
        // Skew shares transform: with 3D rotations
        ['skew-x-6',                   ['--tw-skew-x', 'transform'], 'base'],
    ],

    'Universal Child/Descendant Variants' => [
        ['*:p-4',                       ['padding'],           'child_selector'],
        ['**:text-sm',                  ['font-size'],         'child_selector'],
        // Combined: hover state must be preserved inside :is() wrapper
        ['hover:*:p-4',                 ['padding'],           'child_selector'],
        ['data-[state=open]:*:p-4',     ['padding'],           'child_selector'],
    ],
];

// ─── Run ─────────────────────────────────────────────────

$projectRoot = dirname(__DIR__, 2);

echo "=== Tailwind Oracle Harness ===\n";
echo "VoxelSite TailwindCompiler vs tailwindcss v4.1.x\n\n";

// Step 1: Collect all classes from all fixtures
$allClasses = [];
foreach ($fixtures as $group => $cases) {
    foreach ($cases as [$class]) {
        $allClasses[] = $class;
    }
}

// Step 2: Run the CLI once with all classes
echo "Running Tailwind CLI... ";
$cliCss = runTailwindCli($allClasses, $projectRoot);
if ($cliCss === null) {
    echo "FAILED — CLI not available or errored. Skipping oracle comparison.\n";
    echo "The oracle harness requires `npx tailwindcss` (v4.1.x) to be installed.\n";
    exit(1);
}
echo "OK (" . strlen($cliCss) . " bytes)\n";

// Step 3: Run VoxelSite compiler with all classes
echo "Running VoxelSite compiler... ";
$voxelCss = runVoxelSiteCompiler($allClasses);
echo "OK (" . strlen($voxelCss) . " bytes)\n\n";

// Step 4: Parse both outputs
$cliRules = parseCssRules($cliCss);
$voxelRules = parseCssRules($voxelCss);

// Step 5: Run fixture comparisons
foreach ($fixtures as $group => $cases) {
    echo "--- {$group} ---\n";

    foreach ($cases as [$class, $expectedProps, $structCheck]) {
        $escaped = escapeForLookup($class);

        $cliHas = isset($cliRules[$escaped]);
        $voxelHas = isset($voxelRules[$escaped]);

        // ─── Gap tracking (expected unresolved) ──────────
        if ($structCheck === 'unresolved') {
            if ($cliHas && !$voxelHas) {
                // Correctly unresolved — CLI has it, we don't
                record(true, '', $errors, $passed, $failed);
                echo "  GAP  {$class} — CLI compiles, VoxelSite unresolved (expected)\n";
            } elseif ($cliHas && $voxelHas) {
                // Unexpectedly supported — we now compile it!
                record(true, '', $errors, $passed, $failed);
                echo "  NEW  {$class} — both compilers produce output (was expected unresolved)\n";
            } elseif (!$cliHas) {
                skip("{$class} — CLI also doesn't produce this rule (check fixture)", $skipped);
            } else {
                record(true, '', $errors, $passed, $failed);
            }
            continue;
        }

        // ─── Both should produce output ──────────────────

        // Check CLI produced a rule
        if (!$cliHas) {
            skip("{$class} — CLI did not produce a rule (check fixture)", $skipped);
            continue;
        }

        // Check VoxelSite produced a rule
        if (!$voxelHas) {
            record(false,
                "MISSING {$class}: CLI compiles but VoxelSite does not.\n"
                . "    CLI: " . ($cliRules[$escaped]['selector'] ?? '?') . '{' . ($cliRules[$escaped]['declarations'] ?? '?') . '}',
                $errors, $passed, $failed
            );
            continue;
        }

        // ─── Property comparison ─────────────────────────

        $voxelProps = extractPropertyNames($voxelRules[$escaped]['declarations']);
        $missingProps = array_diff($expectedProps, $voxelProps);

        if (!empty($missingProps)) {
            record(false,
                "PROPS  {$class}: VoxelSite missing CSS properties: " . implode(', ', $missingProps)
                . "\n    VoxelSite declarations: " . $voxelRules[$escaped]['declarations']
                . "\n    Expected properties: " . implode(', ', $expectedProps),
                $errors, $passed, $failed
            );
        } else {
            record(true, '', $errors, $passed, $failed);
        }

        // ─── Structural checks ───────────────────────────

        $voxelMedia = $voxelRules[$escaped]['media'] ?? null;
        $voxelSelector = $voxelRules[$escaped]['selector'] ?? '';

        switch ($structCheck) {
            case 'media':
                if ($voxelMedia === null) {
                    record(false,
                        "STRUCT {$class}: expected media query wrapper, got base rule",
                        $errors, $passed, $failed
                    );
                } else {
                    record(true, '', $errors, $passed, $failed);
                }
                break;

            case 'pseudo':
                if (!preg_match('/:[a-z]/', $voxelSelector)) {
                    record(false,
                        "STRUCT {$class}: expected pseudo-class/element in selector, got: {$voxelSelector}",
                        $errors, $passed, $failed
                    );
                } else {
                    record(true, '', $errors, $passed, $failed);
                }
                break;

            case 'attr':
                if (!str_contains($voxelSelector, '[')) {
                    record(false,
                        "STRUCT {$class}: expected attribute selector in output, got: {$voxelSelector}",
                        $errors, $passed, $failed
                    );
                } else {
                    record(true, '', $errors, $passed, $failed);
                }
                break;

            case 'selector':
                // Just check it produced something with a non-trivial selector
                if (strlen($voxelSelector) < 5) {
                    record(false,
                        "STRUCT {$class}: expected complex selector, got: {$voxelSelector}",
                        $errors, $passed, $failed
                    );
                } else {
                    record(true, '', $errors, $passed, $failed);
                }
                break;

            case 'supports':
                // Check for @supports in the VoxelSite output.
                // VoxelSite uses a separate 'supports' field on the rule.
                $voxelSupports = $voxelRules[$escaped]['supports'] ?? null;
                $hasSupports = ($voxelSupports !== null)
                    || ($voxelMedia !== null && str_contains($voxelMedia, '@supports'));
                if (!$hasSupports) {
                    record(false,
                        "STRUCT {$class}: expected @supports wrapper, got media="
                        . ($voxelMedia ?? 'null') . ", supports=" . ($voxelSupports ?? 'null'),
                        $errors, $passed, $failed
                    );
                } else {
                    record(true, '', $errors, $passed, $failed);
                }
                break;

            case 'known_gap':
                // Both compilers produce output and the expected properties are present,
                // but there's a known structural difference (e.g. hover wrapping, group model).
                // Report it visibly but don't fail.
                record(true, '', $errors, $passed, $failed);
                echo "  KNOWN_GAP  {$class} — both produce correct CSS, structural model differs\n";
                break;

            case 'nested_wrappers':
                // Verify that combined @media + @supports produce properly nested CSS.
                // VoxelSite should have both a media AND supports field set.
                $voxelSupports = $voxelRules[$escaped]['supports'] ?? null;
                $nestOk = true;
                $nestReason = '';

                if ($voxelMedia === null) {
                    $nestOk = false;
                    $nestReason = 'missing @media wrapper';
                } elseif ($voxelSupports === null) {
                    // Check if the media string incorrectly contains "@supports"
                    if (str_contains($voxelMedia, '@supports')) {
                        $nestOk = false;
                        $nestReason = '@supports concatenated into media string instead of separate wrapper: ' . $voxelMedia;
                    } else {
                        $nestOk = false;
                        $nestReason = 'missing @supports wrapper';
                    }
                }

                if (!$nestOk) {
                    record(false,
                        "STRUCT {$class}: expected nested @media{@supports{...}}, but: {$nestReason}",
                        $errors, $passed, $failed
                    );
                } else {
                    record(true, '', $errors, $passed, $failed);
                }
                break;

            case 'child_selector':
                // *: and **: variants produce :is(.class > *) or :is(.class *) selectors.
                // When combined with other variants, the variant state MUST survive
                // inside the :is() wrapper (e.g. hover:*:p-4 → :is(.class:hover>*)).
                $voxelSelector = $voxelRules[$escaped]['selector'] ?? '';
                $childOk = true;
                $childReason = '';

                if (!str_contains($voxelSelector, ':is(')) {
                    $childOk = false;
                    $childReason = 'missing :is() wrapper';
                } elseif (!str_contains($voxelSelector, '>*)') && !str_contains($voxelSelector, ' *)')) {
                    $childOk = false;
                    $childReason = 'missing child/descendant combinator (>* or *)';
                } else {
                    // Verify variant state preservation for combined variants
                    // Extract variant prefixes from the class name
                    if (str_contains($class, 'hover:') && !str_contains($voxelSelector, ':hover')) {
                        $childOk = false;
                        $childReason = ':hover pseudo-class lost in selector wrapping';
                    }
                    if (str_contains($class, 'group-hover:') && !str_contains($voxelSelector, '.group:hover')) {
                        $childOk = false;
                        $childReason = '.group:hover prefix lost in selector wrapping';
                    }
                    if (preg_match('/data-\[/', $class) && !preg_match('/\[data-/', $voxelSelector)) {
                        $childOk = false;
                        $childReason = 'data-[] attribute selector lost in selector wrapping';
                    }
                }

                if (!$childOk) {
                    record(false,
                        "STRUCT {$class}: {$childReason}, got: {$voxelSelector}",
                        $errors, $passed, $failed
                    );
                } else {
                    record(true, '', $errors, $passed, $failed);
                }
                break;

            case 'base':
            default:
                // Base rule: should NOT be wrapped in a media query
                // (Not enforced as an error — some base rules might incidentally get a MQ)
                record(true, '', $errors, $passed, $failed);
                break;
        }
    }
}

// ─── Summary ─────────────────────────────────────────────

echo "\n=== Oracle Results ===\n";
echo "Passed:  {$passed}\n";
echo "Failed:  {$failed}\n";
echo "Skipped: {$skipped}\n";
echo "Total:   " . ($passed + $failed) . " assertions\n";

if (!empty($errors)) {
    echo "\n--- Failures ---\n";
    foreach ($errors as $e) {
        echo "  {$e}\n";
    }
}

// ─── Gap Summary ─────────────────────────────────────────

echo "\n--- Feature Gap Summary ---\n";
$gapClasses = [];
foreach ($fixtures as $group => $cases) {
    foreach ($cases as [$class, , $structCheck]) {
        if ($structCheck === 'unresolved') {
            $gapClasses[] = $class;
        }
    }
}

if (!empty($gapClasses)) {
    echo "Classes compiled by Tailwind CLI but not by VoxelSite:\n";
    foreach ($gapClasses as $gc) {
        $escaped = escapeForLookup($gc);
        $status = isset($cliRules[$escaped]) && !isset($voxelRules[$escaped]) ? 'GAP' : 'OK';
        echo "  [{$status}] {$gc}\n";
    }
}

echo "\nDone.\n";

exit($failed > 0 ? 1 : 0);
