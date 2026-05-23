import type { QuestionStatus } from '@/types/question'

export type LifecycleAction = 'publish' | 'draft' | 'lock' | 'archive'

export const STATUS_META: Record<
  QuestionStatus,
  { label: string; tone: string; description: string }
> = {
  draft: {
    label: 'Draft',
    tone: 'is-warning',
    description: 'Not visible to teachers. Still being authored or reviewed.',
  },
  published: {
    label: 'Published',
    tone: 'is-success',
    description: 'Approved for paper generation and teacher browsing.',
  },
  locked: {
    label: 'Locked',
    tone: 'is-primary',
    description: 'Frozen content — cannot be edited. Used for finalized exams.',
  },
  archived: {
    label: 'Archived',
    tone: 'is-ink',
    description: 'Retired from active use. Kept for reference only.',
  },
}

const ACTION_LABELS: Record<LifecycleAction, string> = {
  publish: 'Publish',
  draft: 'Move to Draft',
  lock: 'Lock Question',
  archive: 'Archive Question',
}

export function lifecycleActionLabel(action: LifecycleAction): string {
  return ACTION_LABELS[action]
}

/** Maps UI action → Firestore status */
export function actionToStatus(action: LifecycleAction): QuestionStatus {
  switch (action) {
    case 'publish':
      return 'published'
    case 'draft':
      return 'draft'
    case 'lock':
      return 'locked'
    case 'archive':
      return 'archived'
  }
}

/** Actions shown for the current status (admin). */
export function availableLifecycleActions(
  status: QuestionStatus,
): LifecycleAction[] {
  switch (status) {
    case 'draft':
      return ['publish', 'archive']
    case 'published':
      return ['draft', 'lock', 'archive']
    case 'locked':
      return ['draft', 'archive']
    case 'archived':
      return ['draft', 'publish']
    default:
      return ['publish', 'archive']
  }
}
