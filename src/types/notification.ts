export type NotificationType =
  | 'paper_submitted'
  | 'paper_approved'
  | 'paper_reopened'
  | 'paper_returned_draft'
  | 'bulk_import_completed'
  | 'curriculum_warning'
  | 'system_warning'

export type NotificationEntityKind = 'paper' | 'import' | 'curriculum' | 'system'

export type NotificationDocument = {
  userId: string
  type: NotificationType
  title: string
  message: string
  entityId?: string | null
  entityKind?: NotificationEntityKind | null
  read: boolean
  createdAt?: unknown
}

export type NotificationRecord = {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  entityId: string | null
  entityKind: NotificationEntityKind | null
  read: boolean
  createdAtMs: number
}
