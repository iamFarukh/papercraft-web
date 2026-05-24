# Paper Editing — Current Implementation (As-Built)

> **Audience:** Engineers and AI agents who need accurate context on what PaperCraft’s editable examination paper flow does **today**, without confusing it with future specs.
>
> **Related specs (not fully implemented):**
> - [`paperEditor.md`](./paperEditor.md) — original product vision: block tree, per-block floating toolbar, divider presets, templates, “reduce to N pages”, etc.
> - [`editorPart2.md`](./editorPart2.md) — production-grade v2 spec: two-tier controls, continuous sliders, Zustand store, undo, DOCX, institutional locks, 100+ edge cases.

---

## 1. Why there are two older documents

| Document | Role | Relationship to code |
|----------|------|----------------------|
| **`paperEditor.md`** | **Product / UX specification** written as a full “formatting engine” vision: every element is a typed block in a tree, WYSIWYG with drag handles, CBSE/ICSE presets, ornamental dividers, Smart Fit, page-break rules spelled out in prose. | **Aspirational.** Many sections describe UI and behavior that do not exist yet. Useful for *intent* and naming (blocks, presets, marks styles). |
| **`editorPart2.md`** | **Implementation specification v2** — how to build it “for real”: Standard vs Advanced mode, `InheritableValue` overrides, slider ranges, CSS custom properties, Zustand + immer, pagination edge cases, DOCX, undo stacks, 10-week rollout. | **Partially implemented.** Core ideas (two-tier layout, density ratios, header presets, `PaperFormatConfig`, CSS vars) are in code. Zustand, undo/redo, DOCX, institutional presets, spacing overlay, and most of §14 edge-case catalog are **not** built. |

**Why they were split:** `paperEditor.md` answers *what teachers should be able to control* (feature completeness). `editorPart2.md` answers *how engineers should build it safely* (control philosophy, sync rules, slider UX, failure modes). Neither is a snapshot of the running app — **this document is.**

---

## 2. End-to-end user flow (today)

```text
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────────────────┐
│ Paper setup     │────▶│ Paper Builder        │────▶│ Examination Editor          │
│ /app/builder/   │     │ /app/builder/:id     │     │ /app/builder/:id/editor     │
│ setup           │     │ (compose)            │     │ (format / layout)           │
└─────────────────┘     └──────────────────────┘     └──────────────┬──────────────┘
        │                          │                                  │
        │                          │  Save required before editor     │
        │                          │                                  ▼
        │                          │                    ┌─────────────────────────────┐
        │                          │                    │ Official print preview      │
        │                          └───────────────────▶│ /app/papers/:id/preview    │
        │                                               │ PDF export (approved only)  │
        └───────────────────────────────────────────────┴─────────────────────────────┘
```

### 2.1 Paper setup (`PaperSetupFlow`)

Teacher defines examination metadata: name, session, class, subject, medium (`english` | `hindi` | `bilingual`), exam type, duration, total marks, section count (1–3), general instructions, structure notes. Creates or opens a draft paper in Firestore.

### 2.2 Compose — Paper Builder (`PaperBuilderWorkspace`)

**Purpose:** Select questions from the repository into sections A/B/C. This is **content**, not print layout.

- Left: repository browser with filters (class, subject, chapter, marks band, difficulty).
- Center: paginated composition canvas (`PaperBuilderPaginatedCanvas`) — card-based sections, drag/reorder questions within sections, replace/remove.
- Right: insights (marks balance, duration estimate).
- Autosave to `papers/{id}`: `setup` fields + `sections[].questionIds` + `instanceLayer` (formatting layer travels with the paper but is mainly edited in the next stage).
- Toolbar: **“Examination editor”** — navigates to `/app/builder/:paperId/editor` only after the paper is saved at least once.
- Workflow: submit for approval, reopen (admin), read-only when submitted/approved (teachers) per `paper-submission.ts`.

### 2.3 Format — Examination Editor (`ExaminationEditorPage` + `ExaminationEditorWorkspace`)

**Purpose:** WYSIWYG layout tuning on the **same DOM structure** used for print preview.

Three-column layout:

