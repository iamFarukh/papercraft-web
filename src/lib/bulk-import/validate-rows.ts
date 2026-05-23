import {
  ensureCurriculumSeeded,
  listChapters,
  listSubjectsForClass,
  listTopics,
} from '@/services/firebase/curriculum'
import { classLabelForNumber } from '@/lib/rbse-catalog'
import { nameKey } from '@/lib/curriculum-normalize'
import { resolveSubjectForImport } from '@/lib/subject-resolve'
import type { ImportField } from '@/lib/bulk-import/fields'
import {
  parseBloom,
  parseClassNumber,
  parseDifficulty,
  parseMarks,
  parseMcqKey,
  parseQuestionType,
  parseTags,
  rowTextKey,
} from '@/lib/bulk-import/parse-values'
import type { QuestionDocument } from '@/types/question'
import type { TaxonomyOption } from '@/types/curriculum'

export type RowValidationState = 'valid' | 'warning' | 'failed'

export type CurriculumNeeds = {
  subject?: string
  chapter?: string
  topic?: string
}

export type ValidatedImportRow = {
  rowNumber: number
  raw: Record<string, string>
  state: RowValidationState
  issues: string[]
  curriculumNeeds: CurriculumNeeds
  document: Omit<QuestionDocument, 'createdAt' | 'updatedAt'> | null
}

export type CurriculumApprovals = {
  subjects: Set<string>
  chapters: Set<string>
  topics: Set<string>
}

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

function buildDocument(
  row: Record<string, string>,
  mapping: Partial<Record<ImportField, string>>,
  resolved: {
    classNumber: number
    subjectId: string
    subjectName: string
    chapterId: string
    chapterName: string
    topicId: string
    topicName: string
  },
): Omit<QuestionDocument, 'createdAt' | 'updatedAt'> {
  const en = getMapped(row, mapping, 'questionTextEn')
  const hiText = getMapped(row, mapping, 'questionTextHi')
  const type = parseQuestionType(getMapped(row, mapping, 'questionType'))!
  const difficulty = parseDifficulty(getMapped(row, mapping, 'difficulty'))!
  const marks = parseMarks(getMapped(row, mapping, 'marks'))!
  const tags = parseTags(getMapped(row, mapping, 'tags'))
  const bloomLevel = parseBloom(getMapped(row, mapping, 'bloomLevel'))
  const estRaw = getMapped(row, mapping, 'estimatedMinutes')
  const estimatedMinutes = estRaw
    ? Math.max(1, Number(estRaw) || 1)
    : marks <= 1
      ? 2
      : marks <= 3
        ? 4
        : 8

  const language =
    en && hiText ? 'bilingual' : hiText && !en ? 'hindi' : 'english'

  let questionText = en
  let questionTextHi: string | undefined
  if (language === 'hindi') {
    questionText = hiText
    questionTextHi = hiText || undefined
  } else if (language === 'bilingual') {
    questionText = en
    questionTextHi = hiText || undefined
  }

  const doc: Omit<QuestionDocument, 'createdAt' | 'updatedAt'> = {
    questionText,
    questionTextHi,
    type,
    classNumber: resolved.classNumber,
    subjectId: resolved.subjectId,
    chapterId: resolved.chapterId,
    chapterName: resolved.chapterName,
    topicId: resolved.topicId,
    topicName: resolved.topicName,
    difficulty,
    marks,
    bloomLevel,
    status: 'published',
    tags,
    estimatedMinutes,
    usageCount: 0,
    language,
    source: 'bulk_import',
  }

  const answerRaw = getMapped(row, mapping, 'answer')
  const solution = getMapped(row, mapping, 'solution')

  if (type === 'mcq') {
    doc.mcqOptions = {
      a: getMapped(row, mapping, 'optionA'),
      b: getMapped(row, mapping, 'optionB'),
      c: getMapped(row, mapping, 'optionC'),
      d: getMapped(row, mapping, 'optionD'),
    }
    const correct =
      parseMcqKey(getMapped(row, mapping, 'correctOption')) ??
      parseMcqKey(answerRaw) ??
      'a'
    doc.answer = correct
  } else if (type === 'true_false') {
    doc.answer = answerRaw.toLowerCase().startsWith('f') ? 'False' : 'True'
  } else if (answerRaw) {
    doc.answer = answerRaw
  }

  if (solution) doc.solution = solution

  return doc
}

