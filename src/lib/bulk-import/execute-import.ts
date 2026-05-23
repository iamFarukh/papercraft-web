import {
  createChapter,
  createSubject,
  createTopic,
  listChapters,
  listSubjectsForClass,
  listTopics,
} from '@/services/firebase/curriculum'
import { nameKey } from '@/lib/curriculum-normalize'
import { resolveSubjectForImport } from '@/lib/subject-resolve'
import type { ImportField } from '@/lib/bulk-import/fields'
import type { CurriculumApprovals, ValidatedImportRow } from '@/lib/bulk-import/validate-rows'
import type { ImportBatchMeta } from '@/lib/bulk-import/import-batch'
import { batchImportQuestions } from '@/services/firebase/bulk-import'
import type { QuestionDocument } from '@/types/question'
import type { TaxonomyOption } from '@/types/curriculum'

function getMapped(
  row: Record<string, string>,
  mapping: Partial<Record<ImportField, string>>,
  field: ImportField,
): string {
  const col = mapping[field]
  if (!col) return ''
  return (row[col] ?? '').trim()
}

function findByName(options: TaxonomyOption[], name: string): TaxonomyOption | null {
  const key = nameKey(name)
  return options.find((o) => nameKey(o.label) === key) ?? null
}

export type ImportResult = {
  imported: number
  skipped: number
  ids: string[]
}

export async function executeValidatedImport(
  rows: ValidatedImportRow[],
  mapping: Partial<Record<ImportField, string>>,
  approvals: CurriculumApprovals,
  createdBy: string,
  batch?: ImportBatchMeta,
): Promise<ImportResult> {
  const subjectCache = new Map<string, TaxonomyOption[]>()
  const chapterCache = new Map<string, TaxonomyOption[]>()
  const topicCache = new Map<string, TaxonomyOption[]>()
  const createdSubjects = new Map<string, TaxonomyOption>()
  const createdChapters = new Map<string, TaxonomyOption>()
  const createdTopics = new Map<string, TaxonomyOption>()

  const docs: Omit<QuestionDocument, 'createdAt' | 'updatedAt'>[] = []

  for (const row of rows) {
    if (!row.document) continue
    if (row.state === 'failed') continue

    const classNumber = row.document.classNumber
    const subjectName = getMapped(row.raw, mapping, 'subject')
    const chapterName = getMapped(row.raw, mapping, 'chapter')
    const topicName = getMapped(row.raw, mapping, 'topic') || chapterName
    const resolvedSubject = resolveSubjectForImport(subjectName, classNumber)

    const subKey = `${classNumber}|${nameKey(resolvedSubject.name)}`
    let subject = createdSubjects.get(subKey)
    if (!subject) {
      if (!subjectCache.has(String(classNumber))) {
        subjectCache.set(
          String(classNumber),
          await listSubjectsForClass(classNumber, null),
        )
      }
      subject =
        (resolvedSubject.catalogId
          ? { id: resolvedSubject.catalogId, label: resolvedSubject.name }
          : null) ??
        findByName(subjectCache.get(String(classNumber))!, resolvedSubject.name)
      if (!subject && approvals.subjects.has(subKey)) {
        const res = await createSubject(resolvedSubject.name, classNumber)
        if (!res.ok) throw new Error(res.message)
        subject = res.option
      }
      if (subject) createdSubjects.set(subKey, subject)
    }
    if (!subject) continue

    const chKey = `${subKey}|${nameKey(chapterName)}`
    let chapter = createdChapters.get(chKey)
    if (!chapter) {
      const cacheKey = `${classNumber}|${subject.id}`
      if (!chapterCache.has(cacheKey)) {
        chapterCache.set(cacheKey, await listChapters(classNumber, subject.id))
      }
      chapter = findByName(chapterCache.get(cacheKey)!, chapterName)
      if (!chapter && approvals.chapters.has(chKey)) {
        const res = await createChapter(chapterName, classNumber, subject.id)
        if (!res.ok) throw new Error(res.message)
        chapter = res.option
      }
      if (chapter) createdChapters.set(chKey, chapter)
    }
    if (!chapter) continue

    const topKey = `${chapter.id}|${nameKey(topicName)}`
    let topic = createdTopics.get(topKey)
    if (!topic) {
      if (!topicCache.has(chapter.id)) {
        topicCache.set(chapter.id, await listTopics(chapter.id))
      }
      topic = findByName(topicCache.get(chapter.id)!, topicName)
      if (!topic && approvals.topics.has(topKey)) {
        const res = await createTopic(topicName, classNumber, subject.id, chapter.id)
        if (!res.ok) throw new Error(res.message)
        topic = res.option
      }
      if (!topic) topic = { id: chapter.id, label: chapter.label }
      createdTopics.set(topKey, topic)
    }

    docs.push({
      ...row.document,
      subjectId: subject.id,
      chapterId: chapter.id,
      chapterName: chapter.label,
      topicId: topic.id,
      topicName: topic.label,
      status: 'published',
      source: 'bulk_import',
      createdBy,
      importBatchId: batch?.batchId,
      importFileName: batch?.fileName,
    })
  }

  const ids = await batchImportQuestions(docs, createdBy, {
    importBatchId: batch?.batchId,
    importFileName: batch?.fileName,
    status: 'published',
  })
  return {
    imported: ids.length,
    skipped: rows.length - ids.length,
    ids,
  }
}
