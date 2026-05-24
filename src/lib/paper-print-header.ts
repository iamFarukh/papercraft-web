import type { PaperFormatConfig, PaperPresentation } from '@/types/paper-instance'
import type { PrintPageModel } from '@/lib/paper-print-layout'

export type PageHeaderRender = {
  show: boolean
  mode: 'full' | 'compact'
}

export type HeaderFieldVisibility = {
  showLogo: boolean
  showTagline: boolean
  showExamTitle: boolean
  showExamMeta: boolean
}

export function resolveHeaderFields(
  presentation: PaperPresentation,
): HeaderFieldVisibility {
  return {
    showLogo: presentation.showSchoolLogo !== false,
    showTagline: presentation.showSchoolTagline !== false,
    showExamTitle: presentation.showExamTitle !== false,
    showExamMeta: presentation.showExamMetaRow !== false,
  }
}

/** Resolve whether a page shows the examination header and in which mode. */
export function resolvePageHeader(
  page: PrintPageModel,
  presentation: PaperPresentation,
  formatConfig: PaperFormatConfig,
): PageHeaderRender {
  if (presentation.showHeader === false) {
    return { show: false, mode: 'full' }
  }

  const repeat =
    presentation.headerRepeatMode ??
    formatConfig.header.repeatMode ??
    'firstPageOnly'

  if (repeat === 'none') {
    return { show: false, mode: 'full' }
  }

  if (repeat === 'firstPageOnly') {
    if (page.pageIndex === 0) {
      return { show: true, mode: 'full' }
    }
    return { show: false, mode: 'full' }
  }

  if (repeat === 'compactRepeat') {
    if (page.pageIndex === 0) {
      return { show: true, mode: 'full' }
    }
    return { show: true, mode: 'compact' }
  }

  return {
    show: true,
    mode: page.pageIndex === 0 ? 'full' : 'compact',
  }
}
