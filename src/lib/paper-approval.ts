import type { PaperStatus } from '@/types/paper'

export type ApprovalQueueFilters = {
  classLabel: string | null
  subject: string | null
  status: PaperStatus | 'all'
  submittedBy: string | null
}

export const DEFAULT_APPROVAL_FILTERS: ApprovalQueueFilters = {
  classLabel: null,
  subject: null,
  status: 'submitted',
  submittedBy: null,
}

export function formatApprovalTimestamp(ms: number | null): string {
  if (!ms) return '—'
  return new Date(ms).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatApprovalRelative(ms: number | null): string {
  if (!ms) return '—'
  const sec = Math.floor((Date.now() - ms) / 1000)
  if (sec < 60) return 'Just now'
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
