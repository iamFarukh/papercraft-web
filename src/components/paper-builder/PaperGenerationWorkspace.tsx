import { AlertTriangle, ChevronRight, ListChecks, RefreshCw, X } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { MotionModal } from '@/components/motion/MotionModal'
import {
  applyGenerationToComposition,
  countAvailableQuestions,
  generatePaperDraft,
  GENERATION_PRESET_META,
  GENERATION_SCOPE_META,
  type GenerationConfig,
  type GenerationPreset,
  type GenerationScope,
  type PaperGenerationResult,
} from '@/lib/paper-generation-engine'
import type { PaperComposition, PaperSectionDef, PaperSectionId } from '@/lib/paper-builder'
import type { PaperMedium } from '@/lib/paper-medium'
import type { PaperBlueprintSnapshot } from '@/types/paper'
import type { QuestionRecord } from '@/types/question'

type Step = 'configure' | 'preview'

type Props = {
  open: boolean
  onClose: () => void
  snapshot: PaperBlueprintSnapshot
  sections: PaperSectionDef[]
  composition: PaperComposition
  pool: QuestionRecord[]
  classLabel: string
  subject: string
  medium: PaperMedium
  onApply: (next: PaperComposition) => void
}

const DEFAULT_CONFIG: GenerationConfig = {
  scope: 'full_syllabus',
  selectedChapters: [],
  selectedTopics: [],
  preset: 'balanced',
}

