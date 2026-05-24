import type { Timestamp } from 'firebase/firestore'
import type { PaperInstanceLayer } from '@/types/paper-instance'
import type {
  BlueprintChapterCoverageMode,
  BlueprintDifficultyMix,
  BlueprintInternalChoice,
  BlueprintQuestionType,
} from '@/types/blueprint'

export type PaperStatus = 'draft' | 'submitted' | 'approved' | 'archived'

export type PaperSectionSnapshot = {
  id: string
  title: string
  questionIds: string[]
}

/** Frozen blueprint policy captured when a paper is created from a blueprint. */
export type PaperBlueprintSectionSnapshot = {
  blueprintSectionId: string
  paperSectionId: string
  title: string
  description?: string
  questionCount: number
  marksPerQuestion: number
  marksAllocation: number
  allowedQuestionTypes: BlueprintQuestionType[]
  internalChoice?: BlueprintInternalChoice
  instructions?: string
  compulsory?: boolean
  minMarks?: number
  maxMarks?: number
}

export type PaperBlueprintSnapshot = {
  name: string
  examType: string
  totalMarks: number
  durationMinutes: number
  instructions?: string
  difficultyDistribution: BlueprintDifficultyMix
  chapterCoverage: {
    mode: BlueprintChapterCoverageMode
    chapters: Array<{
      chapterName: string
      marksWeight: number
      mandatory?: boolean
      included?: boolean
    }>
  }
  sections: PaperBlueprintSectionSnapshot[]
  /** Sections beyond A/B/C that were not mapped into the builder. */
  truncatedSectionCount?: number
}

/** Firestore `papers/{id}` document */
/** Examination language medium — `english` | `hindi` | `bilingual` */
export type PaperMedium = 'english' | 'hindi' | 'bilingual'

export type PaperDocument = {
  title: string
  session: string
  classLabel: string
  subject: string
  medium?: PaperMedium
  examType: string
  duration: string
  totalMarks: number
  instructions: string
  structureNotes?: string
  sectionCount: 1 | 2 | 3
  sections: PaperSectionSnapshot[]
  /** Paper-specific formatting; never mutates repository questions. */
  instanceLayer?: PaperInstanceLayer
  /** Live blueprint reference — may differ from snapshot if blueprint is edited later. */
  blueprintId?: string | null
  /** Blueprint updatedAt ms when the paper was created from a blueprint. */
  blueprintVersion?: number | null
  /** Immutable academic structure captured at paper creation. */
  blueprintSnapshot?: PaperBlueprintSnapshot | null
  status: PaperStatus
  createdBy: string
  submittedAt?: Timestamp | null
  submittedBy?: string | null
  approvedAt?: Timestamp | null
  approvedBy?: string | null
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

/** Admin approval queue row */
export type ApprovalQueueItem = {
  id: string
  title: string
  classLabel: string
  subject: string
  examType: string
  status: PaperStatus
  createdBy: string
  submittedBy: string | null
  submittedAtMs: number | null
  approvedAtMs: number | null
  totalMarks: number
  teacherLabel: string
}

export type PaperListItem = {
  id: string
  title: string
  subject: string
  classLabel: string
  examType: string
  status: PaperStatus
  updatedAtMs: number
  submittedAtMs: number | null
  approvedAtMs: number | null
}

export type SavePaperInput = Omit<
  PaperDocument,
  'createdAt' | 'updatedAt' | 'createdBy' | 'status'
> & {
  status?: PaperStatus
}
