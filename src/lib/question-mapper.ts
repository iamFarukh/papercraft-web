import {
  classLabelFromNumber,
  subjectLabelFromId,
  typeLabelFromId,
} from '@/config/curriculum'
import { normalizeImportText } from '@/lib/bulk-import/encoding'
import {
  canRestoreDelete,
  deletedAtMs,
  formatRestoreTimeLeft,
} from '@/lib/question-delete'
import type {
  QuestionDocument,
  QuestionFlag,
  QuestionRecord,
  QuestionStatus,
} from '@/types/question'

function t(value: string | undefined): string | undefined {
  if (!value?.trim()) return value
  return normalizeImportText(value)
}

const DIFFICULTY_NUM: Record<string, 1 | 2 | 3 | 4> = {
  easy: 1,
  medium: 2,
  hard: 3,
}

const STATUS_UI: Record<
  QuestionStatus,
  QuestionRecord['status']
> = {
  draft: 'Draft',
  published: 'Published',
  locked: 'Locked',
  archived: 'Archived',
}

function deriveFlags(doc: QuestionDocument): QuestionFlag[] {
  const flags: QuestionFlag[] = []
  if (doc.questionTextHi?.trim()) flags.push('bilingual')
  if (doc.status === 'draft') flags.push('new')
  if (doc.status === 'locked') flags.push('review')
  return flags
}

export function mapQuestionDoc(
  id: string,
  doc: QuestionDocument,
): QuestionRecord {
  const updatedAtMs = doc.updatedAt?.toMillis?.() ?? Date.now()
  const delMs = deletedAtMs(doc.deletedAt)

  return {
    id,
    chapter: doc.chapterName?.trim() || '—',
    topic: doc.topicName?.trim() || '',
    type: typeLabelFromId(doc.type),
    marks: doc.marks,
    difficulty: DIFFICULTY_NUM[doc.difficulty] ?? 2,
    classLabel: classLabelFromNumber(doc.classNumber),
    subject: subjectLabelFromId(doc.subjectId),
    classNumber: doc.classNumber,
    subjectId: doc.subjectId,
    chapterId: doc.chapterId,
    usage: doc.usageCount ?? 0,
    status: STATUS_UI[doc.status],
    statusRaw: doc.status,
    bodyText: t(doc.questionText) ?? doc.questionText,
    hindi: t(doc.questionTextHi),
    flags: deriveFlags(doc),
    bloomLevel: doc.bloomLevel,
    tags: doc.tags ?? [],
    estimatedMinutes: doc.estimatedMinutes,
    updatedAtMs,
    createdAtMs: doc.createdAt?.toMillis?.(),
    answer: t(doc.answer) ?? doc.answer,
    answerHi: t(doc.answerHi),
    solution: t(doc.solution) ?? doc.solution,
    solutionHi: t(doc.solutionHi),
    createdBy: doc.createdBy,
    typeRaw: doc.type,
    language: doc.language,
    mcqOptions: doc.mcqOptions,
    mcqOptionsHi: doc.mcqOptionsHi,
    deletedAtMs: delMs,
    deletedBy: doc.deletedBy ?? undefined,
    statusBeforeDelete: doc.statusBeforeDelete ?? undefined,
    isInTrash: delMs !== null,
    restoreTimeLeft:
      delMs && canRestoreDelete(doc.deletedAt)
        ? formatRestoreTimeLeft(delMs)
        : undefined,
    importFileName: doc.importFileName,
    importBatchId: doc.importBatchId,
    importedAtMs: doc.importedAt?.toMillis?.() ?? null,
  }
}

export function applyStatusToRecord(
  record: QuestionRecord,
  status: QuestionStatus,
): QuestionRecord {
  const flags: QuestionFlag[] = []
  if (record.hindi?.trim()) flags.push('bilingual')
  if (status === 'draft') flags.push('new')
  if (status === 'locked') flags.push('review')

  return {
    ...record,
    statusRaw: status,
    status: STATUS_UI[status],
    flags,
    updatedAtMs: Date.now(),
  }
}
