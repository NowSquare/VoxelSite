<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * PHP-based Tailwind CSS compiler for generated websites.
 *
 * Scans PHP/HTML files for Tailwind utility classes and produces
 * a compiled CSS file containing only the utilities actually used.
 * No Node.js. No binary. No CDN. Pure PHP.
 *
 * Integrates with style.css design tokens via theme-mapped
 * shortcuts (e.g. bg-primary-500 → var(--c-primary-500)).
 *
 * Called after every AI response that modifies files:
 *   ResponseParser → FileManager → TailwindCompiler → preview refresh
 */
class TailwindCompiler
{
    // Composed CSS function strings — single source of truth for composition
    // 3D transform/skew composition: rotate-x/y/z + skew-x/y share the `transform:` property.
    // 2D rotate uses `rotate:`, translate uses `translate:`, scale uses `scale:` (individual CSS props).
    private const COMPOSED_TRANSFORM_3D = 'var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,)';
    private const COMPOSED_FILTER = 'var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)';
    private const COMPOSED_BACKDROP = 'var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,)';
    private const COMPOSED_BOX_SHADOW = 'var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow,0 0 #0000)';

    /**
     * Preflight CSS resets — prepended to every compiled tailwind.css.
     *
     * These ensure browser defaults don't interfere with Tailwind utility classes.
     * Baked into the compiler so they're guaranteed regardless of AI output.
     */
    private const PREFLIGHT_RESETS = <<<'CSS'
/* Preflight resets */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
a{color:inherit;text-decoration:none}
ul,ol{list-style:none;margin:0;padding:0}
img,svg,video,canvas{display:block;max-width:100%}
h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}
button,input,select,textarea{font:inherit;color:inherit}
table{border-collapse:collapse;border-spacing:0}
CSS;

    private array $spacingScale;
    private array $fractionScale;
    private array $opacityScale;
    private array $themeColors;
    private array $semanticAliases;
    private array $textSizes;
    private array $fontWeights;
    private array $borderRadiusScale;
    private array $shadowScale;
    private array $unresolvedClasses = [];
    private array $staticUtilities;
    private array $arbitraryPrefixMap;
    private array $scaleValues;
    private array $rotateValues;
    private array $skewValues;
    private array $usedAnimations = [];

    public function __construct()
    {
        $this->spacingScale      = TailwindConfig::spacingScale();
        $this->fractionScale     = TailwindConfig::fractionScale();
        $this->opacityScale      = TailwindConfig::opacityScale();
        $this->themeColors       = TailwindConfig::themeColors();
        $this->semanticAliases   = TailwindConfig::semanticAliases();
        $this->textSizes         = TailwindConfig::textSizes();
        $this->fontWeights       = TailwindConfig::fontWeights();
        $this->borderRadiusScale = TailwindConfig::borderRadiusScale();
        $this->shadowScale       = TailwindConfig::shadowScale();
        $this->staticUtilities   = TailwindConfig::staticUtilities();
        $this->arbitraryPrefixMap = TailwindConfig::arbitraryPrefixMap();
        $this->scaleValues       = TailwindConfig::scaleValues();
        $this->rotateValues      = TailwindConfig::rotateValues();
        $this->skewValues        = TailwindConfig::skewValues();

        // Dynamically register color tokens from style.css (or foundation.css fallback).
        // AI models define custom properties like --color-primary, --color-dark-800, etc.
        // We parse these and add them as Tailwind theme colors so classes like
        // bg-primary, text-dark-800, from-primary/30, etc. resolve correctly.
        $this->registerThemeColors();
    }

    /**
     * Parse CSS files for --color-* custom properties and register
     * them as theme colors so Tailwind classes resolve correctly.
     *
     * Reads from style.css (primary) with foundation.css fallback
     * for backward compatibility with older sites.
     *
     * E.g. --color-primary → theme color "primary" = var(--color-primary)
     *      --color-dark-800 → theme color "dark-800" = var(--color-dark-800)
     */
    private function registerThemeColors(): void
    {
        $basePath = dirname(__DIR__, 2) . '/assets/css/';
        // Resolve symlinks (Forge/Envoyer shared directories)
        $resolvedBase = realpath($basePath);
        if ($resolvedBase !== false) {
            $basePath = rtrim($resolvedBase, '/') . '/';
        }
        $css = '';

        // Primary source: style.css (new architecture)
        if (file_exists($basePath . 'style.css')) {
            $css .= file_get_contents($basePath . 'style.css') ?: '';
        }

        // Fallback: foundation.css (backward compat for existing sites)
        if (file_exists($basePath . 'foundation.css')) {
            $css .= file_get_contents($basePath . 'foundation.css') ?: '';
        }

        if ($css === '') {
            return;
        }

        // Match all --color-* custom properties.
        // These OVERRIDE the TailwindConfig defaults (which use --c-* prefix).
        if (preg_match_all('/--color-([a-zA-Z0-9_-]+)\s*:/', $css, $matches)) {
            foreach ($matches[1] as $name) {
                $this->themeColors[$name] = "var(--color-{$name})";
            }
        }
    }

    /**
     * Compile Tailwind CSS from preview files.
     *
     * Scans _studio/preview/ for PHP files, extracts Tailwind classes,
     * resolves them to CSS, and writes assets/css/tailwind.css.
     *
     * @return array{ok: bool, class_count: int} Compilation result
     */
    public function compile(?string $scanDir = null, ?string $outputPath = null): array
    {
        $explicitOutput = $outputPath !== null;
        $scanDir    = $scanDir ?? dirname(__DIR__) . '/preview';
        $outputPath = $outputPath ?? dirname(__DIR__, 2) . '/assets/css/tailwind.css';

        // Resolve symlinks so Forge/Envoyer shared directories work
        $resolvedScan = realpath($scanDir);
        if ($resolvedScan !== false) {
            $scanDir = $resolvedScan;
        }

        // Resolve the output directory only when using the DEFAULT path.
        // When the caller explicitly passes an output path (e.g. during
        // publish to the docroot), respect it literally — the whole point
        // is to write to that specific location, not follow symlinks away.
        if (!$explicitOutput) {
            $outputDir = dirname($outputPath);
            $resolvedOutputDir = realpath($outputDir);
            if ($resolvedOutputDir !== false) {
                $outputPath = $resolvedOutputDir . '/' . basename($outputPath);
            }
        }

        if (!is_dir($scanDir)) {
            Logger::warning('tailwind', 'Scan directory does not exist', [
                'scanDir'  => $scanDir,
                'realpath' => realpath($scanDir),
            ]);
            return ['ok' => false, 'class_count' => 0];
        }

        // Log what files exist in the scan directory
        $fileList = [];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($scanDir, \FilesystemIterator::SKIP_DOTS | \FilesystemIterator::FOLLOW_SYMLINKS)
        );
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $fileList[] = str_replace($scanDir . '/', '', $file->getPathname()) . ' (' . $file->getSize() . 'b)';
            }
        }

        $classes = $this->scanDirectory($scanDir);

        Logger::debug('tailwind', 'Compile scan results', [
            'scanDir'     => $scanDir,
            'realpath'    => realpath($scanDir),
            'outputPath'  => $outputPath,
            'files_found' => $fileList,
            'file_count'  => count($fileList),
            'class_count' => count($classes),
            'classes_sample' => array_slice($classes, 0, 20),
        ]);

        if (empty($classes)) {
            // Write resets even with no utility classes
            $written = $this->writeOutput($outputPath, self::PREFLIGHT_RESETS);
            return ['ok' => $written, 'class_count' => 0, 'css_size' => strlen(self::PREFLIGHT_RESETS)];
        }

        $css = $this->compileClasses($classes);
        $fullCss = self::PREFLIGHT_RESETS . "\n" . $css;
        $written = $this->writeOutput($outputPath, $fullCss);

        Logger::debug('tailwind', 'Compile output', [
            'class_count'    => count($classes),
            'css_length'     => strlen($css),
            'total_length'   => strlen($fullCss),
            'outputPath'     => $outputPath,
        ]);

        // Log unresolved classes so teams can identify unsupported Tailwind usage
        $unresolvedClasses = $this->getUnresolvedClasses();
        if (!empty($unresolvedClasses)) {
            Logger::info('tailwind', 'Unresolved Tailwind classes (not compiled to CSS)', [
                'count'   => count($unresolvedClasses),
                'classes' => array_slice($unresolvedClasses, 0, 50),
            ]);
        }

        return [
            'ok'                 => $written,
            'class_count'        => count($classes),
            'css_size'           => strlen($fullCss),
            'unresolved_classes' => $unresolvedClasses,
            'unresolved_count'   => count($unresolvedClasses),
        ];
    }

    /**
     * Compile a set of class names to CSS string.
     * Useful for testing.
     */
    public function compileClasses(array $classes): string
    {
        $this->usedAnimations = [];
        $this->unresolvedClasses = [];
        $resolved = [];
        foreach ($classes as $rawClass) {
            $rule = $this->resolveClass($rawClass);
            if ($rule !== null) {
                $key = $rule['selector'] . ($rule['media'] ?? '');
                if (!isset($resolved[$key])) {
                    $resolved[$key] = $rule;
                }
            } else {
                // Track classes that couldn't be resolved
                $this->unresolvedClasses[$rawClass] = true;
            }
        }
        $css = $this->buildCSS($resolved);

        // Append keyframes for used animations
        $keyframes = TailwindConfig::animationKeyframes();
        foreach ($this->usedAnimations as $name => $_) {
            if (isset($keyframes[$name])) {
                $css .= $keyframes[$name];
            }
        }
        return $css;
    }

    /**
     * Get classes that could not be resolved during the last compile.
     *
     * @return string[]
     */
    public function getUnresolvedClasses(): array
    {
        return array_keys($this->unresolvedClasses);
    }

    // ── Scanning ──────────────────────────────────────────────

    private function scanDirectory(string $dir): array
    {
        $classes = [];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS | \FilesystemIterator::FOLLOW_SYMLINKS)
        );
        foreach ($iterator as $file) {
            if (!$file->isFile()) continue;
            $ext = strtolower($file->getExtension());
            if (!in_array($ext, ['php', 'html', 'blade', 'htm'], true)) continue;
            $content = file_get_contents($file->getPathname());
            if ($content !== false) {
                $this->extractClassNames($content, $classes);
            }
        }
        return array_unique($classes);
    }

    private function extractClassNames(string $content, array &$classes): void
    {
        foreach ($this->extractClassAttributeValues($content) as $classString) {
            foreach ($this->tokenizeClassString($classString) as $name) {
                $classes[] = $name;
            }
        }
    }

    /**
     * Extract raw class attribute values while treating template blocks as opaque.
     *
     * Matches only static `class="..."` attributes. Does NOT match `:class`,
     * `v-bind:class`, or Alpine `x-bind:class` — those contain JS expressions,
     * not space-delimited class lists.
     *
     * @return string[]
     */
    private function extractClassAttributeValues(string $content): array
    {
        $values = [];
        if (!preg_match_all('/(?<![\w:\-])class\s*=\s*(["\'])/i', $content, $matches, PREG_OFFSET_CAPTURE)) {
            return $values;
        }

        foreach ($matches[0] as $index => [$fullMatch, $offset]) {
            $quote = $matches[1][$index][0];
            $valueStart = $offset + strlen($fullMatch);
            [$value] = $this->readQuotedAttributeValue($content, $valueStart, $quote);
            if ($value !== '') {
                $values[] = $value;
            }
        }

        return $values;
    }

    /**
     * Read a quoted attribute value, replacing template blocks with spaces so
     * later tokenization still sees surrounding classes.
     *
     * @return array{0: string, 1: int}
     */
    private function readQuotedAttributeValue(string $content, int $offset, string $quote): array
    {
        $value = '';
        $len = strlen($content);

        for ($i = $offset; $i < $len; $i++) {
            if (substr($content, $i, 2) === '<?') {
                $value .= ' ';
                $end = strpos($content, '?>', $i + 2);
                if ($end === false) {
                    break;
                }
                $i = $end + 1;
                continue;
            }

            if (substr($content, $i, 3) === '{!!') {
                $value .= ' ';
                $end = strpos($content, '!!}', $i + 3);
                if ($end === false) {
                    break;
                }
                $i = $end + 2;
                continue;
            }

            if (substr($content, $i, 2) === '{{') {
                $value .= ' ';
                $end = strpos($content, '}}', $i + 2);
                if ($end === false) {
                    break;
                }
                $i = $end + 1;
                continue;
            }

            if ($content[$i] === $quote) {
                return [$value, $i];
            }

            $value .= $content[$i];
        }

        return [$value, $len];
    }

    /**
     * Tokenize a raw class string into candidate Tailwind class names.
     *
     * @return string[]
     */
    private function tokenizeClassString(string $classString): array
    {
        $tokens = preg_split('/\s+/', trim($classString), -1, PREG_SPLIT_NO_EMPTY);
        if ($tokens === false) {
            return [];
        }

        $classes = [];
        foreach ($tokens as $name) {
            $name = trim($name);
            if ($name === '' || strlen($name) > 200) {
                continue;
            }

            if (!preg_match('/^[a-zA-Z0-9!@_\-\[]/', $name)) {
                continue;
            }

            if (str_contains($name, '<?') || str_contains($name, '{{') || str_contains($name, '{!!')) {
                continue;
            }

            if ($name[0] === '{' || $name[0] === '$') {
                continue;
            }

            if (preg_match('/^[=!<>?|&:]+$/', $name)) {
                continue;
            }

            $classes[] = $name;
        }

        return $classes;
    }

    // ── Tokenizer ─────────────────────────────────────────────

    /**
     * Split a raw class name into variant prefixes and the base utility.
     *
     * Unlike a simple explode(':'), this tokenizer tracks bracket depth
     * ([...]) and parenthesis depth ((...)) so that colons inside
     * arbitrary values and URLs are never treated as variant separators.
     *
     * Examples:
     *   'hover:bg-red-500'                  → [['hover'], 'bg-red-500']
     *   'bg-[url(https://x.com/a.jpg)]'     → [[], 'bg-[url(https://x.com/a.jpg)]']
     *   'hover:bg-[url(https://x.com/a)]'   → [['hover'], 'bg-[url(https://x.com/a)]']
     *   'min-[320px]:text-center'            → [['min-[320px]'], 'text-center']
     *   '[&>*]:p-4'                          → [['[&>*]'], 'p-4']
     *   'data-[state=open]:bg-red-500'       → [['data-[state=open]'], 'bg-red-500']
     *   'dark:md:flex'                       → [['dark','md'], 'flex']
     *
     * @return array{0: string[], 1: string} [variants[], utility]
     */
    private function splitVariantsAndUtility(string $rawClass): array
    {
        $parts = [];
        $current = '';
        $bracketDepth = 0;
        $parenDepth = 0;

        for ($i = 0, $len = strlen($rawClass); $i < $len; $i++) {
            $ch = $rawClass[$i];

            if ($ch === '[') {
                $bracketDepth++;
            } elseif ($ch === ']') {
                $bracketDepth = max(0, $bracketDepth - 1);
            } elseif ($ch === '(') {
                $parenDepth++;
            } elseif ($ch === ')') {
                $parenDepth = max(0, $parenDepth - 1);
            }

            // Only split on ':' when we're at the top level
            if ($ch === ':' && $bracketDepth === 0 && $parenDepth === 0) {
                $parts[] = $current;
                $current = '';
            } else {
                $current .= $ch;
            }
        }

        // Last segment is always the utility
        if (count($parts) === 0) {
            return [[], $current];
        }

        return [$parts, $current];
    }

    // ── Resolution Pipeline ───────────────────────────────────

    /**
     * Resolve a raw class (possibly with prefixes) to a CSS rule.
     *
     * Handles responsive (md:), max-width (max-md:), dark mode (dark:),
     * state variants (hover:), pseudo-elements (before:, after:, placeholder:),
     * group variants (group-hover:), peer variants (peer-hover:),
     * important modifier (!), opacity modifier (/50),
     * negative values (-mt-4), and child selectors (space-x, divide).
     *
     * @return array{selector: string, declarations: string, media: ?string}|null
     */
    private function resolveClass(string $rawClass): ?array
    {
        $mediaQuery = null;
        $supportsQuery = null;
        $pseudoSelector = '';
        $selectorPrefix = '';
        $selectorWrapper = null; // 'child' for *:, 'descendant' for **:
        $important = false;
        $utility = $rawClass;

        // Handle !important modifier: !mt-4 or hover:!mt-4
        if (str_starts_with($utility, '!')) {
            $important = true;
            $utility = substr($utility, 1);
        }

        // Split into variant prefixes + base utility using bracket-aware tokenizer
        [$variantPrefixes, $utility] = $this->splitVariantsAndUtility($utility);

        // Check if utility itself has ! (for hover:!mt-4)
        if (str_starts_with($utility, '!')) {
            $important = true;
            $utility = substr($utility, 1);
        }

        foreach ($variantPrefixes as $prefix) {
            $mq = null;
            // ── Named breakpoints ──
            if (isset(TailwindConfig::BREAKPOINTS[$prefix])) {
                $mq = '(min-width:' . TailwindConfig::BREAKPOINTS[$prefix] . ')';
            // Named max-* breakpoints: "not all and (min-width:...)" (Tailwind 4 model)
            } elseif (isset(TailwindConfig::MAX_BREAKPOINTS[$prefix])) {
                $mq = 'not all and (min-width:' . TailwindConfig::MAX_BREAKPOINTS[$prefix] . ')';
            // ── Preference media queries ──
            } elseif ($prefix === 'dark') {
                $mq = '(prefers-color-scheme:dark)';
            } elseif ($prefix === 'print') {
                $mq = 'print';
            } elseif ($prefix === 'motion-safe') {
                $mq = '(prefers-reduced-motion:no-preference)';
            } elseif ($prefix === 'motion-reduce') {
                $mq = '(prefers-reduced-motion:reduce)';
            } elseif ($prefix === 'contrast-more') {
                $mq = '(prefers-contrast:more)';
            } elseif ($prefix === 'contrast-less') {
                $mq = '(prefers-contrast:less)';
            // ── Named state variants (pseudo-classes/elements) ──
            } elseif (isset(TailwindConfig::STATE_VARIANTS[$prefix])) {
                $pseudoSelector .= TailwindConfig::STATE_VARIANTS[$prefix];
            // ── Group/peer context variants ──
            } elseif (isset(TailwindConfig::GROUP_VARIANTS[$prefix])) {
                $selectorPrefix = TailwindConfig::GROUP_VARIANTS[$prefix] . ' ';
            } elseif (isset(TailwindConfig::PEER_VARIANTS[$prefix])) {
                $selectorPrefix = TailwindConfig::PEER_VARIANTS[$prefix];
            // ── Arbitrary min-[]/max-[] container/media queries ──
            //    min-[320px]:* → @media (min-width:320px)
            //    max-[768px]:* → @media (max-width:768px)
            } elseif (preg_match('/^min-\[(.+)\]$/', $prefix, $m)) {
                $mq = '(min-width:' . $m[1] . ')';
            // max-[768px]:* → @media not all and (min-width:768px)
            // Tailwind 4 uses this form to avoid the 1px overlap issue at exact breakpoint values.
            } elseif (preg_match('/^max-\[(.+)\]$/', $prefix, $m)) {
                $mq = 'not all and (min-width:' . $m[1] . ')';
            // ── data-[attr] / data-[attr=value] variants ──
            //    data-[state=open]:* → [data-state="open"]
            //    data-[loading]:*    → [data-loading]
            } elseif (preg_match('/^data-\[(.+)\]$/', $prefix, $m)) {
                $attrExpr = $m[1];
                if (str_contains($attrExpr, '=')) {
                    [$attrName, $attrVal] = explode('=', $attrExpr, 2);
                    $pseudoSelector .= '[data-' . $attrName . '="' . $attrVal . '"]';
                } else {
                    $pseudoSelector .= '[data-' . $attrExpr . ']';
                }
            // ── aria-[attr] / aria-[attr=value] variants ──
            //    aria-[expanded=true]:* → [aria-expanded="true"]
            //    aria-[busy]:*         → [aria-busy]
            } elseif (preg_match('/^aria-\[(.+)\]$/', $prefix, $m)) {
                $attrExpr = $m[1];
                if (str_contains($attrExpr, '=')) {
                    [$attrName, $attrVal] = explode('=', $attrExpr, 2);
                    $pseudoSelector .= '[aria-' . $attrName . '="' . $attrVal . '"]';
                } else {
                    $pseudoSelector .= '[aria-' . $attrExpr . ']';
                }
            // ── Named aria-* shorthand variants (maps to [aria-*="true"]) ──
            //    aria-expanded:* → [aria-expanded="true"]
            //    aria-disabled:* → [aria-disabled="true"]
            //    aria-hidden:*   → [aria-hidden="true"]
            } elseif (str_starts_with($prefix, 'aria-')) {
                $ariaAttr = substr($prefix, 5);
                $pseudoSelector .= '[aria-' . $ariaAttr . '="true"]';
            // ── Arbitrary selector variants [&...] ──
            //    [&>*]:*    → .class>*
            //    [&_p]:*    → .class p
            //    [&:hover]:* → .class:hover (less common, overlaps with hover:)
            } elseif (str_starts_with($prefix, '[&') && str_ends_with($prefix, ']')) {
                // Extract the selector fragment after [&
                $fragment = substr($prefix, 2, -1); // strip [& and ]
                // Replace _ with space (Tailwind convention for descendant combinator)
                $fragment = str_replace('_', ' ', $fragment);
                // The fragment is appended after the escaped class in selector building
                $pseudoSelector .= $fragment;
            // ── has-[selector] variant → :has(selector) ──
            //    has-[>img]:* → .class:has(>img)
            //    has-[.active]:* → .class:has(.active)
            } elseif (preg_match('/^has-\[(.+)\]$/', $prefix, $m)) {
                $hasFragment = str_replace('_', ' ', $m[1]);
                $pseudoSelector .= ':has(' . $hasFragment . ')';
            // ── not-[selector] variant → :not(selector) ──
            //    not-[.hidden]:* → .class:not(.hidden)
            } elseif (preg_match('/^not-\[(.+)\]$/', $prefix, $m)) {
                $notFragment = str_replace('_', ' ', $m[1]);
                $pseudoSelector .= ':not(' . $notFragment . ')';
            // ── supports-[rule] variant → @supports (rule) ──
            //    supports-[display:grid]:* → @supports (display:grid){.class{...}}
            //    Tracked separately from @media to allow correct nesting.
            } elseif (preg_match('/^supports-\[(.+)\]$/', $prefix, $m)) {
                $supportsExpr = str_replace('_', ' ', $m[1]);
                $sup = '(' . $supportsExpr . ')';
                $supportsQuery = $supportsQuery ? $supportsQuery . ' and ' . $sup : $sup;
            // ── *: direct child variant → :is(.class > *) ──
            //    *:p-4 → :is(.\*\:p-4 > *){padding:1rem}
            } elseif ($prefix === '*') {
                $selectorWrapper = 'child';
            // ── **: descendant variant → :is(.class *) ──
            //    **:text-sm → :is(.\*\*\:text-sm *){font-size:...}
            } elseif ($prefix === '**') {
                $selectorWrapper = 'descendant';
            // ── Unknown variant: fail unresolved ──
            } else {
                return null;
            }
            // Accumulate media queries (e.g. dark:md: → combine with 'and')
            if ($mq !== null) {
                $mediaQuery = $mediaQuery ? $mediaQuery . ' and ' . $mq : $mq;
            }
        }

        // Handle negative values: -mt-4 → negate the result of mt-4
        $isNegative = false;
        if (str_starts_with($utility, '-') && strlen($utility) > 1
            && !str_starts_with($utility, '-webkit')
            && !str_starts_with($utility, '-moz')) {
            $isNegative = true;
            $utility = substr($utility, 1);
        }

        // Track animation usage for keyframe output
        if (str_starts_with($utility, 'animate-') && $utility !== 'animate-none') {
            $animName = substr($utility, 8);
            $this->usedAnimations[$animName] = true;
        }

        // ── Arbitrary CSS properties: [property:value] ──
        // e.g. [--scroll-offset:56px] → --scroll-offset:56px
        // e.g. [mask-type:luminance]  → mask-type:luminance
        // These are bare bracket classes with NO prefix beforehand.
        if (str_starts_with($utility, '[') && str_ends_with($utility, ']')) {
            $inner = substr($utility, 1, -1); // strip [ and ]
            $colonPos = strpos($inner, ':');
            if ($colonPos !== false) {
                $propName = substr($inner, 0, $colonPos);
                $propValue = str_replace('_', ' ', substr($inner, $colonPos + 1));
                $declarations = "{$propName}:{$propValue}";
            } else {
                // Bracket class with no colon — can't resolve
                return null;
            }
        }

        // Resolve the utility — pass isNegative so transform can handle it internally
        if (!isset($declarations)) {
            $declarations = $isNegative
                ? $this->resolveUtilityNegated($utility)
                : $this->resolveUtility($utility);
        }
        if ($declarations === null) {
            return null;
        }

        if ($important) {
            $declarations = $this->applyImportant($declarations);
        }

        // Auto-inject content for ::before / ::after pseudo-elements
        if (str_contains($pseudoSelector, '::before') || str_contains($pseudoSelector, '::after')) {
            if (!str_contains($declarations, 'content:')) {
                $declarations = "content:var(--tw-content,'');" . $declarations;
            }
        }

        $escapedClass = $this->escapeSelector($rawClass);
        $selector = $selectorPrefix . '.' . $escapedClass . $pseudoSelector;

        // Child selector for space-* and divide-* utilities (Tailwind v3 pattern)
        if (str_starts_with($utility, 'space-') || str_starts_with($utility, 'divide-')) {
            $selector = $selectorPrefix . '.' . $escapedClass . $pseudoSelector . '>:not([hidden])~:not([hidden])';
        }

        // *: and **: universal child/descendant wrapping
        // The wrapper applies AROUND the fully-built selector (including pseudo-classes,
        // attribute selectors, and group/peer prefixes) to preserve variant semantics.
        //
        // hover:*:p-4        → :is(.class:hover>*){padding:1rem}
        // data-[open]:*:p-4  → :is(.class[data-state=open]>*){padding:1rem}
        // group-hover:*:p-4  → :is(.group:hover .class>*){opacity:1}
        if ($selectorWrapper === 'child') {
            $selector = ':is(' . $selector . '>*)';
        } elseif ($selectorWrapper === 'descendant') {
            $selector = ':is(' . $selector . ' *)';
        }

        return [
            'selector'     => $selector,
            'declarations' => $declarations,
            'media'        => $mediaQuery,
            'supports'     => $supportsQuery,
            'order'        => $this->classifyDeclarationOrder($declarations),
        ];
    }

    /**
     * Main utility resolver — dispatches to category-specific resolvers.
     */
    private function resolveUtility(string $class): ?string
    {
        // 1. Static utilities (exact match)
        if (isset($this->staticUtilities[$class])) {
            return $this->staticUtilities[$class];
        }
        // 2. Semantic theme aliases (exact match)
        if (isset($this->semanticAliases[$class])) {
            return $this->semanticAliases[$class];
        }
        // 3. Pattern-based resolvers (order matters for disambiguation)
        return $this->resolveSpacing($class)
            ?? $this->resolveSizing($class)
            ?? $this->resolveTypography($class)
            ?? $this->resolveFlexGrid($class)
            ?? $this->resolvePosition($class)
            ?? $this->resolveBorderRadius($class)
            ?? $this->resolveBorderDirectional($class)
            ?? $this->resolveShadow($class)
            ?? $this->resolveOpacity($class)
            ?? $this->resolveTransitionDuration($class)
            ?? $this->resolveLineClamp($class)
            ?? $this->resolveOrder($class)
            ?? $this->resolveTransform($class)
            ?? $this->resolveFilter($class)
            ?? $this->resolveDivide($class)
            ?? $this->resolveRingColor($class)
            ?? $this->resolveColor($class)
            ?? $this->resolveArbitrary($class);
    }

    /**
     * Resolve a negated utility (e.g. -mt-4, -translate-x-4).
     * Transform utilities handle negation internally (negate the variable, not the whole declaration).
     * All other utilities use the general negateDeclarations approach.
     */
    private function resolveUtilityNegated(string $class): ?string
    {
        // Transform utilities: negate internally to avoid corrupting the composed transform function
        $transformResult = $this->resolveTransform($class, true);
        if ($transformResult !== null) {
            return $transformResult;
        }

        // All other utilities: resolve normally then negate
        $declarations = $this->resolveUtility($class);
        if ($declarations === null) {
            return null;
        }
        return $this->negateDeclarations($declarations);
    }

    // ── Category Resolvers ────────────────────────────────────

    private function resolveSpacing(string $class): ?string
    {
        // border-spacing-x/y — needs CSS custom properties since CSS only has shorthand
        if (str_starts_with($class, 'border-spacing-x-')) {
            $v = substr($class, 17);
            $css = $this->spacingScale[$v] ?? null;
            if ($css !== null) return "--tw-border-spacing-x:{$css};border-spacing:var(--tw-border-spacing-x) var(--tw-border-spacing-y,0)";
        }
        if (str_starts_with($class, 'border-spacing-y-')) {
            $v = substr($class, 17);
            $css = $this->spacingScale[$v] ?? null;
            if ($css !== null) return "--tw-border-spacing-y:{$css};border-spacing:var(--tw-border-spacing-x,0) var(--tw-border-spacing-y)";
        }

        // Pre-sorted by prefix length desc (longest first) to avoid runtime uksort
        static $map = [
            'border-spacing-' => ['border-spacing'],
            'scroll-mx-' => ['scroll-margin-left','scroll-margin-right'],
            'scroll-my-' => ['scroll-margin-top','scroll-margin-bottom'],
            'scroll-mt-' => ['scroll-margin-top'], 'scroll-mr-' => ['scroll-margin-right'],
            'scroll-mb-' => ['scroll-margin-bottom'], 'scroll-ml-' => ['scroll-margin-left'],
            'scroll-px-' => ['scroll-padding-left','scroll-padding-right'],
            'scroll-py-' => ['scroll-padding-top','scroll-padding-bottom'],
            'scroll-pt-' => ['scroll-padding-top'], 'scroll-pr-' => ['scroll-padding-right'],
            'scroll-pb-' => ['scroll-padding-bottom'], 'scroll-pl-' => ['scroll-padding-left'],
            'scroll-m-'  => ['scroll-margin'],
            'scroll-p-'  => ['scroll-padding'],
            'indent-' => ['text-indent'],
            'gap-x-' => ['column-gap'], 'gap-y-' => ['row-gap'],
            'gap-'  => ['gap'],
            'px-' => ['padding-left','padding-right'],
            'py-' => ['padding-top','padding-bottom'],
            'pt-' => ['padding-top'], 'pr-' => ['padding-right'],
            'pb-' => ['padding-bottom'], 'pl-' => ['padding-left'],
            'ps-' => ['padding-inline-start'], 'pe-' => ['padding-inline-end'],
            'mx-' => ['margin-left','margin-right'],
            'my-' => ['margin-top','margin-bottom'],
            'mt-' => ['margin-top'], 'mr-' => ['margin-right'],
            'mb-' => ['margin-bottom'], 'ml-' => ['margin-left'],
            'ms-' => ['margin-inline-start'], 'me-' => ['margin-inline-end'],
            'p-'  => ['padding'],
            'm-'  => ['margin'],
        ];

        foreach ($map as $prefix => $properties) {
            if (str_starts_with($class, $prefix)) {
                $value = substr($class, strlen($prefix));
                $cssValue = $this->spacingScale[$value] ?? null;
                if ($cssValue !== null) {
                    return implode(';', array_map(fn($p) => "{$p}:{$cssValue}", $properties));
                }
            }
        }

        // space-x-{v} and space-y-{v} — these produce child selectors
        // Handled specially in resolveClass via the declarations
        if (str_starts_with($class, 'space-x-')) {
            $v = substr($class, 8);
            $cssValue = $this->spacingScale[$v] ?? null;
            if ($cssValue) return "margin-left:{$cssValue}";
        }
        if (str_starts_with($class, 'space-y-')) {
            $v = substr($class, 8);
            $cssValue = $this->spacingScale[$v] ?? null;
            if ($cssValue) return "margin-top:{$cssValue}";
        }

        return null;
    }

    private function resolveSizing(string $class): ?string
    {
        $map = [
            'w-' => 'width', 'h-' => 'height',
            'min-w-' => 'min-width', 'min-h-' => 'min-height',
            'max-w-' => 'max-width', 'max-h-' => 'max-height',
        ];

        foreach ($map as $prefix => $property) {
            if (str_starts_with($class, $prefix)) {
                $value = substr($class, strlen($prefix));
                // Check spacing scale
                $cssValue = $this->spacingScale[$value] ?? null;
                // Check fractions
                if (!$cssValue) $cssValue = $this->fractionScale[$value] ?? null;
                if ($cssValue !== null) {
                    return "{$property}:{$cssValue}";
                }
            }
        }

        // size-{v} (sets both width and height)
        if (str_starts_with($class, 'size-')) {
            $value = substr($class, 5);
            $cssValue = $this->spacingScale[$value] ?? $this->fractionScale[$value] ?? null;
            if ($cssValue !== null) {
                return "width:{$cssValue};height:{$cssValue}";
            }
        }
        return null;
    }

    private function resolveTypography(string $class): ?string
    {
        // text-{size}: xs, sm, base, lg, xl, 2xl, etc.
        if (str_starts_with($class, 'text-')) {
            $value = substr($class, 5);
            if (isset($this->textSizes[$value])) {
                return $this->textSizes[$value];
            }
        }
        // font-{weight}: thin, light, normal, medium, semibold, bold, extrabold, black
        if (str_starts_with($class, 'font-')) {
            $value = substr($class, 5);
            if (isset($this->fontWeights[$value])) {
                return "font-weight:{$this->fontWeights[$value]}";
            }
        }
        // leading-{value}
        if (str_starts_with($class, 'leading-')) {
            $value = substr($class, 8);
            $leadingMap = [
                'none' => '1', 'tight' => 'var(--leading-tight,1.25)',
                'snug' => '1.375', 'normal' => 'var(--leading-normal,1.5)',
                'relaxed' => 'var(--leading-relaxed,1.625)', 'loose' => '2',
            ];
            if (isset($leadingMap[$value])) return "line-height:{$leadingMap[$value]}";
            if (isset($this->spacingScale[$value])) return "line-height:{$this->spacingScale[$value]}";
        }
        // tracking-{value}
        if (str_starts_with($class, 'tracking-')) {
            $value = substr($class, 9);
            $trackingMap = [
                'tighter' => '-0.05em', 'tight' => 'var(--tracking-tight,-0.025em)',
                'normal' => 'var(--tracking-normal,0em)',
                'wide' => 'var(--tracking-wide,0.025em)',
                'wider' => '0.05em', 'widest' => '0.1em',
            ];
            if (isset($trackingMap[$value])) return "letter-spacing:{$trackingMap[$value]}";
        }
        return null;
    }

    private function resolveFlexGrid(string $class): ?string
    {
        // grid-cols-{n}
        if (str_starts_with($class, 'grid-cols-')) {
            $n = substr($class, 10);
            if ($n === 'none') return 'grid-template-columns:none';
            if ($n === 'subgrid') return 'grid-template-columns:subgrid';
            if (ctype_digit($n) && (int)$n >= 1 && (int)$n <= 12) {
                return "grid-template-columns:repeat({$n},minmax(0,1fr))";
            }
        }
        // grid-rows-{n}
        if (str_starts_with($class, 'grid-rows-')) {
            $n = substr($class, 10);
            if ($n === 'none') return 'grid-template-rows:none';
            if (ctype_digit($n) && (int)$n >= 1 && (int)$n <= 12) {
                return "grid-template-rows:repeat({$n},minmax(0,1fr))";
            }
        }
        // col-span-{n}
        if (str_starts_with($class, 'col-span-')) {
            $n = substr($class, 9);
            if (ctype_digit($n) && (int)$n >= 1 && (int)$n <= 12) {
                return "grid-column:span {$n}/span {$n}";
            }
        }
        // col-start-{n}, col-end-{n}
        if (str_starts_with($class, 'col-start-')) {
            $n = substr($class, 10);
            if (ctype_digit($n)) return "grid-column-start:{$n}";
        }
        if (str_starts_with($class, 'col-end-')) {
            $n = substr($class, 8);
            if (ctype_digit($n)) return "grid-column-end:{$n}";
        }
        // row-span-{n}
        if (str_starts_with($class, 'row-span-')) {
            $n = substr($class, 9);
            if (ctype_digit($n) && (int)$n >= 1 && (int)$n <= 12) {
                return "grid-row:span {$n}/span {$n}";
            }
        }
        // row-start-{n}, row-end-{n}
        if (str_starts_with($class, 'row-start-')) {
            $n = substr($class, 10);
            if (ctype_digit($n)) return "grid-row-start:{$n}";
        }
        if (str_starts_with($class, 'row-end-')) {
            $n = substr($class, 8);
            if (ctype_digit($n)) return "grid-row-end:{$n}";
        }
        // basis-{v}
        if (str_starts_with($class, 'basis-')) {
            $v = substr($class, 6);
            $cssValue = $this->spacingScale[$v] ?? $this->fractionScale[$v] ?? null;
            if ($v === 'auto') return 'flex-basis:auto';
            if ($v === 'full') return 'flex-basis:100%';
            if ($cssValue !== null) return "flex-basis:{$cssValue}";
        }
        return null;
    }

    private function resolvePosition(string $class): ?string
    {
        // Pre-sorted by prefix length desc
        static $map = [
            'inset-x-' => null, 'inset-y-' => null,
            'start-' => 'inset-inline-start',
            'inset-' => 'inset',
            'right-' => 'right', 'left-' => 'left',
            'bottom-' => 'bottom', 'top-' => 'top',
            'end-' => 'inset-inline-end',
        ];

        foreach ($map as $prefix => $property) {
            if (str_starts_with($class, $prefix)) {
                $value = substr($class, strlen($prefix));
                $cssValue = $this->spacingScale[$value] ?? $this->fractionScale[$value] ?? null;
                if ($cssValue === null) return null;

                if ($prefix === 'inset-x-') return "left:{$cssValue};right:{$cssValue}";
                if ($prefix === 'inset-y-') return "top:{$cssValue};bottom:{$cssValue}";
                return "{$property}:{$cssValue}";
            }
        }

        // z-{n} (arbitrary numbers beyond the static ones)
        if (str_starts_with($class, 'z-')) {
            $n = substr($class, 2);
            if (ctype_digit($n)) return "z-index:{$n}";
        }
        return null;
    }

    private function resolveBorderRadius(string $class): ?string
    {
        if (!str_starts_with($class, 'rounded')) return null;
        $rest = substr($class, 7); // after "rounded"

        // Directional: rounded-t-, rounded-b-, rounded-l-, rounded-r-, rounded-tl-, etc.
        // Pre-sorted by prefix length desc
        static $dirMap = [
            '-tl-' => ['border-top-left-radius'], '-tr-' => ['border-top-right-radius'],
            '-bl-' => ['border-bottom-left-radius'], '-br-' => ['border-bottom-right-radius'],
            '-t-' => ['border-top-left-radius','border-top-right-radius'],
            '-b-' => ['border-bottom-left-radius','border-bottom-right-radius'],
            '-l-' => ['border-top-left-radius','border-bottom-left-radius'],
            '-r-' => ['border-top-right-radius','border-bottom-right-radius'],
            '-' => ['border-radius'],
        ];

        foreach ($dirMap as $dirPrefix => $properties) {
            if (str_starts_with($rest, $dirPrefix)) {
                $size = substr($rest, strlen($dirPrefix));
                $cssValue = $this->borderRadiusScale[$size] ?? null;
                if ($cssValue !== null) {
                    return implode(';', array_map(fn($p) => "{$p}:{$cssValue}", $properties));
                }
            }
        }

        // Just "rounded" with no size → default
        if ($rest === '' && isset($this->borderRadiusScale[''])) {
            return "border-radius:{$this->borderRadiusScale['']}";
        }
        return null;
    }

    private function resolveShadow(string $class): ?string
    {
        if (!str_starts_with($class, 'shadow')) return null;
        $rest = substr($class, 6);
        if ($rest === '') {
            return isset($this->shadowScale[''])
                ? $this->buildShadowDeclarations($this->shadowScale[''])
                : null;
        }
        if (str_starts_with($rest, '-')) {
            $size = substr($rest, 1);
            if (isset($this->shadowScale[$size])) {
                return $this->buildShadowDeclarations($this->shadowScale[$size]);
            }
            // shadow-{color}: e.g. shadow-red-500, shadow-primary/50
            $cssColor = $this->resolveColorWithOpacity($size);
            if ($cssColor !== null) return "--tw-shadow-color:{$cssColor}";
        }
        return null;
    }

    private function resolveOpacity(string $class): ?string
    {
        if (!str_starts_with($class, 'opacity-')) return null;
        $v = substr($class, 8);
        if (isset($this->opacityScale[$v])) return "opacity:{$this->opacityScale[$v]}";
        return null;
    }

    private function resolveTransitionDuration(string $class): ?string
    {
        if (str_starts_with($class, 'duration-')) {
            $v = substr($class, 9);
            if (ctype_digit($v)) return "transition-duration:{$v}ms";
            $named = ['fast' => 'var(--duration-fast,150ms)', 'normal' => 'var(--duration-normal,300ms)', 'slow' => 'var(--duration-slow,500ms)'];
            if (isset($named[$v])) return "transition-duration:{$named[$v]}";
        }
        if (str_starts_with($class, 'delay-')) {
            $v = substr($class, 6);
            if (ctype_digit($v)) return "transition-delay:{$v}ms";
        }
        return null;
    }

    private function resolveLineClamp(string $class): ?string
    {
        if (str_starts_with($class, 'line-clamp-')) {
            $n = substr($class, 11);
            if (ctype_digit($n)) {
                return "display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:{$n};overflow:hidden";
            }
        }
        return null;
    }

    private function resolveOrder(string $class): ?string
    {
        if (str_starts_with($class, 'order-')) {
            $n = substr($class, 6);
            if (ctype_digit($n) || (str_starts_with($n, '-') && ctype_digit(substr($n, 1)))) {
                return "order:{$n}";
            }
        }
        return null;
    }

    /**
     * Color resolver — handles bg-{color}, text-{color}, border-{color},
     * fill-{color}, stroke-{color}, from-{color}, via-{color}, to-{color}.
     *
     * Supports opacity modifier: bg-primary-500/50 → color-mix(in srgb, ...).
     * Runs AFTER typography/border resolvers to avoid ambiguity.
     */
    private function resolveColor(string $class): ?string
    {
        // Pre-sorted by prefix length desc
        static $colorPrefixes = [
            'decoration-' => 'text-decoration-color',
            'outline-' => 'outline-color',
            'border-' => 'border-color',
            'accent-' => 'accent-color',
            'stroke-' => 'stroke',
            'caret-' => 'caret-color',
            'text-' => 'color',
            'fill-' => 'fill',
            'bg-' => 'background-color',
        ];

        foreach ($colorPrefixes as $prefix => $property) {
            if (str_starts_with($class, $prefix)) {
                $colorName = substr($class, strlen($prefix));
                $cssColor = $this->resolveColorWithOpacity($colorName);
                if ($cssColor !== null) {
                    return "{$property}:{$cssColor}";
                }
            }
        }

        // Gradient stops: from-{color}, via-{color}, to-{color}
        // Must also set --tw-gradient-stops so bg-gradient-to-* works
        foreach (['from-' => '--tw-gradient-from', 'via-' => '--tw-gradient-via', 'to-' => '--tw-gradient-to'] as $prefix => $cssVar) {
            if (str_starts_with($class, $prefix)) {
                $colorName = substr($class, strlen($prefix));
                $cssColor = $this->resolveColorWithOpacity($colorName);
                if ($cssColor !== null) {
                    return $this->buildGradientStop($prefix, $cssVar, $cssColor);
                }
            }
        }
        return null;
    }

    /**
     * Arbitrary value resolver — handles [value] syntax.
     * e.g. p-[2.5rem], bg-[var(--c-primary-500)], grid-cols-[1fr_2fr_1fr]
     */
    private function resolveArbitrary(string $class): ?string
    {
        // Match prefix-[value] pattern
        if (!preg_match('/^(.+?)-\[(.+)\]$/', $class, $m)) {
            return null;
        }
        $prefix = $m[1];
        // Tailwind uses _ for spaces in arbitrary values, but NOT inside url()
        $rawValue = $m[2];
        if (str_contains($rawValue, 'url(')) {
            // Extract url() blocks into placeholders before underscore replacement
            $urlPlaceholders = [];
            $value = preg_replace_callback('/url\([^)]+\)/', function ($u) use (&$urlPlaceholders) {
                $key = "\x00URL" . count($urlPlaceholders) . "\x00";
                $urlPlaceholders[$key] = $u[0];
                return $key;
            }, $rawValue);
            $value = str_replace('_', ' ', $value);
            $value = strtr($value, $urlPlaceholders);
        } else {
            $value = str_replace('_', ' ', $rawValue);
        }

        // Special handling for text-[...] — could be color or size
        if ($prefix === 'text') {
            $prop = $this->looksLikeColor($value) ? 'color' : 'font-size';
            return "{$prop}:{$value}";
        }
        // Special handling for bg-[...] — could be color or image
        if ($prefix === 'bg') {
            if (str_starts_with($value, 'url(') || str_contains($value, '-gradient(')) {
                return "background-image:{$value}";
            }
            return "background-color:{$value}";
        }
        // Special handling for border-[...] — could be width or color
        if ($prefix === 'border') {
            if ($this->looksLikeColor($value)) return "border-color:{$value}";
            return "border-width:{$value}";
        }
        // Special handling for shadow-[...]
        if ($prefix === 'shadow') {
            return "box-shadow:{$value}";
        }
        // Gradient stops: from-[...], via-[...], to-[...]
        if ($prefix === 'from') return $this->buildGradientStop('from-', '--tw-gradient-from', $value);
        if ($prefix === 'via') return $this->buildGradientStop('via-', '--tw-gradient-via', $value);
        if ($prefix === 'to') return $this->buildGradientStop('to-', '--tw-gradient-to', $value);
        // Special handling for grid-cols-[...] and grid-rows-[...]
        if ($prefix === 'grid-cols') return "grid-template-columns:{$value}";
        if ($prefix === 'grid-rows') return "grid-template-rows:{$value}";
        // Special handling for translate/scale/rotate — use individual CSS properties (TW4 model)
        if ($prefix === 'translate-x') return "--tw-translate-x:{$value};translate:var(--tw-translate-x,0) var(--tw-translate-y,0)";
        if ($prefix === 'translate-y') return "--tw-translate-y:{$value};translate:var(--tw-translate-x,0) var(--tw-translate-y,0)";
        if ($prefix === 'scale') return "--tw-scale-x:{$value};--tw-scale-y:{$value};scale:var(--tw-scale-x,1) var(--tw-scale-y,1)";
        if ($prefix === 'rotate') return "rotate:{$value}";
        // content-[...] → composed content (matches TW4's --tw-content model)
        if ($prefix === 'content') return "--tw-content:{$value};content:var(--tw-content)";

        // Filter arbitrary values — must wrap value in function name for composition
        $cf = self::COMPOSED_FILTER;
        $cb = self::COMPOSED_BACKDROP;
        $filterArbitraryMap = [
            'blur' => ['--tw-blur','blur','filter',$cf],
            'brightness' => ['--tw-brightness','brightness','filter',$cf],
            'contrast' => ['--tw-contrast','contrast','filter',$cf],
            'saturate' => ['--tw-saturate','saturate','filter',$cf],
            'hue-rotate' => ['--tw-hue-rotate','hue-rotate','filter',$cf],
            'grayscale' => ['--tw-grayscale','grayscale','filter',$cf],
            'invert' => ['--tw-invert','invert','filter',$cf],
            'sepia' => ['--tw-sepia','sepia','filter',$cf],
            'drop-shadow' => ['--tw-drop-shadow','drop-shadow','filter',$cf],
            'backdrop-blur' => ['--tw-backdrop-blur','blur','backdrop-filter',$cb],
            'backdrop-brightness' => ['--tw-backdrop-brightness','brightness','backdrop-filter',$cb],
            'backdrop-contrast' => ['--tw-backdrop-contrast','contrast','backdrop-filter',$cb],
            'backdrop-saturate' => ['--tw-backdrop-saturate','saturate','backdrop-filter',$cb],
            'backdrop-hue-rotate' => ['--tw-backdrop-hue-rotate','hue-rotate','backdrop-filter',$cb],
            'backdrop-grayscale' => ['--tw-backdrop-grayscale','grayscale','backdrop-filter',$cb],
            'backdrop-invert' => ['--tw-backdrop-invert','invert','backdrop-filter',$cb],
            'backdrop-sepia' => ['--tw-backdrop-sepia','sepia','backdrop-filter',$cb],
            'backdrop-opacity' => ['--tw-backdrop-opacity','opacity','backdrop-filter',$cb],
        ];
        if (isset($filterArbitraryMap[$prefix])) {
            [$var, $fn, $prop, $composed] = $filterArbitraryMap[$prefix];
            return "{$var}:{$fn}({$value});{$prop}:{$composed}";
        }

        // General arbitrary: look up prefix in map
        if (isset($this->arbitraryPrefixMap[$prefix])) {
            $properties = $this->arbitraryPrefixMap[$prefix];
            return implode(';', array_map(fn($p) => "{$p}:{$value}", $properties));
        }
        return null;
    }

    // ── New Category Resolvers ────────────────────────────────

    private function resolveTransform(string $class, bool $negate = false): ?string
    {
        // TW4-aligned transform model:
        // - scale uses CSS `scale:` property
        // - 2D rotate uses CSS `rotate:` property
        // - translate uses CSS `translate:` property
        // - skew and 3D rotations share CSS `transform:` property via COMPOSED_TRANSFORM_3D
        //
        // This avoids override conflicts: rotate:, translate:, scale:, and transform:
        // are all independent CSS properties that compose naturally.
        $ct3d = self::COMPOSED_TRANSFORM_3D;
        $composedTranslate = 'var(--tw-translate-x,0) var(--tw-translate-y,0)';
        $composedScale = 'var(--tw-scale-x,1) var(--tw-scale-y,1)';

        $neg = fn(string $val) => $negate ? (preg_match('/^\d/', $val) ? '-' . $val : "calc(-1 * {$val})") : $val;

        // ── Scale: uses CSS `scale:` property ──
        // scale-x-{n}, scale-y-{n}, scale-{n}
        if (str_starts_with($class, 'scale-x-')) {
            $v = substr($class, 8);
            if (isset($this->scaleValues[$v])) { $sv = $neg($this->scaleValues[$v]); return "--tw-scale-x:{$sv};scale:{$composedScale}"; }
        }
        if (str_starts_with($class, 'scale-y-')) {
            $v = substr($class, 8);
            if (isset($this->scaleValues[$v])) { $sv = $neg($this->scaleValues[$v]); return "--tw-scale-y:{$sv};scale:{$composedScale}"; }
        }
        if (str_starts_with($class, 'scale-')) {
            $v = substr($class, 6);
            if (isset($this->scaleValues[$v])) { $sv = $neg($this->scaleValues[$v]); return "--tw-scale-x:{$sv};--tw-scale-y:{$sv};scale:{$composedScale}"; }
        }

        // ── 3D rotation axes: rotate-x-{n}, rotate-y-{n}, rotate-z-{n} ──
        // Must be checked BEFORE 2D rotate-{n} since "rotate-x-45" starts with "rotate-"
        // Uses `transform:` property — shares with skew
        if (str_starts_with($class, 'rotate-x-')) {
            $v = substr($class, 9);
            if (isset($this->rotateValues[$v])) { $rv = $neg($this->rotateValues[$v]); return "--tw-rotate-x:rotateX({$rv});transform:{$ct3d}"; }
        }
        if (str_starts_with($class, 'rotate-y-')) {
            $v = substr($class, 9);
            if (isset($this->rotateValues[$v])) { $rv = $neg($this->rotateValues[$v]); return "--tw-rotate-y:rotateY({$rv});transform:{$ct3d}"; }
        }
        if (str_starts_with($class, 'rotate-z-')) {
            $v = substr($class, 9);
            if (isset($this->rotateValues[$v])) { $rv = $neg($this->rotateValues[$v]); return "--tw-rotate-z:rotateZ({$rv});transform:{$ct3d}"; }
        }

        // ── 2D rotate: uses CSS `rotate:` property ──
        // This is an individual CSS property that composes naturally with `transform:`
        if (str_starts_with($class, 'rotate-')) {
            $v = substr($class, 7);
            if (isset($this->rotateValues[$v])) { $rv = $neg($this->rotateValues[$v]); return "rotate:{$rv}"; }
        }

        // ── Translate: uses CSS `translate:` property ──
        // translate-x-{v}, translate-y-{v}
        if (str_starts_with($class, 'translate-x-')) {
            $v = substr($class, 12);
            $css = $this->spacingScale[$v] ?? $this->fractionScale[$v] ?? null;
            if ($css !== null) { $tv = $neg($css); return "--tw-translate-x:{$tv};translate:{$composedTranslate}"; }
        }
        if (str_starts_with($class, 'translate-y-')) {
            $v = substr($class, 12);
            $css = $this->spacingScale[$v] ?? $this->fractionScale[$v] ?? null;
            if ($css !== null) { $tv = $neg($css); return "--tw-translate-y:{$tv};translate:{$composedTranslate}"; }
        }
        // translate-z-{v} — extends translate to 3 axes
        if (str_starts_with($class, 'translate-z-')) {
            $v = substr($class, 12);
            $css = $this->spacingScale[$v] ?? null;
            if ($css !== null) { $tv = $neg($css); return "--tw-translate-z:{$tv};translate:var(--tw-translate-x,0) var(--tw-translate-y,0) var(--tw-translate-z)"; }
        }

        // ── Skew: uses `transform:` property ──
        // Shares the same composed transform string as 3D rotations — no conflict
        if (str_starts_with($class, 'skew-x-')) {
            $v = substr($class, 7);
            if (isset($this->skewValues[$v])) { $sv = $neg($this->skewValues[$v]); return "--tw-skew-x:skewX({$sv});transform:{$ct3d}"; }
        }
        if (str_starts_with($class, 'skew-y-')) {
            $v = substr($class, 7);
            if (isset($this->skewValues[$v])) { $sv = $neg($this->skewValues[$v]); return "--tw-skew-y:skewY({$sv});transform:{$ct3d}"; }
        }
        // perspective-{value} — named perspective scale
        // Note: perspective-none is a static utility; perspective-[...] goes through resolveArbitrary
        $perspectiveScale = [
            '50' => '50px', '75' => '75px', '100' => '100px', '150' => '150px',
            '200' => '200px', '250' => '250px', '300' => '300px', '400' => '400px',
            '500' => '500px', '600' => '600px', '700' => '700px', '800' => '800px',
            '900' => '900px', '1000' => '1000px',
        ];
        if (str_starts_with($class, 'perspective-')) {
            $v = substr($class, 12);
            if (isset($perspectiveScale[$v])) return "perspective:{$perspectiveScale[$v]}";
        }
        return null;
    }

    private function resolveFilter(string $class): ?string
    {
        // Reference composed strings from class constants
        $composedFilter = self::COMPOSED_FILTER;
        $composedBackdrop = self::COMPOSED_BACKDROP;

        $pctScale = [
            '0'=>'0','50'=>'.5','75'=>'.75','90'=>'.9','95'=>'.95',
            '100'=>'1','105'=>'1.05','110'=>'1.1','125'=>'1.25','150'=>'1.5','200'=>'2',
        ];

        // Pre-sorted by prefix length desc
        $filterMap = [
            'backdrop-brightness-'=>['--tw-backdrop-brightness','brightness','backdrop-filter',$composedBackdrop],
            'backdrop-contrast-'=>['--tw-backdrop-contrast','contrast','backdrop-filter',$composedBackdrop],
            'backdrop-saturate-'=>['--tw-backdrop-saturate','saturate','backdrop-filter',$composedBackdrop],
            'backdrop-opacity-'=>['--tw-backdrop-opacity','opacity','backdrop-filter',$composedBackdrop],
            'brightness-'=>['--tw-brightness','brightness','filter',$composedFilter],
            'contrast-'=>['--tw-contrast','contrast','filter',$composedFilter],
            'saturate-'=>['--tw-saturate','saturate','filter',$composedFilter],
        ];

        foreach ($filterMap as $prefix => [$var, $fn, $prop, $composed]) {
            if (str_starts_with($class, $prefix)) {
                $v = substr($class, strlen($prefix));
                if (isset($pctScale[$v])) return "{$var}:{$fn}({$pctScale[$v]});{$prop}:{$composed}";
            }
        }

        // hue-rotate-{n}
        if (str_starts_with($class, 'backdrop-hue-rotate-')) {
            $v = substr($class, 20);
            if (ctype_digit($v)) return "--tw-backdrop-hue-rotate:hue-rotate({$v}deg);backdrop-filter:{$composedBackdrop}";
        }
        if (str_starts_with($class, 'hue-rotate-')) {
            $v = substr($class, 11);
            if (ctype_digit($v)) return "--tw-hue-rotate:hue-rotate({$v}deg);filter:{$composedFilter}";
        }

        // blur-{size} — named sizes (handled here for composition; overrides staticUtilities)
        $blurScale = [
            'none'=>'0','sm'=>'4px',''=>'8px','md'=>'12px',
            'lg'=>'16px','xl'=>'24px','2xl'=>'40px','3xl'=>'64px',
        ];
        if (str_starts_with($class, 'backdrop-blur')) {
            $v = str_starts_with($class, 'backdrop-blur-') ? substr($class, 14) : (($class === 'backdrop-blur') ? '' : null);
            if ($v !== null && isset($blurScale[$v])) return "--tw-backdrop-blur:blur({$blurScale[$v]});backdrop-filter:{$composedBackdrop}";
        }
        if (str_starts_with($class, 'blur')) {
            $v = str_starts_with($class, 'blur-') ? substr($class, 5) : (($class === 'blur') ? '' : null);
            if ($v !== null && isset($blurScale[$v])) return "--tw-blur:blur({$blurScale[$v]});filter:{$composedFilter}";
        }

        // grayscale / invert / sepia  (0 or 100%) — pre-sorted longest first
        $toggleFilters = [
            'backdrop-grayscale' => ['--tw-backdrop-grayscale','grayscale','backdrop-filter',$composedBackdrop],
            'backdrop-invert' => ['--tw-backdrop-invert','invert','backdrop-filter',$composedBackdrop],
            'backdrop-sepia' => ['--tw-backdrop-sepia','sepia','backdrop-filter',$composedBackdrop],
            'grayscale' => ['--tw-grayscale','grayscale','filter',$composedFilter],
            'invert' => ['--tw-invert','invert','filter',$composedFilter],
            'sepia' => ['--tw-sepia','sepia','filter',$composedFilter],
        ];
        foreach ($toggleFilters as $name => [$var, $fn, $prop, $composed]) {
            if ($class === $name) return "{$var}:{$fn}(100%);{$prop}:{$composed}";
            if ($class === $name . '-0') return "{$var}:{$fn}(0);{$prop}:{$composed}";
        }

        // drop-shadow-{size}
        $dropShadows = [
            'sm' => 'drop-shadow(0 1px 1px rgba(0,0,0,0.05))',
            '' => 'drop-shadow(0 1px 2px rgba(0,0,0,0.1)) drop-shadow(0 1px 1px rgba(0,0,0,0.06))',
            'md' => 'drop-shadow(0 4px 3px rgba(0,0,0,0.07)) drop-shadow(0 2px 2px rgba(0,0,0,0.06))',
            'lg' => 'drop-shadow(0 10px 8px rgba(0,0,0,0.04)) drop-shadow(0 4px 3px rgba(0,0,0,0.1))',
            'xl' => 'drop-shadow(0 20px 13px rgba(0,0,0,0.03)) drop-shadow(0 8px 5px rgba(0,0,0,0.08))',
            '2xl' => 'drop-shadow(0 25px 25px rgba(0,0,0,0.15))',
            'none' => 'drop-shadow(0 0 #0000)',
        ];
        if (str_starts_with($class, 'drop-shadow')) {
            $v = str_starts_with($class, 'drop-shadow-') ? substr($class, 12) : (($class === 'drop-shadow') ? '' : null);
            if ($v !== null && isset($dropShadows[$v])) return "--tw-drop-shadow:{$dropShadows[$v]};filter:{$composedFilter}";
        }

        return null;
    }

    private function resolveDivide(string $class): ?string
    {
        // divide-x-{n}, divide-y-{n}
        $widths = ['0'=>'0px','2'=>'2px','4'=>'4px','8'=>'8px'];
        if ($class === 'divide-x') return 'border-left-width:1px';
        if ($class === 'divide-y') return 'border-top-width:1px';
        if (str_starts_with($class, 'divide-x-')) {
            $v = substr($class, 9);
            if (isset($widths[$v])) return "border-left-width:{$widths[$v]}";
        }
        if (str_starts_with($class, 'divide-y-')) {
            $v = substr($class, 9);
            if (isset($widths[$v])) return "border-top-width:{$widths[$v]}";
        }
        // divide-{color}
        if (str_starts_with($class, 'divide-')) {
            $colorName = substr($class, 7);
            $cssColor = $this->resolveColorWithOpacity($colorName);
            if ($cssColor !== null) return "border-color:{$cssColor}";
        }
        return null;
    }

    private function resolveRingColor(string $class): ?string
    {
        if (!str_starts_with($class, 'ring-')) return null;
        $rest = substr($class, 5);
        // ring-offset-{n}
        if (str_starts_with($rest, 'offset-')) {
            $v = substr($rest, 7);
            $vals = ['0'=>'0px','1'=>'1px','2'=>'2px','4'=>'4px','8'=>'8px'];
            if (isset($vals[$v])) return "--tw-ring-offset-width:{$vals[$v]}";
            // ring-offset-{color}
            $cssColor = $this->resolveColorWithOpacity($v);
            if ($cssColor !== null) return "--tw-ring-offset-color:{$cssColor}";
        }
        // ring-{color} — sets --tw-ring-color for composition with ring-{width}
        $cssColor = $this->resolveColorWithOpacity($rest);
        if ($cssColor !== null) {
            return "--tw-ring-color:{$cssColor}";
        }
        return null;
    }

    private function resolveBorderDirectional(string $class): ?string
    {
        $widthDirs = [
            'border-t-' => 'border-top-width', 'border-r-' => 'border-right-width',
            'border-b-' => 'border-bottom-width', 'border-l-' => 'border-left-width',
            'border-x-' => null, 'border-y-' => null,
        ];
        $colorDirs = [
            'border-t-' => 'border-top-color', 'border-r-' => 'border-right-color',
            'border-b-' => 'border-bottom-color', 'border-l-' => 'border-left-color',
            'border-x-' => null, 'border-y-' => null,
        ];
        $widthValues = ['0' => '0px', '2' => '2px', '4' => '4px', '8' => '8px'];

        foreach ($widthDirs as $prefix => $widthProp) {
            if (str_starts_with($class, $prefix)) {
                $rest = substr($class, strlen($prefix));

                // Check for width value first (border-t-2, border-b-0, etc.)
                if (isset($widthValues[$rest])) {
                    $w = $widthValues[$rest];
                    if ($prefix === 'border-x-') return "border-left-width:{$w};border-right-width:{$w}";
                    if ($prefix === 'border-y-') return "border-top-width:{$w};border-bottom-width:{$w}";
                    return "{$widthProp}:{$w}";
                }

                // Otherwise try as color (border-t-red-500, etc.)
                $cssColor = $this->resolveColorWithOpacity($rest);
                if ($cssColor !== null) {
                    $colorProp = $colorDirs[$prefix];
                    if ($prefix === 'border-x-') return "border-left-color:{$cssColor};border-right-color:{$cssColor}";
                    if ($prefix === 'border-y-') return "border-top-color:{$cssColor};border-bottom-color:{$cssColor}";
                    return "{$colorProp}:{$cssColor}";
                }

                // Don't return null here — allow fallthrough to other resolvers
                break;
            }
        }
        return null;
    }

    /**
     * Resolve a color name with optional opacity modifier.
     * E.g. "primary-500" → "var(--c-primary-500)"
     *      "primary-500/50" → "color-mix(in srgb,var(--c-primary-500) 50%,transparent)"
     */
    private function resolveColorWithOpacity(string $colorName): ?string
    {
        $opacity = null;
        if (str_contains($colorName, '/')) {
            // Don't split fractions like 1/2 — only split on last /
            $slashPos = strrpos($colorName, '/');
            $opacityStr = substr($colorName, $slashPos + 1);
            $baseColor = substr($colorName, 0, $slashPos);
            if (isset($this->opacityScale[$opacityStr])) {
                $opacity = $this->opacityScale[$opacityStr];
                $colorName = $baseColor;
            }
        }
        $cssColor = $this->themeColors[$colorName] ?? null;
        if ($cssColor === null) return null;
        if ($opacity !== null) {
            $pct = (int)((float)$opacity * 100);
            return "color-mix(in srgb,{$cssColor} {$pct}%,transparent)";
        }
        return $cssColor;
    }

    // ── Output Builder ────────────────────────────────────────

    private function buildCSS(array $rules): string
    {
        if (empty($rules)) return '';

        // Group rules into four buckets based on their wrapper combination.
        // Each rule may have:
        //   - media only      → @media (...) { .sel { decls } }
        //   - supports only   → @supports (...) { .sel { decls } }
        //   - media+supports  → @media (...) { @supports (...) { .sel { decls } } }
        //   - neither         → .sel { decls }  (base rules)
        //
        // We key wrapped groups by a composite string "media|supports" where either
        // portion may be empty. This preserves correct nesting.
        $baseRules = [];
        $wrappedGroups = []; // compositeKey => ['media'=>?, 'supports'=>?, 'rules'=>[]]

        foreach ($rules as $rule) {
            $media    = $rule['media'] ?? null;
            $supports = $rule['supports'] ?? null;

            if ($media === null && $supports === null) {
                $baseRules[] = $rule;
            } else {
                $key = ($media ?? '') . '|' . ($supports ?? '');
                if (!isset($wrappedGroups[$key])) {
                    $wrappedGroups[$key] = [
                        'media'    => $media,
                        'supports' => $supports,
                        'rules'    => [],
                    ];
                }
                $wrappedGroups[$key]['rules'][] = $rule;
            }
        }

        $output = '';
        $ruleSorter = function (array $a, array $b): int {
            return ($a['order'] ?? 9999) <=> ($b['order'] ?? 9999)
                ?: strcmp($a['selector'], $b['selector']);
        };

        // ── Base rules (no wrapper) ──
        usort($baseRules, $ruleSorter);
        foreach ($baseRules as $rule) {
            $output .= $rule['selector'] . '{' . $rule['declarations'] . '}';
        }

        // ── Determine breakpoint order for proper cascade ──
        $bpOrder = [];
        foreach (TailwindConfig::BREAKPOINTS as $name => $size) {
            $bpOrder["(min-width:{$size})"] = array_search($name, array_keys(TailwindConfig::BREAKPOINTS));
        }
        foreach (TailwindConfig::MAX_BREAKPOINTS as $name => $size) {
            $bpOrder["not all and (min-width:{$size})"] = 100 + array_search($name, array_keys(TailwindConfig::MAX_BREAKPOINTS));
        }

        // Sort wrapped groups: media-only groups by breakpoint order, then mixed,
        // then supports-only. Within each tier, use pixel-value or lexicographic order.
        $groupOrder = function (string $a, string $b) use ($bpOrder): int {
            [$mediaA, $supA] = explode('|', $a, 2);
            [$mediaB, $supB] = explode('|', $b, 2);

            // Tier: media-only (no supports) first, then media+supports, then supports-only
            $tierA = ($mediaA !== '' && $supA === '') ? 0 : (($mediaA !== '') ? 1 : 2);
            $tierB = ($mediaB !== '' && $supB === '') ? 0 : (($mediaB !== '') ? 1 : 2);
            if ($tierA !== $tierB) return $tierA <=> $tierB;

            // Within tiers that have media: sort by breakpoint order
            if ($mediaA !== '' && $mediaB !== '') {
                $oa = $bpOrder[$mediaA] ?? null;
                $ob = $bpOrder[$mediaB] ?? null;
                if ($oa !== null && $ob !== null) return $oa <=> $ob;
                if ($oa !== null) return -1;
                if ($ob !== null) return 1;

                // Both unknown: try to extract a numeric pixel value
                $va = preg_match('/(\d+\.?\d*)px/', $mediaA, $ma) ? (float) $ma[1] : null;
                $vb = preg_match('/(\d+\.?\d*)px/', $mediaB, $mb) ? (float) $mb[1] : null;
                if ($va !== null && $vb !== null && $va !== $vb) return $va <=> $vb;
                if ($va !== null && $vb === null) return -1;
                if ($vb !== null && $va === null) return 1;
            }

            // Final tiebreaker: lexicographic on the full composite key
            return strcmp($a, $b);
        };

        uksort($wrappedGroups, $groupOrder);

        // ── Emit wrapped groups with correct nesting ──
        foreach ($wrappedGroups as $group) {
            usort($group['rules'], $ruleSorter);

            $hasMedia    = $group['media'] !== null;
            $hasSupports = $group['supports'] !== null;

            // Open wrappers: @media outside, @supports inside
            if ($hasMedia) {
                $output .= '@media ' . $group['media'] . '{';
            }
            if ($hasSupports) {
                $output .= '@supports ' . $group['supports'] . '{';
            }

            // Emit rules
            foreach ($group['rules'] as $rule) {
                $output .= $rule['selector'] . '{' . $rule['declarations'] . '}';
            }

            // Close wrappers (reverse order)
            if ($hasSupports) {
                $output .= '}';
            }
            if ($hasMedia) {
                $output .= '}';
            }
        }

        return $output;
    }

    /**
     * Classify a declaration string into a numeric ordering layer.
     *
     * Follows Tailwind 4's output convention:
     *  100 = content/layout (display, position, visibility, overflow)
     *  200 = flexbox/grid
     *  300 = spacing (margin, padding, gap)
     *  400 = sizing (width, height, min-*, max-*)
     *  500 = typography (font, text, letter-spacing, line-height, color)
     *  600 = backgrounds (background-*, gradient vars)
     *  700 = borders (border-*, outline-*, ring vars)
     *  800 = effects (opacity, box-shadow, shadow vars)
     *  900 = filters (filter, backdrop-filter, filter vars)
     * 1000 = transitions (transition-*, animation)
     * 1100 = transforms (transform, translate vars, scale vars)
     * 1200 = interactivity (cursor, user-select, appearance, scroll)
     * 1300 = svg (fill, stroke)
     * 1400 = accessibility (sr-only declarations)
     */
    private function classifyDeclarationOrder(string $declarations): int
    {
        // CSS custom properties: classify by the variable name
        if (str_starts_with($declarations, '--tw-')) {
            if (str_contains($declarations, '--tw-gradient')
                || str_contains($declarations, '--tw-bg-opacity')) return 600;
            if (str_contains($declarations, '--tw-ring')
                || str_contains($declarations, '--tw-border')) return 700;
            if (str_contains($declarations, '--tw-shadow')) return 800;
            if (str_contains($declarations, '--tw-blur')
                || str_contains($declarations, '--tw-brightness')
                || str_contains($declarations, '--tw-contrast')
                || str_contains($declarations, '--tw-saturate')
                || str_contains($declarations, '--tw-hue-rotate')
                || str_contains($declarations, '--tw-invert')
                || str_contains($declarations, '--tw-sepia')
                || str_contains($declarations, '--tw-grayscale')
                || str_contains($declarations, '--tw-drop-shadow')
                || str_contains($declarations, '--tw-backdrop')) return 900;
            if (str_contains($declarations, '--tw-translate')
                || str_contains($declarations, '--tw-rotate')
                || str_contains($declarations, '--tw-skew')
                || str_contains($declarations, '--tw-scale')) return 1100;
            return 9000; // unknown custom property
        }

        // Extract the first CSS property name
        $colonPos = strpos($declarations, ':');
        if ($colonPos === false) return 9999;
        $firstProp = substr($declarations, 0, $colonPos);

        // Static map keyed by exact property name
        static $propOrder = null;
        if ($propOrder === null) {
            $propOrder = [];
            $layers = [
                100 => ['content', 'display', 'position', 'top', 'right', 'bottom', 'left',
                         'inset', 'visibility', 'z-index', 'float', 'clear',
                         'overflow', 'overflow-x', 'overflow-y',
                         'isolation', 'object-fit', 'object-position',
                         'table-layout', 'caption-side', 'border-collapse', 'border-spacing',
                         'columns', 'break-before', 'break-after', 'break-inside',
                         'box-decoration-break', 'box-sizing',
                         'aspect-ratio'],
                200 => ['flex', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink',
                         'flex-basis', 'order',
                         'grid-template-columns', 'grid-template-rows',
                         'grid-column', 'grid-row', 'grid-column-start', 'grid-column-end',
                         'grid-row-start', 'grid-row-end', 'grid-auto-flow',
                         'grid-auto-columns', 'grid-auto-rows',
                         'justify-content', 'justify-items', 'justify-self',
                         'align-content', 'align-items', 'align-self',
                         'place-content', 'place-items', 'place-self'],
                300 => ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
                         'margin-inline', 'margin-inline-start', 'margin-inline-end',
                         'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
                         'padding-inline', 'padding-inline-start', 'padding-inline-end',
                         'gap', 'row-gap', 'column-gap',
                         'scroll-margin', 'scroll-margin-top', 'scroll-margin-right',
                         'scroll-margin-bottom', 'scroll-margin-left',
                         'scroll-padding', 'scroll-padding-top', 'scroll-padding-right',
                         'scroll-padding-bottom', 'scroll-padding-left'],
                400 => ['width', 'min-width', 'max-width',
                         'height', 'min-height', 'max-height',
                         'size'],
                500 => ['font-family', 'font-size', 'font-style', 'font-weight',
                         'font-variant-numeric', 'letter-spacing', 'line-height',
                         'color', 'text-align', 'text-decoration', 'text-decoration-color',
                         'text-decoration-style', 'text-decoration-thickness',
                         'text-underline-offset', 'text-transform', 'text-overflow',
                         'text-indent', 'text-wrap', 'vertical-align',
                         'white-space', 'word-break', 'overflow-wrap', 'hyphens',
                         'list-style-type', 'list-style-position',
                         '-webkit-line-clamp', '-webkit-box-orient'],
                600 => ['background', 'background-color', 'background-image',
                         'background-size', 'background-position', 'background-repeat',
                         'background-attachment', 'background-clip', 'background-origin',
                         'gradient-color-stops'],
                700 => ['border', 'border-width', 'border-style', 'border-color',
                         'border-top', 'border-top-width', 'border-right-width',
                         'border-bottom-width', 'border-left-width',
                         'border-top-color', 'border-right-color',
                         'border-bottom-color', 'border-left-color',
                         'border-radius', 'border-top-left-radius', 'border-top-right-radius',
                         'border-bottom-right-radius', 'border-bottom-left-radius',
                         'outline', 'outline-width', 'outline-style', 'outline-color',
                         'outline-offset',
                         'ring-width', 'ring-color', 'ring-offset-width', 'ring-offset-color'],
                800 => ['opacity', 'mix-blend-mode', 'background-blend-mode',
                         'box-shadow'],
                900 => ['filter', 'backdrop-filter'],
                1000 => ['transition', 'transition-property', 'transition-duration',
                          'transition-timing-function', 'transition-delay',
                          'animation', 'will-change'],
                1100 => ['transform', 'transform-origin', 'perspective', 'perspective-origin'],
                1200 => ['cursor', 'caret-color', 'pointer-events', 'resize',
                          'scroll-behavior', 'scroll-snap-type', 'scroll-snap-align',
                          'touch-action', 'user-select', 'appearance',
                          'accent-color'],
                1300 => ['fill', 'stroke', 'stroke-width'],
            ];
            foreach ($layers as $order => $props) {
                foreach ($props as $prop) {
                    $propOrder[$prop] = $order;
                }
            }
        }

        return $propOrder[$firstProp] ?? 9000;
    }

    // ── Helpers ───────────────────────────────────────────────

    /**
     * Escape a class name for use as a CSS selector.
     * Escapes any character that isn't alphanumeric, hyphen, or underscore.
     * Leading digits require unicode escape (\31  for '1', \32  for '2', etc.)
     */
    private function escapeSelector(string $class): string
    {
        $result = preg_replace_callback('/([^a-zA-Z0-9_-])/', function ($m) {
            return '\\' . $m[0];
        }, $class);
        // Leading digit needs unicode escape: \3N (hex) + space
        if (isset($result[0]) && ctype_digit($result[0])) {
            $result = '\\3' . $result[0] . ' ' . substr($result, 1);
        }
        return $result;
    }

    /**
     * Negate CSS values in declarations.
     * Handles numeric values (1rem → -1rem) and var()/calc() references.
     */
    private function negateDeclarations(string $declarations): string
    {
        return preg_replace_callback(
            '/:\s*([^;]+)/',
            function ($m) {
                $val = trim($m[1]);
                // Numeric value: prepend minus
                if (preg_match('/^\d/', $val)) {
                    return ':-' . $val;
                }
                // var() or other non-numeric: wrap in calc(-1 * ...)
                return ':calc(-1 * ' . $val . ')';
            },
            $declarations
        );
    }

    /** Add !important to every declaration in a semicolon-separated string */
    private function applyImportant(string $declarations): string
    {
        $parts = explode(';', $declarations);
        $result = [];
        foreach ($parts as $part) {
            $part = trim($part);
            if ($part !== '') {
                $result[] = $part . '!important';
            }
        }
        return implode(';', $result);
    }

    private function buildShadowDeclarations(string $shadowValue): string
    {
        return "--tw-shadow:{$shadowValue};box-shadow:" . self::COMPOSED_BOX_SHADOW;
    }

    /**
     * Build the CSS for a gradient stop (from/via/to).
     * Sets the individual variable AND assembles --tw-gradient-stops.
     */
    private function buildGradientStop(string $prefix, string $cssVar, string $color): string
    {
        if ($prefix === 'from-') {
            return "{$cssVar}:{$color};--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to,transparent)";
        }
        if ($prefix === 'via-') {
            return "{$cssVar}:{$color};--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-via),var(--tw-gradient-to,transparent)";
        }
        // to-
        return "{$cssVar}:{$color}";
    }

    /** Check if a value looks like a CSS color (for disambiguation) */
    private function looksLikeColor(string $value): bool
    {
        return str_starts_with($value, '#')
            || str_starts_with($value, 'rgb')
            || str_starts_with($value, 'hsl')
            || str_starts_with($value, 'oklch')
            || str_starts_with($value, 'oklab')
            || str_starts_with($value, 'color-mix')
            || str_starts_with($value, 'var(--c-')
            || str_starts_with($value, 'var(--color-')
            || in_array($value, ['transparent', 'currentColor', 'inherit'], true);
    }

    /**
     * Write compiled CSS to disk, creating directories as needed.
     *
     * @return bool True if the CSS was successfully persisted, false on total failure.
     */
    private function writeOutput(string $path, string $css): bool
    {
        $dir = dirname($path);
        if (!is_dir($dir)) {
            if (!@mkdir($dir, 0755, true) && !is_dir($dir)) {
                Logger::error('tailwind', 'Could not create output directory', [
                    'dir'  => $dir,
                    'path' => $path,
                ]);
                return false;
            }
        }

        // Try atomic write first (rename within same filesystem)
        $tmpPath = $path . '.tmp.' . getmypid();
        $written = @file_put_contents($tmpPath, $css);

        if ($written === false) {
            // tmp write failed — try direct write as fallback
            Logger::warning('tailwind', 'Atomic tmp write failed, falling back to direct write', [
                'path' => $path,
                'tmp'  => $tmpPath,
            ]);
            $fallback = @file_put_contents($path, $css);
            if ($fallback === false) {
                Logger::error('tailwind', 'Direct write also failed — CSS not persisted', [
                    'path' => $path,
                ]);
                return false;
            }
            return true;
        }

        $renamed = @rename($tmpPath, $path);
        if (!$renamed) {
            // rename() failed — likely cross-device (shared symlink) or permissions.
            // Fall back to direct overwrite and clean up the tmp file.
            Logger::warning('tailwind', 'Atomic rename failed, falling back to direct write', [
                'path' => $path,
                'tmp'  => $tmpPath,
            ]);
            $fallback = @file_put_contents($path, $css);
            @unlink($tmpPath);
            if ($fallback === false) {
                Logger::error('tailwind', 'Direct write also failed — CSS not persisted', [
                    'path' => $path,
                ]);
                return false;
            }
            return true;
        }

        Logger::debug('tailwind', 'CSS written', [
            'path' => $path,
            'size' => strlen($css),
        ]);
        return true;
    }
}
