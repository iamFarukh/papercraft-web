import {
  classLabelFromNumber,
  STATUS_LABELS,
  subjectLabelFromId,
  typeLabelFromId,
} from '@/config/curriculum'
import type {
  QuestionDifficulty,
  QuestionQueryFilters,
  QuestionRecord,
  QuestionStatus,
  QuestionType,
} from '@/types/question'
import { ALL_STATUSES } from '@/lib/question-status'

export type SortKey = 'recent' | 'usage' | 'marks' | 'chapter'

export type RepositoryFilters = {
  classes: Record<string, boolean>
  subjects: Record<string, boolean>
  chapters: Record<string, boolean>
  difficulty: Record<string, boolean>
  types: Record<string, boolean>
  statuses: Record<string, boolean>
}

export const DIFFICULTY_LABELS = ['Easy', 'Medium', 'Hard'] as const

const DIFFICULTY_TO_LABEL: Record<QuestionDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

const LABEL_TO_DIFFICULTY: Record<string, QuestionDifficulty> = {
  Easy: 'easy',
  Medium: 'medium',
  Hard: 'hard',
}

const CLASS_TO_NUMBER: Record<string, number> = {
  'Class I': 1,
  'Class II': 2,
  'Class III': 3,
  'Class IV': 4,
  'Class V': 5,
  'Class VI': 6,
  'Class VII': 7,
  'Class VIII': 8,
  'Class IX': 9,
  'Class X': 10,
  'Class XI': 11,
  'Class XII': 12,
}

const SUBJECT_TO_ID: Record<string, string> = {
  Mathematics: 'mathematics',
  Science: 'science',
  Hindi: 'hindi',
}

const TYPE_TO_ID: Record<string, QuestionType> = {
  MCQ: 'mcq',
  'Short Answer': 'short',
  'Long Answer': 'long',
  'Very Short': 'very_short',
  'True / False': 'true_false',
  'Fill in the Blank': 'fill_blank',
  Match: 'match',
  'Assertion–Reason': 'assertion_reason',
}

const STATUS_TO_ID: Record<string, QuestionStatus> = {
  Draft: 'draft',
  Published: 'published',
  Locked: 'locked',
  Archived: 'archived',
}

export function difficultyLabel(level: QuestionRecord['difficulty']): string {
  return DIFFICULTY_LABELS[level - 1] ?? 'Medium'
}

export function buildDefaultFilters(questions: QuestionRecord[]): RepositoryFilters {
  const classes = new Set<string>()
  const subjects = new Set<string>()
  const chapters = new Set<string>()
  const types = new Set<string>()

  for (const q of questions) {
    classes.add(q.classLabel)
    subjects.add(q.subject)
    chapters.add(q.chapter)
    types.add(q.type)
  }

  const toRecord = (values: Set<string>) =>
    Object.fromEntries([...values].sort().map((v) => [v, true]))

  return {
    classes: toRecord(classes),
    subjects: toRecord(subjects),
    chapters: toRecord(chapters),
    difficulty: Object.fromEntries(DIFFICULTY_LABELS.map((d) => [d, true])),
    types: toRecord(types),
    statuses: Object.fromEntries(
      ALL_STATUSES.map((s) => [STATUS_LABELS[s], true]),
    ),
  }
}

export function buildEmptyFilters(isAdmin: boolean): RepositoryFilters {
  return {
    classes: {},
    subjects: {},
    chapters: {},
    difficulty: Object.fromEntries(DIFFICULTY_LABELS.map((d) => [d, true])),
    types: {},
    statuses: isAdmin
      ? Object.fromEntries(
          ALL_STATUSES.map((s) => [STATUS_LABELS[s], true]),
        )
      : { Published: true },
  }
}

export function toggleFilter(
  filters: RepositoryFilters,
  group: keyof RepositoryFilters,
  key: string,
): RepositoryFilters {
  const current = filters[group][key] !== false
  return {
    ...filters,
    [group]: { ...filters[group], [key]: !current },
  }
}

export function countActiveInGroup(group: Record<string, boolean>): number {
  return Object.values(group).filter(Boolean).length
}

