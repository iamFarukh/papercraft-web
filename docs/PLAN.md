# PaperCraft — Product Plan

---

# Current Active Focus

Current development focus:

# Question Repository Workspace

Current milestone:

- Repository UI
- Question cards
- Metadata system
- Filters
- Repository interactions

This is the current foundation phase.

---

# What is PaperCraft?

PaperCraft is a premium examination composition and academic workflow system for schools.

It manages:

- curriculum questions
- examination paper generation
- paper approvals
- academic workflows
- question repository management

The platform focuses on:

- calm editorial UI
- operational workflows
- premium academic infrastructure
- intelligent paper composition

PaperCraft is NOT:

- a school ERP
- a generic admin dashboard
- a simple CRUD tool
- an LMS

It is:

# a professional examination composition and approval system.

---

# Core Product Goal

# Create, manage, review, approve, and export examination papers professionally.

Everything inside the product supports this workflow.

---

# Main Product Flow

```text
Questions
   ↓
Question Repository
   ↓
Paper Builder
   ↓
Approval Workflow
   ↓
Approved Paper
   ↓
PDF Export
```

This is the entire product foundation.

---

# Scope

| Item             | Detail                                     |
| ---------------- | ------------------------------------------ |
| **School**       | Single school (your school), single-tenant |
| **Board**        | RBSE (Rajasthan State Board)               |
| **Classes**      | 1 to 8                                     |
| **Users**        | 1 Admin + ~10 Teachers                     |
| **Languages**    | Hindi + English (bilingual papers)         |
| **Math support** | KaTeX equations for math/science papers    |
| **Answer keys**  | Generated alongside every paper            |
| **AI**           | Mocked now, plug-in ready for Phase 2      |
| **Phase 1**      | Working tool for your school               |
| **Phase 2**      | SaaS — sell to other schools               |

---

# What We Are NOT Building Right Now

PaperCraft MVP does NOT include:

- Student portals
- Parent apps
- Attendance systems
- Fee systems
- Timetable systems
- Live exams
- Online test taking
- LMS features
- Chat systems
- Advanced AI generation
- Multi-school architecture
- Advanced analytics dashboards
- Notification systems

The focus is ONLY:

# professional examination workflows.

This prevents feature creep. Everything outside this list is Phase 2 or later.

---

# Main User Roles

## 1. Admin — Central Academic Authority

Admin has full control over the entire system.

### Question Repository

- Create, edit, delete questions
- Publish / unpublish questions
- Lock questions to prevent accidental edits
- Archive questions
- Bulk upload via Excel/CSV
- Manage bilingual content (Hindi + English)
- Add solutions, images, equations
- Detect duplicates
- Import/export question data

### Curriculum

- Manage subjects per class
- Manage chapters per subject
- Manage topics per chapter
- Bilingual naming

### Paper Management

- View all generated papers
- Approve / reject teacher papers with comments
- Edit teacher-generated papers before approval
- Lock finalized papers
- Export final PDFs
- Generate paper sets (A/B/C/D)

### Teacher Management

- Add / remove teachers
- Assign classes & subjects
- Activate / deactivate accounts

### Settings & Control

- School settings (name, logo, affiliation)
- Academic sessions
- Blueprint management
- Exam templates

---

## 2. Teacher — Paper Operator

Teachers DO NOT manage the question repository.
Teachers ONLY use published questions already in the system.

### Paper Generation

- Generate papers using filters
- Create papers from blueprints
- Customize question selection
- Rearrange sections / questions
- Replace questions (swap from repository)
- Preview papers
- Save drafts

### Paper Workflow

- Submit papers for admin approval
- View approval status
- Edit rejected papers
- Regenerate papers

### Read-Only Access

Teachers can:

- Search questions
- Filter questions
- Preview questions

Teachers CANNOT:

- Create questions
- Edit questions
- Delete questions
- Upload question data
- Approve anything
- Change curriculum structure
- See other teachers' papers

---

# Repository Philosophy

The question repository is the academic foundation of PaperCraft.

It is NOT:

- a spreadsheet
- a CRUD table
- a dump of questions

It is:

- a structured academic repository
- metadata-driven
- curriculum-aware
- blueprint-aware
- optimized for intelligent paper generation

