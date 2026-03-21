<?php

declare(strict_types=1);

/**
 * TailwindCompiler regression suite.
 *
 * Run: php _studio/tests/TailwindCompilerTest.php
 *
 * This suite verifies the local subset compiler's expected behavior:
 * - class extraction from PHP/HTML templates
 * - variant parsing and unsupported-variant handling
 * - ring/shadow/transform composition
 * - unresolved class tracking
 * - core utility regressions
 */

require_once dirname(__DIR__) . '/engine/TailwindConfig.php';
require_once dirname(__DIR__) . '/engine/TailwindCompiler.php';

if (!class_exists('VoxelSite\Logger')) {
    $loggerPath = dirname(__DIR__) . '/engine/Logger.php';
    if (file_exists($loggerPath)) {
        require_once $loggerPath;
    } else {
        eval('namespace VoxelSite; class Logger { public static function __callStatic($m, $a) {} }');
    }
}

use VoxelSite\TailwindCompiler;

$compiler = new TailwindCompiler();
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

function compileCss(array $classes, TailwindCompiler $compiler): string
{
    return $compiler->compileClasses($classes);
}

function assertContainsCss(string $label, string $needle, string $css, array &$errors, int &$passed, int &$failed): void
{
    record(
        str_contains($css, $needle),
        "FAIL {$label}: expected CSS containing '{$needle}' but got: " . trim($css),
        $errors,
        $passed,
        $failed
    );
}

function assertEmptyCss(string $label, string $css, array &$errors, int &$passed, int &$failed): void
{
    record(
        trim($css) === '',
        "FAIL {$label}: expected no CSS but got: " . trim($css),
        $errors,
        $passed,
        $failed
    );
}

function assertUnresolvedContains(string $label, array $expected, TailwindCompiler $compiler, array &$errors, int &$passed, int &$failed): void
{
    $unresolved = $compiler->getUnresolvedClasses();
    foreach ($expected as $class) {
        record(
            in_array($class, $unresolved, true),
            "FAIL {$label}: expected unresolved class '{$class}', got [" . implode(', ', $unresolved) . ']',
            $errors,
            $passed,
            $failed
        );
    }
}

function assertUnresolvedOmits(string $label, array $expectedAbsent, TailwindCompiler $compiler, array &$errors, int &$passed, int &$failed): void
{
    $unresolved = $compiler->getUnresolvedClasses();
    foreach ($expectedAbsent as $class) {
        record(
            !in_array($class, $unresolved, true),
            "FAIL {$label}: '{$class}' should not be unresolved, got [" . implode(', ', $unresolved) . ']',
            $errors,
            $passed,
            $failed
        );
    }
}

function extractClasses(string $html, TailwindCompiler $compiler): array
{
    $method = new ReflectionMethod($compiler, 'extractClassNames');
    $method->setAccessible(true);
    $classes = [];
    $method->invokeArgs($compiler, [$html, &$classes]);
    return array_values(array_unique($classes));
}

function assertExtracted(string $label, string $html, array $expected, array $unexpected, TailwindCompiler $compiler, array &$errors, int &$passed, int &$failed): void
{
    $classes = extractClasses($html, $compiler);

    foreach ($expected as $class) {
        record(
            in_array($class, $classes, true),
            "FAIL {$label}: expected extracted class '{$class}', got [" . implode(', ', $classes) . ']',
            $errors,
            $passed,
            $failed
        );
    }

    foreach ($unexpected as $class) {
        record(
            !in_array($class, $classes, true),
            "FAIL {$label}: unexpected extracted token '{$class}', got [" . implode(', ', $classes) . ']',
            $errors,
            $passed,
            $failed
        );
    }
}