| Column | Component | Function |
|--------|-----------|----------|
| Left | `PaperStructureNavigator` | Outline: paper → sections → questions; section reorder (up/down). |
| Center | `EditablePrintDocument` | Live paginated A4 preview; click to select; inline chips for marks/spacing. |
| Right | `ExaminationEditorOfficialPreview` | Secondary read-only scroll sync (official preview strip). |

**Also embedded in left column:** `PaperDocumentInspector` (format controls).

**Chrome:** `ExaminationEditorChrome` — save status, Edit vs Preview surface toggle, back to compose, link to full preview.

**Persistence:** `useExaminationEditorSession` — saves `setup` + `instanceLayer` via `updatePaper`; dirty fingerprint includes composition + instance layer; `beforeunload` + leave dialog on unsaved navigation.

**Read-only:** Approved papers, or submitted papers for non-admins — inspector and inline controls disabled.

### 2.4 Print preview & PDF (`PaperPrintPreviewPage`)

- Route: `/app/papers/:paperId/preview?from=editor|builder|approval`
- Renders `OfficialPrintDocument` (non-editable) with resolved paper.
- **PDF export:** `exportOfficialPrintToPdf` (html2canvas + jsPDF) — **only when `status === 'approved'`**.
- Preview route can auto-export with `?export=1` when approved.

---

## 3. Architecture: data layers

Paper state splits into three layers that must not be confused:

```text
Repository (questions/{id})     ← canonical question text, marks, MCQ options, images
        │
        ▼
Composition (in memory +        ← which question IDs sit in section A/B/C
  sections[].questionIds)
        │
        ▼
Instance layer (papers.instanceLayer)  ← formatting ONLY for this paper;
                                         never writes back to repository
```

### 3.1 `PaperSetupState` (examination metadata)

Edited in both Builder and Examination Editor. Persisted on the paper document: title, session, class, subject, medium, exam type, duration, total marks, instructions, structure notes, section count.

### 3.2 `PaperComposition`

`Record<SectionId, QuestionRecord[]>` — hydrated from Firestore question IDs. Missing IDs become placeholder “missing question” rows.

**Examination Editor does not change composition** — question set is fixed; editor only adjusts layout/instance overrides.

### 3.3 `PaperInstanceLayer` (formatting persistence)

Stored on `papers/{id}.instanceLayer`:

```typescript
{
  presentation?: Partial<PaperPresentation>   // school name, tagline, header/footer toggles
  printSettings?: Partial<PaperPrintSettings> // legacy discrete presets (derived from formatConfig)
  formatConfig?: Partial<PaperFormatConfig>   // source of truth for layout numbers
  sections?: Record<SectionId, PaperSectionInstance>
  questions?: Record<questionId, PaperQuestionInstance>
}
```

### 3.4 Resolution pipeline

`resolvePaper(setup, sectionDefs, composition, instanceLayer)` → `ResolvedPaper`:

- Merges presentation defaults (`DEFAULT_PRESENTATION`).
- Normalizes `formatConfig` via `normalizeFormatConfig` (merges legacy `printSettings` if needed).
- Applies section `order`, `hidden`, title/instructions overrides.
- Computes per-question `displayNumber`, `effectiveMarks`, `hidden`, `questionFormat`, `sectionFormat`.
- Produces `stats` (question count, total marks).

**Print path:** `buildPrintPagesFromResolved(resolved)` → `PrintPageModel[]` with estimated heights and page breaks.

**CSS bridge:** `configToCssVars(formatConfig)` + per-block `questionFormatToStyle` / `sectionFormatToStyle` applied on `.pc-print-doc`.

---

## 4. `PaperFormatConfig` — what is actually modeled

Defined in `src/types/paper-instance.ts`, defaults in `src/lib/paper-format-config.ts`.

