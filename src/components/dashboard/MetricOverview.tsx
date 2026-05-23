import { motion } from 'framer-motion'
import { METRICS, type MetricTrend } from '@/data/control-center-mock'
import { Sparkline } from './Sparkline'

function trendColor(trend: MetricTrend): string {
  if (trend === 'up') return 'var(--pc-success-text)'
  if (trend === 'down') return 'var(--pc-danger-text)'
  return 'var(--pc-ink-3)'
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const cardVariants = {
  hidden: { y: 12, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
}

export function MetricOverview() {
  return (
    <motion.section
      className="pc-metrics-row"
      aria-label="Operational overview"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {METRICS.map((metric) => (
        <motion.article
          key={metric.label}
          className="pc-metric-card"
          variants={cardVariants}
          whileHover={{
            y: -5,
            boxShadow: 'var(--pc-shadow-md)',
            borderColor: 'var(--pc-primary-200)',
            transition: { duration: 0.18, ease: 'easeOut' },
          }}
          style={{ cursor: 'pointer' }}
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
            {metric.unit && (
              <span className="pc-metric-unit pc-num">{metric.unit}</span>
            )}
          </div>

          <div className="pc-metric-spark">
            <Sparkline points={metric.sparkPoints} color={metric.sparkColor} />
          </div>

          <p className="pc-metric-hint">{metric.hint}</p>
        </motion.article>
      ))}
    </motion.section>
  )
}

