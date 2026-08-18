import { useMemo } from 'react'
import { OfficialPrintDocument } from '@/components/print/OfficialPrintDocument'
import { PrintMeasureSurface } from '@/components/print/PrintMeasureSurface'
import { useMeasuredPrintLayout } from '@/hooks/useMeasuredPrintLayout'
import {
  DEFAULT_SETUP,
  emptyComposition,
  sectionsForSetup,
  type PaperComposition,
  type PaperSetupState,
} from '@/lib/paper-builder'
import { defaultPaperInstanceLayer, resolvePaper } from '@/lib/paper-instance'
import type { McqOptions, QuestionRecord } from '@/types/question'

/**
 * DEV-ONLY diagnostic harness for the print pagination pipeline.
 * Mounts the real measure surface + official document with fixture data so
 * pagination accuracy can be verified in-browser without auth/Firestore.
 * Never bundled in production routes.
 */

let seq = 0
function q(
  partial: Partial<QuestionRecord> & { bodyText: string; marks: number },
): QuestionRecord {
  seq += 1
  return {
    id: `lab-q-${seq}`,
    chapter: 'The Russian Revolution',
    topic: 'Events of 1917',
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

const FIXTURE_SETUP: PaperSetupState = {
  ...DEFAULT_SETUP,
  examinationName: 'Half-Yearly Examination',
  academicSession: '2025–26 · Term II',
  classLabel: 'Class IX',
  subject: 'Social Science',
  sectionCount: 2,
  totalMarks: 80,
}

function buildFixtureComposition(): PaperComposition {
  const composition = emptyComposition()
  composition.A = [
    q({
      bodyText:
        'Explain the importance of the Green Revolution in Indian agriculture.',
      marks: 5,
    }),
    q({
      bodyText:
        "The national anthem of France 'Marseillaise' was composed by Roget de L'Isle.",
      marks: 1,
      typeRaw: 'true_false',
    }),
    q({ bodyText: 'Discuss the main causes of poverty in India.', marks: 5 }),
  ]
  composition.B = [
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
    mcq(
      'Who were the Bolsheviks and which of the following best describes their political programme during the October Revolution?',
      {
        a: 'A majority socialist faction led by Lenin',
        b: 'A moderate liberal reform group',
        c: 'Supporters of Tsar Nicholas II',
        d: 'A peasant land-owning cooperative',
      },
      2,
    ),
    mcq('When did the French Revolution begin?', {
      a: '1779',
      b: '1789',
      c: '1799',
      d: '1809',
    }),
    q({
      bodyText: 'Raw materials and money in hand are called ___ capital.',
      marks: 1,
      typeRaw: 'fill_blank',
    }),
    mcq('Which of these is a Rabi crop grown in northern India?', {
      a: 'Rice',
      b: 'Wheat',
      c: 'Jute',
      d: 'Cotton',
    }),
    mcq('The Treaty of Versailles was signed in which year?', {
      a: '1918',
      b: '1919',
      c: '1920',
      d: '1921',
    }),
    q({
      bodyText:
        'Describe the role of the various social groups that participated in the Civil Disobedience Movement, and explain why some groups eventually withdrew their support from the movement.',
      marks: 5,
      typeRaw: 'long',
    }),
    q({
      bodyText:
        'What is meant by the term “people as a resource”? Explain how investment in human capital yields a return, giving two examples from the Indian context.',
      marks: 5,
      typeRaw: 'long',
    }),
    mcq('Match: which river is known as the “Sorrow of Bengal”?', {
      a: 'Ganga',
      b: 'Damodar',
      c: 'Kosi',
      d: 'Brahmaputra',
    }),
  ]
  return composition
}

export function PrintLabPage() {
  const setup = FIXTURE_SETUP
  const sections = useMemo(() => sectionsForSetup(setup), [setup])
  const composition = useMemo(() => buildFixtureComposition(), [])
  const instanceLayer = useMemo(() => defaultPaperInstanceLayer(), [])
  const resolved = useMemo(
    () => resolvePaper(setup, sections, composition, instanceLayer),
    [setup, sections, composition, instanceLayer],
  )
  const { pages, blocks, layoutSource, onPrintMeasured } = useMeasuredPrintLayout(resolved)

  return (
    <div style={{ padding: 24, background: '#2c3038', minHeight: '100vh' }}>
      <PrintMeasureSurface
        resolved={resolved}
        blocks={blocks}
        onMeasured={onPrintMeasured}
      />
      <p
        data-lab-status
        data-layout-source={layoutSource}
        data-page-count={pages.length}
        style={{ color: '#fff', fontFamily: 'monospace', fontSize: 12 }}
      >
        print-lab · source={layoutSource} · pages={pages.length} · blocks=
        {blocks.length}
      </p>

      <section data-lab-doc="edit" style={{ marginBottom: 48 }}>
        <p style={{ color: '#9aa3b0', fontFamily: 'monospace', fontSize: 12 }}>
          layout=edit (examination editor CSS)
        </p>
        <OfficialPrintDocument
          meta={resolved.meta}
          resolved={resolved}
          pages={pages}
          layout="edit"
        />
      </section>

      <section data-lab-doc="embedded">
        <p style={{ color: '#9aa3b0', fontFamily: 'monospace', fontSize: 12 }}>
          layout=embedded (builder official preview CSS)
        </p>
        <OfficialPrintDocument
          meta={resolved.meta}
          resolved={resolved}
          pages={pages}
          layout="embedded"
        />
      </section>
    </div>
  )
}
