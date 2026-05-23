import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { ApprovalPipeline } from '@/components/dashboard/ApprovalPipeline'
import { MetricOverview } from '@/components/dashboard/MetricOverview'
import { useControlCenterData } from '@/hooks/useControlCenterData'

export function ControlCenterWorkspace() {
  const { loading, error, metrics, pipeline, activities, papersInFlow, greeting } =
    useControlCenterData()
  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

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
            {dateLabel}
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
            {greeting.salutation}, {greeting.name}.
            <span
              style={{
                color: 'var(--pc-ink-4)',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              {' '}
              {greeting.subline}
            </span>
          </h1>
        </div>
      </header>

      <MetricOverview loading={loading} error={error} metrics={metrics} />
      <ApprovalPipeline
        loading={loading}
        error={error}
        pipeline={pipeline}
        papersInFlow={papersInFlow}
      />
      <ActivityFeed loading={loading} error={error} activities={activities} />
    </main>
  )
}
