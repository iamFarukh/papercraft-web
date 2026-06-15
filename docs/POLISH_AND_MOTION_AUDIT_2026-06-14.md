# PaperCraft — Polish, Motion, Performance & Production-Readiness Audit

**Date:** June 14, 2026
**Scope:** Independent re-verification of `COMPREHENSIVE_AUDIT_2026-06-14.md` + new findings on UX, motion, Lottie, performance, accessibility, and release readiness.
**Method:** Every claim below is backed by reading the actual source (`file:line`), running `npm run build`, `npx tsc --noEmit`, and `npm run lint`. Verdicts distinguish CONFIRMED / REFUTED / CORRECTED.

---

## 0. Critical framing correction (read first)

The polish/motion brief is written for a **native mobile real-estate app** — it asks for "iOS and Android 60 FPS," "React Native Reanimated," "bottom sheets," "pull-to-refresh," "property saved/favorited," "property comparison," and "onboarding illustrations."

**PaperCraft is none of those.** It is a **desktop-only React 19 + Vite web SPA** for school exam-paper authoring (RBSE/CBSE), and it ships an **explicit mobile gate** (`MobileUnsupportedScreen`) that blocks small viewports by design. There is no React Native, no iOS/Android target, no "property" domain, no gestures/pull-to-refresh surface.

**Consequence:** the *intent* of the brief (premium, smooth, polished, intentional motion) is valid and is addressed below — but translated to the real product:

| Brief asks for (mobile) | PaperCraft equivalent (what this audit delivers) |
|---|---|
| Native screen/tab transitions, Reanimated | Route transitions via existing `framer-motion` `AnimatePresence` (already built, unused — see M-NEW-01) |
| Bottom sheets, pull-to-refresh, gestures | Drawers/modals, manual refresh, hover/scroll affordances |
| 60 FPS on iOS/Android | 60 FPS in-browser; transform/opacity-only animations; code-splitting |
| Property saved/shared/compared animations | Question bookmarked, paper approved/exported, bulk-import-complete animations |
| Onboarding illustrations | First-run / empty-repository / "create your first paper" illustrations |

If a true mobile/native app is actually planned, that is a **net-new product**, not a polish pass — flag it before any of this work starts.

---

## 1. Verification of the existing audit

The existing `COMPREHENSIVE_AUDIT_2026-06-14.md` is **high quality and largely accurate.** Verdicts:

| Existing claim | Verdict | Evidence |
|---|---|---|
| No answer key export (M-01) | ✅ CONFIRMED | `paper-export-formats.ts:3` only `'pdf'|'docx'`; data exists (`question.ts:61-64` `answer`/`solution`) but no export path. Capability is one step away. |
| Bulk import publishes immediately (M-03) | ✅ CONFIRMED | `execute-import.ts:128` hardcodes `status:'published'`; service default `bulk-import.ts:38`. |
| Paper lifecycle = 4 states (M-04) | ✅ CONFIRMED | `paper.ts:9` `'draft'|'submitted'|'approved'|'archived'`. `locked` exists only for *questions*. |
| No reject-with-comment (M-02) | ✅ CONFIRMED | `papers.ts` has `approvePaper`/`reopenPaperAsDraft`, no reject; no `reviewComment` field anywhere. |
| Approval queue client-side filter (M-12) | ✅ CONFIRMED **+ worse than stated** | `papers.ts:96-116` `limit(150)` then JS filter/sort/`slice(80)`. **Submitted papers ranked beyond the 150 most-recently-*updated* are silently dropped from the queue** — a correctness bug, not just inefficiency. |
| No TipTap/KaTeX (M-05) | ✅ CONFIRMED | No deps; `AuthorCanvas.tsx` plain `<textarea>`. |
| ESLint excludes TS/TSX (M-15) | ✅ CONFIRMED **+ corrected** | `eslint.config.js` lints only `**/*.{js,jsx}`; `typescript-eslint` not even installed. **The entire `src/` (299 files) is unlinted.** The "901 problems" are 100% from `paperCraftUIDesign/` throwaway prototypes — the headline number is real but misleading. |
| No tests / no typecheck script (M-14, M-16) | ✅ CONFIRMED | No vitest/jest; no `test`/`typecheck` script; `vite build` runs no `tsc`. |
| 2.7 MB main bundle (M-11) | ✅ CONFIRMED | Build: `index-*.js` **2,708 kB (gzip 803 kB)** single chunk + 273 kB CSS. Vite emits the >500 kB warning. |
| `VITE_DEV_ROLE` risky (M-09) | ✅ CONFIRMED (latent) | `users.ts:65` self-provisions `users/{uid}` with dev role; `.env.example` ships `VITE_DEV_ROLE=admin`. Firestore rules block the *DB write*, but **client-side role still elevates to admin in-memory**, exposing admin UI. Vite inlines `VITE_*` at build time. |
| Teacher active/assignment not in rules (M-08) | ✅ CONFIRMED | `isTeacher()` checks only `role=='teacher'`; never reads `active`/`assignments`. Deactivation is UI-only. |
| `isAdmin()` strict, no secrets committed, `.gitignore` correct | ✅ CONFIRMED | Config env-driven (`lib/firebase.ts`); `.env` git-ignored; only `.env.example` tracked. |
| Legacy `PaperEditingWorkspace.tsx` is dead code (m-03) | ✅ CONFIRMED | Defined, zero imports/routes. |

