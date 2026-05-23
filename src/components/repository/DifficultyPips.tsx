const TONES = ['is-easy', 'is-easy', 'is-medium', 'is-hard'] as const
const LABELS = ['Easy', 'Easy', 'Medium', 'Hard'] as const

export function DifficultyPips({ level }: { level: 1 | 2 | 3 | 4 }) {
  const tone = TONES[level - 1] ?? 'is-medium'
  const label = LABELS[level - 1] ?? 'Medium'

  return (
    <span className="pc-pips" title={label}>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`pc-pip ${i <= level ? tone : ''}`}
        />
      ))}
    </span>
  )
}
