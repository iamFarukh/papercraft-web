# Paper Editor & Formatting Engine — Full Specification

> **Context:** This is a Question Paper Builder for schools (Indian education system). Teachers compose exam papers by selecting questions into sections, then enter a formatting/editor mode to fine-tune the layout before exporting to PDF. The goal: give teachers full visual control over every block of the paper so the output is compact, beautiful, print-ready, and wastes minimal paper while remaining highly readable.

---

## 1. CORE ARCHITECTURE

### 1.1 The Paper as a Block Tree

The entire paper is a vertical stack of **blocks**. Every visible element on the paper is a block. Blocks are the atomic unit of layout — each block can be individually selected, resized, spaced, hidden, or reordered.

```
Paper
├── PageHeader (repeats on every page OR first-page-only — user toggleable)
│   ├── SchoolLogoBlock (optional)
│   ├── SchoolNameBlock
│   ├── SchoolTaglineBlock
│   └── ExamInfoTableBlock (class, subject, time, marks)
├── DividerBlock
├── GeneralInstructionsBlock
├── DividerBlock
├── SectionBlock (Section A)
│   ├── SectionHeaderBlock (title, marks, question count)
│   ├── SectionInstructionBlock (optional — "Attempt any three")
│   ├── QuestionBlock (Q1)
│   │   ├── QuestionTextBlock
│   │   ├── QuestionMarksBlock (right-aligned [5])
│   │   ├── QuestionImageBlock (optional)
│   │   └── SubQuestionBlock[] (optional — a, b, c, d for MCQ/sub-parts)
│   ├── QuestionBlock (Q2)
│   └── ...more questions
├── DividerBlock
├── SectionBlock (Section B)
│   └── ...same structure
├── ...more sections
└── PageFooter (optional — page numbers, school watermark)
```

### 1.2 Block Data Model

Every block stores its own layout overrides. If no override is set, it inherits from the global paper settings.

```typescript
interface BlockLayout {
  id: string;
  type: BlockType; // 'schoolName' | 'examInfo' | 'divider' | 'sectionHeader' | 'question' | 'instruction' | etc.
  visible: boolean; // "Hide on paper" toggle

  // Spacing (in mm, maps to print units)
  marginTop: number;
  marginBottom: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;

  // Typography overrides (null = inherit from global)
  fontSize: number | null;
  fontWeight: "normal" | "bold" | null;
  fontStyle: "normal" | "italic" | null;
  textAlign: "left" | "center" | "right" | null;
  lineHeight: number | null; // multiplier e.g. 1.2, 1.5

  // Block-specific
  borderTop: BorderConfig | null;
  borderBottom: BorderConfig | null;
}

type BlockType =
  | "schoolLogo"
  | "schoolName"
  | "schoolTagline"
  | "examInfoTable"
  | "divider"
  | "generalInstructions"
  | "sectionHeader"
  | "sectionInstruction"
  | "question"
  | "subQuestion"
  | "questionImage"
  | "pageFooter";
```

---

## 2. GLOBAL PAPER SETTINGS (Right Sidebar — "Document" Panel)

These are the document-wide defaults. Individual blocks can override any of these.

### 2.1 Page Setup

| Setting               | Options              | Default  | Notes                                |
| --------------------- | -------------------- | -------- | ------------------------------------ |
| Paper size            | A4 / Legal / Letter  | A4       | A4 is standard for Indian schools    |
| Orientation           | Portrait / Landscape | Portrait |                                      |
| Page margins (top)    | 8mm–30mm slider      | 15mm     |                                      |
| Page margins (bottom) | 8mm–30mm slider      | 15mm     |                                      |
| Page margins (left)   | 8mm–30mm slider      | 18mm     | Slightly wider for binding/staple    |
| Page margins (right)  | 8mm–30mm slider      | 12mm     |                                      |
| Columns               | 1 / 2                | 1        | 2-column useful for MCQ-heavy papers |

### 2.2 Typography Defaults

| Setting               | Options                                                             | Default              |
| --------------------- | ------------------------------------------------------------------- | -------------------- |
| Base font family      | Noto Sans / Noto Serif / Tiro Devanagari (for Hindi) / system fonts | Noto Sans            |
| Hindi/Devanagari font | Tiro Devanagari / Noto Sans Devanagari / Mangal                     | Noto Sans Devanagari |
| Base font size        | 9pt–14pt                                                            | 11pt                 |
| Line height           | 1.0–2.0                                                             | 1.4                  |
| Question text size    | 9pt–14pt                                                            | 11pt                 |
| Marks label size      | 8pt–12pt                                                            | 10pt                 |