function assertCompileResultUnresolved(TailwindCompiler $compiler, array &$errors, int &$passed, int &$failed): void
{
    $tmpDir = sys_get_temp_dir() . '/tailwind-compiler-test-' . uniqid('', true);
    mkdir($tmpDir, 0755, true);
    // Use a truly unknown variant so it stays unresolved
    file_put_contents($tmpDir . '/index.php', '<div class="flex fantasy-variant:bg-red-500 bg-red-500"></div>');
    $outputPath = $tmpDir . '/tailwind.css';

    $result = $compiler->compile($tmpDir, $outputPath);

    record(
        ($result['unresolved_count'] ?? null) >= 1,
        'FAIL compile(): expected unresolved_count>=1, got ' . var_export($result, true),
        $errors,
        $passed,
        $failed
    );

    record(
        in_array('fantasy-variant:bg-red-500', $result['unresolved_classes'] ?? [], true),
        'FAIL compile(): expected unresolved_classes to include fantasy-variant:bg-red-500, got ' . var_export($result, true),
        $errors,
        $passed,
        $failed
    );

    @unlink($outputPath);
    @unlink($tmpDir . '/index.php');
    @rmdir($tmpDir);
}

echo "=== TailwindCompiler Test Suite ===\n\n";

echo "--- Extraction ---\n";

assertExtracted(
    'php interpolation end',
    '<a href="/" class="nav-cta-link<?= $slug === $link[\'slug\'] ? \' active\' : \'\' ?>">',
    ['nav-cta-link'],
    ['===', '$slug', '$link['],
    $compiler,
    $errors,
    $passed,
    $failed
);

assertExtracted(
    'php interpolation middle',
    '<div class="px-4 <?= $active ? \'text-red-500\' : \'text-blue-500\' ?> py-2"></div>',
    ['px-4', 'py-2'],
    ['==='],
    $compiler,
    $errors,
    $passed,
    $failed
);

assertExtracted(
    'multiline class attribute',
    "<div class=\"\n  px-4\n  py-2\n  text-white\n\"></div>",
    ['px-4', 'py-2', 'text-white'],
    ["px-4\n", "py-2\n"],
    $compiler,
    $errors,
    $passed,
    $failed
);

// :class bindings should NOT be extracted — they contain JS expressions, not class lists
assertExtracted(
    ':class ternary ignored',
    '<div :class="open ? \'block\' : \'hidden\'" class="bg-white"></div>',
    ['bg-white'],
    ['open', 'block', 'hidden'],
    $compiler,
    $errors,
    $passed,
    $failed
);

assertExtracted(
    ':class object ignored',
    '<div :class="{ active: isActive, hidden: !open }" class="p-4"></div>',
    ['p-4'],
    ['active:', 'isActive,', '!open'],
    $compiler,
    $errors,
    $passed,
    $failed
);

assertExtracted(
    ':class array ignored',
    '<div :class="[isActive ? \'flex\' : \'block\', extraClass]" class="mt-2"></div>',
    ['mt-2'],
    ['[isActive', 'extraClass]'],
    $compiler,
    $errors,
    $passed,
    $failed
);

assertExtracted(
    'v-bind:class ignored',
    '<div v-bind:class="dynamicClass" class="gap-4"></div>',
    ['gap-4'],
    ['dynamicClass'],
    $compiler,
    $errors,
    $passed,
    $failed
);

echo "--- Variant Parsing ---\n";

$css = compileCss(['hover:text-red-500'], $compiler);
assertContainsCss('hover variant', ':hover', $css, $errors, $passed, $failed);
assertContainsCss('hover variant', 'color:#ef4444', $css, $errors, $passed, $failed);

$css = compileCss(['md:flex'], $compiler);
assertContainsCss('md variant', '@media (min-width:768px)', $css, $errors, $passed, $failed);
assertContainsCss('md variant', 'display:flex', $css, $errors, $passed, $failed);

$css = compileCss(['hover:bg-[url(https://example.com/img.jpg)]'], $compiler);
assertContainsCss('url arbitrary', 'background-image:url(https://example.com/img.jpg)', $css, $errors, $passed, $failed);
assertContainsCss('url arbitrary', ':hover', $css, $errors, $passed, $failed);

$css = compileCss(['ease-[cubic-bezier(0.16,1,0.3,1)]'], $compiler);
assertContainsCss('ease arbitrary', 'transition-timing-function:cubic-bezier(0.16,1,0.3,1)', $css, $errors, $passed, $failed);

// ── Previously unsupported, now supported variants ──

