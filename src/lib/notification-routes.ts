import type { NotificationRecord } from '@/types/notification'

export function notificationHref(
  notification: Pick<NotificationRecord, 'type' | 'entityId' | 'entityKind'>,
  isAdmin: boolean,
): string | null {
  if (!notification.entityId) {
    if (notification.type === 'bulk_import_completed') return '/app/repository'
    return null
  }

  if (notification.entityKind === 'paper' || notification.type.startsWith('paper_')) {
    if (isAdmin && notification.type === 'paper_submitted') {
      return `/app/approvals/${notification.entityId}`
    }
    return `/app/builder/${notification.entityId}`
  }

  if (notification.entityKind === 'import') return '/app/repository'
  if (notification.entityKind === 'curriculum') return '/app/curriculum'

  return null
}
