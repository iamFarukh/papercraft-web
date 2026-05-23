import type { Timestamp } from 'firebase/firestore'

export type QuestionStatus = 'draft' | 'published' | 'locked' | 'archived'

export type QuestionDifficulty = 'easy' | 'medium' | 'hard'

export type QuestionType =
  | 'mcq'
  | 'true_false'
  | 'fill_blank'
  | 'short'
  | 'long'
  | 'very_short'
  | 'match'
  | 'assertion_reason'

/** Authoring workspace question types (Pass 5A) */
export type AuthoringQuestionType =
  | 'mcq'
  | 'true_false'
  | 'fill_blank'
  | 'short'
  | 'long'

export type McqOptions = {
  a: string
  b: string
  c: string
  d: string
}

export type McqCorrectKey = keyof McqOptions

export type QuestionLanguage = 'english' | 'bilingual' | 'hindi'

export type BloomLevel =
  | 'remember'
  | 'understand'
  | 'apply'
  | 'analyze'
  | 'evaluate'
  | 'create'

/** Firestore `questions/{id}` document */
export type QuestionDocument = {
  questionText: string
  questionTextHi?: string
  type: QuestionType
  classNumber: number
  subjectId: string
  chapterId: string
  chapterName: string
  topicId: string
  topicName: string
  difficulty: QuestionDifficulty
  marks: number
  bloomLevel: BloomLevel
  status: QuestionStatus
  tags: string[]
  estimatedMinutes: number
  answer?: string
  answerHi?: string
  solution?: string
  solutionHi?: string
  mcqOptions?: McqOptions
  mcqOptionsHi?: McqOptions
  language?: QuestionLanguage
  /** Senior secondary stream (Class XI–XII), e.g. science | commerce | arts */
  stream?: string
  usageCount?: number
  createdBy?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
  /** Set when row came from bulk CSV/XLSX import */
  source?: 'bulk_import' | 'manual'
  importedAt?: Timestamp
  /** Original upload file name for bulk import batch tracking */
  importFileName?: string
  /** Shared id for all questions from one bulk import session */
  importBatchId?: string
  /** Soft-delete: recoverable by admin for 12 hours */
  deletedAt?: Timestamp | null
  deletedBy?: string | null
  /** Status restored on undelete */
  statusBeforeDelete?: QuestionStatus | null
}

export type QuestionFlag = 'new' | 'review' | 'bilingual' | 'missing'

/** UI-facing question row for repository cards */
export type QuestionRecord = {
  id: string
  chapter: string
  topic: string
  type: string
  marks: number
  difficulty: 1 | 2 | 3 | 4
  classLabel: string
  subject: string
  classNumber: number
  subjectId: string
  chapterId: string
  usage: number
  status: 'Draft' | 'Published' | 'Locked' | 'Archived'
  statusRaw: QuestionStatus
  bodyText: string
  hindi?: string
  flags: QuestionFlag[]
  bloomLevel: string
  tags: string[]
  estimatedMinutes: number
  updatedAtMs: number
  createdAtMs?: number
  answer?: string
  answerHi?: string
  solution?: string
  solutionHi?: string
  createdBy?: string
  typeRaw?: QuestionType
  language?: QuestionLanguage
  mcqOptions?: McqOptions
  mcqOptionsHi?: McqOptions
  deletedAtMs?: number | null
  deletedBy?: string
  statusBeforeDelete?: QuestionStatus
  isInTrash?: boolean
  restoreTimeLeft?: string
  importFileName?: string
  importBatchId?: string
  importedAtMs?: number | null
}

export type QuestionQueryFilters = {
  classNumbers: number[]
  subjectIds: string[]
  chapterIds: string[]
  difficulties: QuestionDifficulty[]
  types: QuestionType[]
  statuses: QuestionStatus[]
}

export type GetQuestionsResult = {
  questions: QuestionDocument[]
  ids: string[]
  lastDoc: import('firebase/firestore').QueryDocumentSnapshot | null
  hasMore: boolean
}

export type RepositoryErrorKind = 'network' | 'permission' | 'unknown'

export type RepositoryError = {
  kind: RepositoryErrorKind
  message: string
}
