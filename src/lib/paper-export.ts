import {
  exportFilenameFromSetup,
  type ExportProgress,
  type PaperExportFormat,
  type PaperExportKind,
} from '@/lib/paper-export-formats'
import { exportResolvedPaperToDocx } from '@/lib/paper-docx-export'
import { exportOfficialPrintToPdf } from '@/lib/paper-pdf-export'
import { exportAnswerKeyToDocx } from '@/lib/paper-answer-key-docx'
import { exportAnswerKeyToPdf } from '@/lib/paper-answer-key-pdf'
import type { PaperSetupState } from '@/lib/paper-builder'
import type { ResolvedPaper } from '@/lib/paper-instance'

export async function runPaperExport(
  format: PaperExportFormat,
  options: {
    setup: PaperSetupState
    resolved: ResolvedPaper
    documentRoot: HTMLElement
    kind?: PaperExportKind
    onProgress?: (progress: ExportProgress) => void
  },
): Promise<void> {
  const kind = options.kind ?? 'paper'
  const filename = exportFilenameFromSetup(options.setup, format, kind)

  if (kind === 'answer-key') {
    if (format === 'pdf') {
      await exportAnswerKeyToPdf(options.resolved, filename, options.onProgress)
    } else {
      await exportAnswerKeyToDocx(options.resolved, filename, options.onProgress)
    }
    return
  }

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