| Area | Fields | UI exposure |
|------|--------|-------------|
| **Mode** | `layoutMode`: `standard` \| `advanced` | Segment control + confirmation dialog for advanced |
| **Page** | `pageSize` (A4/Legal/Letter), `pageOrientation`, `marginPreset`, `pageMargins` (mm, `linked`) | Margins: presets + linked slider (standard). **No UI for page size/orientation yet** — defaults A4 portrait |
| **Standard tuning** | `globalFontSize`, `globalDensity` | Sliders; density drives spacing via `DENSITY_RATIOS` |
| **Typography** | `baseFontFamily` (serif/sans), per-role font sizes, `lineHeight`, `questionFontWeight` | Standard: global question font + section header slider. Advanced: question/marks/line-height sliders |
| **Spacing** | `betweenQuestions`, `betweenSections`, `afterSectionHeader`, `afterInstructions`, indents, MCQ gaps, answer lines | Standard: derived from density. Advanced: explicit sliders (subset) |
| **Header** | `preset`, `repeatMode`, `schoolName/tagline/examTitle` sizes (pt), `letterSpacing` | Header preset cards + Smart fit. Repeat mode via presentation + formatConfig |
| **Marks** | `style` (bracket/paren/hidden), `position`, `fontSize`, `showSectionTotal` | Style + inline marks editor on questions |
| **Footer** | `showPageNumbers`, `fontSize`, `format`, `position`, `showOnFirstPage` | Checkbox “Page numbers in footer” (presentation.showFooter) |
| **Dividers** | `betweenSections`: `on` \| `off` \| `subtle` | **Type exists; no dedicated inspector control** — default `on` |

Per-question instance overrides (`PaperQuestionInstance`):

- `marginTop`, `marginBottom`, `indent`, `fontSize`
- `marksOverride`, `customNumber`, `hideNumber`, `hidden`
- `localInstructions`, legacy `spacingMode`

Per-section instance overrides (`PaperSectionInstance`):

- `spacingAbove`, `spacingAfterHeader`, `questionSpacing`, `fontSize`
- `title`, `instructions`, `order`, `hidden`, `showNumbering`
- Types also include `startOnNewPage`, `columns` — **not wired in UI/pagination**

---

## 5. Examination Editor — implemented interactions

### 5.1 Selection model

`EditSelection`:

- `{ kind: 'paper' }` — whole-document controls in inspector.
- `{ kind: 'section', sectionId }` — section block inspector + section head selected on canvas.
- `{ kind: 'question', sectionId, questionId }` — question inspector + question selected.

Clicking canvas blocks updates selection; navigator and center preview scroll into view (bidirectional).

### 5.2 `PaperDocumentInspector` (right / left panel)

**Always visible:**

- Live **page count** and question/marks stats.
- Layout mode: Standard / Advanced (advanced requires confirm dialog).
- Header preset picker (Compact / Standard / Spacious) + **Smart fit** button (`applySmartFitSettings`: compact header, density 1.5mm, font 10pt, tight margins, line-height 1.3).
- Marks style: `[5]` / `(5)` / hidden.
- Typeface: serif / sans.

**Standard mode — “Quick tuning”:**

- All questions — font size (7–18pt).
- All questions — spacing density (0.5–8mm) → maps to section/question gaps.
- Section headers — font size.
- Page margins: Tight / Normal / Wide presets + linked “All margins” slider.

**Advanced mode — extra groups:**

- Typography: question text, section headers, marks, line height.
- Spacing: between questions, between sections, question indent.

**Collapsible groups:**

- Branding: school name, tagline (presentation).
- Examination: title, session, duration, general instructions (setup).
- Header & page: show header, repeat mode (first only / every page compact / every page mini), toggles for logo, tagline, exam title row, meta row, footer page numbers.

**Block-scoped panel** (`BlockInspectorPanel`):

When a question or section is selected, sliders apply **only to that block**, with global value hints and reset:

- Question: space above/below, left indent, font size; Apply to section / Apply to all; Reset to global.
- Section: space above, after header, between questions, title size; Apply to all sections; Reset.

### 5.3 Canvas — `EditablePrintDocument`

- Renders paginated `.pc-print-page` sheets using shared `PrintBlockContent` / headers / footers.
- Applies `formatVars` + selection styling (`is-selected`, `has-format-override`).
- **Edit surface** vs **Preview surface** (`cleanSurface`): preview hides overlays and disables edits.

### 5.4 Inline question controls (`EditablePrintQuestion`)

On selected question (not read-only):

