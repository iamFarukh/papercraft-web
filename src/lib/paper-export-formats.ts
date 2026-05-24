import type { PaperSetupState } from '@/lib/paper-builder'

export type PaperExportFormat = 'pdf' | 'docx'

export type PaperExportFormatMeta = {
  id: PaperExportFormat
  label: string
  extension: string
  mimeType: string
  hint: string
}

export const PAPER_EXPORT_FORMATS: PaperExportFormatMeta[] = [
  {
    id: 'pdf',
    label: 'PDF',
    extension: 'pdf',
    mimeType: 'application/pdf',
    hint: 'Fixed layout for printing and distribution',
  },
  {
    id: 'docx',
    label: 'Word (.docx)',
    extension: 'docx',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    hint: 'Editable document for Microsoft Word or Google Docs',
  },
]

export type PaperExportFilenameInput = {
  classLabel: string
  subject: string
  examType: string
  year: number
}

export type ExportProgress = {
  phase: 'preparing' | 'rendering' | 'assembling' | 'complete' | 'error'
  currentPage?: number
  totalPages?: number
  message?: string
}

export const EXPORT_UNAVAILABLE_MSG =
  'Official export is available only after this paper is approved.'

/** @deprecated Use EXPORT_UNAVAILABLE_MSG */
export const PDF_EXPORT_UNAVAILABLE_MSG = EXPORT_UNAVAILABLE_MSG

function sanitizeFilenamePart(raw: string): string {
  return (
    raw
      .trim()
      .replace(/[^\w]+/g, '')
      .replace(/^_+|_+$/g, '') || 'Paper'
  )
}

export function classSegmentForExport(classLabel: string): string {
  const stripped = classLabel.replace(/^Class\s+/i, '').trim()
  return `Class${sanitizeFilenamePart(stripped)}`
}

export function examTypeSegmentForExport(examType: string): string {
  return sanitizeFilenamePart(examType.replace(/[-\s]+/g, ''))
}

export function extractExamYear(academicSession: string): number {
  const match = academicSession.match(/20\d{2}/)
  if (match) return Number(match[0])
  return new Date().getFullYear()
}

export function buildExportFilename(
  input: PaperExportFilenameInput,
  format: PaperExportFormat,
): string {
  const meta = PAPER_EXPORT_FORMATS.find((f) => f.id === format)!
  const parts = [
    classSegmentForExport(input.classLabel),
    sanitizeFilenamePart(input.subject),
    examTypeSegmentForExport(input.examType),
    String(input.year),
  ]
  return `${parts.join('_')}.${meta.extension}`
}

export function buildOfficialPdfFilename(input: PaperExportFilenameInput): string {
  return buildExportFilename(input, 'pdf')
}

export function exportFilenameFromSetup(
  setup: PaperSetupState,
  format: PaperExportFormat,
): string {
  return buildExportFilename(
    {
      classLabel: setup.classLabel,
      subject: setup.subject,
      examType: setup.examType,
      year: extractExamYear(setup.academicSession),
    },
    format,
  )
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export function parseExportFormatFromQuery(
  value: string | null,
): PaperExportFormat | null {
  if (value === 'pdf' || value === 'docx') return value
  if (value === '1') return 'pdf'
  return null
}

export function exportFormatLabel(format: PaperExportFormat): string {
  return PAPER_EXPORT_FORMATS.find((f) => f.id === format)?.label ?? format
}
