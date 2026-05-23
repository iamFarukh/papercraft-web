import type { PaperListItem, PaperStatus } from '@/types/paper'

export type MetricTrend = 'up' | 'down' | 'neutral'

export type ControlCenterMetric = {
  label: string
  value: string
  unit?: string
  hint: string
  trend: MetricTrend
  trendLabel: string
}

export type PipelineStageConfig = {
  key: PaperStatus
  name: string
  accent: string
  emptyMeta: string
}

export const PIPELINE_STAGE_CONFIG: PipelineStageConfig[] = [
  {
    key: 'draft',
    name: 'Draft',
    accent: 'var(--pc-ink-5)',
    emptyMeta: 'No drafts in progress',
  },
  {
    key: 'submitted',
    name: 'Submitted',
    accent: 'var(--pc-primary)',
    emptyMeta: 'Nothing awaiting review',
  },
  {
    key: 'approved',
    name: 'Approved',
    accent: 'var(--pc-success)',
    emptyMeta: 'No approved papers yet',
  },
  {
    key: 'archived',
    name: 'Archived',
    accent: 'var(--pc-ink-3)',
    emptyMeta: 'No archived papers',
  },
]

export type PipelinePaperCard = {
  id: string
  title: string
  detail: string
  initials: string
  avatar: string
}

export type ActivityRow = {
  id: string
  avatar: string
  avatarClass: string
  name: string
  action: string
  target: string
  time: string
  meta?: string
  tag?: string
  tagTone?: '' | 'is-primary' | 'is-success' | 'is-warning' | 'is-danger' | 'is-ink'
}

const AVATAR_CLASSES = [
  'is-rose',
  'is-teal',
  'is-violet',
  'is-blue',
  'is-amber',
] as const

function initialsFromLabel(label: string): string {
  const parts = label.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  }
  return (label.slice(0, 2) || 'PC').toUpperCase()
}

function avatarClassForId(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return AVATAR_CLASSES[Math.abs(h) % AVATAR_CLASSES.length]!
}

export function paperToPipelineCard(paper: PaperListItem): PipelinePaperCard {
  const title = `${paper.subject} · ${paper.classLabel} · ${paper.examType}`
  const detail =
    paper.status === 'approved' && paper.approvedAtMs
      ? `Approved · ${formatShortRelative(paper.approvedAtMs)}`
      : paper.status === 'submitted' && paper.submittedAtMs
        ? `Submitted · ${formatShortRelative(paper.submittedAtMs)}`
        : `Updated · ${formatShortRelative(paper.updatedAtMs)}`
  return {
    id: paper.id,
    title,
    detail,
    initials: initialsFromLabel(paper.subject),
    avatar: avatarClassForId(paper.id),
  }
}

export function papersToActivityRows(
  papers: PaperListItem[],
  teacherLabel: string,
): ActivityRow[] {
  return papers.slice(0, 8).map((paper) => {
    const tagByStatus: Record<PaperStatus, { tag: string; tone: ActivityRow['tagTone'] }> = {
      draft: { tag: 'draft', tone: '' },
      submitted: { tag: 'submitted', tone: 'is-primary' },
      approved: { tag: 'approved', tone: 'is-success' },
      archived: { tag: 'archived', tone: 'is-ink' },
    }
    const actionByStatus: Record<PaperStatus, string> = {
      draft: 'updated draft',
      submitted: 'submitted',
      approved: 'approved',
      archived: 'archived',
    }
    const tone = tagByStatus[paper.status]
    return {
      id: paper.id,
      avatar: initialsFromLabel(paper.subject),
      avatarClass: avatarClassForId(paper.id),
      name: teacherLabel,
      action: actionByStatus[paper.status],
      target: `${paper.subject} · ${paper.classLabel} · ${paper.examType}`,
      time: formatShortRelative(paper.updatedAtMs),
      meta: `${paper.title || 'Examination paper'}`,
      tag: tone.tag,
      tagTone: tone.tone,
    }
  })
}

function formatShortRelative(ms: number): string {
  if (!ms) return 'Recently'
  const sec = Math.floor((Date.now() - ms) / 1000)
  if (sec < 60) return 'Just now'
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return new Date(ms).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function groupPapersByStatus(
  papers: PaperListItem[],
): Record<PaperStatus, PaperListItem[]> {
  const groups: Record<PaperStatus, PaperListItem[]> = {
    draft: [],
    submitted: [],
    approved: [],
    archived: [],
  }
  for (const paper of papers) {
    const status = paper.status ?? 'draft'
    if (status in groups) groups[status].push(paper)
  }
  return groups
}
