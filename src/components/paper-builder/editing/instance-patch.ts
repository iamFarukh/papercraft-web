import type {
  PaperInstanceLayer,
  PaperQuestionInstance,
  QuestionFormatOverride,
  SectionFormatOverride,
} from '@/types/paper-instance'
import type { PaperSectionId } from '@/lib/paper-builder'
import type { ResolvedQuestionFormat, ResolvedSectionFormat } from '@/lib/paper-format-config'

function mergeInstancePatch<T extends Record<string, unknown>>(
  base: T,
  patch: Partial<T>,
): T {
  const next = { ...base, ...patch }
  for (const key of Object.keys(patch)) {
    if (patch[key] === undefined) {
      delete next[key]
    }
  }
  return next
}

export function patchQuestionInstance(
  layer: PaperInstanceLayer,
  questionId: string,
  patch: Partial<PaperQuestionInstance>,
): PaperInstanceLayer {
  return {
    ...layer,
    questions: {
      ...layer.questions,
      [questionId]: mergeInstancePatch(layer.questions?.[questionId] ?? {}, patch),
    },
  }
}

export function patchSectionInstance(
  layer: PaperInstanceLayer,
  sectionId: PaperSectionId,
  patch: Record<string, unknown>,
): PaperInstanceLayer {
  return {
    ...layer,
    sections: {
      ...layer.sections,
      [sectionId]: mergeInstancePatch(layer.sections?.[sectionId] ?? {}, patch),
    },
  }
}

function questionFormatToOverride(fmt: ResolvedQuestionFormat): QuestionFormatOverride {
  return {
    marginTop: fmt.marginTop,
    marginBottom: fmt.marginBottom,
    indent: fmt.indent,
    fontSize: fmt.fontSize,
  }
}

function sectionFormatToOverride(fmt: ResolvedSectionFormat): SectionFormatOverride {
  return {
    spacingAbove: fmt.spacingAbove,
    spacingAfterHeader: fmt.spacingAfterHeader,
    questionSpacing: fmt.questionSpacing,
    fontSize: fmt.fontSize,
  }
}

/** Copy one question's resolved format to every question on the paper. */
export function applyQuestionFormatToAllQuestions(
  layer: PaperInstanceLayer,
  sourceFormat: ResolvedQuestionFormat,
  questionIds: string[],
): PaperInstanceLayer {
  const override = questionFormatToOverride(sourceFormat)
  const questions = { ...layer.questions }
  for (const id of questionIds) {
    questions[id] = mergeInstancePatch(
      { ...(questions[id] ?? {}), ...override },
      { spacingMode: undefined },
    )
  }
  return { ...layer, questions }
}

/** Copy one question's format to all questions in the same section only. */
export function applyQuestionFormatToSection(
  layer: PaperInstanceLayer,
  sectionId: PaperSectionId,
  sourceFormat: ResolvedQuestionFormat,
  questionIdsInSection: string[],
): PaperInstanceLayer {
  const override = questionFormatToOverride(sourceFormat)
  const questions = { ...layer.questions }
  for (const id of questionIdsInSection) {
    questions[id] = mergeInstancePatch(
      { ...(questions[id] ?? {}), ...override },
      { spacingMode: undefined },
    )
  }
  return { ...layer, questions }
}

/** Copy one section's format to every section on the paper. */
export function applySectionFormatToAllSections(
  layer: PaperInstanceLayer,
  sourceFormat: ResolvedSectionFormat,
  sectionIds: PaperSectionId[],
): PaperInstanceLayer {
  const override = sectionFormatToOverride(sourceFormat)
  const sections = { ...layer.sections }
  for (const id of sectionIds) {
    sections[id] = mergeInstancePatch(
      { ...(sections[id] ?? {}), ...override },
      { spacingMode: undefined },
    )
  }
  return { ...layer, sections }
}
