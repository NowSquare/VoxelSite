<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Configuration data for the PHP TailwindCompiler.
 *
 * Contains all utility definitions, spacing scales, theme color
 * mappings, and static utility lookups. Pure data, no logic.
 */
class TailwindConfig
{
    public const BREAKPOINTS = [
        'sm'  => '640px',
        'md'  => '768px',
        'lg'  => '1024px',
        'xl'  => '1280px',
        '2xl' => '1536px',
    ];

    public const MAX_BREAKPOINTS = [
        'max-sm'  => '639.98px',
        'max-md'  => '767.98px',
        'max-lg'  => '1023.98px',
        'max-xl'  => '1279.98px',
        'max-2xl' => '1535.98px',
    ];

    public const STATE_VARIANTS = [
        // Pseudo-classes
        'hover'              => ':hover',
        'focus'              => ':focus',
        'focus-visible'      => ':focus-visible',
        'focus-within'       => ':focus-within',
        'active'             => ':active',
        'visited'            => ':visited',
        'first'              => ':first-child',
        'last'               => ':last-child',
        'only'               => ':only-child',
        'odd'                => ':nth-child(odd)',
        'even'               => ':nth-child(even)',
        'first-of-type'      => ':first-of-type',
        'last-of-type'       => ':last-of-type',
        'only-of-type'       => ':only-of-type',
        'disabled'           => ':disabled',
        'enabled'            => ':enabled',
        'required'           => ':required',
        'optional'           => ':optional',
        'checked'            => ':checked',
        'indeterminate'      => ':indeterminate',
        'default'            => ':default',
        'valid'              => ':valid',
        'invalid'            => ':invalid',
        'in-range'           => ':in-range',
        'out-of-range'       => ':out-of-range',
        'read-only'          => ':read-only',
        'read-write'         => ':read-write',
        'placeholder-shown'  => ':placeholder-shown',
        'autofill'           => ':autofill',
        'empty'              => ':empty',
        'target'             => ':target',
        'open'               => '[open]',
        // Pseudo-elements
        'before'             => '::before',
        'after'              => '::after',
        'placeholder'        => '::placeholder',
        'marker'             => '::marker',
        'selection'          => '::selection',
        'first-line'         => '::first-line',
        'first-letter'       => '::first-letter',
        'file'               => '::file-selector-button',
        'backdrop'           => '::backdrop',
    ];

    /** Group variants — ancestor selector + descendant combinator */
    public const GROUP_VARIANTS = [
        'group-hover'        => '.group:hover',
        'group-focus'        => '.group:focus',
        'group-focus-within' => '.group:focus-within',
        'group-active'       => '.group:active',
        'group-disabled'     => '.group:disabled',
        'group-first'        => '.group:first-child',
        'group-last'         => '.group:last-child',
        'group-odd'          => '.group:nth-child(odd)',
        'group-even'         => '.group:nth-child(even)',
    ];

    /** Peer variants — sibling selector + general sibling combinator */
    public const PEER_VARIANTS = [
        'peer-hover'             => '.peer:hover~',
        'peer-focus'             => '.peer:focus~',
        'peer-focus-visible'     => '.peer:focus-visible~',
        'peer-active'            => '.peer:active~',
        'peer-checked'           => '.peer:checked~',
        'peer-disabled'          => '.peer:disabled~',
        'peer-required'          => '.peer:required~',
        'peer-invalid'           => '.peer:invalid~',
        'peer-placeholder-shown' => '.peer:placeholder-shown~',
    ];

    public static function spacingScale(): array
    {
        return [
            '0' => '0px', 'px' => '1px',
            '0.5' => '0.125rem', '1' => '0.25rem', '1.5' => '0.375rem',
            '2' => '0.5rem', '2.5' => '0.625rem', '3' => '0.75rem',
            '3.5' => '0.875rem', '4' => '1rem', '5' => '1.25rem',
            '6' => '1.5rem', '7' => '1.75rem', '8' => '2rem',
            '9' => '2.25rem', '10' => '2.5rem', '11' => '2.75rem',
            '12' => '3rem', '14' => '3.5rem', '16' => '4rem',
            '20' => '5rem', '24' => '6rem', '28' => '7rem',
            '32' => '8rem', '36' => '9rem', '40' => '10rem',
            '44' => '11rem', '48' => '12rem', '52' => '13rem',
            '56' => '14rem', '60' => '15rem', '64' => '16rem',
            '72' => '18rem', '80' => '20rem', '96' => '24rem',
        ];
    }

    public static function fractionScale(): array
    {
        return [
            '1/2' => '50%', '1/3' => '33.333333%', '2/3' => '66.666667%',
            '1/4' => '25%', '2/4' => '50%', '3/4' => '75%',
            '1/5' => '20%', '2/5' => '40%', '3/5' => '60%', '4/5' => '80%',
            '1/6' => '16.666667%', '2/6' => '33.333333%', '3/6' => '50%',
            '4/6' => '66.666667%', '5/6' => '83.333333%',
            '1/12' => '8.333333%', '2/12' => '16.666667%', '3/12' => '25%',
            '4/12' => '33.333333%', '5/12' => '41.666667%', '6/12' => '50%',
            '7/12' => '58.333333%', '8/12' => '66.666667%', '9/12' => '75%',
            '10/12' => '83.333333%', '11/12' => '91.666667%',
            'full' => '100%',
        ];
    }

    public static function opacityScale(): array
    {
        return [
            '0' => '0', '5' => '0.05', '10' => '0.1', '15' => '0.15',
            '20' => '0.2', '25' => '0.25', '30' => '0.3', '35' => '0.35',
            '40' => '0.4', '45' => '0.45', '50' => '0.5', '55' => '0.55',
            '60' => '0.6', '65' => '0.65', '70' => '0.7', '75' => '0.75',
            '80' => '0.8', '85' => '0.85', '90' => '0.9', '95' => '0.95',
            '100' => '1',
        ];
    }