### 2.3 Spacing Defaults

| Setting              | Options  | Default | Purpose                                                                      |
| -------------------- | -------- | ------- | ---------------------------------------------------------------------------- |
| Between questions    | 0mm–10mm | 3mm     | Gap between consecutive questions                                            |
| Between sections     | 0mm–15mm | 6mm     | Gap between section blocks                                                   |
| After section header | 0mm–8mm  | 2mm     | Gap between "Section A" title and first question                             |
| After instructions   | 0mm–8mm  | 3mm     | Gap after general instructions block                                         |
| Answer line spacing  | 0mm–20mm | 0mm     | Blank space after each question for writing (only for in-class test formats) |

### 2.4 Numbering

| Setting                             | Options                                      | Default                  |
| ----------------------------------- | -------------------------------------------- | ------------------------ |
| Question numbering                  | Auto (1, 2, 3…) / Manual / Hidden            | Auto                     |
| Sub-question style                  | a, b, c / i, ii, iii / (a), (b), (c) / Roman | (a), (b), (c)            |
| Numbering continues across sections | Yes / No (restart per section)               | No                       |
| Section label style                 | "Section A" / "खंड A" / "भाग A" / Custom     | "खंड A" for Hindi medium |

---

## 3. BLOCK-LEVEL CONTROLS (Per-Block Editing)

When a user clicks/taps any block on the paper preview, a floating toolbar or inline panel appears with controls specific to that block type. This is the core of "full control over each section."

### 3.1 Universal Block Controls (Available on Every Block)

These appear as a small floating toolbar when any block is selected:

- **Hide on paper** — toggle visibility (block greys out in editor but disappears in PDF)
- **Spacing** — top/bottom margin sliders (mm), shown as a compact `↕` control
- **Move up / Move down** — reorder within parent
- **Duplicate** — copy this block
- **Reset to default** — clear all overrides

### 3.2 School Name Block

| Control        | Type                           | Notes                                                                   |
| -------------- | ------------------------------ | ----------------------------------------------------------------------- |
| Font size      | Slider 12pt–28pt               | Default should be compact: 16pt, NOT the giant 24pt shown in screenshot |
| Font weight    | Bold / Normal / Light          |                                                                         |
| Letter spacing | 0–5px                          | For that formal spread-out look, but controllable                       |
| Text transform | Uppercase / Title Case / As-Is |                                                                         |
| Bottom margin  | Slider                         | Controls gap between school name and tagline                            |

**Key insight from screenshot:** The school header currently takes ~25% of the first page. A good default should be around 12-15%. Teacher should be able to collapse it even further.

### 3.3 School Tagline Block

| Control    | Type            | Notes                  |
| ---------- | --------------- | ---------------------- |
| Font size  | Slider 8pt–14pt | Default: 9pt           |
| Show/Hide  | Toggle          | Some schools skip this |
| Font style | Normal / Italic |                        |

### 3.4 Exam Info Table Block

This is the row: `कक्षा IX | विषय Social Science | समय 3 hours | पूर्णांक 80`

| Control          | Type                                                     | Notes                            |
| ---------------- | -------------------------------------------------------- | -------------------------------- |
| Layout           | Single row / Two rows / Compact                          | Compact = all in one tight line  |
| Border style     | Full box / Top-bottom lines / Underline only / None      |                                  |
| Border thickness | 0.5pt–2pt                                                |                                  |
| Font size        | Slider 9pt–13pt                                          |                                  |
| Cell padding     | Slider 1mm–5mm                                           | Controls internal breathing room |
| Fields visible   | Toggle each: Class, Subject, Duration, Total Marks, Date |                                  |
| Custom fields    | Add arbitrary key-value pair (e.g. "Set: A")             |                                  |

### 3.5 Divider Block

Dividers separate the header from instructions, instructions from sections, and sections from each other.

