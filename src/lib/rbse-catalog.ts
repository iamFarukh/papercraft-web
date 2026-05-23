import { subjects } from '@/data/rbse-subjects'
import { nameKey, normalizeDisplayName } from '@/lib/curriculum-normalize'

export type RbseStreamId =
  | 'science'
  | 'commerce'
  | 'arts'
  | 'agriculture'
  | 'all'

export type RbseSubjectRecord = (typeof subjects)[number]

export const RBSE_STREAM_OPTIONS: { id: RbseStreamId; label: string }[] = [
  { id: 'science', label: 'Science' },
  { id: 'commerce', label: 'Commerce' },
  { id: 'arts', label: 'Arts / Humanities' },
  { id: 'agriculture', label: 'Agriculture' },
]

const ROMAN: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
  10: 'X',
  11: 'XI',
  12: 'XII',
}

export function classLabelForNumber(n: number): string {
  return ROMAN[n] ? `Class ${ROMAN[n]}` : `Class ${n}`
}

/** Split composite stream keys from seed data, e.g. science_commerce → [science, commerce] */
export function parseStreamTags(
  stream: string | null | undefined,
): RbseStreamId[] {
  if (!stream || stream === 'null') return []
  if (stream === 'all') return ['all']
  const parts = stream.split('_') as string[]
  const valid = new Set(RBSE_STREAM_OPTIONS.map((s) => s.id))
  valid.add('all')
  const out: RbseStreamId[] = []
  for (const p of parts) {
    if (valid.has(p as RbseStreamId)) out.push(p as RbseStreamId)
  }
  return out.length > 0 ? out : []
}

export function subjectMatchesStream(
  streamTags: RbseStreamId[],
  selected: RbseStreamId | null,
): boolean {
  if (!selected) return streamTags.length === 0 || streamTags.includes('all')
  if (streamTags.length === 0) return true
  if (streamTags.includes('all')) return true
  return streamTags.includes(selected)
}

export function getRbseSubjectsForClass(
  classNumber: number,
  stream: RbseStreamId | null = null,
  options?: { activeOnly?: boolean },
): RbseSubjectRecord[] {
  const activeOnly = options?.activeOnly ?? false

  return subjects
    .filter((s) => s.classes.includes(classNumber))
    .filter((s) => (activeOnly ? s.isActive : true))
    .filter((s) => {
      if (classNumber < 11) return true
      if (!stream) return false
      return subjectMatchesStream(parseStreamTags(s.stream), stream)
    })
    .sort((a, b) => a.order - b.order)
}

export function findRbseSubjectByName(
  rawName: string,
  classNumber: number,
  stream: RbseStreamId | null = null,
): RbseSubjectRecord | undefined {
  const key = nameKey(normalizeDisplayName(rawName))
  return getRbseSubjectsForClass(classNumber, stream, { activeOnly: false }).find(
    (s) => nameKey(s.name) === key,
  )
}

export function isSeniorClass(classNumber: number): boolean {
  return classNumber === 11 || classNumber === 12
}

export const RBSE_CLASS_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const

export const CATALOG_SYNC_VERSION = 2