// aria-expanded:* (named shorthand) → [aria-expanded="true"]
$css = compileCss(['aria-expanded:bg-red-500'], $compiler);
assertContainsCss('aria-expanded shorthand', '[aria-expanded="true"]', $css, $errors, $passed, $failed);
assertContainsCss('aria-expanded shorthand', 'background-color:#ef4444', $css, $errors, $passed, $failed);
assertUnresolvedOmits('aria-expanded shorthand', ['aria-expanded:bg-red-500'], $compiler, $errors, $passed, $failed);

// data-[state=open]:* → [data-state="open"]
$css = compileCss(['data-[state=open]:block'], $compiler);
assertContainsCss('data attr variant', '[data-state="open"]', $css, $errors, $passed, $failed);
assertContainsCss('data attr variant', 'display:block', $css, $errors, $passed, $failed);

// [&>*]:* → arbitrary selector variant
$css = compileCss(['[&>*]:p-4'], $compiler);
assertContainsCss('arbitrary child selector', '>*', $css, $errors, $passed, $failed);
assertContainsCss('arbitrary child selector', 'padding:1rem', $css, $errors, $passed, $failed);

// min-[320px]:* → @media (min-width:320px)
$css = compileCss(['min-[320px]:text-center'], $compiler);
assertContainsCss('min arbitrary mq', '@media (min-width:320px)', $css, $errors, $passed, $failed);
assertContainsCss('min arbitrary mq', 'text-align:center', $css, $errors, $passed, $failed);

// aria-[busy]:* → [aria-busy]
$css = compileCss(['aria-[busy]:opacity-50'], $compiler);
assertContainsCss('aria-[busy]', '[aria-busy]', $css, $errors, $passed, $failed);
assertContainsCss('aria-[busy]', 'opacity:', $css, $errors, $passed, $failed);

// max-[768px]:* → @media not all and (min-width:768px)
$css = compileCss(['max-[768px]:hidden'], $compiler);
assertContainsCss('max arbitrary mq', '@media not all and (min-width:768px)', $css, $errors, $passed, $failed);
assertContainsCss('max arbitrary mq', 'display:none', $css, $errors, $passed, $failed);

// Named max-* breakpoints → @media not all and (min-width:...)
$css = compileCss(['max-sm:hidden'], $compiler);
assertContainsCss('max-sm named', '@media not all and (min-width:640px)', $css, $errors, $passed, $failed);
assertContainsCss('max-sm named', 'display:none', $css, $errors, $passed, $failed);

$css = compileCss(['max-md:flex'], $compiler);
assertContainsCss('max-md named', '@media not all and (min-width:768px)', $css, $errors, $passed, $failed);
assertContainsCss('max-md named', 'display:flex', $css, $errors, $passed, $failed);

$css = compileCss(['max-lg:block'], $compiler);
assertContainsCss('max-lg named', '@media not all and (min-width:1024px)', $css, $errors, $passed, $failed);
assertContainsCss('max-lg named', 'display:block', $css, $errors, $passed, $failed);

// data-[loading]:* (boolean attribute)
$css = compileCss(['data-[loading]:animate-spin'], $compiler);
assertContainsCss('data boolean attr', '[data-loading]', $css, $errors, $passed, $failed);

// [&_p]:* → descendant selector (underscore = space)
$css = compileCss(['[&_p]:text-lg'], $compiler);
assertContainsCss('arbitrary descendant', ' p', $css, $errors, $passed, $failed);
assertContainsCss('arbitrary descendant', 'font-size:1.125rem', $css, $errors, $passed, $failed);

// Truly unknown variants still fail unresolved
foreach (['some-fantasy:flex', 'xyz-variant:block'] as $unknownVariant) {
    $css = compileCss([$unknownVariant], $compiler);
    assertEmptyCss($unknownVariant, $css, $errors, $passed, $failed);
    assertUnresolvedContains($unknownVariant, [$unknownVariant], $compiler, $errors, $passed, $failed);
}

echo "--- Arbitrary Properties ---\n";

// [--scroll-offset:56px] → direct CSS declaration
$css = compileCss(['[--scroll-offset:56px]'], $compiler);
assertContainsCss('arbitrary prop', '--scroll-offset:56px', $css, $errors, $passed, $failed);

// [mask-type:luminance] → mask-type:luminance
$css = compileCss(['[mask-type:luminance]'], $compiler);
assertContainsCss('arbitrary prop std', 'mask-type:luminance', $css, $errors, $passed, $failed);