Every question is a rich, structured document with content, metadata, solutions, and lifecycle state. The repository enables filtering, blueprint matching, difficulty balancing, and intelligent paper composition.

---

# Question Lifecycle

Questions move through defined states:

```text
Draft → Published → Locked → Archived
```

### Rules

- **Draft** — Admin is still authoring or reviewing. Not visible to teachers.
- **Published** — Quality-approved and available for paper generation. Teachers can only access published questions.
- **Locked** — Published but frozen. Cannot be edited. Used for finalized exam content.
- **Archived** — Retired from active use. Stays searchable for reference but excluded from paper generation.

Only Admin controls lifecycle transitions. Teachers never see draft or archived questions.

---

# Paper Lifecycle

Papers move through defined states:

```text
Draft → Submitted → Under Review → Approved → Locked → Exported
```

### Rules

- **Draft** — Teacher is composing. Can edit freely.
- **Submitted** — Teacher has sent for approval. No further teacher edits until reviewed.
- **Under Review** — Admin is actively reviewing.
- **Approved** — Admin has approved. Paper content is finalized.
- **Locked** — No further editing by anyone. Permanent record.
- **Exported** — PDF generated. Print-ready.

Only approved and locked papers can:

- Generate final PDFs
- Generate answer keys
- Generate paper sets (A/B/C/D)

Rejected papers return to Draft with admin comments. Teacher can edit and resubmit.

---

# System Workflow

### Step 1 — Admin Prepares Question Repository

Admin uploads questions, creates curriculum, organizes chapters/topics, publishes quality-approved questions. The repository becomes the centralized, quality-controlled academic database.

### Step 2 — Teacher Generates Paper

Teacher selects class → subject → exam type → chapters → difficulty distribution → generates paper. Teacher can rearrange questions, replace questions, adjust sections. Teacher CANNOT modify original question content.

### Step 3 — Teacher Submits Paper

Paper status: Draft → Submitted. Admin receives approval request.

### Step 4 — Admin Reviews Paper

Admin can review structure, replace weak questions, edit formatting. Status: Submitted → Approved OR Submitted → Rejected (with comments).

### Step 5 — Final Lock & Export

Once approved: paper is locked, no further editing, PDF export enabled. Generate sets A/B/C/D with shuffled questions/options. Print-ready.

---

# Security Architecture

### Critical Rule

