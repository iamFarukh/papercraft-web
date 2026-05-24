import type { PaperHeaderPreset } from '@/types/paper-instance'
import { HEADER_PRESET_LABELS } from '@/lib/paper-instance'

type Props = {
  value: PaperHeaderPreset
  disabled?: boolean
  onChange: (preset: PaperHeaderPreset) => void
}

const PRESETS: PaperHeaderPreset[] = ['compact', 'standard', 'spacious']

function HeaderPreview({ preset }: { preset: PaperHeaderPreset }) {
  const barHeights =
    preset === 'spacious'
      ? { school: 10, tag: 5, meta: 6 }
      : preset === 'compact'
        ? { school: 5, tag: 0, meta: 4 }
        : { school: 7, tag: 4, meta: 5 }

  return (
    <span className="pc-fmt-header-preview" aria-hidden>
      <span
        className="pc-fmt-header-preview-bar is-school"
        style={{ height: barHeights.school }}
      />
      {barHeights.tag > 0 ? (
        <span
          className="pc-fmt-header-preview-bar is-tag"
          style={{ height: barHeights.tag }}
        />
      ) : null}
      <span
        className="pc-fmt-header-preview-bar is-meta"
        style={{ height: barHeights.meta }}
      />
    </span>
  )
}

export function HeaderPresetPicker({ value, disabled, onChange }: Props) {
  return (
    <div className="pc-fmt-header-picker">
      <span className="pc-fmt-segment-label">Header size</span>
      <div className="pc-fmt-header-cards" role="radiogroup" aria-label="Header size">
        {PRESETS.map((preset) => {
          const meta = HEADER_PRESET_LABELS[preset]
          return (
            <button
              key={preset}
              type="button"
              role="radio"
              aria-checked={value === preset}
              disabled={disabled}
              title={meta.hint}
              className={`pc-fmt-header-card${value === preset ? ' is-active' : ''}`}
              onClick={() => onChange(preset)}
            >
              <HeaderPreview preset={preset} />
              <span className="pc-fmt-header-card-label">{meta.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