export function PaperGenerationWorkspace({
  open,
  onClose,
  snapshot,
  sections,
  composition,
  pool,
  classLabel,
  subject,
  medium,
  onApply,
}: Props) {
  const [step, setStep] = useState<Step>('configure')
  const [config, setConfig] = useState<GenerationConfig>(DEFAULT_CONFIG)
  const [preview, setPreview] = useState<PaperGenerationResult | null>(null)
  const [regeneratingSection, setRegeneratingSection] = useState<PaperSectionId | null>(
    null,
  )

  const chapterOptions = useMemo(() => {
    const chapters = new Set<string>()
    for (const q of pool) {
      if (q.classLabel === classLabel && q.subject === subject) {
        chapters.add(q.chapter)
      }
    }
    return [...chapters].sort()
  }, [pool, classLabel, subject])

  const topicOptions = useMemo(() => {
    const topics = new Set<string>()
    for (const q of pool) {
      if (q.classLabel === classLabel && q.subject === subject && q.topic.trim()) {
        topics.add(q.topic)
      }
    }
    return [...topics].sort()
  }, [pool, classLabel, subject])

  const availability = useMemo(
    () =>
      countAvailableQuestions(pool, config, classLabel, subject, medium, snapshot),
    [pool, config, classLabel, subject, medium, snapshot],
  )

  const runPreview = useCallback(
    (targetSectionId?: PaperSectionId) => {
      const runConfig: GenerationConfig = {
        ...config,
        targetSectionId,
      }
      const result = generatePaperDraft(
        snapshot,
        sections,
        pool,
        runConfig,
        classLabel,
        subject,
        medium,
        composition,
      )
      setPreview(result)
      setRegeneratingSection(targetSectionId ?? null)
      setStep('preview')
    },
    [config, snapshot, sections, pool, classLabel, subject, medium, composition],
  )

  const handleClose = () => {
    setStep('configure')
    setPreview(null)
    setConfig(DEFAULT_CONFIG)
    onClose()
  }

  const handleApply = (mode: 'full' | 'section', sectionId?: PaperSectionId) => {
    if (!preview) return
    const next = applyGenerationToComposition(composition, preview, mode, sectionId)
    onApply(next)
    handleClose()
  }

  const toggleChapter = (chapter: string) => {
    setConfig((prev) => {
      const set = new Set(prev.selectedChapters)
      if (set.has(chapter)) set.delete(chapter)
      else set.add(chapter)
      return { ...prev, selectedChapters: [...set] }
    })
  }

  const toggleTopic = (topic: string) => {
    setConfig((prev) => {
      const set = new Set(prev.selectedTopics)
      if (set.has(topic)) set.delete(topic)
      else set.add(topic)
      return { ...prev, selectedTopics: [...set] }
    })
  }

  const showChapterPicker =
    config.scope === 'selected_chapters' || config.scope === 'custom'

  const showTopicPicker =
    config.scope === 'selected_topics' || config.scope === 'custom'

  return (
    <MotionModal
      open={open}
      overlayClassName="pc-pb-gen-overlay"
      panelClassName="pc-pb-gen-panel"
      ariaLabelledBy="pc-pb-gen-title"
      onBackdropClick={handleClose}
    >
      <header className="pc-pb-gen-head">
        <div id="pc-pb-gen-title" className="pc-pb-gen-head-main">
          <ListChecks size={16} strokeWidth={1.6} aria-hidden />
          <div>
            <span className="pc-pb-gen-kicker">Guided generation</span>
            <span className="pc-pb-gen-title">Generate draft from blueprint</span>
          </div>
        </div>
        <button type="button" className="pc-pb-gen-close" aria-label="Close" onClick={handleClose}>
          <X size={16} strokeWidth={1.6} />
        </button>
      </header>

      <div className="pc-pb-gen-blueprint">
        <span className="pc-tag is-outline">{snapshot.name}</span>
        <span className="pc-pb-gen-meta">
          {snapshot.totalMarks} marks · {snapshot.sections.length} section
          {snapshot.sections.length === 1 ? '' : 's'}
        </span>
      </div>

      {step === 'configure' ? (
        <div className="pc-pb-gen-body pc-scroll">
          <section className="pc-pb-gen-section">
            <h3 className="pc-pb-gen-section-title">1 · Source scope</h3>
            <div className="pc-pb-gen-scope-grid">
              {(Object.keys(GENERATION_SCOPE_META) as GenerationScope[]).map((scope) => {
                const meta = GENERATION_SCOPE_META[scope]
                return (
                  <button
                    key={scope}
                    type="button"
                    className={`pc-pb-gen-scope-card${config.scope === scope ? ' is-active' : ''}`}
                    onClick={() => setConfig((prev) => ({ ...prev, scope }))}
                  >
                    <span className="pc-pb-gen-scope-label">{meta.label}</span>
                    <span className="pc-pb-gen-scope-hint">{meta.hint}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {showChapterPicker ? (
            <section className="pc-pb-gen-section">
              <h3 className="pc-pb-gen-section-title">Chapters</h3>
              <div className="pc-pb-gen-chip-grid">
                {chapterOptions.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    className={`pc-pb-gen-chip${config.selectedChapters.includes(ch) ? ' is-active' : ''}`}
                    onClick={() => toggleChapter(ch)}
                  >
                    {ch}
                    <span className="pc-num">· {availability.byChapter[ch] ?? 0}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {showTopicPicker ? (
            <section className="pc-pb-gen-section">
              <h3 className="pc-pb-gen-section-title">Topics</h3>
              <div className="pc-pb-gen-chip-grid">
                {topicOptions.slice(0, 24).map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    className={`pc-pb-gen-chip${config.selectedTopics.includes(topic) ? ' is-active' : ''}`}
                    onClick={() => toggleTopic(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className="pc-pb-gen-section">
            <h3 className="pc-pb-gen-section-title">2 · Generation preset</h3>
            <div className="pc-pb-gen-preset-row">
              {(Object.keys(GENERATION_PRESET_META) as GenerationPreset[]).map((preset) => {
                const meta = GENERATION_PRESET_META[preset]
                return (
                  <button
                    key={preset}
                    type="button"
                    className={`pc-pb-gen-preset${config.preset === preset ? ' is-active' : ''}`}
                    title={meta.hint}
                    onClick={() => setConfig((prev) => ({ ...prev, preset }))}
                  >
                    {meta.label}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="pc-pb-gen-availability">
            <span className="pc-pb-gen-availability-label">Question pool</span>
            <span className="pc-pb-gen-availability-value pc-num">
              {availability.total} published questions match scope
            </span>
          </section>
        </div>
      ) : (
        <div className="pc-pb-gen-body pc-scroll">
          {preview ? (
            <>
              <div className="pc-pb-gen-summary">
                <div className="pc-pb-gen-summary-row">
                  <span>Generated</span>
                  <strong className="pc-num">
                    {preview.totalGenerated}/{preview.totalPlanned} questions
                  </strong>
                </div>
                <div className="pc-pb-gen-summary-row">
                  <span>Preset</span>
                  <strong>{preview.presetLabel}</strong>
                </div>
                <div className="pc-pb-gen-summary-row">
                  <span>Difficulty target</span>
                  <strong>{preview.difficultySummary}</strong>
                </div>
                <div className="pc-pb-gen-summary-row">
                  <span>Scope</span>
                  <strong>{preview.scopeSummary}</strong>
                </div>
              </div>

              {preview.warnings.length > 0 ? (
                <div className="pc-pb-gen-warnings" role="status">
                  <AlertTriangle size={14} strokeWidth={1.6} aria-hidden />
                  <ul>
                    {preview.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {preview.sections.map((section) => (
                <section key={section.sectionId} className="pc-pb-gen-section-result">
                  <div className="pc-pb-gen-section-result-head">
                    <div>
                      <span className="pc-pb-gen-section-letter">Section {section.sectionId}</span>
                      <span className="pc-pb-gen-section-name">{section.sectionTitle}</span>
                    </div>
                    <span className="pc-num pc-pb-gen-section-count">
                      {section.generatedCount}/{section.plannedCount}
                    </span>
                    <button
                      type="button"
                      className="pc-btn is-sm pc-pb-gen-regen"
                      title={`Regenerate Section ${section.sectionId}`}
                      onClick={() => runPreview(section.sectionId)}
                    >
                      <RefreshCw size={12} strokeWidth={1.6} />
                      Regenerate
                    </button>
                  </div>
                  <ul className="pc-pb-gen-slots">
                    {section.slots.map((slot, idx) => (
                      <li
                        key={`${section.sectionId}-${idx}`}
                        className={`pc-pb-gen-slot${slot.unfilled ? ' is-unfilled' : ''}`}
                      >
                        {slot.question ? (
                          <>
                            <span className="pc-pb-gen-slot-fit pc-num">{slot.fitnessScore}%</span>
                            <span className="pc-pb-gen-slot-chapter">{slot.question.chapter}</span>
                            <span className="pc-pb-gen-slot-meta">
                              {slot.question.marks}m · {slot.question.type}
                            </span>
                            <span className="pc-pb-gen-slot-reasons">
                              {slot.reasons.slice(0, 2).join(' · ')}
                            </span>
                          </>
                        ) : (
                          <span className="pc-pb-gen-slot-empty">No matching question available</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </>
          ) : null}
        </div>
      )}

      <footer className="pc-pb-gen-foot">
        {step === 'configure' ? (
          <>
            <button type="button" className="pc-btn" onClick={handleClose}>
              Cancel
            </button>
            <button
              type="button"
              className="pc-btn is-primary"
              disabled={availability.total === 0}
              onClick={() => runPreview()}
            >
              Preview generation
              <ChevronRight size={14} strokeWidth={1.6} />
            </button>
          </>
        ) : (
          <>
            <button type="button" className="pc-btn" onClick={() => setStep('configure')}>
              Back
            </button>
            {regeneratingSection ? (
              <button
                type="button"
                className="pc-btn is-primary"
                disabled={!preview || preview.totalGenerated === 0}
                onClick={() => handleApply('section', regeneratingSection)}
              >
                Apply Section {regeneratingSection}
              </button>
            ) : (
              <button
                type="button"
                className="pc-btn is-primary"
                disabled={!preview || preview.totalGenerated === 0}
                onClick={() => handleApply('full')}
              >
                Apply draft to paper
              </button>
            )}
          </>
        )}
      </footer>
    </MotionModal>
  )
}
