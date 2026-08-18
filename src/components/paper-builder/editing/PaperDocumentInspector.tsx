import { Link2, Link2Off, Minus, Plus, Sparkles } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import {
  applyGlobalDensity,
  applyGlobalFontSize,
  applyHeaderPreset,
  applyLinkedMargin,
  applyMarginPreset,
  applyMarginsLinked,
  applySideMargin,
  clamp,
  MARGIN_PRESETS,
  type PaperMarginSide,
} from '@/lib/paper-format-config'
import {
  applySmartFitSettings,
  HEADER_PRESET_LABELS,
  patchFormatConfig,
  type ResolvedPaper,
} from '@/lib/paper-instance'
import type {
  EditSelection,
  PaperFormatConfig,
  PaperInstanceLayer,
  PaperLayoutMode,
  PaperMarginPreset,
  PaperMarksDisplay,
} from '@/types/paper-instance'
import type { PaperSetupState } from '@/lib/paper-builder'
import { BlockInspectorPanel } from './BlockInspectorPanel'
import { FormatSegment } from './FormatSegment'
import { FormatSlider } from './FormatSlider'
import { HeaderPresetPicker } from './HeaderPresetPicker'

type Props = {
  selection: EditSelection
  setup: PaperSetupState
  resolved: ResolvedPaper
  instanceLayer: PaperInstanceLayer
  pageCount: number
  readOnly?: boolean
  onSetupChange: (patch: Partial<PaperSetupState>) => void
  /** Accepts a value or a functional updater so rapid stepper clicks accumulate. */
  onInstanceChange: (
    next: PaperInstanceLayer | ((prev: PaperInstanceLayer) => PaperInstanceLayer),
  ) => void
  variant?: 'sidebar' | 'editor'
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="pc-pe-field">
      <span className="pc-pe-field-label">{label}</span>
      {children}
    </label>
  )
}

