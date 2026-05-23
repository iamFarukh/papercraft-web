import type { QuestionRecord } from '@/types/question'

/** Placeholder when a paper references a question that no longer exists. */
export function createMissingQuestionPlaceholder(id: string): QuestionRecord {
  return {
    id,
    chapter: '—',
    topic: '',
    type: 'Unavailable',
    marks: 0,
    difficulty: 2,
    classLabel: '—',
    subject: '—',
    classNumber: 0,
    subjectId: '',
    chapterId: '',
    usage: 0,
    status: 'Archived',
    statusRaw: 'archived',
    bodyText:
      'This question is no longer available in the repository. It may have been removed or you may not have access.',
    flags: ['missing'],
    bloomLevel: '—',
    tags: [],
    estimatedMinutes: 0,
    updatedAtMs: Date.now(),
  }
}

export function isMissingQuestion(question: QuestionRecord): boolean {
  return question.flags.includes('missing')
}
