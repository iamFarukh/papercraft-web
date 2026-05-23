import type { ImportField } from '@/lib/bulk-import/fields'
import { IMPORT_FIELDS, REQUIRED_IMPORT_FIELDS } from '@/lib/bulk-import/fields'

export type MappingRow = {
  csv: string
  sample: string
  field: ImportField | '__skip'
}

export function getMappingRows(
  headers: string[],
  rows: Record<string, string>[],
  mapping: Partial<Record<ImportField, string>>,
): MappingRow[] {
  const fieldByCol = new Map<string, ImportField>()
  for (const [field, col] of Object.entries(mapping)) {
    if (col) fieldByCol.set(col, field as ImportField)
  }
  return headers.map((csv) => ({
    csv,
    sample: rows[0]?.[csv] ?? '',
    field: fieldByCol.get(csv) ?? '__skip',
  }))
}

export function setMappingForColumn(
  mapping: Partial<Record<ImportField, string>>,
  csvCol: string,
  field: ImportField | '__skip',
): Partial<Record<ImportField, string>> {
  const next: Partial<Record<ImportField, string>> = { ...mapping }
  for (const f of IMPORT_FIELDS) {
    if (next[f] === csvCol) delete next[f]
  }
  if (field !== '__skip') {
    for (const f of IMPORT_FIELDS) {
      if (next[f] === field) delete next[f]
    }
    next[field] = csvCol
  }
  return next
}

export function mappingStats(mapping: Partial<Record<ImportField, string>>) {
  const mapped = Object.keys(mapping).length
  const requiredOk = REQUIRED_IMPORT_FIELDS.every((f) => Boolean(mapping[f]))
  return { mapped, requiredOk }
}