| Control       | Type                                                      | Notes                                   |
| ------------- | --------------------------------------------------------- | --------------------------------------- |
| Style         | Solid line / Dashed / Dotted / Double / Ornamental / None |                                         |
| Thickness     | 0.25pt–3pt                                                |                                         |
| Width         | 50%–100% of page width                                    | Centered. 60% gives a clean formal look |
| Color         | Black / Grey / Custom                                     |                                         |
| Spacing above | 0mm–8mm                                                   |                                         |
| Spacing below | 0mm–8mm                                                   |                                         |
| Show/Hide     | Toggle                                                    | Remove divider entirely                 |

**Presets:** Offer 4-5 divider presets: "Formal" (thin black, 80%), "Minimal" (grey, 50%), "Bold" (thick, 100%), "Ornamental" (decorative), "None"

### 3.6 General Instructions Block

| Control           | Type                                  | Notes                                      |
| ----------------- | ------------------------------------- | ------------------------------------------ |
| Title text        | Editable                              | "सामान्य निर्देश" / "General Instructions" |
| Title font size   | Slider                                |                                            |
| Title alignment   | Left / Center                         |                                            |
| Body font size    | Slider                                |                                            |
| Body font style   | Normal / Italic                       |                                            |
| Bullet style      | • / - / numbered / none               |                                            |
| Instruction items | Editable list — add/remove/reorder    |                                            |
| Background        | None / Light grey fill / Bordered box | Box style makes instructions stand out     |
| Max width         | 90%–100%                              | Slightly narrower instructions look clean  |
| Show/Hide         | Toggle                                |                                            |

### 3.7 Section Header Block

This is the line: `खंड A · Compulsory     6 Q · 18 अंक`

| Control                   | Type                                           | Notes                                |
| ------------------------- | ---------------------------------------------- | ------------------------------------ |
| Title font size           | Slider 11pt–18pt                               |                                      |
| Title font weight         | Bold / Normal                                  |                                      |
| Title alignment           | Left / Center                                  |                                      |
| Show marks total          | Toggle                                         | Shows "18 अंक"                       |
| Show question count       | Toggle                                         | Shows "6 Q"                          |
| Show section type         | Toggle                                         | Shows "Compulsory" / "Attempt any 3" |
| Underline                 | None / Solid / Double                          |                                      |
| Background highlight      | None / Light grey / Accent color band          |                                      |
| Spacing after             | Slider                                         |                                      |
| Section instruction       | Editable text field — e.g. "Attempt any three" |
| Section instruction style | Normal / Italic / Bold-Italic                  | Default: Italic                      |

### 3.8 Question Block

The most important block. Each question gets these controls:

| Control                | Type                                                                         | Notes                                                                   |
| ---------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Marks display          | Right-aligned `[5]` / Right-aligned `(5)` / Right-aligned `5 marks` / Hidden |                                                                         |
| Marks position         | Same line as question / Separate right column                                |                                                                         |
| Compact mode           | Toggle                                                                       | Reduces internal spacing — question text tighter                        |
| Question spacing after | Slider 0mm–10mm                                                              | Space before next question                                              |
| Numbering              | Auto / Custom / Hidden                                                       | Override numbering for this specific question                           |
| OR question            | Toggle — adds "OR" divider and alternate question below                      |                                                                         |
| Image placement        | Below text / Right of text / None                                            |                                                                         |
| Image max width        | 30%–100%                                                                     |                                                                         |
| Answer lines           | 0–20                                                                         | Draw blank lines after question for in-class tests                      |
| Answer line spacing    | Slider                                                                       | Gap between answer lines                                                |
| Sub-question indent    | Slider 5mm–20mm                                                              | How far sub-parts indent from parent                                    |
| Sub-question spacing   | Slider 0mm–5mm                                                               | Gap between a), b), c)                                                  |
| Start on new page      | Toggle                                                                       | Force page break before this question (useful for long-answer sections) |

**Inline editing:** Teacher can click question text directly on the paper preview to do minor text edits (fix typos, rephrase) without going back to Compose mode.

### 3.9 Page Footer Block

| Control              | Type                          | Notes                                      |
| -------------------- | ----------------------------- | ------------------------------------------ |
| Show page numbers    | Toggle                        |                                            |
| Page number format   | "Page 1 of 4" / "1" / "- 1 -" |                                            |
| Page number position | Center / Right / Left         |                                            |
| Custom footer text   | Editable                      | e.g. "This paper contains 4 printed pages" |
| Footer font size     | Slider 7pt–10pt               |                                            |
| Show on first page   | Toggle                        | Some formats skip footer on page 1         |

