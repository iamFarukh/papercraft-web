import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ExternalLink, PanelRightOpen, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

type QuestionCardMenuProps = {
  questionId: string
  anchorRect: DOMRect | null
  open: boolean
  isAdmin?: boolean
  onClose: () => void
  onBookmark: () => void
  onViewDetails?: () => void
}

export function QuestionCardMenu({
  questionId,
  anchorRect,
  open,
  isAdmin = false,
  onClose,
  onBookmark,
  onViewDetails,
}: QuestionCardMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return
      onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('click', onDoc, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDoc, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open || !anchorRect) return null

  const top = Math.min(anchorRect.bottom + 6, window.innerHeight - 160)
  const left = Math.min(anchorRect.right - 200, window.innerWidth - 220)

  return createPortal(
    <div
      ref={menuRef}
      className="pc-bookmark-menu pc-q-card-menu"
      style={{ top, left }}
      role="menu"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {onViewDetails ? (
        <button
          type="button"
          className="pc-bookmark-menu-row"
          role="menuitem"
          onClick={() => {
            onViewDetails()
            onClose()
          }}
        >
          <PanelRightOpen size={14} strokeWidth={1.6} />
          <span>View details</span>
        </button>
      ) : null}
      <button
        type="button"
        className="pc-bookmark-menu-row"
        role="menuitem"
        onClick={() => {
          onBookmark()
          onClose()
        }}
      >
        <Star size={14} strokeWidth={1.6} />
        <span>Bookmark…</span>
      </button>
      {isAdmin && (
        <Link
          to={`/app/repository/${questionId}/edit`}
          className="pc-bookmark-menu-row"
          role="menuitem"
          onClick={onClose}
        >
          <ExternalLink size={14} strokeWidth={1.6} />
          <span>Edit question</span>
        </Link>
      )}
    </div>,
    document.body,
  )
}
