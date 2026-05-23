import { motion } from 'framer-motion'
import { MetricCardSkeleton } from '@/components/dashboard/MetricCardSkeleton'
import type { ControlCenterMetric, MetricTrend } from '@/lib/control-center'
import { listItemReveal, listReveal } from '@/lib/motion/variants'

function trendColor(trend: MetricTrend): string {
  if (trend === 'up') return 'var(--pc-success-text)'
  if (trend === 'down') return 'var(--pc-danger-text)'
  return 'var(--pc-ink-3)'
}

type Props = {
  loading: boolean
  error: string | null
  metrics: ControlCenterMetric[]
}

function MetricCard({ metric }: { metric: ControlCenterMetric }) {
  return (
    <motion.article
      className="pc-metric-card pc-motion-surface"
      variants={listItemReveal}
    >
      <div className="pc-metric-card-top">
        <span className="pc-metric-label">{metric.label}</span>
        <span
          className="pc-metric-trend"
          style={{ color: trendColor(metric.trend) }}
        >
          {metric.trendLabel}
        </span>
      </div>

      <div className="pc-metric-value-row">
        <span className="pc-metric-value pc-serif pc-num">{metric.value}</span>
        {metric.unit ? (
          <span className="pc-metric-unit pc-num">{metric.unit}</span>
        ) : null}
      </div>

      <p className="pc-metric-hint">{metric.hint}</p>
    </motion.article>
  )
}

export function MetricOverview({ loading, error, metrics }: Props) {
  return (
    <motion.section
      className="pc-metrics-row"
      aria-label="Operational overview"
      variants={listReveal}
      initial="hidden"
      animate="visible"
    >
      {loading
        ? Array.from({ length: 4 }, (_, i) => <MetricCardSkeleton key={i} />)
        : null}
      {!loading && error ? (
        <p className="pc-metric-hint" style={{ gridColumn: '1 / -1' }}>
          {error}
        </p>
      ) : null}
      {!loading && !error
        ? metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)
        : null}
    </motion.section>
  )
}
