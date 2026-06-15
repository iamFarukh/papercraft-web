import { memo, useEffect, useRef, useState, type MouseEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, MoreHorizontal, Star } from 'lucide-react'
import { PC_DURATION, PC_EASE, PC_TRANSITION } from '@/lib/motion/tokens'
import type { QuestionRecord } from '@/types/question'
import { questionDisplayRef } from '@/lib/question-display'
import { RichContent } from '@/components/ui/RichContent'
import { BookmarkPickerMenu } from '@/components/bookmarks/BookmarkPickerMenu'
import { QuestionCardMenu } from '@/components/bookmarks/QuestionCardMenu'
import { useQuestionBookmarkState } from '@/hooks/useQuestionBookmarkState'
import { DifficultyPips } from './DifficultyPips'

const CARD_LAYOUT = PC_TRANSITION.layoutMorph

function statusTone(status: QuestionRecord['status']): string {
  switch (status) {
    case 'Published':
      return 'is-success'
    case 'Draft':
      return 'is-warning'
    case 'Locked':
      return 'is-primary'
    case 'Archived':
      return 'is-ink'
    default:
      return ''
  }
}

function flagLabel(flag: string): string {
  if (flag === 'bilingual') return 'EN + HI'
  return flag
}

function flagTone(flag: string): string {
  if (flag === 'review') return 'is-warning'
  if (flag === 'new') return 'is-success'
  return 'is-primary'
}

type QuestionCardProps = {
  question: QuestionRecord
  selected?: boolean
  active?: boolean
  expanded?: boolean
  view?: 'card' | 'list'
  isSwitchingView?: boolean
  // id-based handlers so the parent can pass stable useCallback refs directly
  // (no per-row closures) — required for React.memo below to actually skip work.
  onToggleSelect?: (id: string, e: MouseEvent) => void
  onOpen: (id: string) => void
  onToggleExpand: (id: string) => void
  isAdmin?: boolean
  showBookmark?: boolean
}

