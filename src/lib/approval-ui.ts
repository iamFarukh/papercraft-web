import type { ApprovalQueueItem } from '@/types/paper'
import type { PaperStatus } from '@/types/paper'

const AVATAR_TONES = ['is-rose', 'is-violet', 'is-amber', 'is-blue', 'is-teal'] as const

export function teacherInitials(label: string): string {
  const parts = label.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return label.slice(0, 2).toUpperCase() || 'T'
}

export function teacherAvatarTone(uid: string): (typeof AVATAR_TONES)[number] {
  let h = 0
  for (let i = 0; i < uid.length; i++) h = (h + uid.charCodeAt(i)) % AVATAR_TONES.length
  return AVATAR_TONES[h]
}

export function queuePaperLabel(item: ApprovalQueueItem): string {
  const shortClass = item.classLabel.replace(/^Class\s+/i, '').trim()
  return `Class ${shortClass} · ${item.subject} · ${item.examType}`
}

export function queueStatusTag(status: PaperStatus): {
  label: string
  className: string
} {
  if (status === 'approved') {
    return { label: 'approved', className: 'is-success' }
  }
  return { label: 'submitted', className: 'is-primary' }
}
