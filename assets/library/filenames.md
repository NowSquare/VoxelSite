# Image Library — Filename Convention

> **Purpose:** Every filename encodes enough metadata for the AI prompt
> generator to select, describe, and contrast-match images _without_
> `library.json`. Filenames are parsed directly by `SiteContext::scanImageDirectory()`.

---

## 1. Delimiter rules

| Character | Role | Example |
|---|---|---|
| `_` (underscore) | **Segment separator** — splits the filename into parseable fields | `vs-bg_sand-dunes_texture_earthy_warm_dark-text` |
| `-` (hyphen) | **Word joiner** — connects words _within_ a single segment | `sand-dunes`, `dark-text`, `food-bakery` |

This means a parser can `split('_')` to get exactly the right number of fields,
then read each field as a human-readable phrase.

---

## 2. Filename anatomy

### Backgrounds (16:9, 1920×1080, PNG)

```
vs-bg_{subject}_{type}_{mood}_{tone}_{contrast}.png
```

| # | Segment | What it encodes | Values |
|---|---|---|---|
| 1 | `vs-bg` | Prefix (fixed) | — |
| 2 | `subject` | 1–3 word visual description | `honey-haze`, `slate-crags`, `iridescent-silk`, `cracked-earth` |
| 3 | `type` | Image category | `texture`, `gradient`, `abstract`, `atmosphere` |
| 4 | `mood` | Emotional register | `warm`, `cool`, `earthy`, `moody`, `soft`, `bold`, `playful`, `ethereal`, `neutral` |
| 5 | `tone` | Overall lightness | `light`, `dark`, `neutral`, `warm` |
| 6 | `contrast` | Best text overlay colour | `dark-text`, `light-text` |

### Gallery (1:1, 800×800, PNG)

```
vs-gal_{subject}_{categories}_{tone}_{contrast}.png
```

| # | Segment | What it encodes | Values |
|---|---|---|---|
| 1 | `vs-gal` | Prefix (fixed) | — |
| 2 | `subject` | 1–3 word description of the thing pictured | `crusty-loaf`, `stone-mug`, `shell-spiral` |
| 3 | `categories` | 1–3 use-case tags joined by `-` | `food-bakery`, `craft-hospitality`, `architecture-interior` |
| 4 | `tone` | Overall lightness | `light`, `dark`, `warm`, `cool` |
| 5 | `contrast` | Best text overlay colour | `dark-text`, `light-text` |

> **No variants.** Every file has a unique `{subject}` — there are no `-b`/`-c` suffixes.

---

## 3. Parsing algorithm

```python
name = "vs-bg_sand-dunes_texture_earthy_warm_dark-text"
segments = name.split('_')
# segments = ['vs-bg', 'sand-dunes', 'texture', 'earthy', 'warm', 'dark-text']
# [0] prefix  [1] subject  [2] type  [3] mood  [4] tone  [5] contrast

name = "vs-gal_crusty-loaf_food-bakery_dark_light-text"
segments = name.split('_')
# segments = ['vs-gal', 'crusty-loaf', 'food-bakery', 'dark', 'light-text']
# [0] prefix  [1] subject  [2] categories  [3] tone  [4] contrast
```

Number of segments determines the type:
- 6 segments → background (`vs-bg`)
- 5 segments → gallery (`vs-gal`)

---

## 4. Midjourney prompt templates

### 4.1 Background images (16:9)

**Standard parameters:**
```
--ar 16:9 --v 7 --s {stylize}
```

| Parameter | Value | Notes |
|---|---|---|
| `--ar` | `16:9` | Always 16:9 for backgrounds |
| `--v` | `7` | Midjourney v7 |
| `--s` | `100` for textures/gradients, `180` for abstracts/atmosphere | Higher stylize for more artistic results |

**Standard negative prompt (append to every background):**
```
--no text, words, letters, logos, watermarks, people, faces, hands, objects, furniture, room, depth of field, bokeh, angle, perspective
```

> For gradients, replace the negative with:
> `--no text, words, letters, logos, watermarks, people, faces, hands, objects, furniture, landscape`

#### Prompt structure by type

**Textures** (`_texture_`):
```
Seamless flat texture photograph shot from directly above, perfectly orthographic
perspective with no angle or distortion, studio lighting with soft even diffusion.
{DESCRIPTION} filling the entire frame edge to edge, {SURFACE DETAIL},
no objects, no context, texture only
--ar 16:9 --v 7 --s 100
--no text, words, letters, logos, watermarks, people, faces, hands, objects,
    furniture, room, depth of field, bokeh, angle, perspective
```

**Gradients** (`_gradient_`):
```
Editorial photography style, minimal composition, premium aesthetic, no people.
Soft gradient transitioning from {COLOR A} to {COLOR B} to {COLOR C},
smooth continuous color flow, no shapes, no objects,
pure abstract {warm|cool} color field, {FEELING}
--ar 16:9 --v 7 --s 100
--no text, words, letters, logos, watermarks, people, faces, hands, objects,
    furniture, landscape
```

**Abstracts** (`_abstract_`):
```
Editorial photography style, soft lighting, minimal composition, premium
aesthetic, no people. {DESCRIPTION}, {TONES AND COLOURS}, {TEXTURE/MOVEMENT},
no context, isolated against soft {light|dark} background
--ar 16:9 --v 7 --s 180
--no text, words, letters, logos, watermarks, people, faces, hands, UI elements,
    furniture, room
```

**Atmosphere** (`_atmosphere_`):
```
Editorial photography style, soft lighting, minimal composition, premium
aesthetic, no people. {DESCRIPTION}, {LIGHTING AND MOOD}, {COLOUR PALETTE},
{FEELING}
--ar 16:9 --v 7 --s 180
--no text, words, letters, logos, watermarks, people, faces, hands, UI elements,
    furniture, room
```

### 4.2 Gallery images (1:1)

**Standard parameters:**
```
--ar 1:1 --v 7 --s 150
```

| Parameter | Value | Notes |
|---|---|---|
| `--ar` | `1:1` | Always square for gallery |
| `--v` | `7` | Midjourney v7 |
| `--s` | `150` | Consistent across all gallery images |

**Standard preamble (start every gallery prompt with this):**
```
Editorial photography, soft natural lighting, muted desaturated tones with
slightly warm color grade, minimal composition, no people.
```

**Standard negative prompt:**
```
--no text, words, letters, logos, watermarks, people, faces, hands, UI elements, clutter
```

> Add `, branding` to the negative for product shots (skincare, barber tools, etc.)
> Add `, bottles` for drink shots where you want focus on glassware.

**Gallery prompt structure:**
```
Editorial photography, soft natural lighting, muted desaturated tones with
slightly warm color grade, minimal composition, no people.
{SPECIFIC SUBJECT DESCRIPTION}, {LIGHTING DETAIL}, {MOOD/FEELING},
editorial {CATEGORY} photography
--ar 1:1 --v 7 --s 150
--no text, words, letters, logos, watermarks, people, faces, hands,
    UI elements, clutter{, EXTRA NEGATIVES}
```

---

## 5. Image selection rules

1. Match image tone to site colour scheme (warm site → warm images, dark → dark)
2. `dark` tone images → use light/white text overlay
3. `light` tone images → use dark text
4. Textures as backgrounds: always add overlay for legibility:
   `background: linear-gradient(rgba(0,0,0,0.35),rgba(0,0,0,0.35)), url(…);`
5. Never reuse the same image on one page
6. Max 3–4 library images per page — less is more
7. User-uploaded images always replace library images
8. Always add descriptive alt text based on the `subject` segment
9. Match gallery `categories` to the business type from the filename
