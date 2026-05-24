import type { PaperMarksDisplay } from '@/types/paper-instance'

export function formatQuestionMarks(
  marks: number,
  style: PaperMarksDisplay,
): string | null {
  if (style === 'hidden') return null
  if (style === 'paren') return `(${marks})`
  return `[${marks}]`
}
