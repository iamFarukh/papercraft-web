import type { Timestamp } from 'firebase/firestore'

export type BlueprintQuestionType =
  | 'mcq'
  | 'very_short'
  | 'short_answer'
  | 'long_answer'
  | 'assertion_reason'
  | 'case_study'

export const BLUEPRINT_QUESTION_TYPE_LABELS: Record<BlueprintQuestionType, string> = {
  mcq: 'MCQ',
  very_short: 'Very short',
  short_answer: 'Short answer',
  long_answer: 'Long answer',
  assertion_reason: 'Assertion-reason',
  case_study: 'Case study',
}

export type BlueprintDifficultyMix = {
  easy: number
  medium: number
  hard: number
}

export type BlueprintChapterCoverageMode = 'full_syllabus' | 'selected_chapters'

export type BlueprintChapterRule = {
  chapterId?: string
  chapterName: string
  marksWeight: number
  mandatory?: boolean
  included?: boolean
  difficultyMix?: BlueprintDifficultyMix
}

export type BlueprintInternalChoice = {
  enabled: boolean
  /** Number of questions the student must attempt from the pool. */
  attemptCount?: number
}

export type BlueprintSection = {
  id: string
  title: string
  description?: string
  marksAllocation: number
  questionCount: number
  marksPerQuestion: number
  allowedQuestionTypes: BlueprintQuestionType[]
  internalChoice?: BlueprintInternalChoice
  sectionDifficulty?: BlueprintDifficultyMix
  instructions?: string
}

export type BlueprintUsageStats = {
  paperCount: number
  lastUsedAtMs: number | null
  popularClasses: string[]
}

export type BlueprintDocument = {
  name: string
  examType: string
  description?: string
  instructions?: string
  recommendedClasses: string[]
  recommendedSubjects: string[]
  durationMinutes: number
  totalMarks: number
  sections: BlueprintSection[]
  difficultyDistribution: BlueprintDifficultyMix
  chapterCoverage: {
    mode: BlueprintChapterCoverageMode
    chapters: BlueprintChapterRule[]
  }
  /** System-provided default vs school custom blueprint. */
  isSystem: boolean
  archived: boolean
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
  usageStats?: BlueprintUsageStats
}

export type BlueprintListItem = {
  id: string
  name: string
  examType: string
  description?: string
  totalMarks: number
  durationMinutes: number
  sectionCount: number
  recommendedClasses: string[]
  recommendedSubjects: string[]
  isSystem: boolean
  archived: boolean
  createdBy: string
  createdByLabel: string
  updatedAtMs: number
  /** Usage analytics (optional, populated after papers are created). */
  usagePaperCount?: number
  lastUsedAtMs?: number | null
}

export type SaveBlueprintInput = Omit<
  BlueprintDocument,
  'createdAt' | 'updatedAt' | 'createdBy' | 'isSystem' | 'archived'
> & {
  isSystem?: boolean
  archived?: boolean
}

export type BlueprintDraft = SaveBlueprintInput
