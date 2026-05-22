# PaperCraft — Design Reference

> Editorial Academic Operating System for Indian state-board schools.
> A single source of truth for every visual, structural, and behavioural decision in the product. Treat this file as binding.

---

## 0. Product voice & posture

PaperCraft is an **editorial product**, not a SaaS dashboard. Think *literary journal meets operations console* — warm paper-white surfaces, a serif used with confidence, generous whitespace, calm chrome. The product helps administrators and teachers compose exam papers; the UI should feel like a well-designed printed textbook that happens to be interactive.

- Tone: precise, restrained, scholarly. No marketing copy. No emoji.
- Density: information-rich but never crowded. Whitespace earns its place.
- Motion: subtle, ≤200ms. Never bouncy.
- Avoid: gradient backgrounds, glass-morphism on content surfaces (chrome only), drop-shadow-heavy cards, AI-slop tropes (left-border-accent containers, "magic" sparkle icons everywhere, hand-drawn SVG illustrations).

---

## 1. Brand

| | |
|---|---|
| Name | **Paper*Craft*** (italic on the second word) |
| Brand mark | 28×28 rounded square (`--pc-r-sm`+1px = 7px), linear-gradient `#2A47CC → #355CFF → #6789FF` at 155°, with a paper-fold motif inside (two horizontal white bars) |
| Wordmark | Newsreader 500, 17px, `letter-spacing: -0.025em`. Second word italic + `--pc-ink-3` |
| Tagline contexts | "Admin Workspace" / "Teacher Workspace" rendered as 10.5px uppercase 0.04em tracking under the mark |

The brand mark CSS is canonical — copy from `styles.css` `.pc-brand-mark`. Do not redraw.

---

## 2. Color

All colors are CSS custom properties in `styles.css`. **Never hardcode hex.** Always reference via `var(--pc-…)`.

### 2.1 Brand / primary (Cobalt)

| Token | Hex | Use |
|---|---|---|
| `--pc-primary` | `#355CFF` | Primary action, active nav glyph, focused field accent |
| `--pc-primary-50` | `#EEF2FF` | Active-state tints (nav badge, primary tag) |
| `--pc-primary-100` | `#DEE5FF` | Hover wash on primary tints |
| `--pc-primary-200` | `#BFC9FF` | Selection outlines, soft dividers in primary context |
| `--pc-primary-600` | `#2E4FE0` | Hover end of primary button gradient |
| `--pc-primary-700` | `#2741B8` | Pressed primary |
| `--pc-primary-ink` | `#1B2A6B` | Text on primary-50 tints (e.g. active nav label) |

### 2.2 Surfaces (warm editorial)

| Token | Hex | Use |
|---|---|---|
| `--pc-bg` | `#F5F4EE` | App background. Warm off-white — the "paper" of the product. |
| `--pc-bg-cool` | `#F5F7FB` | Alt cool bg, **analytics surfaces only** |
| `--pc-surface` | `#FFFFFF` | Cards, panels, inputs |
| `--pc-surface-2` | `#FAFAF7` | Sidebars, secondary panels |
| `--pc-surface-3` | `#F2F0E9` | Inset wells, kbd, neutral tag bg |
| `--pc-paper` | `#FAF8F2` | A4 paper canvas |
| `--pc-paper-edge` | `#ECE7D9` | 1px ring around paper canvas |

### 2.3 Ink (text)

| Token | Hex | Use |
|---|---|---|
| `--pc-ink` | `#15161A` | Primary text, headings |
| `--pc-ink-2` | `#2A2C33` | Body text on surfaces |
| `--pc-ink-3` | `#51555E` | Secondary text, breadcrumbs |
| `--pc-ink-4` | `#80858F` | Tertiary, captions, meta |
| `--pc-ink-5` | `#B7BAC2` | Disabled, separators, drag handles |

### 2.4 Hairlines

| Token | Hex | Use |
|---|---|---|
| `--pc-line` | `#E8E5DD` | Default 1px border, warm |
| `--pc-line-2` | `#D9D5C9` | Slightly stronger (hover, emphasised dividers) |
| `--pc-line-cool` | `#E5E7EB` | Cool dividers when on `--pc-bg-cool` |

### 2.5 Status

Every status comes as a (color + tint-bg) pair. Use the tint as background, the color for text/icon.