export function isGroupFullyOff(group: Record<string, boolean>): boolean {
  return countActiveInGroup(group) === 0
}

function activeKeys(group: Record<string, boolean>): string[] {
  return Object.entries(group)
    .filter(([, on]) => on)
    .map(([k]) => k)
}

/** Key for when to re-run the Firestore fetch (not client-side filters). */
export function firestoreQueryKey(
  filters: RepositoryFilters,
  isAdmin: boolean,
): string {
  if (!isAdmin) return 'teacher:published'
  const statuses = activeKeys(filters.statuses)
    .map((s) => STATUS_TO_ID[s])
    .filter(Boolean)
    .sort()
  if (statuses.length === 0 || statuses.length >= ALL_STATUSES.length) {
    return 'admin:all-statuses'
  }
  if (statuses.length === 1) return `admin:status:${statuses[0]}`
  return 'admin:all-statuses'
}

export function filtersToQuery(
  filters: RepositoryFilters,
  isAdmin: boolean,
): QuestionQueryFilters {
  const classNumbers = activeKeys(filters.classes)
    .map((l) => CLASS_TO_NUMBER[l])
    .filter((n): n is number => n !== undefined)

  const subjectIds = activeKeys(filters.subjects)
    .map((s) => SUBJECT_TO_ID[s])
    .filter(Boolean)

  // Chapter filtering is client-side only (keeps Firestore queries simple).
  const chapterIds: string[] = []

  const difficulties = activeKeys(filters.difficulty)
    .map((l) => LABEL_TO_DIFFICULTY[l])
    .filter(Boolean)

  const types = activeKeys(filters.types)
    .map((t) => TYPE_TO_ID[t])
    .filter(Boolean)

  const statuses = isAdmin
    ? activeKeys(filters.statuses)
        .map((s) => STATUS_TO_ID[s])
        .filter(Boolean)
    : ['published']

  return {
    classNumbers,
    subjectIds,
    chapterIds,
    difficulties,
    types,
    statuses: statuses as QuestionStatus[],
  }
}

/** Match chapter filter by id or display name */
function chapterMatches(q: QuestionRecord, activeChapters: string[]): boolean {
  if (activeChapters.length === 0) return true
  return activeChapters.some(
    (c) =>
      q.chapter === c ||
      q.chapterId === c ||
      q.chapterId === c.toLowerCase().replace(/\s+/g, '-'),
  )
}

