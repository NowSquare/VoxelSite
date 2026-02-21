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
    // Composed CSS function strings — single source of truth for transform/filter composition
    private const COMPOSED_TRANSFORM = 'translate(var(--tw-translate-x,0),var(--tw-translate-y,0)) rotate(var(--tw-rotate,0)) skewX(var(--tw-skew-x,0)) skewY(var(--tw-skew-y,0)) scaleX(var(--tw-scale-x,1)) scaleY(var(--tw-scale-y,1))';
    private const COMPOSED_FILTER = 'var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)';
    private const COMPOSED_BACKDROP = 'var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,)';

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
            $this->writeOutput($outputPath, self::PREFLIGHT_RESETS);
            return ['ok' => true, 'class_count' => 0, 'css_size' => strlen(self::PREFLIGHT_RESETS)];
        }

        $css = $this->compileClasses($classes);
        $fullCss = self::PREFLIGHT_RESETS . "\n" . $css;
        $this->writeOutput($outputPath, $fullCss);

        Logger::debug('tailwind', 'Compile output', [
            'class_count'    => count($classes),
            'css_length'     => strlen($css),
            'total_length'   => strlen($fullCss),
            'outputPath'     => $outputPath,
        ]);

        return ['ok' => true, 'class_count' => count($classes), 'css_size' => strlen($fullCss)];
    }

    /**
     * Compile a set of class names to CSS string.
     * Useful for testing.
     */
    public function compileClasses(array $classes): string
    {
        $this->usedAnimations = [];
        $resolved = [];
        foreach ($classes as $rawClass) {
            $rule = $this->resolveClass($rawClass);
            if ($rule !== null) {
                $key = $rule['selector'] . ($rule['media'] ?? '');
                if (!isset($resolved[$key])) {
                    $resolved[$key] = $rule;
                }
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
        // Match class="...", class='...', and :class="..." (multi-line safe)
        if (preg_match_all('/\bclass\s*=\s*["\']([^"\']*)["\']|:class\s*=\s*["\']([^"\']*)["\']/', $content, $matches)) {
            $allMatches = array_merge($matches[1], $matches[2]);
            foreach ($allMatches as $classString) {
                if (empty($classString)) continue;
                $names = preg_split('/\s+/', trim($classString));
                foreach ($names as $name) {
                    // Skip empty, PHP interpolations, JS expressions, excessively long
                    if ($name !== '' && strlen($name) < 200
                        && !str_contains($name, '<?') && !str_contains($name, '{{')
                        && $name[0] !== '{' && $name[0] !== '$') {
                        $classes[] = $name;
                    }
                }
            }
        }
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
        $pseudoSelector = '';
        $selectorPrefix = '';
        $important = false;
        $utility = $rawClass;

        // Handle !important modifier: !mt-4 or hover:!mt-4
        if (str_starts_with($utility, '!')) {
            $important = true;
            $utility = substr($utility, 1);
        }

        // Strip prefixes: responsive, dark, state, group, peer variants
        $prefixParts = explode(':', $utility);
        if (count($prefixParts) > 1) {
            $utility = array_pop($prefixParts);
            // Check if utility itself has ! (for hover:!mt-4)
            if (str_starts_with($utility, '!')) {
                $important = true;
                $utility = substr($utility, 1);
            }
            foreach ($prefixParts as $prefix) {
                $mq = null;
                if (isset(TailwindConfig::BREAKPOINTS[$prefix])) {
                    $mq = '(min-width:' . TailwindConfig::BREAKPOINTS[$prefix] . ')';
                } elseif (isset(TailwindConfig::MAX_BREAKPOINTS[$prefix])) {
                    $mq = '(max-width:' . TailwindConfig::MAX_BREAKPOINTS[$prefix] . ')';
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
                } elseif (isset(TailwindConfig::STATE_VARIANTS[$prefix])) {
                    $pseudoSelector .= TailwindConfig::STATE_VARIANTS[$prefix];
                } elseif (isset(TailwindConfig::GROUP_VARIANTS[$prefix])) {
                    $selectorPrefix = TailwindConfig::GROUP_VARIANTS[$prefix] . ' ';
                } elseif (isset(TailwindConfig::PEER_VARIANTS[$prefix])) {
                    $selectorPrefix = TailwindConfig::PEER_VARIANTS[$prefix];
                }
                // Accumulate media queries (e.g. dark:md: → combine with 'and')
                if ($mq !== null) {
                    $mediaQuery = $mediaQuery ? $mediaQuery . ' and ' . $mq : $mq;
                }
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

        // Resolve the utility — pass isNegative so transform can handle it internally
        $declarations = $isNegative
            ? $this->resolveUtilityNegated($utility)
            : $this->resolveUtility($utility);
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

        return [
            'selector'     => $selector,
            'declarations' => $declarations,
            'media'        => $mediaQuery,
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
        if ($rest === '') return isset($this->shadowScale['']) ? "box-shadow:{$this->shadowScale['']}" : null;
        if (str_starts_with($rest, '-')) {
            $size = substr($rest, 1);
            if (isset($this->shadowScale[$size])) return "box-shadow:{$this->shadowScale[$size]}";
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
        // Special handling for translate/scale/rotate — use composed transform
        $ct = self::COMPOSED_TRANSFORM;
        if ($prefix === 'translate-x') return "--tw-translate-x:{$value};transform:{$ct}";
        if ($prefix === 'translate-y') return "--tw-translate-y:{$value};transform:{$ct}";
        if ($prefix === 'scale') return "--tw-scale-x:{$value};--tw-scale-y:{$value};transform:{$ct}";
        if ($prefix === 'rotate') return "--tw-rotate:{$value};transform:{$ct}";

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
        $composedTransform = self::COMPOSED_TRANSFORM;

        $neg = fn(string $val) => $negate ? (preg_match('/^\d/', $val) ? '-' . $val : "calc(-1 * {$val})") : $val;

        // scale-x-{n}, scale-y-{n}, scale-{n}
        if (str_starts_with($class, 'scale-x-')) {
            $v = substr($class, 8);
            if (isset($this->scaleValues[$v])) { $sv = $neg($this->scaleValues[$v]); return "--tw-scale-x:{$sv};transform:{$composedTransform}"; }
        }
        if (str_starts_with($class, 'scale-y-')) {
            $v = substr($class, 8);
            if (isset($this->scaleValues[$v])) { $sv = $neg($this->scaleValues[$v]); return "--tw-scale-y:{$sv};transform:{$composedTransform}"; }
        }
        if (str_starts_with($class, 'scale-')) {
            $v = substr($class, 6);
            if (isset($this->scaleValues[$v])) { $sv = $neg($this->scaleValues[$v]); return "--tw-scale-x:{$sv};--tw-scale-y:{$sv};transform:{$composedTransform}"; }
        }
        // rotate-{n}
        if (str_starts_with($class, 'rotate-')) {
            $v = substr($class, 7);
            if (isset($this->rotateValues[$v])) { $rv = $neg($this->rotateValues[$v]); return "--tw-rotate:{$rv};transform:{$composedTransform}"; }
        }
        // translate-x-{v}, translate-y-{v}
        if (str_starts_with($class, 'translate-x-')) {
            $v = substr($class, 12);
            $css = $this->spacingScale[$v] ?? $this->fractionScale[$v] ?? null;
            if ($css !== null) { $tv = $neg($css); return "--tw-translate-x:{$tv};transform:{$composedTransform}"; }
        }
        if (str_starts_with($class, 'translate-y-')) {
            $v = substr($class, 12);
            $css = $this->spacingScale[$v] ?? $this->fractionScale[$v] ?? null;
            if ($css !== null) { $tv = $neg($css); return "--tw-translate-y:{$tv};transform:{$composedTransform}"; }
        }
        // skew-x-{n}, skew-y-{n}
        if (str_starts_with($class, 'skew-x-')) {
            $v = substr($class, 7);
            if (isset($this->skewValues[$v])) { $sv = $neg($this->skewValues[$v]); return "--tw-skew-x:{$sv};transform:{$composedTransform}"; }
        }
        if (str_starts_with($class, 'skew-y-')) {
            $v = substr($class, 7);
            if (isset($this->skewValues[$v])) { $sv = $neg($this->skewValues[$v]); return "--tw-skew-y:{$sv};transform:{$composedTransform}"; }
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
        // ring-{color}
        $cssColor = $this->resolveColorWithOpacity($rest);
        if ($cssColor !== null) {
            return "box-shadow:0 0 0 3px {$cssColor}";
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

        // Group by media query — supports any arbitrary media string
        $baseRules = [];
        $mediaGroups = []; // media string => rules[]

        foreach ($rules as $rule) {
            $media = $rule['media'] ?? null;
            if ($media === null) {
                $baseRules[] = $rule;
            } else {
                $mediaGroups[$media][] = $rule;
            }
        }

        $output = '';

        // Base rules (no media query)
        foreach ($baseRules as $rule) {
            $output .= $rule['selector'] . '{' . $rule['declarations'] . '}';
        }

        // Determine breakpoint order for proper cascade
        $bpOrder = [];
        foreach (TailwindConfig::BREAKPOINTS as $name => $size) {
            $bpOrder["(min-width:{$size})"] = array_search($name, array_keys(TailwindConfig::BREAKPOINTS));
        }
        foreach (TailwindConfig::MAX_BREAKPOINTS as $name => $size) {
            $bpOrder["(max-width:{$size})"] = 100 + array_search($name, array_keys(TailwindConfig::MAX_BREAKPOINTS));
        }

        // Sort media groups: breakpoints in order, then other media queries
        uksort($mediaGroups, function ($a, $b) use ($bpOrder) {
            $oa = $bpOrder[$a] ?? 999;
            $ob = $bpOrder[$b] ?? 999;
            return $oa <=> $ob;
        });

        // Output media groups
        foreach ($mediaGroups as $mediaQuery => $groupRules) {
            $output .= "@media {$mediaQuery}{";
            foreach ($groupRules as $rule) {
                $output .= $rule['selector'] . '{' . $rule['declarations'] . '}';
            }
            $output .= '}';
        }

        return $output;
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

    /** Write compiled CSS to disk, creating directories as needed. */
    private function writeOutput(string $path, string $css): void
    {
        $dir = dirname($path);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        // Try atomic write first (rename within same filesystem)
        $tmpPath = $path . '.tmp.' . getmypid();
        $written = file_put_contents($tmpPath, $css);

        if ($written === false) {
            // tmp write failed — try direct write as fallback
            Logger::warning('tailwind', 'Atomic tmp write failed, falling back to direct write', [
                'path' => $path,
                'tmp'  => $tmpPath,
            ]);
            file_put_contents($path, $css);
            return;
        }

        $renamed = @rename($tmpPath, $path);
        if (!$renamed) {
            // rename() failed — likely cross-device (shared symlink) or permissions.
            // Fall back to direct overwrite and clean up the tmp file.
            Logger::warning('tailwind', 'Atomic rename failed, falling back to direct write', [
                'path' => $path,
                'tmp'  => $tmpPath,
            ]);
            file_put_contents($path, $css);
            @unlink($tmpPath);
            return;
        }

        Logger::debug('tailwind', 'CSS written', [
            'path' => $path,
            'size' => strlen($css),
        ]);
    }
}
