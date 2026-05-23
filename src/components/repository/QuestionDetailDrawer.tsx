import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { drawerSlideBottom, overlayFade } from '@/lib/motion/variants'
import {
  Archive,
  Lock,
  Pencil,
  RotateCcw,
  Send,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import { BookmarkPickerMenu } from '@/components/bookmarks/BookmarkPickerMenu'
import { useQuestionBookmarkState } from '@/hooks/useQuestionBookmarkState'
import { Link } from 'react-router-dom'
import { DifficultyPips } from './DifficultyPips'
import { difficultyLabel } from '@/lib/repository-workspace'
import {
  availableLifecycleActions,
  lifecycleActionLabel,
  STATUS_META,
  type LifecycleAction,
} from '@/lib/question-lifecycle'
import { getQuestionById } from '@/services/firebase/questions'
import { mapQuestionDoc } from '@/lib/question-mapper'
import {
  questionDisplayRef,
  questionDisplayRefLong,
} from '@/lib/question-display'
import type { McqCorrectKey, QuestionRecord } from '@/types/question'

function formatDate(ms?: number): string {
  if (!ms) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(ms))
}

function actionIcon(action: LifecycleAction) {
  switch (action) {
    case 'publish':
      return Send
    case 'draft':
      return RotateCcw
    case 'lock':
      return Lock
    case 'archive':
      return Archive
  }
}

function lifecycleBtnClass(action: LifecycleAction, isPrimary: boolean): string {
  if (isPrimary) return 'pc-btn is-sm is-primary is-block'
  if (action === 'archive') return 'pc-btn is-sm is-outline is-danger is-block'
  return 'pc-btn is-sm is-outline is-block'
}

type QuestionDetailDrawerProps = {
  question: QuestionRecord
  isAdmin: boolean
  trashMode?: boolean
  onClose: () => void
  onStatusChange: (action: LifecycleAction) => Promise<void>
  onDelete?: () => Promise<void>
  onRestore?: () => Promise<void>
  actionError?: string | null
  busy?: boolean
}

