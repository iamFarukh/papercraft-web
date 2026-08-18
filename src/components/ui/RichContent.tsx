import { useLayoutEffect, useRef } from 'react'
import { renderMathInElement, sanitizeRichHtml } from '@/lib/rich-text'

type Props = {
  html: string | null | undefined
  className?: string
  as?: 'div' | 'span'
  /** BCP-47 language hint (e.g. "hi") for correct shaping / line-breaking. */
  lang?: string
}

/**
 * Universal display for rich question content: sanitizes the stored HTML and
 * renders inline/display math ($…$ / $$…$$) with KaTeX. Used everywhere a
 * question body / answer / solution / option is shown (cards, drawer, compose,
 * print, PDF). Degrades to plain text for legacy content with no markup.
 */
export function RichContent({ html, className, as = 'div', lang }: Props) {
  const ref = useRef<HTMLElement>(null)
  const safe = sanitizeRichHtml(html ?? '')

  useLayoutEffect(() => {
    if (ref.current) renderMathInElement(ref.current)
  }, [safe])

  const Tag = as
  return (
    <Tag
      ref={ref as never}
      lang={lang}
      className={['pc-rich', className].filter(Boolean).join(' ')}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}
