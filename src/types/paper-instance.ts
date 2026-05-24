import type { PaperSectionId } from '@/lib/paper-builder'

export type PaperSpacingMode = 'compact' | 'normal' | 'spacious'
export type PaperFontSize = 'small' | 'normal' | 'large'
export type PaperFontFamily = 'serif' | 'sans'
export type PaperHeaderPreset = 'spacious' | 'standard' | 'compact'
export type PaperMarksDisplay = 'bracket' | 'paren' | 'hidden'
export type PaperLayoutMode = 'standard' | 'advanced'
export type PaperMarginPreset = 'tight' | 'normal' | 'wide' | 'custom'
export type PaperPageSize = 'A4' | 'Legal' | 'Letter'
export type PaperPageOrientation = 'portrait' | 'landscape'
export type SectionDividerMode = 'on' | 'off' | 'subtle'

/** Lightweight print tuning — legacy discrete presets (derived from formatConfig). */
export type PaperPrintSettings = {
  fontSize: PaperFontSize
  spacingMode: PaperSpacingMode
  fontFamily: PaperFontFamily
  lineSpacing: 1 | 1.25 | 1.5
  headerPreset: PaperHeaderPreset
  marksDisplay: PaperMarksDisplay
}

export type PaperHeaderRepeatMode =
  | 'firstPageOnly'
  | 'allPages'
  | 'compactRepeat'
  | 'none'

export type PaperPresentation = {
  schoolName?: string
  schoolTagline?: string
  showHeader: boolean
  showFooter: boolean
  /** When showHeader is true — default first page only. */
  headerRepeatMode?: PaperHeaderRepeatMode
  showSchoolLogo?: boolean
  showSchoolTagline?: boolean
  showExamTitle?: boolean
  showExamMetaRow?: boolean
}

/** Continuous format config — source of truth for layout (editorPart2 spec). */
export type PaperFormatConfig = {
  version: number
  layoutMode: PaperLayoutMode
  pageSize: PaperPageSize
  pageOrientation: PaperPageOrientation
  marginPreset: PaperMarginPreset
  pageMargins: {
    top: number
    bottom: number
    left: number
    right: number
    linked: boolean
  }
  globalFontSize: number
  globalDensity: number
  typography: {
    baseFontFamily: PaperFontFamily
    questionFontSize: number
    mcqFontSize: number
    sectionHeaderFontSize: number
    instructionsFontSize: number
    marksFontSize: number
    lineHeight: number
    questionFontWeight: 'normal' | 'bold'
  }
  spacing: {
    betweenQuestions: number
    betweenSections: number
    afterSectionHeader: number
    afterInstructions: number
    questionIndent: number
    mcqOptionGap: number
    mcqOptionIndent: number
    subQuestionIndent: number
    subQuestionGap: number
    answerLines: number
    answerLineSpacing: number
  }
  header: {
    preset: PaperHeaderPreset
    repeatMode: 'firstPageOnly' | 'allPages' | 'compactRepeat' | 'none'
    schoolName: number
    tagline: number
    examTitle: number
    letterSpacing: number
  }
  marks: {
    style: PaperMarksDisplay
    position: 'rightAligned' | 'inline'
    fontSize: number
    showSectionTotal: boolean
  }
  footer: {
    showPageNumbers: boolean
    fontSize: number
    format: 'pageXofY' | 'plain'
    position: 'center' | 'right' | 'left'
    showOnFirstPage: boolean
  }
  dividers: {
    betweenSections: SectionDividerMode
  }
}

export type QuestionFormatOverride = {
  marginTop?: number
  marginBottom?: number
  indent?: number
  fontSize?: number
}

export type SectionFormatOverride = {
  spacingAbove?: number
  spacingAfterHeader?: number
  questionSpacing?: number
  fontSize?: number
  startOnNewPage?: boolean
  columns?: 1 | 2
}

/** Per-question overrides on this paper only — never mutates repository. */
export type PaperQuestionInstance = QuestionFormatOverride & {
  marksOverride?: number
  customNumber?: number
  /** Omit question number on paper; auto sequence skips this item. */
  hideNumber?: boolean
  hidden?: boolean
  spacingMode?: PaperSpacingMode
  localInstructions?: string
}

/** Per-section overrides on this paper only. */
export type PaperSectionInstance = SectionFormatOverride & {
  title?: string
  instructions?: string
  showNumbering?: boolean
  spacingMode?: PaperSpacingMode
  /** Lower sorts first; defaults to A=0, B=1, C=2 */
  order?: number
  hidden?: boolean
}

/** Formatting layer stored on `papers/{id}` — separate from repository questions. */
export type PaperInstanceLayer = {
  presentation?: Partial<PaperPresentation>
  printSettings?: Partial<PaperPrintSettings>
  formatConfig?: Partial<PaperFormatConfig>
  sections?: Partial<Record<PaperSectionId, PaperSectionInstance>>
  questions?: Record<string, PaperQuestionInstance>
}

export type EditSelection =
  | { kind: 'paper' }
  | { kind: 'section'; sectionId: PaperSectionId }
  | { kind: 'question'; sectionId: PaperSectionId; questionId: string }

export type BuilderStage = 'compose' | 'edit'
