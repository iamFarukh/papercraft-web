import {
  flattenPaperQuestions,
  type PaperComposition,
  type PaperSectionDef,
  type PaperSetupState,
} from '@/lib/paper-builder'
import { resolvePaper } from '@/lib/paper-instance'
import { isMissingQuestion } from '@/lib/missing-question'
import type { PaperInstanceLayer } from '@/types/paper-instance'
import type { PaperStatus } from '@/types/paper'

export type SubmissionValidationResult =
  | { ok: true }
  | { ok: false; message: string }

export function validatePaperForSubmission(
  setup: PaperSetupState,
  composition: PaperComposition,
  sections: PaperSectionDef[],
  instanceLayer?: PaperInstanceLayer,
): SubmissionValidationResult {
  if (!setup.examinationName.trim()) {
    return { ok: false, message: 'Add an examination title before submitting.' }
  }
  if (sections.length === 0) {
    return { ok: false, message: 'The paper must include at least one section.' }
  }
  const flat = flattenPaperQuestions(composition, sections)
  const missingCount = flat.filter(({ question }) => isMissingQuestion(question)).length
  if (missingCount > 0) {
    return {
      ok: false,
      message: `Replace or remove ${missingCount} unavailable question${missingCount === 1 ? '' : 's'} before submitting.`,
    }
  }
  const stats = resolvePaper(setup, sections, composition, instanceLayer ?? {}).stats
  if (stats.questionCount < 1) {
    return { ok: false, message: 'Add at least one question before submitting.' }
  }
  if (stats.totalMarks <= 0) {
    return { ok: false, message: 'Total marks must be greater than zero.' }
  }
  return { ok: true }
}

/** Teachers may only compose drafts; admins may edit submitted (not approved) papers. */
export function isReadOnlyPaperBuilder(status: PaperStatus, isAdmin: boolean): boolean {
  if (status === 'draft') return false
  if (status === 'approved') return true
  if (status === 'submitted' && isAdmin) return false
  return true
}

export function canSubmitPaper(status: PaperStatus): boolean {
  return status === 'draft'
}

export function canReopenPaper(status: PaperStatus, isAdmin: boolean): boolean {
  return isAdmin && (status === 'submitted' || status === 'approved')
}

export function canApprovePaper(status: PaperStatus, isAdmin: boolean): boolean {
  return isAdmin && status === 'submitted'
}

export function formatSubmittedBannerDate(ms: number): string {
  if (!ms) return ''
  return new Date(ms).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