---

## 4. HEADER COMPACTNESS SYSTEM

This is a critical feature since the screenshot shows the header eating too much space.

### 4.1 Header Size Presets

Offer 3 one-click presets in the right sidebar:

| Preset       | School Name Size                    | Tagline Size               | Exam Table Padding | Total Header Height |
| ------------ | ----------------------------------- | -------------------------- | ------------------ | ------------------- |
| **Spacious** | 22pt, uppercase, 3px letter-spacing | 11pt                       | 4mm cell padding   | ~55mm               |
| **Standard** | 16pt, uppercase, 1px letter-spacing | 9pt                        | 2mm cell padding   | ~35mm               |
| **Compact**  | 13pt, bold, 0 letter-spacing        | 8pt, hidden or single line | 1mm cell padding   | ~22mm               |

### 4.2 Header Layout Options

| Layout                | Description                                                                            |
| --------------------- | -------------------------------------------------------------------------------------- |
| **Stacked (default)** | School name → tagline → decorative line → exam info table. Traditional look.           |
| **Inline**            | School name and tagline on same line (left-aligned), exam info on right. Very compact. |
| **Minimal**           | School name centered, exam info as a single line below. Tagline hidden.                |
| **With Logo**         | Logo left, school name + tagline right, exam info below.                               |

### 4.3 "Smart Fit" Toggle

One-click button: "Optimize for paper saving." This automatically:

- Reduces header to Compact preset
- Sets question spacing to 2mm
- Sets section spacing to 4mm
- Sets line height to 1.3
- Sets page margins to minimum comfortable (12mm all sides)
- Sets dividers to thin/minimal

Teacher can then manually adjust anything they don't like.

---

## 5. DIVIDER & SEPARATOR SYSTEM

Dividers aren't just lines — they're structural breaks that communicate paper hierarchy.

### 5.1 Divider Hierarchy

| Location                    | Default Style                                   | Purpose                       |
| --------------------------- | ----------------------------------------------- | ----------------------------- |
| After header                | Thick double line or ornamental                 | Major break: header → content |
| Before general instructions | None or thin line                               |                               |
| After general instructions  | Medium line                                     | Transition to questions       |
| Between sections            | Medium line + extra spacing                     | Clear section boundary        |
| Between "OR" questions      | Centered "OR" text with thin lines on each side |                               |
| Page break continuation     | "CONTINUED · SECTION A · Compulsory" header     | When section spans pages      |

### 5.2 Divider Presets (Global)

| Preset Name | Style                                                     |
| ----------- | --------------------------------------------------------- |
| **Classic** | Solid lines, double after header, single between sections |
| **Minimal** | Extra spacing only, no visible lines between sections     |
| **Formal**  | Ornamental header divider, thin lines elsewhere           |
| **Bold**    | Thick lines everywhere, very clear separation             |
| **Custom**  | User defines each divider independently                   |

---

## 6. MARKS DISPLAY SYSTEM

### 6.1 Marks Placement Options

| Option                        | Visual                                     | Best For                 |
| ----------------------------- | ------------------------------------------ | ------------------------ |
| **Right-aligned bracket**     | `[5]` flush right on same line as question | Standard CBSE/ICSE style |
| **Right-aligned parenthesis** | `(5 marks)` flush right                    | Some state boards        |
| **Right column**              | Dedicated column on far right of page      | Very formal exams        |
| **Inline**                    | `... (5 marks)` at end of question text    | Casual/internal tests    |
| **Hidden**                    | No marks shown                             | Practice papers          |

### 6.2 Section Marks Summary

On the section header line, show total marks as: `6 Q · 18 Marks` or `6 प्रश्न · 18 अंक`

Toggle: Show/Hide per section.

---

## 7. PRINT-OPTIMIZED LAYOUT ENGINE

### 7.1 Page Break Intelligence

The engine must never break a question across pages awkwardly. Rules:

