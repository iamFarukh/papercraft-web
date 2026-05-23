import { isMissingQuestion } from '@/lib/missing-question'
import { defaultGeneralInstructions, type PaperMedium } from '@/lib/paper-medium'
import { difficultyLabel } from '@/lib/repository-workspace'
import type { QuestionRecord } from '@/types/question'

export type { PaperMedium }

export const PAPER_SETUP_STORAGE_KEY = 'pc-paper-builder-setup'

export const EXAM_TYPE_OPTIONS = [
  'Half-Yearly',
  'Unit Test',
  'Final Examination',
  'Pre-Board',
  'Practice Test',
] as const

export type ExamType = (typeof EXAM_TYPE_OPTIONS)[number]

/** Form values from the examination setup flow (local session only). */
export type PaperSetupState = {
  examinationName: string
  academicSession: string
  classLabel: string
  subject: string
  /** Examination language / medium for print and repository filtering */
  medium: PaperMedium
  examType: ExamType | string
  totalMarks: number
  durationLabel: string
  sectionCount: 1 | 2 | 3
  structureNotes: string
  generalInstructions: string
}

export type RepositoryContextPreview = {
  questionCount: number
  chapters: { name: string; count: number }[]
  coveragePct: number
  coverageLabel: string
}

export type PaperSectionId = 'A' | 'B' | 'C'

export type PaperSectionDef = {
  id: PaperSectionId
  letter: PaperSectionId
  name: string
  instructions: string
  emptyHint: string
  marksEach: number
  plannedCount: number
}

export type PaperMeta = {
  title: string
  schoolName: string
  schoolTagline: string
  classLabel: string
  subject: string
  medium: PaperMedium
  durationLabel: string
  totalMarks: number
  sessionLabel: string
  examType?: string
}

export const DEFAULT_SCHOOL = {
  schoolName: 'Saraswati Vidya Niketan',
  schoolTagline: 'Senior Secondary · Estd. 1962 · Lucknow',
} as const

export const DEFAULT_SETUP: PaperSetupState = {
  examinationName: 'Half-Yearly Examination',
  academicSession: '2025–26 · Term II',
  classLabel: 'Class X',
  subject: 'Mathematics',
  medium: 'english',
  examType: 'Half-Yearly',
  totalMarks: 80,
  durationLabel: '3 hours',
  sectionCount: 3,
  structureNotes: '',
  generalInstructions: defaultGeneralInstructions('english'),
}

export const DEFAULT_PAPER_META: PaperMeta = setupToPaperMeta(DEFAULT_SETUP)

export function setupToPaperMeta(setup: PaperSetupState): PaperMeta {
  const shortClass = setup.classLabel.replace(/^Class\s+/i, '').trim()
  return {
    title: `${setup.examinationName} · ${setup.academicSession}`,
    schoolName: DEFAULT_SCHOOL.schoolName,
    schoolTagline: DEFAULT_SCHOOL.schoolTagline,
    classLabel: shortClass || setup.classLabel,
    subject: setup.subject,
    medium: setup.medium,
    durationLabel: setup.durationLabel,
    totalMarks: setup.totalMarks,
    sessionLabel: setup.academicSession,
    examType: setup.examType,
  }
}

export function sectionsForSetup(setup: PaperSetupState): PaperSectionDef[] {
  return DEFAULT_SECTIONS.slice(0, setup.sectionCount)
}

export function toolbarTitleFromSetup(setup: PaperSetupState): string {
  const shortClass = setup.classLabel.replace(/^Class\s+/i, '').trim()
  return `Class ${shortClass} · ${setup.subject} · ${setup.examType}`
}

/** Primary line for Paper Library rows (matches builder toolbar). */
export function paperListHeading(item: {
  classLabel: string
  subject: string
  examType: string
}): string {
  const shortClass = item.classLabel.replace(/^Class\s+/i, '').trim()
  return `Class ${shortClass} · ${item.subject} · ${item.examType}`
}

export function formatMarksLabel(marks: number): string {
  return marks === 1 ? 'mark' : 'marks'
}

