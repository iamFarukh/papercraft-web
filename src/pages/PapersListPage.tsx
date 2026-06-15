import { Eye, FileText, Plus } from 'lucide-react'
import { PaperExportLink } from '@/components/print/PaperExportLink'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MotionList, MotionListItem } from '@/components/motion/MotionList'
import { EmptyStatePanel } from '@/components/ui/EmptyStatePanel'
import { useAuth } from '@/context/AuthContext'
import { paperListHeading } from '@/lib/paper-builder'
import { PAPER_STATUS_CHIP } from '@/lib/paper-status-ui'
import { listRecentPapers } from '@/services/firebase/papers'
import type { PaperListItem } from '@/types/paper'

function formatRelative(ms: number): string {
  if (!ms) return '—'
  const sec = Math.floor((Date.now() - ms) / 1000)
  if (sec < 60) return 'Just now'
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return new Date(ms).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

const PAPER_EMPTY_STEPS = [
  {
    number: 1,
    content: 'Set up class, subject, and examination details',
  },
  {
    number: 2,
    content: (
      <>
        Add questions from the <strong>Question Repository</strong> into sections
      </>
    ),
  },
  {
    number: 3,
    content: 'Save your draft and submit when the paper is ready',
  },
]

export function PapersListPage() {
  const { user, isAdmin } = useAuth()
  const [papers, setPapers] = useState<PaperListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    if (!hasLoadedRef.current) setLoading(true)
    setError(null)
    listRecentPapers({ userId: user.uid, isAdmin })
      .then((rows) => {
        if (!cancelled) {
          setPapers(rows)
          hasLoadedRef.current = true
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load papers.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user, isAdmin])

  const hasPapers = !loading && !error && papers.length > 0

  return (
    <div className="pc-papers-page pc-dots">
      <div className="pc-papers-inner">
        <header className="pc-papers-head">
          <div>
            <p className="pc-papers-kicker">Academic</p>
            <h1 className="pc-papers-title">Recent papers</h1>
            <p className="pc-papers-lead">
              Examination papers you have composed. Open a draft to edit, or review a
              submitted paper.
            </p>
          </div>
          {hasPapers ? (
            <Link to="/app/builder/new" className="pc-btn is-primary">
              <Plus size={14} strokeWidth={1.6} />
              New paper
            </Link>
          ) : null}
        </header>

        {loading ? (
          <ul className="pc-papers-list" aria-busy aria-hidden>
            {Array.from({ length: 3 }, (_, i) => (
              <li key={i}>
                <div className="pc-papers-row-wrap pc-motion-surface">
                  <div className="pc-papers-row">
                    <span className="pc-skel pc-skel-activity-av" />
                    <div className="pc-papers-row-main">
                      <span className="pc-skel pc-skel-activity-title" />
                      <span className="pc-skel pc-skel-activity-meta" />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : error ? (
          <EmptyStatePanel
            icon={FileText}
            title="Could not load papers"
            description="We could not load the paper library right now."
            hint="Please try again in a moment."
            variant="error"
            lottie="loadError"
          />
        ) : papers.length === 0 ? (
          <EmptyStatePanel
            icon={FileText}
            title="No papers yet"
            description="Start with setup, then compose questions from your repository."
            lottie="emptyPapers"
            steps={PAPER_EMPTY_STEPS}
            actions={[
              {
                kind: 'link',
                label: 'Create your first paper',
                to: '/app/builder/new',
                primary: true,
              },
            ]}
          />
        ) : (
          <MotionList as="ul" className="pc-papers-list">
            {papers.map((p) => {
              const chip = PAPER_STATUS_CHIP[p.status] ?? PAPER_STATUS_CHIP.draft
              const isApproved = p.status === 'approved'
              const rowTo = isApproved
                ? `/app/papers/${p.id}/preview?from=library`
                : `/app/builder/${p.id}`
              return (
                <MotionListItem as="li" key={p.id}>
                  <div
                    className={`pc-papers-row-wrap pc-motion-surface${p.status === 'submitted' ? ' is-submitted' : ''}${isApproved ? ' is-approved' : ''}`}
                  >
                    <Link to={rowTo} className="pc-papers-row">
                      <span className="pc-papers-row-icon" aria-hidden>
                        <FileText size={16} strokeWidth={1.5} />
                      </span>
                      <div className="pc-papers-row-main">
                        <span className="pc-papers-row-title pc-serif">
                          {paperListHeading(p)}
                        </span>
                        <span className="pc-papers-row-meta">{p.title}</span>
                      </div>
                      <div className="pc-papers-row-end">
                        <span className={`pc-tag ${chip.className}`}>{chip.label}</span>
                        <span className="pc-papers-row-time">
                          {isApproved && p.approvedAtMs
                            ? `Approved ${formatRelative(p.approvedAtMs)}`
                            : p.status === 'submitted' && p.submittedAtMs
                              ? `Submitted ${formatRelative(p.submittedAtMs)}`
                              : formatRelative(p.updatedAtMs)}
                        </span>
                      </div>
                    </Link>
                    {isApproved ? (
                      <div className="pc-papers-row-actions">
                        <Link
                          to={`/app/papers/${p.id}/preview?from=library`}
                          className="pc-btn is-sm pc-papers-preview-btn"
                        >
                          <Eye size={12} strokeWidth={1.6} />
                          Open official preview
                        </Link>
                        <PaperExportLink
                          paperId={p.id}
                          canExport
                          from="library"
                          className="pc-papers-export-btn"
                        />
                      </div>
                    ) : null}
                  </div>
                </MotionListItem>
              )
            })}
          </MotionList>
        )}
      </div>
    </div>
  )
}
