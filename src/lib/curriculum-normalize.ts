/** Normalize user input into a stable display name and lookup key. */

const MIN_NAME_LEN = 2
const MAX_NAME_LEN = 120

export function nameKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** True if string contains Devanagari — preserve casing as typed (trim only). */
function hasDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text)
}

export function normalizeDisplayName(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, ' ')
  if (!trimmed) return ''
  if (hasDevanagari(trimmed)) return trimmed
  return trimmed
    .split(' ')
    .map((word) => {
      if (!word) return word
      const lower = word.toLowerCase()
      if (lower.length <= 3 && /^[a-z]+$/.test(lower)) {
        const abbrevs = new Set(['mcq', 'rbse'])
        if (abbrevs.has(lower)) return lower.toUpperCase()
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(' ')
}

export function slugFromName(name: string): string {
  const key = nameKey(name)
  const ascii = key
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (ascii.length >= 2) return ascii.slice(0, 48)
  return `item-${Date.now().toString(36)}`
}

export type NameValidation =
  | { ok: true; name: string; nameKey: string }
  | { ok: false; message: string }

export function validateTaxonomyName(raw: string): NameValidation {
  const name = normalizeDisplayName(raw)
  if (!name) {
    return { ok: false, message: 'Name is required.' }
  }
  if (name.length < MIN_NAME_LEN) {
    return { ok: false, message: `Use at least ${MIN_NAME_LEN} characters.` }
  }
  if (name.length > MAX_NAME_LEN) {
    return { ok: false, message: `Keep under ${MAX_NAME_LEN} characters.` }
  }
  if (/^\d+$/.test(name)) {
    return { ok: false, message: 'Name cannot be only numbers.' }
  }
  return { ok: true, name, nameKey: nameKey(name) }
}

/** Levenshtein distance for typo detection (not substring overlap). */
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  )
  for (let i = 0; i <= m; i++) dp[i]![0] = i
  for (let j = 0; j <= n; j++) dp[0]![j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost,
      )
    }
  }
  return dp[m]![n]!
}

/**
 * Similarity for "Did you mean?" — ignores cases where a longer name merely
 * contains a shorter one (e.g. Social Science vs Science).
 */
export function similarityScore(a: string, b: string): number {
  const x = nameKey(a)
  const y = nameKey(b)
  if (x === y) return 1
  const maxLen = Math.max(x.length, y.length)
  if (maxLen === 0) return 0

  const dist = levenshtein(x, y)
  const ratio = 1 - dist / maxLen

  const shorter = x.length <= y.length ? x : y
  const longer = x.length <= y.length ? y : x
  if (longer.includes(shorter) && shorter.length / longer.length >= 0.85) {
    return Math.max(ratio, 0.88)
  }

  return ratio
}

export function findClosestName(
  input: string,
  options: { id: string; label: string }[],
  minScore = 0.88,
): { id: string; label: string } | null {
  if (options.length === 0) return null
  const key = nameKey(input)
  const exact = options.find((o) => nameKey(o.label) === key)
  if (exact) return exact

  let best: { id: string; label: string; score: number } | null = null
  for (const o of options) {
    const score = similarityScore(input, o.label)
    if (score >= minScore && (!best || score > best.score)) {
      best = { ...o, score }
    }
  }
  return best
}
