import type { Timestamp } from 'firebase/firestore'

/** Shared fields for taxonomy documents */
export type TaxonomyBase = {
  name: string
  /** Lowercase trimmed key for duplicate detection */
  nameKey: string
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