1. **Never orphan a question number.** If only the question number + first line fits on a page but the rest spills to next page, move the entire question to the next page.
2. **Keep sub-questions together.** If a question has parts (a, b, c, d), keep at least the question stem + first 2 sub-questions on the same page.
3. **Section headers never appear alone at page bottom.** If a section header would be the last element on a page, push it to the next page.
4. **"OR" questions stay together.** The primary question, "OR" divider, and alternate question should be on the same page if possible.
5. **Minimum 3 questions per page.** If a page would only fit 1-2 questions and it's not the last page, tighten spacing slightly to fit 3.

### 7.2 Space Reclamation (Paper Saving)

Show a real-time indicator: **"This paper will print on X pages"** — updates live as user adjusts spacing.

If teacher wants to fit on fewer pages, offer:

- "Reduce to N pages" button — auto-adjusts spacing/font to achieve target
- Visual diff showing what changed

### 7.3 Widow/Orphan Control

- No single line of a multi-line question left alone at top/bottom of page
- Instructions block never split across pages — either fits or moves entirely

---

## 8. SECTION-LEVEL CONTROLS

Each section (Section A, Section B, etc.) has its own panel when selected:

### 8.1 Section Settings

| Control                   | Description                                                                   |
| ------------------------- | ----------------------------------------------------------------------------- |
| Section title             | Editable: "Section A" / "खंड A" / custom                                      |
| Section subtitle          | "Compulsory" / "Attempt any 3 of 5" / custom                                  |
| Question numbering start  | Auto (continues) or manual start number                                       |
| Marks per question        | Default marks for this section (can override per question)                    |
| Internal question spacing | Override global spacing for this section only                                 |
| Section divider (before)  | Override divider style for this section's top boundary                        |
| Section divider (after)   | Override divider style for this section's bottom boundary                     |
| Start on new page         | Force this section to begin on a fresh page                                   |
| Columns for this section  | 1 / 2 — useful for MCQ sections in 2 columns while long-answer stays 1 column |
| Section background        | None / Light tint — subtly highlight entire section                           |

---

## 9. REAL-TIME PREVIEW & INTERACTION MODEL

### 9.1 WYSIWYG Editing on Paper Preview

The center panel is a live paper preview. Interactions:

- **Click any block** → block gets a subtle blue outline + floating toolbar appears above it
- **Hover any block** → faint highlight showing block boundaries (like browser DevTools)
- **Drag block edges** → resize spacing (top/bottom margin drag handles)
- **Double-click text** → inline text editing mode
- **Right-click any block** → context menu: Hide, Duplicate, Move, Reset, Properties

### 9.2 Spacing Visualization Mode

Toggle button: "Show spacing" — overlays semi-transparent color blocks showing margins and padding on the preview, like a design tool's spacing inspector. This helps teachers see exactly where space is being used.

### 9.3 Multi-Page Preview

- Scrollable vertical view showing all pages stacked with page breaks visible
- Page break indicators: dashed line + "Page 1 of 4" label
- Zoom control: 50%–200%
- Fit-to-width / Fit-to-page buttons

---

## 10. FORMAT PRESETS & TEMPLATES

### 10.1 Paper Style Presets

One-click presets that set all formatting at once:

| Preset                         | Description                                               |
| ------------------------------ | --------------------------------------------------------- |
| **CBSE Standard**              | Matches CBSE board exam formatting conventions            |
| **ICSE Standard**              | ICSE formatting conventions                               |
| **State Board (Hindi Medium)** | Hindi typography optimized, Devanagari-first              |
| **Compact Test**               | Minimal spacing, small header, maximum questions per page |
| **Formal Exam**                | Spacious, ornamental dividers, large header               |
| **Practice Worksheet**         | No header, minimal formatting, answer lines included      |

### 10.2 Save as Custom Template

Teacher can save their current formatting as a reusable template: name it, and apply it to future papers with one click.

---

## 11. RIGHT SIDEBAR — PANEL ORGANIZATION

The right sidebar should have these collapsible sections:

```
📄 Document
  ├── Page Setup (size, margins, orientation)
  ├── Typography (fonts, sizes, line height)
  └── Spacing Defaults (question gap, section gap, etc.)

🏫 Branding
  ├── School name + font controls
  ├── School tagline + font controls
  ├── School logo (upload/remove)
  └── Header layout preset (Stacked/Inline/Minimal/Logo)

📝 Examination
  ├── Title (Half-Yearly, Final, Unit Test, etc.)
  ├── Session (2025-26 Term II)
  ├── Duration
  ├── General instructions (editable list)
  └── Exam info table fields (toggle each)

📐 Layout
  ├── Header size preset (Spacious/Standard/Compact)
  ├── Divider preset (Classic/Minimal/Formal/Bold/Custom)
  ├── Marks display style
  ├── Numbering style
  └── "Smart Fit" / "Reduce pages" controls

📑 Page
  ├── Exam header on every page / first only
  ├── Page footer toggle
  ├── Page number format
  ├── Continuation headers (when section spans pages)
  └── Watermark (optional — "DRAFT", school logo faint)
```

