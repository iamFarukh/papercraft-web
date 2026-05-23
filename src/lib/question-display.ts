import type { QuestionRecord } from '@/types/question'

const CLASS_ROMAN: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
  10: 'X',
  11: 'XI',
  12: 'XII',
}

const SUBJECT_ABBR: Record<string, string> = {
  Mathematics: 'MAT',
  Science: 'SCI',
  Hindi: 'HIN',
  English: 'ENG',
  Sanskrit: 'SAN',
  'Social Science': 'SST',
  Physics: 'PHY',
  Chemistry: 'CHE',
  Biology: 'BIO',
  'Computer Science': 'CS',
  Economics: 'ECO',
  Accountancy: 'ACC',
  'Business Studies': 'BST',
}

function classRoman(n: number): string {
  return CLASS_ROMAN[n] ?? String(n)
}

function abbrevSubject(subject: string): string {
  if (SUBJECT_ABBR[subject]) return SUBJECT_ABBR[subject]
  const letters = subject.replace(/[^a-zA-Z]/g, '')
  if (letters.length >= 3) return letters.slice(0, 3).toUpperCase()
  return letters.toUpperCase() || 'GEN'
}

function abbrevChapter(chapter: string): string {
  const words = chapter
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !/^(and|the|of|in|to)$/i.test(w))

  if (words.length >= 2) {
    return words
      .slice(0, 3)
      .map((w) => w[0]!)
      .join('')
      .toUpperCase()
      .slice(0, 4)
  }

  const compact = chapter.replace(/[^a-zA-Z]/g, '')
  return (compact.slice(0, 4) || 'CH').toUpperCase()
}

/** Stable 3-digit suffix from Firestore id (for support / search). */
function sequenceFromId(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0
  }
  return String((Math.abs(h) % 900) + 100)
}

/**
 * Human-readable question reference for cards and headers.
 * Example: `VI · MAT · FRAC · 284`
 */
export function questionDisplayRef(q: Pick<
  QuestionRecord,
  'id' | 'classNumber' | 'subject' | 'chapter'
>): string {
  const cls = classRoman(q.classNumber)
  const sub = abbrevSubject(q.subject)
  const ch = abbrevChapter(q.chapter)
  const seq = sequenceFromId(q.id)
  return `${cls} · ${sub} · ${ch} · ${seq}`
}

/** Full reference with RBSE prefix (drawer / export). */
export function questionDisplayRefLong(
  q: Pick<QuestionRecord, 'id' | 'classNumber' | 'subject' | 'chapter'>,
): string {
  const cls = classRoman(q.classNumber)
  const sub = abbrevSubject(q.subject)
  const ch = abbrevChapter(q.chapter)
  const seq = sequenceFromId(q.id)
  return `RBSE-${cls}-${sub}-${ch}-${seq}`
}
