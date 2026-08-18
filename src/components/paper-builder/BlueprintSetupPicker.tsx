import { ArrowRight, Search, Target } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { FadeIn } from '@/components/motion/FadeIn'
import { MotionList, MotionListItem } from '@/components/motion/MotionList'
import {
  formatBlueprintDuration,
  formatClassRange,
  formatSubjectList,
} from '@/lib/blueprint-utils'
import { BlueprintStructurePreview } from '@/components/blueprints/BlueprintShared'
import { blueprintToPaperBootstrap } from '@/lib/blueprint-paper-bridge'
import { getBlueprintById } from '@/services/firebase/blueprints'
import type { BlueprintListItem, BlueprintSection } from '@/types/blueprint'
import type { PaperSetupState } from '@/lib/paper-builder'
import type { PaperInstanceLayer } from '@/types/paper-instance'

type Props = {
  blueprints: BlueprintListItem[]
  loading?: boolean
  onApply: (payload: {
    setup: PaperSetupState
    instanceLayer: PaperInstanceLayer
  }) => void
  onCancel: () => void
}

export function BlueprintSetupPicker({
  blueprints,
  loading,
  onApply,
  onCancel,
}: Props) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewSections, setPreviewSections] = useState<BlueprintSection[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return blueprints
    return blueprints.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.examType.toLowerCase().includes(q) ||
        b.recommendedClasses.some((c) => c.toLowerCase().includes(q)) ||
        b.recommendedSubjects.some((s) => s.toLowerCase().includes(q)),
    )
  }, [blueprints, query])

  const selected = blueprints.find((b) => b.id === selectedId)

  useEffect(() => {
    if (!selectedId) {
      setPreviewSections([])
      setPreviewLoading(false)
      return
    }
    let cancelled = false
    setPreviewLoading(true)
    getBlueprintById(selectedId)
      .then((doc) => {
        if (!cancelled && doc) setPreviewSections(doc.sections.slice(0, 3))
      })
      .catch(() => {
        if (!cancelled) setPreviewSections([])
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedId])

  async function handleUse() {
    if (!selectedId) return
    setApplying(true)
    setError(null)
    try {
      const doc = await getBlueprintById(selectedId)
      if (!doc) {
        setError('Blueprint not found.')
        return
      }
      const { setup, instanceLayer } = blueprintToPaperBootstrap(doc, selectedId)
      onApply({ setup, instanceLayer })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load blueprint.')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="pc-pb-bp-picker">
      <header className="pc-pb-bp-picker-head">
        <div>
          <p className="pc-pb-setup-kicker">Start from blueprint</p>
          <h2 className="pc-pb-bp-picker-title pc-serif">Choose an academic structure</h2>
          <p className="pc-pb-bp-picker-lead">
            The builder will open with sections, marks, and targets pre-configured from
            this blueprint.
          </p>
        </div>
        <button type="button" className="pc-btn is-sm is-ghost" onClick={onCancel}>
          Back to manual setup
        </button>
      </header>

      <div className="pc-pb-bp-picker-search">
        <Search size={14} strokeWidth={1.6} className="pc-pb-bp-picker-search-icon" />
        <input
          type="search"
          className="pc-pb-setup-input"
          placeholder="Search by name, exam type, class…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="pc-pb-muted">Loading blueprints…</p>
      ) : (
        <div className="pc-pb-bp-picker-grid">
          <MotionList className="pc-pb-bp-picker-list">
            {filtered.map((bp) => (
              <MotionListItem key={bp.id}>
                <button
                  type="button"
                  className={`pc-pb-bp-picker-row ${selectedId === bp.id ? 'is-selected' : ''}`}
                  onClick={() => setSelectedId(bp.id)}
                >
                  <span className="pc-pb-bp-picker-row-icon">
                    <Target size={12} strokeWidth={1.6} />
                  </span>
                  <span className="pc-pb-bp-picker-row-body">
                    <span className="pc-pb-bp-picker-row-name pc-serif">{bp.name}</span>
                    <span className="pc-pb-bp-picker-row-meta">
                      {bp.examType} · {bp.totalMarks}m ·{' '}
                      {formatBlueprintDuration(bp.durationMinutes)} ·{' '}
                      {formatClassRange(bp.recommendedClasses)}
                    </span>
                  </span>
                  <span className="pc-tag is-outline">
                    {bp.isSystem ? 'System' : 'Custom'}
                  </span>
                </button>
              </MotionListItem>
            ))}
          </MotionList>

          <aside className="pc-panel pc-pb-bp-picker-preview">
            {selected ? (
              <FadeIn>
                <span className="pc-bp-preview-kicker">Structure preview</span>
                <h3 className="pc-serif" style={{ margin: '0 0 8px', fontSize: 16 }}>
                  {selected.name}
                </h3>
                <p className="pc-pb-bp-picker-preview-meta">
                  {formatSubjectList(selected.recommendedSubjects)}
                  {selected.usagePaperCount ? (
                    <>
                      {' '}
                      · Used in {selected.usagePaperCount} paper
                      {selected.usagePaperCount === 1 ? '' : 's'}
                    </>
                  ) : null}
                </p>
                {selected.sectionCount > 3 ? (
                  <p className="pc-pb-bp-picker-warn">
                    This blueprint has {selected.sectionCount} sections — the builder
                    maps the first three (A, B, C).
                  </p>
                ) : null}
                {previewLoading && previewSections.length === 0 ? (
                  <p className="pc-pb-muted">Loading structure…</p>
                ) : (
                  <BlueprintStructurePreview
                    sections={previewSections}
                    totalMarks={selected.totalMarks}
                    compact
                  />
                )}
                <p className="pc-pb-bp-picker-preview-note">
                  Select a blueprint and continue — you can still adjust class, subject,
                  and instructions before composing.
                </p>
              </FadeIn>
            ) : (
              <p className="pc-pb-muted">Select a blueprint to preview its structure.</p>
            )}
          </aside>
        </div>
      )}

      {error ? (
        <p className="pc-pb-bp-picker-error" role="alert">
          {error}
        </p>
      ) : null}

      <footer className="pc-pb-setup-footer">
        <div className="pc-pb-setup-footer-actions">
          <button type="button" className="pc-btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="pc-btn is-primary"
            disabled={!selectedId || applying}
            onClick={() => void handleUse()}
          >
            {applying ? 'Preparing…' : 'Use blueprint & compose'}
            <ArrowRight size={14} strokeWidth={1.6} />
          </button>
        </div>
      </footer>
    </div>
  )
}
