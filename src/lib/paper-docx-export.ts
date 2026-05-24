import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'
import { isMissingQuestion } from '@/lib/missing-question'
import { formatQuestionMarks } from '@/lib/paper-format-marks'
import type { ExportProgress } from '@/lib/paper-export-formats'
import { downloadBlob } from '@/lib/paper-export-formats'
import {
  getPrintLabels,
  PRINT_CHROME_LABELS,
  questionDisplayText,
  type PaperMedium,
} from '@/lib/paper-medium'
import {
  buildPrintBlocksFromResolved,
  type PrintBlock,
} from '@/lib/paper-print-layout'
import type { ResolvedPaper } from '@/lib/paper-instance'
import type { QuestionRecord } from '@/types/question'

function paragraph(
  text: string,
  opts?: {
    bold?: boolean
    heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel]
    spacingAfter?: number
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]
  },
): Paragraph {
  return new Paragraph({
    heading: opts?.heading,
    alignment: opts?.alignment,
    spacing: { after: opts?.spacingAfter ?? 120 },
    children: [
      new TextRun({
        text,
        bold: opts?.bold,
      }),
    ],
  })
}

function questionParagraphs(
  question: QuestionRecord,
  medium: PaperMedium,
  number: number,
  marksLabel: string | null,
  localInstructions?: string,
): Paragraph[] {
  const lines: Paragraph[] = []
  const prefix = `${number}. `
  const body = questionDisplayText(question, medium)
  const marksSuffix = marksLabel ? `  ${marksLabel}` : ''

  if (medium === 'bilingual' && question.bodyText?.trim() && question.hindi?.trim()) {
    lines.push(
      paragraph(`${prefix}${question.bodyText.trim()}${marksSuffix}`, { spacingAfter: 80 }),
    )
    lines.push(paragraph(question.hindi.trim(), { spacingAfter: 120 }))
  } else {
    lines.push(paragraph(`${prefix}${body}${marksSuffix}`))
  }

  const isMcq = question.typeRaw === 'mcq' || question.type === 'MCQ'
  const options =
    medium === 'hindi' && question.mcqOptionsHi
      ? question.mcqOptionsHi
      : question.mcqOptions
  const optionsHi = medium === 'bilingual' ? question.mcqOptionsHi : undefined

  if (isMcq && options) {
    for (const key of ['a', 'b', 'c', 'd'] as const) {
      const label = options[key]
      if (!label?.trim()) continue
      const hi = optionsHi?.[key]?.trim()
      const optText = hi ? `(${key}) ${label} / ${hi}` : `(${key}) ${label}`
      lines.push(
        new Paragraph({
          spacing: { after: 60 },
          indent: { left: 720 },
          children: [new TextRun({ text: optText })],
        }),
      )
    }
  }

  if (localInstructions?.trim()) {
    lines.push(
      new Paragraph({
        spacing: { after: 120 },
        indent: { left: 720 },
        children: [
          new TextRun({
            text: localInstructions.trim(),
            italics: true,
          }),
        ],
      }),
    )
  }

  if (isMissingQuestion(question)) {
    lines.push(
      paragraph('[Question unavailable in repository — replace before printing]', {
        spacingAfter: 160,
      }),
    )
  }

  return lines
}

function blocksToParagraphs(
  blocks: PrintBlock[],
  medium: PaperMedium,
  marksDisplay: ResolvedPaper['printSettings']['marksDisplay'],
): Paragraph[] {
  const labels = getPrintLabels(medium)
  const out: Paragraph[] = []

  for (const block of blocks) {
    switch (block.kind) {
      case 'instructions': {
        out.push(
          paragraph(labels.generalInstructions, {
            bold: true,
            heading: HeadingLevel.HEADING_2,
            spacingAfter: 160,
          }),
        )
        if (block.generalInstructions?.trim()) {
          out.push(paragraph(block.generalInstructions.trim(), { spacingAfter: 240 }))
        } else {
          out.push(
            paragraph(
              `${labels.compulsoryNote} ${block.sectionCount} section(s).`,
              { spacingAfter: 80 },
            ),
          )
          out.push(paragraph(labels.calculatorNote, { spacingAfter: 80 }))
          out.push(paragraph(labels.figuresNote, { spacingAfter: 240 }))
        }
        break
      }
      case 'section-head': {
        const titleSource = block.displayTitle ?? block.section.name
        const namePart = titleSource.split(' · ')[0]
        out.push(
          paragraph(
            `${labels.section} ${block.section.letter} · ${namePart}`,
            {
              bold: true,
              heading: HeadingLevel.HEADING_2,
              spacingAfter: 80,
            },
          ),
        )
        out.push(
          paragraph(
            `${block.summary.questionCount} Q · ${block.summary.totalMarks} ${PRINT_CHROME_LABELS.marksUnit}`,
            { spacingAfter: 120 },
          ),
        )
        break
      }
      case 'section-instructions':
        out.push(
          paragraph(block.displayText ?? block.section.instructions, {
            spacingAfter: 160,
          }),
        )
        break
      case 'question': {
        const marks =
          block.displayMarks ?? block.question.marks
        const marksLabel = formatQuestionMarks(marks, marksDisplay)
        if (block.showNumber === false) {
          const body = questionDisplayText(block.question, medium)
          out.push(
            paragraph(
              `${body}${marksLabel ? `  ${marksLabel}` : ''}`,
              { spacingAfter: 160 },
            ),
          )
        } else {
          out.push(
            ...questionParagraphs(
              block.question,
              medium,
              block.number,
              marksLabel,
              block.localInstructions,
            ),
          )
        }
        break
      }
      default:
        break
    }
  }

  return out
}

export async function exportResolvedPaperToDocx(
  resolved: ResolvedPaper,
  filename: string,
  onProgress?: (progress: ExportProgress) => void,
): Promise<void> {
  onProgress?.({
    phase: 'preparing',
    message: 'Preparing editable Word document…',
  })

  const blocks = buildPrintBlocksFromResolved(resolved)
  const medium = resolved.meta.medium
  const labels = getPrintLabels(medium)
  const meta = resolved.meta

  const headerParagraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: meta.schoolName,
          bold: true,
          size: 32,
        }),
      ],
    }),
  ]

  if (meta.schoolTagline?.trim()) {
    headerParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [new TextRun({ text: meta.schoolTagline.trim(), size: 20 })],
      }),
    )
  }

  headerParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: meta.examinationName,
          bold: true,
          size: 28,
        }),
      ],
    }),
    paragraph(
      `${labels.class}: ${meta.classLabel}    ${labels.subject}: ${meta.subject}`,
      { alignment: AlignmentType.CENTER, spacingAfter: 80 },
    ),
    paragraph(
      `${labels.time}: ${meta.duration}    ${labels.maxMarks}: ${meta.totalMarks}`,
      { alignment: AlignmentType.CENTER, spacingAfter: 80 },
    ),
    paragraph(`${meta.session} · ${meta.examType}`, {
      alignment: AlignmentType.CENTER,
      spacingAfter: 320,
    }),
  )

  onProgress?.({
    phase: 'assembling',
    message: 'Assembling Word document…',
  })

  const bodyParagraphs = blocksToParagraphs(
    blocks,
    medium,
    resolved.printSettings.marksDisplay,
  )

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [...headerParagraphs, ...bodyParagraphs],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, filename)

  onProgress?.({
    phase: 'complete',
    message: 'Word document saved.',
  })
}
