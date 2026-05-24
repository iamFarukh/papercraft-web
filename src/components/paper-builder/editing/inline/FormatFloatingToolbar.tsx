import { Minus, MoreHorizontal, Plus } from 'lucide-react'

type Props = {
  marginTopMm: number
  indentMm: number
  onMarginTopChange: (delta: number) => void
  onIndentChange: (delta: number) => void
  onMore?: () => void
}

export function FormatFloatingToolbar({
  marginTopMm,
  indentMm,
  onMarginTopChange,
  onIndentChange,
  onMore,
}: Props) {
  return (
    <div className="pc-ed-float-toolbar" role="toolbar" aria-label="Block formatting">
      <span className="pc-ed-float-label">Space</span>
      <button
        type="button"
        className="pc-ed-float-step"
        aria-label="Decrease space above"
        onClick={(e) => {
          e.stopPropagation()
          onMarginTopChange(-0.5)
        }}
      >
        <Minus size={11} strokeWidth={1.6} />
      </button>
      <span className="pc-ed-float-value pc-num">
        {marginTopMm.toFixed(1)}
        <span className="pc-ed-float-unit">mm</span>
      </span>
      <button
        type="button"
        className="pc-ed-float-step"
        aria-label="Increase space above"
        onClick={(e) => {
          e.stopPropagation()
          onMarginTopChange(0.5)
        }}
      >
        <Plus size={11} strokeWidth={1.6} />
      </button>

      <span className="pc-ed-float-divider" aria-hidden />

      <span className="pc-ed-float-label">Indent</span>
      <button
        type="button"
        className="pc-ed-float-step"
        aria-label="Decrease indent"
        onClick={(e) => {
          e.stopPropagation()
          onIndentChange(-1)
        }}
      >
        <Minus size={11} strokeWidth={1.6} />
      </button>
      <span className="pc-ed-float-value pc-num">
        {indentMm.toFixed(1)}
        <span className="pc-ed-float-unit">mm</span>
      </span>
      <button
        type="button"
        className="pc-ed-float-step"
        aria-label="Increase indent"
        onClick={(e) => {
          e.stopPropagation()
          onIndentChange(1)
        }}
      >
        <Plus size={11} strokeWidth={1.6} />
      </button>

      {onMore ? (
        <>
          <span className="pc-ed-float-divider" aria-hidden />
          <button
            type="button"
            className="pc-ed-float-step is-ghost"
            aria-label="More actions"
            onClick={(e) => {
              e.stopPropagation()
              onMore()
            }}
          >
            <MoreHorizontal size={12} strokeWidth={1.6} />
          </button>
        </>
      ) : null}
    </div>
  )
}
