export type ImportBatchMeta = {
  batchId: string
  fileName: string
}

export function createImportBatch(fileName: string): ImportBatchMeta {
  return {
    batchId:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `batch-${Date.now()}`,
    fileName,
  }
}

/** Label shown in repository filters, e.g. "hindi-social-science-class9.csv · 23 May" */
export function bulkImportFilterLabel(fileName: string, importedAtMs: number): string {
  const base = fileName.replace(/\.(csv|xlsx|xls)$/i, '').trim() || fileName
  const date = new Date(importedAtMs).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
  return `${base} · ${date}`
}

export function bulkImportFilterKey(batchId: string): string {
  return batchId
}