| Status | Color | Tint bg |
|---|---|---|
| Success | `--pc-success` `#14B87A` | `--pc-success-bg` `#E8F7EF` |
| Warning | `--pc-warning` `#E08A1F` | `--pc-warning-bg` `#FBF2DF` |
| Danger | `--pc-danger` `#DC4A3D` | `--pc-danger-bg` `#FBE9E5` |
| Info | `--pc-info` `#355CFF` | `--pc-info-bg` `#E7ECFF` |

### 2.6 Avatar gradients

Six pre-defined gradients on `.pc-avatar`. Assign deterministically by user — don't randomise.

| Class | Gradient |
|---|---|
| (default) | `#C9A66B → #8C6A3C` (camel) |
| `.is-blue` | `#5A7BFF → #2A47CC` |
| `.is-rose` | `#D67A8A → #A23F55` |
| `.is-teal` | `#4AB0A0 → #1F7A6E` |
| `.is-violet` | `#9A7AD6 → #5E3FA2` |
| `.is-amber` | `#E8B968 → #B07A1C` |

---

## 3. Typography

Three families, used in strict roles. Loaded from Google Fonts in `PaperCraft.html`.

| Token | Family | Role |
|---|---|---|
| `--pc-serif` | **Newsreader** 400/500/600 + italic | Headings, brand wordmark, question bodies (yes, body!), large numerics, paper canvas |
| `--pc-sans` | **Geist** 400/500/600 | UI chrome — nav, buttons, labels, captions, meta |
| `--pc-mono` | **JetBrains Mono** 400/500 | IDs (`Q-2841`), kbd, code, tabular figures where mono is desired |

### 3.1 Default base

```css
.pc-screen {
  font-family: var(--pc-sans);
  font-size: 13.5px;       /* base */
  line-height: 1.5;
  letter-spacing: -0.005em;
  font-feature-settings: "ss01", "cv11";
  -webkit-font-smoothing: antialiased;
}
```

`h1, h2, h3, .pc-serif` automatically switch to Newsreader at `letter-spacing: -0.022em; font-weight: 500`.

### 3.2 Type scale (used in product)

| Size | Family | Weight | Where |
|---|---|---|---|
| 10px | sans | 500, uppercase, 0.08em | Nav section labels |
| 10.5–11px | sans | 400 | Captions, meta, breadcrumbs |
| 11px | sans | 500, uppercase, 0.04em | `<Stat>` label, pipeline column name |
| 11.5–12.5px | sans | 400 / 500 | UI text |
| 12.5px | sans | 500 | Body strong, button label |
| 13–13.5px | sans | 400 | Default body |
| 12.5–14px | **serif** | 400 / italic | Question text, small editorial copy |
| 15px | serif italic | 400 | "Half-Yearly Examination · 2025–26" subtitle |
| 17px | serif | 500 | Brand wordmark |
| 19–22px | serif | 500 | Section heads, paper title, pipeline count |
| 28px | serif | 500, `tracking: -0.025em` | Stat values |

### 3.3 Numerics

Use `.pc-num` (or `font-variant-numeric: tabular-nums`) anywhere numbers stack vertically or animate — counts, marks, percentages, time. **Always tabular** in lists.

### 3.4 Math glyphs

Inline math is HTML, not LaTeX images. Use:
- `.pc-math` — Newsreader italic ink
- `.pc-frac` — stacked fraction
- `.pc-sup` / `.pc-sub` — exponents/subscripts
- Unicode ops: `²`, `−` (minus, not hyphen), `×`, `÷`, `θ`, `π`, `√`

---

## 4. Spacing, radius, elevation

### 4.1 Spacing rhythm

PaperCraft uses an **even-pixel rhythm** (not a strict 4/8 grid). Common values: `2, 4, 6, 8, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32`. Inside chrome, `10–14px` paddings dominate. Inside content cards, `16–22px`. Generous outer page gutters `22px+`.

### 4.2 Radius

| Token | Value | Use |
|---|---|---|
| `--pc-r-xs` | 4 | kbd, pip, tiny chip |
| `--pc-r-sm` | 6 | small button, small chip |
| `--pc-r-md` | 10 | input, popover, pipeline column |
| `--pc-r-lg` | 14 | **panel/card default** |
| `--pc-r-xl` | 20 | floating toolbar/menu (`.pc-float`) |
| `--pc-r-2xl` | 28 | hero/feature surfaces |
| `2px` (literal) | | **paper canvas only** — paper has sharp corners |
| `999px` | | tags, pills, dots |

### 4.3 Shadows (layered, never flat)

Every shadow is composed of 2–4 stacked layers — never a single blurred drop.

