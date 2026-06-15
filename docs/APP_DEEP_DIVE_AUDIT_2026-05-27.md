# PaperCraft Deep Dive Audit (May 27, 2026)

This document is a full analysis of the current app state, focused on:

- highest-priority issues
- plan progress (done vs pending)
- important missing work not currently in plan

---

## 1) Executive Read

PaperCraft has progressed much further than `docs/PLAN.md` currently indicates. Core modules listed as "planned" in the plan are already implemented in code (question authoring, bulk import, curriculum, paper builder, approvals, paper library).

The biggest blockers are not feature count; they are platform hardening and release quality:

1. authorization/security rule hardening (P0)
2. data integrity controls (P1)
3. production quality gates (P2)

`npm run build` passes, but `npm run lint` fails with 900+ issues, and TS/TSX app files are not linted by current ESLint config.

---

## 2) Highest Priority Issues (Ranked)

## P0 (Fix First)

### P0-1: Firestore role model can allow admin privilege escalation

**Why this is critical**

- Current rules treat user documents without `role` as admin.
- Users can create/update their own profile document.
- Combined, this creates dangerous paths to elevated access.

**Evidence**

- `firestore.rules`:
  - `isAdmin()` allows missing role as admin (`!('role' in get(userPath()).data)`)
  - `/users/{userId}` allows self `create` and self `update`
- `src/services/firebase/user-profile.ts`:
  - missing/non-teacher role falls back to `'admin'`

**Impact**

- possible unauthorized access to admin actions and collections
- high-risk data tampering

**Fix direction**

- make `isAdmin()` strict: only explicit `role == 'admin'`
- disallow self edits to privileged fields (`role`, active status, assignments)
- treat unknown/missing role as unprivileged in client parser

---

### P0-2: School asset storage writes are open to all authenticated users

**Evidence**

- `storage.rules` allows any authenticated user to write/delete `school-assets/{fileName}`

**Impact**

- branding/logo defacement risk
- accidental destructive writes

**Fix direction**

- restrict school-assets write/delete to admins only

---

## P1 (Next)

### P1-1: Notification creation can be spoofed

**Evidence**

- `firestore.rules` allows any authenticated create on `/notifications`
- `src/services/firebase/notifications.ts` accepts arbitrary `userId` in payload

**Impact**

- users can forge notifications to other users

**Fix direction**

- enforce `request.resource.data.userId == request.auth.uid` in rules for user-generated docs
- move cross-user notifications to admin/server workflows

---

### P1-2: Critical teacher constraints are mostly UI-level, not enforced in rules

**Evidence**

- teacher assignment/active checks exist in UI/hooks
- Firestore rules do not consistently enforce active/assignment constraints

**Impact**

- policy bypass risk via direct client/API calls

**Fix direction**

- enforce critical constraints in rules or server-side checks

---

### P1-3: Teacher provisioning flow can become inconsistent

**Evidence**

- `src/services/firebase/teachers.ts` performs multi-step provisioning (auth + profile writes)

**Impact**

- partial failures can leave orphan or inconsistent records

**Fix direction**

- use a trusted server/Cloud Function flow with compensation/retry logic

---

## P2 (Important for Stability)

### P2-1: Quality gates are weak for a TS app

**Evidence**

- `eslint.config.js` only targets `**/*.{js,jsx}` (TS/TSX not covered)
- `package.json` has no `test` script and no `typecheck` script
- `npm run lint` currently fails heavily because prototype files are included

**Impact**

- real app regressions can slip through despite "green build"

**Fix direction**

- add `typescript-eslint` setup for TS/TSX
- split lint scopes: production app vs design prototypes
- add CI with `typecheck`, lint, tests, build

---

### P2-2: PLAN-to-code drift is now significant

**Evidence**

- plan says many modules are planned; code has them implemented
- lifecycle and collection names diverge from plan text

**Impact**

- planning, onboarding, and execution confusion

**Fix direction**

- update `docs/PLAN.md` to match real implementation baseline

---

## 3) Plan List Progress (Done vs Pending)

Reference plan: `docs/PLAN.md`.

## Module Status Snapshot

