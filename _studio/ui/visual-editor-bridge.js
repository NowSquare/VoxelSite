/**
 * VoxelSite Visual Editor — Preview Bridge
 *
 * Injected into the preview iframe. Handles element detection, hover highlighting,
 * inline editing, and a JIT CSS engine for instant Tailwind preview.
 *
 * The JIT engine generates CSS rules for Tailwind utilities on-the-fly,
 * allowing live preview without waiting for server-side compilation.
 *
 * Engineering findings (2026-02-16):
 * - Class-preview sessions need explicit reset on selection changes; otherwise
 *   class diffs can leak between elements.
 * - Hover highlights must clear when the pointer enters non-editable regions.
 * - Parent-driven class commits need a "silent" path to avoid feedback loops
 *   (preview update re-emitting persistence events).
 */

(function() {
  'use strict';

  let active = false;
  let hoveredEl = null;
  let selectedEl = null;
  let isEditing = false;
  let isAIGenerating = false;
  let originalContent = null;
  let overlayLayer = null;

  const IGNORE_TAGS = new Set([
    'HTML','HEAD','META','LINK','SCRIPT','STYLE','NOSCRIPT','BR','HR','WBR','COL','COLGROUP','IFRAME',
  ]);
  const TEXT_TAGS = new Set([
    'H1','H2','H3','H4','H5','H6','P','SPAN','A','BUTTON','LI','LABEL','TD','TH',
    'CAPTION','FIGCAPTION','DT','DD','BLOCKQUOTE','CITE','EM','STRONG','B','I','U','S','SMALL','SUB','SUP','MARK',
  ]);
  const CONTAINER_TAGS = new Set([
    'DIV','SECTION','ARTICLE','ASIDE','MAIN','NAV','HEADER','FOOTER','UL','OL','FORM','TABLE','FIGURE','DETAILS','SUMMARY',
  ]);

  // ═══════════════════════════════════════════
  //  JIT Tailwind CSS Engine
  // ═══════════════════════════════════════════
  //
  //  Generates CSS rules for Tailwind utilities in-browser.
  //  Covers the finite set of utilities exposed by the visual editor.
  //  Rules are injected into a dedicated <style> element for instant preview.

  const JIT_ID = 'vx-jit-css';
  const jitCache = new Set(); // classes already generated

  // Tailwind spacing scale → rem values
  const SPACING = {
    '0':'0px','px':'1px','0.5':'0.125rem','1':'0.25rem','1.5':'0.375rem',
    '2':'0.5rem','2.5':'0.625rem','3':'0.75rem','3.5':'0.875rem',
    '4':'1rem','5':'1.25rem','6':'1.5rem','7':'1.75rem','8':'2rem',
    '9':'2.25rem','10':'2.5rem','11':'2.75rem','12':'3rem','14':'3.5rem',
    '16':'4rem','20':'5rem','24':'6rem','28':'7rem','32':'8rem',
    '36':'9rem','40':'10rem','44':'11rem','48':'12rem','52':'13rem',
    '56':'14rem','60':'15rem','64':'16rem','72':'18rem','80':'20rem','96':'24rem',
  };

  // Font size → [fontSize, lineHeight]
  const FONT_SIZES = {
    'xs':['0.75rem','1rem'],'sm':['0.875rem','1.25rem'],'base':['1rem','1.5rem'],
    'lg':['1.125rem','1.75rem'],'xl':['1.25rem','1.75rem'],'2xl':['1.5rem','2rem'],
    '3xl':['1.875rem','2.25rem'],'4xl':['2.25rem','2.5rem'],'5xl':['3rem','1'],
    '6xl':['3.75rem','1'],'7xl':['4.5rem','1'],'8xl':['6rem','1'],'9xl':['8rem','1'],
  };

  const FONT_WEIGHTS = {
    thin:100,extralight:200,light:300,normal:400,medium:500,
    semibold:600,bold:700,extrabold:800,black:900,
  };

  const COLORS = {
    slate:{50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1',400:'#94a3b8',500:'#64748b',600:'#475569',700:'#334155',800:'#1e293b',900:'#0f172a',950:'#020617'},
    gray:{50:'#f9fafb',100:'#f3f4f6',200:'#e5e7eb',300:'#d1d5db',400:'#9ca3af',500:'#6b7280',600:'#4b5563',700:'#374151',800:'#1f2937',900:'#111827',950:'#030712'},
    zinc:{50:'#fafafa',100:'#f4f4f5',200:'#e4e4e7',300:'#d4d4d8',400:'#a1a1aa',500:'#71717a',600:'#52525b',700:'#3f3f46',800:'#27272a',900:'#18181b',950:'#09090b'},
    neutral:{50:'#fafafa',100:'#f5f5f5',200:'#e5e5e5',300:'#d4d4d4',400:'#a3a3a3',500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0a0a0a'},
    stone:{50:'#fafaf9',100:'#f5f5f4',200:'#e7e5e4',300:'#d6d3d1',400:'#a8a29e',500:'#78716c',600:'#57534e',700:'#44403c',800:'#292524',900:'#1c1917',950:'#0c0a09'},
    red:{50:'#fef2f2',100:'#fee2e2',200:'#fecaca',300:'#fca5a5',400:'#f87171',500:'#ef4444',600:'#dc2626',700:'#b91c1c',800:'#991b1b',900:'#7f1d1d',950:'#450a0a'},
    orange:{50:'#fff7ed',100:'#ffedd5',200:'#fed7aa',300:'#fdba74',400:'#fb923c',500:'#f97316',600:'#ea580c',700:'#c2410c',800:'#9a3412',900:'#7c2d12',950:'#431407'},
    amber:{50:'#fffbeb',100:'#fef3c7',200:'#fde68a',300:'#fcd34d',400:'#fbbf24',500:'#f59e0b',600:'#d97706',700:'#b45309',800:'#92400e',900:'#78350f',950:'#451a03'},
    yellow:{50:'#fefce8',100:'#fef9c3',200:'#fef08a',300:'#fde047',400:'#facc15',500:'#eab308',600:'#ca8a04',700:'#a16207',800:'#854d0e',900:'#713f12',950:'#422006'},
    lime:{50:'#f7fee7',100:'#ecfccb',200:'#d9f99d',300:'#bef264',400:'#a3e635',500:'#84cc16',600:'#65a30d',700:'#4d7c0f',800:'#3f6212',900:'#365314',950:'#1a2e05'},
    green:{50:'#f0fdf4',100:'#dcfce7',200:'#bbf7d0',300:'#86efac',400:'#4ade80',500:'#22c55e',600:'#16a34a',700:'#15803d',800:'#166534',900:'#14532d',950:'#052e16'},
    emerald:{50:'#ecfdf5',100:'#d1fae5',200:'#a7f3d0',300:'#6ee7b7',400:'#34d399',500:'#10b981',600:'#059669',700:'#047857',800:'#065f46',900:'#064e3b',950:'#022c22'},
    teal:{50:'#f0fdfa',100:'#ccfbf1',200:'#99f6e4',300:'#5eead4',400:'#2dd4bf',500:'#14b8a6',600:'#0d9488',700:'#0f766e',800:'#115e59',900:'#134e4a',950:'#042f2e'},
    cyan:{50:'#ecfeff',100:'#cffafe',200:'#a5f3fc',300:'#67e8f9',400:'#22d3ee',500:'#06b6d4',600:'#0891b2',700:'#0e7490',800:'#155e75',900:'#164e63',950:'#083344'},
    sky:{50:'#f0f9ff',100:'#e0f2fe',200:'#bae6fd',300:'#7dd3fc',400:'#38bdf8',500:'#0ea5e9',600:'#0284c7',700:'#0369a1',800:'#075985',900:'#0c4a6e',950:'#082f49'},
    blue:{50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',800:'#1e40af',900:'#1e3a8a',950:'#172554'},
    indigo:{50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',400:'#818cf8',500:'#6366f1',600:'#4f46e5',700:'#4338ca',800:'#3730a3',900:'#312e81',950:'#1e1b4b'},
    violet:{50:'#f5f3ff',100:'#ede9fe',200:'#ddd6fe',300:'#c4b5fd',400:'#a78bfa',500:'#8b5cf6',600:'#7c3aed',700:'#6d28d9',800:'#5b21b6',900:'#4c1d95',950:'#2e1065'},
    purple:{50:'#faf5ff',100:'#f3e8ff',200:'#e9d5ff',300:'#d8b4fe',400:'#c084fc',500:'#a855f7',600:'#9333ea',700:'#7e22ce',800:'#6b21a8',900:'#581c87',950:'#3b0764'},
    fuchsia:{50:'#fdf4ff',100:'#fae8ff',200:'#f5d0fe',300:'#f0abfc',400:'#e879f9',500:'#d946ef',600:'#c026d3',700:'#a21caf',800:'#86198f',900:'#701a75',950:'#4a044e'},
    pink:{50:'#fdf2f8',100:'#fce7f3',200:'#fbcfe8',300:'#f9a8d4',400:'#f472b6',500:'#ec4899',600:'#db2777',700:'#be185d',800:'#9d174d',900:'#831843',950:'#500724'},
    rose:{50:'#fff1f2',100:'#ffe4e6',200:'#fecdd3',300:'#fda4af',400:'#fb7185',500:'#f43f5e',600:'#e11d48',700:'#be123c',800:'#9f1239',900:'#881337',950:'#4c0519'},
  };

  const BORDER_RADIUS = {
    'none':'0px','sm':'0.125rem','':'0.25rem','md':'0.375rem',
    'lg':'0.5rem','xl':'0.75rem','2xl':'1rem','3xl':'1.5rem','full':'9999px',
  };

  const SHADOWS = {
    'sm':'0 1px 2px 0 rgba(0,0,0,0.05)',
    '':'0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px -1px rgba(0,0,0,0.1)',
    'md':'0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -2px rgba(0,0,0,0.1)',
    'lg':'0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -4px rgba(0,0,0,0.1)',
    'xl':'0 20px 25px -5px rgba(0,0,0,0.1),0 8px 10px -6px rgba(0,0,0,0.1)',
    '2xl':'0 25px 50px -12px rgba(0,0,0,0.25)',
    'inner':'inset 0 2px 4px 0 rgba(0,0,0,0.05)',
    'none':'0 0 #0000',
  };

  /** Escape a class name for use in a CSS selector */
  function escCSS(cls) {
    return cls.replace(/([.:\/%#\[\](),>+~=!@])/g, '\\$1');
  }

  /**
   * Generate a CSS rule for a single Tailwind utility class.
   * Returns null if the class is not recognized.
   */
  function classToCSS(cls) {
    // Strip responsive/state prefixes for matching, but preserve for selector
    let m;

    // ── Font Size ──
    if ((m = cls.match(/^text-(xs|sm|base|lg|xl|[2-9]xl)$/))) {
      const s = FONT_SIZES[m[1]];
      if (s) return `.${escCSS(cls)}{font-size:${s[0]};line-height:${s[1]}}`;
    }

    // ── Font Weight ──
    if ((m = cls.match(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/))) {
      return `.${escCSS(cls)}{font-weight:${FONT_WEIGHTS[m[1]]}}`;
    }

    // ── Font Family ──
    if (cls === 'font-sans') return `.${escCSS(cls)}{font-family:ui-sans-serif,system-ui,sans-serif}`;
    if (cls === 'font-serif') return `.${escCSS(cls)}{font-family:ui-serif,Georgia,Cambria,serif}`;
    if (cls === 'font-mono') return `.${escCSS(cls)}{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}`;

    // ── Text Align ──
    if ((m = cls.match(/^text-(left|center|right|justify)$/))) {
      return `.${escCSS(cls)}{text-align:${m[1]}}`;
    }

    // ── Letter Spacing ──
    const trackings = {tighter:'-0.05em',tight:'-0.025em',normal:'0em',wide:'0.025em',wider:'0.05em',widest:'0.1em'};
    if ((m = cls.match(/^tracking-(\w+)$/)) && trackings[m[1]]) {
      return `.${escCSS(cls)}{letter-spacing:${trackings[m[1]]}}`;
    }

    // ── Line Height ──
    const leadings = {none:'1',tight:'1.25',snug:'1.375',normal:'1.5',relaxed:'1.625',loose:'2'};
    if ((m = cls.match(/^leading-(none|tight|snug|normal|relaxed|loose)$/))) {
      return `.${escCSS(cls)}{line-height:${leadings[m[1]]}}`;
    }
    if ((m = cls.match(/^leading-(\d+)$/))) {
      return `.${escCSS(cls)}{line-height:${parseInt(m[1]) * 0.25}rem}`;
    }

    // ── Text Transform ──
    const transforms = {'uppercase':'uppercase','lowercase':'lowercase','capitalize':'capitalize','normal-case':'none'};
    if (transforms[cls]) {
      return `.${escCSS(cls)}{text-transform:${transforms[cls]}}`;
    }

    // ── Text Decoration ──
    if (cls === 'underline') return `.${escCSS(cls)}{text-decoration-line:underline}`;
    if (cls === 'line-through') return `.${escCSS(cls)}{text-decoration-line:line-through}`;
    if (cls === 'no-underline') return `.${escCSS(cls)}{text-decoration-line:none}`;

    // ── Display ──
    const displays = {block:'block','inline-block':'inline-block',inline:'inline',flex:'flex','inline-flex':'inline-flex',grid:'grid','inline-grid':'inline-grid',hidden:'none'};
    if (displays[cls] !== undefined) {
      return `.${escCSS(cls)}{display:${displays[cls]}}`;
    }

    // ── Position ──
    const positions = { static: 'static', relative: 'relative', absolute: 'absolute', fixed: 'fixed', sticky: 'sticky' };
    if (positions[cls]) return `.${escCSS(cls)}{position:${positions[cls]}}`;

    // ── Inset / offsets ──
    if ((m = cls.match(/^(top|right|bottom|left)-(auto|.+)$/))) {
      if (m[2] === 'auto') return `.${escCSS(cls)}{${m[1]}:auto}`;
      if (SPACING[m[2]]) return `.${escCSS(cls)}{${m[1]}:${SPACING[m[2]]}}`;
    }

    // ── Flex Direction ──
    const flexDirs = {'flex-row':'row','flex-col':'column','flex-row-reverse':'row-reverse','flex-col-reverse':'column-reverse'};
    if (flexDirs[cls]) return `.${escCSS(cls)}{flex-direction:${flexDirs[cls]}}`;

    // ── Justify Content ──
    const justifies = {'justify-start':'flex-start','justify-center':'center','justify-end':'flex-end','justify-between':'space-between','justify-around':'space-around','justify-evenly':'space-evenly'};
    if (justifies[cls]) return `.${escCSS(cls)}{justify-content:${justifies[cls]}}`;

    // ── Align Items ──
    const aligns = {'items-start':'flex-start','items-center':'center','items-end':'flex-end','items-stretch':'stretch','items-baseline':'baseline'};
    if (aligns[cls]) return `.${escCSS(cls)}{align-items:${aligns[cls]}}`;

    // ── Gap ──
    if ((m = cls.match(/^gap-(.+)$/)) && SPACING[m[1]]) {
      return `.${escCSS(cls)}{gap:${SPACING[m[1]]}}`;
    }
    if ((m = cls.match(/^gap-x-(.+)$/)) && SPACING[m[1]]) {
      return `.${escCSS(cls)}{column-gap:${SPACING[m[1]]}}`;
    }
    if ((m = cls.match(/^gap-y-(.+)$/)) && SPACING[m[1]]) {
      return `.${escCSS(cls)}{row-gap:${SPACING[m[1]]}}`;
    }

    // ── Grid templates ──
    if ((m = cls.match(/^grid-cols-(\d+)$/))) {
      const n = parseInt(m[1], 10);
      if (n > 0 && n <= 24) return `.${escCSS(cls)}{grid-template-columns:repeat(${n},minmax(0,1fr))}`;
    }
    if ((m = cls.match(/^grid-rows-(\d+)$/))) {
      const n = parseInt(m[1], 10);
      if (n > 0 && n <= 24) return `.${escCSS(cls)}{grid-template-rows:repeat(${n},minmax(0,1fr))}`;
    }

    // ── Spacing: Padding ──
    if ((m = cls.match(/^(p|px|py|pt|pr|pb|pl)-(.+)$/)) && SPACING[m[2]]) {
      const v = SPACING[m[2]];
      const map = { p:'padding', px:'padding-left:V;padding-right:V', py:'padding-top:V;padding-bottom:V',
        pt:'padding-top', pr:'padding-right', pb:'padding-bottom', pl:'padding-left' };
      const prop = map[m[1]];
      if (prop.includes(':V')) return `.${escCSS(cls)}{${prop.replace(/V/g, v)}}`;
      return `.${escCSS(cls)}{${prop}:${v}}`;
    }

    // ── Spacing: Margin (including negative) ──
    if ((m = cls.match(/^-?(m|mx|my|mt|mr|mb|ml)-(.+)$/))) {
      const neg = cls.startsWith('-');
      const val = SPACING[m[2]];
      if (val) {
        const v = neg ? `calc(${val} * -1)` : val;
        const map = { m:'margin', mx:'margin-left:V;margin-right:V', my:'margin-top:V;margin-bottom:V',
          mt:'margin-top', mr:'margin-right', mb:'margin-bottom', ml:'margin-left' };
        const prop = map[m[1]];
        if (prop.includes(':V')) return `.${escCSS(cls)}{${prop.replace(/V/g, v)}}`;
        return `.${escCSS(cls)}{${prop}:${v}}`;
      }
    }

    // ── Colors: text-{color}-{shade}, bg-{color}-{shade}, border-{color}-{shade} ──
    if ((m = cls.match(/^(text|bg|border)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(\d+)$/))) {
      const hex = COLORS[m[2]]?.[m[3]];
      if (hex) {
        const props = {text:'color',bg:'background-color',border:'border-color'};
        return `.${escCSS(cls)}{${props[m[1]]}:${hex}}`;
      }
    }

    // ── Special Colors ──
    if ((m = cls.match(/^(text|bg|border)-(white|black|transparent)$/))) {
      const vals = {white:'#fff',black:'#000',transparent:'transparent'};
      const props = {text:'color',bg:'background-color',border:'border-color'};
      return `.${escCSS(cls)}{${props[m[1]]}:${vals[m[2]]}}`;
    }

    // ── Border Width ──
    if (cls === 'border') return `.${escCSS(cls)}{border-width:1px}`;
    if ((m = cls.match(/^border-(\d+)$/))) return `.${escCSS(cls)}{border-width:${m[1]}px}`;
    if (cls === 'border-0') return `.${escCSS(cls)}{border-width:0px}`;

    // ── Border Style ──
    if ((m = cls.match(/^border-(solid|dashed|dotted|double|none)$/))) {
      return `.${escCSS(cls)}{border-style:${m[1]}}`;
    }

    // ── Border Radius ──
    if (cls === 'rounded') return `.${escCSS(cls)}{border-radius:0.25rem}`;
    if ((m = cls.match(/^rounded-(none|sm|md|lg|xl|2xl|3xl|full)$/))) {
      return `.${escCSS(cls)}{border-radius:${BORDER_RADIUS[m[1]]}}`;
    }
    if ((m = cls.match(/^rounded-(tl|tr|br|bl)$/))) {
      const prop = { tl: 'border-top-left-radius', tr: 'border-top-right-radius', br: 'border-bottom-right-radius', bl: 'border-bottom-left-radius' }[m[1]];
      return `.${escCSS(cls)}{${prop}:0.25rem}`;
    }
    if ((m = cls.match(/^rounded-(tl|tr|br|bl)-(none|sm|md|lg|xl|2xl|3xl|full)$/))) {
      const prop = { tl: 'border-top-left-radius', tr: 'border-top-right-radius', br: 'border-bottom-right-radius', bl: 'border-bottom-left-radius' }[m[1]];
      return `.${escCSS(cls)}{${prop}:${BORDER_RADIUS[m[2]]}}`;
    }

    // ── Box Shadow ──
    if (cls === 'shadow') return `.${escCSS(cls)}{box-shadow:${SHADOWS['']}}`;
    if ((m = cls.match(/^shadow-(sm|md|lg|xl|2xl|inner|none)$/))) {
      return `.${escCSS(cls)}{box-shadow:${SHADOWS[m[1]]}}`;
    }

    // ── Opacity ──
    if ((m = cls.match(/^opacity-(\d+)$/))) {
      return `.${escCSS(cls)}{opacity:${parseInt(m[1]) / 100}}`;
    }

    // ── Width & Height (common values) ──
    if ((m = cls.match(/^(w|h)-(.+)$/)) && SPACING[m[2]]) {
      return `.${escCSS(cls)}{${m[1] === 'w' ? 'width' : 'height'}:${SPACING[m[2]]}}`;
    }
    if (cls === 'w-full') return `.w-full{width:100%}`;
    if (cls === 'h-full') return `.h-full{height:100%}`;
    if (cls === 'w-auto') return `.w-auto{width:auto}`;
    if (cls === 'h-auto') return `.h-auto{height:auto}`;

    return null; // Not recognized
  }

  // Breakpoint min-width values for @media wrapping
  const BREAKPOINTS = {
    sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px',
  };

  /** Inject JIT CSS for a set of classes */
  function injectJitCSS(classes) {
    let style = document.getElementById(JIT_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = JIT_ID;
      document.head.appendChild(style);
    }

    const newRules = [];
    for (const cls of classes) {
      if (jitCache.has(cls)) continue;

      // Check for responsive prefix (sm:, md:, lg:, xl:, 2xl:)
      const bpMatch = cls.match(/^(sm|md|lg|xl|2xl):(.+)$/);
      const baseClass = bpMatch ? bpMatch[2] : cls;
      const breakpoint = bpMatch ? bpMatch[1] : null;

      let baseRule = classToCSS(baseClass);
      if (baseRule) {
        // Add !important to every declaration so JIT preview always wins
        // over site-specific CSS with higher specificity (e.g., .hero em { color: ... }).
        // This only affects the live preview — the compiled Tailwind handles its own cascade.
        baseRule = baseRule.replace(/;/g, ' !important;').replace(/}$/, ' !important}');

        if (breakpoint) {
          // Rewrite selector from .baseClass to .bp\:baseClass and wrap in @media
          const escapedSelector = `.${escCSS(cls)}`;
          const baseSelector = `.${escCSS(baseClass)}`;
          const wrappedRule = baseRule.replace(baseSelector, escapedSelector);
          newRules.push(`@media(min-width:${BREAKPOINTS[breakpoint]}){${wrappedRule}}`);
        } else {
          newRules.push(baseRule);
        }
        jitCache.add(cls);
      }
    }

    if (newRules.length > 0) {
      style.textContent += '\n' + newRules.join('\n');
    }
  }

  function clearJitCSS() {
    const style = document.getElementById(JIT_ID);
    if (style) style.remove();
    jitCache.clear();
  }

  // ═══════════════════════════════════════════
  //  Overlay Layer
  // ═══════════════════════════════════════════

  function createOverlay() {
    if (overlayLayer) return;
    overlayLayer = document.createElement('div');
    overlayLayer.id = 'vx-overlay';
    overlayLayer.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:999999;';

    const hover = document.createElement('div');
    hover.id = 'vx-hover';
    hover.style.cssText = 'position:absolute;border:2px solid rgba(59,130,246,0.6);border-radius:4px;background:rgba(59,130,246,0.04);transition:all 80ms ease-out;opacity:0;pointer-events:none;';
    const label = document.createElement('div');
    label.id = 'vx-hover-label';
    label.style.cssText = "position:absolute;top:-22px;left:-1px;font:500 10px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:white;background:rgba(59,130,246,0.85);padding:3px 6px;border-radius:3px 3px 0 0;white-space:nowrap;";
    hover.appendChild(label);

    const select = document.createElement('div');
    select.id = 'vx-select';
    select.style.cssText = 'position:absolute;border:2px solid #3b82f6;border-radius:4px;background:rgba(59,130,246,0.06);box-shadow:0 0 0 1px rgba(59,130,246,0.15);opacity:0;pointer-events:none;';

    overlayLayer.appendChild(hover);
    overlayLayer.appendChild(select);
    document.body.appendChild(overlayLayer);
  }

  function removeOverlay() {
    if (overlayLayer) { overlayLayer.remove(); overlayLayer = null; }
  }

  // ═══════════════════════════════════════════
  //  Hover Detection
  // ═══════════════════════════════════════════

  function onMouseMove(e) {
    if (!active || isEditing || isAIGenerating) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || isEditorElement(el) || el.id === 'vx-overlay') {
      hoveredEl = null;
      hideHoverHighlight();
      return;
    }
    if (el === hoveredEl) return;
    const target = findEditableAncestor(el);
    if (!target) {
      hoveredEl = null;
      hideHoverHighlight();
      return;
    }
    if (target === hoveredEl) return;
    hoveredEl = target;
    updateHoverHighlight(target);
  }

  function onMouseLeave() { hoveredEl = null; hideHoverHighlight(); }

  function updateHoverHighlight(el) {
    const hover = document.getElementById('vx-hover');
    const label = document.getElementById('vx-hover-label');
    if (!hover || !label) return;
    const r = el.getBoundingClientRect();
    hover.style.left = `${r.left-2}px`; hover.style.top = `${r.top-2}px`;
    hover.style.width = `${r.width+4}px`; hover.style.height = `${r.height+4}px`;
    hover.style.opacity = '1';
    label.textContent = getElementLabel(el);
  }

  function hideHoverHighlight() {
    const h = document.getElementById('vx-hover');
    if (h) h.style.opacity = '0';
  }

  // ═══════════════════════════════════════════
  //  Selection
  // ═══════════════════════════════════════════

  function onClick(e) {
    if (!active) return;
    if (isEditing) {
      // Block link navigation while editing — prevent the iframe from navigating away
      const link = e.target.closest('a[href]');
      if (link) { e.preventDefault(); e.stopPropagation(); }
      return;
    }
    if (isAIGenerating) return;
    if (isEditorElement(e.target)) return;
    e.preventDefault(); e.stopPropagation();
    const el = findEditableAncestor(e.target);
    if (!el) return;

    // Toggle: clicking the already-selected element deselects it
    if (selectedEl === el) {
      deselectElement();
      notifyParent({ type: 'vx-editor:deselect' });
      return;
    }

    if (selectedEl) deselectElement();
    originalClasses = null;
    selectedEl = el;
    updateSelectionHighlight(el);
    hideHoverHighlight();

    const rect = el.getBoundingClientRect();
    notifyParent({
      type: 'vx-editor:select', tagName: el.tagName, elementType: getElementType(el),
      hasText: isTextElement(el), hasImage: el.tagName === 'IMG',
      classList: Array.from(el.classList),
      text: el.textContent?.substring(0, 200) || '',
      href: el.getAttribute('href') || '', src: el.getAttribute('src') || '',
      outerHTML: el.outerHTML?.substring(0, 2000) || '',
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      filePath: getPageFilePath(),
      sourceAddress: getSourceAddress(el),
    });
  }

  function deselectElement() {
    if (selectedEl) {
      if (isEditing) finishEditing();
      // If class preview started but was never committed, restore baseline classes.
      if (originalClasses !== null) {
        selectedEl.className = originalClasses;
      }
      selectedEl = null;
    }
    originalClasses = null;
    hideSelectionHighlight();
  }

  function updateSelectionHighlight(el) {
    const box = document.getElementById('vx-select');
    if (!box) return;
    const r = el.getBoundingClientRect();
    box.style.left = `${r.left-2}px`; box.style.top = `${r.top-2}px`;
    box.style.width = `${r.width+4}px`; box.style.height = `${r.height+4}px`;
    box.style.opacity = '1';
  }

  function hideSelectionHighlight() {
    const b = document.getElementById('vx-select');
    if (b) b.style.opacity = '0';
  }

  // ═══════════════════════════════════════════
  //  Inline Text Editing
  // ═══════════════════════════════════════════

  /** Does this element's raw HTML contain PHP template tags? */
  function containsPhpTemplate(el) {
    const raw = el.innerHTML || '';
    return raw.includes('<?') || raw.includes('<?=') || raw.includes('<?php');
  }

  function startTextEditing() {
    if (!selectedEl || isEditing || !isTextElement(selectedEl)) return;
    isEditing = true;
    originalContent = selectedEl.innerHTML;
    selectedEl.contentEditable = 'true';
    selectedEl.focus();
    selectedEl.style.outline = '2px solid #3b82f6';
    selectedEl.style.outlineOffset = '2px';
    document.body.style.cursor = '';  // Reset to default text cursor during editing
    const range = document.createRange();
    range.selectNodeContents(selectedEl);
    const sel = window.getSelection();
    sel.removeAllRanges(); sel.addRange(range);
    hideHoverHighlight(); hideSelectionHighlight();
    // No blur listener — editing is a committed mode, exits only on Save/Cancel
    selectedEl.addEventListener('keydown', onEditKeydown);

    // Start monitoring selection for rich text toolbar
    const hasPhp = containsPhpTemplate(selectedEl);
    const rect = selectedEl.getBoundingClientRect();
    notifyParent({
      type: 'vx-editor:editing-started',
      hasPhp,
      tagName: selectedEl.tagName,
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
    });
    startSelectionMonitor();
  }

  function onEditKeydown(e) {
    // Escape = Cancel (revert to original)
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
      return;
    }

    // Rich text shortcuts — intercept during editing
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
      if (e.key === 'b') { e.preventDefault(); document.execCommand('bold', false); notifySelectionState(); }
      if (e.key === 'i') { e.preventDefault(); document.execCommand('italic', false); notifySelectionState(); }
      if (e.key === 'k') { e.preventDefault(); notifyParent({ type: 'vx-editor:richtext-link-request' }); }
      // Cmd+Enter = Save shortcut
      if (e.key === 'Enter') { e.preventDefault(); saveEditing(); }
      return;
    }

    // Enter key — always insert <br> to prevent the browser from creating
    // <div> elements inside <p>, <h1>, etc. which corrupts the HTML structure.
    if (e.key === 'Enter') {
      e.preventDefault();
      // Insert a <br> at the cursor position
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const br = document.createElement('br');
      range.insertNode(br);
      // If <br> is at the end, add a second one so the cursor has somewhere to go
      if (!br.nextSibling || (br.nextSibling.nodeType === Node.ELEMENT_NODE && br.nextSibling.tagName === 'BR')) {
        const extraBr = document.createElement('br');
        br.parentNode.insertBefore(extraBr, br.nextSibling);
      }
      // Move cursor after the br
      range.setStartAfter(br);
      range.setEndAfter(br);
      sel.removeAllRanges();
      sel.addRange(range);
      // Notify parent of updated element rect (element may have grown)
      notifyElementRect();
    }
  }

  /** Send the current element bounding rect to the parent for toolbar repositioning. */
  function notifyElementRect() {
    if (!isEditing || !selectedEl) return;
    const rect = selectedEl.getBoundingClientRect();
    notifyParent({
      type: 'vx-editor:element-rect',
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
    });
  }

  /** Save editing — commit the changes and exit edit mode. */
  function saveEditing() {
    if (!selectedEl || !isEditing) return;
    isEditing = false;
    stopSelectionMonitor();
    const newContent = selectedEl.innerHTML;
    selectedEl.contentEditable = 'false';
    selectedEl.removeAttribute('contenteditable');
    selectedEl.style.outline = ''; selectedEl.style.outlineOffset = '';
    selectedEl.removeEventListener('keydown', onEditKeydown);
    notifyParent({ type: 'vx-editor:editing-ended' });
    document.body.style.cursor = 'crosshair';  // Restore selection cursor
    if (newContent !== originalContent) {
      notifyParent({ type: 'vx-editor:text-changed', filePath: getPageFilePath(), originalHTML: originalContent, newHTML: newContent, sourceAddress: getSourceAddress(selectedEl) });
    }
    originalContent = null;
    // Fully deselect so the next click on the same element re-selects cleanly
    deselectElement();
    notifyParent({ type: 'vx-editor:deselect' });
  }

  /** Cancel editing — revert to original content and exit edit mode. */
  function cancelEditing() {
    if (!selectedEl || !isEditing) return;
    isEditing = false;
    stopSelectionMonitor();
    selectedEl.innerHTML = originalContent;
    selectedEl.contentEditable = 'false';
    selectedEl.removeAttribute('contenteditable');
    selectedEl.style.outline = ''; selectedEl.style.outlineOffset = '';
    selectedEl.removeEventListener('keydown', onEditKeydown);
    notifyParent({ type: 'vx-editor:editing-ended' });
    document.body.style.cursor = 'crosshair';  // Restore selection cursor
    originalContent = null;
    // Fully deselect so the next click on the same element re-selects cleanly
    deselectElement();
    notifyParent({ type: 'vx-editor:deselect' });
  }

  // ═══════════════════════════════════════════
  //  Inline Source Editing
  // ═══════════════════════════════════════════

  let sourceEditOriginalHTML = null;
  let sourceEditSavedStyles = null; // snapshot of original inline styles

  /**
   * Runtime-only CSS classes added by JavaScript at runtime.
   * These are never authored in PHP source files and must be stripped
   * before the outerHTML is used as a search needle or shown to the user.
   * Mirrors the RUNTIME_ONLY set in visual-editor.js:applyClassDiffSubset.
   */
  const RUNTIME_ONLY_CLASSES = new Set([
    'is-visible', 'is-active', 'is-open', 'active', 'open',
    'show', 'shown', 'visible', 'in', 'entered', 'transitioning',
  ]);

  /**
   * Normalize outerHTML from the live DOM to something that can be matched
   * against the PHP source and safely shown to the user in Monaco.
   *
   * Strips:
   *  1. data-vx-* instrumentation attributes (preview provenance)
   *  2. Runtime-only CSS classes (JS intersection observers, toggles)
   *  3. Empty style="" attributes (browser default serialization)
   *  4. Boolean attribute normalization (data-reveal="" → data-reveal)
   */
  function normalizeForSource(html) {
    let result = html;

    // 1. Strip data-vx-* instrumentation attributes
    result = result.replace(/\s+data-vx-[a-z-]+="[^"]*"/g, '');

    // 2. Strip runtime-only classes from class="..." attributes
    result = result.replace(/\bclass="([^"]*)"/g, (match, classList) => {
      const classes = classList.split(/\s+/).filter(c => c && !RUNTIME_ONLY_CLASSES.has(c));
      if (classes.length === 0) return 'class=""';
      return `class="${classes.join(' ')}"`;
    });

    // 3. Remove empty style="" attributes (browser adds these, not in source)
    result = result.replace(/\s+style=""/g, '');

    // 4. Normalize boolean attributes: attr="" → attr (common for data-reveal, etc.)
    //    Only for known boolean-like data attributes, not standard HTML attributes.
    result = result.replace(/\s(data-[a-z][a-z0-9-]*)=""/g, ' $1');

    return result;
  }

  /**
   * Restore runtime visibility state on an element after outerHTML replacement.
   * After outerHTML replacement, the new DOM node has no IntersectionObserver
   * binding and lacks runtime classes like 'is-visible'. Since the element
   * was in-viewport when the user edited it, we add reveal classes directly.
   *
   * Currently handles the [data-reveal].is-visible pattern. Will be
   * generalized to cover other runtime-hidden-element patterns later.
   */
  function rehydrateEditedElementVisibility(el) {
    if (!el) return;
    const revealSelector = '[data-reveal], [data-reveal-stagger]';
    // Force the element itself
    if (el.matches?.(revealSelector)) el.classList.add('is-visible');
    // Force all descendants
    el.querySelectorAll(revealSelector).forEach(child => child.classList.add('is-visible'));
  }

  /**
   * Start inline source editing for the currently selected element.
   * Captures the full outerHTML (normalized to source-like HTML), applies
   * a visual "being edited" treatment, and sends the clean HTML + rect to
   * the parent frame so it can project a Monaco editor at the element's position.
   */
  function startSourceEdit() {
    if (!selectedEl || isEditing) return;
    isEditing = true;

    // Capture and normalize outerHTML BEFORE applying visual treatment
    const rawHTML = selectedEl.outerHTML;
    const cleanHTML = normalizeForSource(rawHTML);
    sourceEditOriginalHTML = cleanHTML;

    // Get fresh bounding rect
    const rect = selectedEl.getBoundingClientRect();

    // Snapshot existing inline styles before applying visual treatment
    sourceEditSavedStyles = {
      opacity: selectedEl.style.opacity,
      filter: selectedEl.style.filter,
      pointerEvents: selectedEl.style.pointerEvents,
    };

    // Visual "being edited" treatment — dim + grayscale + diagonal hatching
    selectedEl.style.opacity = '0.35';
    selectedEl.style.filter = 'grayscale(1)';
    selectedEl.style.pointerEvents = 'none';

    // Inject diagonal hatch overlay
    const hatch = document.createElement('div');
    hatch.className = 'vx-source-edit-hatch';
    hatch.style.cssText = `
      position: absolute;
      left: ${rect.left + window.scrollX}px;
      top: ${rect.top + window.scrollY}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      pointer-events: none;
      z-index: 99997;
      border: 1.5px dashed rgba(59,130,246,0.5);
      border-radius: 4px;
      background: repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 6px,
        rgba(59,130,246,0.06) 6px,
        rgba(59,130,246,0.06) 7px
      );
    `;
    document.body.appendChild(hatch);
    hideSelectionHighlight();

    notifyParent({
      type: 'vx-editor:source-edit-ready',
      html: cleanHTML,
      tagName: selectedEl.tagName,
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      filePath: getPageFilePath(),
      sourceAddress: getSourceAddress(selectedEl),
    });
  }

  /**
   * End inline source editing.
   * If `data.apply` is true, replaces the element's outerHTML with the
   * edited version and triggers the text-change persistence pipeline.
   * If false (cancel), simply restores the element.
   */
  function endSourceEdit(data) {
    if (!selectedEl) return;
    isEditing = false;

    // Restore original inline styles (not just clear them)
    if (sourceEditSavedStyles) {
      selectedEl.style.opacity = sourceEditSavedStyles.opacity;
      selectedEl.style.filter = sourceEditSavedStyles.filter;
      selectedEl.style.pointerEvents = sourceEditSavedStyles.pointerEvents;
    }
    sourceEditSavedStyles = null;

    // Remove hatch overlay
    const hatch = document.querySelector('.vx-source-edit-hatch');
    if (hatch) hatch.remove();

    if (data.apply && data.html) {
      // Apply the new HTML to live preview (visual feedback only — file save
      // is handled directly by the parent frame using the source-file needle)
      try {
        // Remember position so we can find the new element after replacement
        const parent = selectedEl.parentElement;
        const siblingIndex = parent ? Array.from(parent.children).indexOf(selectedEl) : -1;

        selectedEl.outerHTML = data.html;
        selectedEl = null; // element reference is now stale

        // Force-reveal the new element: outerHTML replacement creates a new DOM
        // node that is orphaned from the site's IntersectionObserver. Since we
        // stripped runtime classes like 'is-visible' during normalization, the
        // element starts at opacity:0. Re-add reveal classes because the element
        // was in-viewport (the user just edited it).
        if (parent && siblingIndex >= 0 && siblingIndex < parent.children.length) {
          const newEl = parent.children[siblingIndex];
          rehydrateEditedElementVisibility(newEl);
        }
      } catch { /* outerHTML replacement can fail in edge cases */ }
    }

    sourceEditOriginalHTML = null;
    // Fully deselect so the next click on the same element re-selects cleanly
    deselectElement();
    notifyParent({ type: 'vx-editor:deselect' });
    document.body.style.cursor = 'crosshair';
  }

  // ═══════════════════════════════════════════
  //  Rich Text — Selection Monitor
  // ═══════════════════════════════════════════

  let selectionMonitorId = null;

  function startSelectionMonitor() {
    stopSelectionMonitor();
    // Use selectionchange + polling hybrid for reliability across browsers
    document.addEventListener('selectionchange', onSelectionChange);
  }

  function stopSelectionMonitor() {
    document.removeEventListener('selectionchange', onSelectionChange);
    if (selectionMonitorId) { clearTimeout(selectionMonitorId); selectionMonitorId = null; }
  }

  function onSelectionChange() {
    // Debounce to avoid flickering on rapid selection changes
    if (selectionMonitorId) clearTimeout(selectionMonitorId);
    selectionMonitorId = setTimeout(notifySelectionState, 60);
  }

  function notifySelectionState() {
    if (!isEditing || !selectedEl) return;

    // Always include the element's current rect for toolbar repositioning
    const elRect = selectedEl.getBoundingClientRect();
    const elementRect = { left: elRect.left, top: elRect.top, width: elRect.width, height: elRect.height };

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      notifyParent({ type: 'vx-editor:selection-state', hasSelection: false, elementRect });
      return;
    }

    const range = sel.getRangeAt(0);
    // Only report if the selection is inside the edited element
    if (!selectedEl.contains(range.commonAncestorContainer)) {
      notifyParent({ type: 'vx-editor:selection-state', hasSelection: false, elementRect });
      return;
    }

    const text = sel.toString();
    const hasSelection = text.length > 0;

    if (!hasSelection) {
      notifyParent({ type: 'vx-editor:selection-state', hasSelection: false, elementRect });
      return;
    }

    // Get current formatting state
    const rect = range.getBoundingClientRect();
    notifyParent({
      type: 'vx-editor:selection-state',
      hasSelection: true,
      text: text.substring(0, 100),
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      elementRect,
      formatting: {
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        orderedList: document.queryCommandState('insertOrderedList'),
        unorderedList: document.queryCommandState('insertUnorderedList'),
      },
      blockTag: getClosestBlockTag(range),
    });
  }

  /** Get the tag name of the closest block-level ancestor of the selection. */
  function getClosestBlockTag(range) {
    let node = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    const blocks = new Set(['H1','H2','H3','H4','H5','H6','P','BLOCKQUOTE','LI','DIV','SECTION','ARTICLE']);
    while (node && node !== selectedEl) {
      if (blocks.has(node.tagName)) return node.tagName;
      node = node.parentElement;
    }
    return selectedEl.tagName;
  }

  // ═══════════════════════════════════════════
  //  Rich Text — Command Execution
  // ═══════════════════════════════════════════

  function execRichTextCommand(cmd, value) {
    if (!isEditing || !selectedEl) return;

    // Re-focus the editable element to restore selection
    selectedEl.focus();

    switch (cmd) {
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'underline':
        document.execCommand('underline', false);
        break;
      case 'strikeThrough':
        document.execCommand('strikeThrough', false);
        break;
      case 'insertLink':
        if (value) {
          document.execCommand('createLink', false, value);
        } else {
          document.execCommand('unlink', false);
        }
        break;
      case 'removeLink':
        document.execCommand('unlink', false);
        break;
      case 'insertUnorderedList':
        document.execCommand('insertUnorderedList', false);
        break;
      case 'insertOrderedList':
        document.execCommand('insertOrderedList', false);
        break;
      case 'formatBlock':
        // value should be like 'H2', 'H3', 'P', etc.
        if (value) {
          document.execCommand('formatBlock', false, `<${value}>`);
        }
        break;
      case 'removeFormat':
        document.execCommand('removeFormat', false);
        break;
    }

    // Notify parent of updated formatting state
    setTimeout(notifySelectionState, 20);
  }

  // ═══════════════════════════════════════════
  //  Image Swapping
  // ═══════════════════════════════════════════

  function swapImage(newSrc) {
    if (!selectedEl) return;
    const img = selectedEl.tagName === 'IMG' ? selectedEl : selectedEl.querySelector('img');
    if (!img) return;
    const oldSrc = img.getAttribute('src');
    img.setAttribute('src', newSrc);
    notifyParent({
      type: 'vx-editor:image-changed',
      filePath: getPageFilePath(),
      oldSrc,
      newSrc,
      alt: img.getAttribute('alt') || '',
      sourceAddress: getSourceAddress(img),
    });
  }

  // ═══════════════════════════════════════════
  //  Element Deletion
  // ═══════════════════════════════════════════

  function deleteElement() {
    if (!selectedEl) return;
    const outerHTML = selectedEl.outerHTML;
    const parent = selectedEl.parentElement;
    if (!parent) return;
    notifyParent({ type: 'vx-editor:element-deleted', filePath: getPageFilePath(), outerHTML, sourceAddress: getSourceAddress(selectedEl) });
    selectedEl.remove();
    selectedEl = null;
    originalClasses = null;
    hideSelectionHighlight(); hideHoverHighlight();
  }

  // ═══════════════════════════════════════════
  //  Class Editing with JIT Preview
  // ═══════════════════════════════════════════

  let originalClasses = null;

  function previewClass(data) {
    if (!selectedEl) return;
    if (originalClasses === null) originalClasses = selectedEl.className;
    if (data.removeClass) selectedEl.classList.remove(data.removeClass);
    if (data.addClass) {
      // Inject JIT CSS for the new class BEFORE adding it
      injectJitCSS([data.addClass]);
      selectedEl.classList.add(data.addClass);
    }
  }

  function applyClasses(newClasses, silent = false) {
    if (!selectedEl) return;
    const oldClassAttr = originalClasses || selectedEl.className;
    const newClassAttr = newClasses.join(' ');
    const oldOuterHTML = selectedEl.outerHTML;

    // Inject JIT CSS for ALL classes to ensure preview works
    injectJitCSS(newClasses);

    selectedEl.className = newClassAttr;

    if (!silent && oldClassAttr !== newClassAttr) {
      notifyParent({
        type: 'vx-editor:text-changed',
        changeKind: 'class',
        filePath: getPageFilePath(),
        originalHTML: `class="${oldClassAttr}"`,
        newHTML: `class="${newClassAttr}"`,
        originalClasses: oldClassAttr,
        newClasses: newClassAttr,
        elementOuterHTML: oldOuterHTML,
      });
    }
    originalClasses = null;
  }

  function updateLink(data) {
    if (!selectedEl) return;
    const link = selectedEl.tagName === 'A' ? selectedEl : selectedEl.closest('a');
    if (!link) return;
    const oldHref = link.getAttribute('href') || '';
    const oldText = link.textContent || '';
    if (data.href !== undefined && data.href !== oldHref) {
      notifyParent({ type: 'vx-editor:text-changed', filePath: getPageFilePath(), originalHTML: `href="${oldHref}"`, newHTML: `href="${data.href}"` });
      link.setAttribute('href', data.href);
    }
    if (data.text !== undefined && data.text !== oldText) {
      notifyParent({ type: 'vx-editor:text-changed', filePath: getPageFilePath(), originalHTML: oldText, newHTML: data.text });
      link.textContent = data.text;
    }
  }

  // ═══════════════════════════════════════════
  //  Helpers
  // ═══════════════════════════════════════════

  function findEditableAncestor(el) {
    let c = el;
    while (c && c !== document.body) {
      if (IGNORE_TAGS.has(c.tagName) || isEditorElement(c)) return null;
      if (TEXT_TAGS.has(c.tagName) || c.tagName === 'IMG' || CONTAINER_TAGS.has(c.tagName)) return c;
      if (c.childNodes.length > 0) {
        for (const ch of c.childNodes) {
          if (ch.nodeType === Node.TEXT_NODE && ch.textContent.trim().length > 0) return c;
        }
      }
      c = c.parentElement;
    }
    return null;
  }

  function isTextElement(el) {
    if (TEXT_TAGS.has(el.tagName)) return true;
    for (const ch of el.childNodes) { if (ch.nodeType === Node.TEXT_NODE && ch.textContent.trim().length > 0) return true; }
    return false;
  }

  function getElementType(el) {
    if (el.tagName === 'IMG') return 'image';
    if (el.tagName === 'SVG' || el.closest('svg')) return 'icon';
    if (TEXT_TAGS.has(el.tagName)) return 'text';
    if (CONTAINER_TAGS.has(el.tagName)) return 'container';
    return 'element';
  }

  function getElementLabel(el) {
    const labels = {'H1':'h1','H2':'h2','H3':'h3','H4':'h4','H5':'h5','H6':'h6','P':'p','SPAN':'span','A':'a','BUTTON':'button','IMG':'img','VIDEO':'video','SVG':'svg','UL':'ul','OL':'ol','LI':'li','NAV':'nav','HEADER':'header','FOOTER':'footer','SECTION':'section','DIV':'div','MAIN':'main','ARTICLE':'article','ASIDE':'aside','FORM':'form','TABLE':'table','BLOCKQUOTE':'blockquote','FIGURE':'figure'};
    let l = labels[el.tagName] || el.tagName.toLowerCase();
    const meaningful = Array.from(el.classList).filter(c => !c.match(/^(flex|grid|block|inline|relative|absolute|hidden|overflow|min-|max-|w-|h-|p-|m-|bg-|text-|font-|border-|rounded|shadow|gap-|space-)/)).slice(0, 2);
    if (meaningful.length > 0) l += '.' + meaningful.join('.');
    return l;
  }

  function isEditorElement(el) { return el.id === 'vx-overlay' || el.closest('#vx-overlay') || el.closest('[data-vx-divider]'); }

  function getPageFilePath() {
    try { return new URLSearchParams(window.location.search).get('path') || 'index.php'; }
    catch { return 'index.php'; }
  }

  // ═══════════════════════════════════════════
  //  VE-003: Source Address Reader
  // ═══════════════════════════════════════════

  /**
   * Read the data-vx-* attributes from the nearest annotated ancestor of `el`
   * and return a source address object. Returns null if no annotation found.
   */
  function getSourceAddress(el) {
    if (!el) return null;
    // Walk up to find the nearest element with data-vx-source-file
    let cur = el;
    while (cur && cur !== document.documentElement) {
      if (cur.dataset && cur.dataset.vxSourceFile) {
        return {
          sourceFile: cur.dataset.vxSourceFile || '',
          sourceKind: cur.dataset.vxSourceKind || 'unsafe',
          nodeKey: cur.dataset.vxNodeKey || '',
          includeChain: cur.dataset.vxIncludeChain || '',
          editable: cur.dataset.vxEditable === 'true',
        };
      }
      cur = cur.parentElement;
    }
    // No annotation found — default to unsafe
    return {
      sourceFile: getPageFilePath(),
      sourceKind: 'unsafe',
      nodeKey: '',
      includeChain: '',
      editable: false,
    };
  }

  function notifyParent(data) {
    try { window.parent.postMessage(data, '*'); } catch {}
  }

  // ═══════════════════════════════════════════
  //  Message Listener
  // ═══════════════════════════════════════════

  window.addEventListener('message', function(e) {
    if (!e.data || typeof e.data !== 'object') return;
    if (e.origin !== window.location.origin) return;
    switch (e.data.type) {
      case 'vx-editor:toggle':
        active = e.data.active;
        if (active) {
          createOverlay();
          document.body.style.cursor = 'crosshair';
          document.body.classList.add('vx-editor-active');
          injectDividerStyles();
          // Delayed rebuild to let iframe content settle
          setTimeout(rebuildSectionDividers, 100);
        }
        else {
          deselectElement();
          hoveredEl = null;
          removeOverlay();
          document.body.style.cursor = '';
          document.body.classList.remove('vx-editor-active');
          clearJitCSS();
          originalClasses = null;
          removeSectionDividers();
        }
        break;
      case 'vx-editor:start-edit': if (e.data.mode === 'text') startTextEditing(); break;
      case 'vx-editor:save-edit': saveEditing(); break;
      case 'vx-editor:cancel-edit': cancelEditing(); break;
      case 'vx-editor:start-source-edit': startSourceEdit(); break;
      case 'vx-editor:end-source-edit': endSourceEdit(e.data); break;
      case 'vx-editor:swap-image': swapImage(e.data.src); break;
      case 'vx-editor:preview-class': previewClass(e.data); break;
      case 'vx-editor:update-classes': applyClasses(e.data.classes || [], !!e.data.silent); break;
      case 'vx-editor:update-link': updateLink(e.data); break;
      case 'vx-editor:delete-element': deleteElement(); break;
      case 'vx-editor:richtext-command': execRichTextCommand(e.data.command, e.data.value); break;
      case 'vx-editor:show-ai-overlay': showAIOverlay(e.data.status); break;
      case 'vx-editor:hide-ai-overlay': hideAIOverlay(); break;
      case 'vx-editor:update-ai-status': updateAIOverlayStatus(e.data.status); break;
      case 'vx-editor:rebuild-section-dividers': rebuildSectionDividers(); break;
      case 'vx-editor:scroll-to-section': scrollToSection(e.data.sectionIndex); break;
    }
  });

  // ═══════════════════════════════════════════
  //  Section Picker Dividers
  // ═══════════════════════════════════════════

  let sectionDividers = [];
  let dividerDebounceId = null;
  let sectionHighlightEl = null;

  /** Scroll the iframe to a section by index, with a brief highlight flash. */
  function scrollToSection(index) {
    const mainEl = document.querySelector('main') || document.body;
    const sections = mainEl.querySelectorAll(':scope > section, :scope > div > section');
    if (index < 0 || index >= sections.length) return;

    const target = sections[index];
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Brief highlight flash so the user sees exactly what's new
    const origOutline = target.style.outline;
    const origTransition = target.style.transition;
    target.style.transition = 'outline-color 600ms ease';
    target.style.outline = '2px solid rgba(59,130,246,0.6)';
    setTimeout(() => {
      target.style.outline = '2px solid transparent';
      setTimeout(() => {
        target.style.outline = origOutline;
        target.style.transition = origTransition;
      }, 600);
    }, 1500);
  }

  function rebuildSectionDividers() {
    removeSectionDividers();
    if (!active || isEditing || isAIGenerating) return;

    // Find all direct <section> children of <main>, or top-level <section> elements
    const mainEl = document.querySelector('main') || document.body;
    const sections = mainEl.querySelectorAll(':scope > section, :scope > div > section');
    if (sections.length === 0) return;

    // Collect section summaries for context
    const sectionSummaries = Array.from(sections).map((sec, i) => {
      const id = sec.id || '';
      const comment = sec.previousSibling?.nodeType === Node.COMMENT_NODE
        ? sec.previousSibling.textContent.trim() : '';
      const h = sec.querySelector('h1, h2, h3, h4, h5, h6');
      const heading = h ? h.textContent.trim().substring(0, 80) : '';
      return { index: i, id, comment, heading, el: sec };
    });

    // Create dividers between sections
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      // Divider AFTER each section (between current and next)
      createSectionDivider(sec, sectionSummaries, i);
    }

    // Also add a divider before the first section (to add at top)
    if (sections.length > 0) {
      createSectionDivider(null, sectionSummaries, -1, sections[0]);
    }
  }

  function createSectionDivider(afterSection, allSections, afterIndex, beforeSection) {
    const divider = document.createElement('div');
    divider.className = 'vx-section-divider';
    divider.setAttribute('data-vx-divider', 'true');

    const totalSections = allSections.length;
    const isFirstDivider = !afterSection && !!beforeSection; // before section 0

    // ── Each divider controls the section ABOVE it (section[afterIndex]). ──
    //
    // ▲ moves section[afterIndex] UP   (swaps with section[afterIndex - 1])
    // ▼ moves section[afterIndex] DOWN (swaps with section[afterIndex + 1])
    //
    // The first divider (afterIndex = -1) doesn't control any section — just [+].
    //
    // After a move, the scroll follows the moved section so the user always
    // sees the ▲/▼ buttons to undo their action.
    const showUp = !isFirstDivider && afterIndex > 0;
    const showDown = !isFirstDivider && afterIndex >= 0 && afterIndex < totalSections - 1;

    // ── Button row: [▲ slot 24px] [+ 28px] [▼ slot 24px] ──
    // Fixed-width slots keep + always centered, even when one chevron is absent.
    const btnRow = document.createElement('div');
    btnRow.className = 'vx-section-divider-row';

    // Left slot (▲ or empty)
    const leftSlot = document.createElement('span');
    leftSlot.className = 'vx-move-slot';
    if (showUp) {
      const upBtn = document.createElement('button');
      upBtn.className = 'vx-section-divider-btn vx-section-move-btn';
      upBtn.type = 'button';
      upBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;
      upBtn.setAttribute('title', 'Move section up');
      upBtn.setAttribute('aria-label', 'Move section up');
      upBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        moveSection(afterIndex, 'up');
      });
      leftSlot.appendChild(upBtn);
    }
    btnRow.appendChild(leftSlot);

    // Center: Add Section button
    const addBtn = document.createElement('button');
    addBtn.className = 'vx-section-divider-btn vx-section-add-btn';
    addBtn.type = 'button';
    addBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
    addBtn.setAttribute('title', 'Add section');
    addBtn.setAttribute('aria-label', 'Add section');
    btnRow.appendChild(addBtn);

    // Right slot (▼ or empty)
    const rightSlot = document.createElement('span');
    rightSlot.className = 'vx-move-slot';
    if (showDown) {
      const downBtn = document.createElement('button');
      downBtn.className = 'vx-section-divider-btn vx-section-move-btn';
      downBtn.type = 'button';
      downBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
      downBtn.setAttribute('title', 'Move section down');
      downBtn.setAttribute('aria-label', 'Move section down');
      downBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        moveSection(afterIndex, 'down');
      });
      rightSlot.appendChild(downBtn);
    }
    btnRow.appendChild(rightSlot);

    // Label: "top" for the first divider, "section" for all others
    const label = document.createElement('span');
    label.className = 'vx-section-divider-label';
    label.textContent = isFirstDivider ? 'top' : 'section';
    btnRow.appendChild(label);

    divider.appendChild(btnRow);

    // Position at the boundary
    const positionDivider = () => {
      let topY;
      if (afterSection) {
        const rect = afterSection.getBoundingClientRect();
        topY = rect.bottom + window.scrollY;
      } else if (beforeSection) {
        const rect = beforeSection.getBoundingClientRect();
        topY = rect.top + window.scrollY + 20;
      }
      if (topY !== undefined) {
        divider.style.top = `${topY}px`;
      }
    };

    // Add Section click handler
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const existingList = allSections.map(s => {
        let desc = `- Section ${s.index + 1}`;
        if (s.id) desc += ` (id="${s.id}")`;
        if (s.comment) desc += `: ${s.comment}`;
        if (s.heading) desc += ` — "${s.heading}"`;
        return desc;
      }).join('\n');

      const anchorHtml = afterSection ? afterSection.outerHTML.substring(0, 8000) : '';

      notifyParent({
        type: 'vx-editor:add-section-request',
        filePath: getPageFilePath(),
        insertAfterIndex: afterIndex,
        insertAfterHtml: anchorHtml,
        existingSections: existingList,
        totalSections: totalSections,
      });
    });

    // Section highlight: show a soft blue overlay on the controlled section when hovering
    if (!isFirstDivider && afterSection) {
      btnRow.addEventListener('mouseenter', () => showSectionHighlight(afterSection));
      btnRow.addEventListener('mouseleave', () => hideSectionHighlight());
    }

    document.body.appendChild(divider);
    positionDivider();
    divider.__vxReposition = positionDivider;
    sectionDividers.push(divider);
  }

  /**
   * Move a section up or down by swapping it with its neighbor.
   *
   * Each divider controls the section ABOVE it:
   *   ▲ = move section[i] up   → swap with section[i-1]
   *   ▼ = move section[i] down → swap with section[i+1]
   *
   * After the swap, scroll follows the moved section so the user
   * can see the ▲/▼ buttons on the divider below it to undo.
   */
  function moveSection(sectionIndex, direction) {
    const mainEl = document.querySelector('main') || document.body;
    const sections = mainEl.querySelectorAll(':scope > section, :scope > div > section');

    const neighborIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
    if (neighborIndex < 0 || neighborIndex >= sections.length) return;

    // Determine upper/lower for the DOM swap
    const upperIdx = Math.min(sectionIndex, neighborIndex);
    const lowerIdx = Math.max(sectionIndex, neighborIndex);
    const upperEl = sections[upperIdx];
    const lowerEl = sections[lowerIdx];

    // Move preceding HTML comment nodes (<!-- Section Name -->) with their section
    const upperComment = (upperEl.previousSibling?.nodeType === Node.COMMENT_NODE)
      ? upperEl.previousSibling : null;
    const lowerComment = (lowerEl.previousSibling?.nodeType === Node.COMMENT_NODE)
      ? lowerEl.previousSibling : null;

    // DOM swap: insert lower element (with comment) before upper element (with comment)
    const anchor = upperComment || upperEl;
    if (lowerComment) {
      anchor.parentNode.insertBefore(lowerComment, anchor);
    }
    anchor.parentNode.insertBefore(lowerEl, anchor);

    // Rebuild dividers at new DOM positions
    rebuildSectionDividers();

    // Scroll follows the moved section to its new position.
    // The moved section is now at neighborIndex (it took its neighbor's slot).
    scrollToSection(neighborIndex);

    // Notify parent to persist the swap in the source file
    const movedSection = sections[sectionIndex];
    notifyParent({
      type: 'vx-editor:section-moved',
      filePath: getPageFilePath(),
      sectionIndex: upperIdx,
      neighborIndex: lowerIdx,
      direction: direction,
      sourceAddress: getSourceAddress(movedSection),
    });
  }

  function removeSectionDividers() {
    sectionDividers.forEach(d => d.remove());
    sectionDividers = [];
    hideSectionHighlight();
  }

  /**
   * Show a soft blue overlay over a section element to indicate
   * which section a divider's buttons control.
   */
  function showSectionHighlight(sectionEl) {
    if (!sectionHighlightEl) {
      sectionHighlightEl = document.createElement('div');
      sectionHighlightEl.id = 'vx-section-highlight';
      document.body.appendChild(sectionHighlightEl);
    }
    const rect = sectionEl.getBoundingClientRect();
    sectionHighlightEl.style.left = `${rect.left}px`;
    sectionHighlightEl.style.top = `${rect.top + window.scrollY}px`;
    sectionHighlightEl.style.width = `${rect.width}px`;
    sectionHighlightEl.style.height = `${rect.height}px`;
    sectionHighlightEl.style.opacity = '1';
  }

  function hideSectionHighlight() {
    if (sectionHighlightEl) {
      sectionHighlightEl.style.opacity = '0';
    }
  }

  // Inject divider styles
  function injectDividerStyles() {
    if (document.getElementById('vx-divider-styles')) return;
    const style = document.createElement('style');
    style.id = 'vx-divider-styles';
    style.textContent = `
      /* Hide Actions Bar when visual editor is active */
      body.vx-editor-active #vs-actions-bar { display: none !important; }
      .vx-section-divider {
        position: absolute;
        left: 0;
        right: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 0;
        z-index: 9999999;
        pointer-events: none;
      }
      .vx-section-divider::before {
        content: '';
        position: absolute;
        left: 8%;
        right: 8%;
        top: 50%;
        height: 0;
        border-top: 1.5px dashed rgba(59,130,246,0.2);
        transition: all 200ms ease;
      }
      .vx-section-divider:hover::before {
        border-top-style: solid;
        border-top-color: rgba(59,130,246,0.5);
        left: 3%;
        right: 3%;
      }
      /* Section highlight — diagonal hatching over the controlled section on divider hover */
      #vx-section-highlight {
        position: absolute;
        pointer-events: none;
        background:
          repeating-linear-gradient(
            -45deg,
            rgba(59, 130, 246, 0.08),
            rgba(59, 130, 246, 0.08) 4px,
            transparent 4px,
            transparent 14px
          );
        border: 2px solid rgba(59, 130, 246, 0.25);
        border-radius: 8px;
        z-index: 9999998;
        opacity: 0;
        transition: opacity 200ms ease;
      }
      /* Button row: 3-slot flex layout keeps + always centered */
      .vx-section-divider-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        pointer-events: auto;
        position: relative;
      }
      /* Fixed-width slots for ▲ and ▼ — even when empty, they hold space */
      .vx-move-slot {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }
      .vx-section-divider-btn {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border: none;
        border-radius: 50%;
        background: rgba(255,255,255,0.92);
        color: rgba(59,130,246,0.7);
        cursor: pointer;
        pointer-events: auto;
        transition: all 180ms ease;
        z-index: 1;
        padding: 0;
        outline: none;
        box-shadow: 0 1px 4px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.08);
      }
      .vx-section-divider:hover .vx-section-divider-btn,
      .vx-section-divider-btn:focus-visible {
        background: #3b82f6;
        color: #fff;
        box-shadow: 0 2px 12px rgba(59,130,246,0.45), 0 1px 4px rgba(0,0,0,0.2);
        transform: scale(1.08);
      }
      .vx-section-divider-btn:hover {
        transform: scale(1.15);
      }
      .vx-section-divider-btn:active {
        transform: scale(0.96);
      }
      .vx-section-divider-btn svg {
        width: 14px;
        height: 14px;
      }
      /* Move buttons: slightly smaller, fade in on divider hover */
      .vx-section-move-btn {
        width: 24px;
        height: 24px;
        opacity: 0;
        transform: scale(0.7);
        transition: opacity 180ms ease, transform 180ms ease, background 180ms ease, color 180ms ease, box-shadow 180ms ease;
      }
      .vx-section-divider:hover .vx-section-move-btn {
        opacity: 1;
        transform: scale(1);
      }
      .vx-section-move-btn:hover {
        transform: scale(1.12) !important;
      }
      .vx-section-move-btn:active {
        transform: scale(0.92) !important;
      }
      .vx-section-move-btn svg {
        width: 12px;
        height: 12px;
      }
      .vx-section-divider-label {
        position: absolute;
        left: calc(50% + 48px);
        top: 50%;
        transform: translateY(-50%);
        white-space: nowrap;
        font: 500 10px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        letter-spacing: 0.02em;
        color: transparent;
        padding: 4px 8px;
        border-radius: 4px;
        pointer-events: none;
        transition: all 180ms ease;
      }
      .vx-section-divider:hover .vx-section-divider-label {
        color: rgba(255,255,255,0.85);
        background: rgba(0,0,0,0.5);
      }
    `;
    document.head.appendChild(style);
  }

  // ═══════════════════════════════════════════
  //  AI Overlay (covers selected element during generation)
  // ═══════════════════════════════════════════

  function showAIOverlay(status) {
    hideAIOverlay();
    isAIGenerating = true;
    removeSectionDividers();

    const el = selectedEl;
    let posStyle;
    if (el) {
      const r = el.getBoundingClientRect();
      posStyle = `left: ${r.left}px; top: ${r.top}px; width: ${r.width}px; height: ${r.height}px; border-radius: 8px;`;
    } else {
      // No selected element — full-page overlay (e.g. adding a new section)
      posStyle = `left: 0; top: 0; width: 100vw; height: 100vh; border-radius: 0;`;
    }

    const ov = document.createElement('div');
    ov.id = 'vx-ai-overlay';
    ov.style.cssText = `
      position: fixed; z-index: 99999;
      ${posStyle}
      background: rgba(0,0,0,0.45);
      backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);
      display: flex; align-items: center; justify-content: center;
      animation: vxAiFadeIn 200ms ease-out;
      pointer-events: none;
    `;
    ov.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 18px;border-radius:10px;
        background:rgba(26,24,22,0.85);border:1px solid rgba(255,255,255,0.08);
        box-shadow:0 4px 20px rgba(0,0,0,0.3);">
        <div style="display:flex;gap:4px;" id="vx-ai-dots">
          <i style="width:5px;height:5px;border-radius:50%;background:#F4A024;display:block;animation:vxAiDot 1.2s infinite ease-in-out;"></i>
          <i style="width:5px;height:5px;border-radius:50%;background:#F4A024;display:block;animation:vxAiDot 1.2s infinite ease-in-out 0.15s;"></i>
          <i style="width:5px;height:5px;border-radius:50%;background:#F4A024;display:block;animation:vxAiDot 1.2s infinite ease-in-out 0.3s;"></i>
        </div>
        <span style="font:500 12px/1 -apple-system,BlinkMacSystemFont,sans-serif;color:#ede9e2;white-space:nowrap;"
          id="vx-ai-overlay-status">${status || 'AI is editing…'}</span>
      </div>
    `;

    // Inject keyframes if not present
    if (!document.getElementById('vx-ai-keyframes')) {
      const s = document.createElement('style');
      s.id = 'vx-ai-keyframes';
      s.textContent = `
        @keyframes vxAiFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes vxAiDot { 0%,80%,100% { transform:scale(0.5);opacity:0.3; } 40% { transform:scale(1);opacity:1; } }
      `;
      document.head.appendChild(s);
    }

    document.body.appendChild(ov);
  }

  function updateAIOverlayStatus(status) {
    const el = document.getElementById('vx-ai-overlay-status');
    if (el) el.textContent = status || 'AI is editing…';
  }

  function hideAIOverlay() {
    isAIGenerating = false;
    const ov = document.getElementById('vx-ai-overlay');
    if (ov) { ov.style.opacity = '0'; ov.style.transition = 'opacity 200ms'; setTimeout(() => ov.remove(), 200); }
  }

  document.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('click', onClick, true);
  document.addEventListener('scroll', function() {
    if (!active) return;
    if (hoveredEl) updateHoverHighlight(hoveredEl);
    if (selectedEl && !isEditing) updateSelectionHighlight(selectedEl);
  }, { passive: true });
  document.addEventListener('click', function(e) {
    if (!active || isEditing || isEditorElement(e.target)) return;
    const target = findEditableAncestor(e.target);
    if (!target && selectedEl) { deselectElement(); notifyParent({ type: 'vx-editor:deselect' }); }
  });

  // Notify parent that the bridge is ready to receive messages.
  // This fires after iframe reload (save+compile, page nav) so the parent
  // can re-send the editor state (toggle, etc.) at the right time.
  notifyParent({ type: 'vx-editor:bridge-ready' });
})();