**One correction to the existing audit's tone:** it implies the code may not typecheck. **It does** — `npx tsc --noEmit` returns **zero real type errors** (the single `TS5101` is a `baseUrl` deprecation notice in `tsconfig.json`, not a code error). The risk is the *absence of a gate*, not existing breakage.

### New / under-stated issues found during verification

- **NEW — Approval queue data loss (upgrade M-12 to release-blocking):** beyond scale, the `limit(150)` + client filter means a 151st-oldest submitted paper never appears in the admin queue. Needs a composite index on `status` + `submittedAt`.
- **NEW — Blueprint snapshot drift:** `paper.ts:75` keeps both frozen `blueprintSnapshot` and live `blueprintId/Version`; comment admits they can diverge silently. No reconciliation/warning UI.
- **NEW — `radix-ui` is installed but never imported.** All dialogs/drawers are hand-rolled `framer-motion`. Either adopt it (free focus-trap/scroll-lock/a11y) or drop the dep.
- **NEW — No CI** (`.github/workflows` absent), so nothing runs typecheck/build/lint on PRs.

---

## 2. UX & product polish findings

Foundation is genuinely strong (real `--pc-*` token system, bespoke per-context skeletons, shared `EmptyStatePanel`, unsaved-changes guards, 86 `aria-label`s). The "unfinished feel" comes from a few **systemic** gaps:

### Critical
- **UX-C1 — No global `ErrorBoundary`.** `App.tsx` has none; `grep ErrorBoundary src` = 0. Any render throw on any screen = white page, no recovery.
- **UX-C2 — Toast system has no error tone.** `ToastContext.tsx:12` `ToastTone = 'success'|'info'|'neutral'`; `toast.css` only styles success (green) + info (blue). **Failures are pushed as `'info'` and render calm blue** — a failed import (`BulkImportWizard.tsx:420,445,475`) looks identical to "Question restored." `DESIGN.md` defines `--pc-danger` and it's unused. (Bonus: `toast.css:39` uses raw `rgb(34 197 94)`, not the brand `--pc-success`.)
- **UX-C3 — No `:focus-visible` anywhere.** 0 `focus-visible` rules across all CSS, but **19 `outline:none`** declarations suppress the native ring with no replacement. Keyboard focus is invisible on buttons, tabs, tree rows, nav, segmented controls. `--pc-ring-primary` exists but is never wired. This is a WCAG 2.4.7 failure.