function McqAnswerBlock({ detail }: { detail: QuestionRecord }) {
  const keys: McqCorrectKey[] = ['a', 'b', 'c', 'd']
  const correct = detail.answer?.toLowerCase() as McqCorrectKey | undefined
  const opts = detail.mcqOptions
  const optsHi = detail.mcqOptionsHi

  if (!opts && !optsHi) {
    return (
      <p className="pc-repo-drawer-block-text">
        Correct option: <strong className="pc-num">{detail.answer?.toUpperCase()}</strong>
      </p>
    )
  }

  return (
    <ul className="pc-repo-drawer-mcq-list">
      {keys.map((k) => {
        const en = opts?.[k]?.trim()
        const hi = optsHi?.[k]?.trim()
        if (!en && !hi) return null
        const isCorrect = correct === k
        return (
          <li
            key={k}
            className={'pc-repo-drawer-mcq-item' + (isCorrect ? ' is-correct' : '')}
          >
            <span className="pc-repo-drawer-mcq-key">{k.toUpperCase()}</span>
            <div>
              {en && <span>{en}</span>}
              {hi && <span className="pc-repo-drawer-mcq-hi">{hi}</span>}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function QuestionDetailDrawer({
  question,
  isAdmin,
  trashMode = false,
  onClose,
  onStatusChange,
  onDelete,
  onRestore,
  actionError,
  busy = false,
}: QuestionDetailDrawerProps) {
  const [detail, setDetail] = useState<QuestionRecord>(question)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [pendingAction, setPendingAction] = useState<LifecycleAction | null>(null)
  const [bookmarkOpen, setBookmarkOpen] = useState(false)
  const starRef = useRef<HTMLButtonElement>(null)
  const { isBookmarked } = useQuestionBookmarkState(detail.id)

  useEffect(() => {
    setDetail(question)
    let cancelled = false
    setLoadingDetail(true)
    getQuestionById(question.id)
      .then((doc) => {
        if (cancelled || !doc) return
        setDetail(mapQuestionDoc(question.id, doc))
      })
      .catch(() => {
        /* keep list row data */
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false)
      })
    return () => {
      cancelled = true
    }
  }, [question.id, question.updatedAtMs, question.statusRaw])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const reduced = useReducedMotion()
  const meta = STATUS_META[detail.statusRaw]
  const actions =
    isAdmin && !trashMode ? availableLifecycleActions(detail.statusRaw) : []
  const primaryActions = actions.filter((a) => a === 'publish')
  const secondaryActions = actions.filter((a) => a !== 'publish')
  const isMcq = detail.typeRaw === 'mcq' || detail.type === 'MCQ'

  async function runAction(action: LifecycleAction) {
    setPendingAction(action)
    try {
      await onStatusChange(action)
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <motion.div
      className="pc-repo-sheet-overlay"
      variants={overlayFade}
      initial={reduced ? false : 'hidden'}
      animate="visible"
      exit="exit"
      role="dialog"
      aria-modal="true"
      aria-label="Question detail"
    >
      <button
        type="button"
        className="pc-repo-drawer-backdrop"
        aria-label="Close question detail"
        onClick={onClose}
      />

      <motion.aside
        className="pc-repo-drawer"
        variants={drawerSlideBottom}
        initial={reduced ? false : 'hidden'}
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="pc-repo-drawer-head">
          <div className="pc-repo-drawer-head-main">
            <span className="pc-repo-drawer-kicker">Question detail</span>
            <div className="pc-repo-drawer-title-row">
              <span className={`pc-tag ${meta.tone}`}>{meta.label}</span>
              <span className="pc-tag is-ink">{detail.type}</span>
            </div>
            <span className="pc-repo-drawer-ref">{questionDisplayRef(detail)}</span>
            <span className="pc-repo-drawer-id" title="Firestore document ID">
              {questionDisplayRefLong(detail)}
            </span>
          </div>
          <div className="pc-repo-drawer-head-actions">
            <button
              ref={starRef}
              type="button"
              className={
                'pc-repo-drawer-icon-btn' + (isBookmarked ? ' is-bookmarked' : '')
              }
              aria-label={isBookmarked ? 'Edit bookmarks' : 'Bookmark'}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                setBookmarkOpen((v) => !v)
              }}
            >
              <Star
                size={15}
                strokeWidth={1.6}
                fill={isBookmarked ? 'currentColor' : 'none'}
              />
            </button>
            {isAdmin && (
              <Link
                to={`/app/repository/${detail.id}/edit`}
                className="pc-repo-drawer-icon-btn"
                aria-label="Edit question"
                onClick={onClose}
              >
                <Pencil size={15} strokeWidth={1.6} />
              </Link>
            )}
            <button
              type="button"
              className="pc-repo-drawer-icon-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={16} strokeWidth={1.6} />
            </button>
          </div>
          <BookmarkPickerMenu
            questionId={detail.id}
            open={bookmarkOpen}
            anchorRect={starRef.current?.getBoundingClientRect() ?? null}
            onClose={() => setBookmarkOpen(false)}
          />
        </header>

        <div className="pc-repo-drawer-body pc-scroll">
          {actionError && (
            <div className="pc-repo-drawer-error" role="alert">
              {actionError}
            </div>
          )}

          <section className="pc-repo-drawer-section">
            <h4 className="pc-repo-drawer-section-label">Question</h4>
            <div className="pc-repo-drawer-preview">
              {detail.bodyText && (
                <p className="pc-repo-drawer-body pc-serif">{detail.bodyText}</p>
              )}
              {detail.hindi && (
                <p className="pc-repo-drawer-hindi pc-serif">{detail.hindi}</p>
              )}
            </div>
            <div className="pc-repo-drawer-meta-row">
              <span className="pc-num">{detail.marks} marks</span>
              <DifficultyPips level={detail.difficulty} />
              <span className="pc-repo-drawer-diff">
                {difficultyLabel(detail.difficulty)}
              </span>
              {detail.flags.includes('bilingual') && (
                <span className="pc-tag is-outline">Bilingual</span>
              )}
            </div>
          </section>

          <section className="pc-repo-drawer-section">
            <h4 className="pc-repo-drawer-section-label">Answer & solution</h4>
            {loadingDetail ? (
              <p className="pc-repo-drawer-muted">Loading…</p>
            ) : (
              <>
                <div className="pc-repo-drawer-block">
                  <span className="pc-repo-drawer-block-label">Answer</span>
                  {isMcq ? (
                    <McqAnswerBlock detail={detail} />
                  ) : (
                    <>
                      <p className="pc-repo-drawer-block-text">
                        {detail.answer ?? 'Not provided yet.'}
                      </p>
                      {detail.answerHi && (
                        <p className="pc-repo-drawer-block-text is-hindi">
                          {detail.answerHi}
                        </p>
                      )}
                    </>
                  )}
                </div>
                {detail.solution && (
                  <div className="pc-repo-drawer-block">
                    <span className="pc-repo-drawer-block-label">Solution</span>
                    <p className="pc-repo-drawer-block-text">{detail.solution}</p>
                    {detail.solutionHi && (
                      <p className="pc-repo-drawer-block-text is-hindi">
                        {detail.solutionHi}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </section>

          <div className="pc-repo-drawer-two-col">
            <section className="pc-repo-drawer-section">
              <h4 className="pc-repo-drawer-section-label">Metadata</h4>
              <dl className="pc-repo-drawer-dl">
                <div>
                  <dt>Class</dt>
                  <dd>{detail.classLabel}</dd>
                </div>
                <div>
                  <dt>Subject</dt>
                  <dd>{detail.subject}</dd>
                </div>
                <div>
                  <dt>Chapter</dt>
                  <dd>{detail.chapter}</dd>
                </div>
                <div>
                  <dt>Topic</dt>
                  <dd>{detail.topic}</dd>
                </div>
                <div>
                  <dt>Bloom level</dt>
                  <dd style={{ textTransform: 'capitalize' }}>{detail.bloomLevel}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>{formatDate(detail.createdAtMs)}</dd>
                </div>
                <div>
                  <dt>Updated</dt>
                  <dd>{formatDate(detail.updatedAtMs)}</dd>
                </div>
                <div>
                  <dt>Used in papers</dt>
                  <dd>
                    <span className="pc-num">{detail.usage}</span>
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </div>

        {isAdmin && trashMode && (
          <footer className="pc-repo-drawer-footer">
            <p className="pc-repo-drawer-footer-hint">
              {detail.restoreTimeLeft
                ? `${detail.restoreTimeLeft}. After that this question is permanently removed.`
                : 'Recovery window expired. This question will be purged on next load.'}
            </p>
            <div className="pc-repo-drawer-actions">
              <button
                type="button"
                className="pc-btn is-sm is-primary is-block"
                disabled={busy || !detail.restoreTimeLeft}
                onClick={() => void onRestore?.()}
              >
                <RotateCcw size={14} strokeWidth={1.6} />
                {busy ? 'Restoring…' : 'Restore question'}
              </button>
            </div>
          </footer>
        )}

        {isAdmin && !trashMode && actions.length > 0 && (
          <footer className="pc-repo-drawer-footer">
            <p className="pc-repo-drawer-footer-hint">{meta.description}</p>
            <div className="pc-repo-drawer-actions">
              {primaryActions.map((action) => {
                const Icon = actionIcon(action)
                return (
                  <button
                    key={action}
                    type="button"
                    className={lifecycleBtnClass(action, true)}
                    disabled={pendingAction !== null}
                    onClick={() => runAction(action)}
                  >
                    <Icon size={14} strokeWidth={1.6} />
                    {pendingAction === action
                      ? 'Updating…'
                      : lifecycleActionLabel(action)}
                  </button>
                )
              })}
              {secondaryActions.length > 0 && (
                <div
                  className={
                    'pc-repo-drawer-actions-secondary' +
                    (secondaryActions.length === 1 ? ' is-single' : '')
                  }
                >
                  {secondaryActions.map((action) => {
                    const Icon = actionIcon(action)
                    return (
                      <button
                        key={action}
                        type="button"
                        className={lifecycleBtnClass(action, false)}
                        disabled={pendingAction !== null}
                        onClick={() => runAction(action)}
                      >
                        <Icon size={14} strokeWidth={1.6} />
                        {pendingAction === action
                          ? 'Updating…'
                          : lifecycleActionLabel(action)}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            {onDelete && (
              <button
                type="button"
                className="pc-btn is-sm is-outline is-danger is-block pc-repo-drawer-delete"
                disabled={busy || pendingAction !== null}
                onClick={() => void onDelete()}
              >
                <Trash2 size={14} strokeWidth={1.6} />
                {busy ? 'Moving…' : 'Move to trash'}
              </button>
            )}
          </footer>
        )}

        {!isAdmin && (
          <footer className="pc-repo-drawer-footer pc-repo-drawer-footer--muted">
            <p className="pc-repo-drawer-muted">
              Read-only view — published questions only.
            </p>
          </footer>
        )}
      </motion.aside>
    </motion.div>
  )
}
