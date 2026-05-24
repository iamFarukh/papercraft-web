# Paper Editor — Production-Grade Implementation Specification v2

> **What this is:** A comprehensive formatting engine for a Question Paper Builder. Teachers compose exam papers, then enter a Format mode to control every aspect of the paper's visual layout before exporting to PDF or DOCX. This is a complex system — not a prototype. Every control, constraint, edge case, and failure mode is specified below.

> **Tech stack:** React + Vite + Zustand (with immer) + CSS custom properties. No canvas — pure CSS with `mm`/`pt` print units.

---

## TABLE OF CONTENTS

1. [Control Philosophy — Two-Tier System](#1-control-philosophy)
2. [Global Sync System](#2-global-sync-system)
3. [Slider Specification — No Fixed Options Anywhere](#3-slider-specification)
4. [Advanced Customization Mode](#4-advanced-customization-mode)
5. [Page Setup & Paper Sizes](#5-page-setup--paper-sizes)
6. [Header System](#6-header-system)
7. [Spacing System](#7-spacing-system)
8. [Typography System](#8-typography-system)
9. [Question Block Controls](#9-question-block-controls)
10. [Section Controls](#10-section-controls)
11. [Divider System](#11-divider-system)
12. [Marks Display](#12-marks-display)
13. [Footer & Page Numbers](#13-footer--page-numbers)
14. [Edge Cases — Complete Catalog](#14-edge-cases--complete-catalog)
15. [Page Break Engine](#15-page-break-engine)
16. [Overflow Handling](#16-overflow-handling)
17. [Print & PDF Rendering](#17-print--pdf-rendering)
18. [DOCX Export](#18-docx-export)
19. [Reset & Undo System](#19-reset--undo-system)
20. [Institutional Preset Locking](#20-institutional-preset-locking)
21. [Responsive Editor Behavior](#21-responsive-editor-behavior)
22. [Complete Config Schema](#22-complete-config-schema)
23. [CSS Custom Property Bridge](#23-css-custom-property-bridge)
24. [Zustand Store](#24-zustand-store)
25. [Implementation Order](#25-implementation-order)

---

## 1. CONTROL PHILOSOPHY

### Two-Tier System

The editor operates in two modes. The user sees the simple mode by default and must explicitly opt into advanced mode.

**Simple Mode (Default):**

- Global font size slider (one slider controls all question text)
- Global spacing slider (one slider controls all gaps)
- Header presets (Compact / Standard / Spacious) as visual cards
- Marks style toggle
- Page margin presets (Tight / Normal / Wide)
- Everything "just works" — no risk of breaking layout

**Advanced Mode (Opt-in):**

- Per-element font size sliders (question text, MCQ options, section headers, marks, instructions — each independent)
- Per-element spacing sliders (between questions, between sections, after headers, MCQ gaps, etc.)
- Per-question overrides (click any question to override its spacing/font/indent)
- Per-section overrides (columns, page breaks, independent spacing)
- Header field-by-field control (each line's font size, weight, spacing, margins)
- Divider customization (style, weight, width, color per location)
- Full typography control (font families, line height, letter spacing)
- Footer customization

### Why Two Tiers

Most teachers want their paper to look good and print on fewer pages. They don't want to learn a layout engine. Simple mode gives them 4-5 sliders that handle 90% of needs. Advanced mode is for the 10% who want pixel-perfect control — power users, exam coordinators, school administrators setting institutional templates.

---

## 2. GLOBAL SYNC SYSTEM

### The Problem

When a teacher sets "Question font size = 11pt" in simple mode, ALL questions must use 11pt. When they switch to advanced mode and change one question to 12pt, that question breaks away from global. If they then move the global slider, the overridden question should NOT change — it's been manually set.

### Implementation: Inheritance with Override Tracking

```typescript
// Every controllable property follows this pattern:
interface InheritableValue<T> {
  global: T; // The global/default value
  overrides: Record<string, T>; // Per-element overrides, keyed by element ID
}

// Resolution function:
function resolve<T>(prop: InheritableValue<T>, elementId: string): T {
  return prop.overrides[elementId] ?? prop.global;
}

// When global changes, ONLY elements WITHOUT overrides update.
// Elements WITH overrides keep their value.
```

### Visual Indicator

When a question/section has a per-element override that differs from global:

- Show a small dot indicator (●) on the question's floating toolbar
- In the per-element control, show: `11pt (global: 10pt)` with a "Reset to global" link
- This makes it obvious which elements are "detached" from global

### "Apply to All" Button

In advanced mode, every per-element control has an "Apply to all" button that:

1. Sets the global value to the current element's value
2. Clears ALL per-element overrides for that property
3. Shows a toast: "Applied 12pt to all questions. 3 custom overrides cleared."

---

## 3. SLIDER SPECIFICATION — NO FIXED OPTIONS ANYWHERE

**Critical rule: Every numeric control is a continuous slider with a numeric input field.** No dropdowns with 3-4 fixed options. No "Small / Medium / Large" without a slider underneath.

### Slider Component Spec

```typescript
interface SliderControl {
  label: string; // "Question font size"
  value: number; // Current value
  min: number; // Minimum allowed
  max: number; // Maximum allowed
  step: number; // Increment size
  unit: string; // "pt", "mm", "px", "%", "×"
  default: number; // Default value (for reset)
  onChange: (v: number) => void;

  // Optional
  marks?: number[]; // Tick marks on slider (e.g., [8, 10, 12, 14])
  warningRange?: [number, number]; // Values outside this range show warning color
  dangerRange?: [number, number]; // Values outside this range show red + tooltip
}
```

### Slider UI Behavior

- Dragging the thumb updates preview in real-time (every frame, debounced at 16ms)
- Clicking the numeric value makes it editable as a text input (for precise entry)
- The numeric input field accepts values within [min, max] — clamps if out of range
- Double-clicking the slider resets to default value
- The track shows a subtle color gradient: green in safe range, yellow in warning range, red in danger range
- Keyboard: arrow keys move by `step`, shift+arrow moves by `step * 10`

### Global Slider Ranges

| Property                | Min  | Max | Step | Default | Unit  | Warning Range | Danger Range |
| ----------------------- | ---- | --- | ---- | ------- | ----- | ------------- | ------------ |
| **Font sizes**          |      |     |      |         |       |               |              |
| Question text           | 7    | 18  | 0.5  | 11      | pt    | <8, >14       | <7.5, >16    |
| MCQ options             | 7    | 16  | 0.5  | 10      | pt    | <8, >13       | <7.5, >15    |
| Section header          | 9    | 22  | 0.5  | 13      | pt    | <10, >18      | <9, >20      |
| Instructions            | 7    | 14  | 0.5  | 10      | pt    | <8, >12       | <7.5, >13    |
| Marks label             | 6    | 14  | 0.5  | 9       | pt    | <7, >12       | <6.5, >13    |
| School name             | 10   | 30  | 0.5  | 16      | pt    | <11, >24      | <10, >28     |
| Tagline                 | 7    | 16  | 0.5  | 9       | pt    | <8, >14       | <7, >15      |
| Exam info               | 7    | 16  | 0.5  | 10      | pt    | <8, >13       | <7, >15      |
| Exam title              | 9    | 20  | 0.5  | 12      | pt    | <10, >16      | <9, >18      |
| Footer                  | 6    | 12  | 0.5  | 8       | pt    | <7, >10       | <6, >11      |
| Continuation            | 6    | 12  | 0.5  | 8       | pt    | <7, >10       | <6, >11      |
| **Spacing**             |      |     |      |         |       |               |              |
| Between questions       | 0    | 15  | 0.5  | 3       | mm    | <1, >8        | <0.5, >12    |
| Between sections        | 0    | 25  | 0.5  | 6       | mm    | <2, >15       | <1, >20      |
| After section header    | 0    | 12  | 0.5  | 2       | mm    | <1, >6        | <0, >10      |
| After instructions      | 0    | 12  | 0.5  | 3       | mm    | <1, >8        | <0, >10      |
| Question indent         | 0    | 25  | 0.5  | 8       | mm    | <4, >15       | <2, >20      |
| MCQ option gap          | 0    | 8   | 0.5  | 1.5     | mm    | <0, >4        | <0, >6       |
| MCQ option indent       | 0    | 25  | 1    | 6       | mm    | <3, >15       | <0, >20      |
| **Page margins**        |      |     |      |         |       |               |              |
| Top                     | 5    | 40  | 1    | 15      | mm    | <8, >25       | <5, >35      |
| Bottom                  | 5    | 40  | 1    | 15      | mm    | <8, >25       | <5, >35      |
| Left                    | 5    | 40  | 1    | 18      | mm    | <10, >25      | <5, >35      |
| Right                   | 5    | 40  | 1    | 12      | mm    | <8, >20       | <5, >30      |
| **Other**               |      |     |      |         |       |               |              |
| Line height             | 1.0  | 2.2 | 0.05 | 1.35    | ×     | <1.1, >1.8    | <1.0, >2.0   |
| Letter spacing (school) | -0.5 | 5   | 0.25 | 0.5     | px    | <0, >3        | <-0.5, >4    |
| Divider weight          | 0.25 | 4   | 0.25 | 1       | pt    | <0.5, >2.5    | <0.25, >3    |
| Divider width           | 30   | 100 | 5    | 100     | %     | <50, -        | <30, -       |
| Answer lines            | 0    | 25  | 1    | 0       | lines | -, >15        | -, >20       |
| Answer line spacing     | 4    | 15  | 0.5  | 8       | mm    | <5, >12       | <4, >14      |

### Warning/Danger Tooltip Text

- **Warning (yellow):** "This value is outside the typical range. The paper will still generate correctly."
- **Danger (red):** "Extreme value. This may cause readability issues, overflow, or printing problems. Proceed with caution."
- Tooltips appear on hover over the colored region of the slider track

---

## 4. ADVANCED CUSTOMIZATION MODE

### Activation Flow

```
┌─────────────────────────────────────────────────────┐
│  Layout Mode                                        │
│                                                     │
│  (●) Standard — recommended for most papers         │
│  ( ) Advanced — full control over every element      │
│                                                     │
│  When "Advanced" is selected:                       │
│  ┌─────────────────────────────────────────────┐    │
│  │  ⚠ Custom Layout Warning                    │    │
│  │                                             │    │
│  │  Advanced customization gives you full       │    │
│  │  control over fonts, spacing, margins, and   │    │
│  │  per-element overrides.                      │    │
│  │                                             │    │
│  │  Please note:                               │    │
│  │  • Changes may affect alignment and page    │    │
│  │    breaks in unexpected ways                │    │
│  │  • Extreme values can cause overflow or     │    │
│  │    printing issues                          │    │
│  │  • Per-element overrides break global sync  │    │
│  │  • Some combinations may not look good in   │    │
│  │    print vs screen preview                  │    │
│  │                                             │    │
│  │  You can reset to defaults at any time.     │    │
│  │                                             │    │
│  │  [Cancel]  [Enable Advanced Mode]           │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### What Changes Between Modes

| Control            | Standard Mode                                            | Advanced Mode                                             |
| ------------------ | -------------------------------------------------------- | --------------------------------------------------------- |
| Font sizes         | ONE global slider for all questions                      | Separate slider per element type + per-question override  |
| Spacing            | ONE global "density" slider (maps to multiple values)    | Separate slider per spacing type + per-question override  |
| Page margins       | 3 presets (Tight/Normal/Wide) + one "all margins" slider | 4 independent margin sliders with link toggle             |
| Header             | 3 presets (Compact/Standard/Spacious)                    | Every field individually controllable                     |
| Dividers           | On/Off toggle                                            | Style, weight, width, color per divider                   |
| Typography         | Font family picker + global size                         | Per-element font family, size, weight, style, line-height |
| Marks              | Style picker ([5]/(5)/hidden)                            | Style + position + font size                              |
| Per-question edits | Hidden                                                   | Click any question for override controls                  |
| Per-section edits  | Hidden                                                   | Click any section header for override controls            |
| Footer             | Show/hide page numbers                                   | Full control (format, position, custom text, font)        |

### Standard Mode — "Density" Slider Mapping

The single "density" slider in standard mode maps to multiple spacing values using a ratio system:

```typescript
const DENSITY_RATIOS = {
  betweenQuestions: 1.0, // base
  betweenSections: 2.0, // 2x the question spacing
  afterSectionHeader: 0.67, // 2/3 of question spacing
  afterInstructions: 1.0, // same as question spacing
  mcqOptionGap: 0.5, // half of question spacing
};

// When density slider is at value X mm:
function densityToSpacing(density: number): SpacingConfig {
  return {
    betweenQuestions: density * DENSITY_RATIOS.betweenQuestions,
    betweenSections: density * DENSITY_RATIOS.betweenSections,
    afterSectionHeader: density * DENSITY_RATIOS.afterSectionHeader,
    afterInstructions: density * DENSITY_RATIOS.afterInstructions,
    mcqOptionGap: density * DENSITY_RATIOS.mcqOptionGap,
  };
}

// Density slider: min 0.5mm, max 8mm, step 0.5mm, default 3mm
// At 3mm: questions=3mm, sections=6mm, sectionHeader=2mm, instructions=3mm, mcq=1.5mm
// At 1mm: questions=1mm, sections=2mm, sectionHeader=0.67mm, instructions=1mm, mcq=0.5mm
```

### Standard Mode — "Page Margin" Presets + Slider

```
Page Margins
[Tight]  [Normal]  [Wide]   All: [===●=====] 15mm

Tight:   { top: 10, bottom: 10, left: 12, right: 10 }
Normal:  { top: 15, bottom: 15, left: 18, right: 12 }
Wide:    { top: 20, bottom: 20, left: 25, right: 15 }
```

The "All" slider sets all four margins to the same value. When a preset is selected, the slider jumps to the average of the preset values. When the slider is moved manually, the preset indicator shows "Custom".

### Switching Modes

- **Standard → Advanced:** All current values are preserved. Advanced controls populate with the computed values from the standard sliders.
- **Advanced → Standard:** Show confirmation: "Switching to Standard mode will keep your global values but clear per-element overrides. Continue?" If confirmed, clear all `questionOverrides` and `sectionOverrides`. Map the current spacing values back to the nearest density slider position.
- Store `layoutMode: 'standard' | 'advanced'` in the config. This is persisted — if a teacher always uses advanced mode, they don't re-enable it every time.

---

## 5. PAGE SETUP & PAPER SIZES

### Supported Sizes

| Size   | Width | Height | Common Use                                             |
| ------ | ----- | ------ | ------------------------------------------------------ |
| A4     | 210mm | 297mm  | Indian schools (CBSE, ICSE, state boards) — DEFAULT    |
| Legal  | 216mm | 356mm  | Some government/university exams                       |
| Letter | 216mm | 279mm  | Rare in India, but supported for international schools |
| A3     | 297mm | 420mm  | Large-format exams (rare, but requested)               |
| B5     | 176mm | 250mm  | Compact test papers                                    |

### Orientation

- Portrait (default) / Landscape toggle
- When switching orientation, width and height swap
- All margin/spacing values remain in mm and still apply — no recalculation needed

### Paper Size Change — Edge Cases

**Edge case: Content overflows after size change**
When switching from A4 to B5 (smaller), content that fit on 4 A4 pages might need 6 B5 pages.

- Immediately recalculate page count and show updated count
- If page count increases by >50%, show info toast: "Paper increased from 4 to 7 pages. Consider reducing spacing or font size."
- Do NOT auto-adjust anything — the teacher decides

**Edge case: Legal paper with A4 margins**
If a teacher switches from A4 to Legal but keeps A4 margins, the extra height is all content area. This is fine — no adjustment needed. But if margins are percentage-based (they're not — we use mm), they'd need recalculation.

**Edge case: Landscape + 2 columns**
Landscape A4 is 297mm wide × 210mm tall. With 2 columns, each column is ~130mm wide (after margins), which is very usable. But with 1 column, lines are extremely wide (150mm+), making text hard to read. Show a recommendation: "Landscape papers work best with 2-column layout for readability."

### Content Area Calculation

```typescript
function getContentArea(config: PaperFormatConfig): {
  width: number;
  height: number;
} {
  const pageDimensions = PAGE_SIZES[config.pageSize];
  const w =
    config.pageOrientation === "portrait"
      ? pageDimensions.width
      : pageDimensions.height;
  const h =
    config.pageOrientation === "portrait"
      ? pageDimensions.height
      : pageDimensions.width;

  return {
    width: w - config.pageMargins.left - config.pageMargins.right,
    height: h - config.pageMargins.top - config.pageMargins.bottom,
  };
}
```

---

## 6. HEADER SYSTEM

### Header Repeat Mode

```typescript
headerRepeatMode: "firstPageOnly" | "allPages" | "compactRepeat" | "none";
```

| Mode            | Page 1      | Page 2+                                                | Use Case                                                    |
| --------------- | ----------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| `firstPageOnly` | Full header | Nothing                                                | DEFAULT — most schools                                      |
| `allPages`      | Full header | Full header                                            | Multi-section exams where each page must identify the paper |
| `compactRepeat` | Full header | Single line: school name (9pt) + subject + page number | Formal board exams                                          |
| `none`          | No header   | No header                                              | Practice worksheets, internal tests                         |

### Compact Repeat Header Format

```
Saraswati Vidya Niketan · Social Science · Page 2 of 4
```

- Font: 9pt, normal weight, centered
- Single line, no borders, no exam title
- Total height: ~5mm (vs ~35mm for full header)
- Separated from content by a thin 0.25pt line + 2mm space

### Header Fields — All Controllable (Advanced Mode)

Every text element in the header is an independent block with its own slider controls:

```
┌──────────────────────────────────────────────┐
│          SARASWATI VIDYA NIKETAN              │  ← schoolName block
│    Senior Secondary · Estd. 1962 · Lucknow   │  ← tagline block
│  ─────────────────────────────────────────    │  ← decorativeLine block
│  कक्षा IX · विषय Social Science · 3 hrs · 80 │  ← examInfoRow block
│  Half-Yearly Examination · 2025-26 · Term II  │  ← examTitle block
│  ════════════════════════════════════════════  │  ← headerDivider block
└──────────────────────────────────────────────┘
```

Each block has: `fontSize`, `fontWeight`, `fontStyle`, `textTransform`, `letterSpacing`, `textAlign`, `marginTop`, `marginBottom`, `visible`.

### Header Edge Cases

**Edge case: Very long school name**
"Shri Guru Gobind Singh Senior Secondary Model School & Junior College" — this won't fit on one line at 22pt.

- At any font size, if school name exceeds content width: reduce font size by 0.5pt increments until it fits on one line, down to a floor of 10pt
- If it STILL doesn't fit at 10pt: allow two lines but tighten line-height to 1.1
- Show a yellow indicator on the school name slider: "Name wraps to 2 lines at this size"

**Edge case: Header taller than half the page**
If header (with all margins) exceeds 50% of content area height, show a red warning: "Header uses more than half the page. Consider using Compact preset."

**Edge case: Logo image aspect ratio**
If logo image is very wide (banner-style) vs very tall (shield-style), the layout must adapt:

- `maxHeight` controls height, width scales proportionally
- If scaled width > 40mm in side-by-side layout, cap at 40mm and crop/letterbox
- Logo should never overlap or push into content area

---

## 7. SPACING SYSTEM

### Spacing Categories

**Standard Mode** exposes one slider:

```
Paper Density [====●=========] 3.0mm
               Tight          Spacious
```

This one slider controls ALL spacing proportionally using the ratio system from Section 4.

**Advanced Mode** exposes individual sliders grouped by category:

```
── Question Spacing ──
Between questions     [===●======] 3.0mm
Question left indent  [====●=====] 8.0mm
MCQ option gap        [=●========] 1.5mm
MCQ option indent     [==●=======] 6.0mm
Sub-question indent   [===●======] 10.0mm
Sub-question gap      [=●========] 1.0mm

── Section Spacing ──
Between sections      [=====●====] 6.0mm
After section header  [==●=======] 2.0mm
After section instruction [==●===] 2.0mm

── Other Spacing ──
After general instructions [===●=] 3.0mm
Answer line count     [0 ─────────]
Answer line spacing   [===●======] 8.0mm (only visible when count > 0)
```

### Spacing Edge Cases

**Edge case: Zero spacing between questions**
Allowed (slider goes to 0mm). But consecutive questions with no gap are hard to read. When `betweenQuestions < 1mm`, show yellow track color and tooltip: "Very tight spacing — questions may be difficult to distinguish."

**Edge case: Large spacing exceeds page**
If `betweenSections` is set to 25mm and there are 5 sections, that's 100mm just for gaps. The page break engine handles this naturally (it just adds more pages), but show an info message if total spacing-only content exceeds one full page: "Section spacing alone adds ~1 extra page."

**Edge case: Question indent + marks position**
If `questionIndent` is 20mm and marks are right-aligned, the actual content width for question text is: `contentAreaWidth - 20mm - marksColumnWidth`. If this goes below 100mm, the text column is too narrow. Show warning: "Question text area is very narrow ({X}mm). Consider reducing indent."

**Edge case: MCQ indent stacking**
MCQ options are indented relative to question text, which is itself indented from the page margin. Total indent from page edge = `pageMarginLeft + questionIndent + mcqOptionIndent`. If this exceeds 50% of content width, options won't fit in 2-column layout. Auto-switch to single-column for that question's options and show a notification.

**Edge case: Sub-questions within sub-questions**
Some questions have nested structure: Q1 → (a) → (i), (ii), (iii). Each nesting level adds indent. Define max nesting depth of 3 with indent multiplier:

```
Level 0: questionIndent (8mm)
Level 1: questionIndent + subQuestionIndent (8 + 10 = 18mm)
Level 2: questionIndent + subQuestionIndent + subSubIndent (8 + 10 + 8 = 26mm)
```

If total indent > 60% of content width at any level, clamp and show warning.

---

## 8. TYPOGRAPHY SYSTEM

### Font Size — Global Sync (Standard Mode)

One slider controls ALL question-related text. Other elements scale proportionally:

```typescript
const FONT_SCALE_RATIOS = {
  questionText: 1.0, // base
  mcqOptions: 0.91, // slightly smaller
  sectionHeader: 1.18, // slightly larger
  instructions: 0.91, // same as MCQ
  marksLabel: 0.82, // noticeably smaller
};

// When global font size slider is at 11pt:
// questionText    = 11pt
// mcqOptions      = 10pt (11 × 0.91 = 10.01 → rounded to nearest 0.5)
// sectionHeader   = 13pt (11 × 1.18 = 12.98 → 13)
// instructions    = 10pt
// marksLabel      = 9pt  (11 × 0.82 = 9.02 → 9)
```

**Rounding:** All computed sizes round to nearest 0.5pt. Never display fractional points like 10.01pt — teachers expect clean numbers.

### Font Size — Per-Element (Advanced Mode)

Each element type gets its own slider. Once the teacher moves a per-element slider, it "detaches" from global:

- The global slider still exists but only affects non-detached elements
- Detached elements show a small "↺" reset icon that re-attaches them to global

### Font Family Stack

```css
/* Latin + Devanagari combined stack */
.pc-page {
  font-family:
    var(--font-base),
    /* "Noto Sans" for Latin */ var(--font-hindi),
    /* "Noto Sans Devanagari" for Hindi */ sans-serif; /* fallback */
}
```

Available font families (bundled via @fontsource, NOT CDN):

```
Sans-serif:
  - Noto Sans + Noto Sans Devanagari (default)
  - Inter + Noto Sans Devanagari

Serif:
  - Noto Serif + Noto Serif Devanagari
  - Tiro Devanagari (Devanagari-first, Latin fallback)

Monospace (for code/fill-in-blank lines):
  - Noto Sans Mono
```

Font picker shows a live preview of each option using the school name + a Hindi question as sample text.

### Typography Edge Cases

**Edge case: Mixed Hindi-English question**
"भारत में Green Revolution की शुरुआत कब हुई?" — Devanagari and Latin in the same sentence. The browser handles this via font fallback stack: it uses the Hindi font for Devanagari glyphs and the base font for Latin glyphs. However, vertical alignment can be off if the two fonts have different ascender/descender metrics.

- Solution: Set `line-height` in the CSS (not on the font itself). Use `1.35` minimum for mixed-script content. Test both fonts together and ensure they share similar x-height.
- If teacher sets line-height below 1.2, show warning: "Line height below 1.2 may cause Hindi text to clip or overlap."

**Edge case: Font size affects page count**
Changing question font from 11pt to 12pt can easily add 1-2 pages on a 4-page paper. After any font size change, the page count indicator must update within one frame. If page count changes, briefly flash the page count badge (pulse animation) to draw attention.

**Edge case: Font not loading / FOUT**
Fonts are bundled, but if for some reason a font fails to load:

- CSS fallback to `sans-serif` is already in the stack
- The preview should still render correctly (just in system font)
- For PDF export: embed the font file in the document. If font file is missing, block export and show error: "Font file not found. Please reinstall the application."

**Edge case: Very small font on high-DPI screen vs print**
7pt text is readable in print but may appear tiny on a 1080p screen at 100% zoom. The preview uses `transform: scale()` to fit the paper on screen — at low zoom levels, small fonts become unreadable ON SCREEN even though they'll print fine.

- Show a note when font < 8pt: "This may appear small on screen but will print at correct size."
- Offer a "Zoom to actual size" button that sets preview scale to 1:1 physical pixels

---

## 9. QUESTION BLOCK CONTROLS

### Click-to-Select System

In Advanced mode, clicking any question on the paper preview:

1. Adds a subtle blue outline (2px solid #3B82F6, 2px offset) around the question block
2. Shows a floating toolbar ABOVE the question
3. Updates the right sidebar to show per-question controls

### Floating Toolbar (Minimal)

```
┌──────────────────────────────────────────────────────────────┐
│ ↕ Space: [−] 3.0mm [+]  │  ⇥ Indent: [−] 8.0mm [+]  │  ⋯ │
└──────────────────────────────────────────────────────────────┘
```

- `[−]` and `[+]` buttons adjust by `step` amount
- `⋯` opens extended controls in the sidebar
- Toolbar follows the question when scrolling (sticky within viewport)
- Clicking outside the question deselects it
- Pressing Escape deselects

### Per-Question Override Controls (in sidebar when question selected)

```
Question 7 — Override Controls
┌───────────────────────────────────────────────┐
│  ● This question has custom overrides         │
│  [Reset all to global]                        │
│                                               │
│  Space above  [====●=====] 3.0mm  (global: 3) │
│  Space below  [====●=====] 3.0mm  (global: 3) │
│  Left indent  [====●=====] 8.0mm  (global: 8) │
│  Font size    [====●=====] 11.0pt (global: 11)│
│  Padding top  [=●========] 0.0mm              │
│  Padding btm  [=●========] 0.0mm              │
│                                               │
│  [  ] Start on new page                       │
│  [  ] Keep with next question                 │
│  Marks: [Use global ▾]                        │
└───────────────────────────────────────────────┘
```

### Question Edge Cases

**Edge case: Question text is very long (5+ lines)**
A long-answer question description can be 200+ words. No special handling needed — text wraps naturally within the content width. But if the question + its sub-parts + MCQ options together exceed one full page height:

- The page break engine splits BETWEEN sub-parts (never mid-sentence)
- A continuation indicator appears: "Q7 continued..."
- The question number is repeated on the new page: "7. (continued)"

**Edge case: Question with image**
Some questions include a diagram, map, or graph. Image placement:

- Default: below question text, centered, max-width 80% of content area
- Image max-height: 60% of content area height (one page). If image is taller, scale down proportionally
- If image + question text don't fit on current page, move ENTIRE question (text + image) to next page
- For PDF: embed image at original resolution (up to 300 DPI). For DOCX: embed as inline image
- If image file is missing/corrupt: show placeholder "⚠ Image not found" in preview and export

**Edge case: "OR" question layout**
Some exams have "OR" between two questions (student answers either one):

```
7.  Explain the causes of French Revolution.                [5]

                              OR

7.  Discuss the impact of Industrial Revolution on Europe.  [5]
```

- "OR" text: centered, bold or italic, with thin lines on each side: `── OR ──`
- Spacing above and below "OR": `2mm`
- BOTH questions (original + alternate) must be on the same page if possible
- If they don't fit together, the "OR" divider and alternate question go to the next page (never split with "OR" orphaned at page bottom)

**Edge case: Fill-in-the-blank with answer line**
"भारत में खारे पानी की सबसे बड़ी झील \_\_\_ झील है।" — the blank should be a consistent length.

- Blank line: rendered as `border-bottom: 0.5pt solid black`, width `30mm` fixed (not stretching to fill available space)
- If multiple blanks in one question, each is 30mm
- Blank line vertical alignment: baseline of surrounding text

**Edge case: Question with table**
Some questions include a data table (economics, geography). Tables need:

- Column widths that respect content area width minus indent
- Cell padding: use global MCQ option gap as reference
- Borders: thin solid (0.5pt)
- Table never splits across pages — if it doesn't fit, move entire question to next page
- If table alone exceeds content area height, allow it to split but show warning

**Edge case: Assertion-Reason questions**

```
8.  Assertion (A): The Earth revolves around the Sun.
    Reason (R): Gravitational force keeps Earth in orbit.

    (a) Both A and R are correct, R explains A
    (b) Both A and R are correct, R does not explain A
    (c) A is correct but R is incorrect
    (d) A is incorrect but R is correct
```

These have longer option text than typical MCQs. Auto-detect when option text length > 50 chars and switch from 2-column to single-column layout for that question's options.

**Edge case: Map-based questions**
Geography papers often have a map with numbered locations. The map image should:

- Not be compressed below 200 DPI for print legibility
- Respect aspect ratio always
- Have a border: 0.5pt solid #ccc
- Caption below: "Map not to scale" in 8pt italic

---

## 10. SECTION CONTROLS

### Per-Section Controls (Advanced Mode)

Click a section header on the paper to open section controls:

```
Section A — Settings
┌───────────────────────────────────────────────┐
│  Title        [खंड A _______________]         │
│  Subtitle     [अनिवार्य ____________]         │
│  Instruction  [सभी प्रश्न अनिवार्य हैं________]│
│                                               │
│  ── Spacing (overrides global) ──             │
│  Space above    [=====●====] 6.0mm            │
│  After header   [==●=======] 2.0mm            │
│  Between questions [===●====] 3.0mm           │
│  [  ] Use global spacing (ignore above)       │
│                                               │
│  ── Layout ──                                 │
│  Columns    (●) 1  ( ) 2                      │
│  [  ] Start on new page                       │
│                                               │
│  ── Continuation ──                           │
│  [✓] Show continuation header on page breaks  │
│  Text  [SECTION A (continued) ________]       │
│  Size  [==●=======] 8pt                       │
│  Color [#888888]                              │
│                                               │
│  ── Divider ──                                │
│  Above section: [Use global ▾]                │
│  [Reset section to defaults]                  │
└───────────────────────────────────────────────┘
```

### Section Edge Cases

**Edge case: Section with only 1 question**
Valid scenario (e.g., "Section D — Map Work" with one 5-mark question). Section header + one question should be treated as an atomic unit — never split across pages.

**Edge case: Section with "Attempt any N of M" instruction**
The instruction "Attempt any 3 of the following 5 questions" must be visually distinct from the section title. Render it as italic text, slightly smaller font, below the section header.

**Edge case: 2-column section with uneven question count**
If section has 5 questions in 2-column layout: first column gets Q1-Q3, second gets Q4-Q5 with empty space below Q5. This is handled by `column-count: 2` + `break-inside: avoid` on each question block.

**Edge case: 2-column with one very long question**
If one question is much longer than others (e.g., a long passage-based question), it gets `column-span: all` and renders full-width. Detection: question height > 1.5× average question height in that section.

**Edge case: Empty section**
If a section has 0 questions (teacher removed them all during editing), hide the section entirely from output. Don't show an empty section header.

**Edge case: Section title in different language than questions**
Section title "Section A" but questions in Hindi, or "खंड A" but questions in English. No special handling needed — font fallback stack handles this. But section title font should follow the same font family as the rest.

---

## 11. DIVIDER SYSTEM

### Standard Mode

```
Section Dividers  [On ▾]  — dropdown: On / Off / Subtle
```

- **On:** 0.5pt solid black, 100% width, 3mm spacing above/below
- **Off:** No dividers anywhere, just spacing
- **Subtle:** 0.25pt solid #cccccc, 60% width, 2mm spacing

### Advanced Mode

Per-location divider controls:

```
── Dividers ──
After header:      [Solid ▾] [===●==] 1.0pt  [===●====] 100%
Between sections:  [Solid ▾] [=●====] 0.5pt  [====●===] 80%
Before footer:     [None  ▾]

Color: [■ #000000]
```

Style options: `solid`, `dashed`, `dotted`, `double`, `none`

### Divider Edge Cases

**Edge case: Divider at page break**
If a section divider would fall at the exact page break position:

- Move it to the top of the next page (above the first question on that page)
- Or hide it entirely if a continuation header is shown (the continuation header serves as the visual break)

**Edge case: Ornamental divider rendering**
The `ornamental` style (decorative center element) is SVG-based. In PDF export, convert SVG to embedded path data. In DOCX export, fall back to `double` style (DOCX doesn't support custom SVG borders).

---

## 12. MARKS DISPLAY

### Standard Mode

```
Marks Style:  [ [5] ]  [ (5) ]  [ 5 m ]  [ Off ]
```

One toggle group, that's it.

### Advanced Mode

```
── Marks ──
Style:     [ [5] ]  [ (5) ]  [ 5 marks ]  [ Off ]
Position:  (●) Same line, right-aligned
           ( ) Fixed right column (all marks vertically aligned)
           ( ) After question text (inline)
Font size: [==●=======] 9.0pt
Bold:      [  ]
Show section totals:   [✓]
Show question count:   [✓]
```

### Marks Edge Cases

**Edge case: Marks alignment with multi-line questions**
For right-aligned marks on a multi-line question, marks should align with the FIRST line of the question, not the last:

```css
.pc-question-row {
  display: flex;
  align-items: flex-start; /* NOT center, NOT flex-end */
}
```

**Edge case: "Fixed right column" mode**
All marks across the entire paper align vertically in a fixed column. This requires reserving a fixed width on the right side of the content area:

```css
.pc-marks-column-mode .pc-question-text {
  width: calc(100% - var(--marks-column-width));
}
.pc-marks-column-mode .pc-question-marks {
  width: var(--marks-column-width); /* e.g., 12mm */
  text-align: right;
  flex-shrink: 0;
}
```

**Edge case: Half marks**
Some questions have 0.5 mark (½ mark per sub-part). Display as `[½]` or `[0.5]` — use `½` unicode character for cleaner look.

**Edge case: Marks don't add up**
If section total marks shown (e.g., "18 marks") doesn't match the sum of individual question marks, show a yellow warning icon next to the section total in the editor. Don't block anything — teachers might have a reason (bonus questions, optional questions).

---

## 13. FOOTER & PAGE NUMBERS

### Standard Mode

```
Page Numbers:  [✓] Show    Position: [Center ▾]
```

### Advanced Mode

```
── Footer ──
[✓] Show page numbers
Format:   [Page X of Y ▾]   — options: "Page 1 of 4" / "1" / "- 1 -" / "1/4"
Position: [Center ▾]        — options: Center / Right / Left
Size:     [==●======] 8pt

[✓] Show on first page
Custom text: [This paper contains 4 printed pages]
Custom text position: [Center ▾]
```

### Footer Edge Cases

**Edge case: Page count in footer vs actual pages**
"This paper contains 4 printed pages" — this text must be accurate. Use a two-pass approach:

1. First pass: render all content without footer text, count pages
2. Second pass: inject the accurate page count into footer text, re-render
3. If adding the footer text changes the page count (extremely rare — only if content is exactly at the page break boundary), do a third pass

**Edge case: Footer overlaps content**
If the last question on a page extends too close to the bottom margin, the footer may overlap. Solution: the page break engine reserves `footerHeight + 2mm` at the bottom of every page. This reserved space is subtracted from the content area height.

---

## 14. EDGE CASES — COMPLETE CATALOG

These edge cases affect the OVERALL system and span multiple features.

### 14.1 Empty Paper

Teacher enters Format mode with 0 questions. Show: header + general instructions + empty sections with "No questions in this section" placeholder. All formatting controls still work (they're previewing how the paper WILL look). Page count: 1.

### 14.2 Single Question Paper

Valid scenario: a quick quiz with 1 question. Should render on 1 page with header + 1 question. No section dividers (only one section). Page count: 1.

### 14.3 Very Large Paper (100+ questions)

Performance concern. The preview must not lag.

- Virtualize the paper preview: only render pages visible in the viewport + 1 page above/below (buffer)
- Use `content-visibility: auto` on each page container for off-screen pages
- Question blocks are `React.memo` with stable keys
- When scrolling through 20+ pages, show a mini-map / page thumbnail strip on the right edge

### 14.4 Mixed Question Types in One Section

A section with MCQs, fill-in-blanks, short answers, and one long answer. Each question type has different height characteristics:

- MCQ (4 options, 2-col): ~25mm height
- Fill-in-blank: ~10mm height
- Short answer (2 marks): ~12mm height
- Long answer (5 marks): ~15mm height (question text only, no answer space)

The spacing between all of these is uniform (global `betweenQuestions`). No special per-type spacing unless teacher sets per-question overrides.

### 14.5 RTL Text (Urdu Medium)

Some Indian schools use Urdu medium. If the base font or content is RTL:

- Flip `padding-left` ↔ `padding-right` for question indent
- Marks appear on the LEFT side (still "end" of reading direction)
- Numbering uses the same position but text flows right-to-left
- Page margins: `left` and `right` semantically become `start` and `end`
- Use `direction: rtl` on `.pc-page` and `text-align: start` (not `left`)

### 14.6 Math Equations / Formulas

For science and math papers, questions may contain LaTeX/MathML equations. These are rendered as inline images or SVG:

- Equations scale with font size (match surrounding text's x-height)
- In PDF: embed as vector SVG (crisp at any zoom)
- In DOCX: embed as images at 300 DPI or use OMML (Office Math Markup)
- If equation rendering fails, show the raw LaTeX source as monospace text

### 14.7 Bilingual Papers (Hindi + English on same paper)

Some papers print each question in both languages:

```
1. Explain the importance of the Green Revolution in Indian agriculture. [5]
   भारतीय कृषि में हरित क्रांति के महत्व की व्याख्या कीजिए।
```

The Hindi translation is indented slightly more than the English text, in italic, with 1mm gap between the two versions. Both use the same marks label (not duplicated). Line height must accommodate both scripts.

### 14.8 Watermark

Some schools want a faint "DRAFT" or "CONFIDENTIAL" watermark. Watermark requirements:

- Rendered as a rotated (-45°), semi-transparent (opacity 0.06) text overlay
- Positioned center of each page
- Font size: auto-calculated to span ~70% of page diagonal
- Does NOT affect content layout (absolutely positioned, pointer-events: none)
- Prints in PDF (as a separate layer)
- In DOCX: use the native watermark feature (`docx` library supports this)

### 14.9 Multiple Papers from Same Template

Exam coordinators create "Set A" and "Set B" papers with different question orders. The formatting config should be shareable across sets — formatting is about the template, not the content.

- Allow "Save as format template" — saves PaperFormatConfig as a named template
- "Apply template" — loads a saved config onto any paper
- Templates don't store content (questions, school name, etc.) — only layout values

### 14.10 Browser Print Dialog Mismatch

The browser's Ctrl+P dialog has its own margin settings. If the user sets margins in the browser dialog AND the editor, they conflict.

- In print CSS, set `@page { margin: 0 }` — we handle ALL margins via padding
- Add a print instruction overlay (visible only in print preview): "Set browser margins to 'None' for correct output"

### 14.11 Color Printing vs Black-and-White

Most school papers are photocopied in B&W. All formatting defaults must look good in pure black-and-white:

- No color-dependent styling (no red marks, no colored headers)
- Dividers: always black or grey
- Section headers: bold weight, not color, for emphasis
- If teacher uploads a color logo, show note: "This logo may not print clearly on black-and-white copiers"

### 14.12 Accessibility

While the primary output is print, the editor itself must be accessible:

- All sliders have ARIA labels
- Keyboard navigation works for all controls
- Focus indicators visible
- Screen reader announces: "Question font size slider, 11 points, range 7 to 18 points"
- Color contrast of UI controls meets WCAG AA

### 14.13 Config Versioning / Migration

As you add new config fields in future updates, existing saved papers have old configs. Every config must have a `version` field:

```typescript
interface PaperFormatConfig {
  version: number; // starts at 1, increment when schema changes
  // ... rest of config
}

function migrateConfig(config: any): PaperFormatConfig {
  if (config.version === 1) {
    // Add new fields with defaults
    config.continuation = config.continuation ?? DEFAULT_CONTINUATION;
    config.version = 2;
  }
  if (config.version === 2) {
    // Next migration...
    config.version = 3;
  }
  return config as PaperFormatConfig;
}
```

Run migration on every config load, before any rendering.

### 14.14 Extreme Combinations

Teacher sets: font 7pt + margins 5mm + spacing 0mm + compact header + 2 columns + 100 questions. Result: maximally dense paper. The system must:

- Not crash or produce overlapping elements
- Correctly calculate page breaks (even if a page fits 40+ questions)
- Produce a valid PDF (even if it's hard to read)
- Show a summary warning: "Current settings produce very dense output. Consider reviewing readability before printing."

### 14.15 Question Numbering Across Sections

Two numbering modes:

- **Restart per section:** Section A: 1,2,3,4,5. Section B: 1,2,3,4,5. (Common in CBSE)
- **Continue across sections:** Section A: 1,2,3,4,5. Section B: 6,7,8,9,10. (Common in state boards)

When switching modes, renumber all questions immediately in the preview. If teacher has manually overridden a question's number, show warning: "Switching numbering mode will override manual question numbers."

### 14.16 Last Question Alone on Last Page

If the last question of the paper is the only content on the last page (e.g., Q22 alone on page 5), and pages 1-4 are full:

- Do NOT auto-merge — the teacher might intend this (leaving answer space)
- But show a subtle suggestion: "Last page has only 1 question. You could save a page by reducing spacing." with a "Smart fit" button

### 14.17 Sections with Internal Instructions

Some sections have specific instructions between groups of questions:

```
Section B — Short Answer
Answer any 5 of the following 7 questions.

Q7. ...
Q8. ...
Q9. ...

Note: Questions 10-13 are based on the passage below.
[Passage text...]

Q10. ...
Q11. ...
Q12. ...
Q13. ...
```

The mid-section instruction ("Note: Questions 10-13...") is a block that:

- Inherits instruction styling (italic, slightly smaller font)
- Has its own spacing (uses `afterInstructions` value)
- Never splits across pages — moves entirely to next page if needed
- Is visually distinct from questions (different left indent, no numbering)

---

## 15. PAGE BREAK ENGINE

### Algorithm

```typescript
interface BlockMeasurement {
  id: string;
  type:
    | "header"
    | "instruction"
    | "sectionHeader"
    | "question"
    | "divider"
    | "footer"
    | "midInstruction";
  height: number; // mm, measured from DOM
  marginTop: number; // mm
  marginBottom: number; // mm
  keepWithNext: boolean; // true for section headers, "OR" questions, etc.
  keepWithPrev: boolean; // true for MCQ options block, continuation of a question
  canSplit: boolean; // true only for very long questions with multiple sub-parts
  splitPoints: number[]; // positions (in mm from block top) where splitting is allowed
  sectionId: string;
  questionId?: string;
}

function calculatePageBreaks(
  blocks: BlockMeasurement[],
  contentHeight: number, // page content area height (page height - margins - footer)
  footerHeight: number, // reserved for footer
): PageBreak[] {
  const pageBreaks: PageBreak[] = [];
  let currentY = 0;
  let currentPageBlocks: string[] = [];
  const availableHeight = contentHeight - footerHeight;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const blockTotal = block.marginTop + block.height + block.marginBottom;

    // Will this block fit on the current page?
    if (currentY + blockTotal <= availableHeight) {
      currentY += blockTotal;
      currentPageBlocks.push(block.id);
      continue;
    }

    // Block doesn't fit. Can we split it?
    if (block.canSplit && block.splitPoints.length > 0) {
      const remainingSpace = availableHeight - currentY;
      const splitPoint = findBestSplitPoint(block, remainingSpace);
      if (splitPoint) {
        // Split the block
        pageBreaks.push({ afterBlockId: block.id, splitAt: splitPoint });
        currentY = blockTotal - splitPoint; // Remaining part on new page
        currentPageBlocks = [block.id];
        continue;
      }
    }

    // Can't split. Move entire block to next page.
    // But first: does this block have keepWithPrev? If so, move the previous block too.
    if (block.keepWithPrev && currentPageBlocks.length > 0) {
      const prevBlock = blocks[i - 1];
      // Move prevBlock + current block to next page
      pageBreaks.push({
        afterBlockId:
          currentPageBlocks[currentPageBlocks.length - 2] || "__page_start__",
      });
      currentY =
        prevBlock.marginTop +
        prevBlock.height +
        prevBlock.marginBottom +
        blockTotal;
      currentPageBlocks = [prevBlock.id, block.id];
    } else {
      // Normal page break before this block
      pageBreaks.push({
        afterBlockId:
          currentPageBlocks[currentPageBlocks.length - 1] || "__page_start__",
      });
      currentY = blockTotal;
      currentPageBlocks = [block.id];
    }

    // Check keepWithNext chain
    if (block.keepWithNext && i + 1 < blocks.length) {
      // Don't allow a page break between this block and the next
      // This is handled in the next iteration via keepWithPrev
      blocks[i + 1].keepWithPrev = true;
    }
  }

  return pageBreaks;
}
```

### Keep-Together Rules

| Block Type                 | keepWithNext            | keepWithPrev              | canSplit | Notes                                        |
| -------------------------- | ----------------------- | ------------------------- | -------- | -------------------------------------------- |
| Section header             | ✓ (with first question) | ✗                         | ✗        | Never orphan a section header at page bottom |
| Section instruction        | ✓ (with first question) | ✓ (with header)           | ✗        |                                              |
| Question (short, ≤3 lines) | ✗                       | ✗                         | ✗        | Atomic — never split                         |
| Question (long, >3 lines)  | ✗                       | ✗                         | ✓        | Split between sub-parts only                 |
| MCQ options block          | ✗                       | ✓ (with question text)    | ✗        | Options stay with their question             |
| "OR" divider               | ✓ (with alt question)   | ✓ (with primary question) | ✗        | Both questions + OR = one unit               |
| Mid-section instruction    | ✓ (with next question)  | ✗                         | ✗        |                                              |
| Image block                | ✗                       | ✓ (with question text)    | ✗        | Image stays with its question                |
| Divider                    | ✗                       | ✗                         | ✗        | If divider is at break point, omit it        |

### Page Break Measurement

Measure block heights using the DOM (not estimation). After every config change:

1. React re-renders the preview with new CSS custom properties
2. Use `ResizeObserver` to capture each block's `offsetHeight`
3. Convert px to mm using the known scale factor: `1mm = 3.7795275591px` at 96 DPI
4. Run the page break algorithm
5. Insert visual page break indicators (dashed line + "Page N" label) between blocks
6. Update page count badge

### Performance: Don't Re-measure Everything

After a slider change, only blocks whose CSS depends on the changed property need re-measuring:

- Font size change → re-measure all text blocks
- Spacing change → no re-measure needed (spacing is margin, not content height), just re-run the page break algorithm with updated margins
- Page margin change → re-run page breaks with new content area height
- Question indent change → re-measure all questions (width change affects text wrap, which affects height)

Maintain a `dirtiness` map: `Record<string, boolean>` for each block. Only re-measure dirty blocks.

---

## 16. OVERFLOW HANDLING

### Horizontal Overflow

**Cause:** Question text, MCQ options, or table content wider than content area.
**Detection:** After rendering, check if any element has `scrollWidth > clientWidth`.
**Response:**

1. For text: `word-wrap: break-word; overflow-wrap: break-word; hyphens: auto` — break long words
2. For tables: `table-layout: fixed; width: 100%` — constrain columns
3. For images: `max-width: 100%; height: auto`
4. For MCQ options in 2-column: if option text overflows, auto-switch to 1-column for that question
5. Show a warning icon on any question with detected overflow: "⚠ Content may be cut off in print"

### Vertical Overflow

**Cause:** A single question block taller than the full content area height (e.g., a passage-based question with a 200-word passage + 5 sub-questions).
**Detection:** Block height > content area height.
**Response:**

1. If `canSplit`: split at the best split point within the block
2. If `!canSplit` (e.g., a single very long question with no sub-parts):
   - Allow it to span two pages (it will be cut by the page break)
   - Show warning: "Question {N} is taller than one page. It will be split across pages."
   - In the split, ensure no text is cut mid-line: break at the nearest line boundary

### Font Scaling Overflow

When font size is very large (18pt) + content area is very narrow (margins 35mm on each side):

- Lines may contain only 3-4 words, causing excessive line breaks
- Calculate: `contentWidth / averageCharWidth < 25` → show warning: "Content area is too narrow for this font size."

---

## 17. PRINT & PDF RENDERING

### Browser Print (Primary — react-to-print)

```typescript
import { useReactToPrint } from "react-to-print";

// The print target is the paper preview container with ALL CSS custom properties applied
const handlePrint = useReactToPrint({
  contentRef: paperPreviewRef,
  pageStyle: `
    @page {
      size: ${config.pageSize} ${config.pageOrientation};
      margin: 0;
    }
    @media print {
      body { margin: 0; padding: 0; }
      .pc-editor-ui { display: none !important; } /* Hide all editor controls */
      .pc-page { 
        break-after: page;
        box-shadow: none;
        border: none;
      }
      .pc-page-break-indicator { display: none; }
      .pc-block-selection { outline: none !important; }
      .pc-floating-toolbar { display: none !important; }
    }
  `,
});
```

### PDF Export (Puppeteer — Server-Side)

For server-generated PDFs:

1. Send the HTML + CSS of the paper preview to the server
2. Server renders in headless Chromium: `await page.pdf({ format: 'A4', margin: { top: 0, bottom: 0, left: 0, right: 0 } })`
3. Return the PDF blob to the client for download

**Why server-side:** Browser print dialog is inconsistent across browsers. Puppeteer gives pixel-perfect PDF output that exactly matches the preview.

**Fallback:** If server is unavailable, fall back to `react-to-print` (browser dialog).

### Print CSS Rules

```css
@media print {
  /* Remove all editor chrome */
  .pc-sidebar,
  .pc-toolbar,
  .pc-floating-toolbar,
  .pc-block-selection,
  .pc-page-break-indicator,
  .pc-spacing-guide,
  .pc-margin-guide {
    display: none !important;
  }

  /* Each page is a separate element */
  .pc-page {
    break-after: page;
    box-shadow: none;
    border: none;
    background: white;
  }

  /* Prevent accidental breaks inside atomic blocks */
  .pc-question {
    break-inside: avoid;
  }
  .pc-section-header {
    break-inside: avoid;
    break-after: avoid;
  }
  .pc-mcq-options {
    break-inside: avoid;
  }
  .pc-or-group {
    break-inside: avoid;
  }

  /* Footer positioning */
  .pc-footer {
    position: fixed;
    bottom: var(--page-margin-bottom);
    left: var(--page-margin-left);
    right: var(--page-margin-right);
  }

  /* Ensure fonts embed */
  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
```

### Print Edge Cases

**Edge case: Background colors in print**
Browsers don't print background colors by default. If section headers have background tint:

- Use `print-color-adjust: exact` (Chromium) / `-webkit-print-color-adjust: exact` (Safari)
- Fallback: use borders instead of backgrounds for section emphasis in print

**Edge case: Links in print**
Questions may contain URLs. In print, add URL after link text: `Green Revolution (https://example.com)` — or better, remove links entirely since they're not clickable on paper.

**Edge case: Print preview differs from screen preview**
If the scale factor is not exactly right, line breaks may differ between screen and print, causing content to shift.

- Use `mm` and `pt` units everywhere (not `px`, `em`, or `rem`) — these are absolute and identical in print
- The preview container must be exactly `210mm × 297mm` (for A4), scaled to fit the viewport using `transform: scale()` — NOT by changing the container's width/height

---

## 18. DOCX EXPORT

### Library: `docx` (npm)

```bash
npm install docx file-saver
```

### Architecture

```typescript
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  convertMillimetersToTwip as mm2twip,
} from "docx";
import { saveAs } from "file-saver";
```

### Conversion Table (CSS → DOCX)

| CSS                         | DOCX                              | Formula            |
| --------------------------- | --------------------------------- | ------------------ |
| `Xmm` (margin/spacing)      | Twips                             | `mm2twip(X)`       |
| `Xpt` (font size)           | Half-points                       | `X * 2`            |
| `line-height: X`            | Line spacing (240ths of line)     | `X * 240`          |
| `letter-spacing: Xpx`       | Character spacing (20ths of pt)   | `X * 20`           |
| `border: Xpt solid`         | Border size (8ths of pt)          | `X * 8`            |
| `font-weight: bold`         | `bold: true`                      | —                  |
| `font-style: italic`        | `italics: true`                   | —                  |
| `text-transform: uppercase` | `allCaps: true`                   | —                  |
| `text-align: center`        | `alignment: AlignmentType.CENTER` | —                  |
| `color: #RRGGBB`            | `color: "RRGGBB"` (no #)          | `.replace('#','')` |

### DOCX Generation Function

```typescript
async function exportToDocx(
  paper: Paper,
  config: PaperFormatConfig,
): Promise<void> {
  const { pageSize, pageOrientation, pageMargins } = config;
  const dims = PAGE_SIZES[pageSize];
  const w = pageOrientation === "portrait" ? dims.width : dims.height;
  const h = pageOrientation === "portrait" ? dims.height : dims.width;

  const children: (Paragraph | Table)[] = [];

  // --- Header ---
  if (config.header.repeatMode !== "none") {
    // School name
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: mm2twip(config.header.schoolName.marginBottom) },
        children: [
          new TextRun({
            text: config.header.schoolName.text,
            bold: config.header.schoolName.fontWeight === "bold",
            size: config.header.schoolName.fontSize * 2,
            characterSpacing: config.header.schoolName.letterSpacing * 20,
            allCaps: config.header.schoolName.textTransform === "uppercase",
          }),
        ],
      }),
    );

    // Tagline
    if (config.header.tagline.visible) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: mm2twip(config.header.tagline.marginBottom) },
          children: [
            new TextRun({
              text: config.header.tagline.text,
              size: config.header.tagline.fontSize * 2,
              italics: config.header.tagline.fontStyle === "italic",
            }),
          ],
        }),
      );
    }

    // Exam info row (as table)
    children.push(buildExamInfoTable(config));

    // Exam title
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: {
          before: mm2twip(config.header.examTitle.marginTop || 0),
          after: mm2twip(config.header.examTitle.marginBottom),
        },
        children: [
          new TextRun({
            text: config.header.examTitle.text,
            size: config.header.examTitle.fontSize * 2,
            bold: config.header.examTitle.fontWeight === "bold",
            italics: config.header.examTitle.fontStyle === "italic",
          }),
        ],
      }),
    );

    // Divider after header
    if (config.header.dividerAfterHeader.style !== "none") {
      children.push(
        new Paragraph({
          spacing: {
            after: mm2twip(config.header.dividerAfterHeader.marginBottom),
          },
          border: {
            bottom: {
              style: mapBorderStyle(config.header.dividerAfterHeader.style),
              size: config.header.dividerAfterHeader.weight * 8,
              color: config.header.dividerAfterHeader.color.replace("#", ""),
            },
          },
          children: [],
        }),
      );
    }
  }

  // --- General Instructions ---
  if (paper.generalInstructions?.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: mm2twip(2) },
        children: [
          new TextRun({
            text: "सामान्य निर्देश",
            bold: true,
            size: config.typography.instructionsFontSize * 2,
          }),
        ],
      }),
    );
    for (const instruction of paper.generalInstructions) {
      children.push(
        new Paragraph({
          spacing: { after: mm2twip(1) },
          indent: { left: mm2twip(config.spacing.questionIndent) },
          children: [
            new TextRun({
              text: instruction,
              size: config.typography.instructionsFontSize * 2,
              italics: true,
            }),
          ],
        }),
      );
    }
    children.push(
      new Paragraph({
        spacing: { after: mm2twip(config.spacing.afterInstructions) },
        children: [],
      }),
    );
  }

  // --- Sections ---
  for (const section of paper.sections) {
    const sectionOverride = config.sectionOverrides[section.id] || {};
    const qSpacing =
      sectionOverride.questionSpacing ?? config.spacing.betweenQuestions;

    // Section divider
    children.push(
      new Paragraph({
        spacing: {
          before: mm2twip(
            sectionOverride.spacingAbove ?? config.spacing.betweenSections,
          ),
        },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
        },
        children: [],
      }),
    );

    // Section header
    children.push(
      new Paragraph({
        spacing: {
          after: mm2twip(
            sectionOverride.spacingAfterHeader ??
              config.spacing.afterSectionHeader,
          ),
        },
        children: [
          new TextRun({
            text: section.title,
            bold: true,
            size: config.typography.sectionHeaderFontSize * 2,
          }),
          new TextRun({
            text: section.subtitle ? ` · ${section.subtitle}` : "",
            italics: true,
            size: config.typography.sectionHeaderFontSize * 2,
          }),
        ],
      }),
    );

    // Section instruction
    if (section.instruction) {
      children.push(
        new Paragraph({
          spacing: { after: mm2twip(2) },
          children: [
            new TextRun({
              text: section.instruction,
              italics: true,
              size: config.typography.instructionsFontSize * 2,
            }),
          ],
        }),
      );
    }

    // Questions
    for (const question of section.questions) {
      const qOverride = config.questionOverrides[question.id] || {};
      const indent = qOverride.indent ?? config.spacing.questionIndent;
      const fontSize = qOverride.fontSize ?? config.typography.questionFontSize;

      // Question text + marks
      const qChildren: TextRun[] = [
        new TextRun({
          text: `${question.number}.  `,
          bold: true,
          size: fontSize * 2,
        }),
        new TextRun({
          text: question.text,
          bold: config.typography.questionFontWeight === "bold",
          size: fontSize * 2,
        }),
      ];

      if (
        config.marks.style !== "hidden" &&
        config.marks.position === "inline"
      ) {
        const marksText = formatMarks(question.marks, config.marks.style);
        qChildren.push(
          new TextRun({
            text: `  ${marksText}`,
            size: config.typography.marksFontSize * 2,
          }),
        );
      }

      // For right-aligned marks: use a tab stop at the right margin
      const tabStops =
        config.marks.position === "rightAligned"
          ? [
              {
                type: "right" as const,
                position: mm2twip(w - pageMargins.left - pageMargins.right),
              },
            ]
          : undefined;

      const qParagraph = new Paragraph({
        spacing: {
          before: mm2twip(qOverride.marginTop ?? qSpacing),
          after: mm2twip(qOverride.marginBottom ?? 0),
          line: config.typography.lineHeight * 240,
        },
        indent: { left: mm2twip(indent) },
        tabStops,
        children:
          config.marks.position === "rightAligned"
            ? [
                ...qChildren,
                new TextRun({ text: "\t" }),
                new TextRun({
                  text: formatMarks(question.marks, config.marks.style),
                  size: config.typography.marksFontSize * 2,
                }),
              ]
            : qChildren,
      });
      children.push(qParagraph);

      // MCQ options (as invisible table)
      if (question.options?.length) {
        children.push(buildMcqTable(question.options, config, indent));
      }

      // Sub-questions
      if (question.subQuestions?.length) {
        for (const sub of question.subQuestions) {
          children.push(
            new Paragraph({
              spacing: {
                before: mm2twip(config.spacing.mcqOptionGap),
                line: config.typography.lineHeight * 240,
              },
              indent: {
                left: mm2twip(
                  indent + (config.spacing.subQuestionIndent ?? 10),
                ),
              },
              children: [
                new TextRun({ text: `${sub.label} `, size: fontSize * 2 }),
                new TextRun({ text: sub.text, size: fontSize * 2 }),
              ],
            }),
          );
        }
      }
    }
  }

  // --- Build document ---
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: mm2twip(w), height: mm2twip(h) },
            margin: {
              top: mm2twip(pageMargins.top),
              bottom: mm2twip(pageMargins.bottom),
              left: mm2twip(pageMargins.left),
              right: mm2twip(pageMargins.right),
            },
          },
        },
        headers:
          config.header.repeatMode === "compactRepeat"
            ? {
                default: new Header({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: `${config.header.schoolName.text} · ${config.header.examInfoRow.fields.subject.value} · Page `,
                          size: 18,
                        }),
                        new TextRun({
                          children: [PageNumber.CURRENT],
                          size: 18,
                        }),
                        new TextRun({ text: " of ", size: 18 }),
                        new TextRun({
                          children: [PageNumber.TOTAL_PAGES],
                          size: 18,
                        }),
                      ],
                    }),
                  ],
                }),
              }
            : undefined,
        footers: config.footer.showPageNumbers
          ? {
              default: new Footer({
                children: [
                  new Paragraph({
                    alignment: mapAlignment(config.footer.pageNumberPosition),
                    children: buildFooterContent(config),
                  }),
                ],
              }),
            }
          : undefined,
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${paper.title || "Question Paper"}.docx`);
}
```

### DOCX Edge Cases

**Edge case: Hindi text in DOCX**
The `docx` library handles Unicode natively. But font embedding is critical:

- Specify `font` property on every `TextRun` that contains Hindi text: `font: { name: "Noto Sans Devanagari" }`
- If the recipient doesn't have the font installed, Word falls back to its own Devanagari font (Mangal). This may cause minor layout differences.

**Edge case: Images in DOCX**

```typescript
import { ImageRun } from "docx";
// Read image as ArrayBuffer, include dimensions
new ImageRun({
  data: imageBuffer,
  transformation: { width: widthPx, height: heightPx },
});
```

**Edge case: Very large DOCX (100+ questions, many images)**
Run `Packer.toBlob()` in a Web Worker to avoid blocking the UI:

```typescript
// In main thread:
const worker = new Worker(new URL("./docxWorker.ts", import.meta.url), {
  type: "module",
});
worker.postMessage({ paper, config });
worker.onmessage = (e) => saveAs(e.data.blob, `${paper.title}.docx`);
```

---

## 19. RESET & UNDO SYSTEM

### Reset Levels

| Action              | Scope                                                         | Confirmation Required                                                                                    |
| ------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Reset this question | Clears one question's overrides                               | No — just clears, shows toast "Q7 reset to global" with undo                                             |
| Reset this section  | Clears one section's overrides + all its questions' overrides | Yes — "Reset Section A formatting? This will clear 4 custom overrides."                                  |
| Reset spacing       | Resets all spacing to defaults                                | Yes                                                                                                      |
| Reset typography    | Resets all font settings to defaults                          | Yes                                                                                                      |
| Reset header        | Resets header to Standard preset                              | Yes                                                                                                      |
| Reset everything    | Full config reset to defaults                                 | Yes — "Reset ALL formatting to defaults? This cannot be undone (but you can re-apply a saved template)." |

### Undo System

Every config change is pushed to an undo stack:

```typescript
interface UndoEntry {
  timestamp: number;
  description: string; // "Changed question spacing to 4mm"
  previousConfig: PaperFormatConfig; // Full snapshot (simple but memory-heavy)
}

// Store last 50 undo entries
const MAX_UNDO = 50;
```

- `Ctrl+Z` / `Cmd+Z` — undo last change
- `Ctrl+Shift+Z` / `Cmd+Shift+Z` — redo
- Undo/redo buttons in the toolbar (next to "Save draft")
- Slider drags are debounced into a single undo entry (one undo for the entire drag, not per-pixel)

### Optimization: Delta Storage

Full config snapshots are wasteful. Use JSON patches instead:

```typescript
import { compare, applyPatch } from "fast-json-patch";

// On change:
const patch = compare(previousConfig, newConfig);
undoStack.push({ patch, description });

// On undo:
const reversePatch = compare(newConfig, previousConfig);
applyPatch(config, reversePatch);
```

---

## 20. INSTITUTIONAL PRESET LOCKING

### Use Case

A school administrator creates a format template: "Our school's exam papers must use these exact settings." Teachers can use this template but should be warned if they deviate.

### Implementation

```typescript
interface InstitutionalPreset {
  id: string;
  name: string; // "SVN Official Format"
  config: PaperFormatConfig; // The locked config values
  lockedFields: string[]; // Dot-paths of fields that cannot be changed
  // e.g., ["header.schoolName.text", "header.schoolName.fontSize", "pageMargins"]
  createdBy: string; // Admin user ID
  enforceMode: "strict" | "warn"; // Strict = can't change locked fields. Warn = can change but shows warning.
}
```

### Strict Mode Behavior

- Locked fields: slider is disabled (greyed out), shows lock icon + tooltip: "This setting is locked by your school's format template."
- Unlocked fields: fully editable
- Teacher can still use advanced mode for unlocked fields

### Warn Mode Behavior

- All fields editable
- If teacher changes a locked field, show: "⚠ This differs from your school's official format ({preset.name}). The original value is {X}. [Revert]"
- On export, if any locked fields have been changed: "This paper deviates from the school format in {N} places. Export anyway? [Review Changes] [Export]"
- The "Review Changes" dialog shows a diff of changed vs locked values

### Applying Institutional Preset

```
Format Templates
┌───────────────────────────────────────────┐
│  [SVN Official Format] ← Applied ✓       │
│  [CBSE Standard]                          │
│  [Compact Test]                           │
│  [+ Save current as template]             │
│                                           │
│  [Reset to template defaults]             │
└───────────────────────────────────────────┘
```

---

## 21. RESPONSIVE EDITOR BEHAVIOR

### The editor must work on:

- **Desktop (1200px+):** 3-column layout: outline | preview | sidebar. Preview shows paper at ~60% scale.
- **Laptop (900-1200px):** 2-column: preview | sidebar. Outline collapses to hamburger. Preview at ~50% scale.
- **Tablet (600-900px):** Single column. Sidebar slides in from right as overlay. Preview at ~45% scale. Floating toolbar positions below the selected block (not above, to avoid covering already-scrolled content).
- **Mobile (<600px):** Format mode should show a simplified interface: only Standard mode controls (no Advanced), preview at ~30% scale with pinch-to-zoom. Per-question selection disabled (too fiddly on touch). Export buttons always visible.

### Preview Scaling

```typescript
function getPreviewScale(containerWidth: number, pageWidth: number): number {
  const targetWidth = containerWidth - 40; // 20px padding each side
  return Math.min(targetWidth / pageWidth, 1); // Never scale above 1:1
}

// Apply:
<div className="pc-preview-wrapper" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
  <div className="pc-page" style={{ width: '210mm', minHeight: '297mm', ...cssVars }}>
    {/* paper content */}
  </div>
</div>
```

### Touch Interactions

- Slider thumbs: min 44px touch target (iOS HIG)
- Floating toolbar buttons: min 44px × 44px
- Long-press on question block: opens context menu (instead of right-click)
- Swipe down on sidebar: collapse section
- Pinch on preview: zoom in/out

---

## 22. COMPLETE CONFIG SCHEMA

```typescript
interface PaperFormatConfig {
  version: number; // Schema version for migrations, starts at 1

  // --- Mode ---
  layoutMode: "standard" | "advanced";

  // --- Page ---
  pageSize: "A4" | "Legal" | "Letter" | "A3" | "B5";
  pageOrientation: "portrait" | "landscape";
  pageMargins: {
    top: number;
    bottom: number;
    left: number;
    right: number; // mm
    linked: boolean;
  };

  // --- Header ---
  header: {
    repeatMode: "firstPageOnly" | "allPages" | "compactRepeat" | "none";
    schoolName: {
      text: string;
      fontSize: number;
      fontWeight: "normal" | "bold";
      letterSpacing: number;
      textTransform: "uppercase" | "titleCase" | "none";
      textAlign: "center" | "left" | "right";
      marginTop: number;
      marginBottom: number;
    };
    tagline: {
      text: string;
      visible: boolean;
      fontSize: number;
      fontStyle: "normal" | "italic";
      marginBottom: number;
    };
    examInfoRow: {
      layout: "singleRow" | "twoRow" | "compact";
      borderStyle: "fullBox" | "topBottom" | "underline" | "none";
      borderWeight: number;
      cellPadding: number;
      fontSize: number;
      marginTop: number;
      marginBottom: number;
      fields: {
        class: FieldConfig;
        subject: FieldConfig;
        duration: FieldConfig;
        totalMarks: FieldConfig;
        date: FieldConfig;
        custom: Array<FieldConfig & { key: string }>;
      };
    };
    examTitle: {
      text: string;
      fontSize: number;
      fontWeight: "normal" | "bold";
      fontStyle: "normal" | "italic";
      marginTop: number;
      marginBottom: number;
    };
    dividerAfterHeader: DividerConfig;
    logo: {
      enabled: boolean;
      url: string | null;
      maxHeight: number;
      position: "left" | "center" | "aboveName";
    };
  };

  // --- Spacing ---
  spacing: {
    betweenQuestions: number;
    betweenSections: number;
    afterSectionHeader: number;
    afterSectionInstruction: number;
    afterInstructions: number;
    questionIndent: number;
    subQuestionIndent: number;
    subQuestionGap: number;
    mcqOptionGap: number;
    mcqOptionIndent: number;
    answerLines: number;
    answerLineSpacing: number;
  };

  // --- Typography ---
  typography: {
    baseFontFamily: string;
    hindiFontFamily: string;
    questionFontSize: number;
    questionFontWeight: "normal" | "bold";
    mcqFontSize: number;
    sectionHeaderFontSize: number;
    sectionHeaderFontWeight: "normal" | "bold";
    instructionsFontSize: number;
    instructionsFontStyle: "normal" | "italic";
    marksFontSize: number;
    lineHeight: number;
  };

  // --- Marks ---
  marks: {
    style: "bracket" | "paren" | "text" | "hidden";
    position: "rightAligned" | "farRight" | "inline";
    fontSize: number;
    bold: boolean;
    showSectionTotal: boolean;
    showQuestionCount: boolean;
  };

  // --- Numbering ---
  numbering: {
    questionStyle: "auto" | "manual" | "hidden";
    subQuestionStyle: "abc" | "roman" | "parenAbc" | "parenRoman";
    continueAcrossSections: boolean;
    sectionLabelFormat: string;
  };

  // --- Dividers ---
  dividers: {
    afterHeader: DividerConfig;
    betweenSections: DividerConfig;
    beforeFooter: DividerConfig;
  };

  // --- Continuation ---
  continuation: {
    enabled: boolean;
    format: string;
    fontSize: number;
    fontStyle: "normal" | "italic";
    color: string;
    marginTop: number;
    marginBottom: number;
  };

  // --- Footer ---
  footer: {
    showPageNumbers: boolean;
    pageNumberFormat: "pageXofY" | "plain" | "dashed" | "fraction";
    pageNumberPosition: "center" | "right" | "left";
    fontSize: number;
    showOnFirstPage: boolean;
    customText: string;
  };

  // --- Watermark ---
  watermark: {
    enabled: boolean;
    text: string; // "DRAFT", "CONFIDENTIAL", etc.
    opacity: number; // 0.03 - 0.15
    fontSize: number; // auto-calculated if 0
    rotation: number; // degrees, default -45
  };

  // --- Overrides ---
  sectionOverrides: Record<string, SectionOverride>;
  questionOverrides: Record<string, QuestionLayoutOverride>;
}

interface FieldConfig {
  visible: boolean;
  label: string;
  value: string;
}

interface DividerConfig {
  style: "solid" | "dashed" | "dotted" | "double" | "ornamental" | "none";
  weight: number;
  width: number;
  color: string;
  spaceAbove: number;
  spaceBelow: number;
}

interface SectionOverride {
  spacingAbove?: number;
  spacingAfterHeader?: number;
  questionSpacing?: number;
  columns?: 1 | 2;
  startOnNewPage?: boolean;
  dividerAbove?: DividerConfig;
  continuationEnabled?: boolean;
}

interface QuestionLayoutOverride {
  marginTop?: number;
  marginBottom?: number;
  paddingTop?: number;
  paddingBottom?: number;
  indent?: number;
  fontSize?: number;
  startOnNewPage?: boolean;
  keepWithNext?: boolean;
}
```

---

## 23. CSS CUSTOM PROPERTY BRIDGE

```typescript
function configToCssVars(config: PaperFormatConfig): React.CSSProperties {
  const vars: Record<string, string> = {
    // Page
    "--page-margin-top": `${config.pageMargins.top}mm`,
    "--page-margin-bottom": `${config.pageMargins.bottom}mm`,
    "--page-margin-left": `${config.pageMargins.left}mm`,
    "--page-margin-right": `${config.pageMargins.right}mm`,

    // Spacing
    "--q-spacing": `${config.spacing.betweenQuestions}mm`,
    "--section-spacing": `${config.spacing.betweenSections}mm`,
    "--section-header-spacing": `${config.spacing.afterSectionHeader}mm`,
    "--section-instruction-spacing": `${config.spacing.afterSectionInstruction}mm`,
    "--instructions-spacing": `${config.spacing.afterInstructions}mm`,
    "--q-indent": `${config.spacing.questionIndent}mm`,
    "--sub-q-indent": `${config.spacing.subQuestionIndent}mm`,
    "--sub-q-gap": `${config.spacing.subQuestionGap}mm`,
    "--mcq-gap": `${config.spacing.mcqOptionGap}mm`,
    "--mcq-indent": `${config.spacing.mcqOptionIndent}mm`,

    // Typography
    "--font-base": config.typography.baseFontFamily,
    "--font-hindi": config.typography.hindiFontFamily,
    "--q-font-size": `${config.typography.questionFontSize}pt`,
    "--q-font-weight": config.typography.questionFontWeight,
    "--mcq-font-size": `${config.typography.mcqFontSize}pt`,
    "--section-font-size": `${config.typography.sectionHeaderFontSize}pt`,
    "--section-font-weight": config.typography.sectionHeaderFontWeight,
    "--instructions-font-size": `${config.typography.instructionsFontSize}pt`,
    "--instructions-font-style": config.typography.instructionsFontStyle,
    "--marks-font-size": `${config.typography.marksFontSize}pt`,
    "--line-height": `${config.typography.lineHeight}`,

    // Header
    "--school-name-size": `${config.header.schoolName.fontSize}pt`,
    "--school-name-weight": config.header.schoolName.fontWeight,
    "--school-name-spacing": `${config.header.schoolName.letterSpacing}px`,
    "--school-name-transform": config.header.schoolName.textTransform,
    "--school-name-margin-top": `${config.header.schoolName.marginTop}mm`,
    "--school-name-margin-bottom": `${config.header.schoolName.marginBottom}mm`,
    "--tagline-size": `${config.header.tagline.fontSize}pt`,
    "--tagline-margin": `${config.header.tagline.marginBottom}mm`,
    "--exam-info-size": `${config.header.examInfoRow.fontSize}pt`,
    "--exam-info-padding": `${config.header.examInfoRow.cellPadding}mm`,
    "--exam-info-margin-top": `${config.header.examInfoRow.marginTop}mm`,
    "--exam-info-margin-bottom": `${config.header.examInfoRow.marginBottom}mm`,
    "--exam-title-size": `${config.header.examTitle.fontSize}pt`,
    "--exam-title-margin-top": `${config.header.examTitle.marginTop}mm`,
    "--exam-title-margin-bottom": `${config.header.examTitle.marginBottom}mm`,

    // Footer
    "--footer-font-size": `${config.footer.fontSize}pt`,

    // Continuation
    "--continuation-font-size": `${config.continuation.fontSize}pt`,
    "--continuation-color": config.continuation.color,
    "--continuation-margin-top": `${config.continuation.marginTop}mm`,
    "--continuation-margin-bottom": `${config.continuation.marginBottom}mm`,
  };

  return vars as React.CSSProperties;
}
```

---

## 24. ZUSTAND STORE

```typescript
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import _ from "lodash";
import { compare, applyPatch, Operation } from "fast-json-patch";

interface PaperEditorState {
  config: PaperFormatConfig;
  selectedBlockId: string | null;
  selectedBlockType: string | null;
  pageCount: number;
  showGuides: boolean;
  undoStack: Array<{ patches: Operation[]; description: string }>;
  redoStack: Array<{ patches: Operation[]; description: string }>;
  institutionalPreset: InstitutionalPreset | null;

  // Setters
  updateConfig: (path: string, value: any, description?: string) => void;
  batchUpdate: (
    updates: Array<{ path: string; value: any }>,
    description?: string,
  ) => void;
  setHeaderPreset: (preset: "compact" | "standard" | "spacious") => void;
  setDensity: (density: number) => void; // Standard mode
  setGlobalFontSize: (size: number) => void; // Standard mode
  setQuestionOverride: (
    qId: string,
    overrides: Partial<QuestionLayoutOverride>,
  ) => void;
  clearQuestionOverride: (qId: string) => void;
  setSectionOverride: (
    sId: string,
    overrides: Partial<SectionOverride>,
  ) => void;
  clearSectionOverride: (sId: string) => void;
  selectBlock: (id: string | null, type: string | null) => void;
  updatePageCount: (count: number) => void;

  // Reset
  resetToDefaults: () => void;
  resetSpacing: () => void;
  resetTypography: () => void;
  resetHeader: () => void;

  // Undo
  undo: () => void;
  redo: () => void;

  // Templates
  applyTemplate: (config: PaperFormatConfig) => void;
  setInstitutionalPreset: (preset: InstitutionalPreset | null) => void;
}
```

---

## 25. IMPLEMENTATION ORDER

### Phase 1 — Foundation (Week 1-2)

1. Fix the 5 bugs (header repeat, question spacing, indent, continuation, MCQ gaps)
2. Zustand store with `PaperFormatConfig` and CSS custom property bridge
3. Standard mode: global font size slider, density slider, margin presets
4. Header presets (Compact / Standard / Spacious)
5. Live page count indicator
6. Page break engine (basic — no split, just keep-together rules)

### Phase 2 — Advanced Mode (Week 3-4)

7. Advanced mode toggle with warning dialog
8. Per-element font size sliders (advanced mode)
9. Per-element spacing sliders (advanced mode)
10. Page margin 4-slider control (advanced mode)
11. Header field-by-field controls (advanced mode)
12. Per-question click-to-select + floating toolbar + override controls
13. Per-section click-to-select + override controls

### Phase 3 — Completeness (Week 5-6)

14. Divider controls (standard: on/off/subtle, advanced: full)
15. Marks display controls
16. Typography controls (font family, line height, letter spacing)
17. Footer & page number controls
18. Continuation header controls
19. Numbering controls
20. Undo/redo system

### Phase 4 — Export & Polish (Week 7-8)

21. PDF export (react-to-print + print CSS)
22. DOCX export (docx library)
23. Reset system (per-question, per-section, per-category, full)
24. Institutional preset locking
25. Format template save/load
26. Responsive layout (tablet, mobile)
27. Accessibility audit (ARIA, keyboard nav, focus)
28. Performance optimization (virtualization, memoization)

### Phase 5 — Edge Case Hardening (Week 9-10)

29. Long question overflow handling
30. Mixed question type layout
31. "OR" question grouping
32. Image-based questions
33. 2-column MCQ sections
34. Bilingual text rendering
35. Watermark
36. Config versioning & migration
37. Extreme value combination testing