### High
- **UX-H1 — `CurriculumTreePanel` has no error state.** Handles loading + empty only; a failed fetch renders as "No curriculum entries yet" (misleads failure as empty).
- **UX-H2 — Token drift in newer CSS.** `bulk-import.css` (26 hardcoded hex), `paper-print.css` (19 hex), plus `paper-examination-editor.css:391 background:#8b5cf6` — a **violet**, directly violating `DESIGN.md §13` ("cobalt only, no indigo/violet drift"). Off-brand greens/blues duplicate existing tokens at slightly wrong values.
- **UX-H3 — `aria-invalid` used 0 times.** Forms show errors visually (`role="alert"` in question author — good) but never mark the offending field, so SR users aren't told *which* field failed. Required-field marking is ad-hoc (only `TeacherFormDialog`).

### Medium
- **UX-M1 — Button-class proliferation.** `DESIGN.md` defines one `.pc-btn` system, but ~12 parallel icon-button classes (`pc-icon-btn`, `pc-q-card-icon-btn`, `pc-ee-surface-btn`, `pc-fmt-segment-btn`, …) each re-derive padding/radius/hover. This is the main source of subtle visual inconsistency *and* multiplies where the focus ring must be added.
- **UX-M2 — Missing skeletons on `PapersListPage` and `ApprovalSubmissionQueue`** (repository/dashboard have them; these don't).
- **UX-M3 — Success feedback is silent in places** — several mutations complete without confirmation; standardize on toasts.

### What's already good (don't redo)
Consistent skeleton loading system, strong `prefers-reduced-motion` coverage, unsaved-changes guards in heavy editors, `DraftRecoveryBanner`, `ConnectivityBanner`, clean loading/error/empty on `PapersListPage`/`BlueprintWorkspace`/`RepositoryWorkspace`.

---

## 3. Motion & animation findings

**There is a real, centralized motion system** (`src/lib/motion/tokens.ts` = durations/eases, `variants.ts` ≈ 20 shared variants, `LazyMotion features={domAnimation} strict` in `App.tsx:37`, `useReducedMotion` in 16 components, `layoutId` shared-element nav pills). The problem is **application gaps**, not foundation.

### Critical
- **M-NEW-01 — Route transitions are built but never wired (everything hard-cuts).** `components/motion/PageTransition.tsx` + `lib/motion/page-key.ts` exist and are exported, but `grep PageTransition` finds zero usages. `App.tsx:42` `<Routes>` has no `AnimatePresence`; `AppLayout.tsx:81` renders a bare `<Outlet/>`. **Activating dead code fixes the single most-felt "not premium" issue.**
- **M-NEW-02 — `ConfirmDialog` exit animation is silently broken.** `ConfirmDialog.tsx:30` does `if(!open) return null` while declaring `exit="exit"`, but it's **not wrapped in `AnimatePresence`** (caller `Sidebar.tsx:254`). It pops out instantly. Contrast `DeleteConfirmDialog` (correct pattern, wrapped in `AnimatePresence` at `RepositoryWorkspace.tsx:644`). The two dialogs use opposite mounting contracts — pick one.

### High
- **M-H1 — Lists don't animate enter/exit/reorder.** `QuestionStream.tsx:120`, `ApprovalSubmissionQueue.tsx:113`, `PapersListPage.tsx:138` map static rows (CSS hover only). Shared `MotionList`/`MotionListItem` exist but are used only by `ActivityFeed`. Deleting/filtering a question hard-removes it.
- **M-H2 — Decide on `radix-ui`** (see §1) — affects modal/drawer animation correctness and a11y.

### Medium / Low
- **M-M1 — Micro-interactions sparse & inconsistent.** Only 4 files use `whileHover/whileTap`; the rest rely on a global CSS `.pc-btn:active{scale .98}`. Both are fine individually but mixed with no rule. Standardize.
- **M-M2 — Paint-bound animations.** `ProfilePhotoControl.tsx:66` animates `box-shadow` (and a CSS var, which won't interpolate — it snaps). `QuestionCard.tsx:142` animates `boxShadow/borderColor/backgroundColor` (only on select, low impact). Prefer transform/opacity.

### Already good
Token-driven durations/eases, `LazyMotion` bundle discipline, strong reduced-motion handling, animated shimmer skeletons, `layoutId` nav indicators.

---

## 4. Lottie animation roadmap (web-adapted)

**Library recommendation:** `@lottiefiles/dotlottie-react` (dotLottie = ~80% smaller than JSON, built-in lazy/visibility play) **lazy-imported only on the surfaces that use it**, so it never enters the main bundle. Hard rule given the existing 2.7 MB bundle: **no Lottie eager-imported; every player behind `React.lazy`/dynamic `import()`; respect `prefers-reduced-motion` (render a static frame/illustration instead).**

Complexity legend: **S** = simple loop (<30 KB), **M** = moderate, **L** = rich (use sparingly, decode cost).

| # | Animation | Placement | Trigger | Purpose / UX impact | Complexity |
|---|---|---|---|---|---|
| 1 | App boot / splash | Initial `Suspense` fallback while lazy chunks load | App mount | Replaces blank flash with branded load; sets premium tone | S–M |
| 2 | Auth processing | `LoginPage` submit | Sign-in in flight | Perceived speed during Firebase round-trip | S |
| 3 | First-run / empty repository | `RepositoryWorkspace` `isEmptyDb` | No questions yet | Onboarding nudge → "Import / create first question" | M |
| 4 | No search results | `QuestionStream` empty after filter | Filter yields 0 | Distinguishes "no match" from "no data"; reduces dead-end feel | S |
| 5 | Empty papers / approvals | `PapersListPage`, `ApprovalSubmissionQueue` empty | No items | Calm empty states (currently plain) | S |
| 6 | Offline / no connection | `ConnectivityBanner` | `ConnectivityContext` offline | Reassures vs. alarms; pairs with existing banner | S |
| 7 | Server / load error | `EmptyStatePanel variant="error"`, ErrorBoundary fallback | Fetch/render error | Friendly recovery vs. white page | S |
| 8 | Paper **approved** success | Approval action confirm | `approvePaper()` resolves | Signature "moment of delight" on the key workflow win | M |
| 9 | Question **bookmarked** | `QuestionCard` bookmark toggle | Add to folder | Tactile micro-feedback (the app's "favorite") | S |
| 10 | Bulk import complete | `BulkImportWizard` final step | Batch write resolves | Celebrates a heavy multi-step task | M |
| 11 | PDF/DOCX export progress + done | `PaperExportMenu` | Export start→finish | Covers the slow html2canvas pass; turns a jank window into intentional feedback | S→M |
| 12 | Submit-for-approval | Paper builder submit | `submitPaperForApproval()` | Confirms a consequential state change | S |
| 13 | Generic save/sync pulse | reuse in `SaveStatusMorph` | Autosave cycle | Subtle confidence cue (could stay CSS) | S |

**Anti-patterns to avoid:** no looping animation behind primary content; no Lottie in list items (use framer `layout` instead — §3); cap any single `.lottie` at ~50 KB; preload only #1–2, lazy the rest.

---

## 5. Performance roadmap

### Critical
- **P-C1 — Zero code splitting.** `App.tsx:11-33` statically imports all 20 pages; no `React.lazy`/`Suspense`/dynamic `import()` anywhere. Heavy libs are eagerly bundled into the 2.7 MB chunk: `jspdf`+`html2canvas` (`paper-pdf-export.ts`), `docx` (`paper-docx-export.ts`), `xlsx` (`bulk-import/parse-file.ts`). Worse, `paper-export.ts` is a **barrel** that pulls pdf+docx together, so any importer drags all of it. **Fix:** `lazy()` route pages; `await import()` the export/xlsx libs at call time; add `manualChunks` (firebase, framer-motion, export libs). Expected: main chunk roughly halved, export/import code off the critical path.

### High
- **P-H1 — No list virtualization + unbounded growth.** No windowing lib installed. `useQuestions.ts:94` accumulates pages (`[...prev, ...mapped]`, 50/page) while `QuestionStream.tsx:120` maps the full array into framer-motion `QuestionCard`s. `CurriculumTreePanel` renders the entire class→subject→chapter→topic tree at once. Add `@tanstack/react-virtual` to the repository list (and paginated canvas).
- **P-H2 — No memoization anywhere.** `grep memo( src/components` = 0. Every keystroke in repository search re-renders every card (each mounting framer-motion). Memoize `QuestionCard`/`PaperQuestionBlock`/`BuilderPrintBlock`.
- **P-H3 — Inline closures defeat memoization.** `PaperBuilderPaginatedCanvas.tsx:223-226` and `QuestionStream.tsx:131-134` recreate `onRemove/onReplace/onMoveUp/onMoveDown` per item every render — even though upstream handlers are `useCallback`'d. **H2 + H3 must be fixed together** or neither helps.

### Medium
- **P-M1 — Unbounded Firestore scans.** `teachers.ts:86` reads the **entire `papers` collection** (no `limit`) to count per teacher; `profile.ts:111` reads all papers/questions for a user; `curriculum-workspace.ts:67` reads 4 full collections. Add limits or aggregate via counters.
- **P-M2 — html2canvas export is main-thread bound** (`paper-pdf-export.ts:72`, `scale:2`, sequential `toDataURL` per page). Long papers jank the tab. At minimum lazy-load (P-C1); consider server-side PDF later.
- **P-M3 — Pagination engine re-runs synchronously** on every composition edit (`paper-print-layout.ts`, multi-pass while-loops). It's `useMemo`'d and DOM-free (good — no layout thrash), but watch for large papers.

### Low
- **P-L1 —** No `loading="lazy"` on the 4 `<img>` tags. **P-L2 —** Profile photos stored as ~90 KB base64 data URLs in `users/{uid}` and shipped on every `onSnapshot` profile read (`profile.ts:94`); move to Cloud Storage.

### Already good
All `onSnapshot` listeners cleaned up; count listener debounced + `limit(1)`; `AuthContext` value memoized; `questions.ts` primary query paginated with documented index fallbacks.

---

## 6. Release-blocking issues

Must fix before any public release:

1. **No global ErrorBoundary** (UX-C1) — one throw = white screen.
2. **Approval queue silently drops papers** (M-12 upgraded) — admin can't see/approve a submitted paper beyond the 150-newest-updated window. Data-correctness, not just perf.
3. **`VITE_DEV_ROLE` admin escalation path** (M-09) — remove `=admin` from `.env.example`, guard fallback behind `import.meta.env.DEV`, fail the build if set in prod.
4. **No error tone in toasts** (UX-C2) — users can't tell success from failure.
5. **Answer key export missing** (M-01) — documented MVP criterion 6 unmet.
6. **No CI / no lint coverage / no typecheck gate** (M-14/15/16) — nothing prevents regressions; add `tsc --noEmit` + scoped ESLint on TS + build in GitHub Actions.
7. **Teacher `active`/assignment not enforced in Firestore rules** (M-08) — deactivated teacher can still write via API.

---

## 7. Quick wins (high impact / low effort)

1. **Wire up `PageTransition`** — pure dead-code activation; biggest "feels premium" gain (M-NEW-01). ~1 hr.
2. **Fix `ConfirmDialog` `AnimatePresence`** (M-NEW-02). ~30 min.
3. **Add `'error'` toast tone + `.pc-toast.is-error`**, reclassify ~7 `catch→toast(...,'info')` calls (UX-C2). ~1 hr.
4. **Global `:focus-visible { box-shadow: var(--pc-ring-primary) }`** + audit the 19 `outline:none` (UX-C3). ~2 hr.
5. **`React.lazy` the 20 route pages + `Suspense`** (P-C1 first half) — large bundle win, low risk. ~2 hr.
6. **Remove `VITE_DEV_ROLE=admin` from `.env.example`** + DEV guard (M-09). ~15 min.
7. **Add `typecheck` script + a 3-step GitHub Action** (typecheck/build). ~1 hr.
8. **Delete dead `PaperEditingWorkspace.tsx`** (m-03) + decide on `radix-ui`. ~15 min.
9. **Fix the `#8b5cf6` violet** + worst hardcoded hex in `bulk-import.css` (UX-H2). ~1 hr.
10. **`CurriculumTreePanel` error state** (UX-H1). ~1 hr.

---

## 8. Long-term improvements

- TipTap + KaTeX authoring (M-05) — required for real math/science papers.
- Paper sets A/B/C/D, paper lifecycle states (`under_review`/`locked`/`exported`), reject-with-comment + activity log (M-02/04/07).
- List virtualization + memoization pass (P-H1/H2/H3).
- Lottie rollout per §4 (after code-splitting lands).
- Firestore rules: teacher `active`/assignment enforcement; Cloud Functions for privileged ops (approve, bulk import, provisioning).
- Test suite (Vitest) for pure libs: `paper-generation-engine`, `validate-rows`, `paper-submission`, rules via emulator.
- Server-side PDF to replace html2canvas.

---

## 9. Prioritized action plan (impact × effort)

### Wave 1 — Release blockers + quick wins (≈1 week)
ErrorBoundary · error toast tone · `:focus-visible` · `VITE_DEV_ROLE` guard · route `lazy()`+`manualChunks` · CI (typecheck+build) · wire `PageTransition` · fix `ConfirmDialog` · approval-queue composite index. *Highest impact-per-hour; removes every white-screen/silent-failure/escalation risk and roughly halves the bundle.*

### Wave 2 — Polish & correctness (1–2 weeks)
ESLint on TS/TSX (+ ignore prototypes) · answer-key export · list enter/exit animations + skeletons for papers/approvals · memoize leaf components + remove inline closures (paired) · token-drift cleanup (`bulk-import.css`/`paper-print.css`) · `aria-invalid` + required-field consistency · curriculum error state · unbounded-query limits.

### Wave 3 — Premium feel (2–3 weeks)
List virtualization · Lottie rollout (§4, lazy) · standardize button system + micro-interactions · lazy-load export/editor libs · move profile photos to Storage · blueprint-drift warning.

### Wave 4 — Platform depth (ongoing)
TipTap+KaTeX · paper sets + full lifecycle + reject-with-comment + activity log · teacher rules enforcement + Cloud Functions · Vitest suite · server-side PDF.

---

---

## 10. Implementation log — Wave 1 (shipped June 14, 2026)

All release blockers + quick wins implemented and verified (`npm run lint` → **0 errors**, `npx tsc --noEmit` → **clean**, `npm run build` → **passing**).

| Item | Status | Change |
|---|---|---|
| Global ErrorBoundary | ✅ | New `components/system/ErrorBoundary.tsx` — root-level + per-route (keyed by pathname), recoverable fallback. Styles in `system.css`. |
| Code splitting | ✅ | All 20 routes `React.lazy` + `Suspense` (`RouteFallback`); `vite.config` `manualChunks`. **Main chunk 2,708 kB → 131 kB** (gzip 803 → 40 kB); export/xlsx/docx now isolated chunks off the initial path. |
| Error toast tone | ✅ | `ToastTone` gains `'error'`; `.pc-toast.is-error` danger style + `role="alert"`; success/info now use brand tokens (not raw rgb); 7 `catch→info` calls reclassified to `error`. |
| `:focus-visible` ring | ✅ | Global zero-specificity ring in `theme.css` using `--pc-ring-primary` (WCAG 2.4.7). |
| `VITE_DEV_ROLE` hardening | ✅ | `devRoleOverride()` gated behind `import.meta.env.DEV`; prod builds can never elevate. `.env.example` no longer defaults to `admin`. |
| Page transitions | ✅ | Dead `PageTransition` wired into `AppLayout` via `AnimatePresence mode="wait"` + `pageMotionKey`. |
| `ConfirmDialog` exit | ✅ | Wrapped in `AnimatePresence`; exit animation now fires; reduced-motion respected. |
| Approval queue data loss | ✅ | `listApprovalQueue` now uses status-scoped indexed queries (submitted/approved) — no submitted paper dropped. New `(status, approvedAt)` composite index. Legacy scan kept as fallback. |
| Teacher `active` in rules | ✅ | `isActiveTeacher()` gates paper create/update + submit-notification. (Assignment-scope still a documented follow-up.) |
| Engineering gates | ✅ | `typecheck` script; ESLint now lints `src/**/*.{ts,tsx}` (was zero coverage), prototypes ignored; GitHub Actions CI (typecheck + lint + build); 41 real lint errors fixed; tsconfig deprecation silenced. |
| Curriculum error state | ✅ | Tree panel no longer shows misleading "empty" on fetch failure. |
| Off-brand violet | ✅ | `#8b5cf6` → `--pc-override` token (on-brand amber); dead `PaperEditingWorkspace.tsx` deleted. |

## 11. Implementation log — Wave 2 + Lottie (shipped June 14, 2026)

Verified green (`lint` 0 errors, `tsc` clean, `build` passing; main chunk still 131 kB — dotLottie runtime lazy-split).

| Item | Status | Change |
|---|---|---|
| Repository perf | ✅ | `QuestionCard` → `React.memo` with id-based handlers; `QuestionStream` passes stable `useCallback` refs (no per-row closures). A keystroke in search now re-renders only changed cards, not all of them. |
| List animations | ✅ | `QuestionStream` wrapped in `AnimatePresence mode="popLayout"` (cards animate out/reflow on delete/filter); `PapersListPage` uses `MotionList`/`MotionListItem` staggered reveal; `ApprovalSubmissionQueue` keyed staggered reveal via `motion.create(Link)`. |
| CSS token drift | ✅ | `bulk-import.css`: 20 hardcoded hex → tokens / `color-mix`. `paper-print.css`: dark print-preview palette documented as intentional. |
| Form a11y | ✅ | `aria-invalid` + `aria-describedby` + `aria-required` wired where per-field error state exists (`TeacherFormDialog`); forms with only form-level validation left as-is (documented). |
| Lottie infrastructure | ✅ | `@lottiefiles/dotlottie-react` installed; `LottiePlayer` (lazy, reduced-motion-aware, graceful fallback); `lottie-assets.ts` registry of all 13 placements; `EmptyStatePanel` gains optional `lottie` prop; `PapersListPage` empty/error wired; `src/assets/lottie/README.md` + Vite `assetsInclude` + `*.lottie` types. Activates the moment `.lottie` files are dropped in; nothing breaks until then. |

**Deferred deliberately:** builder-canvas (`PaperBuilderPaginatedCanvas`) memoization — needs un-threading `composition` from every block first; risky without visual QA. `PapersListPage` already had a skeleton (audit UX-M2 was partly inaccurate).

## 12. Implementation log — Wave 3: rich authoring (shipped June 14, 2026)

Full TipTap rich-text + KaTeX math (M-05), chosen over KaTeX-only. Verified green (`tsc` clean, `lint` 0 errors, `build` passing; entry chunk still **128 kB** — TipTap and KaTeX load only on their lazy routes).

**Strategy:** content stored as **sanitized HTML strings** (no schema migration — legacy plain text is valid HTML); math authored inline as LaTeX `$…$` / `$$…$$` and rendered by KaTeX at display time, so it works in the editor output, on screen, and in PDF.

| Piece | File(s) |
|---|---|
| Editor | `RichTextEditor.tsx` (TipTap StarterKit: bold/italic/lists; math hint; external-value sync) |
| Renderer | `RichContent.tsx` + `rich-text.ts` (DOMPurify sanitize + KaTeX text-node walk; `stripHtml`/`richTextToPlain`/`isRichTextEmpty`/`normalizeRichValue`) |
| Authoring | `AuthorCanvas.tsx` — body/answer/solution (EN+HI) now rich editors; MCQ options stay inputs but render math on display |
| Validation/mapping | `question-authoring.ts` — HTML-aware empties + normalized save |
| Display sites | `QuestionCard`, `QuestionDetailDrawer`, `PrintQuestionBody`, `BookmarksWorkspace` all render via `RichContent` |
| Search | `repository-workspace.ts` strips HTML before matching |
| DOCX | `rich-text-docx.ts` HTML→runs (bold/italic/lists; math → LaTeX source as best-effort fallback) wired into `paper-docx-export.ts` |
| Styles/deps | `rich-text.css`, KaTeX CSS in `main.tsx`; deps: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`, `dompurify`, `katex` |

**Known limits (by design):** PDF (html2canvas) renders math fully; **DOCX shows math as LaTeX source** (Word can't render KaTeX). MCQ option fields are plain inputs (math renders on display, not WYSIWYG). Bulk-imported questions remain plain text (valid HTML).

**⚠️ Needs your visual QA:** the editor, math rendering, and print/PDF/DOCX output should get a manual pass in-app — these are the changes I couldn't verify beyond build/types.

## 13. Motion polish pass (shipped June 14, 2026)

Upgraded the interaction system to a consistent premium feel (verified green):

- **Centralized CSS motion tokens** in `theme.css` (`--pc-motion-instant/fast/normal`, `--pc-ease-out`, `--pc-ease-emphasized`) mirroring `lib/motion/tokens.ts` — the `--pc-motion-fast` var the CSS referenced never actually existed before (always fell back to a literal).
- **Emphasized decelerate easing** (`cubic-bezier(0.22,1,0.36,1)`) on surfaces/press, replacing flat `ease`.
- **Consistent hover-lift** (`translateY(-1px)`) on every `.pc-motion-surface` (question cards, paper rows, approval rows) — previously only question cards lifted.
- **Tactile press**: refined button scale (instant duration on press), primary-CTA hover lift, icon-button hover scale, tab press feedback — all transform-only (60fps, no paint/layout).
- **Fixed paint-bound animation** (M-M2): `ProfilePhotoControl` no longer framer-animates `box-shadow` (a CSS var it couldn't interpolate) — now a clean CSS transition.
- All new transforms guarded under `prefers-reduced-motion`.

## 14. Implementation log — Wave 4

### Answer-key export (M-01 — **closes MVP criterion 6**) ✅ shipped June 14, 2026
Verified green (`tsc` clean, `lint` 0 errors, `build` passing).

- **Model** `paper-answer-key.ts` — builds answer entries from the same resolved-paper print blocks the question paper uses, so numbering + section order match exactly. Resolves MCQ (letter + option text), True/False, and model answers; carries solution/marking notes; medium-aware (incl. bilingual).
- **DOCX answer key** `paper-answer-key-docx.ts` — full fidelity (Hindi, bold/italic/lists via the HTML→runs converter; math as LaTeX source). School header + "Answer Key" title + section groupings.
- **PDF answer key** `paper-answer-key-pdf.ts` — programmatic jsPDF, auto-paginated. *Limitation:* jsPDF core fonts don't cover Devanagari, so Hindi/bilingual papers should use the Word answer key (documented in-file); math shows as LaTeX source.
- **Plumbing** — `PaperExportKind` ('paper' | 'answer-key') threaded through `runPaperExport`, filenames get an `_AnswerKey` suffix, and the export menu now shows two groups (**Question paper** / **Answer key**), each with PDF + DOCX. Works in both direct mode (preview/builder) and navigate mode (library → preview auto-runs via `&kind=answer-key`).

**Remaining (Wave 4 cont.)** — not started: paper lifecycle states + reject-with-comment + activity log, paper sets A/B/C/D, list virtualization, Vitest suite, click-time dynamic-import of export libs, unbounded-query aggregation counters, premium `.lottie` assets (infrastructure ready, art not supplied), builder-canvas memoization.

---

*Companion to `COMPREHENSIVE_AUDIT_2026-06-14.md` (which it verifies and extends). All findings carry `file:line` evidence; build/lint/typecheck re-run June 14, 2026.*
</content>
</invoke>