---

## 12. DATA SCHEMA

### 12.1 PaperFormatConfig (Persisted)

This is the complete formatting state saved with each paper:

```typescript
interface PaperFormatConfig {
  // === PAGE ===
  page: {
    size: "A4" | "Legal" | "Letter";
    orientation: "portrait" | "landscape";
    margins: { top: number; bottom: number; left: number; right: number }; // mm
    columns: 1 | 2;
  };

  // === TYPOGRAPHY ===
  typography: {
    baseFontFamily: string;
    hindiFontFamily: string;
    baseFontSize: number; // pt
    baseLineHeight: number; // multiplier
    questionFontSize: number;
    marksFontSize: number;
  };

  // === SPACING ===
  spacing: {
    betweenQuestions: number; // mm
    betweenSections: number;
    afterSectionHeader: number;
    afterInstructions: number;
    answerLineSpacing: number;
  };

  // === HEADER ===
  header: {
    preset: "spacious" | "standard" | "compact" | "custom";
    layout: "stacked" | "inline" | "minimal" | "withLogo";
    showOnAllPages: boolean;
    schoolName: {
      text: string;
      fontSize: number;
      fontWeight: string;
      letterSpacing: number;
      textTransform: string;
    };
    tagline: {
      text: string;
      fontSize: number;
      visible: boolean;
    };
    examInfoTable: {
      layout: "singleRow" | "twoRow" | "compact";
      borderStyle: "fullBox" | "topBottom" | "underline" | "none";
      borderThickness: number;
      cellPadding: number;
      fields: {
        class: { visible: boolean; label: string; value: string };
        subject: { visible: boolean; label: string; value: string };
        duration: { visible: boolean; label: string; value: string };
        totalMarks: { visible: boolean; label: string; value: string };
        date: { visible: boolean; label: string; value: string };
        custom: Array<{ label: string; value: string; visible: boolean }>;
      };
    };
    logo: {
      enabled: boolean;
      url: string | null;
      maxHeight: number; // mm
    };
  };

  // === DIVIDERS ===
  dividers: {
    preset: "classic" | "minimal" | "formal" | "bold" | "custom";
    afterHeader: DividerConfig;
    afterInstructions: DividerConfig;
    betweenSections: DividerConfig;
    orQuestion: DividerConfig;
  };

  // === MARKS ===
  marks: {
    displayStyle:
      | "bracketRight"
      | "parenRight"
      | "rightColumn"
      | "inline"
      | "hidden";
    showSectionTotal: boolean;
  };

  // === NUMBERING ===
  numbering: {
    questionStyle: "auto" | "manual" | "hidden";
    subQuestionStyle: "abc" | "roman" | "parenAbc" | "parenRoman";
    continueAcrossSections: boolean;
    sectionLabelStyle: string; // "Section A" / "खंड A" etc.
  };

  // === FOOTER ===
  footer: {
    enabled: boolean;
    showPageNumbers: boolean;
    pageNumberFormat: "pageXofY" | "plain" | "dashed";
    pageNumberPosition: "center" | "right" | "left";
    customText: string;
    fontSize: number;
    showOnFirstPage: boolean;
  };

  // === CONTINUATION HEADERS ===
  continuation: {
    enabled: boolean; // "CONTINUED · SECTION A · Compulsory" at top of next page
    format: string;
  };

  // === PER-SECTION OVERRIDES ===
  sectionOverrides: Record<
    string,
    Partial<{
      questionSpacing: number;
      columns: 1 | 2;
      startOnNewPage: boolean;
      dividerBefore: DividerConfig;
      dividerAfter: DividerConfig;
      backgroundTint: string | null;
      numberingStart: number;
    }>
  >;

  // === PER-BLOCK OVERRIDES ===
  blockOverrides: Record<string, Partial<BlockLayout>>;
}

interface DividerConfig {
  style: "solid" | "dashed" | "dotted" | "double" | "ornamental" | "none";
  thickness: number; // pt
  width: number; // percentage of page width
  color: string;
  spacingAbove: number; // mm
  spacingBelow: number; // mm
}
```

