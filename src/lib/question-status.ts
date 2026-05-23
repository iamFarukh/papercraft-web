import type { QuestionStatus } from '@/types/question'

/** Firestore lifecycle values — shared without importing the questions service. */
export const ALL_STATUSES: QuestionStatus[] = [
  'draft',
  'published',
  'locked',
  'archived',
]
