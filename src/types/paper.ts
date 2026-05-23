import type { Timestamp } from 'firebase/firestore'

export type PaperStatus = 'draft' | 'submitted' | 'approved' | 'archived'

export type PaperSectionSnapshot = {
  id: string
  title: string
  questionIds: string[]
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
