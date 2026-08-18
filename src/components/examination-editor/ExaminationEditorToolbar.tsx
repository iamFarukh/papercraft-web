import { useRef, useState, type ReactNode } from 'react'
import {
  ArrowDownToLine,
  ArrowUpToLine,
  ChevronDown,
  EyeOff,
  Hash,
  Minus,
  Plus,
  RotateCcw,
  Settings2,
  Sliders,
  Sparkles,
  Type,
} from 'lucide-react'
import {
  applyGlobalDensity,
  applyGlobalFontSize,
  applySideMargin,
} from '@/lib/paper-format-config'
import {
  applySmartFitSettings,
  patchFormatConfig,
  type ResolvedPaper,
} from '@/lib/paper-instance'
import type {
  EditSelection,
  PaperInstanceLayer,
  PaperMarksDisplay,
} from '@/types/paper-instance'
import type { PaperSectionId, PaperSetupState } from '@/lib/paper-builder'
import { patchQuestionInstance, patchSectionInstance } from '@/components/paper-builder/editing/instance-patch'
import { EditorPopover } from '@/components/paper-builder/editing/inline/EditorPopover'
import { InlineMarksEditor } from '@/components/paper-builder/editing/inline/InlineMarksEditor'
import { PaperDocumentInspector } from '@/components/paper-builder/editing/PaperDocumentInspector'

type Props = {
  resolved: ResolvedPaper
  selection: EditSelection
  setup: PaperSetupState
  instanceLayer: PaperInstanceLayer
  pageCount: number
  readOnly?: boolean
  onSelect: (sel: EditSelection) => void
  /** Accepts a value or a functional updater so rapid stepper clicks accumulate. */
  onInstanceChange: (
    next: PaperInstanceLayer | ((prev: PaperInstanceLayer) => PaperInstanceLayer),
  ) => void
  onSetupChange: (patch: Partial<PaperSetupState>) => void
  onMoveSection: (sectionId: PaperSectionId, direction: 'up' | 'down') => void
}

const FONT_MIN = 7
const FONT_MAX = 18
const DENSITY_MIN = 0.5
const DENSITY_MAX = 8
const SECTION_TITLE_MIN = 9
const SECTION_TITLE_MAX = 22
const MARGIN_MIN = 5
const MARGIN_MAX = 40

function fmtNum(n: number) {
  return n.toFixed(n % 1 === 0 ? 0 : 1)
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(n * 10) / 10))
}

/** Compact −/value/+ stepper used across the toolbar. */
function Stepper({
  icon,
  label,
  value,
  suffix,
  disabled,
  onStep,
  title,
}: {
  icon?: ReactNode
  label?: string
  value: string
  suffix?: string
  disabled?: boolean
  onStep: (dir: 1 | -1) => void
  title?: string
}) {
  return (
    <div className="pc-ee-tb-stepper" title={title}>
      {icon ? <span className="pc-ee-tb-stepper-icon" aria-hidden>{icon}</span> : null}
      {label ? <span className="pc-ee-tb-stepper-label">{label}</span> : null}
      <button
        type="button"
        className="pc-ee-tb-step"
        aria-label={`Decrease ${label ?? 'value'}`}
        disabled={disabled}
        onClick={() => onStep(-1)}
      >
        <Minus size={12} strokeWidth={2} />
      </button>
      <span className="pc-ee-tb-stepper-value pc-num">
        {value}
        {suffix ? <span className="pc-ee-tb-stepper-unit">{suffix}</span> : null}
      </span>
      <button
        type="button"
        className="pc-ee-tb-step"
        aria-label={`Increase ${label ?? 'value'}`}
        disabled={disabled}
        onClick={() => onStep(1)}
      >
        <Plus size={12} strokeWidth={2} />
      </button>
    </div>
  )
}

