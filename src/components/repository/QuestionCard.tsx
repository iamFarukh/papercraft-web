import { useRef, useState, type MouseEvent } from 'react'
import { ChevronDown, MoreHorizontal, Star } from 'lucide-react'
import type { QuestionRecord } from '@/types/question'
import { questionDisplayRef } from '@/lib/question-display'
import { BookmarkPickerMenu } from '@/components/bookmarks/BookmarkPickerMenu'
import { QuestionCardMenu } from '@/components/bookmarks/QuestionCardMenu'
import { useQuestionBookmarkState } from '@/hooks/useQuestionBookmarkState'
import { DifficultyPips } from './DifficultyPips'

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
  onSelect: (e: MouseEvent) => void
  onToggleExpand: () => void
  isAdmin?: boolean
  showBookmark?: boolean
}

export function QuestionCard({
  question: q,
  selected = false,
  active = false,
  expanded = false,
  view = 'card',
  onSelect,
  onToggleExpand,
  isAdmin = false,
  showBookmark = true,
}: QuestionCardProps) {
  const { isBookmarked } = useQuestionBookmarkState(showBookmark ? q.id : null)
  const [bookmarkOpen, setBookmarkOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const starRef = useRef<HTMLButtonElement>(null)
  const moreRef = useRef<HTMLButtonElement>(null)

  const className = [
    'pc-q-card',
    view === 'list' ? 'is-list' : '',
    selected ? 'is-selected' : '',
    active ? 'is-active' : '',
    expanded ? 'is-expanded' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const menuOpen = bookmarkOpen || moreOpen

  return (
    <article
      className={className}
      tabIndex={0}
      onClick={(e) => {
        if (menuOpen) return
        onSelect(e)
      }}
      onKeyDown={(e) => {
        if (menuOpen) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(e as unknown as MouseEvent)
        }
      }}
      aria-selected={selected}
    >
      <header className="pc-q-card-head">
        <div className="pc-q-card-head-left">
          {selected && <span className="pc-q-card-select-mark" aria-hidden />}
          <span className="pc-q-card-ref" title={`Document ID: ${q.id}`}>
            {questionDisplayRef(q)}
          </span>
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
              onToggleExpand()
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
      />

      <div className="pc-q-card-main">
        <div className="pc-q-card-body pc-serif">{q.bodyText}</div>
        {q.hindi && view !== 'list' && (
          <p className={'pc-q-card-hindi' + (expanded ? '' : ' is-clamped')}>
            {q.hindi}
          </p>
        )}
        {q.hindi && view === 'list' && expanded && (
          <p className="pc-q-card-hindi pc-q-card-hindi--list">{q.hindi}</p>
        )}
      </div>

      {expanded && view !== 'list' && (
        <div className="pc-q-card-preview">
          <span className="pc-q-card-preview-label">Quick preview</span>
          <p>
            {q.topic} · {q.marks} mark{q.marks === 1 ? '' : 's'} · Bloom:{' '}
            {q.bloomLevel} · ~{q.estimatedMinutes} min · RBSE Term II alignment.
          </p>
        </div>
      )}

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
    </article>
  )
}
