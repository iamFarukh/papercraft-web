/**
 * Lottie placement registry — the implementation roadmap as code.
 *
 * Each entry is a planned premium animation. Until a `.lottie` asset is supplied,
 * `src` stays `null` and every consumer (via <LottiePlayer/>) falls back to its
 * existing static UI — nothing breaks, nothing bloats the bundle.
 *
 * To activate a placement:
 *   1. Drop the file in src/assets/lottie/ (e.g. empty-repository.lottie)
 *   2. Import it (Vite returns a hashed URL string):
 *        import emptyRepository from '@/assets/lottie/empty-repository.lottie'
 *   3. Set `src: emptyRepository` below.
 *
 * Keep assets small (≤ ~50 KB each). Prefer dotLottie (.lottie) over raw JSON.
 */

export type LottieKey =
  // App level
  | 'appBoot'
  | 'authProcessing'
  // Data states
  | 'emptyRepository'
  | 'noSearchResults'
  | 'emptyPapers'
  | 'emptyApprovals'
  | 'offline'
  | 'loadError'
  // Feedback / success moments
  | 'paperApproved'
  | 'paperSubmitted'
  | 'questionBookmarked'
  | 'bulkImportComplete'
  | 'exportComplete'

export type LottiePlacement = {
  /** Asset URL, or null until supplied. */
  src: string | null
  loop: boolean
  /** Accessible label describing the animation's meaning. */
  label: string
  /** Roadmap note: where it lives + what triggers it. */
  note: string
}

export const LOTTIE: Record<LottieKey, LottiePlacement> = {
  appBoot: {
    src: null,
    loop: true,
    label: 'Loading PaperCraft',
    note: 'Root Suspense / initial chunk load. Subtle brand loop.',
  },
  authProcessing: {
    src: null,
    loop: true,
    label: 'Signing in',
    note: 'LoginPage submit, while Firebase auth resolves.',
  },
  emptyRepository: {
    src: null,
    loop: true,
    label: 'No questions yet',
    note: 'RepositoryWorkspace empty-database state. Onboarding nudge.',
  },
  noSearchResults: {
    src: null,
    loop: false,
    label: 'No matching questions',
    note: 'QuestionStream empty after a filter/search yields nothing.',
  },
  emptyPapers: {
    src: null,
    loop: true,
    label: 'No papers yet',
    note: 'PapersListPage empty state.',
  },
  emptyApprovals: {
    src: null,
    loop: true,
    label: 'Nothing awaiting review',
    note: 'ApprovalSubmissionQueue empty state.',
  },
  offline: {
    src: null,
    loop: true,
    label: 'You are offline',
    note: 'ConnectivityBanner offline state.',
  },
  loadError: {
    src: null,
    loop: false,
    label: 'Something went wrong',
    note: 'EmptyStatePanel error variant / ErrorBoundary fallback.',
  },
  paperApproved: {
    src: null,
    loop: false,
    label: 'Paper approved',
    note: 'Signature success moment after approvePaper() resolves.',
  },
  paperSubmitted: {
    src: null,
    loop: false,
    label: 'Submitted for approval',
    note: 'Paper builder, after submitPaperForApproval().',
  },
  questionBookmarked: {
    src: null,
    loop: false,
    label: 'Bookmarked',
    note: 'QuestionCard bookmark toggle — tactile micro-feedback.',
  },
  bulkImportComplete: {
    src: null,
    loop: false,
    label: 'Import complete',
    note: 'BulkImportWizard final step, after batch write.',
  },
  exportComplete: {
    src: null,
    loop: false,
    label: 'Export ready',
    note: 'PaperExportMenu, after PDF/DOCX generation finishes.',
  },
}

export function lottiePlacement(key: LottieKey): LottiePlacement {
  return LOTTIE[key]
}
