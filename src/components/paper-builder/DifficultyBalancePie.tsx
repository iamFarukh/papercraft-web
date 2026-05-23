type Slice = { value: number; color: string }

export function DifficultyBalancePie({
  slices,
  size = 84,
}: {
  slices: Slice[]
  size?: number
}) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1
  let acc = 0
  const r = size / 2 - 6
  const cx = size / 2
  const cy = size / 2

  const arc = (start: number, end: number) => {
    const a0 = (start / total) * 2 * Math.PI - Math.PI / 2
    const a1 = (end / total) * 2 * Math.PI - Math.PI / 2
    const x0 = cx + r * Math.cos(a0)
    const y0 = cy + r * Math.sin(a0)
    const x1 = cx + r * Math.cos(a1)
    const y1 = cy + r * Math.sin(a1)
    const large = end - start > total / 2 ? 1 : 0
    return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      {slices.map((s, i) => {
        const d = arc(acc, acc + s.value)
        acc += s.value
        return <path key={i} d={d} fill={s.color} />
      })}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="var(--pc-surface)" />
    </svg>
  )
}