/** Small inline segmented control (label-less, sized for the toolbar). */
function Segment<T extends string>({
  value,
  options,
  disabled,
  onChange,
  ariaLabel,
}: {
  value: T
  options: { value: T; label: string }[]
  disabled?: boolean
  onChange: (v: T) => void
  ariaLabel: string
}) {
  return (
    <div className="pc-ee-tb-segment" role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          disabled={disabled}
          className={`pc-ee-tb-seg-btn${value === opt.value ? ' is-active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function Divider() {
  return <span className="pc-ee-tb-divider" aria-hidden />
}

export function ExaminationEditorToolbar({
  resolved,
  selection,
  setup,
  instanceLayer,
  pageCount,
  readOnly,
  onSelect,
  onInstanceChange,
  onSetupChange,
  onMoveSection,
}: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const detailsAnchorRef = useRef<HTMLDivElement>(null)
  const formatConfig = resolved.formatConfig

  function patchFormat(updater: Parameters<typeof patchFormatConfig>[1]) {
    onInstanceChange((prev) => patchFormatConfig(prev, updater))
  }

  const selectedQuestion =
    selection.kind === 'question'
      ? resolved.sections
          .flatMap((s) => s.questions)
          .find((q) => q.question.id === selection.questionId)
      : undefined
  const selectedSection =
    selection.kind === 'section'
      ? resolved.sections.find((s) => s.id === selection.sectionId)
      : selection.kind === 'question'
        ? resolved.sections.find((s) => s.id === selection.sectionId)
        : undefined
  const sectionIds = resolved.sections.map((s) => s.id)

  const scope: { label: string; icon: ReactNode } =
    selection.kind === 'question'
      ? {
          label: `Question ${selectedQuestion?.displayNumber ?? ''}`.trim(),
          icon: <Hash size={12} strokeWidth={2} />,
        }
      : selection.kind === 'section'
        ? {
            label: `Section ${selectedSection?.letter ?? ''}`.trim(),
            icon: <Sliders size={12} strokeWidth={2} />,
          }
        : { label: 'Whole paper', icon: <Type size={12} strokeWidth={2} /> }

  const detailsLabel =
    selection.kind === 'question'
      ? 'Question format'
      : selection.kind === 'section'
        ? 'Section format'
        : 'Document settings'

  /* ── Quick controls per scope ── */
  function renderQuickControls() {
    if (selection.kind === 'question' && selectedQuestion) {
      const q = selectedQuestion
      const defaultGap =
        selectedSection?.sectionFormat.questionSpacing ??
        formatConfig.spacing.betweenQuestions
      const gap = q.questionFormat.marginTop
      const spacingValue =
        !q.questionFormat.hasOverrides || Math.abs(gap - defaultGap) < 0.25
          ? 'normal'
          : gap < defaultGap
            ? 'compact'
            : 'spacious'

      function patchQ(patch: Parameters<typeof patchQuestionInstance>[2]) {
        onInstanceChange((prev) => patchQuestionInstance(prev, q.question.id, patch))
      }

      return (
        <>
          <span className="pc-ee-tb-group-label">Marks</span>
          <InlineMarksEditor
            value={q.effectiveMarks}
            repositoryMarks={q.repositoryMarks}
            disabled={readOnly}
            onChange={(marks) => patchQ({ marksOverride: marks })}
          />
          <Divider />
          <span className="pc-ee-tb-group-label">Spacing</span>
          <Segment
            ariaLabel="Question spacing"
            value={spacingValue}
            disabled={readOnly}
            options={[
              { value: 'compact', label: 'Compact' },
              { value: 'normal', label: 'Normal' },
              { value: 'spacious', label: 'Spacious' },
            ]}
            onChange={(v) => {
              if (v === 'normal') patchQ({ marginTop: undefined, spacingMode: undefined })
              else if (v === 'compact')
                patchQ({ marginTop: clamp(defaultGap * 0.5, 0, 15), spacingMode: undefined })
              else patchQ({ marginTop: clamp(defaultGap * 1.5 + 1, 0, 15), spacingMode: undefined })
            }}
          />
          <Divider />
          <span className="pc-ee-tb-group-label">Font</span>
          <Stepper
            label="Size"
            value={fmtNum(q.questionFormat.fontSize)}
            suffix="pt"
            disabled={readOnly}
            title="Font size for this question only"
            onStep={(dir) =>
              patchQ({ fontSize: clamp(q.questionFormat.fontSize + dir * 0.5, FONT_MIN, FONT_MAX) })
            }
          />
          <Divider />
          <button
            type="button"
            className={`pc-ee-tb-toggle${q.showNumber ? ' is-on' : ''}`}
            disabled={readOnly}
            title="Question numbering"
            onClick={() => patchQ({ hideNumber: q.showNumber ? true : undefined })}
          >
            <Hash size={12} strokeWidth={2} />
            {q.showNumber ? 'Numbered' : 'No number'}
          </button>
          <button
            type="button"
            className="pc-ee-tb-toggle"
            disabled={readOnly}
            title="Hide this question on the printed paper"
            onClick={() => patchQ({ hidden: true })}
          >
            <EyeOff size={12} strokeWidth={2} />
            Hide
          </button>
          {q.questionFormat.hasOverrides ? (
            <button
              type="button"
              className="pc-ee-tb-toggle"
              disabled={readOnly}
              title="Reset this question's formatting to the global defaults"
              onClick={() =>
                patchQ({
                  marginTop: undefined,
                  marginBottom: undefined,
                  indent: undefined,
                  fontSize: undefined,
                  spacingMode: undefined,
                })
              }
            >
              <RotateCcw size={12} strokeWidth={2} />
              Reset
            </button>
          ) : null}
        </>
      )
    }

    if (selection.kind === 'section' && selectedSection) {
      const section = selectedSection
      const si = sectionIds.indexOf(section.id)
      const titleSize = section.sectionFormat.fontSize

      function patchS(patch: Record<string, unknown>) {
        onInstanceChange((prev) => patchSectionInstance(prev, section.id, patch))
      }

      return (
        <>
          <span className="pc-ee-tb-group-label">Order</span>
          <button
            type="button"
            className="pc-ee-tb-icon-btn"
            disabled={readOnly || si === 0}
            aria-label={`Move section ${section.letter} up`}
            title="Move section up"
            onClick={() => onMoveSection(section.id, 'up')}
          >
            <ArrowUpToLine size={13} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="pc-ee-tb-icon-btn"
            disabled={readOnly || si === sectionIds.length - 1}
            aria-label={`Move section ${section.letter} down`}
            title="Move section down"
            onClick={() => onMoveSection(section.id, 'down')}
          >
            <ArrowDownToLine size={13} strokeWidth={1.8} />
          </button>
          <Divider />
          <Stepper
            label="Heading"
            value={titleSize.toFixed(titleSize % 1 === 0 ? 0 : 1)}
            suffix="pt"
            disabled={readOnly}
            title="Section heading size"
            onStep={(dir) =>
              patchS({ fontSize: clamp(titleSize + dir * 0.5, SECTION_TITLE_MIN, SECTION_TITLE_MAX) })
            }
          />
          <Divider />
          <button
            type="button"
            className="pc-ee-tb-toggle"
            disabled={readOnly}
            title="Hide this section on the printed paper"
            onClick={() => patchS({ hidden: true })}
          >
            <EyeOff size={12} strokeWidth={2} />
            Hide
          </button>
          {section.sectionFormat.hasOverrides ? (
            <button
              type="button"
              className="pc-ee-tb-toggle"
              disabled={readOnly}
              title="Reset this section's formatting to global defaults"
              onClick={() =>
                patchS({
                  spacingAbove: undefined,
                  spacingAfterHeader: undefined,
                  questionSpacing: undefined,
                  fontSize: undefined,
                  spacingMode: undefined,
                })
              }
            >
              <RotateCcw size={12} strokeWidth={2} />
              Reset
            </button>
          ) : null}
        </>
      )
    }

    // Whole paper
    const font = formatConfig.globalFontSize
    const density = formatConfig.globalDensity
    return (
      <>
        <Stepper
          icon={<Type size={12} strokeWidth={2} />}
          label="Text"
          value={font.toFixed(font % 1 === 0 ? 0 : 1)}
          suffix="pt"
          disabled={readOnly}
          title="Font size for every question"
          onStep={(dir) =>
            patchFormat((c) =>
              applyGlobalFontSize(c, clamp(c.globalFontSize + dir * 0.5, FONT_MIN, FONT_MAX)),
            )
          }
        />
        <Divider />
        <Stepper
          label="Spacing"
          value={density.toFixed(density % 1 === 0 ? 0 : 1)}
          suffix="mm"
          disabled={readOnly}
          title="Spacing density between questions"
          onStep={(dir) =>
            patchFormat((c) =>
              applyGlobalDensity(c, clamp(c.globalDensity + dir * 0.5, DENSITY_MIN, DENSITY_MAX)),
            )
          }
        />
        <Divider />
        <span className="pc-ee-tb-group-label">Margins</span>
        <Stepper
          label="Left"
          value={fmtNum(formatConfig.pageMargins.left)}
          suffix="mm"
          disabled={readOnly}
          title="Left page margin"
          onStep={(dir) =>
            patchFormat((c) =>
              applySideMargin(c, 'left', clamp(c.pageMargins.left + dir, MARGIN_MIN, MARGIN_MAX)),
            )
          }
        />
        <Stepper
          label="Right"
          value={fmtNum(formatConfig.pageMargins.right)}
          suffix="mm"
          disabled={readOnly}
          title="Right page margin"
          onStep={(dir) =>
            patchFormat((c) =>
              applySideMargin(c, 'right', clamp(c.pageMargins.right + dir, MARGIN_MIN, MARGIN_MAX)),
            )
          }
        />
        <Divider />
        <span className="pc-ee-tb-group-label">Marks</span>
        <Segment
          ariaLabel="Marks style"
          value={formatConfig.marks.style}
          disabled={readOnly}
          options={[
            { value: 'bracket', label: '[5]' },
            { value: 'paren', label: '(5)' },
            { value: 'hidden', label: 'Off' },
          ]}
          onChange={(style) =>
            patchFormat((c) => ({ ...c, marks: { ...c.marks, style: style as PaperMarksDisplay } }))
          }
        />
        <Divider />
        <button
          type="button"
          className="pc-ee-tb-toggle pc-ee-tb-smartfit"
          disabled={readOnly}
          title="Compact header + tighter spacing to save paper"
          onClick={() => onInstanceChange((prev) => applySmartFitSettings(prev))}
        >
          <Sparkles size={12} strokeWidth={1.8} />
          Smart fit
        </button>
      </>
    )
  }

  return (
    <div className="pc-ee-toolbar" role="toolbar" aria-label="Formatting toolbar">
      <button
        type="button"
        className={`pc-ee-tb-scope${selection.kind !== 'paper' ? ' is-block' : ''}`}
        title={
          selection.kind === 'paper'
            ? 'Editing the whole paper — click a question or section to focus it'
            : 'Click here to return to whole-paper settings'
        }
        onClick={() => selection.kind !== 'paper' && onSelect({ kind: 'paper' })}
      >
        <span className="pc-ee-tb-scope-icon" aria-hidden>{scope.icon}</span>
        <span className="pc-ee-tb-scope-label">{scope.label}</span>
      </button>

      <Divider />

      <div className="pc-ee-tb-controls pc-scroll-x">{renderQuickControls()}</div>

      <div className="pc-ee-tb-trailing" ref={detailsAnchorRef}>
        <button
          type="button"
          className={`pc-ee-tb-details${detailsOpen ? ' is-open' : ''}`}
          aria-expanded={detailsOpen}
          title={`Open all ${detailsLabel.toLowerCase()} controls`}
          onClick={() => setDetailsOpen((v) => !v)}
        >
          <Settings2 size={13} strokeWidth={1.8} />
          {detailsLabel}
          <ChevronDown size={12} strokeWidth={2} />
        </button>
        <EditorPopover
          open={detailsOpen}
          anchorRef={detailsAnchorRef}
          onClose={() => setDetailsOpen(false)}
          className="pc-ee-fmt-popover"
          align="end"
          width={344}
        >
          <PaperDocumentInspector
            selection={selection}
            setup={setup}
            resolved={resolved}
            instanceLayer={instanceLayer}
            pageCount={pageCount}
            readOnly={readOnly}
            variant="editor"
            onSetupChange={onSetupChange}
            onInstanceChange={onInstanceChange}
          />
        </EditorPopover>
      </div>
    </div>
  )
}
