import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { ExportProgress, PaperExportFilenameInput } from '@/lib/paper-export-formats'
import {
  PRINT_PAGE_HEIGHT_PX,
  PRINT_PAGE_WIDTH_PX,
} from '@/lib/paper-print-layout'

export type PaperPdfFilenameInput = PaperExportFilenameInput

export type PdfExportProgress = ExportProgress

const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297

export {
  classSegmentForExport as classSegmentForPdf,
  examTypeSegmentForExport as examTypeSegmentForPdf,
  extractExamYear,
  buildOfficialPdfFilename,
  exportFilenameFromSetup as pdfFilenameFromSetup,
} from '@/lib/paper-export-formats'

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

export { EXPORT_UNAVAILABLE_MSG as PDF_EXPORT_UNAVAILABLE_MSG } from '@/lib/paper-export-formats'
