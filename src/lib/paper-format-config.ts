import type {
  PaperFormatConfig,
  PaperHeaderPreset,
  PaperLayoutMode,
  PaperMarginPreset,
  PaperMarksDisplay,
  PaperPrintSettings,
  PaperQuestionInstance,
  PaperSectionInstance,
  QuestionFormatOverride,
  SectionFormatOverride,
} from '@/types/paper-instance'

export const FORMAT_CONFIG_VERSION = 1

export const FONT_SCALE_RATIOS = {
  question: 1,
  mcq: 0.91,
  sectionHeader: 1.18,
  instructions: 0.91,
  marks: 0.82,
} as const

export const DENSITY_RATIOS = {
  betweenQuestions: 0.85,
  betweenSections: 1.5,
  afterSectionHeader: 0.5,
  afterInstructions: 0.75,
  mcqOptionGap: 0.35,
} as const

export const MARGIN_PRESETS: Record<
  PaperMarginPreset,
  { top: number; bottom: number; left: number; right: number; label: string }
> = {
  tight: { top: 10, bottom: 10, left: 12, right: 10, label: 'Tight' },
  normal: { top: 15, bottom: 15, left: 18, right: 12, label: 'Normal' },
  wide: { top: 20, bottom: 20, left: 25, right: 15, label: 'Wide' },
  custom: { top: 15, bottom: 15, left: 18, right: 12, label: 'Custom' },
}

export const HEADER_PRESET_SIZES: Record<
  PaperHeaderPreset,
  { schoolName: number; tagline: number; examTitle: number; letterSpacing: number }
> = {
  spacious: { schoolName: 16, tagline: 9, examTitle: 12, letterSpacing: 2 },
  standard: { schoolName: 14, tagline: 8, examTitle: 11, letterSpacing: 1 },
  compact: { schoolName: 12, tagline: 7, examTitle: 10, letterSpacing: 0 },
}