- Click question number → edit custom number.
- `InlineMarksEditor` — override marks for this paper only.
- **Spacing chip** — cycles compact / normal / spacious / custom via `marginTop` overrides.
- Menu: Hide on paper, auto numbering, hide numbering.
- Optional **local instructions** textarea (paper-only note under question body).

Printed marks label still shown via `formatQuestionMarks` + `marksDisplay` style.

### 5.5 Inline section controls (`EditablePrintSectionHead`)

- Click section title → rename (paper-only `section.title` override).
- Section instructions editable when selected.
- Move section up/down, hide section (instance `hidden`).
- Shows question count and marks summary on header line.

### 5.6 Structure navigator

- Jump to paper / section / question.
- Reorder sections (instance `order` field) — does not change section letters in composition, only print order.

### 5.7 Header repeat behavior (`resolvePageHeader`)

| `headerRepeatMode` | Page 1 | Page 2+ |
|--------------------|--------|---------|
| `firstPageOnly` | Full header | No header |
| `allPages` | Full | Compact header |
| `compactRepeat` | Full | Mini single-line header |
| `none` | No header | No header |

Controlled from inspector; syncs `presentation` and `formatConfig.header.repeatMode`.

### 5.8 Pagination engine (`paper-print-layout.ts`)

- Fixed A4 pixel dimensions: 595×842px content modeling.
- Height estimation per block (instructions, section head, question with MCQ rows, bilingual line counting).
- `HEIGHT_SAFETY` multiplier (1.18) to reduce clipping.
- Page break: if block doesn’t fit, flush page; questions/section-instructions set `continuedSection` for continuation context.
- **Not implemented from spec:** orphan rules, keep sub-questions together, minimum 3 questions/page, “reduce to N pages”, 2-column sections.

### 5.9 PDF export (`paper-pdf-export.ts`)

- Captures `.pc-print-page` DOM nodes via html2canvas → jsPDF A4.
- Filename pattern: `Class{IX}_{Subject}_{ExamType}_{Year}.pdf`.
- Gated on approved status in preview shell.

---

## 6. Key source files (navigation map)

| Path | Responsibility |
|------|----------------|
| `src/pages/ExaminationEditorPage.tsx` | Route shell, load paper from Firestore or navigation state |
| `src/components/examination-editor/ExaminationEditorWorkspace.tsx` | 3-column editor layout, save/leave, surface modes |
| `src/hooks/useExaminationEditorSession.ts` | Dirty state, persist `instanceLayer` + setup |
| `src/components/paper-builder/editing/EditablePrintDocument.tsx` | Paginated editable preview |
| `src/components/paper-builder/editing/PaperDocumentInspector.tsx` | Format sidebar |
| `src/components/paper-builder/editing/BlockInspectorPanel.tsx` | Per-question / per-section sliders |
| `src/components/paper-builder/editing/PaperStructureNavigator.tsx` | Outline |
| `src/components/paper-builder/editing/FormatSlider.tsx` | Continuous slider + numeric input + global hint |
| `src/lib/paper-format-config.ts` | Defaults, presets, CSS vars, apply* helpers |
| `src/lib/paper-instance.ts` | `resolvePaper`, smart fit, section reorder |
| `src/lib/paper-print-layout.ts` | Pagination |
| `src/lib/paper-print-header.ts` | Header visibility per page |
| `src/lib/paper-persistence.ts` | Save/load, fingerprint |
| `src/types/paper-instance.ts` | Types |
| `src/components/print/OfficialPrintDocument.tsx` | Read-only print renderer |
| `src/lib/paper-pdf-export.ts` | PDF generation |
| `src/styles/paper-examination-editor.css` | Editor chrome layout |
| `src/styles/paper-editing.css` | Editing overlays |
| `src/styles/paper-print.css` | Print typography |

**Legacy / unused in routes:** `PaperEditingWorkspace.tsx` — older 3-panel layout; superseded by `ExaminationEditorWorkspace` but kept in repo.

---

## 7. Persistence & compatibility

