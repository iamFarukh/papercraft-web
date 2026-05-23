import { FileText, Pencil } from 'lucide-react'
import { formatAssignmentSummary } from '@/lib/teacher-assignments'
import type { TeacherListItem } from '@/types/teacher'

function formatRelative(ms: number | null): string {
  if (!ms) return 'No recent activity'
  const sec = Math.floor((Date.now() - ms) / 1000)
  if (sec < 3600) return `Active ${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `Active ${Math.floor(sec / 3600)}h ago`
  return `Active ${new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
}

type Props = {
  teacher: TeacherListItem
  onEdit: () => void
}

export function TeacherCard({ teacher, onEdit }: Props) {
  const initials = teacher.displayName
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <article
      className={`pc-teacher-card pc-motion-surface${teacher.active ? '' : ' is-inactive'}`}
    >
      <div className="pc-teacher-card-head">
        <span className="pc-avatar is-teal pc-teacher-card-av">{initials || 'T'}</span>
        <div className="pc-teacher-card-meta">
          <h3 className="pc-teacher-card-name pc-serif">{teacher.displayName}</h3>
          <p className="pc-teacher-card-email">{teacher.email}</p>
        </div>
        <button type="button" className="pc-btn is-sm is-ghost" onClick={onEdit}>
          <Pencil size={13} strokeWidth={1.6} />
          Edit
        </button>
      </div>

      <div className="pc-teacher-card-tags">
        <span className={`pc-tag${teacher.active ? ' is-success' : ''}`}>
          {teacher.active ? 'Active' : 'Inactive'}
        </span>
        {teacher.pendingSignIn ? (
          <span className="pc-tag is-warning">Awaiting first sign-in</span>
        ) : null}
      </div>

      <p className="pc-teacher-card-assign">
        {formatAssignmentSummary(teacher.assignments, teacher.assignmentScope)}
      </p>

      <footer className="pc-teacher-card-foot">
        <span className="pc-teacher-card-stat">
          <FileText size={12} strokeWidth={1.6} />
          <span className="pc-num">{teacher.papersCreated}</span> papers
        </span>
        <span className="pc-teacher-card-time">{formatRelative(teacher.recentActivityMs)}</span>
      </footer>
    </article>
  )
}
