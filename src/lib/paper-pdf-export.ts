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

    // Capture the page at its real rendered size. Normal pages are exactly A4
    // (595×842 @72dpi); a page that grew to fit an over-tall block is captured
    // in full rather than cut off at the fixed page height.
    const captureW = Math.max(pageEl.offsetWidth, PRINT_PAGE_WIDTH_PX)
    const captureH = Math.max(pageEl.offsetHeight, PRINT_PAGE_HEIGHT_PX)

    const canvas = await html2canvas(pageEl, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: captureW,
      height: captureH,
      windowWidth: captureW,
      windowHeight: captureH,
      scrollX: 0,
      scrollY: 0,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    if (i > 0) pdf.addPage()
    // Fit the captured image into the A4 box preserving aspect ratio. A4-shaped
    // pages fill the sheet exactly; an over-tall page is scaled down (letterboxed)
    // so all content stays visible instead of being clipped.
    const fit = Math.min(A4_WIDTH_MM / canvas.width, A4_HEIGHT_MM / canvas.height)
    const drawW = canvas.width * fit
    const drawH = canvas.height * fit
    const offsetX = (A4_WIDTH_MM - drawW) / 2
    pdf.addImage(imgData, 'JPEG', offsetX, 0, drawW, drawH, undefined, 'FAST')
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