Teachers never directly modify question documents. Papers only store `questionId` references. Original questions remain protected. This is non-negotiable architecture.

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuth() {
      return request.auth != null;
    }

    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function isAdmin() {
      return isAuth() && getUserRole() == 'admin';
    }

    function isTeacher() {
      return isAuth() && getUserRole() == 'teacher';
    }

    // QUESTIONS — Admin write, teachers read published only
    match /questions/{questionId} {
      allow read: if isAuth() && resource.data.status == 'published';
      allow read: if isAdmin();
      allow create, update, delete: if isAdmin();
    }

    // SUBJECTS & CHAPTERS — Admin write, all read
    match /subjects/{subjectId} {
      allow read: if isAuth();
      allow write: if isAdmin();
    }

    match /chapters/{chapterId} {
      allow read: if isAuth();
      allow write: if isAdmin();
    }

    // PAPERS — Teachers create own, Admin manages all
    match /questionPapers/{paperId} {
      allow read: if isAuth() && (
        isAdmin() || resource.data.createdBy == request.auth.uid
      );
      allow create: if isAuth();
      allow update: if isAdmin() || (
        isTeacher()
        && resource.data.createdBy == request.auth.uid
        && resource.data.isLocked != true
      );
      allow delete: if isAdmin();
    }

    // BLUEPRINTS — Admin write, all read
    match /examBlueprints/{blueprintId} {
      allow read: if isAuth();
      allow write: if isAdmin();
    }

    // USERS — Admin manages, users read own
    match /users/{userId} {
      allow read: if isAuth() && (isAdmin() || request.auth.uid == userId);
      allow write: if isAdmin();
    }

    // SCHOOL CONFIG — Admin only
    match /schoolConfig/{docId} {
      allow read: if isAuth();
      allow write: if isAdmin();
    }

    // ACTIVITY LOG — all write, admin reads
    match /activityLog/{logId} {
      allow read: if isAdmin();
      allow create: if isAuth();
    }
  }
}
```

---

# Product Philosophy

PaperCraft should feel:

- calm
- editorial
- operational
- institutional
- premium
- focused

The UI should feel more like:

- Notion
- Linear
- Figma
- Airtable

NOT:

- ERP software
- bootstrap dashboards
- cluttered admin panels
- coaching institute software

---

# Design Philosophy

PaperCraft is:

# an editorial academic workspace.

### Visual Language

- Warm backgrounds (not stark white, not dark mode)
- Serif typography for headings (scholarly feel)
- Sans-serif for body and data
- Restrained shadows (subtle depth, not Material Design)
- Spacious layouts (generous padding, breathing room)
- Layered surfaces (cards on warm canvas)
- Muted color palette with purposeful accents
- Minimal iconography (text-first navigation)

### Interaction Feel

- Trustworthy
- Scholarly
- Premium
- Calm
- Quiet confidence, not loud features

### What to Avoid

- Overused gradients
- Neon accent colors
- Heavy drop shadows
- Cramped layouts
- Dashboard widget overload
- Generic admin panel aesthetic
- Coaching software look

---

# Question Types

PaperCraft supports 7 question types:

| Type                | Fields                                           |
| ------------------- | ------------------------------------------------ |
| MCQ                 | 4 options, 1 correct, bilingual                  |
| True/False          | Statement + correct answer                       |
| Fill in the Blanks  | Sentence with blank + answer                     |
| Short Answer        | Question + model answer (2-3 lines)              |
| Long Answer         | Question + detailed answer (paragraph+)          |
| Match the Following | Left-right pairs, bilingual                      |
| Assertion/Reason    | Assertion + reason + correct relationship option |

---

# Question Metadata

Every question carries:

| Field            | Type     | Values / Notes                                         |
| ---------------- | -------- | ------------------------------------------------------ |
| Class            | number   | 1-8                                                    |
| Subject          | ref      | Links to subjects collection                           |
| Chapter          | ref      | Links to chapters collection                           |
| Topic            | ref      | Optional, within chapter                               |
| Difficulty       | enum     | easy, medium, hard                                     |
| Marks            | number   | 1, 2, 3, 5, 10 etc.                                    |
| Language         | enum     | en, hi, both                                           |
| Bloom's Taxonomy | enum     | remember, understand, apply, analyze, evaluate, create |
| Tags             | string[] | Free-form tags                                         |
| Estimated Time   | number   | Minutes to solve                                       |
| Status           | enum     | draft, published, locked, archived                     |

This metadata enables filtering, blueprint matching, difficulty balancing, and intelligent paper generation.

---

# Exam Blueprints

Pre-defined paper structures for RBSE:

### Unit Test — 25 marks

| Section   | Type    | Count | Marks each | Total |
| --------- | ------- | ----- | ---------- | ----- |
| Section A | MCQ     | 5     | 1          | 5     |
| Section B | Fill/TF | 5     | 2          | 10    |
| Section C | Short   | 2     | 5          | 10    |

### Half Yearly — 50 marks

| Section   | Type  | Count | Marks each | Total |
| --------- | ----- | ----- | ---------- | ----- |
| Section A | MCQ   | 10    | 1          | 10    |
| Section B | Short | 5     | 3          | 15    |
| Section C | Long  | 3     | 5          | 15    |
| Section D | Match | 2     | 5          | 10    |

### Annual — 80 marks

| Section   | Type  | Count | Marks each | Total |
| --------- | ----- | ----- | ---------- | ----- |
| Section A | MCQ   | 15    | 1          | 15    |
| Section B | Short | 10    | 3          | 30    |
| Section C | Long  | 5     | 5          | 25    |
| Section D | Match | 2     | 5          | 10    |

Admin can create custom blueprints. Default difficulty distribution: 30% Easy, 50% Medium, 20% Hard.

---

# Paper Builder — HERO FEATURE

This is the core value proposition of PaperCraft.

Generate papers using:

- Blueprint-driven workflows
- AI-assisted auto selection (mock now, real later)
- Manual question selection from repository
- Section-based composition
- Real-time paper preview

Teachers and admins can:

- Rearrange questions within sections
- Replace questions (swap from repository)
- Balance difficulty distribution
- Preview exact print layout
- Generate multiple sets with shuffled questions

### Auto Generation Algorithm

```text
INPUT:
  classNumber, subjectId, blueprintId or examType
  chapters[] (optional — all chapters if empty)
  difficultyDistribution: { easy: 30%, medium: 50%, hard: 20% }

