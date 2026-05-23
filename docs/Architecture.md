# PaperCraft — Architecture

Engineering reference for how the repo is structured **today** and where it is headed.
For product scope and milestones, see [`PLAN.md`](./PLAN.md).
For visual and component rules, see [`../paperCraftUIDesign/DESIGN.md`](../paperCraftUIDesign/DESIGN.md).

---

## Overview

PaperCraft is a **single-page React application** for Indian state-board schools: question repository, paper composition, approval workflow, and PDF export. Phase 1 is **single-tenant** (one school); Firebase backs auth and will back data. The UI follows an **editorial academic** design system — warm paper surfaces, Newsreader + Geist, cobalt primary — not a generic SaaS dashboard.

```text
┌─────────────────────────────────────────────────────────────────┐
│  Browser (Vite SPA)                                             │
│  ┌──────────────┐  ┌────────────────────────────────────────┐ │
│  │ Firebase Auth│  │ React app (src/)                         │ │
│  │ (live)       │  │  Shell → Pages → Workspace components    │ │
│  └──────────────┘  │  Mock data (Phase 2 → Firestore services) │ │
│  ┌──────────────┐  └────────────────────────────────────────┘ │
│  │ Firestore    │                                              │
│  │ Storage      │  Planned — SDK wired, no service layer yet   │
│  └──────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Current development phase

| Phase | Focus | Status |
|-------|--------|--------|
| **1 — Foundation** | Login, app shell, routing guard | Done |
| **2 — Question system** | Repository workspace, filters, cards | In progress |
| **3 — Paper engine** | Blueprints, Paper Builder, preview | Planned |
| **4 — Workflow & export** | Approvals, PDF, sets A/B/C/D | Planned |
| **5 — Polish & deploy** | Teachers UI, i18n, Vercel | Planned |

Active milestone (from `PLAN.md`): **Question Repository workspace** — UI and interactions first; Firestore integration follows the service-layer pattern below.

---

## Tech stack (as implemented)

| Layer | Choice | Notes |
|-------|--------|--------|
| Language | **TypeScript** | Strict app code under `src/` |
| UI | **React 19** + **Vite 8** | SPA, no SSR |
| Routing | **React Router 7** | `/login`, nested `/app/*` |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`) | Tokens in `src/styles/theme.css`; feature CSS for shell, dashboard, repository |
| Fonts | **@fontsource** | Newsreader, Geist Variable, JetBrains Mono |
| Icons (app) | **lucide-react** | Shell and workspaces |
| Auth | **Firebase Auth** | Email/password; `AuthContext` + `ProtectedRoute` |
| Database | **Firestore** | Client initialized in `lib/firebase.ts`; **no domain services yet** |
| Storage | **Firebase Storage** | Initialized; unused in UI |
| State | **React Context** | `AuthContext` only; no Redux |
| Design reference | **`paperCraftUIDesign/`** | Static JSX artboards + `DESIGN.md`; not bundled into Vite app |

**Planned later** (in `PLAN.md`, not in repo yet): TipTap + KaTeX, SheetJS, jsPDF + html2canvas, Firestore security rules files, AI mock service package, teacher role routes.

---

## Repository layout

```text
paperCraft/
├── docs/
│   ├── Architecture.md          ← this file
│   └── PLAN.md                  ← product plan & schema
│
├── paperCraftUIDesign/           ← design system & screen prototypes (reference)
│   ├── DESIGN.md                ← binding visual/UX spec
│   ├── styles.css               ← canonical .pc-* component CSS
│   ├── PaperCraft.html          ← design canvas (Babel + inline JSX)
│   └── screens/                 ← ControlCenter, Repository, PaperBuilder, …
│
├── public/                      ← favicon, static assets
│
├── src/                         ← production application
│   ├── main.tsx                 ← font imports + React mount
│   ├── App.tsx                  ← router + AuthProvider
│   ├── index.css                ← Tailwind entry; imports feature stylesheets
│   │
│   ├── context/
│   │   └── AuthContext.tsx      ← Firebase auth state, login/logout
│   │
│   ├── routes/
│   │   ├── LoginRoute.tsx
│   │   └── ProtectedRoute.tsx   ← redirects unauthenticated users to /login
│   │
│   ├── pages/
│   │   ├── AppLayout.tsx        ← shell wrapper + outlet + per-route crumbs/actions
│   │   ├── ControlCenterPage.tsx
│   │   └── RepositoryPage.tsx
│   │
│   ├── screens/
│   │   └── auth/
│   │       └── LoginScreen.tsx
│   │
│   ├── components/
│   │   ├── shell/               ← AppShell, Sidebar, Topbar
│   │   ├── auth/                ← AuthLoading
│   │   ├── dashboard/           ← Control Center widgets (mock-driven)
│   │   ├── repository/          ← filters, cards, stream, intelligence sidebar
│   │   └── workspace/           ← full-page compositions (ControlCenter, Repository)
│   │
│   ├── config/
│   │   ├── admin-nav.ts         ← sidebar groups (Lucide icons)
│   │   └── nav-routes.ts        ← nav key → path mapping
│   │
│   ├── data/                    ← mock fixtures (temporary until Firestore)
│   │   ├── control-center-mock.ts
│   │   └── question-bank-mock.tsx
│   │
│   ├── lib/
│   │   ├── firebase.ts          ← Firebase app, auth, db, storage
│   │   └── utils.ts             ← cn() helper (clsx + tailwind-merge)
│   │
│   └── styles/
│       ├── theme.css            ← --pc-* design tokens (source of truth for app)
│       ├── shell.css            ← layout: .pc-shell, .pc-sidebar, .pc-topbar, …
│       ├── chrome.css           ← buttons, tags, panels, inputs
│       ├── dashboard.css
│       ├── repository.css
│       └── auth.css
│
├── .env / .env.example          ← VITE_FIREBASE_* keys
├── package.json
├── vite.config.ts               ← @ path alias → src/
└── index.html
```

There is **no** `services/`, `hooks/useQuestions`, or `firestore.rules` in the tree yet — those are the **target** layout for data and permissions (see [Target folder structure](#target-folder-structure-phase-2)).

---

## Application architecture

### Layering (current)

```text
Route (pages/) → Layout (AppLayout + AppShell) → Workspace (components/workspace/)
  → Feature components (repository/, dashboard/) → Mock data (data/)
```

Authentication sits **above** routes:

```text
App
 └── AuthProvider
      └── BrowserRouter
           ├── /login          → LoginRoute → LoginScreen
           └── ProtectedRoute
                └── /app       → AppLayout → AppShell (Sidebar + Topbar)
                     ├── index              → ControlCenterPage → ControlCenterWorkspace
                     └── repository         → RepositoryPage → RepositoryWorkspace
```

### Layering (target)

All Firestore access goes through a service layer; UI never calls Firestore directly.

```text
Component → Hook → Service → Firestore
```

Example (planned):

```text
QuestionCard.tsx
  → useQuestions()
    → services/firebase/questions.ts
      → Firestore query (published only for teachers)
```

Benefits: single place for `tenantId` (Phase 2 SaaS), error handling, activity logging, and tests.

---

## Routing

### Implemented routes

| Path | Page | Notes |
|------|------|--------|
| `/` | redirect → `/app` | |
| `/login` | Login | Firebase email/password |
| `/app` | Control Center | Default admin dashboard |
| `/app/repository` | Question Repository | Current build focus |
| `*` | redirect → `/app` | |

Sidebar keys map to paths in `config/nav-routes.ts`. Items without a dedicated route still point at `/app` until their workspace is built.

### Planned routes (admin / teacher split)

From `PLAN.md` — nested layouts under `/admin/*` and `/teacher/*` with role guards. Not implemented yet; today everything authenticated lands in the admin shell.

---

## UI & design system

Two related artifacts:

| Artifact | Role |
|----------|------|
| **`paperCraftUIDesign/`** | High-fidelity prototypes on a design canvas; canonical `.pc-*` CSS in `styles.css`; custom `<Icon>` set in `screens/shared.jsx`. |
| **`src/styles/`** | Production tokens (`theme.css`) and ported shell/chrome rules aligned with `DESIGN.md`. App uses **Lucide** in the shell instead of the design-kit icon component. |

When implementing a new screen:

1. Match layout and density from the matching artboard in `paperCraftUIDesign/screens/`.
2. Use `--pc-*` tokens only (no random hex in components).
3. Compose with `.pc-panel`, `.pc-btn`, `.pc-tag`, etc. from `shell.css` / `chrome.css`.
4. Serif for headings and question copy; sans for chrome (see `DESIGN.md` §3).

---

## Authentication

```text
LoginScreen
  → AuthContext.login(email, password, remember?)
    → Firebase signInWithEmailAndPassword
    → onAuthStateChanged updates user

ProtectedRoute
  → if !user → Navigate to /login
  → else → <Outlet />
```

Role-based UI (admin vs teacher) and Firestore `users/{uid}.role` are **planned**; `ProtectedRoute` only checks Firebase Auth presence today.

---

## Data & backend

### Today

- **Firebase**: `lib/firebase.ts` reads `VITE_FIREBASE_*` from `.env`.
- **Domain data**: static mocks in `src/data/` for Control Center metrics and repository questions.
- **Security rules**: documented in `PLAN.md` § Security Architecture; not committed as `firestore.rules` yet.

### Target collections (Firestore)

From `PLAN.md`: `questions`, `subjects`, `chapters`, `questionPapers`, `examBlueprints`, `users`, `schoolConfig`, `activityLog`.

### Critical rule (unchanged)

Teachers must not mutate question documents. Papers store **`questionId` references** only. Question bodies stay admin-owned. See `PLAN.md` § Security Architecture.

---

## Target folder structure (Phase 2+)

Planned additions under `src/` as features ship:

```text
src/
├── hooks/
│   ├── useQuestions.ts
│   ├── usePapers.ts
│   └── useBlueprints.ts
│
├── services/
│   ├── firebase/
│   │   ├── questions.ts
│   │   ├── papers.ts
│   │   ├── chapters.ts
│   │   ├── blueprints.ts
│   │   ├── users.ts
│   │   ├── storage.ts
│   │   └── activityLog.ts
│   ├── ai/                    ← mock now; swap implementations later
│   ├── paperEngine/           ← auto-generate, shuffle, validate
│   ├── export/                ← jsPDF + html2canvas
│   └── import/                ← Excel parse + validate
│
├── config/
│   ├── constants.ts           ← question types, difficulties
│   └── permissions.ts         ← ROLE_PERMISSIONS
│
└── utils/
    ├── permissions.ts         ← canDo(role, action)
    └── katexHelpers.ts
```

Admin-only pages (question form, bulk upload, curriculum, approvals, teachers, settings) and teacher flows (generate, builder, my papers) will live under `pages/` + `components/` mirroring `PLAN.md` § Page Structure.

---

## AI service (planned)

Interface-first; mocks in Phase 1:

```text
services/ai/index.ts
  → generateQuestions()
  → detectDuplicates()
  → extractFromImage()
```

Phase 2 replaces internals (OpenAI, Claude, etc.) without changing hooks or components.

---

## PDF export (planned)

Client-side only:

```text
jsPDF + html2canvas
  → school header from schoolConfig
  → paper body + optional answer key PDF
  → sets A/B/C/D via shuffler service
```

---

## Permissions (planned)

```text
utils/permissions.ts — canDo(role, action) → boolean
```

Actions include `create_question`, `publish_question`, `create_paper`, `submit_paper`, `approve_paper`, `export_paper`, etc. Full list in `PLAN.md` and the previous architecture draft; enforced in UI and Firestore rules together.

---

## Environment & configuration

| Variable | Purpose |
|----------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase web client |
| `VITE_FIREBASE_AUTH_DOMAIN` | |
| `VITE_FIREBASE_PROJECT_ID` | |
| `VITE_FIREBASE_STORAGE_BUCKET` | |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | |
| `VITE_FIREBASE_APP_ID` | |
| `VITE_FIREBASE_MEASUREMENT_ID` | Optional analytics |

Copy `.env.example` → `.env` before running `npm run dev`.

---

## Scripts

```bash
npm run dev      # Vite dev server
npm run build    # Production build → dist/
npm run preview  # Preview production build
npm run lint     # ESLint
```

---

## Key dependencies

**Installed now:** `react`, `react-dom`, `react-router-dom`, `firebase`, `tailwindcss`, `@tailwindcss/vite`, `lucide-react`, `@fontsource/*`, `clsx`, `tailwind-merge`, `class-variance-authority`, `radix-ui`, `shadcn` (tooling; UI primitives not yet wired in `src/`).

**Planned:** `@tiptap/react`, `katex`, `xlsx`, `jspdf`, `html2canvas`.

---

## Conventions

- **Path alias:** `@/` → `src/` (see `vite.config.ts`).
- **Components:** PascalCase files; workspace-level screens in `components/workspace/`.
- **CSS:** Prefix `pc-` for design-system classes; tokens only as `var(--pc-*)` in component code.
- **Nav:** Extend `admin-nav.ts` + `nav-routes.ts` when adding a routed workspace.
- **Mocks:** Keep fixtures in `src/data/` until the matching `services/firebase/*.ts` exists; then delete or gate behind dev flags.

---

## Related documents

| Document | Contents |
|----------|----------|
| [`PLAN.md`](./PLAN.md) | Product flow, schema, phases, security rules, page list |
| [`../paperCraftUIDesign/DESIGN.md`](../paperCraftUIDesign/DESIGN.md) | Colors, typography, components, screen inventory |
| [`.env.example`](../.env.example) | Firebase env template |

---

_Last updated to match the codebase on branch `feature/components-screens` — TypeScript app shell, Firebase auth, Control Center + Repository workspaces, mock data, editorial design tokens._