    /** Theme colors mapped to style.css custom properties */
    public static function themeColors(): array
    {
        $colors = [
            'transparent' => 'transparent', 'current' => 'currentColor',
            'inherit' => 'inherit', 'white' => '#fff', 'black' => '#000',
            // Semantic
            'surface' => 'var(--c-surface)', 'surface-hover' => 'var(--c-surface-hover)',
            'elevated' => 'var(--c-bg-elevated)',
            'bg' => 'var(--c-bg)', 'bg-alt' => 'var(--c-bg-alt)',
            'muted' => 'var(--c-text-muted)', 'inverted' => 'var(--c-text-inverted)',
            'link' => 'var(--c-link)', 'link-hover' => 'var(--c-link-hover)',
            'success' => 'var(--c-success)', 'warning' => 'var(--c-warning)',
            'error' => 'var(--c-error)', 'overlay' => 'var(--c-overlay)',
            'border' => 'var(--c-border)', 'border-strong' => 'var(--c-border-strong)',
        ];
        // Generate scales: primary, secondary, accent, neutral (foundation token palettes)
        foreach (['primary', 'secondary', 'accent', 'neutral'] as $palette) {
            // Bare name (e.g. "primary") → maps to the -500 shade
            // AI models commonly use bg-primary, text-accent, etc. without a shade number
            $colors[$palette] = "var(--c-{$palette}-500)";
            foreach ([50,100,200,300,400,500,600,700,800,900,950] as $shade) {
                $colors["{$palette}-{$shade}"] = "var(--c-{$palette}-{$shade})";
            }
        }

        // ── Standard Tailwind color palette ──────────────────────────
        // AI models frequently use standard Tailwind colors (gray-700, yellow-400, etc.)
        // in generated markup. Without these, the compiler silently drops color classes.
        $twColors = [
            'slate' => [
                50=>'#f8fafc',100=>'#f1f5f9',200=>'#e2e8f0',300=>'#cbd5e1',400=>'#94a3b8',
                500=>'#64748b',600=>'#475569',700=>'#334155',800=>'#1e293b',900=>'#0f172a',950=>'#020617',
            ],
            'gray' => [
                50=>'#f9fafb',100=>'#f3f4f6',200=>'#e5e7eb',300=>'#d1d5db',400=>'#9ca3af',
                500=>'#6b7280',600=>'#4b5563',700=>'#374151',800=>'#1f2937',900=>'#111827',950=>'#030712',
            ],
            'zinc' => [
                50=>'#fafafa',100=>'#f4f4f5',200=>'#e4e4e7',300=>'#d4d4d8',400=>'#a1a1aa',
                500=>'#71717a',600=>'#52525b',700=>'#3f3f46',800=>'#27272a',900=>'#18181b',950=>'#09090b',
            ],
            'stone' => [
                50=>'#fafaf9',100=>'#f5f5f4',200=>'#e7e5e4',300=>'#d6d3d1',400=>'#a8a29e',
                500=>'#78716c',600=>'#57534e',700=>'#44403c',800=>'#292524',900=>'#1c1917',950=>'#0c0a09',
            ],
            'red' => [
                50=>'#fef2f2',100=>'#fee2e2',200=>'#fecaca',300=>'#fca5a5',400=>'#f87171',
                500=>'#ef4444',600=>'#dc2626',700=>'#b91c1c',800=>'#991b1b',900=>'#7f1d1d',950=>'#450a0a',
            ],
            'orange' => [
                50=>'#fff7ed',100=>'#ffedd5',200=>'#fed7aa',300=>'#fdba74',400=>'#fb923c',
                500=>'#f97316',600=>'#ea580c',700=>'#c2410c',800=>'#9a3412',900=>'#7c2d12',950=>'#431407',
            ],
            'amber' => [
                50=>'#fffbeb',100=>'#fef3c7',200=>'#fde68a',300=>'#fcd34d',400=>'#fbbf24',
                500=>'#f59e0b',600=>'#d97706',700=>'#b45309',800=>'#92400e',900=>'#78350f',950=>'#451a03',
            ],
            'yellow' => [
                50=>'#fefce8',100=>'#fef9c3',200=>'#fef08a',300=>'#fde047',400=>'#facc15',
                500=>'#eab308',600=>'#ca8a04',700=>'#a16207',800=>'#854d0e',900=>'#713f12',950=>'#422006',
            ],
            'lime' => [
                50=>'#f7fee7',100=>'#ecfccb',200=>'#d9f99d',300=>'#bef264',400=>'#a3e635',
                500=>'#84cc16',600=>'#65a30d',700=>'#4d7c0f',800=>'#3f6212',900=>'#365314',950=>'#1a2e05',
            ],
            'green' => [
                50=>'#f0fdf4',100=>'#dcfce7',200=>'#bbf7d0',300=>'#86efac',400=>'#4ade80',
                500=>'#22c55e',600=>'#16a34a',700=>'#15803d',800=>'#166534',900=>'#14532d',950=>'#052e16',
            ],
            'emerald' => [
                50=>'#ecfdf5',100=>'#d1fae5',200=>'#a7f3d0',300=>'#6ee7b7',400=>'#34d399',
                500=>'#10b981',600=>'#059669',700=>'#047857',800=>'#065f46',900=>'#064e3b',950=>'#022c22',
            ],
            'teal' => [
                50=>'#f0fdfa',100=>'#ccfbf1',200=>'#99f6e4',300=>'#5eead4',400=>'#2dd4bf',
                500=>'#14b8a6',600=>'#0d9488',700=>'#0f766e',800=>'#115e59',900=>'#134e4a',950=>'#042f2e',
            ],
            'cyan' => [
                50=>'#ecfeff',100=>'#cffafe',200=>'#a5f3fc',300=>'#67e8f9',400=>'#22d3ee',
                500=>'#06b6d4',600=>'#0891b2',700=>'#0e7490',800=>'#155e75',900=>'#164e63',950=>'#083344',
            ],
            'sky' => [
                50=>'#f0f9ff',100=>'#e0f2fe',200=>'#bae6fd',300=>'#7dd3fc',400=>'#38bdf8',
                500=>'#0ea5e9',600=>'#0284c7',700=>'#0369a1',800=>'#075985',900=>'#0c4a6e',950=>'#082f49',
            ],
            'blue' => [
                50=>'#eff6ff',100=>'#dbeafe',200=>'#bfdbfe',300=>'#93c5fd',400=>'#60a5fa',
                500=>'#3b82f6',600=>'#2563eb',700=>'#1d4ed8',800=>'#1e40af',900=>'#1e3a8a',950=>'#172554',
            ],
            'indigo' => [
                50=>'#eef2ff',100=>'#e0e7ff',200=>'#c7d2fe',300=>'#a5b4fc',400=>'#818cf8',
                500=>'#6366f1',600=>'#4f46e5',700=>'#4338ca',800=>'#3730a3',900=>'#312e81',950=>'#1e1b4b',
            ],
            'violet' => [
                50=>'#f5f3ff',100=>'#ede9fe',200=>'#ddd6fe',300=>'#c4b5fd',400=>'#a78bfa',
                500=>'#8b5cf6',600=>'#7c3aed',700=>'#6d28d9',800=>'#5b21b6',900=>'#4c1d95',950=>'#2e1065',
            ],
            'purple' => [
                50=>'#faf5ff',100=>'#f3e8ff',200=>'#e9d5ff',300=>'#d8b4fe',400=>'#c084fc',
                500=>'#a855f7',600=>'#9333ea',700=>'#7e22ce',800=>'#6b21a8',900=>'#581c87',950=>'#3b0764',
            ],
            'fuchsia' => [
                50=>'#fdf4ff',100=>'#fae8ff',200=>'#f5d0fe',300=>'#f0abfc',400=>'#e879f9',
                500=>'#d946ef',600=>'#c026d3',700=>'#a21caf',800=>'#86198f',900=>'#701a75',950=>'#4a044e',
            ],
            'pink' => [
                50=>'#fdf2f8',100=>'#fce7f3',200=>'#fbcfe8',300=>'#f9a8d4',400=>'#f472b6',
                500=>'#ec4899',600=>'#db2777',700=>'#be185d',800=>'#9d174d',900=>'#831843',950=>'#500724',
            ],
            'rose' => [
                50=>'#fff1f2',100=>'#ffe4e6',200=>'#fecdd3',300=>'#fda4af',400=>'#fb7185',
                500=>'#f43f5e',600=>'#e11d48',700=>'#be123c',800=>'#9f1239',900=>'#881337',950=>'#4c0519',
            ],
        ];
        foreach ($twColors as $name => $shades) {
            // Bare color name maps to -500 shade (e.g. "gray" → gray-500)
            $colors[$name] = $shades[500];
            foreach ($shades as $shade => $hex) {
                $colors["{$name}-{$shade}"] = $hex;
            }
        }

        return $colors;
    }