STEP 1 — Load Blueprint
  Load section structure (type, count, marks per question)

STEP 2 — Query Published Questions Only
  For each section:
    Firestore query WHERE:
      classNumber == target
      subjectId == target
      chapterId IN selectedChapters
      type == section.questionType
      status == "published"
      marks == section.marksPerQuestion

STEP 3 — Difficulty Balancing
  Per section, calculate Easy/Medium/Hard needed
  Random select from each bucket
  If insufficient → borrow from adjacent difficulty

STEP 4 — Chapter Distribution
  Spread questions across chapters proportionally
  No single chapter > 40% of total (unless only 1-2 selected)

STEP 5 — Assemble Paper
  Create paper with sections + questionId references
  Status = "draft", createdBy = teacher

STEP 6 — Generate Sets (after approval)
  Shuffle question order within sections
  Shuffle MCQ option order
  Produce sets A, B, C, D
```

---

# Database Schema

## Collections

### users/{userId}

```text
uid: string
email: string
displayName: string
role: "admin" | "teacher"
phone: string
assignedClasses: number[]
assignedSubjects: string[]
isActive: boolean
createdAt: timestamp
updatedAt: timestamp
```

### subjects/{subjectId}

```text
name: string                        // "Mathematics"
nameHi: string                      // "गणित"
code: string                        // "MATH"
classes: number[]                   // [1,2,3,4,5,6,7,8]
createdAt: timestamp
updatedAt: timestamp
```

### chapters/{chapterId}

```text
subjectId: string
classNumber: number
name: string                        // "Fractions"
nameHi: string                      // "भिन्न"
order: number
topics: [
  { id: string, name: string, nameHi: string }
]
createdAt: timestamp
```

### questions/{questionId}

```text
// Content
questionText: string                // Rich text with KaTeX
questionTextHi: string              // Hindi version
type: "mcq" | "true_false" | "fill_blank" | "short"
       | "long" | "match" | "assertion_reason"
options: [                          // MCQ, T/F, Assertion
  { id, text, textHi, isCorrect }
]
matchPairs: [                       // Match the Following
  { left, leftHi, right, rightHi }
]
answer: string
answerHi: string
solution: string                    // Detailed explanation
solutionHi: string
images: string[]                    // Firebase Storage URLs

// Metadata
classNumber: number                 // 1-8
subjectId: string
chapterId: string
topicId: string
difficulty: "easy" | "medium" | "hard"
marks: number
language: "en" | "hi" | "both"
bloomLevel: "remember" | "understand" | "apply"
             | "analyze" | "evaluate" | "create"
tags: string[]
estimatedMinutes: number

// Lifecycle
status: "draft" | "published" | "locked" | "archived"
isLocked: boolean
createdBy: string
createdAt: timestamp
updatedAt: timestamp
version: number
```

### questionPapers/{paperId}

```text
title: string
classNumber: number
subjectId: string
examType: "unit_test" | "half_yearly" | "annual" | "practice" | "custom"
totalMarks: number
durationMinutes: number
instructions: string
instructionsHi: string
sections: [
  {
    id: string,
    title: string,
    titleHi: string,
    questionType: string,
    marksPerQuestion: number,
    questionIds: string[],          // References only — never copy content
    instructions: string
  }
]
generationConfig: {
  chapters: string[],
  difficultyDistribution: { easy, medium, hard },
  blueprintId: string
}
sets: number

