import { BadgeCheck, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatSubmittedBannerDate } from '@/lib/paper-submission'

type Props = {
  paperId?: string | null
  approvedAtMs: number | null
  isAdminView?: boolean
  onReopen?: () => void
  reopening?: boolean
}

export function PaperApprovedBanner({
  paperId,
  approvedAtMs,
  isAdminView,
  onReopen,
  reopening,
}: Props) {
  const when = approvedAtMs ? formatSubmittedBannerDate(approvedAtMs) : null

  return (
    <div className="pc-pb-submitted-banner is-approved" role="status">
      <BadgeCheck size={14} strokeWidth={1.6} className="pc-pb-submitted-banner-icon" />
      <div className="pc-pb-submitted-banner-text">
        <strong className="pc-serif">Approved examination paper</strong>
        <span>
          {isAdminView
            ? 'This is the official approved paper. Reopen as draft only if changes are required.'
            : 'This paper is approved and locked. Contact an administrator if revisions are needed.'}
          {when ? ` Approved ${when}.` : null}
        </span>
      </div>
      <div className="pc-pb-submitted-banner-actions">
        {paperId ? (
          <Link
            to={`/app/papers/${paperId}/preview?from=builder`}
            className="pc-btn is-sm is-primary"
          >
            <Eye size={12} strokeWidth={1.6} />
            Official preview
          </Link>
        ) : null}
        {isAdminView && onReopen ? (
          <button
            type="button"
            className="pc-btn is-sm"
            disabled={reopening}
            onClick={onReopen}
          >
            Reopen as draft
          </button>
        ) : null}
      </div>
    </div>
  )
}