export function readStoredSetup(): PaperSetupState | null {
  try {
    const raw = sessionStorage.getItem(PAPER_SETUP_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PaperSetupState
  } catch {
    return null
  }
}

export function storeSetup(setup: PaperSetupState): void {
  sessionStorage.setItem(PAPER_SETUP_STORAGE_KEY, JSON.stringify(setup))
}

export function clearStoredSetup(): void {
  sessionStorage.removeItem(PAPER_SETUP_STORAGE_KEY)
}

export function computeRepositoryContext(
  questions: QuestionRecord[],
  classLabel: string,
  subject: string,
): RepositoryContextPreview | null {
  if (!classLabel || !subject) return null

  const matched = questions.filter(
    (q) =>
      q.statusRaw === 'published' &&
      !q.isInTrash &&
      q.classLabel === classLabel &&
      q.subject === subject,
  )

  if (matched.length === 0) {
    return {
      questionCount: 0,
      chapters: [],
      coveragePct: 0,
      coverageLabel: 'No published questions for this class and subject yet.',
    }
  }

  const byChapter = new Map<string, number>()
  for (const q of matched) {
    byChapter.set(q.chapter, (byChapter.get(q.chapter) ?? 0) + 1)
  }

  const chapters = [...byChapter.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const coveragePct = Math.min(100, Math.round((chapters.length / 12) * 100))
  const coverageLabel =
    chapters.length >= 8
      ? 'Broad syllabus coverage in the repository.'
      : chapters.length >= 4
        ? 'Core chapters represented — add more for wider coverage.'
        : 'Limited chapter coverage — consider expanding the bank.'

  return {
    questionCount: matched.length,
    chapters,
    coveragePct,
    coverageLabel,
  }
}

export const DEFAULT_SECTIONS: PaperSectionDef[] = [
  {
    id: 'A',
    letter: 'A',
    name: 'Compulsory · 1 mark each',
    instructions:
      'All questions in Section A are compulsory. Tick the most appropriate option.',
    emptyHint: 'Add 1-mark MCQ or one-word questions here',
    marksEach: 1,
    plannedCount: 6,
  },
  {
    id: 'B',
    letter: 'B',
    name: 'Short answer · 3 marks each',
    instructions:
      'Section B contains short-answer questions. Internal choice provided in 2 questions.',
    emptyHint: 'Add 3-mark Short Answer questions here',
    marksEach: 3,
    plannedCount: 6,
  },
  {
    id: 'C',
    letter: 'C',
    name: 'Long answer · 5 marks each',
    instructions: 'Section C contains long-answer questions. Show all working.',
    emptyHint: 'Add 5-mark Long Answer questions here',
    marksEach: 5,
    plannedCount: 4,
  },
]

export type PaperComposition = Record<PaperSectionId, QuestionRecord[]>

export function emptyComposition(): PaperComposition {
  return { A: [], B: [], C: [] }
}

export function allPaperQuestionIds(
  composition: PaperComposition,
  sections: PaperSectionDef[] = DEFAULT_SECTIONS,
): Set<string> {
  const ids = new Set<string>()
  for (const section of sections) {
    for (const q of composition[section.id]) ids.add(q.id)
  }
  return ids
}

export function flattenPaperQuestions(
  composition: PaperComposition,
  sections: PaperSectionDef[] = DEFAULT_SECTIONS,
): { sectionId: PaperSectionId; question: QuestionRecord }[] {
  const rows: { sectionId: PaperSectionId; question: QuestionRecord }[] = []
  for (const section of sections) {
    for (const question of composition[section.id]) {
      rows.push({ sectionId: section.id, question })
    }
  }
  return rows
}

export type PaperStats = {
  totalMarks: number
  estimatedMinutes: number
  questionCount: number
  diffEasy: number
  diffMed: number
  diffHard: number
  sectionCounts: Record<PaperSectionId, number>
  sectionMarks: Record<PaperSectionId, number>
  statusLabel: string
  statusHint: string
  ready: boolean
}

function difficultyBucket(level: QuestionRecord['difficulty']): 'easy' | 'med' | 'hard' {
  if (level <= 2) return 'easy'
  if (level === 3) return 'med'
  return 'hard'
}

export function computePaperStats(
  composition: PaperComposition,
  sections: PaperSectionDef[] = DEFAULT_SECTIONS,
): PaperStats {
  const flat = flattenPaperQuestions(composition, sections)
  let totalMarks = 0
  let estimatedMinutes = 0
  let diffEasy = 0
  let diffMed = 0
  let diffHard = 0
  const sectionCounts: Record<PaperSectionId, number> = { A: 0, B: 0, C: 0 }
  const sectionMarks: Record<PaperSectionId, number> = { A: 0, B: 0, C: 0 }

  for (const { sectionId, question } of flat) {
    if (isMissingQuestion(question)) continue
    totalMarks += question.marks
    estimatedMinutes += question.estimatedMinutes || 0
    sectionCounts[sectionId] += 1
    sectionMarks[sectionId] += question.marks
    const bucket = difficultyBucket(question.difficulty)
    if (bucket === 'easy') diffEasy += 1
    else if (bucket === 'med') diffMed += 1
    else diffHard += 1
  }

  const questionCount = flat.filter(({ question }) => !isMissingQuestion(question)).length
  let statusLabel = 'Empty draft'
  let statusHint = 'Add questions to begin composing.'
  let ready = false

  if (questionCount > 0) {
    statusLabel = 'In progress'
    statusHint = 'Keep composing — save and preview when ready.'
    if (questionCount >= 4) {
      ready = true
      statusLabel = 'Taking shape'
      statusHint = 'Review section balance before submitting.'
    }
  }

  return {
    totalMarks,
    estimatedMinutes,
    questionCount,
    diffEasy,
    diffMed,
    diffHard,
    sectionCounts,
    sectionMarks,
    statusLabel,
    statusHint,
    ready,
  }
}

export type SectionSummary = {
  questionCount: number
  totalMarks: number
  estimatedMinutes: number
}

export type ReplaceTarget = {
  sectionId: PaperSectionId
  questionId: string
  source: QuestionRecord
}

export function computeSectionSummary(items: QuestionRecord[]): SectionSummary {
  return {
    questionCount: items.length,
    totalMarks: items.reduce((s, q) => s + q.marks, 0),
    estimatedMinutes: items.reduce((s, q) => s + (q.estimatedMinutes || 0), 0),
  }
}

/** Global Q1…Qn numbering across sections in order. */
export function buildGlobalQuestionNumbers(
  composition: PaperComposition,
  sections: PaperSectionDef[],
): Map<string, number> {
  const map = new Map<string, number>()
  let n = 0
  for (const section of sections) {
    for (const q of composition[section.id]) {
      n += 1
      map.set(q.id, n)
    }
  }
  return map
}

export function isCompatibleReplacement(
  source: QuestionRecord,
  candidate: QuestionRecord,
): boolean {
  return (
    source.marks === candidate.marks &&
    source.type === candidate.type &&
    source.difficulty === candidate.difficulty
  )
}

export function moveQuestionInSection(
  composition: PaperComposition,
  sectionId: PaperSectionId,
  questionId: string,
  direction: 'up' | 'down',
): PaperComposition {
  const list = [...composition[sectionId]]
  const idx = list.findIndex((q) => q.id === questionId)
  if (idx < 0) return composition
  const swap = direction === 'up' ? idx - 1 : idx + 1
  if (swap < 0 || swap >= list.length) return composition
  ;[list[idx], list[swap]] = [list[swap]!, list[idx]!]
  return { ...composition, [sectionId]: list }
}

export function questionNumberInPaper(
  composition: PaperComposition,
  sectionId: PaperSectionId,
  questionId: string,
  sections: PaperSectionDef[] = DEFAULT_SECTIONS,
): number {
  return buildGlobalQuestionNumbers(composition, sections).get(questionId) ?? 0
}

export function shortQuestionId(id: string): string {
  if (id.length <= 10) return id
  return `Q-${id.slice(-4).toUpperCase()}`
}

export function difficultySummary(level: QuestionRecord['difficulty']): string {
  return difficultyLabel(level)
}
