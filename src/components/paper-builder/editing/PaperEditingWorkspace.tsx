import { useEffect, useMemo, useRef, useState } from 'react'
import { useSchoolBranding } from '@/hooks/useSchoolBranding'
import { buildPrintPagesFromResolved } from '@/lib/paper-print-layout'
import { moveSectionOrder, resolvePaper } from '@/lib/paper-instance'
import type { EditSelection, PaperInstanceLayer } from '@/types/paper-instance'
import type { PaperComposition, PaperSectionId, PaperSetupState } from '@/lib/paper-builder'
import { EditablePrintDocument } from './EditablePrintDocument'
import { PaperDocumentInspector } from './PaperDocumentInspector'
import { PaperStructureNavigator } from './PaperStructureNavigator'

type Props = {
  setup: PaperSetupState
  sections: ReturnType<typeof import('@/lib/paper-builder').sectionsForSetup>
  composition: PaperComposition
  instanceLayer: PaperInstanceLayer
  readOnly?: boolean
  onSetupChange: (next: PaperSetupState) => void
  onInstanceChange: (next: PaperInstanceLayer) => void
}

export function PaperEditingWorkspace({
  setup,
  sections,
  composition,
  instanceLayer,
  readOnly,
  onSetupChange,
  onInstanceChange,
}: Props) {
  const [selection, setSelection] = useState<EditSelection>({ kind: 'paper' })
  const previewRef = useRef<HTMLDivElement>(null)
  const school = useSchoolBranding()

  const resolved = useMemo(
    () => resolvePaper(setup, sections, composition, instanceLayer, school),
    [setup, sections, composition, instanceLayer, school],
  )

  const pageCount = useMemo(
    () => buildPrintPagesFromResolved(resolved).length,
    [resolved],
  )

  const sectionIds = sections.map((s) => s.id)

  function handleMoveSection(sectionId: PaperSectionId, direction: 'up' | 'down') {
    onInstanceChange(moveSectionOrder(instanceLayer, sectionIds, sectionId, direction))
  }

  useEffect(() => {
    const root = previewRef.current
    if (!root) return

    let selector = ''
    if (selection.kind === 'question') {
      selector = `[data-question-id="${selection.questionId}"]`
    } else if (selection.kind === 'section') {
      selector = `[data-section-id="${selection.sectionId}"]`
    }

    if (!selector) return
    const el = root.querySelector(selector)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selection])

  useEffect(() => {
    const navRoot = document.querySelector('.pc-pe-nav')
    if (!navRoot) return
    let id = ''
    if (selection.kind === 'question') id = `nav-q-${selection.questionId}`
    if (selection.kind === 'section') id = `nav-sec-${selection.sectionId}`
    if (selection.kind === 'paper') id = 'nav-paper'
    if (!id) return
    navRoot.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selection])

  return (
    <div className="pc-pe-panels pc-pe-panels--editorial">
      <PaperStructureNavigator
        resolved={resolved}
        selection={selection}
        onSelect={setSelection}
        onMoveSection={handleMoveSection}
        readOnly={readOnly}
      />

      <div className="pc-pe-preview-wrap pc-scroll" ref={previewRef}>
        <div className="pc-pe-preview-inner">
          <EditablePrintDocument
            resolved={resolved}
            selection={selection}
            instanceLayer={instanceLayer}
            readOnly={readOnly}
            onSelect={setSelection}
            onInstanceChange={onInstanceChange}
            onMoveSection={handleMoveSection}
          />
        </div>
      </div>

      <PaperDocumentInspector
        selection={selection}
        setup={setup}
        resolved={resolved}
        instanceLayer={instanceLayer}
        pageCount={pageCount}
        readOnly={readOnly}
        onSetupChange={(patch) => onSetupChange({ ...setup, ...patch })}
        onInstanceChange={onInstanceChange}
      />
    </div>
  )
}