export function roundHalf(n: number): number {
  return Math.round(n * 2) / 2
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function defaultFormatConfig(): PaperFormatConfig {
  return {
    version: FORMAT_CONFIG_VERSION,
    layoutMode: 'standard',
    pageSize: 'A4',
    pageOrientation: 'portrait',
    marginPreset: 'normal',
    pageMargins: { ...MARGIN_PRESETS.normal, linked: true },
    globalFontSize: 10,
    globalDensity: 2.5,
    typography: defaultTypography('serif', 1.32),
    spacing: spacingFromDensity(2.5),
    header: {
      preset: 'compact',
      repeatMode: 'firstPageOnly',
      ...HEADER_PRESET_SIZES.compact,
    },
    marks: {
      style: 'bracket',
      position: 'rightAligned',
      fontSize: roundHalf(11 * FONT_SCALE_RATIOS.marks),
      showSectionTotal: true,
    },
    footer: {
      showPageNumbers: true,
      fontSize: 8,
      format: 'pageXofY',
      position: 'center',
      showOnFirstPage: true,
    },
    dividers: {
      betweenSections: 'on',
    },
  }
}

/** Default typography — section/instruction sizes are independent of question global. */
export function defaultTypography(
  baseFontFamily: 'serif' | 'sans' = 'serif',
  lineHeight = 1.32,
  globalFontSize = 10,
): PaperFormatConfig['typography'] {
  return {
    baseFontFamily,
    ...syncQuestionTypographyFromGlobal(globalFontSize, lineHeight),
    sectionHeaderFontSize: 11.5,
    instructionsFontSize: 9.5,
    lineHeight,
    questionFontWeight: 'normal',
  }
}

/** Standard-mode global font slider — questions & MCQ only, not section headers. */
export function syncQuestionTypographyFromGlobal(
  globalFontSize: number,
  lineHeight: number,
): Pick<
  PaperFormatConfig['typography'],
  'questionFontSize' | 'mcqFontSize' | 'marksFontSize'
> {
  return {
    questionFontSize: roundHalf(globalFontSize),
    mcqFontSize: roundHalf(globalFontSize * FONT_SCALE_RATIOS.mcq),
    marksFontSize: roundHalf(globalFontSize * FONT_SCALE_RATIOS.marks),
  }
}

export function typographyFromGlobalFont(
  globalFontSize: number,
  baseFontFamily: 'serif' | 'sans',
  lineHeight: number,
): PaperFormatConfig['typography'] {
  return {
    ...defaultTypography(baseFontFamily, lineHeight),
    ...syncQuestionTypographyFromGlobal(globalFontSize, lineHeight),
  }
}

export function spacingFromDensity(density: number): PaperFormatConfig['spacing'] {
  return {
    betweenQuestions: roundHalf(density * DENSITY_RATIOS.betweenQuestions),
    betweenSections: roundHalf(density * DENSITY_RATIOS.betweenSections),
    afterSectionHeader: roundHalf(density * DENSITY_RATIOS.afterSectionHeader),
    afterInstructions: roundHalf(density * DENSITY_RATIOS.afterInstructions),
    questionIndent: 8,
    mcqOptionGap: roundHalf(density * DENSITY_RATIOS.mcqOptionGap),
    mcqOptionIndent: 6,
    subQuestionIndent: 10,
    subQuestionGap: 1,
    answerLines: 0,
    answerLineSpacing: 8,
  }
}

function legacyFontSizeToPt(size: PaperPrintSettings['fontSize']): number {
  if (size === 'small') return 10
  if (size === 'large') return 12.5
  return 11
}

function legacyDensityToMm(mode: PaperPrintSettings['spacingMode']): number {
  if (mode === 'compact') return 1.5
  if (mode === 'spacious') return 5
  return 3
}

/** Merge persisted partial config with legacy printSettings. */
export function normalizeFormatConfig(
  raw?: Partial<PaperFormatConfig> | null,
  legacy?: Partial<PaperPrintSettings> | null,
): PaperFormatConfig {
  const base = defaultFormatConfig()
  const ps = legacy ?? {}

  let config: PaperFormatConfig = {
    ...base,
    ...raw,
    pageMargins: { ...base.pageMargins, ...raw?.pageMargins },
    typography: { ...base.typography, ...raw?.typography },
    spacing: { ...base.spacing, ...raw?.spacing },
    header: { ...base.header, ...raw?.header },
    marks: { ...base.marks, ...raw?.marks },
    footer: { ...base.footer, ...raw?.footer },
    dividers: { ...base.dividers, ...raw?.dividers },
  }

  if (!raw?.globalFontSize && ps.fontSize) {
    config.globalFontSize = legacyFontSizeToPt(ps.fontSize)
  }
  if (!raw?.globalDensity && ps.spacingMode) {
    config.globalDensity = legacyDensityToMm(ps.spacingMode)
  }
  if (ps.headerPreset && !raw?.header?.preset) {
    config.header.preset = ps.headerPreset
    Object.assign(config.header, HEADER_PRESET_SIZES[ps.headerPreset])
  }
  if (ps.marksDisplay && !raw?.marks?.style) {
    config.marks.style = ps.marksDisplay
  }
  if (ps.fontFamily && !raw?.typography?.baseFontFamily) {
    config.typography.baseFontFamily = ps.fontFamily
  }
  if (ps.lineSpacing && !raw?.typography?.lineHeight) {
    config.typography.lineHeight = ps.lineSpacing
  }

  if (config.layoutMode === 'standard') {
    config.typography = {
      ...config.typography,
      ...syncQuestionTypographyFromGlobal(
        config.globalFontSize,
        config.typography.lineHeight,
      ),
    }
    config.spacing = spacingFromDensity(config.globalDensity)
    config.marks.fontSize = roundHalf(config.globalFontSize * FONT_SCALE_RATIOS.marks)
  }

  config.version = FORMAT_CONFIG_VERSION
  return config
}

/** Sync discrete printSettings for backward-compatible class names. */
export function formatConfigToPrintSettings(config: PaperFormatConfig): PaperPrintSettings {
  let fontSize: PaperPrintSettings['fontSize'] = 'normal'
  if (config.globalFontSize <= 10) fontSize = 'small'
  else if (config.globalFontSize >= 12) fontSize = 'large'

  let spacingMode: PaperPrintSettings['spacingMode'] = 'normal'
  if (config.globalDensity <= 2) spacingMode = 'compact'
  else if (config.globalDensity >= 4.5) spacingMode = 'spacious'

  return {
    fontSize,
    spacingMode,
    fontFamily: config.typography.baseFontFamily,
    lineSpacing: config.typography.lineHeight as PaperPrintSettings['lineSpacing'],
    headerPreset: config.header.preset,
    marksDisplay: config.marks.style,
  }
}

export function applyGlobalFontSize(config: PaperFormatConfig, size: number): PaperFormatConfig {
  const next = {
    ...config,
    globalFontSize: roundHalf(clamp(size, 7, 18)),
  }
  if (config.layoutMode === 'standard') {
    next.typography = {
      ...config.typography,
      ...syncQuestionTypographyFromGlobal(
        next.globalFontSize,
        config.typography.lineHeight,
      ),
    }
    next.marks = {
      ...config.marks,
      fontSize: roundHalf(next.globalFontSize * FONT_SCALE_RATIOS.marks),
    }
  }
  return next
}

export function applyGlobalDensity(config: PaperFormatConfig, density: number): PaperFormatConfig {
  const next = {
    ...config,
    globalDensity: roundHalf(clamp(density, 0.5, 8)),
  }
  if (config.layoutMode === 'standard') {
    next.spacing = spacingFromDensity(next.globalDensity)
  }
  return next
}

export function applyHeaderPreset(
  config: PaperFormatConfig,
  preset: PaperHeaderPreset,
): PaperFormatConfig {
  return {
    ...config,
    header: {
      ...config.header,
      preset,
      ...HEADER_PRESET_SIZES[preset],
    },
  }
}

export function applyMarginPreset(
  config: PaperFormatConfig,
  preset: PaperMarginPreset,
): PaperFormatConfig {
  const m = MARGIN_PRESETS[preset]
  return {
    ...config,
    marginPreset: preset,
    pageMargins: {
      top: m.top,
      bottom: m.bottom,
      left: m.left,
      right: m.right,
      linked: config.pageMargins.linked,
    },
  }
}

export function applyLinkedMargin(
  config: PaperFormatConfig,
  value: number,
): PaperFormatConfig {
  const v = clamp(Math.round(value), 5, 40)
  return {
    ...config,
    marginPreset: 'custom',
    pageMargins: {
      top: v,
      bottom: v,
      left: v,
      right: v,
      linked: true,
    },
  }
}

export function applySmartFitFormat(config: PaperFormatConfig): PaperFormatConfig {
  let next = applyHeaderPreset(config, 'compact')
  next = applyGlobalDensity(next, 1.5)
  next = applyGlobalFontSize(next, 10)
  next = applyMarginPreset(next, 'tight')
  next.typography.lineHeight = 1.3
  return next
}

export function switchLayoutMode(
  config: PaperFormatConfig,
  mode: PaperLayoutMode,
): PaperFormatConfig {
  if (mode === config.layoutMode) return config
  const next: PaperFormatConfig = { ...config, layoutMode: mode }
  if (mode === 'standard') {
    next.typography = {
      ...next.typography,
      ...syncQuestionTypographyFromGlobal(
        next.globalFontSize,
        next.typography.lineHeight,
      ),
    }
    next.spacing = spacingFromDensity(next.globalDensity)
  }
  return next
}

export type ResolvedQuestionFormat = {
  marginTop: number
  marginBottom: number
  indent: number
  fontSize: number
  hasOverrides: boolean
}

export type ResolvedSectionFormat = {
  spacingAbove: number
  spacingAfterHeader: number
  questionSpacing: number
  fontSize: number
  hasOverrides: boolean
}

function questionOverrideFromInstance(q?: PaperQuestionInstance): QuestionFormatOverride {
  if (!q) return {}
  return {
    marginTop: q.marginTop,
    marginBottom: q.marginBottom,
    indent: q.indent,
    fontSize: q.fontSize,
  }
}

function sectionOverrideFromInstance(s?: PaperSectionInstance): SectionFormatOverride {
  if (!s) return {}
  return {
    spacingAbove: s.spacingAbove,
    spacingAfterHeader: s.spacingAfterHeader,
    questionSpacing: s.questionSpacing,
    fontSize: s.fontSize,
  }
}

export function resolveQuestionFormat(
  config: PaperFormatConfig,
  questionId: string,
  qInst?: PaperQuestionInstance,
  sectionFmt?: Pick<ResolvedSectionFormat, 'questionSpacing'>,
): ResolvedQuestionFormat {
  const o = questionOverrideFromInstance(qInst)
  const legacySpacing = qInst?.spacingMode
  const defaultGap = sectionFmt?.questionSpacing ?? config.spacing.betweenQuestions
  let marginTop = o.marginTop ?? defaultGap
  let marginBottom = o.marginBottom ?? 0
  if (o.marginTop == null && legacySpacing === 'compact') marginTop = defaultGap * 0.5
  if (o.marginTop == null && legacySpacing === 'spacious') marginTop = defaultGap * 1.5

  const hasOverrides =
    o.marginTop != null ||
    o.marginBottom != null ||
    o.indent != null ||
    o.fontSize != null

  return {
    marginTop: roundHalf(marginTop),
    marginBottom: roundHalf(marginBottom),
    indent: o.indent ?? config.spacing.questionIndent,
    fontSize: o.fontSize ?? config.typography.questionFontSize,
    hasOverrides,
  }
}

export function resolveSectionFormat(
  config: PaperFormatConfig,
  sInst?: PaperSectionInstance,
): ResolvedSectionFormat {
  const o = sectionOverrideFromInstance(sInst)
  const legacySpacing = sInst?.spacingMode
  let questionSpacing = o.questionSpacing ?? config.spacing.betweenQuestions
  if (o.questionSpacing == null && legacySpacing === 'compact') {
    questionSpacing = config.spacing.betweenQuestions * 0.5
  }
  if (o.questionSpacing == null && legacySpacing === 'spacious') {
    questionSpacing = config.spacing.betweenQuestions * 1.5
  }

  const hasOverrides =
    o.spacingAbove != null ||
    o.spacingAfterHeader != null ||
    o.questionSpacing != null ||
    o.fontSize != null ||
    (legacySpacing != null && legacySpacing !== 'normal')

  return {
    spacingAbove: o.spacingAbove ?? config.spacing.betweenSections,
    spacingAfterHeader: o.spacingAfterHeader ?? config.spacing.afterSectionHeader,
    questionSpacing: roundHalf(questionSpacing),
    fontSize: o.fontSize ?? config.typography.sectionHeaderFontSize,
    hasOverrides,
  }
}

export function sectionFormatToStyle(fmt: ResolvedSectionFormat): Record<string, string> {
  return {
    marginTop: `${fmt.spacingAbove}mm`,
    marginBottom: `${fmt.spacingAfterHeader}mm`,
    '--pc-section-font-size': `${fmt.fontSize}pt`,
  }
}

export function configToCssVars(config: PaperFormatConfig): Record<string, string> {
  const { typography: t, spacing: s, header: h, marks: m, footer: f } = config
  return {
    '--pc-page-margin-top': `${config.pageMargins.top}mm`,
    '--pc-page-margin-bottom': `${config.pageMargins.bottom}mm`,
    '--pc-page-margin-left': `${config.pageMargins.left}mm`,
    '--pc-page-margin-right': `${config.pageMargins.right}mm`,
    '--pc-q-spacing': `${s.betweenQuestions}mm`,
    '--pc-section-spacing': `${s.betweenSections}mm`,
    '--pc-section-header-spacing': `${s.afterSectionHeader}mm`,
    '--pc-instructions-spacing': `${s.afterInstructions}mm`,
    '--pc-q-indent': `${s.questionIndent}mm`,
    '--pc-mcq-gap': `${s.mcqOptionGap}mm`,
    '--pc-mcq-indent': `${s.mcqOptionIndent}mm`,
    '--pc-sub-q-indent': `${s.subQuestionIndent}mm`,
    '--pc-q-font-size': `${t.questionFontSize}pt`,
    '--pc-mcq-font-size': `${t.mcqFontSize}pt`,
    '--pc-section-font-size': `${t.sectionHeaderFontSize}pt`,
    '--pc-instructions-font-size': `${t.instructionsFontSize}pt`,
    '--pc-marks-font-size': `${m.fontSize}pt`,
    '--pc-line-height': String(t.lineHeight),
    '--pc-school-name-size': `${h.schoolName}pt`,
    '--pc-tagline-size': `${h.tagline}pt`,
    '--pc-exam-title-size': `${h.examTitle}pt`,
    '--pc-school-name-spacing': `${h.letterSpacing}px`,
    '--pc-footer-font-size': `${f.fontSize}pt`,
  }
}

export function questionFormatToStyle(resolved: ResolvedQuestionFormat): Record<string, string> {
  const qSize = resolved.fontSize
  return {
    marginTop: `${resolved.marginTop}mm`,
    marginBottom: `${resolved.marginBottom}mm`,
    paddingLeft: `${resolved.indent}mm`,
    '--pc-q-font-size': `${qSize}pt`,
    '--pc-mcq-font-size': `${roundHalf(qSize * FONT_SCALE_RATIOS.mcq)}pt`,
  }
}

export function hasFormatOverride(q?: PaperQuestionInstance): boolean {
  return !!(
    q?.marginTop != null ||
    q?.marginBottom != null ||
    q?.indent != null ||
    q?.fontSize != null
  )
}