// Bracket class with NO colon should not resolve
$css = compileCss(['[some-invalid-thing]'], $compiler);
assertEmptyCss('[some-invalid-thing]', $css, $errors, $passed, $failed);

echo "--- Content Utility ---\n";

// content-[attr(data-label)] → --tw-content:attr(data-label);content:var(--tw-content)
$css = compileCss(['content-[attr(data-label)]'], $compiler);
assertContainsCss('content arbitrary', '--tw-content:attr(data-label)', $css, $errors, $passed, $failed);
assertContainsCss('content arbitrary', 'content:var(--tw-content)', $css, $errors, $passed, $failed);

echo "--- has/not/supports Variants ---\n";

// has-[>img]:rounded-lg → :has(>img)
$css = compileCss(['has-[>img]:rounded-lg'], $compiler);
assertContainsCss('has variant', ':has(>img)', $css, $errors, $passed, $failed);
assertContainsCss('has variant', 'border-radius:', $css, $errors, $passed, $failed);

// not-[.hidden]:block → :not(.hidden)
$css = compileCss(['not-[.hidden]:block'], $compiler);
assertContainsCss('not variant', ':not(.hidden)', $css, $errors, $passed, $failed);
assertContainsCss('not variant', 'display:block', $css, $errors, $passed, $failed);

// supports-[display:grid]:grid → @supports (display:grid) wrapper
$css = compileCss(['supports-[display:grid]:grid'], $compiler);
assertContainsCss('supports variant', '@supports (display:grid)', $css, $errors, $passed, $failed);
assertContainsCss('supports variant', 'display:grid', $css, $errors, $passed, $failed);

echo "--- Combined @media + @supports Nesting ---\n";

// md:supports-[display:grid]:grid → @media (min-width:768px){@supports (display:grid){...}}
$css = compileCss(['md:supports-[display:grid]:grid'], $compiler);
assertContainsCss('media+supports', '@media (min-width:768px){', $css, $errors, $passed, $failed);
assertContainsCss('media+supports', '@supports (display:grid){', $css, $errors, $passed, $failed);
assertContainsCss('media+supports', 'display:grid', $css, $errors, $passed, $failed);
// Ensure NO invalid concatenation like "and @supports"
$badConcat = str_contains($css, 'and @supports');
record(!$badConcat, 'media+supports: found invalid "and @supports" concatenation: ' . $css, $errors, $passed, $failed);

// dark:supports-[display:grid]:grid → @media (prefers-color-scheme:dark){@supports (display:grid){...}}
$css = compileCss(['dark:supports-[display:grid]:grid'], $compiler);
assertContainsCss('dark+supports', '@media (prefers-color-scheme:dark){', $css, $errors, $passed, $failed);
assertContainsCss('dark+supports', '@supports (display:grid){', $css, $errors, $passed, $failed);

// supports-only → @supports wrapper without @media
$css = compileCss(['supports-[display:grid]:flex'], $compiler);
assertContainsCss('supports-only', '@supports (display:grid){', $css, $errors, $passed, $failed);
$hasMedia = str_contains($css, '@media');
record(!$hasMedia, 'supports-only: unexpected @media wrapper: ' . $css, $errors, $passed, $failed);

echo "--- 3D Transforms ---\n";

// Static 3D utilities
$css = compileCss(['backface-hidden'], $compiler);
assertContainsCss('backface-hidden', 'backface-visibility:hidden', $css, $errors, $passed, $failed);

$css = compileCss(['backface-visible'], $compiler);
assertContainsCss('backface-visible', 'backface-visibility:visible', $css, $errors, $passed, $failed);

$css = compileCss(['transform-3d'], $compiler);
assertContainsCss('transform-3d', 'transform-style:preserve-3d', $css, $errors, $passed, $failed);

$css = compileCss(['perspective-none'], $compiler);
assertContainsCss('perspective-none', 'perspective:none', $css, $errors, $passed, $failed);

$css = compileCss(['perspective-500'], $compiler);
assertContainsCss('perspective-500', 'perspective:500px', $css, $errors, $passed, $failed);

$css = compileCss(['perspective-[800px]'], $compiler);
assertContainsCss('perspective arb', 'perspective:800px', $css, $errors, $passed, $failed);

