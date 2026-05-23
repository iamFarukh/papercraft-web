import { subjectLabelFromId } from '@/config/curriculum'
import type {
  AuthoringQuestionType,
  BloomLevel,
  McqCorrectKey,
  McqOptions,
  QuestionDifficulty,
  QuestionDocument,
  QuestionLanguage,
  QuestionStatus,
} from '@/types/question'

export type QuestionAuthorForm = {
  questionText: string
  questionTextHi: string
  answer: string
  answerHi: string
  solution: string
  solutionHi: string
  type: AuthoringQuestionType
  classNumber: number
  subjectId: string
  subjectName: string
  chapterId: string
  chapterName: string
  topicId: string
  topicName: string
  /** Class XI–XII stream; null for other classes */
  stream: string | null
  difficulty: QuestionDifficulty
  marks: number
  bloomLevel: BloomLevel
  language: QuestionLanguage
  tagsInput: string
  status: QuestionStatus
  mcqOptions: McqOptions
  mcqOptionsHi: McqOptions
  mcqCorrect: McqCorrectKey
  trueFalseAnswer: 'true' | 'false'
}

export const AUTHORING_TYPES: AuthoringQuestionType[] = [
  'mcq',
  'true_false',
  'fill_blank',
  'short',
  'long',
]

export const BLOOM_LEVELS: BloomLevel[] = [
  'remember',
  'understand',
  'apply',
  'analyze',
  'evaluate',
  'create',
]

export function defaultAuthorForm(): QuestionAuthorForm {
  return {
    questionText: '',
    questionTextHi: '',
    answer: '',
    answerHi: '',
    solution: '',
    solutionHi: '',
    type: 'short',
    classNumber: 6,
    subjectId: '',
    subjectName: '',
    chapterId: '',
    chapterName: '',
    topicId: '',
    topicName: '',
    stream: null,
    difficulty: 'medium',
    marks: 2,
    bloomLevel: 'understand',
    language: 'english',
    tagsInput: '',
    status: 'draft',
    mcqOptions: { a: '', b: '', c: '', d: '' },
    mcqOptionsHi: { a: '', b: '', c: '', d: '' },
    mcqCorrect: 'a',
    trueFalseAnswer: 'true',
  }
}

export function docToAuthorForm(doc: QuestionDocument): QuestionAuthorForm {
  const type = AUTHORING_TYPES.includes(doc.type as AuthoringQuestionType)
    ? (doc.type as AuthoringQuestionType)
    : 'short'

  let mcqCorrect: McqCorrectKey = 'a'
  let trueFalseAnswer: 'true' | 'false' = 'true'

  if (type === 'mcq' && doc.answer?.length === 1) {
    const key = doc.answer.toLowerCase()
    if (key === 'a' || key === 'b' || key === 'c' || key === 'd') {
      mcqCorrect = key
    }
  }

  if (type === 'true_false') {
    trueFalseAnswer =
      doc.answer?.toLowerCase() === 'false' ? 'false' : 'true'
  }

  const language =
    doc.language ??
    (doc.questionTextHi?.trim()
      ? 'bilingual'
      : 'english')

  return {
    questionText: doc.questionText,
    questionTextHi: doc.questionTextHi ?? '',
    answer: type === 'mcq' || type === 'true_false' ? '' : (doc.answer ?? ''),
    answerHi: doc.answerHi ?? '',
    solution: doc.solution ?? '',
    solutionHi: doc.solutionHi ?? '',
    type,
    classNumber: doc.classNumber,
    subjectId: doc.subjectId,
    subjectName: subjectLabelFromId(doc.subjectId),
    chapterId: doc.chapterId,
    chapterName: doc.chapterName,
    topicId: doc.topicId,
    topicName: doc.topicName,
    stream: doc.stream ?? null,
    difficulty: doc.difficulty,
    marks: doc.marks,
    bloomLevel: doc.bloomLevel,
    language,
    tagsInput: (doc.tags ?? []).join(', '),
    status: doc.status,
    mcqOptions: doc.mcqOptions ?? { a: '', b: '', c: '', d: '' },
    mcqOptionsHi: doc.mcqOptionsHi ?? { a: '', b: '', c: '', d: '' },
    mcqCorrect,
    trueFalseAnswer,
  }
}

