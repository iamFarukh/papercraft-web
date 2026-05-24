import { m } from 'framer-motion'
import type { ProfileActivityStats } from '@/services/firebase/profile'
import { PC_TRANSITION } from '@/lib/motion/tokens'

type Props = {
  loading: boolean
  stats: ProfileActivityStats | null
  isAdmin: boolean
}

function formatLastActive(ms: number | null): string {
  if (!ms) return '—'
  const d = new Date(ms)
  const now = Date.now()
  const diff = now - ms
  if (diff < 86_400_000) {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

export function ProfileActivityStrip({ loading, stats, isAdmin }: Props) {
  const approvalLabel = isAdmin ? 'Approvals completed' : 'Submissions sent'

  return (
    <m.section
      className="pc-profile-activity"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...PC_TRANSITION.panel, delay: 0.06 }}
    >
      <h3 className="pc-profile-section-title">Activity</h3>
      <div className="pc-profile-activity-grid" aria-busy={loading}>
        <div className="pc-profile-stat">
          <span className="pc-profile-stat-val pc-num">
            {loading ? '—' : (stats?.papersCreated ?? 0)}
          </span>
          <span className="pc-profile-stat-label">Papers created</span>
        </div>
        <div className="pc-profile-stat">
          <span className="pc-profile-stat-val pc-num">
            {loading ? '—' : (stats?.approvalsCompleted ?? 0)}
          </span>
          <span className="pc-profile-stat-label">{approvalLabel}</span>
        </div>
        {isAdmin ? (
          <div className="pc-profile-stat">
            <span className="pc-profile-stat-val pc-num">
              {loading ? '—' : (stats?.questionsAuthored ?? 0)}
            </span>
            <span className="pc-profile-stat-label">Questions authored</span>
          </div>
        ) : null}
        <div className="pc-profile-stat">
          <span className="pc-profile-stat-val">
            {loading ? '—' : formatLastActive(stats?.lastActiveMs ?? null)}
          </span>
          <span className="pc-profile-stat-label">Last active</span>
        </div>
      </div>
    </m.section>
  )
}