$css = compileCss(['perspective-origin-center'], $compiler);
assertContainsCss('perspective-origin', 'perspective-origin:center', $css, $errors, $passed, $failed);

// 3D rotation axes — compose via --tw-rotate-x/y/z variables
$css = compileCss(['rotate-x-45'], $compiler);
assertContainsCss('rotate-x-45', '--tw-rotate-x:rotateX(45deg)', $css, $errors, $passed, $failed);
assertContainsCss('rotate-x-45', 'transform:', $css, $errors, $passed, $failed);

$css = compileCss(['rotate-y-90'], $compiler);
assertContainsCss('rotate-y-90', '--tw-rotate-y:rotateY(90deg)', $css, $errors, $passed, $failed);

$css = compileCss(['rotate-z-12'], $compiler);
assertContainsCss('rotate-z-12', '--tw-rotate-z:rotateZ(12deg)', $css, $errors, $passed, $failed);

// 2D rotate uses CSS rotate: property (TW4 model)
$css = compileCss(['rotate-45'], $compiler);
assertContainsCss('rotate-45 2d', 'rotate:45deg', $css, $errors, $passed, $failed);

// translate-z uses CSS translate property
$css = compileCss(['translate-z-4'], $compiler);
assertContainsCss('translate-z-4', '--tw-translate-z:1rem', $css, $errors, $passed, $failed);
assertContainsCss('translate-z-4', 'translate:', $css, $errors, $passed, $failed);

echo "--- Universal Child/Descendant Variants ---\n";

// *:p-4 → :is(.class > *){padding:1rem}
$css = compileCss(['*:p-4'], $compiler);
assertContainsCss('*:p-4', ':is(', $css, $errors, $passed, $failed);
assertContainsCss('*:p-4', '>*)', $css, $errors, $passed, $failed);
assertContainsCss('*:p-4', 'padding:1rem', $css, $errors, $passed, $failed);

// **:text-sm → :is(.class *){font-size:...}
$css = compileCss(['**:text-sm'], $compiler);
assertContainsCss('**:text-sm', ':is(', $css, $errors, $passed, $failed);
assertContainsCss('**:text-sm', ' *)', $css, $errors, $passed, $failed);
assertContainsCss('**:text-sm', 'font-size:', $css, $errors, $passed, $failed);

// Combined *: with other variants — must preserve variant semantics inside :is()
$css = compileCss(['hover:*:p-4'], $compiler);
assertContainsCss('hover:*:p-4', ':hover', $css, $errors, $passed, $failed);
assertContainsCss('hover:*:p-4', '>*)', $css, $errors, $passed, $failed);
assertContainsCss('hover:*:p-4', 'padding:1rem', $css, $errors, $passed, $failed);

$css = compileCss(['data-[state=open]:*:p-4'], $compiler);
assertContainsCss('data+*:', '[data-state=', $css, $errors, $passed, $failed);
assertContainsCss('data+*:', '>*)', $css, $errors, $passed, $failed);

$css = compileCss(['group-hover:*:opacity-100'], $compiler);
assertContainsCss('group-hover:*:', '.group:hover', $css, $errors, $passed, $failed);
assertContainsCss('group-hover:*:', '>*)', $css, $errors, $passed, $failed);
assertContainsCss('group-hover:*:', 'opacity:1', $css, $errors, $passed, $failed);

echo "--- Ring And Shadow Composition ---\n";

$css = compileCss(['ring-2'], $compiler);
assertContainsCss('ring width', '--tw-ring-shadow:', $css, $errors, $passed, $failed);
assertContainsCss('ring width', 'box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow,0 0 #0000)', $css, $errors, $passed, $failed);

$css = compileCss(['ring-red-500'], $compiler);
assertContainsCss('ring color', '--tw-ring-color:#ef4444', $css, $errors, $passed, $failed);

$css = compileCss(['shadow-lg'], $compiler);
assertContainsCss('shadow size', '--tw-shadow:', $css, $errors, $passed, $failed);
assertContainsCss('shadow size', 'var(--tw-ring-shadow,0 0 #0000)', $css, $errors, $passed, $failed);
assertContainsCss('shadow size', 'var(--tw-shadow-color', $css, $errors, $passed, $failed);