function CollapsibleGroup({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  return (
    <details className="pc-fmt-details" open={defaultOpen}>
      <summary className="pc-fmt-details-summary">{title}</summary>
      <div className="pc-fmt-details-body">{children}</div>
    </details>
  )
}

function fmtMm(n: number) {
  return n.toFixed(n % 1 === 0 ? 0 : 1)
}

function MarginStepper({
  label,
  value,
  disabled,
  onStep,
}: {
  label: string
  value: number
  disabled?: boolean
  onStep: (dir: 1 | -1) => void
}) {
  return (
    <div className="pc-fmt-margin-cell">
      <span className="pc-fmt-margin-cell-label">{label}</span>
      <div className="pc-fmt-margin-stepper">
        <button
          type="button"
          className="pc-fmt-margin-step"
          aria-label={`Decrease ${label} margin`}
          disabled={disabled}
          onClick={() => onStep(-1)}
        >
          <Minus size={12} strokeWidth={2} />
        </button>
        <span className="pc-fmt-margin-value pc-num">
          {fmtMm(value)}
          <span className="pc-fmt-margin-unit">mm</span>
        </span>
        <button
          type="button"
          className="pc-fmt-margin-step"
          aria-label={`Increase ${label} margin`}
          disabled={disabled}
          onClick={() => onStep(1)}
        >
          <Plus size={12} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

/** Per-side page-margin editor with a link toggle. */
function MarginEditor({
  config,
  disabled,
  onChange,
}: {
  config: PaperFormatConfig
  disabled?: boolean
  onChange: (updater: (c: PaperFormatConfig) => PaperFormatConfig) => void
}) {
  const m = config.pageMargins
  // Per-side edit reads the live value from the updater's config so rapid
  // clicks accumulate; the linked control moves all four via applyLinkedMargin.
  const stepSide = (side: PaperMarginSide, dir: 1 | -1) =>
    onChange((c) => applySideMargin(c, side, clamp((c.pageMargins[side] ?? 15) + dir, 5, 40)))
  const stepLinked = (dir: 1 | -1) =>
    onChange((c) => applyLinkedMargin(c, clamp(c.pageMargins.left + dir, 5, 40)))

  return (
    <div className="pc-fmt-margins">
      <div className="pc-fmt-margins-head">
        <span className="pc-fmt-segment-label">Page margins</span>
        <button
          type="button"
          className={`pc-fmt-margin-link${m.linked ? ' is-on' : ''}`}
          disabled={disabled}
          title={
            m.linked
              ? 'Margins linked — all four sides move together'
              : 'Margins independent — adjust each side'
          }
          onClick={() => onChange((c) => applyMarginsLinked(c, !c.pageMargins.linked))}
        >
          {m.linked ? <Link2 size={12} strokeWidth={1.8} /> : <Link2Off size={12} strokeWidth={1.8} />}
          {m.linked ? 'Linked' : 'Per side'}
        </button>
      </div>
      {m.linked ? (
        <MarginStepper label="All sides" value={m.left} disabled={disabled} onStep={stepLinked} />
      ) : (
        <div className="pc-fmt-margin-grid">
          <MarginStepper label="Left" value={m.left} disabled={disabled} onStep={(d) => stepSide('left', d)} />
          <MarginStepper label="Right" value={m.right} disabled={disabled} onStep={(d) => stepSide('right', d)} />
          <MarginStepper label="Top" value={m.top} disabled={disabled} onStep={(d) => stepSide('top', d)} />
          <MarginStepper label="Bottom" value={m.bottom} disabled={disabled} onStep={(d) => stepSide('bottom', d)} />
        </div>
      )}
    </div>
  )
}

export function PaperDocumentInspector({
  selection,
  setup,
  resolved,
  instanceLayer,
  pageCount,
  readOnly,
  onSetupChange,
  onInstanceChange,
  variant = 'sidebar',
}: Props) {
  const [advancedConfirm, setAdvancedConfirm] = useState(false)
  const formatConfig = resolved.formatConfig
  const isAdvanced = formatConfig.layoutMode === 'advanced'

  const presentation = {
    showHeader: true,
    showFooter: true,
    ...instanceLayer.presentation,
  }

  function patchFormat(updater: (c: PaperFormatConfig) => PaperFormatConfig) {
    onInstanceChange((prev) => patchFormatConfig(prev, updater))
  }

  function patchPresentation(patch: Partial<typeof presentation>) {
    onInstanceChange((prev) => ({
      ...prev,
      presentation: { showHeader: true, showFooter: true, ...prev.presentation, ...patch },
    }))
  }

  const blockScoped = selection.kind !== 'paper'
  const contextualHint =
    selection.kind === 'question'
      ? 'Sliders in the highlighted box apply only to the selected question. Whole-paper controls are collapsed below.'
      : selection.kind === 'section'
        ? 'Sliders in the highlighted box apply only to this section.'
        : 'Click a question or section on the paper for per-block control, or use whole-paper tuning below.'

  const pageLabel = pageCount === 1 ? 'page' : 'pages'

  function setLayoutMode(mode: PaperLayoutMode) {
    if (mode === 'advanced' && !isAdvanced) {
      setAdvancedConfirm(true)
      return
    }
    patchFormat((c) => ({
      ...c,
      layoutMode: mode,
    }))
  }

  function confirmAdvanced() {
    setAdvancedConfirm(false)
    patchFormat((c) => ({ ...c, layoutMode: 'advanced' }))
  }

  return (
    <aside className="pc-pe-controls pc-scroll">
      {variant === 'editor' ? null : (
        <header className="pc-pe-controls-head">
          <h2 className="pc-pe-controls-title pc-serif">Format</h2>
          <p className="pc-pe-controls-lead">Tune layout before print.</p>
        </header>
      )}

      <div className={`pc-fmt-hero${variant === 'editor' ? ' pc-fmt-hero--grid' : ''}`}>
        {variant === 'editor' ? (
          <>
            <div className="pc-fmt-hero-cell">
              <span className="pc-fmt-hero-value pc-serif pc-num">{pageCount}</span>
              <span className="pc-fmt-hero-label">Pages</span>
            </div>
            <div className="pc-fmt-hero-cell">
              <span className="pc-fmt-hero-value pc-serif pc-num">
                {resolved.stats.questionCount}
              </span>
              <span className="pc-fmt-hero-label">Questions</span>
            </div>
            <div className="pc-fmt-hero-cell">
              <span className="pc-fmt-hero-value pc-serif pc-num">
                {resolved.stats.totalMarks}
              </span>
              <span className="pc-fmt-hero-label">Marks</span>
            </div>
          </>
        ) : (
          <>
            <div className="pc-fmt-hero-stat">
              <span className="pc-fmt-hero-value pc-serif pc-num">{pageCount}</span>
              <span className="pc-fmt-hero-label">{pageLabel}</span>
            </div>
            <div className="pc-fmt-hero-meta">
              <span className="pc-num">{resolved.stats.questionCount}</span> questions ·{' '}
              <span className="pc-num">{resolved.stats.totalMarks}</span> marks
            </div>
          </>
        )}
      </div>

      <p className="pc-pe-context-hint">{contextualHint}</p>

      {advancedConfirm ? (
        <div className="pc-fmt-advanced-dialog" role="dialog" aria-labelledby="adv-fmt-title">
          <h3 id="adv-fmt-title" className="pc-fmt-advanced-title">
            Enable advanced layout?
          </h3>
          <p className="pc-fmt-advanced-copy">
            Advanced mode gives per-element sliders and per-question overrides. Extreme values can
            affect page breaks unexpectedly.
          </p>
          <div className="pc-fmt-advanced-actions">
            <button type="button" className="pc-btn" onClick={() => setAdvancedConfirm(false)}>
              Cancel
            </button>
            <button type="button" className="pc-btn is-primary" onClick={confirmAdvanced}>
              Enable advanced
            </button>
          </div>
        </div>
      ) : null}

      <div className="pc-pe-controls-body">
        <div className="pc-pe-group">
          <FormatSegment
            label="Layout mode"
            value={formatConfig.layoutMode}
            disabled={readOnly}
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'advanced', label: 'Advanced' },
            ]}
            onChange={(v) => setLayoutMode(v as PaperLayoutMode)}
          />
        </div>

        {blockScoped ? (
          <BlockInspectorPanel
            selection={selection}
            resolved={resolved}
            formatConfig={formatConfig}
            instanceLayer={instanceLayer}
            readOnly={readOnly}
            onInstanceChange={onInstanceChange}
          />
        ) : null}

        <div className="pc-pe-group">
          <HeaderPresetPicker
            value={formatConfig.header.preset}
            disabled={readOnly}
            onChange={(preset) => patchFormat((c) => applyHeaderPreset(c, preset))}
          />
          <button
            type="button"
            className="pc-fmt-smart-fit"
            disabled={readOnly}
            title="Compact header, tighter spacing — saves paper"
            onClick={() => onInstanceChange(applySmartFitSettings(instanceLayer))}
          >
            <Sparkles size={13} strokeWidth={1.6} />
            Smart fit
          </button>
          <p className="pc-fmt-preset-hint">
            {HEADER_PRESET_LABELS[formatConfig.header.preset].hint}
          </p>
        </div>

        {!blockScoped ? (
          <BlockInspectorPanel
            selection={selection}
            resolved={resolved}
            formatConfig={formatConfig}
            instanceLayer={instanceLayer}
            readOnly={readOnly}
            onInstanceChange={onInstanceChange}
          />
        ) : null}

        <details className="pc-fmt-scope-global" open={!blockScoped}>
          <summary className="pc-fmt-scope-global-summary">
            {blockScoped ? 'Whole paper settings' : 'Document layout'}
          </summary>
          <div className="pc-fmt-scope-global-body">
        {!isAdvanced ? (
          <div className="pc-pe-group">
            <h3 className="pc-pe-group-title">Quick tuning</h3>
            <p className="pc-pe-field-hint">Applies to every question on the paper — not the selected block.</p>
            <FormatSlider
              label="All questions — font size"
              value={formatConfig.globalFontSize}
              min={7}
              max={18}
              step={0.5}
              unit="pt"
              warningBelow={8}
              warningAbove={14}
              disabled={readOnly}
              onChange={(v) => patchFormat((c) => applyGlobalFontSize(c, v))}
            />
            <FormatSlider
              label="All questions — spacing density"
              value={formatConfig.globalDensity}
              min={0.5}
              max={8}
              step={0.5}
              unit="mm"
              warningBelow={1}
              warningAbove={6}
              disabled={readOnly}
              onChange={(v) => patchFormat((c) => applyGlobalDensity(c, v))}
            />
            <FormatSlider
              label="Section headers — font size"
              value={formatConfig.typography.sectionHeaderFontSize}
              min={9}
              max={22}
              step={0.5}
              unit="pt"
              disabled={readOnly}
              onChange={(v) =>
                patchFormat((c) => ({
                  ...c,
                  typography: { ...c.typography, sectionHeaderFontSize: v },
                }))
              }
            />
            <FormatSlider
              label="Line spacing"
              value={formatConfig.typography.lineHeight}
              min={1}
              max={2.2}
              step={0.05}
              unit="×"
              warningBelow={1.15}
              warningAbove={1.9}
              disabled={readOnly}
              onChange={(v) =>
                patchFormat((c) => ({
                  ...c,
                  typography: { ...c.typography, lineHeight: v },
                }))
              }
            />
            <div className="pc-fmt-margin-presets">
              <div className="pc-fmt-segment" role="radiogroup" aria-label="Margin presets">
                {(['tight', 'normal', 'wide'] as PaperMarginPreset[]).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    role="radio"
                    aria-checked={formatConfig.marginPreset === preset}
                    disabled={readOnly}
                    className={`pc-fmt-segment-btn${formatConfig.marginPreset === preset ? ' is-active' : ''}`}
                    onClick={() => patchFormat((c) => applyMarginPreset(c, preset))}
                  >
                    {MARGIN_PRESETS[preset].label}
                  </button>
                ))}
              </div>
              <MarginEditor config={formatConfig} disabled={readOnly} onChange={patchFormat} />
            </div>
          </div>
        ) : (
          <CollapsibleGroup title="Typography" defaultOpen>
            <FormatSlider
              label="Question text"
              value={formatConfig.typography.questionFontSize}
              min={7}
              max={18}
              step={0.5}
              unit="pt"
              disabled={readOnly}
              onChange={(v) =>
                patchFormat((c) => ({
                  ...c,
                  typography: { ...c.typography, questionFontSize: v },
                }))
              }
            />
            <FormatSlider
              label="Section headers"
              value={formatConfig.typography.sectionHeaderFontSize}
              min={9}
              max={22}
              step={0.5}
              unit="pt"
              disabled={readOnly}
              onChange={(v) =>
                patchFormat((c) => ({
                  ...c,
                  typography: { ...c.typography, sectionHeaderFontSize: v },
                }))
              }
            />
            <FormatSlider
              label="Marks"
              value={formatConfig.marks.fontSize}
              min={6}
              max={14}
              step={0.5}
              unit="pt"
              disabled={readOnly}
              onChange={(v) =>
                patchFormat((c) => ({
                  ...c,
                  marks: { ...c.marks, fontSize: v },
                }))
              }
            />
            <FormatSlider
              label="Line height"
              value={formatConfig.typography.lineHeight}
              min={1}
              max={2.2}
              step={0.05}
              unit="×"
              disabled={readOnly}
              onChange={(v) =>
                patchFormat((c) => ({
                  ...c,
                  typography: { ...c.typography, lineHeight: v },
                }))
              }
            />
          </CollapsibleGroup>
        )}

        {isAdvanced ? (
          <CollapsibleGroup title="Spacing">
            <FormatSlider
              label="Between questions"
              value={formatConfig.spacing.betweenQuestions}
              min={0}
              max={15}
              step={0.5}
              unit="mm"
              warningBelow={1}
              disabled={readOnly}
              onChange={(v) =>
                patchFormat((c) => ({
                  ...c,
                  spacing: { ...c.spacing, betweenQuestions: v },
                }))
              }
            />
            <FormatSlider
              label="Between sections"
              value={formatConfig.spacing.betweenSections}
              min={0}
              max={25}
              step={0.5}
              unit="mm"
              disabled={readOnly}
              onChange={(v) =>
                patchFormat((c) => ({
                  ...c,
                  spacing: { ...c.spacing, betweenSections: v },
                }))
              }
            />
            <FormatSlider
              label="Question indent"
              value={formatConfig.spacing.questionIndent}
              min={0}
              max={25}
              step={0.5}
              unit="mm"
              disabled={readOnly}
              onChange={(v) =>
                patchFormat((c) => ({
                  ...c,
                  spacing: { ...c.spacing, questionIndent: v },
                }))
              }
            />
          </CollapsibleGroup>
        ) : null}

        <div className="pc-pe-group">
          <h3 className="pc-pe-group-title">Print layout</h3>
          <FormatSegment
            label="Marks style"
            value={formatConfig.marks.style}
            disabled={readOnly}
            options={[
              { value: 'bracket', label: '[5]' },
              { value: 'paren', label: '(5)' },
              { value: 'hidden', label: 'Off' },
            ]}
            onChange={(marksDisplay) =>
              patchFormat((c) => ({
                ...c,
                marks: { ...c.marks, style: marksDisplay as PaperMarksDisplay },
              }))
            }
          />
          <FormatSegment
            label="Typeface"
            value={formatConfig.typography.baseFontFamily}
            disabled={readOnly}
            options={[
              { value: 'serif', label: 'Serif' },
              { value: 'sans', label: 'Sans' },
            ]}
            onChange={(fontFamily) =>
              patchFormat((c) => ({
                ...c,
                typography: {
                  ...c.typography,
                  baseFontFamily: fontFamily as PaperFormatConfig['typography']['baseFontFamily'],
                },
              }))
            }
          />
        </div>

        <CollapsibleGroup title="Branding">
          <Field label="School name">
            <input
              type="text"
              className="pc-pe-input"
              disabled={readOnly}
              value={presentation.schoolName ?? ''}
              onChange={(e) => patchPresentation({ schoolName: e.target.value })}
            />
          </Field>
          <Field label="Tagline">
            <input
              type="text"
              className="pc-pe-input"
              disabled={readOnly}
              value={presentation.schoolTagline ?? ''}
              onChange={(e) => patchPresentation({ schoolTagline: e.target.value })}
            />
          </Field>
        </CollapsibleGroup>

        <CollapsibleGroup title="Examination">
          <Field label="Title">
            <input
              type="text"
              className="pc-pe-input"
              disabled={readOnly}
              value={setup.examinationName}
              onChange={(e) => onSetupChange({ examinationName: e.target.value })}
            />
          </Field>
          <Field label="Session">
            <input
              type="text"
              className="pc-pe-input"
              disabled={readOnly}
              value={setup.academicSession}
              onChange={(e) => onSetupChange({ academicSession: e.target.value })}
            />
          </Field>
          <Field label="Duration">
            <input
              type="text"
              className="pc-pe-input"
              disabled={readOnly}
              value={setup.durationLabel}
              onChange={(e) => onSetupChange({ durationLabel: e.target.value })}
            />
          </Field>
          <Field label="Instructions">
            <textarea
              className="pc-pe-textarea"
              rows={3}
              disabled={readOnly}
              value={setup.generalInstructions}
              onChange={(e) => onSetupChange({ generalInstructions: e.target.value })}
            />
          </Field>
        </CollapsibleGroup>

        <CollapsibleGroup title="Header & page" defaultOpen>
          <label className="pc-pe-check">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={presentation.showHeader !== false}
              onChange={(e) => {
                const on = e.target.checked
                patchPresentation({
                  showHeader: on,
                  headerRepeatMode: on
                    ? presentation.headerRepeatMode ?? 'firstPageOnly'
                    : 'none',
                })
                patchFormat((c) => ({
                  ...c,
                  header: {
                    ...c.header,
                    repeatMode: on ? c.header.repeatMode : 'none',
                  },
                }))
              }}
            />
            Show examination header
          </label>
          {presentation.showHeader !== false ? (
            <FormatSegment
              label="Header on pages"
              value={presentation.headerRepeatMode ?? 'firstPageOnly'}
              disabled={readOnly}
              options={[
                { value: 'firstPageOnly', label: 'First page only' },
                { value: 'allPages', label: 'Every page (compact)' },
                { value: 'compactRepeat', label: 'Every page (mini)' },
              ]}
              onChange={(headerRepeatMode) => {
                patchPresentation({
                  headerRepeatMode: headerRepeatMode as typeof presentation.headerRepeatMode,
                })
                patchFormat((c) => ({
                  ...c,
                  header: { ...c.header, repeatMode: headerRepeatMode as typeof c.header.repeatMode },
                }))
              }}
            />
          ) : null}
          <p className="pc-pe-field-hint">
            First page only hides the school header on page 2 onward — more room for questions.
          </p>
          <h4 className="pc-pe-subgroup-title">Show on paper</h4>
          <label className="pc-pe-check">
            <input
              type="checkbox"
              disabled={readOnly || presentation.showHeader === false}
              checked={presentation.showSchoolLogo !== false}
              onChange={(e) => patchPresentation({ showSchoolLogo: e.target.checked })}
            />
            School logo
          </label>
          <label className="pc-pe-check">
            <input
              type="checkbox"
              disabled={readOnly || presentation.showHeader === false}
              checked={presentation.showSchoolTagline !== false}
              onChange={(e) => patchPresentation({ showSchoolTagline: e.target.checked })}
            />
            School tagline
          </label>
          <label className="pc-pe-check">
            <input
              type="checkbox"
              disabled={readOnly || presentation.showHeader === false}
              checked={presentation.showExamTitle !== false}
              onChange={(e) => patchPresentation({ showExamTitle: e.target.checked })}
            />
            Exam title row
          </label>
          <label className="pc-pe-check">
            <input
              type="checkbox"
              disabled={readOnly || presentation.showHeader === false}
              checked={presentation.showExamMetaRow !== false}
              onChange={(e) => patchPresentation({ showExamMetaRow: e.target.checked })}
            />
            Class · subject · time · marks row
          </label>
          <label className="pc-pe-check">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={presentation.showFooter !== false}
              onChange={(e) => patchPresentation({ showFooter: e.target.checked })}
            />
            Page numbers in footer
          </label>
        </CollapsibleGroup>
          </div>
        </details>
      </div>
    </aside>
  )
}

