import type { PaperStatus } from '@/types/paper'

export const PAPER_STATUS_CHIP: Record<
  PaperStatus,
  { label: string; className: string }
> = {
  draft: { label: 'Draft', className: 'is-warning' },
  submitted: { label: 'Submitted', className: 'is-primary' },
  approved: { label: 'Approved', className: 'is-success' },
  archived: { label: 'Archived', className: 'is-outline' },
}
