import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'
import { buildAnswerKey } from '@/lib/paper-answer-key'
import { downloadBlob, type ExportProgress } from '@/lib/paper-export-formats'
import { getPrintLabels } from '@/lib/paper-medium'
import { richHtmlToRuns } from '@/lib/rich-text-docx'
import type { ResolvedPaper } from '@/lib/paper-instance'

/** Editable Word answer key — full fidelity (bilingual + formatting; math as LaTeX source). */
export async function exportAnswerKeyToDocx(
  resolved: ResolvedPaper,
  filename: string,
  onProgress?: (progress: ExportProgress) => void,
): Promise<void> {
  onProgress?.({ phase: 'preparing', message: 'Preparing answer key…' })

  const entries = buildAnswerKey(resolved)
  const meta = resolved.meta
  const labels = getPrintLabels(meta.medium)

  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: meta.schoolName, bold: true, size: 30 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: `${meta.examinationName} — Answer Key`, bold: true, size: 26 }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: `${labels.class}: ${meta.classLabel}    ${labels.subject}: ${meta.subject}    ${meta.examType}`,
          size: 20,
        }),
      ],
    }),
  ]

  onProgress?.({ phase: 'assembling', message: 'Assembling answer key…' })

  for (const entry of entries) {
    if (entry.sectionLabel) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 160, after: 80 },
          children: [new TextRun({ text: entry.sectionLabel, bold: true })],
        }),
      )
    }

    children.push(
      new Paragraph({
        spacing: { after: entry.solutionHtml ? 40 : 120 },
        children: [
          new TextRun({ text: `${entry.number}. `, bold: true }),
          ...richHtmlToRuns(entry.answerHtml),
          ...(entry.answerHiHtml
            ? [new TextRun({ text: '  /  ' }), ...richHtmlToRuns(entry.answerHiHtml)]
            : []),
        ],
      }),
    )

    if (entry.solutionHtml) {
      children.push(
        new Paragraph({
          spacing: { after: entry.solutionHiHtml ? 40 : 120 },
          indent: { left: 360 },
          children: [
            new TextRun({ text: 'Solution: ', bold: true, italics: true }),
            ...richHtmlToRuns(entry.solutionHtml, { italics: true }),
          ],
        }),
      )
      if (entry.solutionHiHtml) {
        children.push(
          new Paragraph({
            spacing: { after: 120 },
            indent: { left: 360 },
            children: richHtmlToRuns(entry.solutionHiHtml, { italics: true }),
          }),
        )
      }
    }
  }

  const doc = new Document({ sections: [{ properties: {}, children }] })
  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, filename)

  onProgress?.({ phase: 'complete', message: 'Answer key saved.' })
}
