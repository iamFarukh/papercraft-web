import { motion } from 'framer-motion'

type SparklineProps = {
  points: number[]
  color?: string
  height?: number
  width?: number
}

export function Sparkline({
  points,
  color = 'var(--pc-primary)',
  height = 28,
  width = 100,
}: SparklineProps) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const step = width / (points.length - 1)

  const coords = points
    .map((p, i) => {
      const x = i * step
      const y = height - ((p - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      className="pc-spark"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <motion.polyline
        points={coords}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0.3 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
      />
    </svg>
  )
}

