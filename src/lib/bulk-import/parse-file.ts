import * as XLSX from 'xlsx'
import { decodeCsvBytes, normalizeImportText } from '@/lib/bulk-import/encoding'

export type ParsedSheet = {
  headers: string[]
  rows: Record<string, string>[]
  fileName: string
}

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number') return String(value)
  return normalizeImportText(String(value))
}

function isCsvFile(name: string): boolean {
  return name.toLowerCase().endsWith('.csv')
}

export async function parseImportFile(file: File): Promise<ParsedSheet> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // CSV must be decoded as UTF-8 before SheetJS — otherwise Hindi becomes mojibake
  const wb = isCsvFile(file.name)
    ? XLSX.read(decodeCsvBytes(bytes), { type: 'string', raw: false })
    : XLSX.read(buffer, { type: 'array', raw: false })

  const sheetName = wb.SheetNames[0]
  if (!sheetName) {
    throw new Error('The file has no worksheets.')
  }

  const sheet = wb.Sheets[sheetName]!
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    blankrows: false,
  }) as unknown[][]

  if (matrix.length === 0) {
    throw new Error('The file appears to be empty.')
  }

  const headerRow = matrix[0] ?? []
  const headers = headerRow
    .map((h) => cellToString(h))
    .filter((h) => h.length > 0)

  if (headers.length === 0) {
    throw new Error('No column headers found in the first row.')
  }

  const rows: Record<string, string>[] = []

  for (let i = 1; i < matrix.length; i++) {
    const line = matrix[i] ?? []
    const record: Record<string, string> = {}
    let hasContent = false

    for (let c = 0; c < headers.length; c++) {
      const val = cellToString(line[c])
      if (val) hasContent = true
      record[headers[c]!] = val
    }

    if (hasContent) rows.push(record)
  }

  return { headers, rows, fileName: file.name }
}

export function supportedImportFile(name: string): boolean {
  const lower = name.toLowerCase()
  return lower.endsWith('.csv') || lower.endsWith('.xlsx') || lower.endsWith('.xls')
}