---

## 13. IMPLEMENTATION PRIORITIES

### Phase 1 — Core Editing (Ship First)

1. Block selection + floating toolbar with Hide/Show and spacing controls
2. Global paper settings (margins, font size, line height, spacing defaults)
3. Header size presets (Spacious / Standard / Compact)
4. Marks display style toggle
5. Basic divider style (solid/dashed/none + thickness)
6. Real-time page count indicator
7. Page break intelligence (no orphaned questions)
8. PDF export with all formatting applied

### Phase 2 — Fine Control

1. Per-block typography overrides (font size, weight, alignment)
2. Section-level spacing overrides
3. Exam info table field toggles and layout options
4. Numbering customization (sub-question styles, continuation)
5. Footer/page number controls
6. Continuation headers across pages
7. "Smart Fit" / "Reduce to N pages" feature
8. Inline text editing on preview

### Phase 3 — Polish & Templates

1. Spacing visualization mode (DevTools-style overlay)
2. Preset templates (CBSE, ICSE, Compact, etc.)
3. Save custom template
4. 2-column layout for MCQ sections
5. Ornamental divider styles
6. School logo upload and placement
7. Watermark support
8. Drag-to-resize spacing handles

---

## 14. PDF EXPORT REQUIREMENTS

The PDF must be pixel-perfect to the preview. Key requirements:

- Use a library like `react-pdf` (@react-pdf/renderer) or `puppeteer` (server-side) for generation
- Embed fonts (Devanagari support is critical — don't rely on system fonts)
- Respect exact mm measurements for margins and spacing
- Handle page breaks according to the intelligence rules in section 7.1
- Support both A4 and Legal paper sizes
- Output should be print-ready: CMYK-safe colors, proper bleed if needed
- File size should be optimized (compress embedded images)
- Metadata: set PDF title, author (teacher name), subject

---

## 15. UX PRINCIPLES

1. **Default to beautiful.** A teacher who changes nothing should get a well-formatted paper. The defaults must be opinionated and good.
2. **Progressive disclosure.** Show simple controls first (presets, toggles). Advanced controls (exact mm values, per-block overrides) are behind "Advanced" or accessible by clicking the block directly.
3. **Live preview always.** Every change reflects instantly on the paper preview. No "apply" button needed.
4. **Paper count is king.** Teachers care deeply about page count. Always show it prominently. Make it easy to go from 5 pages to 4.
5. **Respect Hindi/bilingual content.** Many papers mix Hindi and English. Font rendering, line height, and text alignment must handle Devanagari gracefully alongside Latin text.
6. **Print is the deliverable.** Everything in the editor exists to serve the printed output. Don't add controls that don't affect the PDF.

---

## 16. KEY UI COMPONENTS TO BUILD

| Component                   | Purpose                                                        |
| --------------------------- | -------------------------------------------------------------- |
| `<PaperPreview />`          | WYSIWYG paper view, renders all blocks, handles selection      |
| `<BlockToolbar />`          | Floating toolbar on selected block (hide, spacing, move, etc.) |
| `<DocumentSettingsPanel />` | Right sidebar with all global settings                         |
| `<BlockSettingsPanel />`    | Right sidebar content that changes based on selected block     |
| `<DividerPicker />`         | Visual picker for divider styles                               |
| `<SpacingSlider />`         | Compact slider control showing mm values                       |
| `<HeaderPresetPicker />`    | Visual cards showing Spacious/Standard/Compact header options  |
| `<PageBreakIndicator />`    | Dashed line in preview showing page boundaries                 |
| `<PageCountBadge />`        | Persistent indicator: "4 pages" with live updates              |
| `<SmartFitDialog />`        | Modal for "Reduce to N pages" with preview of changes          |
| `<FormatPresetGallery />`   | Grid of paper style presets (CBSE, Compact, etc.)              |
| `<InlineTextEditor />`      | Contenteditable overlay for quick text fixes on preview        |
| `<SpacingOverlay />`        | Debug-mode colored overlays showing margins/padding            |