| Token | Use |
|---|---|
| `--pc-shadow-xs` | Hairline lift — buttons, chips, inputs |
| `--pc-shadow-sm` | Panel default, hover lift |
| `--pc-shadow-md` | Raised card, dropdown |
| `--pc-shadow-lg` | Floating menus, modals |
| `--pc-shadow-paper` | **A4 canvas only** — heavy multi-layer cast |
| `--pc-ring-primary` | `0 0 0 3px rgba(53,92,255,0.18)` — focus ring |

Primary buttons get a **bespoke** shadow combining inset highlight + colored cast — see `.pc-btn.is-primary` in `styles.css`. Don't approximate; use the class.

---

## 5. Iconography

Lucide-style line icons hand-built in `shared.jsx` as a single `<Icon name="…" size={16} stroke={1.6}/>` component.

- **Stroke**: 1.6 default, 1.4 for small (≤14px), 1.8 for hero (≥24px)
- **Size**: 12 (inline meta), 14 (input/topbar), **15 (nav)**, 16 (button), 24+ (hero)
- **Color**: inherits `currentColor`. In nav, idle `--pc-ink-4`; active `--pc-primary`. Buttons: inherit text color.
- **Never** mix icon libraries. Add a new glyph to the `paths` object in `Icon`.

Available names (canonical set): `home, book, layers, edit, check, archive, bars, chart, upload, download, search, bell, chev, chevDown, plus, minus, sparkles, filter, folder, file, grid, list, dots, user, users, setting, flame, clock, paperclip, eye, lock, flag, sliders, refresh, arrowRight, arrowLeft, drag, info, warn, star, target, image, bold, italic, code, pi, note, palette, play, expand, msg, history`.

---

## 6. Layout primitives

### 6.1 Shell

```
.pc-shell           display:flex  height:100%
  .pc-sidebar       232px fixed, surface-2, right hairline
  .pc-work          flex:1, column
    .pc-topbar      54px, translucent bg + backdrop-blur, hairline + ambient gradient under
    <content>       overflow:auto, padded
```

Every full app screen uses this exact composition. Sidebars and topbars come from `Sidebar`/`Topbar` in `shared.jsx` — don't reinvent.

### 6.2 Two roles, two nav presets

| Role | Preset | Subtitle |
|---|---|---|
| Admin | `ADMIN_NAV` | "Admin Workspace" |
| Teacher | `TEACHER_NAV` | "Teacher Workspace" |

Both include a **session pill** (year + term) under the brand, and a footer with avatar + name + role + cog. Active nav items get an inset-ring + xs-shadow lift and `--pc-primary-ink` text.

### 6.3 Topbar contents

In strict order: breadcrumbs (last segment bold ink) → flexible spacer → 320px command bar `.pc-cmd` with `⌘K` kbd → notification icon button (with red dot if unread) → contextual actions slot.

The topbar bg is `rgba(245,244,238,0.85)` with `backdrop-filter: blur(10px)` and a soft gradient bleed underneath — preserves the editorial warmth while floating over scrolling content.

---

## 7. Components

All component CSS lives in `styles.css`. The patterns are stable; **extend by composition**, not by mutating these classes.

### 7.1 Buttons — `.pc-btn`

| Variant | Class |
|---|---|
| Default | `.pc-btn` (surface bg, line border, xs shadow) |
| Primary | `.pc-btn.is-primary` (cobalt gradient, colored shadow) |
| Ghost | `.pc-btn.is-ghost` (transparent, hover surface-3) |
| Sizes | `.is-sm` (26px), default (32px), `.is-lg` (38px) |

Always include an icon when the action isn't obvious from copy. Gap inside button is 7px (5px on `.is-sm`).

### 7.2 Cards / panels — `.pc-panel` (+ `.pc-panel-pad` for 18×20 padding)

White surface, `--pc-line` border, `--pc-r-lg` radius, `--pc-shadow-sm`. This is the workhorse — every content block sits in one.

### 7.3 Tags / chips — `.pc-tag`

Pill, 22px tall, 11px font, 500 weight. Variants: `.is-primary`, `.is-success`, `.is-warning`, `.is-danger`, `.is-outline`, `.is-ink`. Add a leading `<span class="pc-dot"/>` for status chips.

### 7.4 Difficulty pips — `<Difficulty level={1..4}/>`

Four 6×10 vertical pips. Color tone: easy (1–2) → success green, medium (3) → warning amber, hard (4) → danger red. Filled pips = level, rest stay neutral grey.

