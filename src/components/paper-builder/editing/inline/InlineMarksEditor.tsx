import { ChevronDown } from 'lucide-react'
import { useRef, useState } from 'react'
import { EditorialChip } from './EditorialChip'
import { EditorPopover } from './EditorPopover'

const PRESETS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15]

type Props = {
  value: number
  repositoryMarks: number
  disabled?: boolean
  onChange: (marks: number | undefined) => void
}

export function InlineMarksEditor({
  value,
  repositoryMarks,
  disabled,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const overridden = value !== repositoryMarks

  return (
    <div className="pc-ed-marks" ref={anchorRef} onClick={(e) => e.stopPropagation()}>
      <EditorialChip
        active={open || overridden}
        title={overridden ? `Overridden (repository ${repositoryMarks})` : 'Marks'}
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <span className="pc-num">{value}</span>
        <span className="pc-ed-marks-suffix"> mark{value === 1 ? '' : 's'}</span>
        <ChevronDown size={10} strokeWidth={2} />
      </EditorialChip>

      <EditorPopover
        open={open && !disabled}
        anchorRef={anchorRef}
        onClose={() => setOpen(false)}
        className="pc-ed-popover-portal--marks"
        align="start"
      >
        <p className="pc-ed-popover-label">Marks on this paper</p>
        <div className="pc-ed-marks-presets">
          {PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              className={`pc-ed-marks-preset${m === value ? ' is-active' : ''}`}
              onClick={() => {
                onChange(m === repositoryMarks ? undefined : m)
                setOpen(false)
              }}
            >
              <span className="pc-num">{m}</span>
            </button>
          ))}
        </div>
        <label className="pc-ed-marks-custom">
          <span>Custom</span>
          <input
            type="number"
            min={0}
            className="pc-ed-inline-input pc-num"
            value={value}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (Number.isFinite(v) && v >= 0) {
                onChange(v === repositoryMarks ? undefined : v)
              }
            }}
          />
        </label>
        {overridden ? (
          <button
            type="button"
            className="pc-ed-popover-link"
            onClick={() => {
              onChange(undefined)
              setOpen(false)
            }}
          >
            Reset to repository ({repositoryMarks})
          </button>
        ) : null}
      </EditorPopover>
    </div>
  )
}
