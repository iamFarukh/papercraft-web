import type { BloomLevel, QuestionDifficulty, QuestionType } from '@/types/question'
import { nameKey } from '@/lib/curriculum-normalize'

const ROMAN: Record<string, number> = {
  i: 1,
  ii: 2,
  iii: 3,
  iv: 4,
  v: 5,
  vi: 6,
  vii: 7,
  viii: 8,
  ix: 9,
  x: 10,
  xi: 11,
  xii: 12,
}

export function parseClassNumber(raw: string): number | null {
  const t = raw.trim()
  if (!t) return null
  const digits = t.match(/\d+/)
  if (digits) {
    const n = Number(digits[0])
    if (n >= 1 && n <= 12) return n
  }
  const romanPart = t.replace(/class/gi, '').trim().toLowerCase()
  if (ROMAN[romanPart]) return ROMAN[romanPart]
  const words = romanPart.split(/\s+/).filter(Boolean)
  for (const w of words) {
    if (ROMAN[w]) return ROMAN[w]
  }
  return null
}

const TYPE_MAP: Record<string, QuestionType> = {
  mcq: 'mcq',
  'multiple choice': 'mcq',
  'multiple choice question': 'mcq',
  short: 'short',
  'short answer': 'short',
  'short ans': 'short',
  long: 'long',
  'long answer': 'long',
  'very short': 'very_short',
  'true/false': 'true_false',
  'true false': 'true_false',
  truefalse: 'true_false',
  tf: 'true_false',
  'fill in the blank': 'fill_blank',
  'fill in blank': 'fill_blank',
  fillblank: 'fill_blank',
  match: 'match',
  'assertion-reason': 'assertion_reason',
  'assertion reason': 'assertion_reason',
}

export function parseQuestionType(raw: string): QuestionType | null {
  const key = raw.trim().toLowerCase()
  return TYPE_MAP[key] ?? null
}

const DIFF_MAP: Record<string, QuestionDifficulty> = {
  easy: 'easy',
  e: 'easy',
  medium: 'medium',
  med: 'medium',
  m: 'medium',
  hard: 'hard',
  h: 'hard',
  difficult: 'hard',
}

export function parseDifficulty(raw: string): QuestionDifficulty | null {
  return DIFF_MAP[raw.trim().toLowerCase()] ?? null
}

const BLOOM_MAP: Record<string, BloomLevel> = {
  remember: 'remember',
  understand: 'understand',
  apply: 'apply',
  analyze: 'analyze',
  analyse: 'analyze',
  evaluate: 'evaluate',
  create: 'create',
}

export function parseBloom(raw: string): BloomLevel {
  const key = raw.trim().toLowerCase()
  return BLOOM_MAP[key] ?? 'understand'
}

export function parseMarks(raw: string): number | null {
  const n = Number(raw.trim())
  if (!Number.isFinite(n) || n <= 0 || n > 100) return null
  return Math.round(n)
}

export function parseTags(raw: string): string[] {
  if (!raw.trim()) return []
  return raw
    .split(/[,;|]/)
    .map((t) => t.trim())
    .filter(Boolean)
}

export function parseMcqKey(raw: string): 'a' | 'b' | 'c' | 'd' | null {
  const k = raw.trim().toLowerCase()
  if (k === 'a' || k === 'b' || k === 'c' || k === 'd') return k
  return null
}

export function rowTextKey(en: string, hi: string): string {
  return nameKey(en || hi)
}
