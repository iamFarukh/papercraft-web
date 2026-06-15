# PaperCraft — Comprehensive Product & Engineering Audit

**Date:** June 14, 2026  
**Scope:** Full review of all planning documents, design references, and the production codebase (`src/`)  
**Purpose:** Single source of truth for what is built, what is missing, known bugs, and prioritized improvement areas

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Document Inventory & Reliability](#2-document-inventory--reliability)
3. [Plan vs Reality — Module Completion Matrix](#3-plan-vs-reality--module-completion-matrix)
4. [MVP Success Criteria Checklist](#4-mvp-success-criteria-checklist)
5. [What Is Currently Implemented (Detailed)](#5-what-is-currently-implemented-detailed)
6. [What Is Missing (From Plan)](#6-what-is-missing-from-plan)
7. [What Is Missing (From Editor Specs)](#7-what-is-missing-from-editor-specs)
8. [What Is Missing (Not in Plan — Recommended)](#8-what-is-missing-not-in-plan--recommended)
9. [Major Issues & Bugs](#9-major-issues--bugs)
10. [Minor Issues & Quality Gaps](#10-minor-issues--quality-gaps)
11. [Areas of Improvement (By Domain)](#11-areas-of-improvement-by-domain)
12. [Areas Still to Implement (Roadmap)](#12-areas-still-to-implement-roadmap)
13. [Security & Authorization Status](#13-security--authorization-status)
14. [Engineering & Release Quality](#14-engineering--release-quality)
15. [Schema & Naming Drift](#15-schema--naming-drift)
16. [In-Progress Work (Uncommitted)](#16-in-progress-work-uncommitted)
17. [Suggested Execution Order](#17-suggested-execution-order)
18. [Document Maintenance Recommendations](#18-document-maintenance-recommendations)

---

## 1. Executive Summary

PaperCraft is **substantially more complete than its primary planning documents indicate**. The codebase is a production-scale React 19 + Vite 8 + TypeScript SPA with **17 Firebase service modules**, **20 routed pages**, and end-to-end flows from question authoring through paper composition, examination formatting, approval, and PDF/DOCX export.

### Headline numbers

| Metric | Value |
|--------|-------|
| Core PLAN.md modules done or largely done | **8 / 11 (~73%)** |
| Modules partial | **3 / 11 (~27%)** |
| Modules not started at module level | **0** |
| Automated tests | **0** |
| `npm run build` | **Passes** |
| `npm run lint` | **Fails — 901 problems** (898 errors, 3 warnings) |
| TypeScript lint coverage | **None** — ESLint only targets `*.{js,jsx}` |
| Main JS bundle | **~2.7 MB** (gzip ~803 KB) — needs code-splitting |

### Biggest gaps are not feature count

The product's maturity blockers are:

1. **Lifecycle completeness** — paper reject-with-comment, `under_review`, post-approval lock/export states, answer keys, paper sets A/B/C/D
2. **Editor spec backlog** — undo/redo, full block tree, divider/orphan pagination, institutional presets (~60% of `editorPart2.md` remains)
3. **Release engineering** — no CI, no tests, no TS lint, stale docs causing planning confusion
4. **Content tooling** — no TipTap/KaTeX despite being core to the plan; questions use plain text fields
5. **Operational hardening** — teacher active/assignment constraints are UI-only; dev role bootstrap env var is risky if misconfigured in production

### Security posture (updated since May 2026 audit)

Several **P0 issues documented in `APP_DEEP_DIVE_AUDIT_2026-05-27.md` appear fixed** in current rules:

- `isAdmin()` is now strict (`role == 'admin'` only)
- User self-update restricts privileged fields
- School asset storage writes are admin-only
- Notification creation has trusted-type validation for cross-user events

Remaining security work is **P1/P2** (teacher constraint enforcement in rules, dev env hardening, observability).

---

## 2. Document Inventory & Reliability

| Document | Role | Trust level | Notes |
|----------|------|-------------|-------|
| [`PLAN.md`](./PLAN.md) | Primary product plan, schema, phases | **Stale — do not use for status** | Says "Question Repository" is current focus; marks 6+ modules as "Planned" that are built. Security rules snippet uses old collection names. |
| [`Architecture.md`](./Architecture.md) | Engineering reference | **Stale — do not use for status** | Says "no domain services yet", mock data only, 2 pages. Reality: 17 Firebase services, 20 pages, live Firestore. |
| [`paperEditor.md`](./paperEditor.md) | Original editor vision (block tree, dividers, templates) | **Aspirational backlog** | Useful for product intent; most UI described does not exist. |
| [`editorPart2.md`](./editorPart2.md) | Production editor spec v2 (~2300 lines) | **Partial target spec** | Two-tier Standard/Advanced implemented; Zustand, undo, DOCX parity, edge-case catalog largely not. |
| [`paper-editing-current-state.md`](./paper-editing-current-state.md) | As-built editor snapshot | **High trust — use this for editor** | Accurately describes routes, persistence, gaps. Update when shipping editor features. |
| [`APP_DEEP_DIVE_AUDIT_2026-05-27.md`](./APP_DEEP_DIVE_AUDIT_2026-05-27.md) | May security & maturity audit | **Partially stale** | P0 authz findings largely remediated in code; lint/build numbers still relevant. |
| [`paperCraftUIDesign/DESIGN.md`](../paperCraftUIDesign/DESIGN.md) | Binding visual/UX spec | **High trust for UI** | Production app aligns well; Lucide replaces custom icon set. |
| [`README.md`](../README.md) | Repo entry point | **Not useful** | Still default Vite template; no product overview. |
| **This document** | Full audit snapshot | **Current as of June 14, 2026** | Supersedes scattered status across older docs. |

### Key doc conflicts to resolve

| Topic | PLAN.md says | Code does |
|-------|--------------|-----------|
| Current phase | Phase 2 — Question System | Phases 2–4 largely built |
| Notifications | "NOT building right now" | Full notification panel + Firestore collection |
| Paper collection | `questionPapers` | `papers` |
| Blueprint collection | `examBlueprints` | `blueprints` |
| Curriculum | `subjects`, `chapters` | `curriculum_classes`, `curriculum_subjects`, `curriculum_chapters`, `curriculum_topics` |
| School config | `schoolConfig/main` | `workspace_settings` |
| Bulk import result | Import as **draft**, admin publishes later | Imports as **`published` immediately** |
| Paper lifecycle | 6 states incl. `under_review`, `locked`, `exported` | 4 states: `draft`, `submitted`, `approved`, `archived` |
| Rich text / math | TipTap + KaTeX | Plain text / textarea fields |
| Admin vs teacher routes | Separate `/admin/*` and `/teacher/*` | Unified `/app/*` with `AdminRoute` guards |

---

## 3. Plan vs Reality — Module Completion Matrix

Reference: [`PLAN.md`](./PLAN.md) § Core Modules & Status

| # | Module | PLAN status | Actual status | Completion | Notes |
|---|--------|-------------|---------------|------------|-------|
| 1 | Authentication | ✅ Completed | ✅ Done | 100% | Firebase email/password, role from Firestore, profile bootstrap |
| 2 | App Shell | ✅ Completed | ✅ Done | 100% | Sidebar, topbar, breadcrumbs, command palette, tab bar |
| 3 | Academic Control Center | ✅ Initial refinement | ✅ Done | ~90% | Live Firestore metrics; some mock-adjacent widgets remain |
| 4 | Question Repository | 🚧 Currently building | ✅ Done | ~85% | Filters, cards, stream, intelligence sidebar, bulk actions, bookmarks |
| 5 | Create/Edit Question | ⏳ Planned | ✅ Done | ~80% | All 7 types in types; authoring UI covers core types; no rich text/KaTeX |
| 6 | Bulk Upload | ⏳ Planned | ✅ Done | ~85% | Excel wizard, validation, curriculum auto-create; publishes directly |
| 7 | Curriculum Workspace | ⏳ Planned | ✅ Done | ~90% | Tree panel, archive lifecycle, insights, seeding |
| 8 | Paper Builder | ⏳ Planned | ✅ Done (core) | ~80% | Setup, compose, auto-generation engine, blueprint bridge, insights |
| 9 | Approval Workspace | ⏳ Planned | 🟡 Partial | ~65% | Queue, review, approve, reopen — no reject-with-comment, no `under_review` |
| 10 | Paper Library | ⏳ Planned | 🟡 Partial | ~70% | List, status chips, preview links — no answer key, no sets |
| 11 | Polish & Deploy | Phase 5 | 🟡 Partial | ~40% | Vercel-ready; no mobile, no i18n, no tests, no CI |

**Overall product module estimate: ~78% complete** (weighted toward core workflows).

---

## 4. MVP Success Criteria Checklist

From [`PLAN.md`](./PLAN.md) § MVP Success Criteria:

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Admin can upload and publish questions | ✅ **Met** | Bulk import + question author; lifecycle actions in drawer |
| 2 | Teacher can browse the repository | ✅ **Met** | Repository workspace; teachers see published only |
| 3 | Teacher can generate a paper | ✅ **Met** | Paper setup + builder + auto-generation engine |
| 4 | Teacher can submit paper for approval | ✅ **Met** | `submitPaperForApproval()` + validation |
| 5 | Admin can approve the paper | ✅ **Met** | Approval workspace + `approvePaper()` |
| 6 | Approved paper exported as PDF **with answer key** | 🟡 **Partial** | PDF + DOCX export work for approved papers; **answer key export does not exist** |

**MVP verdict:** 5.5 / 6 — functionally usable for a single school pilot, but **answer key export is a documented MVP requirement and is missing**.

---

## 5. What Is Currently Implemented (Detailed)

### 5.1 Authentication & roles

- Firebase Auth email/password with remember-me persistence
- `AuthContext` + `ProtectedRoute` + `AdminRoute`
- Role from Firestore `users/{uid}.role` — strict parsing (no admin fallback on missing role)
- Teacher pending profile bootstrap via `teacher_pending` collection
- `ProfileSetupRequired` screen when no valid profile
- `VITE_DEV_ROLE` escape hatch for local development only

### 5.2 App shell & navigation

- Editorial design system (`--pc-*` tokens, Newsreader + Geist)
- Sidebar groups: Control Center, Academic, Papers, Organization
- 20 routed pages under `/app/*`
- Command palette, notifications panel, activity feed
- Mobile gate — viewports below threshold show `MobileUnsupportedScreen`

### 5.3 Question system

- **Repository:** cascading filters, full-text search, question stream/cards, detail drawer
- **Lifecycle:** draft → published → locked → archived (Firestore rules enforce transitions)
- **Authoring:** create/edit with taxonomy combobox, bilingual fields, MCQ/TF/fill/short/long/match/assertion types
- **Bulk import:** column mapping, row validation, duplicate-in-file detection, curriculum resolution, batch write
- **Soft delete:** trash/restore/purge via `question-delete.ts`
- **Bookmarks:** per-user folders in Firestore subcollections

### 5.4 Curriculum

- Hierarchical tree: class → subject → chapter → topic
- Archive/restore lifecycle on chapters and topics
- Seeding and workspace insights
- Bilingual naming support in data model

### 5.5 Blueprints

- Library, detail view, author/editor
- Default RBSE templates (unit/half-yearly/annual structures)
- Duplicate-to-customize flow
- Bridge from blueprint → paper setup with frozen `blueprintSnapshot`

### 5.6 Paper Builder (composition)

- Setup flow: metadata, medium, sections, instructions
- Repository browser with assignment-scoped filters for teachers
- Section-based composition with drag/reorder, replace, remove
- **Auto-generation engine** (`paper-generation-engine.ts`): presets, difficulty balancing, chapter spread
- Autosave to Firestore `papers/{id}`
- Submit for approval with validation (missing questions, marks, title)
- Read-only modes for submitted/approved (teachers)

### 5.7 Examination Editor (formatting)

- Route: `/app/builder/:paperId/editor`
- Three-column layout: navigator, editable print preview, inspector
- Standard / Advanced layout modes with confirmation dialog
- `PaperFormatConfig` v1: margins, density, typography, header presets, smart fit
- Per-question and per-section instance overrides
- Inline marks editor, spacing chips, section reorder, hide questions
- Persistence via `instanceLayer` — never mutates repository questions
- Leave dialog + dirty fingerprint + `beforeunload`

See [`paper-editing-current-state.md`](./paper-editing-current-state.md) for the authoritative editor feature list.

### 5.8 Print, preview & export

- Official print DOM (`OfficialPrintDocument`) shared between editor and preview
- Pagination engine with height estimation + safety multiplier
- PDF via html2canvas + jsPDF (approved papers only)
- DOCX via `docx` package (`paper-docx-export.ts`)
- Export menu supports PDF and Word from preview
- School branding from `workspace_settings`

### 5.9 Approval workflow

- Admin queue with submitted/approved tabs
- Review panel with validation checklist (marks, time, sections)
- Approve & lock (sets `approved` status)
- Reopen as draft (admin)
- Workflow notifications on submit/approve/reopen

### 5.10 Organization & settings

- Teacher management: add, assignments, active flag, pending profiles
- Workspace settings: school name, logo, affiliation, header preview
- User profile: photo (data URL / storage rules ready), preferences, activity stats

### 5.11 Reliability features (recent / in progress)

| Feature | Files | Status |
|---------|-------|--------|
| Connectivity banner | `ConnectivityContext`, `ConnectivityBanner` | Implemented |
| Local draft autosave | `draft-recovery.ts`, `useLocalDraftAutosave` | Implemented |
| Save confidence labels | `save-confidence.ts`, `SaveStatusMorph` | Implemented |
| Editor tab lock | `editor-tab-lock.ts`, `useEditorTabLock` | Implemented |
| Workflow scroll continuity | `workflow-continuity.ts` | Implemented |

---

## 6. What Is Missing (From Plan)

These are explicit requirements in [`PLAN.md`](./PLAN.md) not yet implemented or only partially done.

### 6.1 Paper lifecycle & workflow

| Planned | Current | Gap |
|---------|---------|-----|
| `under_review` status when admin opens review | No distinct state | Admin review uses `submitted` |
| Explicit **reject with admin comments** | Only "Reopen as draft" | No `reviewComment` field, no rejection UX |
| `locked` status after approval | `approved` used as terminal lock | Semantic mismatch; no separate lock step |
| `exported` status after PDF | Not tracked | No export audit trail |
| Teacher edits rejected paper with visible comments | Reopen clears to draft silently | No comment thread or checklist |

### 6.2 Export & sets

| Planned | Current |
|---------|---------|
| Answer key PDF alongside paper | **Not implemented** — zero code references |
| Paper sets A/B/C/D with shuffled questions/options | **Not implemented** |
| Generate sets only after approval | N/A |

### 6.3 Content & authoring tooling

| Planned | Current |
|---------|---------|
| TipTap v2 rich text editor | Plain textarea / input fields |
| KaTeX equations in questions | **Not implemented** |
| Question images via Firebase Storage | Data model supports URLs; limited UI upload flow |
| Duplicate detection across repository | Bulk import only; no global dedup UI |

### 6.4 Bulk import behavior

| Planned | Current |
|---------|---------|
| Import valid rows as **draft** | `execute-import.ts` sets `status: 'published'` |
| Admin reviews then publishes | Skipped — immediate publish |

### 6.5 Architecture & routing

| Planned | Current |
|---------|---------|
| Separate admin/teacher route trees | Unified shell; `AdminRoute` for admin-only pages |
| `activityLog` collection | **Not implemented** |
| AI mock service (`services/ai/`) | **Not implemented** |
| `utils/permissions.ts` centralized RBAC | Ad-hoc checks in components/hooks |

### 6.6 Polish phase

| Planned | Current |
|---------|---------|
| Mobile responsive pass | Intentionally blocked with mobile gate |
| Hindi UI labels (i18n system) | English UI only; bilingual **content** supported |
| Automated tests | **None** |
| Deploy to Vercel | Config present (`vercel.json`); deployment assumed manual |

### 6.7 Plan says "NOT building" but exists anyway

| PLAN exclusion | Reality |
|----------------|---------|
| Notification systems | Built — panel, Firestore rules, workflow notifications |

This is not a bug, but creates **scope confusion** for future planning.

---

## 7. What Is Missing (From Editor Specs)

Consolidated from [`paperEditor.md`](./paperEditor.md), [`editorPart2.md`](./editorPart2.md), and [`paper-editing-current-state.md`](./paper-editing-current-state.md).

### 7.1 Not implemented (high impact)

- Block tree model with typed `BlockLayout` per node
- Floating toolbar on every block type
- Drag-to-resize margins
- Ornamental / styled divider system (only `on/off/subtle` type exists)
- Exam info table layout controls (compact/row/border styles)
- Page size / orientation / columns UI
- CBSE/ICSE/institutional template gallery + save custom template
- Spacing visualization overlay
- Inline edit of question body (by design — repo-only content)
- Undo / redo command stack
- Zustand format store (uses React session state instead)
- Institutional preset locking (admin locks formatting for teachers)
- Advanced pagination: orphan rules, keep sub-questions together, min questions/page, "reduce to N pages"
- 2-column section layout (`startOnNewPage`, `columns` in types — not wired)
- MCQ gap / sub-question indent sliders in inspector
- Switching Advanced → Standard clears overrides (spec says it should)
- 4 independent margin sliders in Advanced (linked only today)
- Full `InheritableValue` override map with dot indicators on all controls

### 7.2 Partially implemented

- Two-tier Standard / Advanced mode ✅
- Continuous sliders with warning ranges ✅
- Header presets + Smart Fit ✅
- Per-block inspector sliders ✅
- CSS custom property bridge ✅
- Header repeat modes ✅
- Basic height-based pagination ✅
- DOCX export ✅ (exists but not at spec fidelity — plain paragraphs, not full layout fidelity)

---

## 8. What Is Missing (Not in Plan — Recommended)

High-value additions identified during this audit that should be on the roadmap explicitly:

1. **CI/CD pipeline** — typecheck, scoped lint, build, smoke tests on every PR
2. **Firestore rules: teacher active/assignment enforcement** — currently UI-only via `useTeacherScope`
3. **Export audit trail** — who exported what, when, which format
4. **Approval comment / rejection reason** — even if status stays `draft` on reopen
5. **Post-import verification dashboard** — summary after bulk import batch
6. **Cross-linking** — curriculum node → filtered repository; paper → source questions
7. **Observability** — centralized error logging (Sentry or similar), failed provisioning alerts
8. **Bundle optimization** — dynamic import for export libs, editor, xlsx
9. **README + onboarding doc** — replace Vite boilerplate
10. **Sync PLAN.md and Architecture.md** — or mark them archived with pointer to this audit
11. **Production guard for `VITE_DEV_ROLE`** — fail build if set in production env
12. **Composite Firestore indexes** — approval queue uses client-side filter over 150 docs

---

## 9. Major Issues & Bugs

Severity: **Major** = breaks workflow, security risk, data integrity risk, or MVP blocker.

### 9.1 Product / functional

| ID | Issue | Impact | Location |
|----|-------|--------|----------|
| M-01 | **No answer key export** | MVP criterion 6 unmet | Export pipeline has paper PDF/DOCX only |
| M-02 | **No reject-with-comment flow** | Admins cannot formally reject; teachers get no guidance on reopen | `ApprovalReviewPanel` — approve/reopen only |
| M-03 | **Bulk import publishes immediately** | Bypasses draft review workflow from plan; quality risk | `lib/bulk-import/execute-import.ts` |
| M-04 | **Paper lifecycle simplified vs plan** | No `under_review`, `locked`, `exported`; "Approve & lock" sets `approved` only | `types/paper.ts`, `papers.ts` |
| M-05 | **No TipTap/KaTeX** | Math/science papers cannot render equations as specified | Entire authoring stack |
| M-06 | **No paper sets A/B/C/D** | Planned exam security feature missing | Not started |
| M-07 | **Activity log not implemented** | No audit trail for approvals, publishes, exports | Plan schema only |

### 9.2 Security & authorization

| ID | Issue | Impact | Notes |
|----|-------|--------|-------|
| M-08 | **Teacher active/assignment not in Firestore rules** | Inactive or unassigned teacher could bypass UI via direct API | Rules allow any authenticated paper create; UI gates only |
| M-09 | **`VITE_DEV_ROLE` auto-creates user doc** | If leaked to production build, unintended role assignment | `users.ts` `ensureUserProfile()` |
| M-10 | **Users without profile get null role** | Correct behavior, but Firebase Auth alone can sign in until `ProfileSetupRequired` — ensure all routes check `profileReady` | Verify all write paths |

> **Note:** May 2026 P0 items (admin escalation via missing role, open school-asset writes, notification spoofing) appear **remediated** in current `firestore.rules` and `storage.rules`.

### 9.3 Performance & scale

| ID | Issue | Impact |
|----|-------|--------|
| M-11 | **2.7 MB main bundle** | Slow first load; Vite warns about chunk size |
| M-12 | **Approval queue client-side filter** | Fetches 150 papers, filters in JS — won't scale |
| M-13 | **html2canvas PDF** | Quality/performance issues on long papers; known limitation vs server PDF |

### 9.4 Engineering

| ID | Issue | Impact |
|----|-------|--------|
| M-14 | **Zero automated tests** | Regressions slip through despite green build |
| M-15 | **ESLint excludes all TS/TSX** | 898 lint errors unaddressed in app code; only prototypes/errors in lint run |
| M-16 | **No `typecheck` script** | TS errors only caught at build time |

---

## 10. Minor Issues & Quality Gaps

| ID | Issue | Area |
|----|-------|------|
| m-01 | `README.md` is Vite boilerplate | Docs |
| m-02 | `PLAN.md` / `Architecture.md` contradict codebase | Docs |
| m-03 | Legacy `PaperEditingWorkspace.tsx` unused in routes | Dead code |
| m-04 | Plan lists notifications as out-of-scope but built | Scope clarity |
| m-05 | Repository lifecycle maps `locked` questions to "inReview" label | UX terminology |
| m-06 | No `reviewComment` / rejection reason persisted | Workflow |
| m-07 | Teacher inactive banner in shell but not enforced on writes | UX vs security |
| m-08 | `listApprovalQueue` includes approved papers in queue fetch | Minor inefficiency |
| m-09 | Export filename pattern may not match all exam types | Polish |
| m-10 | Editor: divider mode in schema, no inspector control | Incomplete UI |
| m-11 | Editor: page size/orientation in schema, no UI | Incomplete UI |
| m-12 | `FORMAT_CONFIG_VERSION = 1` with no migration runner | Future risk |
| m-13 | Mock data still in `src/data/` for some widgets | Tech debt |
| m-14 | ESLint 901 errors dominated by `paperCraftUIDesign/` prototypes | Tooling config |
| m-15 | No duplicate question detection in repository UI (only import) | Plan feature gap |
| m-16 | Classes 9–12 subjects marked `isActive: false` in catalog | Phase 2 prep — document clearly |
| m-17 | Storage rules exist but profile photos use Firestore data URLs on Spark | Document deployment path |
| m-18 | Inline `no-undef` for `React` in design prototype files | Lint noise |

---

## 11. Areas of Improvement (By Domain)

### 11.1 Question Repository

- Richer lifecycle timeline on question cards (published → locked → archived)
- Global duplicate detection before publish
- Bulk publish/unpublish/lock from selection
- Image upload UX with Storage integration when on Blaze
- Cross-links from curriculum tree to filtered repository view
- Consistent empty/error/loading states (partially done via `EmptyStatePanel`)

### 11.2 Paper Builder

- Clearer teacher vs admin capability messaging on submitted papers
- Post-generation review step showing unfilled blueprint slots
- Chapter/difficulty balance visualization improvements
- Warn when blueprint snapshot diverges from live blueprint edits

### 11.3 Examination Editor

- Implement undo/redo (highest teacher UX win from spec backlog)
- Page setup UI (size, orientation)
- Divider controls
- Pagination hardening (orphan/widow rules)
- DOCX layout fidelity closer to print preview
- Remove or archive legacy `PaperEditingWorkspace`

### 11.4 Approval & Paper Library

- Reject-with-comment modal → notification to teacher
- Distinct `under_review` when admin opens paper (optional)
- Status timeline component (draft → submitted → approved → exported)
- Answer key export toggle in export menu
- Filter papers by status, teacher, class, subject in library
- Archive old papers (status exists in rules but underused in UI)

### 11.5 Teachers & Organization

- Server-side or rules-side enforcement of `active` and assignments
- Cloud Function for teacher provisioning with compensation on partial failure
- Admin diagnostics for failed imports / orphan `teacher_pending` records

### 11.6 Design & UX

- Continue aligning with `DESIGN.md` — analytics surfaces use cool bg token
- Tablet editor collapse CSS exists — verify breakpoints
- Hindi UI pass (even partial: nav labels, status chips, form labels)
- Guided fix flow for reopened papers

### 11.7 Performance

- Code-split: `jspdf`, `html2canvas`, `docx`, `xlsx`, editor route
- Firestore query optimization for approval queue (composite index on `status` + `submittedAt`)
- Consider lazy-loading examination editor workspace

---

## 12. Areas Still to Implement (Roadmap)

Grouped by priority tier.

### Tier 1 — MVP closure (1–2 weeks)

1. Answer key export (PDF section or separate document)
2. Reject/reopen with admin comment + teacher notification
3. Bulk import → draft by default (admin publish step)
4. Update `PLAN.md` module statuses to match reality

### Tier 2 — Workflow completeness (2–4 weeks)

5. Paper export status tracking (`exportedAt`, optional `exported` status)
6. Post-approval lock semantics (clarify `approved` vs separate `locked`)
7. Paper sets A/B/C/D generator
8. Activity log collection + Control Center feed integration
9. Firestore rules: teacher `active` + assignment checks on paper/question reads

### Tier 3 — Editor spec (4–8 weeks)

10. Undo/redo stack
11. Page setup UI + divider controls
12. Pagination edge-case catalog (from `editorPart2.md` §14–15)
13. Institutional preset locking
14. Template gallery (CBSE/RBSE/compact presets)

### Tier 4 — Content platform (parallel track)

15. TipTap + KaTeX integration in question author
16. Image upload to Storage
17. AI mock service interface (duplicate suggest, auto-fill metadata)

### Tier 5 — Engineering maturity (ongoing)

18. CI: typecheck + scoped lint + build + smoke tests
19. Vitest unit tests for pure libs (`paper-generation-engine`, `validate-rows`, `paper-submission`)
20. README and developer onboarding
21. Bundle splitting and performance budget

### Tier 6 — Phase 2 / SaaS prep

22. Multi-tenant `tenantId` in service layer
23. Classes 9–12 activation
24. Mobile strategy (support vs permanent desktop-only policy)
25. Full Hindi i18n

---

## 13. Security & Authorization Status

### 13.1 Fixed since May 2026 audit ✅

| Item | Fix |
|------|-----|
| Admin escalation via missing role | `isAdmin()` requires explicit `role == 'admin'` |
| Client admin fallback | `user-profile.ts` returns null if role not admin/teacher |
| Open school-asset storage writes | `storage.rules` — admin only |
| User self-role escalation | `privilegedUserFieldsUnchanged()` on self-update |
| Notification spoofing (cross-user) | `trustedNotificationCreate()` + self-only default |

### 13.2 Still open ⚠️

| Item | Risk | Recommendation |
|------|------|----------------|
| Teacher inactive bypass | Medium | Add rules checks or Cloud Function guards |
| Teacher assignment bypass | Medium | Validate `createdBy` + assignment scope on paper reads/writes |
| `VITE_DEV_ROLE` in prod | High if misconfigured | Build-time assertion; never set in Vercel prod |
| No server-side privileged ops | Medium | Cloud Functions for approve, bulk import, teacher provision |
| Client-side PDF/export only | Low | Accept for Phase 1; document trust model |

### 13.3 Firestore rules coverage summary

| Collection | Read | Write |
|------------|------|-------|
| `questions` | Teachers: published only; Admin: all | Admin only; status transitions validated |
| `papers` | Owner or admin | Status transition validators; teacher draft/submit only |
| `users` | Self or admin | Self: profile fields only; admin: full |
| `blueprints` | All auth | Admin |
| `curriculum_*` | All auth | Admin |
| `notifications` | Self | Self or trusted workflow types |
| `workspace_settings` | All auth | Admin |

---

## 14. Engineering & Release Quality

### 14.1 Current scripts

```bash
npm run dev       # Vite dev server
npm run build     # ✅ Passes
npm run lint      # ❌ 901 problems
npm run preview   # Production preview
npm run seed:questions  # Firestore seed script
```

**Missing scripts:** `test`, `typecheck`, `lint:app` (scoped to `src/`)

### 14.2 ESLint configuration gap

`eslint.config.js` only lints `**/*.{js,jsx}`. The entire TypeScript application under `src/**/*.tsx` is **excluded**.

Recommended split:

- `eslint.config.js` → lint `src/**/*.{ts,tsx}` with `typescript-eslint`
- Ignore `paperCraftUIDesign/` in globalIgnores

### 14.3 Test coverage

| Type | Count |
|------|-------|
| Unit tests | 0 |
| Integration tests | 0 |
| E2E tests | 0 |
| Test frameworks in package.json | None |

Critical pure functions deserving first tests:

- `validatePaperForSubmission`
- `paper-generation-engine` slot selection
- `validate-rows` bulk import
- `adminPaperUpdateAllowed` / status transition mirrors (rules unit tests via emulator)

### 14.4 Build output concerns

- Single chunk ~2.7 MB — export and editor libraries should be dynamically imported
- No source map policy documented for production

---

## 15. Schema & Naming Drift

| Concept | PLAN.md | Implemented |
|---------|---------|-------------|
| Papers | `questionPapers/{id}` | `papers/{id}` |
| Blueprints | `examBlueprints/{id}` | `blueprints/{id}` |
| School settings | `schoolConfig/main` | `workspace_settings/{docId}` |
| Subjects/chapters | Flat `subjects`, `chapters` | Nested `curriculum_*` collections |
| Paper status enum | 6 values | 4 values |
| Question status enum | 4 values | 4 values ✅ |
| User assignments | `assignedClasses`, `assignedSubjects` | `assignments[]` + `assignmentScope` |

Migration note: No migration scripts exist for legacy doc shapes if early prototypes wrote to old collection names.

---

## 16. In-Progress Work (Uncommitted)

Based on git status at audit time — reliability/offline UX sprint:

| Area | New/modified files | Intent |
|------|-------------------|--------|
| Connectivity | `ConnectivityContext`, `connectivity.ts`, `ConnectivityBanner` | Offline detection + user messaging |
| Draft recovery | `draft-recovery.ts`, `useLocalDraftAutosave`, `DraftRecoveryBanner` | Local autosave when Firestore sync fails |
| Editor tab lock | `editor-tab-lock.ts`, `useEditorTabLock` | Prevent dual-tab edit conflicts |
| Save confidence | `save-confidence.ts`, `SaveStatusMorph` | Unified save status copy |
| Workflow continuity | `workflow-continuity.ts` | Restore scroll position across navigation |
| Firebase hardening | `firestore.rules`, `storage.rules`, `users.ts`, `user-profile.ts` | Security fixes from May audit |
| Repository/builder polish | Multiple workspace/toolbar components | UX refinements |

**Recommendation:** Finish and commit this sprint before new feature work — it directly addresses trust and data loss concerns.

---

## 17. Suggested Execution Order

### Wave 1 — Trust & MVP (immediate)

1. Commit in-progress reliability/security work
2. Answer key export
3. Reject-with-comment on reopen
4. Bulk import default to draft
5. Add CI with `tsc --noEmit` + `build`

### Wave 2 — Workflow & docs (next)

6. Update `PLAN.md` and `Architecture.md` (or archive with redirect)
7. Paper library export audit + status timeline
8. Firestore teacher constraint rules
9. Approval queue indexed query

### Wave 3 — Editor & content (following)

10. TipTap + KaTeX in question author
11. Editor undo/redo + page setup UI
12. Paper sets A/B/C/D

### Wave 4 — Maturity (ongoing)

13. Test suite for core libs
14. Bundle splitting
15. Activity log + observability

---

## 18. Document Maintenance Recommendations

| Document | Action |
|----------|--------|
| `PLAN.md` | Rewrite module statuses, phase table, schema names, bulk import behavior, notifications scope |
| `Architecture.md` | Rewrite "Current development phase", routing table, data layer sections to match `src/` |
| `paper-editing-current-state.md` | Update when editor features ship; add "Shipped" notes with file pointers |
| `APP_DEEP_DIVE_AUDIT_2026-05-27.md` | Add header: "Historical — see COMPREHENSIVE_AUDIT_2026-06-14.md" |
| `README.md` | Replace with product overview, env setup, scripts, link to docs |
| **This file** | Re-run audit after each major milestone; target monthly during active development |

---

## Appendix A — Route Map (Implemented)

| Path | Page | Access |
|------|------|--------|
| `/login` | Login | Public |
| `/app` | Control Center | Auth |
| `/app/repository` | Question Repository | Auth |
| `/app/repository/new`, `/:id/edit`, `/import` | Question author / bulk import | Admin |
| `/app/curriculum` | Curriculum | Auth |
| `/app/blueprints`, `/:id`, `/new`, `/:id/edit` | Blueprints | Auth / admin for edit |
| `/app/builder/new` | Paper setup | Auth |
| `/app/builder`, `/app/builder/:paperId` | Paper Builder | Auth |
| `/app/builder/:paperId/editor` | Examination Editor | Auth |
| `/app/papers` | Paper library | Auth |
| `/app/papers/:paperId/preview` | Print preview | Auth |
| `/app/approvals`, `/:paperId` | Approval queue / review | Admin |
| `/app/teachers` | Teachers | Admin |
| `/app/settings` | Workspace settings | Admin |
| `/app/profile` | User profile | Auth |
| `/app/bookmarks` | Bookmarks | Auth |

---

## Appendix B — Question Types Support

| Type | In types | In author UI | In bulk import | In paper render |
|------|----------|--------------|----------------|-----------------|
| MCQ | ✅ | ✅ | ✅ | ✅ |
| True/False | ✅ | ✅ | ✅ | ✅ |
| Fill in the Blank | ✅ | ✅ | ✅ | ✅ |
| Short Answer | ✅ | ✅ | ✅ | ✅ |
| Long Answer | ✅ | ✅ | ✅ | ✅ |
| Match the Following | ✅ | ✅ | ✅ | ✅ |
| Assertion/Reason | ✅ | ✅ | ✅ | ✅ |

---

## Appendix C — Verification Signals (June 14, 2026)

| Check | Result |
|-------|--------|
| `npm run build` | ✅ Pass (534ms) |
| `npm run lint` | ❌ 901 problems |
| TypeScript app files linted | ❌ No |
| Automated tests | ❌ None |
| Firestore rules file committed | ✅ Yes |
| Storage rules file committed | ✅ Yes |
| Vercel SPA config | ✅ `vercel.json` |

---

*End of audit. For editor-specific as-built detail, prefer [`paper-editing-current-state.md`](./paper-editing-current-state.md). For visual rules, prefer [`paperCraftUIDesign/DESIGN.md`](../paperCraftUIDesign/DESIGN.md).*