export async function validateImportRows(
  rows: Record<string, string>[],
  mapping: Partial<Record<ImportField, string>>,
  approvals: CurriculumApprovals,
): Promise<ValidatedImportRow[]> {
  await ensureCurriculumSeeded()

  const results: ValidatedImportRow[] = []
  const seenText = new Map<string, number>()
  const subjectCache = new Map<string, TaxonomyOption[]>()
  const chapterCache = new Map<string, TaxonomyOption[]>()
  const topicCache = new Map<string, TaxonomyOption[]>()

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i]!
    const rowNumber = i + 2
    const issues: string[] = []
    const curriculumNeeds: CurriculumNeeds = {}
    let state: RowValidationState = 'valid'

    const en = getMapped(raw, mapping, 'questionTextEn')
    const hi = getMapped(raw, mapping, 'questionTextHi')
    if (!en && !hi) {
      issues.push('Question text is empty (English or Hindi required).')
      state = 'failed'
    }

    const classNumber = parseClassNumber(getMapped(raw, mapping, 'class'))
    if (classNumber === null) {
      issues.push(
        'Class is missing or not recognized (use 9, Class IX, CLASS 9, or Roman numerals I–XII).',
      )
      state = 'failed'
    }

    const type = parseQuestionType(getMapped(raw, mapping, 'questionType'))
    if (!type) {
      issues.push('Question type is invalid (e.g. MCQ, Short Answer).')
      state = 'failed'
    }

    const difficulty = parseDifficulty(getMapped(raw, mapping, 'difficulty'))
    if (!difficulty) {
      issues.push('Difficulty must be easy, medium, or hard.')
      state = 'failed'
    }

    const marks = parseMarks(getMapped(raw, mapping, 'marks'))
    if (marks === null) {
      issues.push('Marks must be a number between 1 and 100.')
      state = 'failed'
    }

    const subjectName = getMapped(raw, mapping, 'subject')
    const chapterName = getMapped(raw, mapping, 'chapter')
    if (!subjectName) {
      issues.push('Subject is required.')
      state = 'failed'
    }
    if (!chapterName) {
      issues.push('Chapter is required.')
      state = 'failed'
    }

    if (state === 'failed') {
      results.push({
        rowNumber,
        raw,
        state,
        issues,
        curriculumNeeds,
        document: null,
      })
      continue
    }

    const textKey = rowTextKey(en, hi)
    if (seenText.has(textKey)) {
      issues.push(`Duplicate question text (same as row ${seenText.get(textKey)}).`)
      if (state === 'valid') state = 'warning'
    } else {
      seenText.set(textKey, rowNumber)
    }

    if (type === 'mcq') {
      const opts = ['optionA', 'optionB', 'optionC', 'optionD'] as const
      const missing = opts.filter((o) => !getMapped(raw, mapping, o))
      if (missing.length > 0) {
        issues.push('MCQ rows should include options A–D columns.')
        if (state === 'valid') state = 'warning'
      }
    }

    const classKey = String(classNumber)
    if (!subjectCache.has(classKey)) {
      subjectCache.set(classKey, await listSubjectsForClass(classNumber!, null))
    }
    const subjects = subjectCache.get(classKey)!
    const subjectResolve = resolveSubjectForImport(subjectName, classNumber!)

    if (subjectResolve.suggestion) {
      issues.push(
        `Subject "${subjectName}" is not recognized for ${classLabelForNumber(classNumber!)}. Did you mean "${subjectResolve.suggestion}"?`,
      )
      results.push({
        rowNumber,
        raw,
        state: 'failed',
        issues,
        curriculumNeeds,
        document: null,
      })
      continue
    }

    let subject: TaxonomyOption | null = null
    const subKey = `${classNumber}|${nameKey(subjectResolve.name || subjectName)}`

    if (subjectResolve.catalogId) {
      subject = { id: subjectResolve.catalogId, label: subjectResolve.name }
    } else {
      subject = findByName(subjects, subjectResolve.name)
    }

    if (!subject && state !== 'failed') {
      curriculumNeeds.subject = subjectResolve.name
      subject = { id: `pending-sub-${subKey}`, label: subjectResolve.name }
      if (state === 'valid') state = 'warning'
    }

    const chCacheKey = `${classNumber}|${subject.id.startsWith('pending') ? subjectName : subject.id}`
    if (!chapterCache.has(chCacheKey) && !subject.id.startsWith('pending')) {
      chapterCache.set(
        chCacheKey,
        await listChapters(classNumber!, subject.id),
      )
    }
    const chapters = chapterCache.get(chCacheKey) ?? []
    let chapter =
      subject.id.startsWith('pending') ? null : findByName(chapters, chapterName)

    if (!chapter) {
      const chApproveKey = `${subKey}|${nameKey(chapterName)}`
      curriculumNeeds.chapter = chapterName
      chapter = { id: `pending-ch-${chApproveKey}`, label: chapterName }
      if (state === 'valid') state = 'warning'
    }

    const topicName = getMapped(raw, mapping, 'topic') || chapterName
    let topic: TaxonomyOption | null = null
    if (chapter.id && !chapter.id.startsWith('pending')) {
      if (!topicCache.has(chapter.id)) {
        topicCache.set(chapter.id, await listTopics(chapter.id))
      }
      topic = findByName(topicCache.get(chapter.id)!, topicName)
      if (!topic && topicName !== chapterName) {
        const topApproveKey = `${chapter.id}|${nameKey(topicName)}`
        curriculumNeeds.topic = topicName
        topic = { id: `pending-top-${topApproveKey}`, label: topicName }
        if (state === 'valid') state = 'warning'
      }
    }

    if (!topic && chapter) {
      topic = { id: chapter.id, label: chapter.label }
    }

    if (state === 'failed') {
      results.push({
        rowNumber,
        raw,
        state,
        issues,
        curriculumNeeds,
        document: null,
      })
      continue
    }

    const document = buildDocument(raw, mapping, {
      classNumber: classNumber!,
      subjectId: subject!.id.startsWith('pending') ? '' : subject!.id,
      subjectName: subject!.label,
      chapterId: chapter!.id.startsWith('pending') ? '' : chapter!.id,
      chapterName: chapter!.label,
      topicId: topic!.id.startsWith('pending') ? '' : topic!.id,
      topicName: topic!.label,
    })

    results.push({
      rowNumber,
      raw,
      state,
      issues,
      curriculumNeeds,
      document,
    })
  }

  return results
}