1. Authentication -> **Done**
2. App Shell -> **Done**
3. Academic Control Center -> **Done**
4. Question Repository -> **Done / Refinement ongoing**
5. Create/Edit Question -> **Done**
6. Bulk Upload -> **Done**
7. Curriculum Workspace -> **Done**
8. Paper Builder -> **Done (core) / Refinement ongoing**
9. Approval Workspace -> **Partial**
10. Paper Library -> **Partial**
11. Polish & Deploy -> **Partial**

## Completion Estimate

- **Done or largely done:** 8/11 modules (~73%)
- **Partial:** 3/11 modules (~27%)
- **Not started:** 0/11 at module level (but many hardening tasks are pending)

## What is still pending from your plan

### Approval workspace pending

- explicit reject-with-comment flow
- clear under-review lifecycle handling if intended

### Paper library pending

- answer key export parity with paper export
- lifecycle completion (`locked`, `exported`) if that remains requirement

### Polish & deploy pending

- responsive/mobile readiness (currently intentionally blocked)
- full Hindi UI localization system
- automated tests and CI quality gates

---

## 4) Major Plan vs Code Mismatches (Need Plan Update)

These should be corrected in `docs/PLAN.md` so roadmap reflects reality:

- Module statuses: several marked planned but implemented
- Collection naming:
  - plan: `questionPapers`, code: `papers`
  - plan: `examBlueprints`, code: `blueprints`
- Paper lifecycle mismatch:
  - plan includes `under_review`, `locked`, `exported`
  - code currently uses a smaller active status set
- Bulk import behavior mismatch:
  - plan says import as draft then publish later
  - implementation imports with immediate publish behavior in current workflow copy/logic

---

## 5) Missing Work Not Clearly in Plan (My Recommendations)

These are high-value additions that should be explicitly added to roadmap:

1. **Security Hardening Sprint (P0/P1)**
   - Firestore role model lockdown
   - storage rule restrictions
   - notification anti-spoofing rules
   - user profile field-level write restrictions

2. **Data Integrity Guardrails**
   - consistent status transition validators for papers/questions
   - server-side action guards for privileged operations
   - migration/cleanup scripts for inconsistent legacy docs

3. **Release Quality Baseline**
   - CI pipeline on PRs: lint + typecheck + build + minimal smoke tests
   - TS lint coverage in app code
   - split prototype/design files from production lint scope

4. **Observability & Auditability**
   - centralized error logging and operation audit trails for approvals/publishing
   - admin-visible operational diagnostics for failed imports/provisioning

5. **UX Readiness Layer**
   - mobile strategy (either support or clear product-level desktop-only policy)
   - reject workflow UX clarity (submitted, under review, rejected, reopened)
   - answer-key export UX and print parity checks

---

## 6) UI and Functionality Improvement Opportunities

Not blockers, but high ROI:

- richer status badges and timeline for paper lifecycle
- guided fix flow for rejected papers (diff + required changes checklist)
- import wizard post-import verification dashboard
- curriculum and repository cross-linking to reduce context switching
- stronger empty/error/loading states consistency across all workspaces

---

## 7) Suggested Execution Order (Practical)

### Wave 1 (Immediate, 1-2 weeks)

- fix P0 authz issues in Firestore + client role parsing
- lock storage school-assets permissions
- add CI with `build` + `typecheck` + scoped lint

### Wave 2 (Next, 1-2 weeks)

- close approval/paper library lifecycle gaps
- add reject-with-comment + answer-key export completion
- enforce integrity constraints server-side/rules-side

### Wave 3 (After stability baseline)

- update `PLAN.md` to reality and republish phase tracking
- mobile/UX polish and localized UI completion
- broaden automated test coverage

---

## 8) Verification Signals Captured During Audit

- `npm run build` -> passes
- `npm run lint` -> fails with 900+ issues (dominated by design prototype files)
- ESLint config currently does not lint TS/TSX app files (`eslint.config.js` -> `**/*.{js,jsx}` only)

---

## 9) Bottom Line

Your app is feature-rich and ahead of the documented plan, but production trust depends on hardening authorization and quality gates now. The fastest way to improve overall maturity is to pause net-new features briefly and execute a focused security + release engineering stabilization sprint.