// Lifecycle
status: "draft" | "submitted" | "under_review" | "approved" | "locked" | "exported"
isLocked: boolean
createdBy: string                   // teacher userId
approvedBy: string                  // admin userId
reviewComment: string
submittedAt: timestamp
approvedAt: timestamp
createdAt: timestamp
updatedAt: timestamp
```

### examBlueprints/{blueprintId}

```text
name: string
classNumber: number
subjectId: string
examType: string
totalMarks: number
durationMinutes: number
sections: [
  {
    title: string,
    questionType: string,
    count: number,
    marksPerQuestion: number,
    difficultyMix: { easy, medium, hard }
  }
]
isDefault: boolean
createdBy: string
```

### activityLog/{logId}

```text
userId: string
userName: string
role: "admin" | "teacher"
action: string
resourceType: "question" | "paper" | "user" | "blueprint"
resourceId: string
details: string
timestamp: timestamp
```

### schoolConfig/main

```text
schoolName: string
schoolNameHi: string
address: string
addressHi: string
logo: string
affiliationNo: string
boardName: "RBSE"
academicYear: string
contactPhone: string
contactEmail: string
updatedAt: timestamp
```

---

# Page Structure

## Admin Pages (9)

| Page                | Purpose                                   |
| ------------------- | ----------------------------------------- |
| Dashboard           | System overview, pending approvals, stats |
| Question Repository | Full CRUD, publish, lock, bulk actions    |
| Bulk Upload         | Excel/CSV → validate → import             |
| Curriculum          | Subjects → chapters → topics tree         |
| Approval Queue      | Review submitted papers, approve/reject   |
| Paper Review        | Single paper detail, approve/reject       |
| Teachers            | Add, assign classes & subjects            |
| Blueprints          | Exam templates (unit, half, annual)       |
| Settings            | School name, logo, academic year          |

Analytics is a future phase module. Not part of MVP.

## Teacher Pages (5)

| Page           | Purpose                              |
| -------------- | ------------------------------------ |
| Dashboard      | My papers count + quick actions      |
| Generate Paper | Wizard: class → subject → blueprint  |
| Manual Builder | Browse repository → select → arrange |
| My Papers      | Draft, submitted, approved, rejected |
| Paper Preview  | Preview + submit for approval        |

Teacher UI is intentionally minimal: generate, preview, submit. Maximum simplicity for school adoption.

---

# Technical Stack

| Layer     | Choice               | Reason                              |
| --------- | -------------------- | ----------------------------------- |
| Frontend  | React + Vite         | Fast, simple, no SSR needed         |
| Styling   | Tailwind + shadcn/ui | Rapid dev + polished components     |
| Rich Text | TipTap v2            | Free, extensible, KaTeX integration |
| Math      | KaTeX                | Fast, sufficient for Class 1-8      |
| PDF       | jsPDF + html2canvas  | Client-side, no server cost         |
| Excel     | SheetJS (xlsx)       | Browser-based parsing               |
| Auth      | Firebase Auth        | Email/password login                |
| Database  | Firestore            | Real-time, serverless, free tier    |
| Storage   | Firebase Storage     | Question images                     |
| Hosting   | Vercel               | Free tier, fast CDN                 |
| AI        | Mock service         | Interface pattern, swap later       |
| Routing   | React Router v6      | Nested admin/_, teacher/_ routes    |
| State     | Context + hooks      | No Redux at this scale              |

---

# Excel Upload Template (Admin)

| questionText | questionTextHi | type | option1 | option2 | option3 | option4 | correctOption | answer | answerHi | solution | difficulty | marks | chapter    | topic    | bloomLevel | tags       | estimatedMinutes |
| ------------ | -------------- | ---- | ------- | ------- | ------- | ------- | ------------- | ------ | -------- | -------- | ---------- | ----- | ---------- | -------- | ---------- | ---------- | ---------------- |
| What is 2+2? | 2+2 क्या है?   | mcq  | 3       | 4       | 5       | 6       | 2             | 4      | 4        | 2+2=4    | easy       | 1     | Arithmetic | Addition | remember   | math,basic | 1                |

### Upload Validation Flow

```text
Admin uploads Excel/CSV
  → Parse file (SheetJS)
  → Validate required columns
  → Row-by-row validation:
      ✗ Missing required fields → Red row + error
      ✗ Invalid type/difficulty → Suggest correction
      ✗ Marks out of range → Warning
      ✗ Chapter not found → Error
      ✓ Valid rows → Green
  → Preview table (total / valid / errors / warnings)
  → Admin fixes or skips errored rows
  → Import valid rows as DRAFT questions
  → Admin reviews and publishes