- **Save payload:** `setupToSaveInput(setup, sectionSnapshots, instanceLayer)` → Firestore `papers` doc.
- **Fingerprint:** JSON of setup + composition question IDs + normalized instance layer — used for dirty detection.
- **Legacy `printSettings`:** discrete `fontSize` / `spacingMode` / `headerPreset` / `marksDisplay` still derived via `formatConfigToPrintSettings` for CSS class names (`printSettingsClassName`).
- **Config version:** `FORMAT_CONFIG_VERSION = 1` on `PaperFormatConfig.version` — no migration runner yet.

---

## 8. Implemented vs `paperEditor.md` (gap summary)

| Spec area | Status |
|-----------|--------|
| Block tree with typed `BlockLayout` per block | **Not implemented** — logical blocks exist in print layout only, not as editable tree nodes |
| Floating toolbar on every block | **Partial** — inline chips on selected question/section only |
| Drag resize margins | **Not implemented** |
| Divider styles (ornamental, per-location) | **Not implemented** (only `SectionDividerMode` type) |
| Exam info table layout/border/field toggles | **Partial** — meta row show/hide only, not table layout |
| General instructions bullet/background controls | **Partial** — textarea only |
| OR questions, answer lines, image placement | **Not in editor** |
| Page size/orientation/columns UI | **Not in UI** (types partially exist) |
| CBSE/ICSE/compact templates gallery | **Not implemented** (header presets + smart fit only) |
| Save custom template | **Not implemented** |
| Spacing visualization overlay | **Not implemented** |
| Inline edit question body text | **Not implemented** (repository-only content) |
| Continuation header string format UI | **Partial** — pagination sets `continuedSection`; limited header customization |
| `react-pdf` / server PDF | **Not used** — client html2canvas |
| Zustand format store | **Not implemented** — React state in session hook |

---

## 9. Implemented vs `editorPart2.md` (gap summary)

| Spec area | Status |
|-----------|--------|
| Two-tier Standard / Advanced | **Implemented** |
| Continuous sliders with warning ranges | **Implemented** (`FormatSlider`) |
| Density → spacing ratio mapping | **Implemented** |
| Margin presets + linked slider | **Implemented** |
| InheritableValue / override dot on all controls | **Partial** — `globalValue` on block sliders; no global override map by ID in formatConfig |
| Advanced: 4 independent margin sliders | **Not implemented** — linked only |
| Advanced: per-element font/spacing full set | **Partial** — subset of sliders |
| Apply to all + clear overrides toast | **Partial** — apply buttons on block panel; no global clear |
| Undo/redo | **Not implemented** |
| DOCX export | **Not implemented** |
| Institutional preset locking | **Not implemented** |
| Page break edge-case catalog (§14–15) | **Partial** — basic height pagination only |
| CSS custom property bridge | **Implemented** |
| Zustand store (§24) | **Not implemented** |
| MCQ gap / sub-question indent sliders in UI | **In schema, not in inspector** |
| Switch advanced → standard clears overrides | **Not implemented** — mode switch keeps overrides |
| Responsive editor (§21) | **Partial CSS** — tablet/mobile collapse in `paper-examination-editor.css` |

---

## 10. Mental model for agents

When asked to change “the paper editor”:

1. **Composition changes** → `PaperBuilderWorkspace` + `paper-builder.ts` — adding/removing questions.
2. **Layout/format changes** → `instanceLayer.formatConfig` + `presentation` + per-question/section maps — Examination Editor only.
3. **What teachers see on paper** → always run through `resolvePaper` then `buildPrintPagesFromResolved` — preview and PDF must match.
4. **Do not mutate** `QuestionRecord` from the editor — use `marksOverride`, `localInstructions`, etc.
5. **Specs are not truth** — check `src/types/paper-instance.ts` and `PaperDocumentInspector.tsx` before assuming a control exists.

---

## 11. Suggested doc maintenance

| Document | Keep as… |
|----------|-----------|
| `paperEditor.md` | Product north star / backlog ideas |
| `editorPart2.md` | Engineering target spec for remaining work |
| **`paper-editing-current-state.md` (this file)** | **As-built truth** — update when shipping editor features |

When implementing a feature from the older specs, add a short “Shipped” note here with the PR/date and file pointers so agents do not rely on stale spec sections.

---

*Last aligned with codebase: Examination Editor route, `PaperFormatConfig` v1, Firebase paper persistence, html2canvas PDF export.*