    /** Semantic aliases — theme-mapped shortcuts for foundation tokens */
    public static function semanticAliases(): array
    {
        return [
            'font-heading' => 'font-family:var(--font-heading)',
            'font-body'    => 'font-family:var(--font-body)',
            'font-accent'  => 'font-family:var(--font-accent)',
            // font-mono handled by staticUtilities with var(--font-mono, fallback)
            'py-section'   => 'padding-top:var(--section-padding-y);padding-bottom:var(--section-padding-y)',
            'max-w-container' => 'max-width:var(--container-max)',
            'px-container' => 'padding-left:var(--container-padding);padding-right:var(--container-padding)',
            'gap-stack'    => 'gap:var(--stack-gap)',
            'gap-grid'     => 'gap:var(--grid-gap)',
            'rounded-default' => 'border-radius:var(--radius-default)',
            'shadow-default'  => 'box-shadow:var(--shadow-md)',
        ];
    }

    /** Typography size tokens — hardcoded Tailwind defaults.
 *  Previously referenced var(--text-*) custom properties, but
 *  style.css does not define these, causing all text to render
 *  at inherited size. Using standard rem values instead. */
public static function textSizes(): array
{
    return [
        'xs'   => 'font-size:0.75rem;line-height:1rem',
        'sm'   => 'font-size:0.875rem;line-height:1.25rem',
        'base' => 'font-size:1rem;line-height:1.5rem',
        'lg'   => 'font-size:1.125rem;line-height:1.75rem',
        'xl'   => 'font-size:1.25rem;line-height:1.75rem',
        '2xl'  => 'font-size:1.5rem;line-height:2rem',
        '3xl'  => 'font-size:1.875rem;line-height:2.25rem',
        '4xl'  => 'font-size:2.25rem;line-height:2.5rem',
        '5xl'  => 'font-size:3rem;line-height:1',
        '6xl'  => 'font-size:3.75rem;line-height:1',
        '7xl'  => 'font-size:4.5rem;line-height:1',
        '8xl'  => 'font-size:6rem;line-height:1',
        '9xl'  => 'font-size:8rem;line-height:1',
    ];
}

    public static function fontWeights(): array
    {
        return [
            'thin' => '100', 'extralight' => '200', 'light' => '300',
            'normal' => '400', 'medium' => '500', 'semibold' => '600',
            'bold' => '700', 'extrabold' => '800', 'black' => '900',
        ];
    }

    public static function borderRadiusScale(): array
    {
        // Use var() with fallback: respects design tokens from style.css,
        // falls back to standard Tailwind values if variables are undefined.
        return [
            'none' => '0px',
            'sm'   => 'var(--radius-sm, 0.125rem)',
            ''     => 'var(--radius-default, 0.25rem)',
            'md'   => 'var(--radius-md, 0.375rem)',
            'lg'   => 'var(--radius-lg, 0.5rem)',
            'xl'   => 'var(--radius-xl, 0.75rem)',
            '2xl'  => '1rem',
            '3xl'  => '1.5rem',
            'full' => '9999px',
        ];
    }