function matchesTextQuery(q: QuestionRecord, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const haystack = [
    q.id,
    q.bodyText,
    q.chapter,
    q.topic,
    q.classLabel,
    q.subject,
    q.hindi ?? '',
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(needle)
}

function matchesClientFilters(
  q: QuestionRecord,
  filters: RepositoryFilters,
): boolean {
  const { classes, subjects, chapters, difficulty, types, statuses } = filters

  if (!isGroupFullyOff(classes) && classes[q.classLabel] === false) return false
  if (!isGroupFullyOff(subjects) && subjects[q.subject] === false) return false
  if (!isGroupFullyOff(chapters) && !chapterMatches(q, activeKeys(chapters)))
    return false
  if (!isGroupFullyOff(types) && types[q.type] === false) return false

  const diffLabel = difficultyLabel(q.difficulty)
  if (!isGroupFullyOff(difficulty) && difficulty[diffLabel] === false) return false

  if (!isGroupFullyOff(statuses) && statuses[q.status] === false) return false

  return true
}

export function filterQuestionsClient(
  questions: QuestionRecord[],
  filters: RepositoryFilters,
  query: string,
): QuestionRecord[] {
  return questions.filter(
    (q) => matchesClientFilters(q, filters) && matchesTextQuery(q, query),
  )
}

export function sortQuestions(
  questions: QuestionRecord[],
  sort: SortKey,
): QuestionRecord[] {
  const copy = [...questions]
  switch (sort) {
    case 'usage':
      return copy.sort((a, b) => b.usage - a.usage)
    case 'marks':
      return copy.sort((a, b) => b.marks - a.marks)
    case 'chapter':
      return copy.sort((a, b) => a.chapter.localeCompare(b.chapter))
    case 'recent':
    default:
      return copy.sort((a, b) => b.updatedAtMs - a.updatedAtMs)
  }
}

export function activeFilterChips(filters: RepositoryFilters): string[] {
  const chips: string[] = []
  const push = (group: Record<string, boolean>, prefix?: string) => {
    const active = Object.entries(group).filter(([, on]) => on)
    const total = Object.keys(group).length
    if (active.length === 0 || active.length === total || total === 0) return
    if (active.length <= 2) {
      active.forEach(([k]) => chips.push(prefix ? `${prefix}${k}` : k))
    } else {
      chips.push(`${active.length} ${prefix ?? 'filters'}`)
    }
  }
  push(filters.classes)
  push(filters.subjects)
  push(filters.chapters, 'chapters · ')
  push(filters.difficulty, 'difficulty · ')
  push(filters.types, 'types · ')
  push(filters.statuses, 'status · ')
  return chips
}

export function mockQuestionIntel(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  const n = Math.abs(h)
  return {
    quality: 68 + (n % 28),
    alignment: 82 + (n % 16),
    bloom: ['Remember', 'Understand', 'Apply', 'Analyze'][n % 4],
    clarity: 72 + (n % 22),
    duplicateRisk: n % 7 === 0 ? 'medium' : n % 11 === 0 ? 'high' : 'low',
    lastUsed: [
      'Unit Test · Mar 2025',
      'Half-Yearly · 2024',
      'Practice Set · Feb 2025',
      '—',
    ][n % 4],
    papersUsed: 1 + (n % 6),
  }
}

export function filterOptionCounts(
  questions: QuestionRecord[],
  group: keyof RepositoryFilters,
  filters: RepositoryFilters,
  query: string,
): Record<string, number> {
  const base = filterQuestionsClient(questions, filters, query)
  const counts: Record<string, number> = {}

  for (const q of base) {
    let key: string
    switch (group) {
      case 'classes':
        key = q.classLabel
        break
      case 'subjects':
        key = q.subject
        break
      case 'chapters':
        key = q.chapter
        break
      case 'types':
        key = q.type
        break
      case 'difficulty':
        key = difficultyLabel(q.difficulty)
        break
      case 'statuses':
        key = q.status
        break
      default:
        continue
    }
    counts[key] = (counts[key] ?? 0) + 1
  }
  return counts
}

export function mergeFilterOptions(
  current: RepositoryFilters,
  questions: QuestionRecord[],
): RepositoryFilters {
  const next = { ...current }
  const groups: (keyof RepositoryFilters)[] = [
    'classes',
    'subjects',
    'chapters',
    'types',
    'statuses',
  ]

  for (const group of groups) {
    const existing = { ...next[group] }
    for (const q of questions) {
      let key: string
      switch (group) {
        case 'classes':
          key = q.classLabel
          break
        case 'subjects':
          key = q.subject
          break
        case 'chapters':
          key = q.chapter
          break
        case 'types':
          key = q.type
          break
        case 'statuses':
          key = q.status
          break
        default:
          continue
      }
      if (!(key in existing)) existing[key] = true
    }
    next[group] = existing
  }

  return next
}

export function computeRepositoryStats(questions: QuestionRecord[]) {
  const lifecycle = {
    approved: 0,
    draft: 0,
    inReview: 0,
    archived: 0,
  }

  for (const q of questions) {
    if (q.statusRaw === 'published') lifecycle.approved++
    else if (q.statusRaw === 'draft') lifecycle.draft++
    else if (q.statusRaw === 'locked') lifecycle.inReview++
    else if (q.statusRaw === 'archived') lifecycle.archived++
  }

  const qualityScore =
    questions.length === 0
      ? 0
      : Math.round(
          questions.reduce((s, q) => s + mockQuestionIntel(q.id).quality, 0) /
            questions.length,
        )

  return {
    totalLoaded: questions.length,
    qualityScore,
    lifecycle,
  }
}

