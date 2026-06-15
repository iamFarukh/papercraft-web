import { buildPrintBlocksFromResolved } from '@/lib/paper-print-layout'
import type { PaperMedium } from '@/lib/paper-medium'
import type { ResolvedPaper } from '@/lib/paper-instance'
import type { QuestionRecord } from '@/types/question'

/**
 * Answer-key model — derived from the same resolved paper + print blocks the
 * paper export uses, so numbering and section order match the question paper
 * exactly. Each entry carries the correct answer (option text for MCQ, True/False,
 * or model answer) plus optional marking notes, as HTML (math + bilingual safe).
 */
export type AnswerKeyEntry = {
  number: number
  /** Section header to print before this entry (only set on a section's first question). */
  sectionLabel: string | null
  answerHtml: string
  answerHiHtml?: string
  solutionHtml?: string
  solutionHiHtml?: string
}

function isMcq(q: QuestionRecord): boolean {
  return q.typeRaw === 'mcq' || q.type === 'MCQ'
}

/** Resolve the correct-answer display (HTML) for a question, medium-aware. */
export function resolveAnswerHtml(
  q: QuestionRecord,
  medium: PaperMedium,
): { answerHtml: string; answerHiHtml?: string } {
  if (isMcq(q)) {
    const letter = (q.answer ?? '').trim().toLowerCase()
    if (!letter) return { answerHtml: '—' }
    const primary =
      medium === 'hindi' && q.mcqOptionsHi ? q.mcqOptionsHi : q.mcqOptions
    const optText = primary?.[letter as 'a' | 'b' | 'c' | 'd']?.trim()
    const answerHtml = optText ? `(${letter}) ${optText}` : `(${letter})`
    let answerHiHtml: string | undefined
    if (medium === 'bilingual') {
      const hiText = q.mcqOptionsHi?.[letter as 'a' | 'b' | 'c' | 'd']?.trim()
      if (hiText) answerHiHtml = `(${letter}) ${hiText}`
    }
    return { answerHtml, answerHiHtml }
  }

  const answerHtml = q.answer?.trim() ? q.answer : '—'
  const answerHiHtml = q.answerHi?.trim() ? q.answerHi : undefined
  return { answerHtml, answerHiHtml }
}

export function buildAnswerKey(resolved: ResolvedPaper): AnswerKeyEntry[] {
  const blocks = buildPrintBlocksFromResolved(resolved)
  const medium = resolved.meta.medium
  const entries: AnswerKeyEntry[] = []
  let pendingSection: string | null = null

  for (const block of blocks) {
    if (block.kind === 'section-head') {
      const titleSource = block.displayTitle ?? block.section.name
      pendingSection = `Section ${block.section.letter} · ${titleSource.split(' · ')[0]}`
    } else if (block.kind === 'question' && block.showNumber !== false) {
      const { answerHtml, answerHiHtml } = resolveAnswerHtml(block.question, medium)
      entries.push({
        number: block.number,
        sectionLabel: pendingSection,
        answerHtml,
        answerHiHtml,
        solutionHtml: block.question.solution?.trim() || undefined,
        solutionHiHtml:
          medium === 'bilingual'
            ? block.question.solutionHi?.trim() || undefined
            : undefined,
      })
      pendingSection = null
    }
  }

  return entries
}