    public static function shadowScale(): array
    {
        return [
            'sm'    => 'var(--shadow-sm, 0 1px 2px 0 rgba(0,0,0,0.05))',
            ''      => 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))',
            'md'    => 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))',
            'lg'    => 'var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1))',
            'xl'    => 'var(--shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.1))',
            '2xl'   => '0 25px 50px -12px rgba(0,0,0,0.25)',
            'inner' => 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
            'none'  => '0 0 #0000',
        ];
    }

    /** Transform scale multipliers */
    public static function scaleValues(): array
    {
        return [
            '0'=>'0','50'=>'.5','75'=>'.75','90'=>'.9','95'=>'.95',
            '100'=>'1','105'=>'1.05','110'=>'1.1','125'=>'1.25','150'=>'1.5','200'=>'2',
        ];
    }

    /** Rotate angles */
    public static function rotateValues(): array
    {
        return [
            '0'=>'0deg','1'=>'1deg','2'=>'2deg','3'=>'3deg',
            '6'=>'6deg','12'=>'12deg','45'=>'45deg','90'=>'90deg','180'=>'180deg',
        ];
    }

    /** Skew angles */
    public static function skewValues(): array
    {
        return ['0'=>'0deg','1'=>'1deg','2'=>'2deg','3'=>'3deg','6'=>'6deg','12'=>'12deg'];
    }

    /** Animation keyframes */
    public static function animationKeyframes(): array
    {
        return [
            'spin'   => '@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
            'ping'   => '@keyframes ping{75%,100%{transform:scale(2);opacity:0}}',
            'pulse'  => '@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}',
            'bounce' => '@keyframes bounce{0%,100%{transform:translateY(-25%);animation-timing-function:cubic-bezier(0.8,0,1,1)}50%{transform:translateY(0);animation-timing-function:cubic-bezier(0,0,0.2,1)}}',
        ];
    }

    /** Map of arbitrary-value prefixes to CSS properties */
    public static function arbitraryPrefixMap(): array
    {
        return [
            'p'  => ['padding'], 'px' => ['padding-left','padding-right'],
            'py' => ['padding-top','padding-bottom'],
            'pt' => ['padding-top'], 'pr' => ['padding-right'],
            'pb' => ['padding-bottom'], 'pl' => ['padding-left'],
            'ps' => ['padding-inline-start'], 'pe' => ['padding-inline-end'],
            'm'  => ['margin'], 'mx' => ['margin-left','margin-right'],
            'my' => ['margin-top','margin-bottom'],
            'mt' => ['margin-top'], 'mr' => ['margin-right'],
            'mb' => ['margin-bottom'], 'ml' => ['margin-left'],
            'ms' => ['margin-inline-start'], 'me' => ['margin-inline-end'],
            'w' => ['width'], 'h' => ['height'],
            'min-w' => ['min-width'], 'min-h' => ['min-height'],
            'max-w' => ['max-width'], 'max-h' => ['max-height'],
            'size' => ['width','height'],
            'gap' => ['gap'], 'gap-x' => ['column-gap'], 'gap-y' => ['row-gap'],
            'top' => ['top'], 'right' => ['right'],
            'bottom' => ['bottom'], 'left' => ['left'],
            'inset' => ['inset'], 'inset-x' => ['left','right'],
            'inset-y' => ['top','bottom'], 'z' => ['z-index'],
            'rounded' => ['border-radius'], 'basis' => ['flex-basis'],
            'leading' => ['line-height'], 'tracking' => ['letter-spacing'],
            'indent' => ['text-indent'], 'columns' => ['columns'],
            'scroll-m' => ['scroll-margin'],
            'scroll-mt' => ['scroll-margin-top'], 'scroll-mb' => ['scroll-margin-bottom'],
            'scroll-ml' => ['scroll-margin-left'], 'scroll-mr' => ['scroll-margin-right'],
            'scroll-p' => ['scroll-padding'],
            'scroll-pt' => ['scroll-padding-top'], 'scroll-pb' => ['scroll-padding-bottom'],
            'scroll-pl' => ['scroll-padding-left'], 'scroll-pr' => ['scroll-padding-right'],
            'duration' => ['transition-duration'], 'delay' => ['transition-delay'],
            'grid-cols' => ['grid-template-columns'],
            'grid-rows' => ['grid-template-rows'],
            'aspect' => ['aspect-ratio'],
            'opacity' => ['opacity'],
            'outline-offset' => ['outline-offset'],
            'ring-offset' => ['--tw-ring-offset-width'],
            'stroke' => ['stroke-width'],
            'order' => ['order'],
            'flex' => ['flex'],
            'grow' => ['flex-grow'], 'shrink' => ['flex-shrink'],
        ];
    }

    /** Static utilities — exact class name to CSS declarations */
    public static function staticUtilities(): array
    {
        return [
            // Display
            'block' => 'display:block', 'inline-block' => 'display:inline-block',
            'inline' => 'display:inline', 'flex' => 'display:flex',
            'inline-flex' => 'display:inline-flex', 'grid' => 'display:grid',
            'inline-grid' => 'display:inline-grid', 'table' => 'display:table',
            'table-row' => 'display:table-row', 'table-cell' => 'display:table-cell',
            'table-caption' => 'display:table-caption',
            'table-column' => 'display:table-column',
            'table-column-group' => 'display:table-column-group',
            'table-footer-group' => 'display:table-footer-group',
            'table-header-group' => 'display:table-header-group',
            'table-row-group' => 'display:table-row-group',
            'contents' => 'display:contents', 'flow-root' => 'display:flow-root',
            'list-item' => 'display:list-item', 'hidden' => 'display:none',
            // Flex direction
            'flex-row' => 'flex-direction:row', 'flex-col' => 'flex-direction:column',
            'flex-row-reverse' => 'flex-direction:row-reverse',
            'flex-col-reverse' => 'flex-direction:column-reverse',
            // Flex wrap
            'flex-wrap' => 'flex-wrap:wrap', 'flex-nowrap' => 'flex-wrap:nowrap',
            'flex-wrap-reverse' => 'flex-wrap:wrap-reverse',
            // Flex sizing
            'flex-1' => 'flex:1 1 0%', 'flex-auto' => 'flex:1 1 auto',
            'flex-initial' => 'flex:0 1 auto', 'flex-none' => 'flex:none',
            'grow' => 'flex-grow:1', 'grow-0' => 'flex-grow:0',
            'shrink' => 'flex-shrink:1', 'shrink-0' => 'flex-shrink:0',
            // Legacy aliases (AI models frequently emit these)
            'flex-shrink-0' => 'flex-shrink:0', 'flex-shrink' => 'flex-shrink:1',
            'flex-grow-0' => 'flex-grow:0', 'flex-grow' => 'flex-grow:1',
            'justify-normal' => 'justify-content:normal',
            'justify-start' => 'justify-content:flex-start',
            'justify-end' => 'justify-content:flex-end',
            'justify-center' => 'justify-content:center',
            'justify-between' => 'justify-content:space-between',
            'justify-around' => 'justify-content:space-around',
            'justify-evenly' => 'justify-content:space-evenly',
            'justify-stretch' => 'justify-content:stretch',
            // Justify items
            'justify-items-start' => 'justify-items:start',
            'justify-items-end' => 'justify-items:end',
            'justify-items-center' => 'justify-items:center',
            'justify-items-stretch' => 'justify-items:stretch',
            // Justify self
            'justify-self-auto' => 'justify-self:auto',
            'justify-self-start' => 'justify-self:start',
            'justify-self-end' => 'justify-self:end',
            'justify-self-center' => 'justify-self:center',
            'justify-self-stretch' => 'justify-self:stretch',
            // Align items
            'items-start' => 'align-items:flex-start', 'items-end' => 'align-items:flex-end',
            'items-center' => 'align-items:center', 'items-baseline' => 'align-items:baseline',
            'items-stretch' => 'align-items:stretch',
            // Align self
            'self-auto' => 'align-self:auto', 'self-start' => 'align-self:flex-start',
            'self-end' => 'align-self:flex-end', 'self-center' => 'align-self:center',
            'self-stretch' => 'align-self:stretch', 'self-baseline' => 'align-self:baseline',
            // Align content
            'content-normal' => 'align-content:normal',
            'content-start' => 'align-content:flex-start',
            'content-end' => 'align-content:flex-end',
            'content-center' => 'align-content:center',
            'content-between' => 'align-content:space-between',
            'content-around' => 'align-content:space-around',
            'content-evenly' => 'align-content:space-evenly',
            'content-baseline' => 'align-content:baseline',
            'content-stretch' => 'align-content:stretch',
            // Place
            'place-items-center' => 'place-items:center',
            'place-items-start' => 'place-items:start',
            'place-items-end' => 'place-items:end',
            'place-items-baseline' => 'place-items:baseline',
            'place-items-stretch' => 'place-items:stretch',
            'place-content-center' => 'place-content:center',
            'place-content-start' => 'place-content:start',
            'place-content-end' => 'place-content:end',
            'place-content-between' => 'place-content:space-between',
            'place-content-around' => 'place-content:space-around',
            'place-content-evenly' => 'place-content:space-evenly',
            'place-content-baseline' => 'place-content:baseline',
            'place-content-stretch' => 'place-content:stretch',
            'place-self-auto' => 'place-self:auto',
            'place-self-center' => 'place-self:center',
            'place-self-start' => 'place-self:start',
            'place-self-end' => 'place-self:end',
            'place-self-stretch' => 'place-self:stretch',
            // Position
            'relative' => 'position:relative', 'absolute' => 'position:absolute',
            'fixed' => 'position:fixed', 'sticky' => 'position:sticky',
            'static' => 'position:static',
            // Float / Clear
            'float-left' => 'float:left', 'float-right' => 'float:right',
            'float-none' => 'float:none',
            'clear-left' => 'clear:left', 'clear-right' => 'clear:right',
            'clear-both' => 'clear:both', 'clear-none' => 'clear:none',
            // Overflow
            'overflow-auto' => 'overflow:auto', 'overflow-hidden' => 'overflow:hidden',
            'overflow-visible' => 'overflow:visible', 'overflow-scroll' => 'overflow:scroll',
            'overflow-clip' => 'overflow:clip',
            'overflow-x-auto' => 'overflow-x:auto', 'overflow-x-hidden' => 'overflow-x:hidden',
            'overflow-x-scroll' => 'overflow-x:scroll', 'overflow-x-clip' => 'overflow-x:clip',
            'overflow-x-visible' => 'overflow-x:visible',
            'overflow-y-auto' => 'overflow-y:auto', 'overflow-y-hidden' => 'overflow-y:hidden',
            'overflow-y-scroll' => 'overflow-y:scroll', 'overflow-y-clip' => 'overflow-y:clip',
            'overflow-y-visible' => 'overflow-y:visible',
            // Text alignment
            'text-left' => 'text-align:left', 'text-center' => 'text-align:center',
            'text-right' => 'text-align:right', 'text-justify' => 'text-align:justify',
            'text-start' => 'text-align:start', 'text-end' => 'text-align:end',
            // Text transform
            'uppercase' => 'text-transform:uppercase', 'lowercase' => 'text-transform:lowercase',
            'capitalize' => 'text-transform:capitalize', 'normal-case' => 'text-transform:none',
            // Text decoration
            'underline' => 'text-decoration-line:underline',
            'overline' => 'text-decoration-line:overline',
            'line-through' => 'text-decoration-line:line-through',
            'no-underline' => 'text-decoration-line:none',
            // Font style
            'italic' => 'font-style:italic', 'not-italic' => 'font-style:normal',
            // Font family — use CSS custom properties with system-font fallbacks
            'font-sans' => "font-family:var(--font-sans,ui-sans-serif,system-ui,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji')",
            'font-serif' => "font-family:var(--font-serif,ui-serif,Georgia,Cambria,'Times New Roman',Times,serif)",
            'font-mono' => "font-family:var(--font-mono,ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace)",
            // Font smoothing
            'antialiased' => '-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale',
            'subpixel-antialiased' => '-webkit-font-smoothing:auto;-moz-osx-font-smoothing:auto',
            // Whitespace
            'whitespace-normal' => 'white-space:normal', 'whitespace-nowrap' => 'white-space:nowrap',
            'whitespace-pre' => 'white-space:pre', 'whitespace-pre-line' => 'white-space:pre-line',
            'whitespace-pre-wrap' => 'white-space:pre-wrap',
            'whitespace-break-spaces' => 'white-space:break-spaces',
            // Word break
            'break-normal' => 'overflow-wrap:normal;word-break:normal',
            'break-words' => 'overflow-wrap:break-word',
            'break-all' => 'word-break:break-all', 'break-keep' => 'word-break:keep-all',
            // Truncate
            'truncate' => 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap',
            'text-ellipsis' => 'text-overflow:ellipsis', 'text-clip' => 'text-overflow:clip',
            // Visibility
            'visible' => 'visibility:visible', 'invisible' => 'visibility:hidden',
            'collapse' => 'visibility:collapse',
            // Box sizing
            'box-border' => 'box-sizing:border-box', 'box-content' => 'box-sizing:content-box',
            // Sizing keywords
            'w-auto' => 'width:auto', 'w-full' => 'width:100%',
            'w-screen' => 'width:100vw', 'w-svw' => 'width:100svw',
            'w-min' => 'width:min-content', 'w-max' => 'width:max-content',
            'w-fit' => 'width:fit-content',
            'h-auto' => 'height:auto', 'h-full' => 'height:100%',
            'h-screen' => 'height:100vh', 'h-svh' => 'height:100svh',
            'h-dvh' => 'height:100dvh',
            'h-min' => 'height:min-content', 'h-max' => 'height:max-content',
            'h-fit' => 'height:fit-content',
            'min-w-0' => 'min-width:0px', 'min-w-full' => 'min-width:100%',
            'min-w-min' => 'min-width:min-content', 'min-w-max' => 'min-width:max-content',
            'min-w-fit' => 'min-width:fit-content',
            'min-w-svw' => 'min-width:100svw', 'min-w-dvw' => 'min-width:100dvw',
            'min-w-lvw' => 'min-width:100lvw',
            'min-h-0' => 'min-height:0px', 'min-h-full' => 'min-height:100%',
            'min-h-screen' => 'min-height:100vh', 'min-h-svh' => 'min-height:100svh',
            'min-h-dvh' => 'min-height:100dvh', 'min-h-lvh' => 'min-height:100lvh',
            'min-h-fit' => 'min-height:fit-content',
            'max-w-none' => 'max-width:none', 'max-w-full' => 'max-width:100%',
            'max-w-min' => 'max-width:min-content', 'max-w-max' => 'max-width:max-content',
            'max-w-fit' => 'max-width:fit-content',
            'max-w-prose' => 'max-width:65ch',
            'max-w-xs' => 'max-width:20rem', 'max-w-sm' => 'max-width:24rem',
            'max-w-md' => 'max-width:28rem', 'max-w-lg' => 'max-width:32rem',
            'max-w-xl' => 'max-width:36rem', 'max-w-2xl' => 'max-width:42rem',
            'max-w-3xl' => 'max-width:48rem', 'max-w-4xl' => 'max-width:56rem',
            'max-w-5xl' => 'max-width:64rem', 'max-w-6xl' => 'max-width:72rem',
            'max-w-7xl' => 'max-width:80rem',
            'max-w-screen-sm' => 'max-width:640px', 'max-w-screen-md' => 'max-width:768px',
            'max-w-screen-lg' => 'max-width:1024px', 'max-w-screen-xl' => 'max-width:1280px',
            'max-w-screen-2xl' => 'max-width:1536px',
            'max-h-none' => 'max-height:none', 'max-h-full' => 'max-height:100%',
            'max-h-screen' => 'max-height:100vh', 'max-h-fit' => 'max-height:fit-content',
            'max-h-svh' => 'max-height:100svh', 'max-h-dvh' => 'max-height:100dvh',
            'max-h-lvh' => 'max-height:100lvh',
            'size-auto' => 'width:auto;height:auto', 'size-full' => 'width:100%;height:100%',
            // Margin auto
            'mx-auto' => 'margin-left:auto;margin-right:auto',
            'my-auto' => 'margin-top:auto;margin-bottom:auto',
            'ml-auto' => 'margin-left:auto', 'mr-auto' => 'margin-right:auto',
            'mt-auto' => 'margin-top:auto', 'mb-auto' => 'margin-bottom:auto',
            'm-auto' => 'margin:auto',
            // Inset
            'inset-0' => 'inset:0px', 'inset-auto' => 'inset:auto',
            'inset-x-0' => 'left:0px;right:0px', 'inset-y-0' => 'top:0px;bottom:0px',
            'top-0' => 'top:0px', 'right-0' => 'right:0px',
            'bottom-0' => 'bottom:0px', 'left-0' => 'left:0px',
            'top-auto' => 'top:auto', 'right-auto' => 'right:auto',
            'bottom-auto' => 'bottom:auto', 'left-auto' => 'left:auto',
            // Cursor
            'cursor-auto' => 'cursor:auto', 'cursor-default' => 'cursor:default',
            'cursor-pointer' => 'cursor:pointer', 'cursor-wait' => 'cursor:wait',
            'cursor-text' => 'cursor:text', 'cursor-move' => 'cursor:move',
            'cursor-help' => 'cursor:help', 'cursor-not-allowed' => 'cursor:not-allowed',
            'cursor-none' => 'cursor:none', 'cursor-grab' => 'cursor:grab',
            'cursor-grabbing' => 'cursor:grabbing',
            'cursor-zoom-in' => 'cursor:zoom-in', 'cursor-zoom-out' => 'cursor:zoom-out',
            'cursor-context-menu' => 'cursor:context-menu', 'cursor-progress' => 'cursor:progress',
            'cursor-cell' => 'cursor:cell', 'cursor-crosshair' => 'cursor:crosshair',
            'cursor-vertical-text' => 'cursor:vertical-text', 'cursor-alias' => 'cursor:alias',
            'cursor-copy' => 'cursor:copy', 'cursor-no-drop' => 'cursor:no-drop',
            'cursor-all-scroll' => 'cursor:all-scroll',
            'cursor-col-resize' => 'cursor:col-resize', 'cursor-row-resize' => 'cursor:row-resize',
            'cursor-n-resize' => 'cursor:n-resize', 'cursor-e-resize' => 'cursor:e-resize',
            'cursor-s-resize' => 'cursor:s-resize', 'cursor-w-resize' => 'cursor:w-resize',
            'cursor-ne-resize' => 'cursor:ne-resize', 'cursor-nw-resize' => 'cursor:nw-resize',
            'cursor-se-resize' => 'cursor:se-resize', 'cursor-sw-resize' => 'cursor:sw-resize',
            'cursor-ew-resize' => 'cursor:ew-resize', 'cursor-ns-resize' => 'cursor:ns-resize',
            'cursor-nesw-resize' => 'cursor:nesw-resize', 'cursor-nwse-resize' => 'cursor:nwse-resize',
            // Pointer events
            'pointer-events-none' => 'pointer-events:none',
            'pointer-events-auto' => 'pointer-events:auto',
            // User select
            'select-none' => 'user-select:none', 'select-text' => 'user-select:text',
            'select-all' => 'user-select:all', 'select-auto' => 'user-select:auto',
            // Resize
            'resize-none' => 'resize:none', 'resize' => 'resize:both',
            'resize-x' => 'resize:horizontal', 'resize-y' => 'resize:vertical',
            // Scroll
            'scroll-auto' => 'scroll-behavior:auto', 'scroll-smooth' => 'scroll-behavior:smooth',
            // Transitions
            'transition-none' => 'transition-property:none',
            'transition-all' => 'transition-property:all;transition-timing-function:var(--ease-default,cubic-bezier(0.4,0,0.2,1));transition-duration:var(--duration-normal,300ms)',
            'transition' => 'transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:var(--ease-default,cubic-bezier(0.4,0,0.2,1));transition-duration:var(--duration-normal,300ms)',
            'transition-colors' => 'transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:var(--ease-default,cubic-bezier(0.4,0,0.2,1));transition-duration:var(--duration-normal,300ms)',
            'transition-opacity' => 'transition-property:opacity;transition-timing-function:var(--ease-default,cubic-bezier(0.4,0,0.2,1));transition-duration:var(--duration-normal,300ms)',
            'transition-shadow' => 'transition-property:box-shadow;transition-timing-function:var(--ease-default,cubic-bezier(0.4,0,0.2,1));transition-duration:var(--duration-normal,300ms)',
            'transition-transform' => 'transition-property:transform;transition-timing-function:var(--ease-default,cubic-bezier(0.4,0,0.2,1));transition-duration:var(--duration-normal,300ms)',
            // Ease
            'ease-linear' => 'transition-timing-function:linear',
            'ease-in' => 'transition-timing-function:var(--ease-in,cubic-bezier(0.4,0,1,1))',
            'ease-out' => 'transition-timing-function:var(--ease-out,cubic-bezier(0,0,0.2,1))',
            'ease-in-out' => 'transition-timing-function:var(--ease-default,cubic-bezier(0.4,0,0.2,1))',
            'ease-bounce' => 'transition-timing-function:var(--ease-bounce,cubic-bezier(0.34,1.56,0.64,1))',
            // Border style
            'border-solid' => 'border-style:solid', 'border-dashed' => 'border-style:dashed',
            'border-dotted' => 'border-style:dotted', 'border-double' => 'border-style:double',
            'border-hidden' => 'border-style:hidden', 'border-none' => 'border-style:none',
            // Border width (basic)
            'border' => 'border-width:1px', 'border-0' => 'border-width:0px',
            'border-2' => 'border-width:2px', 'border-4' => 'border-width:4px',
            'border-8' => 'border-width:8px',
            'border-t' => 'border-top-width:1px', 'border-r' => 'border-right-width:1px',
            'border-b' => 'border-bottom-width:1px', 'border-l' => 'border-left-width:1px',
            'border-t-0' => 'border-top-width:0px', 'border-r-0' => 'border-right-width:0px',
            'border-b-0' => 'border-bottom-width:0px', 'border-l-0' => 'border-left-width:0px',
            'border-t-2' => 'border-top-width:2px', 'border-r-2' => 'border-right-width:2px',
            'border-b-2' => 'border-bottom-width:2px', 'border-l-2' => 'border-left-width:2px',
            'border-x' => 'border-left-width:1px;border-right-width:1px',
            'border-y' => 'border-top-width:1px;border-bottom-width:1px',
            'border-x-0' => 'border-left-width:0px;border-right-width:0px',
            'border-y-0' => 'border-top-width:0px;border-bottom-width:0px',
            // Outline
            'outline-none' => 'outline:2px solid transparent;outline-offset:2px',
            'outline' => 'outline-style:solid',
            'outline-dashed' => 'outline-style:dashed', 'outline-dotted' => 'outline-style:dotted',
            'outline-double' => 'outline-style:double',
            // Ring (simplified)
            'ring' => 'box-shadow:0 0 0 3px var(--c-primary-500,rgba(59,130,246,0.5))',
            'ring-0' => 'box-shadow:0 0 0 0px transparent',
            'ring-1' => 'box-shadow:0 0 0 1px var(--c-primary-500,rgba(59,130,246,0.5))',
            'ring-2' => 'box-shadow:0 0 0 2px var(--c-primary-500,rgba(59,130,246,0.5))',
            'ring-4' => 'box-shadow:0 0 0 4px var(--c-primary-500,rgba(59,130,246,0.5))',
            'ring-8' => 'box-shadow:0 0 0 8px var(--c-primary-500,rgba(59,130,246,0.5))',
            'ring-inset' => '--tw-ring-inset:inset',
            // Object fit
            'object-contain' => 'object-fit:contain', 'object-cover' => 'object-fit:cover',
            'object-fill' => 'object-fit:fill', 'object-none' => 'object-fit:none',
            'object-scale-down' => 'object-fit:scale-down',
            // Object position
            'object-center' => 'object-position:center', 'object-top' => 'object-position:top',
            'object-bottom' => 'object-position:bottom', 'object-left' => 'object-position:left',
            'object-right' => 'object-position:right',
            'object-left-bottom' => 'object-position:left bottom',
            'object-left-top' => 'object-position:left top',
            'object-right-bottom' => 'object-position:right bottom',
            'object-right-top' => 'object-position:right top',
            // Aspect ratio
            'aspect-auto' => 'aspect-ratio:auto', 'aspect-square' => 'aspect-ratio:1/1',
            'aspect-video' => 'aspect-ratio:16/9',
            // Table
            'table-auto' => 'table-layout:auto', 'table-fixed' => 'table-layout:fixed',
            'border-collapse' => 'border-collapse:collapse',
            'border-separate' => 'border-collapse:separate',
            // Background
            'bg-transparent' => 'background-color:transparent',
            'bg-current' => 'background-color:currentColor',
            'bg-inherit' => 'background-color:inherit',
            'bg-fixed' => 'background-attachment:fixed', 'bg-local' => 'background-attachment:local',
            'bg-scroll' => 'background-attachment:scroll',
            'bg-clip-border' => 'background-clip:border-box',
            'bg-clip-padding' => 'background-clip:padding-box',
            'bg-clip-content' => 'background-clip:content-box',
            'bg-clip-text' => '-webkit-background-clip:text;background-clip:text',
            'bg-no-repeat' => 'background-repeat:no-repeat', 'bg-repeat' => 'background-repeat:repeat',
            'bg-repeat-x' => 'background-repeat:repeat-x', 'bg-repeat-y' => 'background-repeat:repeat-y',
            'bg-repeat-round' => 'background-repeat:round', 'bg-repeat-space' => 'background-repeat:space',
            'bg-cover' => 'background-size:cover', 'bg-contain' => 'background-size:contain',
            'bg-auto' => 'background-size:auto',
            'bg-origin-border' => 'background-origin:border-box',
            'bg-origin-padding' => 'background-origin:padding-box',
            'bg-origin-content' => 'background-origin:content-box',
            'bg-center' => 'background-position:center', 'bg-top' => 'background-position:top',
            'bg-bottom' => 'background-position:bottom', 'bg-left' => 'background-position:left',
            'bg-right' => 'background-position:right',
            'bg-left-top' => 'background-position:left top', 'bg-left-bottom' => 'background-position:left bottom',
            'bg-right-top' => 'background-position:right top', 'bg-right-bottom' => 'background-position:right bottom',
            // Gradient
            'bg-gradient-to-t' => 'background-image:linear-gradient(to top,var(--tw-gradient-stops))',
            'bg-gradient-to-tr' => 'background-image:linear-gradient(to top right,var(--tw-gradient-stops))',
            'bg-gradient-to-r' => 'background-image:linear-gradient(to right,var(--tw-gradient-stops))',
            'bg-gradient-to-br' => 'background-image:linear-gradient(to bottom right,var(--tw-gradient-stops))',
            'bg-gradient-to-b' => 'background-image:linear-gradient(to bottom,var(--tw-gradient-stops))',
            'bg-gradient-to-bl' => 'background-image:linear-gradient(to bottom left,var(--tw-gradient-stops))',
            'bg-gradient-to-l' => 'background-image:linear-gradient(to left,var(--tw-gradient-stops))',
            'bg-gradient-to-tl' => 'background-image:linear-gradient(to top left,var(--tw-gradient-stops))',
            'bg-none' => 'background-image:none',
            // SVG
            'fill-none' => 'fill:none', 'fill-current' => 'fill:currentColor',
            'stroke-none' => 'stroke:none', 'stroke-current' => 'stroke:currentColor',
            // Lists
            'list-none' => 'list-style-type:none', 'list-disc' => 'list-style-type:disc',
            'list-decimal' => 'list-style-type:decimal',
            'list-inside' => 'list-style-position:inside',
            'list-outside' => 'list-style-position:outside',
            // Appearance
            'appearance-none' => 'appearance:none', 'appearance-auto' => 'appearance:auto',
            // Accessibility
            'sr-only' => 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0',
            'not-sr-only' => 'position:static;width:auto;height:auto;padding:0;margin:0;overflow:visible;clip:auto;white-space:normal',
            // Transform
            'transform-none' => 'transform:none',
            'transform-gpu' => 'transform:translateZ(0)',
            // Transform origin
            'origin-center' => 'transform-origin:center', 'origin-top' => 'transform-origin:top',
            'origin-top-right' => 'transform-origin:top right', 'origin-right' => 'transform-origin:right',
            'origin-bottom-right' => 'transform-origin:bottom right', 'origin-bottom' => 'transform-origin:bottom',
            'origin-bottom-left' => 'transform-origin:bottom left', 'origin-left' => 'transform-origin:left',
            'origin-top-left' => 'transform-origin:top left',
            // Animations
            'animate-none' => 'animation:none',
            'animate-spin' => 'animation:spin 1s linear infinite',
            'animate-ping' => 'animation:ping 1s cubic-bezier(0,0,0.2,1) infinite',
            'animate-pulse' => 'animation:pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
            'animate-bounce' => 'animation:bounce 1s infinite',
            // Filter & backdrop-filter — handled by resolveFilter() for composition
            // (blur, grayscale, invert, sepia, drop-shadow, backdrop-* variants)
            // Divide style (selector suffix added by compiler)
            'divide-solid' => 'border-style:solid', 'divide-dashed' => 'border-style:dashed',
            'divide-dotted' => 'border-style:dotted', 'divide-double' => 'border-style:double',
            'divide-none' => 'border-style:none',
            // Text wrapping
            'text-wrap' => 'text-wrap:wrap', 'text-nowrap' => 'text-wrap:nowrap',
            'text-balance' => 'text-wrap:balance', 'text-pretty' => 'text-wrap:pretty',
            // Content
            'content-none' => 'content:none',
            // Container (simplified)
            'container' => 'width:100%',
            // Grid auto
            'grid-flow-row' => 'grid-auto-flow:row', 'grid-flow-col' => 'grid-auto-flow:column',
            'grid-flow-dense' => 'grid-auto-flow:dense',
            'grid-flow-row-dense' => 'grid-auto-flow:row dense',
            'grid-flow-col-dense' => 'grid-auto-flow:column dense',
            // Auto cols/rows
            'auto-cols-auto' => 'grid-auto-columns:auto',
            'auto-cols-min' => 'grid-auto-columns:min-content',
            'auto-cols-max' => 'grid-auto-columns:max-content',
            'auto-cols-fr' => 'grid-auto-columns:minmax(0,1fr)',
            'auto-rows-auto' => 'grid-auto-rows:auto',
            'auto-rows-min' => 'grid-auto-rows:min-content',
            'auto-rows-max' => 'grid-auto-rows:max-content',
            'auto-rows-fr' => 'grid-auto-rows:minmax(0,1fr)',
            // Col/row span static
            'col-auto' => 'grid-column:auto', 'col-span-full' => 'grid-column:1/-1',
            'col-start-auto' => 'grid-column-start:auto', 'col-end-auto' => 'grid-column-end:auto',
            'row-auto' => 'grid-row:auto', 'row-span-full' => 'grid-row:1/-1',
            'row-start-auto' => 'grid-row-start:auto', 'row-end-auto' => 'grid-row-end:auto',
            // Order static
            'order-first' => 'order:-9999', 'order-last' => 'order:9999', 'order-none' => 'order:0',
            // Isolation
            'isolate' => 'isolation:isolate', 'isolation-auto' => 'isolation:auto',
            // Mix blend
            'mix-blend-normal' => 'mix-blend-mode:normal',
            'mix-blend-multiply' => 'mix-blend-mode:multiply',
            'mix-blend-screen' => 'mix-blend-mode:screen',
            'mix-blend-overlay' => 'mix-blend-mode:overlay',
            'mix-blend-darken' => 'mix-blend-mode:darken',
            'mix-blend-lighten' => 'mix-blend-mode:lighten',
            'mix-blend-color-dodge' => 'mix-blend-mode:color-dodge',
            'mix-blend-color-burn' => 'mix-blend-mode:color-burn',
            'mix-blend-hard-light' => 'mix-blend-mode:hard-light',
            'mix-blend-soft-light' => 'mix-blend-mode:soft-light',
            'mix-blend-difference' => 'mix-blend-mode:difference',
            'mix-blend-exclusion' => 'mix-blend-mode:exclusion',
            'mix-blend-hue' => 'mix-blend-mode:hue',
            'mix-blend-saturation' => 'mix-blend-mode:saturation',
            'mix-blend-color' => 'mix-blend-mode:color',
            'mix-blend-luminosity' => 'mix-blend-mode:luminosity',
            // Gap 0
            'gap-0' => 'gap:0px', 'gap-x-0' => 'column-gap:0px', 'gap-y-0' => 'row-gap:0px',
            // Z-index
            'z-0' => 'z-index:0', 'z-10' => 'z-index:10', 'z-20' => 'z-index:20',
            'z-30' => 'z-index:30', 'z-40' => 'z-index:40', 'z-50' => 'z-index:50',
            'z-auto' => 'z-index:auto',
            // Will change
            'will-change-auto' => 'will-change:auto',
            'will-change-scroll' => 'will-change:scroll-position',
            'will-change-contents' => 'will-change:contents',
            'will-change-transform' => 'will-change:transform',
            // Line clamp none
            'line-clamp-none' => '-webkit-line-clamp:unset;display:block;overflow:visible',
            // Additional viewport units
            'w-dvw' => 'width:100dvw', 'w-lvw' => 'width:100lvw',
            'h-lvh' => 'height:100lvh',
            // Hyphens
            'hyphens-none' => 'hyphens:none', 'hyphens-manual' => 'hyphens:manual', 'hyphens-auto' => 'hyphens:auto',
            // Scroll snap
            'snap-none' => 'scroll-snap-type:none',
            'snap-x' => 'scroll-snap-type:x var(--tw-scroll-snap-strictness,proximity)',
            'snap-y' => 'scroll-snap-type:y var(--tw-scroll-snap-strictness,proximity)',
            'snap-both' => 'scroll-snap-type:both var(--tw-scroll-snap-strictness,proximity)',
            'snap-mandatory' => '--tw-scroll-snap-strictness:mandatory',
            'snap-proximity' => '--tw-scroll-snap-strictness:proximity',
            'snap-start' => 'scroll-snap-align:start', 'snap-end' => 'scroll-snap-align:end',
            'snap-center' => 'scroll-snap-align:center', 'snap-align-none' => 'scroll-snap-align:none',
            'snap-normal' => 'scroll-snap-stop:normal', 'snap-always' => 'scroll-snap-stop:always',
            // Outline width
            'outline-0' => 'outline-width:0px', 'outline-1' => 'outline-width:1px',
            'outline-2' => 'outline-width:2px', 'outline-4' => 'outline-width:4px', 'outline-8' => 'outline-width:8px',
            // Outline offset
            'outline-offset-0' => 'outline-offset:0px', 'outline-offset-1' => 'outline-offset:1px',
            'outline-offset-2' => 'outline-offset:2px', 'outline-offset-4' => 'outline-offset:4px',
            'outline-offset-8' => 'outline-offset:8px',
            // Stroke width
            'stroke-0' => 'stroke-width:0', 'stroke-1' => 'stroke-width:1', 'stroke-2' => 'stroke-width:2',
            // Touch action
            'touch-auto' => 'touch-action:auto', 'touch-none' => 'touch-action:none',
            'touch-pan-x' => 'touch-action:pan-x', 'touch-pan-y' => 'touch-action:pan-y',
            'touch-pan-left' => 'touch-action:pan-left', 'touch-pan-right' => 'touch-action:pan-right',
            'touch-pan-up' => 'touch-action:pan-up', 'touch-pan-down' => 'touch-action:pan-down',
            'touch-pinch-zoom' => 'touch-action:pinch-zoom',
            'touch-manipulation' => 'touch-action:manipulation',
            // Overscroll
            'overscroll-auto' => 'overscroll-behavior:auto', 'overscroll-contain' => 'overscroll-behavior:contain',
            'overscroll-none' => 'overscroll-behavior:none',
            'overscroll-x-auto' => 'overscroll-behavior-x:auto', 'overscroll-x-contain' => 'overscroll-behavior-x:contain',
            'overscroll-x-none' => 'overscroll-behavior-x:none',
            'overscroll-y-auto' => 'overscroll-behavior-y:auto', 'overscroll-y-contain' => 'overscroll-behavior-y:contain',
            'overscroll-y-none' => 'overscroll-behavior-y:none',
            // Columns named
            'columns-1' => 'columns:1', 'columns-2' => 'columns:2', 'columns-3' => 'columns:3',
            'columns-4' => 'columns:4', 'columns-5' => 'columns:5', 'columns-6' => 'columns:6',
            'columns-7' => 'columns:7', 'columns-8' => 'columns:8', 'columns-9' => 'columns:9',
            'columns-10' => 'columns:10', 'columns-11' => 'columns:11', 'columns-12' => 'columns:12',
            'columns-auto' => 'columns:auto',
            'columns-3xs' => 'columns:16rem', 'columns-2xs' => 'columns:18rem',
            'columns-xs' => 'columns:20rem', 'columns-sm' => 'columns:24rem',
            'columns-md' => 'columns:28rem', 'columns-lg' => 'columns:32rem',
            'columns-xl' => 'columns:36rem', 'columns-2xl' => 'columns:42rem',
            'columns-3xl' => 'columns:48rem', 'columns-4xl' => 'columns:56rem',
            'columns-5xl' => 'columns:64rem', 'columns-6xl' => 'columns:72rem',
            'columns-7xl' => 'columns:80rem',
            // Break after/before/inside
            'break-after-auto' => 'break-after:auto', 'break-after-avoid' => 'break-after:avoid',
            'break-after-all' => 'break-after:all', 'break-after-avoid-page' => 'break-after:avoid-page',
            'break-after-page' => 'break-after:page', 'break-after-column' => 'break-after:column',
            'break-before-auto' => 'break-before:auto', 'break-before-avoid' => 'break-before:avoid',
            'break-before-all' => 'break-before:all', 'break-before-avoid-page' => 'break-before:avoid-page',
            'break-before-page' => 'break-before:page', 'break-before-column' => 'break-before:column',
            'break-inside-auto' => 'break-inside:auto', 'break-inside-avoid' => 'break-inside:avoid',
            'break-inside-avoid-page' => 'break-inside:avoid-page',
            'break-inside-avoid-column' => 'break-inside:avoid-column',
            // Decoration
            'decoration-solid' => 'text-decoration-style:solid', 'decoration-double' => 'text-decoration-style:double',
            'decoration-dotted' => 'text-decoration-style:dotted', 'decoration-dashed' => 'text-decoration-style:dashed',
            'decoration-wavy' => 'text-decoration-style:wavy',
            'decoration-auto' => 'text-decoration-thickness:auto', 'decoration-from-font' => 'text-decoration-thickness:from-font',
            'decoration-0' => 'text-decoration-thickness:0px', 'decoration-1' => 'text-decoration-thickness:1px',
            'decoration-2' => 'text-decoration-thickness:2px', 'decoration-4' => 'text-decoration-thickness:4px',
            'decoration-8' => 'text-decoration-thickness:8px',
            // Underline offset
            'underline-offset-auto' => 'text-underline-offset:auto',
            'underline-offset-0' => 'text-underline-offset:0px', 'underline-offset-1' => 'text-underline-offset:1px',
            'underline-offset-2' => 'text-underline-offset:2px', 'underline-offset-4' => 'text-underline-offset:4px',
            'underline-offset-8' => 'text-underline-offset:8px',
            // Space/divide reverse
            'space-x-reverse' => '--tw-space-x-reverse:1',
            'space-y-reverse' => '--tw-space-y-reverse:1',
            'divide-x-reverse' => '--tw-divide-x-reverse:1',
            'divide-y-reverse' => '--tw-divide-y-reverse:1',
            // Accent
            'accent-auto' => 'accent-color:auto',
            // List
            'list-image-none' => 'list-style-image:none',
            // Logical inset
            'start-0' => 'inset-inline-start:0px', 'start-auto' => 'inset-inline-start:auto',
            'end-0' => 'inset-inline-end:0px', 'end-auto' => 'inset-inline-end:auto',
            // Caret
            'caret-transparent' => 'caret-color:transparent',
        ];
    }
}
