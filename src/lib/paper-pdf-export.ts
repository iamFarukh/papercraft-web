import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import {
  PRINT_PAGE_HEIGHT_PX,
  PRINT_PAGE_WIDTH_PX,
} from '@/lib/paper-print-layout'
import type { PaperSetupState } from '@/lib/paper-builder'

export type PaperPdfFilenameInput = {
  classLabel: string
  subject: string
  examType: string
  year: number
}

export type PdfExportProgress = {
  phase: 'preparing' | 'rendering' | 'assembling' | 'complete' | 'error'
  currentPage?: number
  totalPages?: number
  message?: string
}

const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297

function sanitizeFilenamePart(raw: string): string {
  return (
    raw
      .trim()
      .replace(/[^\w]+/g, '')
      .replace(/^_+|_+$/g, '') || 'Paper'
  )
}

/** Class5, ClassIX, Class10 — from "Class V", "Class IX", etc. */
export function classSegmentForPdf(classLabel: string): string {
  const stripped = classLabel.replace(/^Class\s+/i, '').trim()
  return `Class${sanitizeFilenamePart(stripped)}`
}

export function examTypeSegmentForPdf(examType: string): string {
  return sanitizeFilenamePart(examType.replace(/[-\s]+/g, ''))
}

export function extractExamYear(academicSession: string): number {
  const match = academicSession.match(/20\d{2}/)
  if (match) return Number(match[0])
  return new Date().getFullYear()
}

export function buildOfficialPdfFilename(input: PaperPdfFilenameInput): string {
  const parts = [
    classSegmentForPdf(input.classLabel),
    sanitizeFilenamePart(input.subject),
    examTypeSegmentForPdf(input.examType),
    String(input.year),
  ]
  return `${parts.join('_')}.pdf`
}

export function pdfFilenameFromSetup(setup: PaperSetupState): string {
  return buildOfficialPdfFilename({
    classLabel: setup.classLabel,
    subject: setup.subject,
    examType: setup.examType,
    year: extractExamYear(setup.academicSession),
  })
}

function findPrintPages(root: HTMLElement): HTMLElement[] {
  const pages = root.querySelectorAll<HTMLElement>('.pc-print-page')
  if (pages.length > 0) return [...pages]
  if (root.classList.contains('pc-print-page')) return [root]
  return []
}

/**
 * Export the official paginated print document (same DOM as preview) to a PDF file.
 */
export async function exportOfficialPrintToPdf(
  documentRoot: HTMLElement,
  filename: string,
  onProgress?: (progress: PdfExportProgress) => void,
): Promise<void> {
  const pages = findPrintPages(documentRoot)
  if (pages.length === 0) {
    onProgress?.({
      phase: 'error',
      message: 'No examination pages were found to export.',
    })
    throw new Error('No print pages found')
  }

  onProgress?.({
    phase: 'preparing',
    totalPages: pages.length,
    message: 'Preparing official examination document…',
  })

  await document.fonts?.ready

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  for (let i = 0; i < pages.length; i++) {
    const pageEl = pages[i]!
    onProgress?.({
      phase: 'rendering',
      currentPage: i + 1,
      totalPages: pages.length,
      message: `Rendering page ${i + 1} of ${pages.length}…`,
    })

    const canvas = await html2canvas(pageEl, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: PRINT_PAGE_WIDTH_PX,
      height: PRINT_PAGE_HEIGHT_PX,
      windowWidth: PRINT_PAGE_WIDTH_PX,
      windowHeight: PRINT_PAGE_HEIGHT_PX,
      scrollX: 0,
      scrollY: 0,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    if (i > 0) pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST')
  }

  onProgress?.({
    phase: 'assembling',
    message: 'Assembling PDF…',
  })

  pdf.save(filename)

  onProgress?.({
    phase: 'complete',
    message: 'Examination PDF saved.',
  })
}

export const PDF_EXPORT_UNAVAILABLE_MSG =
  'Official PDF export is available only after this paper is approved.'
