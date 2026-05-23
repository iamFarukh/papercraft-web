import type { Timestamp } from 'firebase/firestore'

export type CurriculumLifecycleStatus = 'active' | 'archived'

/** Shared fields for taxonomy documents */
export type TaxonomyBase = {
  name: string
  /** Lowercase trimmed key for duplicate detection */
  nameKey: string
  status?: CurriculumLifecycleStatus
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export type CurriculumClassDoc = TaxonomyBase & {
  /** Numeric class level, e.g. 5 for Class V */
  number: number
}

export type CurriculumSubjectDoc = TaxonomyBase & {
  code?: string
  classNumbers?: number[]
  /** Parsed stream tags: science, commerce, arts, agriculture, all */
  streams?: string[]
  catalogId?: string
  isActive?: boolean
  order?: number
}

export type CurriculumChapterDoc = TaxonomyBase & {
  classNumber: number
  subjectId: string
}

export type CurriculumTopicDoc = TaxonomyBase & {
  classNumber: number
  subjectId: string
  chapterId: string
}

export type TaxonomyOption = {
  id: string
  label: string
}