```

---

# Firebase Free Tier Limits

| Resource          | Free Limit | Your Usage      | OK? |
| ----------------- | ---------- | --------------- | --- |
| Auth users        | 50K/month  | ~11             | ✅  |
| Firestore reads   | 50K/day    | ~5K estimated   | ✅  |
| Firestore writes  | 20K/day    | ~500 estimated  | ✅  |
| Firestore storage | 1 GB       | Metadata only   | ✅  |
| Firebase Storage  | 5 GB       | Question images | ✅  |

---

# Core Modules & Status

## 1. Authentication

Secure login, role-based access.
**Status: ✅ Completed**

## 2. App Shell

Sidebar, topbar, workspace layout, consistent structure.
**Status: ✅ Completed**

## 3. Academic Control Center (Dashboard)

Overview dashboard, approvals overview, operational visibility.
**Status: ✅ Initial refinement completed**

## 4. Question Repository

Central academic question database, browsing, filtering, academic intelligence. First major product workspace.
**Status: 🚧 Currently building**

## 5. Create/Edit Question

Admin question authoring, metadata management, rich text, KaTeX, images.
**Status: ⏳ Planned**

## 6. Bulk Upload System

Excel/CSV upload, validation, error preview, import workflow.
**Status: ⏳ Planned**

## 7. Curriculum Workspace

Classes, subjects, chapters, topics management.
**Status: ⏳ Planned**

## 8. Paper Builder — HERO FEATURE

Generate papers using blueprint-driven workflows, AI-assisted auto selection, manual question selection, section-based composition, and real-time paper preview. This is the core value proposition of PaperCraft.
**Status: ⏳ Planned**

## 9. Approval Workspace

Admin reviews papers, approve/reject, validation workflow.
**Status: ⏳ Planned**

## 10. Paper Library

Store all papers: drafts, approved, archived. Export PDFs, answer keys.
**Status: ⏳ Planned**

---

# Development Phases

## Phase 1 — Foundation ✅

- Login system
- App shell (sidebar, topbar, layout)
- Role-based routing
- Dashboard foundation

## Phase 2 — Question System 🚧 CURRENT

- Question Repository workspace
- Question structure & metadata
- Question lifecycle (draft → published)
- Create/Edit question form
- Bulk upload system
- Curriculum workspace

## Phase 3 — Paper Engine

- Exam blueprint CRUD
- Paper Builder wizard (teacher)
- Auto paper generation algorithm
- Difficulty balancing
- Manual paper builder
- Paper preview
- Draft save

## Phase 4 — Workflow & Export

- Submit for approval (teacher)
- Approval queue (admin)
- Approve/reject with comments
- Lock on approval
- PDF generation (paper + answer key)
- Multiple sets (A/B/C/D)
- School header in PDF
- Activity logging

## Phase 5 — Polish & Deploy

- Teacher management
- Mobile responsive pass
- Hindi UI labels
- Error/empty/loading states
- Testing
- Deploy to Vercel

---

# MVP Success Criteria

The MVP succeeds if:

1. Admin can upload and publish questions
2. Teacher can browse the repository
3. Teacher can generate a paper
4. Teacher can submit paper for approval
5. Admin can approve the paper
6. Approved paper can be exported as PDF with answer key

That is the complete MVP.

---

# Current Priorities

### Building now:

1. Question Repository
2. Create/Edit Question
3. Bulk Upload

### Building next:

4. Curriculum Workspace
5. Paper Builder
6. Approval Workflow

### NOT priorities right now:

- Analytics dashboards
- Notifications
- Advanced AI
- Reports
- Performance optimization
- Multi-school

---

# Phase 2 Readiness (SaaS)

Code is structured for future multi-tenant SaaS:

1. **Service layer abstraction** — add `tenantId` filter in one place
2. **Roles in Firestore** — add "super_admin" for multi-school
3. **School config as document** — becomes per-tenant config
4. **AI interface pattern** — swap mock → real with zero changes
5. **PDF reads school config** — per-school branding ready
6. **Centralized repository** — maps to shared bank per tenant
7. **Permissions in config** — add roles without rewrites
8. **admin/ and teacher/ folders** — add role folders (parent, student) easily

---

# Important Product Rule

PaperCraft should always feel:

# calm, editorial, operational, and premium.

Never overcrowded. Never flashy. Never dashboard-heavy. Never ERP-like.

Every feature, every page, every interaction should reinforce this identity.
