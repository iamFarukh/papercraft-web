import type { PaperSetupState } from '@/lib/paper-builder'
import type { QuestionLanguage, QuestionRecord } from '@/types/question'

/** Examination language / medium for the paper and print layout. */
export type PaperMedium = 'english' | 'hindi' | 'bilingual'

export const PAPER_MEDIUM_OPTIONS: { id: PaperMedium; label: string; hint: string }[] = [
  {
    id: 'english',
    label: 'English medium',
    hint: 'Question paper in English. Repository shows English and bilingual items.',
  },
  {
    id: 'hindi',
    label: 'Hindi medium',
    hint: 'Question paper in Hindi (Devanagari). Repository shows Hindi and bilingual items.',
  },
  {
    id: 'bilingual',
    label: 'Bilingual (English + Hindi)',
    hint: 'Each question shows English and Hindi where available.',
  },
]

export type PrintLabels = {
  class: string
  subject: string
  time: string
  maxMarks: string
  generalInstructions: string
  marksUnit: string
  page: string
  of: string
  section: string
  compulsoryNote: string
  calculatorNote: string
  figuresNote: string
}

const LABELS_EN: PrintLabels = {
  class: 'Class',
  subject: 'Subject',
  time: 'Time',
  maxMarks: 'Max marks',
  generalInstructions: 'General Instructions',
  marksUnit: 'marks',
  page: 'Page',
  of: 'of',
  section: 'Section',
  compulsoryNote: 'All questions are compulsory. The paper consists of',
  calculatorNote: 'Use of calculators is not permitted unless stated otherwise.',
  figuresNote: 'Figures to the right indicate full marks.',
}

const LABELS_HI: PrintLabels = {
  class: 'कक्षा',
  subject: 'विषय',
  time: 'समय',
  maxMarks: 'पूर्णांक',
  generalInstructions: 'सामान्य निर्देश',
  marksUnit: 'अंक',
  page: 'पृष्ठ',
  of: 'का',
  section: 'खंड',
  compulsoryNote: 'सभी प्रश्न अनिवार्य हैं। इस प्रश्नपत्र में',
  calculatorNote: 'जब तक अन्यथा न कहा जाए, कैलकुलेटर का उपयोग वर्जित है।',
  figuresNote: 'दाएँ ओर दिए अंक पूर्ण अंक दर्शाते हैं।',
}

export function normalizePaperMedium(value: unknown): PaperMedium {
  if (value === 'hindi' || value === 'bilingual' || value === 'english') return value
  return 'english'
}

export function defaultMediumForSubject(subject: string): PaperMedium {
  const s = subject.trim().toLowerCase()
  if (s === 'hindi' || s.includes('hindi')) return 'hindi'
  return 'english'
}

export function getPrintLabels(medium: PaperMedium): PrintLabels {
  return medium === 'hindi' ? LABELS_HI : LABELS_EN
}

export function questionLanguageOf(q: QuestionRecord): QuestionLanguage {
  if (q.language) return q.language
  const hasEn = Boolean(q.bodyText?.trim())
  const hasHi = Boolean(q.hindi?.trim())
  if (hasEn && hasHi) return 'bilingual'
  if (hasHi) return 'hindi'
  return 'english'
}

export function questionMatchesPaperMedium(
  q: QuestionRecord,
  medium: PaperMedium,
): boolean {
  const lang = questionLanguageOf(q)
  if (medium === 'bilingual') return true
  if (medium === 'hindi') {
    return lang === 'hindi' || (lang === 'bilingual' && Boolean(q.hindi?.trim()))
  }
  return lang === 'english' || (lang === 'bilingual' && Boolean(q.bodyText?.trim()))
}

/** Primary text shown on the examination paper for a question. */
export function questionDisplayText(q: QuestionRecord, medium: PaperMedium): string {
  const en = q.bodyText?.trim() ?? ''
  const hi = q.hindi?.trim() ?? ''

  if (medium === 'hindi') {
    return hi || en
  }
  if (medium === 'bilingual') {
    if (en && hi) return `${en}\n\n${hi}`
    return en || hi
  }
  return en || hi
}

export function questionDisplayIsHindi(medium: PaperMedium): boolean {
  return medium === 'hindi'
}

export function defaultGeneralInstructions(medium: PaperMedium): string {
  if (medium === 'hindi') {
    return 'सभी प्रश्न अनिवार्य हैं जब तक अन्यथा न कहा जाए। दाएँ ओर दिए अंक पूर्ण अंक दर्शाते हैं।'
  }
  return 'All questions are compulsory unless stated otherwise. Figures to the right indicate full marks.'
}

export function mediumLabel(medium: PaperMedium): string {
  return PAPER_MEDIUM_OPTIONS.find((o) => o.id === medium)?.label ?? medium
}

export function applySubjectMediumDefault(
  setup: PaperSetupState,
  nextSubject: string,
): Partial<PaperSetupState> {
  const suggested = defaultMediumForSubject(nextSubject)
  if (setup.medium === defaultMediumForSubject(setup.subject)) {
    return { subject: nextSubject, medium: suggested }
  }
  return { subject: nextSubject }
}
