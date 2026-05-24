import { useCallback, useId, useRef, useState } from 'react'

export type FormatSliderSpec = {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  defaultValue?: number
  globalValue?: number
  warningBelow?: number
  warningAbove?: number
  disabled?: boolean
  onChange: (value: number) => void
  onReset?: () => void
}

function zoneClass(
  value: number,
  warningBelow?: number,
  warningAbove?: number,
): 'is-safe' | 'is-warn' | 'is-danger' {
  if (warningBelow != null && value < warningBelow - 0.5) return 'is-danger'
  if (warningAbove != null && value > warningAbove + 1) return 'is-danger'
  if (warningBelow != null && value < warningBelow) return 'is-warn'
  if (warningAbove != null && value > warningAbove) return 'is-warn'
  return 'is-safe'
}

export function FormatSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  defaultValue,
  globalValue,
  warningBelow,
  warningAbove,
  disabled,
  onChange,
  onReset,
}: FormatSliderSpec) {
  const id = useId()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasOverride = globalValue != null && Math.abs(value - globalValue) > 0.01
  const trackClass = zoneClass(value, warningBelow, warningAbove)

  const commit = useCallback(
    (next: number) => {
      const clamped = Math.min(max, Math.max(min, next))
      const stepped = Math.round(clamped / step) * step
      onChange(Math.round(stepped * 100) / 100)
    },
    [max, min, onChange, step],
  )

  function handleSlider(v: number) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => commit(v), 16)
    commit(v)
  }

  function handleInputBlur() {
    setEditing(false)
    const parsed = Number(draft)
    if (Number.isFinite(parsed)) commit(parsed)
  }

  return (
    <div className="pc-fmt-slider-wrap">
      <div className="pc-fmt-slider-head">
        <label className="pc-fmt-slider-label" htmlFor={id}>
          {label}
          {hasOverride ? <span className="pc-fmt-override-dot" title="Custom override" /> : null}
        </label>
        <div className="pc-fmt-slider-value-row">
          {editing && !disabled ? (
            <input
              id={id}
              type="number"
              className="pc-fmt-slider-num-input pc-num"
              min={min}
              max={max}
              step={step}
              value={draft}
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              onBlur={handleInputBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleInputBlur()
                if (e.key === 'Escape') setEditing(false)
              }}
            />
          ) : (
            <button
              type="button"
              className="pc-fmt-slider-value pc-num"
              disabled={disabled}
              title="Click to type exact value"
              onClick={() => {
                setDraft(String(value))
                setEditing(true)
              }}
            >
              {value}
              {unit}
            </button>
          )}
          {hasOverride && onReset ? (
            <button type="button" className="pc-fmt-slider-reset" disabled={disabled} onClick={onReset}>
              Reset
            </button>
          ) : null}
        </div>
      </div>
      <input
        type="range"
        className={`pc-fmt-slider ${trackClass}`}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={`${label}, ${value} ${unit}`}
        onChange={(e) => handleSlider(Number(e.target.value))}
        onDoubleClick={() => defaultValue != null && commit(defaultValue)}
      />
      {globalValue != null ? (
        <p className="pc-fmt-slider-global pc-num">
          Global: {globalValue}
          {unit}
        </p>
      ) : null}
    </div>
  )
}
