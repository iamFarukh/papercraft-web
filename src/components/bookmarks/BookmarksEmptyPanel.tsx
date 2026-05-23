import { FolderOpen, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

type BookmarksEmptyPanelProps = {
  variant: 'no-folders' | 'empty-folder'
  onCreateFolder?: () => void
}

export function BookmarksEmptyPanel({
  variant,
  onCreateFolder,
}: BookmarksEmptyPanelProps) {
  if (variant === 'empty-folder') {
    return (
      <div className="pc-bookmarks-empty-panel">
        <div className="pc-bookmarks-empty-icon" aria-hidden>
          <Star size={26} strokeWidth={1.5} />
        </div>
        <h2 className="pc-bookmarks-empty-title">This folder is empty</h2>
        <p className="pc-bookmarks-empty-text">
          Save questions from the repository with the star icon, then pick this folder.
        </p>
        <Link to="/app/repository" className="pc-btn is-primary is-sm">
          Browse questions
        </Link>
      </div>
    )
  }

  return (
    <div className="pc-bookmarks-empty-panel">
      <div className="pc-bookmarks-empty-icon" aria-hidden>
        <FolderOpen size={26} strokeWidth={1.5} />
      </div>
      <h2 className="pc-bookmarks-empty-title">No bookmark folders yet</h2>
      <p className="pc-bookmarks-empty-text">
        Create a folder for mid-terms, revision sets, or practice — then save questions while you browse.
      </p>
      <ul className="pc-bookmarks-empty-steps">
        <li>
          <span className="pc-num">1</span> Create a folder below (or from the repository star menu)
        </li>
        <li>
          <span className="pc-num">2</span> Open <strong>Question Repository</strong> and tap{' '}
          <Star size={12} strokeWidth={1.6} className="pc-bookmarks-inline-star" /> on any question
        </li>
        <li>
          <span className="pc-num">3</span> Choose your folder — done
        </li>
      </ul>
      <div className="pc-bookmarks-empty-actions">
        {onCreateFolder && (
          <button type="button" className="pc-btn is-primary is-sm" onClick={onCreateFolder}>
            Create your first folder
          </button>
        )}
        <Link to="/app/repository" className="pc-btn is-sm">
          Browse questions
        </Link>
      </div>
    </div>
  )
}
