import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { ApprovalPipeline } from '@/components/dashboard/ApprovalPipeline'
import { MetricOverview } from '@/components/dashboard/MetricOverview'

export function ControlCenterWorkspace() {
  return (
    <main
      className="pc-scroll"
      style={{
        flex: 1,
        minHeight: 0,
        padding: '22px 28px 32px',
        background: 'var(--pc-bg)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 20,
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11.5,
              color: 'var(--pc-ink-4)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontWeight: 500,
              marginBottom: 6,
            }}
          >
            Tuesday · 21 May 2026 · Term II in progress
          </div>
          <h1
            className="pc-serif"
            style={{
              fontSize: 34,
              margin: 0,
              letterSpacing: '-0.028em',
              lineHeight: 1.1,
            }}
          >
            Good morning, Aarav.
            <span
              style={{
                color: 'var(--pc-ink-4)',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              {' '}
              Seven papers await your review.
            </span>
          </h1>
        </div>
      </header>

      <MetricOverview />
      <ApprovalPipeline />
      <ActivityFeed />
    </main>
  )
}
