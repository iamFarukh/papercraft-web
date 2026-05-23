import { Check, Eye, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PaperPdfExportLink } from '@/components/print/PaperPdfExportLink'
import { paperPrintPreviewPath } from '@/config/nav-routes'
import { canApprovePaper, canReopenPaper } from '@/lib/paper-submission'
import type { PaperSectionDef, PaperStats } from '@/lib/paper-builder'
import type { PaperStatus } from '@/types/paper'

type CheckItem = {
  label: string
  ok: boolean
  hint?: string
}

type Props = {
  paperId: string
  status: PaperStatus
  stats: PaperStats
  planMarks: number
  durationMinutes: number
  sections: PaperSectionDef[]
  busy: boolean
  onApprove: () => void
  onReopen: () => void
}

function buildValidationChecklist(
  stats: PaperStats,
  planMarks: number,
  durationMinutes: number,
  sections: PaperSectionDef[],
): CheckItem[] {
  const sectionsUsed = sections.filter((s) => (stats.sectionCounts[s.id] ?? 0) > 0).length
  return [
    {
      label: `Total marks = ${planMarks}`,
      ok: stats.totalMarks === planMarks,
      hint:
        stats.totalMarks !== planMarks
          ? `Composition has ${stats.totalMarks} marks`
          : undefined,
    },
    {
      label: 'At least one question',
      ok: stats.questionCount > 0,
    },
    {
      label: 'All sections represented',
      ok: sectionsUsed >= sections.length,
      hint: `${sectionsUsed} of ${sections.length} sections`,
    },
    {
      label: 'Solve time within window',
      ok: stats.estimatedMinutes <= durationMinutes,
      hint: `est. ${stats.estimatedMinutes} / ${durationMinutes} min`,
    },
  ]
}

export function ApprovalReviewPanel({
  paperId,
  status,
  stats,
  planMarks,
  durationMinutes,
  sections,
  busy,
  onApprove,
  onReopen,
}: Props) {
  const checks = buildValidationChecklist(stats, planMarks, durationMinutes, sections)
  const showApprove = canApprovePaper(status, true)
  const showReopen = canReopenPaper(status, true)
  const isApproved = status === 'approved'

  return (
    <aside className="pc-approval-review-panel pc-scroll">
      <div className="pc-approval-review-panel-head">
        <span className="pc-approval-review-panel-tab is-active">Review</span>
      </div>

      <div className="pc-approval-review-panel-body">
        <div className="pc-panel pc-approval-checklist">
          <div className="pc-approval-checklist-title">Validation checklist</div>
          {checks.map((c) => (
            <div key={c.label} className="pc-approval-check-row">
              <span
                className={`pc-approval-check-icon${c.ok ? ' is-ok' : ' is-warn'}`}
                aria-hidden
              >
                {c.ok ? <Check size={10} strokeWidth={2.4} /> : '!'}
              </span>
              <div>
                <div className="pc-approval-check-label">{c.label}</div>
                {c.hint ? <div className="pc-approval-check-hint">{c.hint}</div> : null}
              </div>
            </div>
          ))}
        </div>

        <div className="pc-panel pc-approval-summary-panel">
          <div className="pc-approval-checklist-title">Review summary</div>
          <div className="pc-approval-summary-grid">
            <div className="pc-approval-summary-stat">
              <div className="pc-approval-summary-stat-k">Questions</div>
              <div className="pc-approval-summary-stat-v pc-num">{stats.questionCount}</div>
            </div>
            <div className="pc-approval-summary-stat">
              <div className="pc-approval-summary-stat-k">Marks</div>
              <div className="pc-approval-summary-stat-v pc-num">
                {stats.totalMarks}
                <span className="pc-approval-summary-denom"> / {planMarks}</span>
              </div>
            </div>
            <div className="pc-approval-summary-stat">
              <div className="pc-approval-summary-stat-k">Est. time</div>
              <div className="pc-approval-summary-stat-v pc-num">
                ~{stats.estimatedMinutes}
                <span className="pc-approval-summary-denom"> min</span>
              </div>
            </div>
            <div className="pc-approval-summary-stat">
              <div className="pc-approval-summary-stat-k">Difficulty</div>
              <div className="pc-approval-summary-stat-v pc-approval-summary-diff">
                E {stats.diffEasy} · M {stats.diffMed} · H {stats.diffHard}
              </div>
            </div>
          </div>
        </div>

        <div className="pc-panel pc-approval-actions-panel">
          <p className="pc-approval-actions-lead">
            {status === 'approved'
              ? 'This paper is approved and locked as the official examination paper.'
              : 'Review the full composition, then approve or reopen for editing.'}
          </p>
          <div className="pc-approval-actions-btns">
            {showApprove ? (
              <button
                type="button"
                className="pc-btn is-primary is-block"
                disabled={busy}
                onClick={onApprove}
              >
                <Check size={14} strokeWidth={1.6} />
                Approve &amp; lock
              </button>
            ) : null}
            {showReopen ? (
              <button
                type="button"
                className="pc-btn is-sm is-block"
                disabled={busy}
                onClick={onReopen}
              >
                <RotateCcw size={12} strokeWidth={1.6} />
                Reopen as draft
              </button>
            ) : null}
            {isApproved ? (
              <>
                <Link
                  to={paperPrintPreviewPath(paperId, 'approval')}
                  className="pc-btn is-sm is-block"
                >
                  <Eye size={12} strokeWidth={1.6} />
                  Open official preview
                </Link>
                <PaperPdfExportLink
                  paperId={paperId}
                  canExport
                  from="approval"
                  className="is-block"
                  startExport
                />
              </>
            ) : (
              <PaperPdfExportLink
                paperId={paperId}
                canExport={false}
                from="approval"
                className="is-block"
              />
            )}
            <Link to="/app/papers" className="pc-btn is-sm is-block">
              Paper library
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
