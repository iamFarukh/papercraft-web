/** Display lookups for RBSE Classes V–VIII seed curriculum */

export const SUBJECT_LABELS: Record<string, string> = {
  mathematics: 'Mathematics',
  science: 'Science',
  hindi: 'Hindi',
}

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
  return CLASS_LABELS[n] ?? `Class ${n}`
}

export function subjectLabelFromId(id: string): string {
  if (SUBJECT_LABELS[id]) return SUBJECT_LABELS[id]
  if (id.startsWith('sub_')) {
    const name = id
      .slice(4)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
    return name
  }
  return id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function typeLabelFromId(type: string): string {
  return TYPE_LABELS[type] ?? type
}
