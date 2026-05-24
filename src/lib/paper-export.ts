import {
  exportFilenameFromSetup,
  type ExportProgress,
  type PaperExportFormat,
} from '@/lib/paper-export-formats'
import { exportResolvedPaperToDocx } from '@/lib/paper-docx-export'
import { exportOfficialPrintToPdf } from '@/lib/paper-pdf-export'
import type { PaperSetupState } from '@/lib/paper-builder'
import type { ResolvedPaper } from '@/lib/paper-instance'

export async function runPaperExport(
  format: PaperExportFormat,
  options: {
    setup: PaperSetupState
    resolved: ResolvedPaper
    documentRoot: HTMLElement
    onProgress?: (progress: ExportProgress) => void
  },
): Promise<void> {
  const filename = exportFilenameFromSetup(options.setup, format)

  if (format === 'pdf') {
    await exportOfficialPrintToPdf(
      options.documentRoot,
      filename,
      options.onProgress,
    )
    return
  }

  await exportResolvedPaperToDocx(
    options.resolved,
    filename,
    options.onProgress,
  )
}
