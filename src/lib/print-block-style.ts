import type { CSSProperties } from 'react'
import type { PrintBlock } from '@/lib/paper-print-layout'

/** Inline styles so official output matches pagination + editable overrides. */
export function printBlockStyle(block: PrintBlock): CSSProperties | undefined {
  switch (block.kind) {
    case 'section-head': {
      const style: CSSProperties = {
        marginTop: `${block.marginTopMm ?? 6}mm`,
        marginBottom: `${block.marginBottomMm ?? 2}mm`,
      }
      if (block.fontSizePt != null) {
        style.fontSize = `${block.fontSizePt}pt`
        ;(style as Record<string, string>)['--pc-section-font-size'] = `${block.fontSizePt}pt`
      }
      return style
    }
    case 'question': {
      const layout = block.layout
      if (!layout) return undefined
      const style: CSSProperties = {
        marginTop: `${layout.marginTopMm}mm`,
        marginBottom: `${layout.marginBottomMm}mm`,
      }
      if (layout.fontSizePt) {
        style.fontSize = `${layout.fontSizePt}pt`
      }
      return style
    }
    default:
      return undefined
  }
}