function hasNewCurriculum(row: ValidatedImportRow): boolean {
  return Boolean(
    row.curriculumNeeds.subject ||
      row.curriculumNeeds.chapter ||
      row.curriculumNeeds.topic,
  )
}

export function summarizeValidation(rows: ValidatedImportRow[]) {
  const importable = rows.filter((r) => r.document && r.state !== 'failed')
  return {
    total: rows.length,
    valid: rows.filter((r) => r.state === 'valid').length,
    warning: rows.filter((r) => r.state === 'warning').length,
    failed: rows.filter((r) => r.state === 'failed').length,
    newCurriculum: importable.filter(hasNewCurriculum).length,
    ready: importable.filter((r) => !hasNewCurriculum(r)).length,
    review: importable.filter(
      (r) => r.state === 'warning' && !hasNewCurriculum(r),
    ).length,
    importable: importable.length,
  }
}

export type CurriculumToCreate = {
  key: string
  classNumber: number
  subject: string
  chapter?: string
  topic?: string
  questionCount: number
}

export function collectCurriculumToCreate(
  rows: ValidatedImportRow[],
  mapping: Partial<Record<ImportField, string>>,
): CurriculumToCreate[] {
  const map = new Map<string, CurriculumToCreate>()
  for (const row of rows) {
    if (!row.document || row.state === 'failed') continue
    const n = row.curriculumNeeds
    if (!n.subject && !n.chapter && !n.topic) continue
    const classNumber = row.document.classNumber
    const subject = n.subject ?? getMapped(row.raw, mapping, 'subject')
    const chapter = n.chapter ?? getMapped(row.raw, mapping, 'chapter')
    const key = [classNumber, subject, chapter ?? '', n.topic ?? ''].join('|')
    const existing = map.get(key)
    if (existing) {
      existing.questionCount += 1
      continue
    }
    map.set(key, {
      key,
      classNumber,
      subject: typeof subject === 'string' ? subject : String(subject),
      chapter,
      topic: n.topic,
      questionCount: 1,
    })
  }
  return [...map.values()]
}

/** Human-readable row status for the preview table. */
export function rowStatusLabel(row: ValidatedImportRow): string {
  if (row.state === 'failed') return 'Needs fix'
  if (hasNewCurriculum(row)) return 'New curriculum'
  if (row.state === 'warning') return 'Review'
  return 'Ready'
}

/** Issues shown in preview — data problems only, not curriculum names. */
export function rowDataIssues(row: ValidatedImportRow): string[] {
  return row.issues.filter(
    (issue) =>
      !/not found/i.test(issue) && !/confirm to create/i.test(issue),
  )
}

export function collectCurriculumNeeds(
  rows: ValidatedImportRow[],
): CurriculumNeeds[] {
  const unique = new Map<string, CurriculumNeeds>()
  for (const row of rows) {
    const n = row.curriculumNeeds
    if (!n.subject && !n.chapter && !n.topic) continue
    const key = [n.subject ?? '', n.chapter ?? '', n.topic ?? ''].join('|')
    unique.set(key, n)
  }
  return [...unique.values()]
}

/** Build approval keys matching execute-import / validation. */
export function buildApprovalsFromRows(
  rows: ValidatedImportRow[],
  mapping: Partial<Record<ImportField, string>>,
): CurriculumApprovals {
  const next: CurriculumApprovals = {
    subjects: new Set(),
    chapters: new Set(),
    topics: new Set(),
  }
  for (const row of rows) {
    const n = row.curriculumNeeds
    if (!n.subject && !n.chapter && !n.topic) continue
    const classNumber =
      row.document?.classNumber ??
      parseClassNumber(getMapped(row.raw, mapping, 'class'))
    if (classNumber === null) continue
    const subjectName = n.subject ?? getMapped(row.raw, mapping, 'subject')
    if (!subjectName) continue
    const subKey = `${classNumber}|${nameKey(subjectName)}`
    if (n.subject) next.subjects.add(subKey)
    const chapterName = n.chapter ?? getMapped(row.raw, mapping, 'chapter')
    if (n.chapter && chapterName) {
      next.chapters.add(`${subKey}|${nameKey(chapterName)}`)
    }
    if (n.topic) {
      const chapterId =
        row.document?.chapterId && !row.document.chapterId.startsWith('pending')
          ? row.document.chapterId
          : `pending-ch-${subKey}|${nameKey(chapterName)}`
      next.topics.add(`${chapterId}|${nameKey(n.topic)}`)
    }
  }
  return next
}
