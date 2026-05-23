import { Link } from 'react-router-dom'
import { formatApprovalRelative, type ApprovalQueueFilters } from '@/lib/paper-approval'
import {
  queuePaperLabel,
  queueStatusTag,
  teacherAvatarTone,
  teacherInitials,
} from '@/lib/approval-ui'
import type { ApprovalQueueItem } from '@/types/paper'

type StatusTab = 'all' | 'submitted' | 'approved'

type Props = {
  items: ApprovalQueueItem[]
  activePaperId: string | null
  filters: ApprovalQueueFilters
  onFiltersChange: (next: ApprovalQueueFilters) => void
  pendingCount: number
}

function StatusTabBtn({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`pc-btn is-sm pc-approval-tab${active ? ' is-active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export function ApprovalSubmissionQueue({
  items,
  activePaperId,
  filters,
  onFiltersChange,
  pendingCount,
}: Props) {
  const statusTab: StatusTab =
    filters.status === 'all' ? 'all' : filters.status === 'approved' ? 'approved' : 'submitted'

  const filtered = items.filter((i) => {
    if (filters.status !== 'all' && i.status !== filters.status) return false
    if (filters.classLabel && i.classLabel !== filters.classLabel) return false
    if (filters.subject && i.subject !== filters.subject) return false
    if (filters.submittedBy) {
      const key = i.submittedBy ?? i.createdBy
      if (key !== filters.submittedBy) return false
    }
    return true
  })

  const grouped = groupByDay(filtered)

  return (
    <aside className="pc-approval-queue">
      <div className="pc-approval-queue-head">
        <div className="pc-approval-queue-head-row">
          <h2 className="pc-approval-queue-title pc-serif">Submissions</h2>
          {pendingCount > 0 ? (
            <span className="pc-tag is-primary">
              <span className="pc-num">{pendingCount}</span> awaiting
            </span>
          ) : null}
        </div>
        <div className="pc-approval-queue-tabs">
          <StatusTabBtn
            label="All"
            active={statusTab === 'all'}
            onClick={() => onFiltersChange({ ...filters, status: 'all' })}
          />
          <StatusTabBtn
            label="Submitted"
            active={statusTab === 'submitted'}
            onClick={() => onFiltersChange({ ...filters, status: 'submitted' })}
          />
          <StatusTabBtn
            label="Approved"
            active={statusTab === 'approved'}
            onClick={() => onFiltersChange({ ...filters, status: 'approved' })}
          />
        </div>
      </div>

      <div className="pc-approval-queue-list pc-scroll">
        {filtered.length === 0 ? (
          <p className="pc-approval-queue-empty">No submissions match.</p>
        ) : (
          grouped.map((group) => (
            <div key={group.label}>
              <div className="pc-approval-queue-group">{group.label}</div>
              {group.items.map((item) => {
                const uid = item.submittedBy ?? item.createdBy
                const tone = teacherAvatarTone(uid)
                const tag = queueStatusTag(item.status)
                const isActive = item.id === activePaperId
                return (
                  <Link
                    key={item.id}
                    to={`/app/approvals/${item.id}`}
                    className={`pc-approval-row pc-motion-surface${isActive ? ' is-active' : ''}`}
                  >
                    <div className="pc-approval-row-title-row">
                      <span className="pc-approval-row-title pc-serif">
                        {queuePaperLabel(item)}
                      </span>
                    </div>
                    <div className="pc-approval-row-teacher">
                      <span className={`pc-avatar ${tone} pc-approval-row-av`}>
                        {teacherInitials(item.teacherLabel)}
                      </span>
                      <span>{item.teacherLabel}</span>
                      <span className="pc-approval-row-when">
                        {item.submittedAtMs
                          ? formatApprovalRelative(item.submittedAtMs)
                          : '—'}
                      </span>
                    </div>
                    <div className="pc-approval-row-foot">
                      <span>
                        <span className="pc-num">{item.totalMarks}</span> marks
                      </span>
                      <span className={`pc-tag ${tag.className}`}>{tag.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ))
        )}
      </div>
    </aside>
  )
}

function groupByDay(items: ApprovalQueueItem[]): { label: string; items: ApprovalQueueItem[] }[] {
  const now = Date.now()
  const today: ApprovalQueueItem[] = []
  const earlier: ApprovalQueueItem[] = []

  for (const item of items) {
    const ms = item.submittedAtMs ?? 0
    if (ms > now - 86400000) today.push(item)
    else earlier.push(item)
  }

  const groups: { label: string; items: ApprovalQueueItem[] }[] = []
  if (today.length) groups.push({ label: 'Today', items: today })
  if (earlier.length) groups.push({ label: 'Earlier', items: earlier })
  return groups
}
