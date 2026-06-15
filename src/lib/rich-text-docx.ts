import { TextRun } from 'docx'

/**
 * Best-effort HTML → DOCX inline runs. Preserves bold/italic and flattens
 * paragraphs/lists into a single paragraph using line breaks (matching how the
 * existing exporter lays out one paragraph per question). Math written as $…$ is
 * emitted as its LaTeX source in italics — DOCX cannot render KaTeX, so the
 * source is the faithful fallback (PDF export keeps full math rendering).
 */

type Marks = { bold?: boolean; italics?: boolean }

const MATH_RE = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g

export function richHtmlToRuns(
  html: string | null | undefined,
  baseMarks: Marks = {},
): TextRun[] {
  if (!html) return []
  if (typeof DOMParser === 'undefined') {
    return [new TextRun({ text: html, ...baseMarks })]
  }
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const runs: TextRun[] = []
  walkChildren(doc.body, baseMarks, runs, { atLineStart: true })
  return runs
}

function pushBreak(runs: TextRun[]) {
  if (runs.length > 0) runs.push(new TextRun({ break: 1 }))
}

function walkChildren(
  parent: Node,
  marks: Marks,
  runs: TextRun[],
  state: { atLineStart: boolean },
) {
  parent.childNodes.forEach((node) => walkNode(node, marks, runs, state))
}

function walkNode(
  node: Node,
  marks: Marks,
  runs: TextRun[],
  state: { atLineStart: boolean },
) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? ''
    if (!text.trim() && state.atLineStart) return
    pushTextRuns(text, marks, runs)
    state.atLineStart = false
    return
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return

  const el = node as HTMLElement
  const tag = el.tagName.toLowerCase()

  switch (tag) {
    case 'strong':
    case 'b':
      walkChildren(el, { ...marks, bold: true }, runs, state)
      return
    case 'em':
    case 'i':
      walkChildren(el, { ...marks, italics: true }, runs, state)
      return
    case 'br':
      runs.push(new TextRun({ break: 1 }))
      state.atLineStart = true
      return
    case 'ul':
      walkList(el, marks, runs, state, null)
      return
    case 'ol':
      walkList(el, marks, runs, state, 1)
      return
    case 'p':
    case 'div':
    case 'blockquote':
      pushBreak(runs)
      state.atLineStart = true
      walkChildren(el, marks, runs, state)
      return
    default:
      walkChildren(el, marks, runs, state)
  }
}

function walkList(
  list: HTMLElement,
  marks: Marks,
  runs: TextRun[],
  state: { atLineStart: boolean },
  startIndex: number | null,
) {
  let index = startIndex ?? 0
  list.childNodes.forEach((child) => {
    if (
      child.nodeType === Node.ELEMENT_NODE &&
      (child as HTMLElement).tagName.toLowerCase() === 'li'
    ) {
      pushBreak(runs)
      const bullet = startIndex === null ? '•  ' : `${index}.  `
      runs.push(new TextRun({ text: bullet, ...marks }))
      state.atLineStart = false
      walkChildren(child as HTMLElement, marks, runs, state)
      index += 1
    }
  })
}

function pushTextRuns(text: string, marks: Marks, runs: TextRun[]) {
  MATH_RE.lastIndex = 0
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = MATH_RE.exec(text)) !== null) {
    const [full, displayLatex, inlineLatex] = match
    if (match.index > lastIndex) {
      runs.push(new TextRun({ text: text.slice(lastIndex, match.index), ...marks }))
    }
    const latex = (displayLatex ?? inlineLatex ?? '').trim()
    runs.push(new TextRun({ text: latex, ...marks, italics: true }))
    lastIndex = match.index + full.length
  }
  if (lastIndex < text.length) {
    const rest = lastIndex === 0 ? text : text.slice(lastIndex)
    runs.push(new TextRun({ text: rest, ...marks }))
  }
}
