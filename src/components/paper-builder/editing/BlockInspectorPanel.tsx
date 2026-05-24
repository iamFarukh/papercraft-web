import type { ResolvedPaper } from '@/lib/paper-instance'
import type {
  EditSelection,
  PaperFormatConfig,
  PaperInstanceLayer,
} from '@/types/paper-instance'
import type { PaperSectionId } from '@/lib/paper-builder'
import {
  applyQuestionFormatToAllQuestions,
  applyQuestionFormatToSection,
  applySectionFormatToAllSections,
  patchQuestionInstance,
  patchSectionInstance,
} from './instance-patch'
import { FormatSlider } from './FormatSlider'

type Props = {
  selection: EditSelection
  resolved: ResolvedPaper
  formatConfig: PaperFormatConfig
  instanceLayer: PaperInstanceLayer
  readOnly?: boolean
  onInstanceChange: (next: PaperInstanceLayer) => void
}

export function BlockInspectorPanel({
  selection,
  resolved,
  formatConfig,
  instanceLayer,
  readOnly,
  onInstanceChange,
}: Props) {
  if (selection.kind === 'paper') return null

  if (selection.kind === 'question') {
    const questionId = selection.questionId
    const rq = resolved.sections
      .flatMap((s) => s.questions)
      .find((q) => q.question.id === questionId)
    if (!rq) return null

    const fmt = rq.questionFormat
    const section = resolved.sections.find((s) => s.id === selection.sectionId)
    const allQuestionIds = resolved.sections.flatMap((s) =>
      s.questions.map((q) => q.question.id),
    )
    const sectionQuestionIds =
      section?.questions.map((q) => q.question.id) ?? []

    function patchQuestion(patch: Parameters<typeof patchQuestionInstance>[2]) {
      onInstanceChange(patchQuestionInstance(instanceLayer, questionId, patch))
    }

    function resetQuestionFormat() {
      patchQuestion({
        marginTop: undefined,
        marginBottom: undefined,
        indent: undefined,
        fontSize: undefined,
        spacingMode: undefined,
      })
    }

    return (
      <div className="pc-pe-group pc-pe-block-inspector">
        <h3 className="pc-pe-group-title">
          This question only
          <span className="pc-fmt-override-sub">Q{rq.displayNumber || '—'}</span>
          {fmt.hasOverrides ? (
            <span className="pc-fmt-override-badge">Custom</span>
          ) : null}
        </h3>
        <div className="pc-fmt-apply-row">
          {fmt.hasOverrides ? (
            <button type="button" className="pc-fmt-reset-all" disabled={readOnly} onClick={resetQuestionFormat}>
              Reset to global
            </button>
          ) : null}
          <button
            type="button"
            className="pc-fmt-apply-all"
            disabled={readOnly}
            onClick={() =>
              onInstanceChange(
                applyQuestionFormatToSection(
                  instanceLayer,
                  selection.sectionId,
                  fmt,
                  sectionQuestionIds,
                ),
              )
            }
          >
            Apply to section
          </button>
          <button
            type="button"
            className="pc-fmt-apply-all"
            disabled={readOnly}
            onClick={() =>
              onInstanceChange(
                applyQuestionFormatToAllQuestions(instanceLayer, fmt, allQuestionIds),
              )
            }
          >
            Apply to all questions
          </button>
        </div>
        <FormatSlider
          label="Space above"
          value={fmt.marginTop}
          min={0}
          max={15}
          step={0.5}
          unit="mm"
          globalValue={
            section?.sectionFormat.questionSpacing ?? formatConfig.spacing.betweenQuestions
          }
          warningBelow={1}
          warningAbove={8}
          disabled={readOnly}
          onChange={(marginTop) => patchQuestion({ marginTop, spacingMode: undefined })}
          onReset={() => patchQuestion({ marginTop: undefined })}
        />
        <FormatSlider
          label="Space below"
          value={fmt.marginBottom}
          min={0}
          max={15}
          step={0.5}
          unit="mm"
          globalValue={0}
          disabled={readOnly}
          onChange={(marginBottom) => patchQuestion({ marginBottom })}
          onReset={() => patchQuestion({ marginBottom: undefined })}
        />
        <FormatSlider
          label="Left indent"
          value={fmt.indent}
          min={0}
          max={25}
          step={0.5}
          unit="mm"
          globalValue={formatConfig.spacing.questionIndent}
          warningAbove={15}
          disabled={readOnly}
          onChange={(indent) => patchQuestion({ indent })}
          onReset={() => patchQuestion({ indent: undefined })}
        />
        <FormatSlider
          label="This question — font size"
          value={fmt.fontSize}
          min={7}
          max={18}
          step={0.5}
          unit="pt"
          globalValue={formatConfig.typography.questionFontSize}
          warningBelow={8}
          warningAbove={14}
          disabled={readOnly}
          onChange={(fontSize) => patchQuestion({ fontSize })}
          onReset={() => patchQuestion({ fontSize: undefined })}
        />
      </div>
    )
  }

  const sectionId = selection.sectionId
  const section = resolved.sections.find((s) => s.id === sectionId)
  if (!section) return null

  const fmt = section.sectionFormat
  const allSectionIds = resolved.sections.map((s) => s.id as PaperSectionId)

  function patchSection(patch: Record<string, unknown>) {
    onInstanceChange(patchSectionInstance(instanceLayer, sectionId, patch))
  }

  function resetSectionFormat() {
    patchSection({
      spacingAbove: undefined,
      spacingAfterHeader: undefined,
      questionSpacing: undefined,
      fontSize: undefined,
      spacingMode: undefined,
    })
  }

  return (
    <div className="pc-pe-group pc-pe-block-inspector">
      <h3 className="pc-pe-group-title">
        Section {section.letter}
        {fmt.hasOverrides ? <span className="pc-fmt-override-badge">Custom</span> : null}
      </h3>
      <div className="pc-fmt-apply-row">
        {fmt.hasOverrides ? (
          <button type="button" className="pc-fmt-reset-all" disabled={readOnly} onClick={resetSectionFormat}>
            Reset to global
          </button>
        ) : null}
        <button
          type="button"
          className="pc-fmt-apply-all"
          disabled={readOnly}
          onClick={() =>
            onInstanceChange(applySectionFormatToAllSections(instanceLayer, fmt, allSectionIds))
          }
        >
          Apply to all sections
        </button>
      </div>
      <FormatSlider
        label="Space above section"
        value={fmt.spacingAbove}
        min={0}
        max={25}
        step={0.5}
        unit="mm"
        globalValue={formatConfig.spacing.betweenSections}
        disabled={readOnly}
        onChange={(spacingAbove) => patchSection({ spacingAbove, spacingMode: undefined })}
        onReset={() => patchSection({ spacingAbove: undefined })}
      />
      <FormatSlider
        label="After section header"
        value={fmt.spacingAfterHeader}
        min={0}
        max={12}
        step={0.5}
        unit="mm"
        globalValue={formatConfig.spacing.afterSectionHeader}
        disabled={readOnly}
        onChange={(spacingAfterHeader) => patchSection({ spacingAfterHeader })}
        onReset={() => patchSection({ spacingAfterHeader: undefined })}
      />
      <FormatSlider
        label="Between questions"
        value={fmt.questionSpacing}
        min={0}
        max={15}
        step={0.5}
        unit="mm"
        globalValue={formatConfig.spacing.betweenQuestions}
        warningBelow={1}
        disabled={readOnly}
        onChange={(questionSpacing) => patchSection({ questionSpacing, spacingMode: undefined })}
        onReset={() => patchSection({ questionSpacing: undefined })}
      />
      <FormatSlider
        label="Section title size"
        value={fmt.fontSize}
        min={9}
        max={22}
        step={0.5}
        unit="pt"
        globalValue={formatConfig.typography.sectionHeaderFontSize}
        disabled={readOnly}
        onChange={(fontSize) => patchSection({ fontSize })}
        onReset={() => patchSection({ fontSize: undefined })}
      />
    </div>
  )
}
