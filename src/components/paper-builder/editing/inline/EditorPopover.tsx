import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'

const DEFAULT_POPOVER_WIDTH = 176

type Props = {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  onClose: () => void
  children: ReactNode
  className?: string
  align?: 'start' | 'end'
  /** Override the default 176px width (e.g. wider format panels). */
  width?: number
}

export function EditorPopover({
  open,
  anchorRef,
  onClose,
  children,
  className = '',
  align = 'start',
  width = DEFAULT_POPOVER_WIDTH,
}: Props) {
  const popRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<CSSProperties>({ visibility: 'hidden' })

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return

    const update = () => {
      const anchor = anchorRef.current
      if (!anchor) return
      const rect = anchor.getBoundingClientRect()
      let left = align === 'end' ? rect.right - width : rect.left
      left = Math.max(8, Math.min(left, window.innerWidth - width - 8))
      const top = rect.bottom + 6
      setStyle({
        position: 'fixed',
        top,
        left,
        width,
        zIndex: 12000,
        visibility: 'visible',
      })
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, align, anchorRef, width])

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      const target = e.target as Node
      if (popRef.current?.contains(target) || anchorRef.current?.contains(target)) return
      onClose()
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open, onClose, anchorRef])

  if (!open) return null

  return createPortal(
    <div
      ref={popRef}
      className={`pc-ed-popover-portal${className ? ` ${className}` : ''}`}
      style={style}
      role="dialog"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body,
  )
}
