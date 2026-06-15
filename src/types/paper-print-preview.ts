import type { PaperComposition, PaperSetupState } from '@/lib/paper-builder'
import type { PrintPageModel } from '@/lib/paper-print-layout'
import type { PaperInstanceLayer } from '@/types/paper-instance'

/** Live session snapshot passed from builder / examination editor to print preview. */
export type PaperPrintPreviewSnapshot = {
  setup: PaperSetupState
  composition: PaperComposition
  instanceLayer: PaperInstanceLayer
  /** Measured print pages from the editor (keeps preview/PDF in sync with editor layout). */
  pages?: PrintPageModel[]
}

export type PaperPrintPreviewLocationState = {
  printSnapshot?: PaperPrintPreviewSnapshot
  editorContinuity?: {
    surfaceMode?: 'edit' | 'preview'
    activePage?: number
    selection?: unknown
  }
}