function QuestionCardComponent({
  question: q,
  selected = false,
  active = false,
  expanded = false,
  view = 'card',
  isSwitchingView = false,
  onToggleSelect,
  onOpen,
  onToggleExpand,
  isAdmin = false,
  showBookmark = true,
}: QuestionCardProps) {
  const { isBookmarked } = useQuestionBookmarkState(showBookmark ? q.id : null)
  const [bookmarkOpen, setBookmarkOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const starRef = useRef<HTMLButtonElement>(null)
  const moreRef = useRef<HTMLButtonElement>(null)
  const ref = useRef<HTMLElement>(null)
  const [isInViewport, setIsInViewport] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting)
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => {
      if (el) observer.unobserve(el)
    }
  }, [])

  const reduceMotion = useReducedMotion()
  const bulkMode = Boolean(onToggleSelect)
  const menuOpen = bookmarkOpen || moreOpen
  const isList = view === 'list'

  const className = [
    'pc-q-card',
    'pc-motion-surface',
    isList ? 'is-list' : '',
    selected ? 'is-selected' : '',
    active ? 'is-active' : '',
    expanded ? 'is-expanded' : '',
    bulkMode ? 'has-bulk-select' : '',
    isSwitchingView ? 'is-switching' : '',
  ]
    .filter(Boolean)
    .join(' ')

  function openDetails(e: MouseEvent) {
    e.stopPropagation()
    if (menuOpen) return
    onOpen(q.id)
  }

  function handleCardClick(e: MouseEvent) {
    if (menuOpen) return
    const target = e.target as HTMLElement
    if (target.closest('.pc-q-card-select-wrap, button, a, input, [role="menu"]')) {
      return
    }
    onOpen(q.id)
  }

  return (
    <motion.article
      ref={ref}
      className={className}
      tabIndex={0}
      layout={isInViewport && !reduceMotion}
      initial={false}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97 }}
      transition={{ layout: reduceMotion ? { duration: 0 } : CARD_LAYOUT }}
      animate={
        reduceMotion
          ? undefined
          : {
              borderColor: selected
                ? 'rgba(53, 92, 255, 0.42)'
                : 'rgba(20, 22, 26, 0.1)',
              backgroundColor: selected
                ? 'rgba(53, 92, 255, 0.04)'
                : 'rgb(255, 255, 255)',
              boxShadow: selected
                ? '0 0 0 1px rgba(53, 92, 255, 0.12), 0 2px 8px rgba(20, 22, 26, 0.06)'
                : '0 1px 2px rgba(20, 22, 26, 0.04)',
            }
      }
      whileTap={!reduceMotion ? { scale: 0.997 } : undefined}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (menuOpen) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(q.id)
        }
      }}
      aria-selected={selected}
    >
      <header className="pc-q-card-head">
        <div className="pc-q-card-head-left">
          {onToggleSelect ? (
            <motion.label
              className="pc-q-card-select-wrap"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              animate={
                reduceMotion
                  ? undefined
                  : {
                      scale: selected ? 1 : 0.94,
                      opacity: selected ? 1 : 0.72,
                    }
              }
              transition={{ duration: PC_DURATION.fast, ease: PC_EASE.out }}
              whileTap={reduceMotion ? undefined : { scale: 0.88 }}
            >
              <input
                type="checkbox"
                className="pc-q-card-select"
                checked={selected}
                aria-label={`Select ${questionDisplayRef(q)}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleSelect(q.id, e)
                }}
                readOnly
              />
            </motion.label>
          ) : null}
          <button
            type="button"
            className="pc-q-card-ref"
            title={`View details · ${q.id}`}
            onClick={openDetails}
          >
            {questionDisplayRef(q)}
          </button>
          <span className="pc-tag is-ink">{q.type}</span>
          <DifficultyPips level={q.difficulty} />
          <span className="pc-q-card-marks pc-num">{q.marks}m</span>
        </div>
        <div className="pc-q-card-head-right">
          {q.flags.map((f) => (
            <span key={f} className={`pc-tag ${flagTone(f)}`}>
              {flagLabel(f)}
            </span>
          ))}
          {showBookmark && (
            <button
              ref={starRef}
              type="button"
              className={
                'pc-q-card-icon-btn' + (isBookmarked ? ' is-bookmarked' : '')
              }
              aria-label={isBookmarked ? 'Edit bookmarks' : 'Bookmark'}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                setMoreOpen(false)
                setBookmarkOpen((v) => !v)
              }}
            >
              <Star
                size={14}
                strokeWidth={1.6}
                fill={isBookmarked ? 'currentColor' : 'none'}
              />
            </button>
          )}
          <button
            type="button"
            className={
              'pc-q-card-icon-btn' + (expanded ? ' is-active' : '')
            }
            aria-label={expanded ? 'Collapse preview' : 'Expand preview'}
            aria-expanded={expanded}
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(q.id)
            }}
          >
            <ChevronDown size={14} strokeWidth={1.6} />
          </button>
          <button
            ref={moreRef}
            type="button"
            className="pc-q-card-icon-btn"
            aria-label="More"
            onClick={(e) => {
              e.stopPropagation()
              setBookmarkOpen(false)
              setMoreOpen((v) => !v)
            }}
          >
            <MoreHorizontal size={14} strokeWidth={1.6} />
          </button>
        </div>
      </header>

      {showBookmark && (
        <BookmarkPickerMenu
          questionId={q.id}
          open={bookmarkOpen}
          anchorRect={starRef.current?.getBoundingClientRect() ?? null}
          onClose={() => setBookmarkOpen(false)}
        />
      )}
      <QuestionCardMenu
        questionId={q.id}
        isAdmin={isAdmin}
        open={moreOpen}
        anchorRect={moreRef.current?.getBoundingClientRect() ?? null}
        onClose={() => setMoreOpen(false)}
        onBookmark={() => setBookmarkOpen(true)}
        onViewDetails={() => onOpen(q.id)}
      />

      <div className="pc-q-card-main">
        <RichContent className="pc-q-card-body pc-serif" html={q.bodyText} />
        {q.hindi && !isList ? (
          <RichContent
            className={'pc-q-card-hindi' + (expanded ? '' : ' is-clamped')}
            as="div"
            html={q.hindi}
          />
        ) : null}
        {q.hindi && isList && expanded ? (
          <RichContent className="pc-q-card-hindi pc-q-card-hindi--list" html={q.hindi} />
        ) : null}
      </div>

      {expanded && !isList ? (
        <div className="pc-q-card-preview">
          <span className="pc-q-card-preview-label">Quick preview</span>
          <p>
            {q.topic} · {q.marks} mark{q.marks === 1 ? '' : 's'} · Bloom:{' '}
            {q.bloomLevel} · ~{q.estimatedMinutes} min · RBSE Term II alignment.
          </p>
        </div>
      ) : null}

      <footer className="pc-q-card-foot">
        <span className="pc-q-card-chapter">
          {q.classLabel} · {q.subject} · {q.chapter}
        </span>
        <span className="pc-q-card-meta">
          Used <span className="pc-num">{q.usage}×</span>
        </span>
        <span className={`pc-tag ${statusTone(q.status)}`}>{q.status}</span>
        <span className="pc-tag is-outline">{q.topic}</span>
        <span className="pc-q-card-meta pc-q-card-meta-end">RBSE aligned</span>
      </footer>
    </motion.article>
  )
}

/**
 * Memoized so a state change in the workspace (search typing, hover, selecting
 * one card) only re-renders the cards whose own props actually changed, instead
 * of every card in the stream. Relies on the parent passing stable id-based
 * handlers (see QuestionStream).
 */
export const QuestionCard = memo(QuestionCardComponent)