### 7.5 Inputs (implicit pattern)

32px tall, `var(--pc-r-sm)` radius, surface bg, `--pc-line` border, xs shadow, 12.5px text. Focus: `box-shadow: var(--pc-ring-primary); border-color: var(--pc-primary);` — no other state change.

### 7.6 Command bar — `.pc-cmd`

The 320px topbar search. Always shows placeholder copy + `⌘K` kbd hint inside `.pc-surface-3` square. Click opens command palette (not yet built; placeholder).

### 7.7 Avatar — `.pc-avatar` + tone class

28×28 default, 50% radius, gradient bg per `is-*` class, initials 11.5px 500 white. For inline (in feed): 26×26 with 11px text. For micro (chip): 16×16 with 8.5px text.

### 7.8 Progress bar — `.pc-bar`

6px tall, surface-3 track, rounded 999px. Tones: default ink, `.is-primary` (gradient), `.is-success`, `.is-warning`. Set width on the inner `<span>`.

### 7.9 Radial — `.pc-radial`

56×56 conic gradient ring with white inner disc, value centred in serif 14px. Set `style={{ '--p': 72 }}` for percentage.

### 7.10 Sparkline — `<Spark points={…} color=… height=…/>`

100×h viewBox, 1.6 stroke, rounded joins. Color defaults to primary. Use for **trend, not magnitude** — never label axes.

### 7.11 Pipeline column — `.pc-pipe-col`

Approval-flow / kanban column. surface-2 bg, line border, md radius, 11×12 pad. Header: 11px uppercase column name + 8px colored dot. Count: 22px Newsreader. Items: white cards with xs shadow, 8×10 pad, 11.5/10.5 type, micro-avatar on the right.

### 7.12 Editorial callout — `.pc-callout`

