import { Archive, Lock, RotateCcw, Send, Trash2, X } from 'lucide-react'

type BulkActionBarProps = {
  count: number
  disabled?: boolean
  trashMode?: boolean
  onClear: () => void
  onPublish?: () => void
  onArchive?: () => void
  onLock?: () => void
  onDelete?: () => void
  onRestore?: () => void
}

export function BulkActionBar({
  count,
  disabled = false,
  trashMode = false,
  onClear,
  onPublish,
  onArchive,
  onLock,
  onDelete,
  onRestore,
}: BulkActionBarProps) {
  return (
    <div className="pc-repo-bulk" role="toolbar" aria-label="Bulk actions">
      <span className="pc-repo-bulk-count">
        <strong className="pc-num">{count}</strong> selected
        {trashMode && <span className="pc-repo-bulk-trash-label"> · Trash</span>}
      </span>
      <div className="pc-repo-bulk-actions">
        {trashMode ? (
          <button
            type="button"
            className="pc-btn is-sm is-primary"
            disabled={disabled}
            onClick={onRestore}
          >
            <RotateCcw size={13} strokeWidth={1.6} />
            {disabled ? 'Restoring…' : 'Restore'}
          </button>
        ) : (
          <>
            <button
              type="button"
              className="pc-btn is-sm is-ghost"
              disabled={disabled}
              onClick={onPublish}
            >
              <Send size={13} strokeWidth={1.6} />
              {disabled ? 'Updating…' : 'Publish'}
            </button>
            <button
              type="button"
              className="pc-btn is-sm is-ghost"
              disabled={disabled}
              onClick={onArchive}
            >
              <Archive size={13} strokeWidth={1.6} />
              Archive
            </button>
            <button
              type="button"
              className="pc-btn is-sm is-ghost"
              disabled={disabled}
              onClick={onLock}
            >
              <Lock size={13} strokeWidth={1.6} />
              Lock
            </button>
            <button
              type="button"
              className="pc-btn is-sm is-outline is-danger"
              disabled={disabled}
              onClick={onDelete}
            >
              <Trash2 size={13} strokeWidth={1.6} />
              Delete
            </button>
          </>
        )}
      </div>
      <button
        type="button"
        className="pc-repo-bulk-clear"
        onClick={onClear}
        aria-label="Clear selection"
      >
        <X size={14} strokeWidth={1.6} />
      </button>
    </div>
  )
}
