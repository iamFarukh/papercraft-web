import { Lock } from 'lucide-react'
import { formatSubmittedBannerDate } from '@/lib/paper-submission'

type Props = {
  submittedAtMs: number | null
  isAdminView?: boolean
  onReopen?: () => void
  reopening?: boolean
}

export function PaperSubmittedBanner({
  submittedAtMs,
  isAdminView,
  onReopen,
  reopening,
}: Props) {
  const when = submittedAtMs ? formatSubmittedBannerDate(submittedAtMs) : null

  return (
    <div className="pc-pb-submitted-banner" role="status">
      <Lock size={14} strokeWidth={1.6} className="pc-pb-submitted-banner-icon" />
      <div className="pc-pb-submitted-banner-text">
        <strong className="pc-serif">Submitted for approval</strong>
        <span>
          {isAdminView
            ? 'This paper is locked for teachers. You may continue editing or reopen it as a draft.'
            : 'Composition is locked while your paper awaits review. Preview the paper below.'}
          {when ? ` Submitted ${when}.` : null}
        </span>
      </div>
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
  )
}
