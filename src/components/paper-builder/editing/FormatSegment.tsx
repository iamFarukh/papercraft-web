type Option<T extends string> = {
  value: T
  label: string
  title?: string
}

type Props<T extends string> = {
  label?: string
  value: T
  options: Option<T>[]
  disabled?: boolean
  onChange: (value: T) => void
}

export function FormatSegment<T extends string>({
  label,
  value,
  options,
  disabled,
  onChange,
}: Props<T>) {
  return (
    <div className="pc-fmt-segment-wrap">
      {label ? <span className="pc-fmt-segment-label">{label}</span> : null}
      <div className="pc-fmt-segment" role="radiogroup" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            title={opt.title}
            disabled={disabled}
            className={`pc-fmt-segment-btn${value === opt.value ? ' is-active' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
