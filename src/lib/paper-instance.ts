import {
  applySmartFitFormat,
  applyHeaderPreset,
  applyLinkedMargin,
  applyMarginPreset,
  formatConfigToPrintSettings,
  normalizeFormatConfig,
  resolveQuestionFormat,
  resolveSectionFormat,
  type ResolvedQuestionFormat,
  type ResolvedSectionFormat,
} from '@/lib/paper-format-config'
import {
  DEFAULT_SCHOOL,
  setupToPaperMeta,
  type PaperComposition,
  type PaperMeta,
  type PaperSectionDef,
  type PaperSectionId,
  type PaperSetupState,
  type PaperStats,
} from '@/lib/paper-builder'
import { sectionLetter } from '@/lib/blueprint-utils'
import { isMissingQuestion } from '@/lib/missing-question'
import type {
  PaperFormatConfig,
  PaperHeaderPreset,
  PaperInstanceLayer,
  PaperPresentation,
  PaperPrintSettings,
  PaperQuestionInstance,
  PaperSectionInstance,
  PaperSpacingMode,
} from '@/types/paper-instance'
import type { QuestionRecord } from '@/types/question'

export const DEFAULT_PRINT_SETTINGS: PaperPrintSettings = {
  fontSize: 'normal',
  spacingMode: 'normal',
  fontFamily: 'serif',
  lineSpacing: 1.25,
  headerPreset: 'standard',
  marksDisplay: 'bracket',
}

export const DEFAULT_PRESENTATION: PaperPresentation = {
  schoolName: DEFAULT_SCHOOL.schoolName,
  schoolTagline: DEFAULT_SCHOOL.schoolTagline,
  showHeader: true,
  showFooter: true,
  headerRepeatMode: 'firstPageOnly',
  showSchoolLogo: true,
  showSchoolTagline: true,
  showExamTitle: true,
  showExamMetaRow: true,
}

export function defaultPaperInstanceLayer(): PaperInstanceLayer {
  return {
    presentation: { ...DEFAULT_PRESENTATION },
    printSettings: { ...DEFAULT_PRINT_SETTINGS },
    formatConfig: {},
    sections: {},
    questions: {},
  }
}

/** Firestore rejects `undefined` — strip recursively before persist. */
export function stripUndefinedDeep<T>(value: T): T {
  if (value === undefined) return value
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as T
  }

  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (val === undefined) continue
    out[key] = stripUndefinedDeep(val)
  }
  return out as T
}

export function normalizeInstanceLayer(
  raw?: PaperInstanceLayer | null,
): PaperInstanceLayer {
  if (!raw) return defaultPaperInstanceLayer()
  return stripUndefinedDeep({
    presentation: {
      ...DEFAULT_PRESENTATION,
      ...raw.presentation,
    },
    printSettings: {
      ...DEFAULT_PRINT_SETTINGS,
      ...raw.printSettings,
    },
    formatConfig: raw.formatConfig ?? {},
    sections: raw.sections ?? {},
    questions: raw.questions ?? {},
  })
}

export type ResolvedQuestion = {
  question: QuestionRecord
  sectionId: PaperSectionId
  repositoryMarks: number
  effectiveMarks: number
  displayNumber: number
  showNumber: boolean
  hidden: boolean
  localInstructions?: string
  spacingMode: PaperSpacingMode
  questionFormat: ResolvedQuestionFormat
}

export type ResolvedSection = PaperSectionDef & {
  effectiveTitle: string
  effectiveInstructions: string
  showNumbering: boolean
  spacingMode: PaperSpacingMode
  order: number
  hidden: boolean
  questions: ResolvedQuestion[]
  sectionFormat: ResolvedSectionFormat
}

export type ResolvedPaper = {
  setup: PaperSetupState
  meta: PaperMeta
  sections: ResolvedSection[]
  presentation: PaperPresentation
  printSettings: PaperPrintSettings
  formatConfig: PaperFormatConfig
  stats: PaperStats
}

function sectionOrderIndex(id: PaperSectionId): number {
  if (id === 'A') return 0
  if (id === 'B') return 1
  return 2
}

