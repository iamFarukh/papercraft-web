import { jsPDF } from 'jspdf'
import { buildAnswerKey } from '@/lib/paper-answer-key'
import type { ExportProgress } from '@/lib/paper-export-formats'
import type { ResolvedPaper } from '@/lib/paper-instance'
import { richTextToPlain } from '@/lib/rich-text'

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 18
const LINE_H = 5.4

/**
 * Answer-key PDF — generated programmatically (paginates by text flow). Math is
 * shown as LaTeX source and Latin text renders crisply. NOTE: jsPDF's core fonts
 * don't cover Devanagari, so for Hindi/bilingual papers prefer the Word answer
 * key, which renders Hindi faithfully.
 */
export async function exportAnswerKeyToPdf(
  resolved: ResolvedPaper,
  filename: string,
  onProgress?: (progress: ExportProgress) => void,
): Promise<void> {
  onProgress?.({ phase: 'preparing', message: 'Preparing answer key…' })

  const entries = buildAnswerKey(resolved)
  const meta = resolved.meta
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
  const contentW = PAGE_W - MARGIN * 2
  let y = MARGIN

  const ensure = (space: number) => {
    if (y + space > PAGE_H - MARGIN) {
      pdf.addPage()
      y = MARGIN
    }
  }

  const writeWrapped = (text: string, x: number, maxW: number) => {
    const lines = pdf.splitTextToSize(text, maxW) as string[]
    for (const ln of lines) {
      ensure(LINE_H)
      pdf.text(ln, x, y)
      y += LINE_H
    }
  }

  // Header
  pdf.setFont('helvetica', 'bold').setFontSize(15)
  pdf.text(meta.schoolName, PAGE_W / 2, y, { align: 'center' })
  y += 7
  pdf.setFontSize(12)
  pdf.text(`${meta.examinationName} — Answer Key`, PAGE_W / 2, y, { align: 'center' })
  y += 6
  pdf.setFont('helvetica', 'normal').setFontSize(10)
  pdf.text(
    `${meta.classLabel}  ·  ${meta.subject}  ·  ${meta.examType}`,
    PAGE_W / 2,
    y,
    { align: 'center' },
  )
  y += 7
  pdf.setDrawColor(210)
  pdf.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += 7

  onProgress?.({ phase: 'rendering', message: 'Rendering answer key…' })

  const bodyX = MARGIN + 8

  for (const entry of entries) {
    if (entry.sectionLabel) {
      ensure(LINE_H + 3)
      pdf.setFont('helvetica', 'bold').setFontSize(11)
      writeWrapped(entry.sectionLabel, MARGIN, contentW)
      y += 1.5
      pdf.setFont('helvetica', 'normal').setFontSize(10)
    }

    ensure(LINE_H)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${entry.number}.`, MARGIN, y)
    pdf.setFont('helvetica', 'normal')

    writeWrapped(richTextToPlain(entry.answerHtml), bodyX, contentW - 8)
    if (entry.answerHiHtml) {
      writeWrapped(richTextToPlain(entry.answerHiHtml), bodyX, contentW - 8)
    }

    if (entry.solutionHtml) {
      pdf.setTextColor(96).setFontSize(9)
      writeWrapped(`Solution: ${richTextToPlain(entry.solutionHtml)}`, bodyX, contentW - 8)
      if (entry.solutionHiHtml) {
        writeWrapped(richTextToPlain(entry.solutionHiHtml), bodyX, contentW - 8)
      }
      pdf.setTextColor(0).setFontSize(10)
    }

    y += 2.5
  }

  onProgress?.({ phase: 'assembling', message: 'Assembling answer key PDF…' })
  pdf.save(filename)
  onProgress?.({ phase: 'complete', message: 'Answer key PDF saved.' })
}
