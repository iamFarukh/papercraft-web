import { FolderOpen, Star } from 'lucide-react'
import { EmptyStatePanel, type EmptyStateStep } from '@/components/ui/EmptyStatePanel'

type BookmarksEmptyPanelProps = {
  variant: 'no-folders' | 'empty-folder'
  onCreateFolder?: () => void
}

const FOLDER_STEPS: EmptyStateStep[] = [
  {
    number: 1,
    content: 'Create a folder below (or from the repository star menu)',
  },
  {
    number: 2,
    content: (
      <>
        Open <strong>Question Repository</strong> and tap{' '}
        <Star
          size={12}
          strokeWidth={1.6}
          className="pc-bookmarks-inline-star"
          aria-hidden
        />{' '}
        on any question
      </>
    ),
  },
  { number: 3, content: 'Choose your folder — done' },
]

export function BookmarksEmptyPanel({
  variant,
  onCreateFolder,
}: BookmarksEmptyPanelProps) {
  if (variant === 'empty-folder') {
    return (
      <EmptyStatePanel
        icon={Star}
        title="This folder is empty"
        description="Save questions from the repository with the star icon, then pick this folder."
        actions={[
          { kind: 'link', label: 'Browse questions', to: '/app/repository', primary: true },
        ]}
      />
    )
  }

  return (
    <EmptyStatePanel
      icon={FolderOpen}
      title="No bookmark folders yet"
      description="Create a folder for mid-terms, revision sets, or practice — then save questions while you browse."
      steps={FOLDER_STEPS}
      actions={[
        ...(onCreateFolder
          ? [
              {
                kind: 'button' as const,
                label: 'Create your first folder',
                onClick: onCreateFolder,
                primary: true,
              },
            ]
          : []),
        { kind: 'link', label: 'Browse questions', to: '/app/repository' },
      ]}
    />
  )
}