function getSectionInstance(
  layer: PaperInstanceLayer,
  sectionId: PaperSectionId,
): PaperSectionInstance {
  return layer.sections?.[sectionId] ?? {}
}

function getQuestionInstance(
  layer: PaperInstanceLayer,
  questionId: string,
): PaperQuestionInstance {
  return layer.questions?.[questionId] ?? {}
}

export function effectiveQuestionMarks(
  question: QuestionRecord,
  instance?: PaperQuestionInstance,
): number {
  if (instance?.marksOverride != null && instance.marksOverride >= 0) {
    return instance.marksOverride
  }
  return question.marks
}

export function resolvePaper(
  setup: PaperSetupState,
  sectionDefs: PaperSectionDef[],
  composition: PaperComposition,
  instanceLayer: PaperInstanceLayer,
  school?: { schoolName: string; schoolTagline: string; schoolLogoURL?: string | null },
): ResolvedPaper {
  const layer = normalizeInstanceLayer(instanceLayer)
  const baseMeta = setupToPaperMeta(setup, school)
  const presentation = layer.presentation as PaperPresentation

  const meta: PaperMeta = {
    ...baseMeta,
    schoolName: presentation.schoolName?.trim() || baseMeta.schoolName,
    schoolTagline: presentation.schoolTagline?.trim() || baseMeta.schoolTagline,
    schoolLogoURL: baseMeta.schoolLogoURL,
    totalMarks: setup.totalMarks,
  }

  const orderedDefs = [...sectionDefs].sort((a, b) => {
    const ao = getSectionInstance(layer, a.id).order ?? sectionOrderIndex(a.id)
    const bo = getSectionInstance(layer, b.id).order ?? sectionOrderIndex(b.id)
    return ao - bo
  })

  const formatConfig = normalizeFormatConfig(layer.formatConfig, layer.printSettings)
  const sections: ResolvedSection[] = []
  let displayCounter = 0
  let visibleSectionIndex = 0

  for (const def of orderedDefs) {
    const secInst = getSectionInstance(layer, def.id)
    if (secInst.hidden) continue

    const displayLetter = sectionLetter(visibleSectionIndex) as PaperSectionId
    visibleSectionIndex += 1

    const sectionFormat = resolveSectionFormat(formatConfig, secInst)
    const resolvedQuestions: ResolvedQuestion[] = []
    for (const question of composition[def.id]) {
      const qInst = getQuestionInstance(layer, question.id)
      if (qInst.hidden) continue
      const showNumber = !qInst.hideNumber
      if (showNumber) displayCounter += 1
      const displayNumber = showNumber ? (qInst.customNumber ?? displayCounter) : 0

      const questionFormat = resolveQuestionFormat(
        formatConfig,
        question.id,
        qInst,
        sectionFormat,
      )

      if (isMissingQuestion(question)) {
        resolvedQuestions.push({
          question,
          sectionId: def.id,
          repositoryMarks: question.marks,
          effectiveMarks: effectiveQuestionMarks(question, qInst),
          displayNumber,
          showNumber,
          hidden: false,
          localInstructions: qInst.localInstructions?.trim() || undefined,
          spacingMode: qInst.spacingMode ?? secInst.spacingMode ?? 'normal',
          questionFormat,
        })
        continue
      }

      resolvedQuestions.push({
        question,
        sectionId: def.id,
        repositoryMarks: question.marks,
        effectiveMarks: effectiveQuestionMarks(question, qInst),
        displayNumber,
        showNumber,
        hidden: false,
        localInstructions: qInst.localInstructions?.trim() || undefined,
        spacingMode: qInst.spacingMode ?? secInst.spacingMode ?? 'normal',
        questionFormat,
      })
    }

    sections.push({
      ...def,
      letter: displayLetter,
      effectiveTitle: secInst.title?.trim() || def.name,
      effectiveInstructions: secInst.instructions?.trim() || def.instructions,
      showNumbering: secInst.showNumbering !== false,
      spacingMode: secInst.spacingMode ?? 'normal',
      order: secInst.order ?? sectionOrderIndex(def.id),
      hidden: false,
      questions: resolvedQuestions,
      sectionFormat,
    })
  }

  const stats = computeResolvedPaperStats(sections)

  const printSettings = formatConfigToPrintSettings(formatConfig)

  return {
    setup,
    meta,
    sections,
    presentation,
    printSettings,
    formatConfig,
    stats,
  }
}