$css = compileCss(['shadow-red-500'], $compiler);
assertContainsCss('shadow color', '--tw-shadow-color:#ef4444', $css, $errors, $passed, $failed);

$css = compileCss(['shadow-lg', 'ring-2', 'ring-red-500'], $compiler);
assertContainsCss('shadow ring combo', '--tw-shadow:', $css, $errors, $passed, $failed);
assertContainsCss('shadow ring combo', '--tw-ring-shadow:', $css, $errors, $passed, $failed);
assertContainsCss('shadow ring combo', '--tw-ring-color:#ef4444', $css, $errors, $passed, $failed);

echo "--- Transform Composition ---\n";

$css = compileCss(['transform-gpu'], $compiler);
assertContainsCss('transform gpu', 'translateZ(0)', $css, $errors, $passed, $failed);

$css = compileCss(['transform-cpu'], $compiler);
assertContainsCss('transform cpu', 'transform:none', $css, $errors, $passed, $failed);

// TW4 individual CSS property model: translate, rotate, scale are separate properties
$css = compileCss(['translate-x-4'], $compiler);
assertContainsCss('translate-x individual', 'translate:', $css, $errors, $passed, $failed);
assertContainsCss('translate-x individual', '--tw-translate-x:1rem', $css, $errors, $passed, $failed);

$css = compileCss(['scale-105'], $compiler);
assertContainsCss('scale individual', 'scale:', $css, $errors, $passed, $failed);
assertContainsCss('scale individual', '--tw-scale-x:1.05', $css, $errors, $passed, $failed);

// Mixed 2D + 3D: rotate:45deg (2D) + rotate-x-45 transform: (3D) should NOT conflict
// because `rotate:` and `transform:` are separate CSS properties
$css = compileCss(['rotate-45', 'rotate-x-45'], $compiler);
assertContainsCss('2d+3d rotate', 'rotate:45deg', $css, $errors, $passed, $failed);
assertContainsCss('2d+3d rotate', 'rotateX(45deg)', $css, $errors, $passed, $failed);
record(!str_contains($css, 'rotate:45deg') || !str_contains($css, 'rotateX(45deg)') ? false : true,
    '2d+3d rotate: both rotate: and transform: should coexist', $errors, $passed, $failed);

// Mixed translate-x (translate:) + translate-z (translate:) — same CSS property, composes via vars
$css = compileCss(['translate-x-4', 'translate-z-4'], $compiler);
assertContainsCss('mixed translate', '--tw-translate-x:1rem', $css, $errors, $passed, $failed);
assertContainsCss('mixed translate', '--tw-translate-z:1rem', $css, $errors, $passed, $failed);

echo "--- Unresolved Tracking ---\n";

$css = compileCss(['flex', 'totally-fake-class-xyz', 'bg-red-500', 'another-fake-999'], $compiler);
assertContainsCss('resolved utility still compiles', 'display:flex', $css, $errors, $passed, $failed);
assertUnresolvedContains('mixed class list', ['totally-fake-class-xyz', 'another-fake-999'], $compiler, $errors, $passed, $failed);
assertUnresolvedOmits('mixed class list', ['flex', 'bg-red-500'], $compiler, $errors, $passed, $failed);

// compile() write-failure propagation: compile to an impossible path
$impossibleDir = '/proc/does-not-exist-' . uniqid('', true);
$impossiblePath = $impossibleDir . '/tailwind.css';
$tmpScanDir = sys_get_temp_dir() . '/tailwind-write-test-' . uniqid('', true);
mkdir($tmpScanDir, 0755, true);
file_put_contents($tmpScanDir . '/index.php', '<div class="flex"></div>');
$result = $compiler->compile($tmpScanDir, $impossiblePath);
record(
    ($result['ok'] ?? true) === false,
    'FAIL compile() write-failure: expected ok=false, got ' . var_export($result['ok'] ?? null, true),
    $errors, $passed, $failed
);
@unlink($tmpScanDir . '/index.php');
@rmdir($tmpScanDir);

// compile() integration test with unresolved tracking
assertCompileResultUnresolved($compiler, $errors, $passed, $failed);

echo "--- Deterministic Ordering ---\n";

