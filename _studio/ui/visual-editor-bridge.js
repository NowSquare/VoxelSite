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

      const baseRule = classToCSS(baseClass);
      if (baseRule) {
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
    if (!active || isEditing || isAIGenerating) return;
    if (isEditorElement(e.target)) return;
    e.preventDefault(); e.stopPropagation();
    const el = findEditableAncestor(e.target);
    if (!el) return;
    if (selectedEl && selectedEl !== el) deselectElement();
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

  function startTextEditing() {
    if (!selectedEl || isEditing || !isTextElement(selectedEl)) return;
    isEditing = true;
    originalContent = selectedEl.innerHTML;
    selectedEl.contentEditable = 'true';
    selectedEl.focus();
    selectedEl.style.outline = '2px solid #3b82f6';
    selectedEl.style.outlineOffset = '2px';
    const range = document.createRange();
    range.selectNodeContents(selectedEl);
    const sel = window.getSelection();
    sel.removeAllRanges(); sel.addRange(range);
    hideHoverHighlight(); hideSelectionHighlight();
    selectedEl.addEventListener('blur', onEditBlur, { once: true });
    selectedEl.addEventListener('keydown', onEditKeydown);
  }

  function onEditKeydown(e) {
    if (e.key === 'Escape') { e.preventDefault(); selectedEl.innerHTML = originalContent; finishEditing(); }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); finishEditing(); }
  }

  function onEditBlur() { setTimeout(() => { if (isEditing) finishEditing(); }, 150); }

  function finishEditing() {
    if (!selectedEl || !isEditing) return;
    isEditing = false;
    const newContent = selectedEl.innerHTML;
    selectedEl.contentEditable = 'false';
    selectedEl.removeAttribute('contenteditable');
    selectedEl.style.outline = ''; selectedEl.style.outlineOffset = '';
    selectedEl.removeEventListener('keydown', onEditKeydown);
    selectedEl.removeEventListener('blur', onEditBlur);
    if (newContent !== originalContent) {
      notifyParent({ type: 'vx-editor:text-changed', filePath: getPageFilePath(), originalHTML: originalContent, newHTML: newContent });
    }
    originalContent = null;
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
    notifyParent({ type: 'vx-editor:element-deleted', filePath: getPageFilePath(), outerHTML });
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

    // Inject JIT CSS for ALL classes to ensure preview works
    injectJitCSS(newClasses);

    selectedEl.className = newClassAttr;

    if (!silent && oldClassAttr !== newClassAttr) {
      notifyParent({ type: 'vx-editor:text-changed', filePath: getPageFilePath(), originalHTML: `class="${oldClassAttr}"`, newHTML: `class="${newClassAttr}"` });
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

  function isEditorElement(el) { return el.id === 'vx-overlay' || el.closest('#vx-overlay'); }

  function getPageFilePath() {
    try { return new URLSearchParams(window.location.search).get('path') || 'index.php'; }
    catch { return 'index.php'; }
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
        if (active) { createOverlay(); document.body.style.cursor = 'crosshair'; }
        else { deselectElement(); hoveredEl = null; removeOverlay(); document.body.style.cursor = ''; clearJitCSS(); originalClasses = null; }
        break;
      case 'vx-editor:start-edit': if (e.data.mode === 'text') startTextEditing(); break;
      case 'vx-editor:swap-image': swapImage(e.data.src); break;
      case 'vx-editor:preview-class': previewClass(e.data); break;
      case 'vx-editor:update-classes': applyClasses(e.data.classes || [], !!e.data.silent); break;
      case 'vx-editor:update-link': updateLink(e.data); break;
      case 'vx-editor:delete-element': deleteElement(); break;
      case 'vx-editor:show-ai-overlay': showAIOverlay(e.data.status); break;
      case 'vx-editor:hide-ai-overlay': hideAIOverlay(); break;
      case 'vx-editor:update-ai-status': updateAIOverlayStatus(e.data.status); break;
    }
  });

  // ═══════════════════════════════════════════
  //  AI Overlay (covers selected element during generation)
  // ═══════════════════════════════════════════

  function showAIOverlay(status) {
    hideAIOverlay();
    isAIGenerating = true;
    const el = selectedEl;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ov = document.createElement('div');
    ov.id = 'vx-ai-overlay';
    ov.style.cssText = `
      position: fixed; z-index: 99999;
      left: ${r.left}px; top: ${r.top}px;
      width: ${r.width}px; height: ${r.height}px;
      background: rgba(0,0,0,0.45);
      backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);
      display: flex; align-items: center; justify-content: center;
      border-radius: 8px;
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
})();
