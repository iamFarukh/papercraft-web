import { findClosestName, nameKey, normalizeDisplayName } from '@/lib/curriculum-normalize'
import { findRbseSubjectByName, getRbseSubjectsForClass } from '@/lib/rbse-catalog'

/** Common CSV / informal names → canonical RBSE subject name */
const SUBJECT_ALIASES: Record<string, string> = {
  sst: 'Social Science',
  'social studies': 'Social Science',
  'social science': 'Social Science',
  'soc science': 'Social Science',
  'social sc': 'Social Science',
  math: 'Mathematics',
  maths: 'Mathematics',
  mathematics: 'Mathematics',
  sci: 'Science',
  science: 'Science',
  hin: 'Hindi',
  hindi: 'Hindi',
  eng: 'English',
  english: 'English',
}

export type SubjectResolveResult = {
  /** Canonical display name */
  name: string
  /** RBSE / Firestore subject id when matched */
  catalogId: string | null
  /** Set when input looks like a typo of an existing subject */
  suggestion?: string
}

function tryCatalogMatch(name: string, classNumber: number): SubjectResolveResult | null {
  const hit = findRbseSubjectByName(name, classNumber)
  if (hit) return { name: hit.name, catalogId: hit.id }
  return null
}

/**
 * Resolve a CSV subject cell to the canonical RBSE subject for a class.
 * Case-insensitive; handles aliases (SST → Social Science).
 */
export function resolveSubjectForImport(
  raw: string,
  classNumber: number,
): SubjectResolveResult {
  const trimmed = raw.trim()
  if (!trimmed) return { name: '', catalogId: null }

  const direct = tryCatalogMatch(trimmed, classNumber)
  if (direct) return direct

  const aliasTarget = SUBJECT_ALIASES[nameKey(trimmed)]
  if (aliasTarget) {
    const fromAlias = tryCatalogMatch(aliasTarget, classNumber)
    if (fromAlias) return fromAlias
  }

  const normalized = normalizeDisplayName(trimmed)
  const fromNorm = tryCatalogMatch(normalized, classNumber)
  if (fromNorm) return fromNorm

  const options = getRbseSubjectsForClass(classNumber, null, { activeOnly: false }).map(
    (s) => ({ id: s.id, label: s.name }),
  )
  const close = findClosestName(trimmed, options, 0.72)
  if (close && nameKey(close.label) !== nameKey(trimmed)) {
    return {
      name: normalized,
      catalogId: null,
      suggestion: close.label,
    }
  }

  return { name: normalized, catalogId: null }
}