// Verify that output is the same regardless of input order
$classesA = ['text-white', 'flex', 'p-4', 'bg-red-500', 'transition-all', 'z-50'];
$classesB = array_reverse($classesA);
$cssA = compileCss($classesA, $compiler);
$cssB = compileCss($classesB, $compiler);
record(
    $cssA === $cssB,
    "FAIL deterministic: different input order produced different CSS\n    A: " . trim($cssA) . "\n    B: " . trim($cssB),
    $errors, $passed, $failed
);

// Verify ordering follows layer convention (layout before spacing before typography)
// display:flex (100) should appear before padding:1rem (300) which should appear before font-size (500)
$orderedCss = compileCss(['text-lg', 'p-4', 'flex'], $compiler);
$posDisplay = strpos($orderedCss, 'display:flex');
$posPadding = strpos($orderedCss, 'padding:1rem');
$posFontSize = strpos($orderedCss, 'font-size:1.125rem');
record(
    $posDisplay !== false && $posPadding !== false && $posFontSize !== false
    && $posDisplay < $posPadding && $posPadding < $posFontSize,
    'FAIL ordering: expected display < padding < font-size in output, got display@' . $posDisplay . ' padding@' . $posPadding . ' font-size@' . $posFontSize,
    $errors, $passed, $failed
);

// Verify deterministic ordering across arbitrary media queries too
$mqClassesA = ['min-[320px]:text-center', 'max-[600px]:bg-red-500'];
$mqClassesB = array_reverse($mqClassesA);
$mqCssA = compileCss($mqClassesA, $compiler);
$mqCssB = compileCss($mqClassesB, $compiler);
record(
    $mqCssA === $mqCssB,
    "FAIL arbitrary MQ determinism: different input order produced different CSS\n    A: " . trim($mqCssA) . "\n    B: " . trim($mqCssB),
    $errors, $passed, $failed
);

echo "--- Core Regressions ---\n";

foreach ([
    ['p-4', 'padding:1rem'],
    ['mt-8', 'margin-top:2rem'],
    ['mx-auto', 'margin-left:auto'],
    ['gap-6', 'gap:1.5rem'],
    ['w-full', 'width:100%'],
    ['h-screen', 'height:100vh'],
    ['text-lg', 'font-size:1.125rem'],
    ['font-bold', 'font-weight:700'],
    ['bg-red-500', 'background-color:#ef4444'],
    ['text-white', 'color:#fff'],
    ['flex', 'display:flex'],
    ['grid', 'display:grid'],
    ['relative', 'position:relative'],
    ['rounded-full', 'border-radius:9999px'],
    ['transition-all', 'transition-property:all'],
    ['duration-300', 'transition-duration:300ms'],
    ['translate-x-4', '--tw-translate-x:1rem'],
    ['scale-105', '--tw-scale-x:1.05'],
    ['rotate-45', 'rotate:45deg'],
    ['-mt-4', 'margin-top:-1rem'],
    ['p-[2.5rem]', 'padding:2.5rem'],
    ['bg-[#1a1a2e]', 'background-color:#1a1a2e'],
    ['bg-red-500/50', 'color-mix'],
    ['bg-gradient-to-r', 'linear-gradient(to right'],
    ['from-blue-500', '--tw-gradient-from:#3b82f6'],
    ['blur-lg', '--tw-blur:blur(16px)'],
    ['!mt-4', 'margin-top:1rem!important'],
    ['grid-cols-3', 'grid-template-columns:repeat(3,minmax(0,1fr))'],
    ['animate-spin', 'animation:spin 1s linear infinite'],
    // Font: semantic aliases (foundation tokens)
    ['font-heading', 'font-family:var(--font-heading)'],
    ['font-body', 'font-family:var(--font-body)'],
    ['font-accent', 'font-family:var(--font-accent)'],
    // Font: arbitrary font-family (AI-generated Google Font names)
    ["font-['Cormorant_Garamond']", "font-family:'Cormorant Garamond'"],
    ["font-['Playfair_Display']", "font-family:'Playfair Display'"],
    ["font-['Inter']", "font-family:'Inter'"],
] as [$class, $expected]) {
    $css = compileCss([$class], $compiler);
    assertContainsCss($class, $expected, $css, $errors, $passed, $failed);
}

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
