/** Display lookups for RBSE curriculum */

import { classLabelForNumber } from '@/lib/rbse-catalog'
import { subjects as RBSE_SUBJECTS } from '@/data/rbse-subjects'

export const SUBJECT_LABELS: Record<string, string> = {
  mathematics: 'Mathematics',
  science: 'Science',
  hindi: 'Hindi',
}

const SUBJECT_NAME_BY_ID = new Map(RBSE_SUBJECTS.map((s) => [s.id, s.name]))

export const CLASS_LABELS: Record<number, string> = {
  5: 'Class V',
  6: 'Class VI',
  7: 'Class VII',
  8: 'Class VIII',
}

export const TYPE_LABELS: Record<string, string> = {
  mcq: 'MCQ',
  short: 'Short Answer',
  long: 'Long Answer',
  very_short: 'Very Short',
  true_false: 'True / False',
  fill_blank: 'Fill in the Blank',
  match: 'Match',
  assertion_reason: 'Assertion–Reason',
}

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
  locked: 'Locked',
  archived: 'Archived',
}

export function classLabelFromNumber(n: number): string {
  return CLASS_LABELS[n] ?? classLabelForNumber(n)
}

export function subjectLabelFromId(id: string): string {
  if (!id?.trim()) {
    return 'Unassigned subject'
  }
  const catalog = SUBJECT_NAME_BY_ID.get(id)
  if (catalog) return catalog
  if (SUBJECT_LABELS[id]) return SUBJECT_LABELS[id]
  if (id.startsWith('pending-')) return 'Custom subject'
  const fromId = id
    .replace(/^sub_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
  if (fromId && fromId.length >= 2) return fromId
  return 'Unknown subject'
}

export function typeLabelFromId(type: string): string {
  return TYPE_LABELS[type] ?? type
}
