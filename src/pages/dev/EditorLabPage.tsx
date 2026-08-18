import { useMemo, useRef, useState } from 'react'
import { ExaminationEditorToolbar } from '@/components/examination-editor/ExaminationEditorToolbar'
import { ExaminationEditorOfficialPreview } from '@/components/examination-editor/ExaminationEditorOfficialPreview'
import { PaperStructureNavigator } from '@/components/paper-builder/editing/PaperStructureNavigator'
import { EditablePrintDocument } from '@/components/paper-builder/editing/EditablePrintDocument'
import { PrintMeasureSurface } from '@/components/print/PrintMeasureSurface'
import { useMeasuredPrintLayout } from '@/hooks/useMeasuredPrintLayout'
import {
  DEFAULT_SETUP,
  emptyComposition,
  sectionsForSetup,
  type PaperComposition,
  type PaperSectionId,
  type PaperSetupState,
} from '@/lib/paper-builder'
import {
  defaultPaperInstanceLayer,
  moveSectionOrder,
  resolvePaper,
} from '@/lib/paper-instance'
import type { EditSelection, PaperInstanceLayer } from '@/types/paper-instance'
import type { McqOptions, QuestionRecord } from '@/types/question'

/**
 * DEV-ONLY harness for the examination editor redesign (formatting toolbar +
 * outline + editable paper + preview strip). Mounts the real components with
 * fixture data so the editor can be exercised without Firebase/auth. Never
 * bundled into production routes.
 */

let seq = 0
function q(partial: Partial<QuestionRecord> & { bodyText: string; marks: number }): QuestionRecord {
  seq += 1
  return {
    id: `lab-q-${seq}`,
    chapter: 'The French Revolution',
    topic: 'Causes',
    type: partial.typeRaw === 'mcq' ? 'MCQ' : 'Short Answer',
    difficulty: 2,
    classLabel: 'Class IX',
    subject: 'Social Science',
    classNumber: 9,
    subjectId: 'sst',
    chapterId: 'ch-1',
    usage: 0,
    status: 'Published',
    statusRaw: 'published',
    flags: [],
    bloomLevel: 'understand',
    tags: [],
    estimatedMinutes: 3,
    updatedAtMs: 0,
    ...partial,
  }
}

function mcq(bodyText: string, options: McqOptions, marks = 1): QuestionRecord {
  return q({ bodyText, marks, typeRaw: 'mcq', mcqOptions: options })
}

function buildComposition(): PaperComposition {
  const c = emptyComposition()
  c.A = [
    q({ bodyText: 'Explain the major physiographic divisions of India.', marks: 5 }),
    q({ bodyText: 'Discuss the main causes of poverty in India.', marks: 5 }),
    q({ bodyText: 'What are the main features of a democracy? Explain.', marks: 5 }),
    q({ bodyText: 'What was the Estates-General in France?', marks: 2 }),
  ]
  c.B = [
    mcq('In which year did the Russian Revolution take place?', {
      a: '1915',
      b: '1917',
      c: '1919',
      d: '1921',
    }),
    mcq('The highest peak in the Eastern Ghats is:', {
      a: 'Anamudi',
      b: 'Mahendragiri',
      c: 'Kanchenjunga',
      d: 'Khasi',
    }),
    mcq('Who were the Bolsheviks?', {
      a: 'A majority socialist faction led by Lenin',
      b: 'A moderate liberal reform group',
      c: 'Supporters of Tsar Nicholas II',
      d: 'A peasant land-owning cooperative',
    }, 2),
    q({ bodyText: 'Raw materials and money in hand are called ___ capital.', marks: 1, typeRaw: 'fill_blank' }),
  ]
  return c
}

const FIXTURE_SETUP: PaperSetupState = {
  ...DEFAULT_SETUP,
  classLabel: 'Class IX',
  subject: 'Social Science',
  sectionCount: 2,
}

export function EditorLabPage() {
  const [setup, setSetup] = useState<PaperSetupState>(FIXTURE_SETUP)
  const [instanceLayer, setInstanceLayer] = useState<PaperInstanceLayer>(() =>
    defaultPaperInstanceLayer(),
  )
  const [selection, setSelection] = useState<EditSelection>({ kind: 'paper' })

  const composition = useMemo(() => buildComposition(), [])
  const sections = useMemo(() => sectionsForSetup(setup), [setup])
  const resolved = useMemo(
    () => resolvePaper(setup, sections, composition, instanceLayer),
    [setup, sections, composition, instanceLayer],
  )
  const { pages, pageCount, blocks, isLayoutReady, onPrintMeasured } =
    useMeasuredPrintLayout(resolved)

  const centerRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)

  const sectionIds = sections.map((s) => s.id)
  const handleMoveSection = (sectionId: PaperSectionId, direction: 'up' | 'down') =>
    setInstanceLayer(moveSectionOrder(instanceLayer, sectionIds, sectionId, direction))

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PrintMeasureSurface resolved={resolved} blocks={blocks} onMeasured={onPrintMeasured} />
      <div className="pc-ee-workspace">
        <ExaminationEditorToolbar
          resolved={resolved}
          selection={selection}
          setup={setup}
          instanceLayer={instanceLayer}
          pageCount={pageCount}
          onSelect={setSelection}
          onInstanceChange={setInstanceLayer}
          onSetupChange={(patch) => setSetup({ ...setup, ...patch })}
          onMoveSection={handleMoveSection}
        />
        <div className="pc-ee-panels">
          <aside className="pc-ee-left">
            <PaperStructureNavigator
              variant="embed"
              resolved={resolved}
              selection={selection}
              onSelect={setSelection}
              onMoveSection={handleMoveSection}
            />
          </aside>

          <div className="pc-ee-center">
            <div className="pc-ee-center-label">
              <span className="pc-ee-center-tag">Editable paper</span>
              <span className="pc-ee-center-hint">
                {isLayoutReady
                  ? 'Select a block, format from the toolbar above'
                  : 'Measuring print layout…'}
              </span>
            </div>
            <div className="pc-ee-center-scroll pc-scroll" ref={centerRef}>
              <EditablePrintDocument
                resolved={resolved}
                pages={pages}
                selection={selection}
                instanceLayer={instanceLayer}
                onSelect={setSelection}
                onInstanceChange={setInstanceLayer}
              />
            </div>
          </div>

          <ExaminationEditorOfficialPreview
            scrollRef={stripRef}
            resolved={resolved}
            pages={pages}
            setup={setup}
            sections={sections}
            composition={composition}
            syncSelection={selection}
            activePage={0}
          />
        </div>
      </div>
    </div>
  )
}