export function computeResolvedPaperStats(sections: ResolvedSection[]): PaperStats {
  let totalMarks = 0
  let estimatedMinutes = 0
  let questionCount = 0
  let diffEasy = 0
  let diffMed = 0
  let diffHard = 0
  const sectionCounts: Record<PaperSectionId, number> = { A: 0, B: 0, C: 0 }
  const sectionMarks: Record<PaperSectionId, number> = { A: 0, B: 0, C: 0 }

  for (const section of sections) {
    for (const rq of section.questions) {
      if (isMissingQuestion(rq.question)) continue
      questionCount += 1
      totalMarks += rq.effectiveMarks
      estimatedMinutes += rq.question.estimatedMinutes || 0
      sectionCounts[section.id] += 1
      sectionMarks[section.id] += rq.effectiveMarks
      if (rq.question.difficulty <= 2) diffEasy += 1
      else if (rq.question.difficulty === 3) diffMed += 1
      else diffHard += 1
    }
  }

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

export function printSettingsClassName(settings: PaperPrintSettings): string {
  const parts = [
    `pc-print--size-${settings.fontSize}`,
    `pc-print--spacing-${settings.spacingMode}`,
    `pc-print--family-${settings.fontFamily}`,
    `pc-print--leading-${String(settings.lineSpacing).replace('.', '-')}`,
    `pc-print--header-${settings.headerPreset}`,
    `pc-print--marks-${settings.marksDisplay}`,
  ]
  return parts.join(' ')
}

export function applySmartFitSettings(layer: PaperInstanceLayer): PaperInstanceLayer {
  const formatConfig = applySmartFitFormat(
    normalizeFormatConfig(layer.formatConfig, layer.printSettings),
  )
  return {
    ...layer,
    formatConfig,
    printSettings: formatConfigToPrintSettings(formatConfig),
  }
}

export function patchFormatConfig(
  layer: PaperInstanceLayer,
  updater: (config: PaperFormatConfig) => PaperFormatConfig,
): PaperInstanceLayer {
  const next = updater(normalizeFormatConfig(layer.formatConfig, layer.printSettings))
  return {
    ...layer,
    formatConfig: next,
    printSettings: formatConfigToPrintSettings(next),
  }
}

export { applyHeaderPreset, applyMarginPreset, applyLinkedMargin }

export const HEADER_PRESET_LABELS: Record<
  PaperHeaderPreset,
  { label: string; hint: string }
> = {
  spacious: { label: 'Spacious', hint: 'Formal board-style header' },
  standard: { label: 'Standard', hint: 'Balanced default layout' },
  compact: { label: 'Compact', hint: 'Save paper — tighter header' },
}

export function moveSectionOrder(
  layer: PaperInstanceLayer,
  sectionIds: PaperSectionId[],
  sectionId: PaperSectionId,
  direction: 'up' | 'down',
): PaperInstanceLayer {
  const sorted = [...sectionIds].sort((a, b) => {
    const ao = getSectionInstance(layer, a).order ?? sectionOrderIndex(a)
    const bo = getSectionInstance(layer, b).order ?? sectionOrderIndex(b)
    return ao - bo
  })

  const idx = sorted.indexOf(sectionId)
  if (idx < 0) return layer
  const swap = direction === 'up' ? idx - 1 : idx + 1
  if (swap < 0 || swap >= sorted.length) return layer

  ;[sorted[idx], sorted[swap]] = [sorted[swap], sorted[idx]]

  const sections: PaperInstanceLayer['sections'] = { ...layer.sections }
  sorted.forEach((id, i) => {
    sections[id] = {
      ...getSectionInstance(layer, id),
      order: i,
    }
  })

  return { ...layer, sections }
}