function parseTags(input: string): string[] {
  return input
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

function estimateMinutes(marks: number, type: AuthoringQuestionType): number {
  const base = type === 'mcq' || type === 'true_false' ? 1 : type === 'short' ? 3 : 6
  return Math.max(1, Math.ceil(marks * 1.2 + base))
}

function resolveAnswer(form: QuestionAuthorForm): string {
  if (form.type === 'mcq') return form.mcqCorrect
  if (form.type === 'true_false') {
    return form.trueFalseAnswer === 'true' ? 'True' : 'False'
  }
  return form.answer.trim()
}

export type FormToDocumentOptions = {
  createdBy?: string
  usageCount?: number
}

export function formToDocument(
  form: QuestionAuthorForm,
  options: FormToDocumentOptions = {},
): Omit<QuestionDocument, 'createdAt' | 'updatedAt'> {
  const { createdBy, usageCount = 0 } = options
  const tags = parseTags(form.tagsInput)
  const enStem = form.questionText.trim()
  const hiStem = form.questionTextHi.trim()

  let questionText = enStem
  let questionTextHi: string | undefined

  if (form.language === 'hindi') {
    questionText = hiStem
    questionTextHi = hiStem || undefined
  } else if (form.language === 'bilingual') {
    questionText = enStem
    questionTextHi = hiStem || undefined
  } else {
    questionText = enStem
    questionTextHi = undefined
  }

  const doc: Omit<QuestionDocument, 'createdAt' | 'updatedAt'> = {
    questionText,
    questionTextHi,
    type: form.type,
    classNumber: form.classNumber,
    subjectId: form.subjectId,
    chapterId: form.chapterId,
    chapterName: form.chapterName,
    topicId: form.topicId,
    topicName: form.topicName,
    difficulty: form.difficulty,
    marks: form.marks,
    bloomLevel: form.bloomLevel,
    status: form.status,
    tags,
    estimatedMinutes: estimateMinutes(form.marks, form.type),
    language: form.language,
    answer: resolveAnswer(form),
    solution: form.solution.trim() || undefined,
    solutionHi:
      form.language === 'bilingual'
        ? form.solutionHi.trim() || undefined
        : undefined,
    usageCount,
    createdBy,
  }

  if (form.classNumber === 11 || form.classNumber === 12) {
    doc.stream = form.stream ?? undefined
  }

  if (form.type === 'mcq') {
    doc.answer = form.mcqCorrect
    if (form.language === 'hindi') {
      doc.mcqOptionsHi = { ...form.mcqOptionsHi }
      doc.mcqOptions = { ...form.mcqOptionsHi }
    } else if (form.language === 'bilingual') {
      doc.mcqOptions = { ...form.mcqOptions }
      doc.mcqOptionsHi = { ...form.mcqOptionsHi }
    } else {
      doc.mcqOptions = { ...form.mcqOptions }
    }
  }

  if (form.type !== 'mcq' && form.answer.trim()) {
    doc.answer = form.answer.trim()
    if (form.answerHi.trim()) doc.answerHi = form.answerHi.trim()
  }

  return doc
}

export type AuthorValidation = {
  ok: boolean
  message?: string
}

export function validateAuthorForm(form: QuestionAuthorForm): AuthorValidation {
  if (form.language === 'english' && !form.questionText.trim()) {
    return { ok: false, message: 'English question text is required.' }
  }
  if (form.language === 'hindi' && !form.questionTextHi.trim()) {
    return { ok: false, message: 'Hindi question text is required.' }
  }
  if (
    form.language === 'bilingual' &&
    (!form.questionText.trim() || !form.questionTextHi.trim())
  ) {
    return {
      ok: false,
      message: 'Both English and Hindi question text are required.',
    }
  }
  if (!form.subjectId) {
    return { ok: false, message: 'Select or create a subject.' }
  }
  if (
    (form.classNumber === 11 || form.classNumber === 12) &&
    !form.stream
  ) {
    return { ok: false, message: 'Select a stream for Class XI or XII.' }
  }
  if (!form.chapterId || !form.topicId) {
    return { ok: false, message: 'Select or create chapter and topic.' }
  }
  if (form.marks < 1) {
    return { ok: false, message: 'Marks must be at least 1.' }
  }
  if (form.type === 'mcq') {
    const enOpts = Object.values(form.mcqOptions)
    const hiOpts = Object.values(form.mcqOptionsHi)
    if (form.language === 'english' && enOpts.some((o) => !o.trim())) {
      return { ok: false, message: 'All four English MCQ options are required.' }
    }
    if (form.language === 'hindi' && hiOpts.some((o) => !o.trim())) {
      return { ok: false, message: 'All four Hindi MCQ options are required.' }
    }
    if (
      form.language === 'bilingual' &&
      (enOpts.some((o) => !o.trim()) || hiOpts.some((o) => !o.trim()))
    ) {
      return {
        ok: false,
        message: 'All four MCQ options are required in English and Hindi.',
      }
    }
  }
  if (
    (form.type === 'short' ||
      form.type === 'long' ||
      form.type === 'fill_blank') &&
    !form.answer.trim()
  ) {
    return { ok: false, message: 'Answer is required for this question type.' }
  }
  return { ok: true }
}

export function paperFitLabel(marks: number, type: AuthoringQuestionType): string {
  if (type === 'mcq') return marks <= 1 ? 'Section A · MCQ block' : 'Mixed · MCQ cluster'
  if (type === 'short') return 'Section B · Short answer'
  if (type === 'long') return 'Section C · Long answer'
  if (type === 'true_false') return 'Section A · Objective'
  return 'Flexible · Fill in the blank'
}