2px primary left border, 12px left padding. Use for short quotes / highlighted notes. **Never** for general info boxes (that's slop territory).

### 7.13 Paper canvas — `.pc-paper`

The signature surface. Cream `--pc-paper`, faint horizontal ruling lines every 28px, a top radial vignette, a multiplied SVG-noise texture for fibre, a heavy multi-layer cast shadow, and a 1px paper-edge ring. **2px** corner radius (almost square). Anything inside must `position: relative` to stack above the texture (handled by `.pc-paper > *`).

Three paper layouts ship as **tweak variations**, all using the same `.pc-paper` surface:
- **Classic** — centred crest, all-caps school name, italic exam title, decorative rules. Default sober Indian board look.
- **Editorial** — left-aligned masthead, larger serif title, denser meta strip. More magazine-like.
- **Bilingual** — Hindi + English side-by-side header and dual-script question rendering. Current default.

### 7.14 Workspace dot field — `.pc-dots`

Subtle 22px dot grid for the workspace surface behind floating elements (Paper Builder's canvas area). Never inside a card.

### 7.15 Float surface — `.pc-float`

The translucent floating chrome used for toolbars, popovers, action menus. 94% white + blur + saturate + lg shadow + xl radius. Use **sparingly** — it's premium and loses meaning if everywhere.

### 7.16 Drop target — `.pc-drop-target`

Dashed primary outline + primary-50 wash. Toggle via `onDragEnter/Leave` on a stable container — never let it flicker per child.

---

## 8. Scroll & overflow

Custom scrollbar via `.pc-scroll`:
- 8px width, transparent track, `rgba(20,22,26,0.10)` pill thumb.
- Apply to any scrollable region inside chrome. Don't rely on default browser scrollbars in screenshots/exports.

---

## 9. Screen inventory

Six artboards live on the design canvas in `PaperCraft.html`. Treat them as the canonical reference for layout density and composition.

| # | Artboard | File | Role | Size |
|---|---|---|---|---|
| ① | Academic Control Center | `screens/ControlCenter.jsx` | Admin | 1440×1000 |
| ② | Question Repository | `screens/Repository.jsx` | Admin | 1440×1000 |
| ③ | Paper Builder · Composition Canvas | `screens/PaperBuilder.jsx` | Admin | 1440×1100 |
| ④ | Approval Workspace | `screens/Approval.jsx` | Admin | 1440×1100 |
| ⑤ | Generate Paper · Teacher Flow | `screens/GenerateFlow.jsx` | Teacher | 1440×1000 |
| ⑥ | Curriculum Workspace | `screens/Curriculum.jsx` | Admin | 1440×1000 |

All run at **1440px design width** at 1× scale. Screens are full-bleed inside their artboard — no extra margin.

---

## 10. Content & copy

- **Names**: use plausible Indian names (Aarav Kapoor, Priya Menon, etc.). Roles in English ("Vice Principal · Admin").
- **Sessions**: format `YYYY–YY · Term N` (e.g. "2025–26 · Term II").
- **Exam types**: "Half-Yearly", "Pre-Board", "Unit Test I", etc. Never "Q1" / "Q2".
- **Question IDs**: `Q-####` in monospace.
- **Question text**: full editorial sentences in Newsreader. State-board flavour (CBSE/ICSE Class X Maths default in samples).
- **Marks**: `<n>m` postfix in meta (`3m`, `5m`). Tabular numerics in tables/lists.
- **Time**: minutes as `5 min`. Durations as `48 min`. Dates: `12 Oct 2025`.
- **Voice**: terse, declarative. Lead with the verb. No "Let's" / "Awesome" / exclamation marks.

---

## 11. File / code conventions

- **CSS** lives in `styles.css`. Class prefix `pc-`. Tokens only via `var(--pc-*)`.
- **React** is loaded as inline JSX (`<script type="text/babel">`). Every screen file declares its own component and exposes it on `window` at the bottom:
  ```js
  Object.assign(window, { ControlCenter });
  ```
- Use `const xyzStyles = { … }` (component-prefixed) for non-trivial inline style objects. **Never** `const styles = { … }` — name collides across files.
- Icons via `<Icon name="…">`. Never hardcode an SVG inline unless it's truly bespoke (school crest, paper marks).
- Avatars: `<div className={"pc-avatar " + cls}>{initials}</div>`.
- Tags: `<span className="pc-tag is-…">…</span>`.
- Stats: `<Stat label="…" value="42" unit="papers" hint="…"/>`.

---

## 12. Tweakable surfaces (host integration)

`PaperCraft.html` exposes tweaks via the standard `__edit_mode_*` protocol and `TWEAK_DEFAULTS` JSON block. Current tweaks:

| Key | Type | Values | Affects |
|---|---|---|---|
| `canvas` | radio | `classic` / `editorial` / `bilingual` | Paper Builder canvas variation |

When adding tweaks: register them in the JSON block between `/*EDITMODE-BEGIN*/` and `/*EDITMODE-END*/`, render via `<TweakRadio/>` etc. inside `<TweaksPanel title="Tweaks">`, and persist via `setTweak('key', value)`.

---

## 13. What to avoid

A non-exhaustive list of things that violate the system:

- Single-layer flat shadows (`box-shadow: 0 4px 8px rgba(0,0,0,0.1)`).
- Pure white app background (must be `--pc-bg` cream).
- Sans-serif headings.
- Indigo/violet brand drift — cobalt only (`--pc-primary`).
- Gradient text or gradient borders.
- Hand-drawn SVG hero illustrations.
- Emoji as iconography.
- Left-accent-border info boxes outside `.pc-callout`.
- "Sparkle" icon as decoration (only on actual AI/generate actions).
- Mixing icon libraries.
- Inline hex codes anywhere outside `styles.css`.
- Off-grid radii (only the `--pc-r-*` ladder, plus literal `2px` for paper, `999px` for pills).
- Tabular text without `font-variant-numeric: tabular-nums`.

---

## 14. Quick recipes

**A new screen.**
```jsx
const NewScreen = () => (
  <div className="pc-screen">
    <div className="pc-shell">
      <Sidebar role="admin" active="…" items={ADMIN_NAV}
        footName="…" footRole="…" footAvatar="AK" footAvatarClass="is-blue" />
      <div className="pc-work">
        <Topbar crumbs={["PaperCraft","Section","Page"]} actions={<button className="pc-btn is-primary"><Icon name="plus" size={14}/>New</button>} />
        <main className="pc-scroll" style={{ padding: 22 }}>
          {/* content */}
        </main>
      </div>
    </div>
  </div>
);
Object.assign(window, { NewScreen });
```

**A panel of stats.**
```jsx
<div className="pc-panel pc-panel-pad">
  <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:24 }}>
    <Stat label="Papers built" value="142" hint="↑ 12 this week" />
    <Stat label="Pending approval" value="7" unit="papers" />
    {/* … */}
  </div>
</div>
```

**A question card** — see `BrowserQuestion` in `PaperBuilder.jsx`. Copy and adapt; don't reinvent.

---

_Last updated: design pass v1. If you change a token, update this file the same commit._
