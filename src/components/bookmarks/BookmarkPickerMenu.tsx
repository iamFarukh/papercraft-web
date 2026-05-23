import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FolderPlus, Plus, Star } from 'lucide-react'
import { useBookmarks } from '@/context/BookmarkContext'
import { useToast } from '@/context/ToastContext'
import { useQuestionBookmarkState } from '@/hooks/useQuestionBookmarkState'

type BookmarkPickerMenuProps = {
  questionId: string
  anchorRect: DOMRect | null
  open: boolean
  onClose: () => void
}

function stopBubble(e: React.SyntheticEvent) {
  e.stopPropagation()
}

export function BookmarkPickerMenu({
  questionId,
  anchorRect,
  open,
  onClose,
}: BookmarkPickerMenuProps) {
  const { push: toast } = useToast()
  const { folders, loading, createFolder, toggleInFolder } = useBookmarks()
  const { folderIds } = useQuestionBookmarkState(questionId)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [localFolderIds, setLocalFolderIds] = useState<string[]>([])
  const menuRef = useRef<HTMLDivElement>(null)

  const activeFolderIds = [...new Set([...folderIds, ...localFolderIds])]

  useEffect(() => {
    if (!open) return

    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (menuRef.current?.contains(target)) return
      onClose()
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('click', onDocClick, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setNewName('')
      setCreating(false)
      setError(null)
      setLocalFolderIds([])
    }
  }, [open])

  useEffect(() => {
    setLocalFolderIds((prev) =>
      prev.filter((id) => folderIds.includes(id) || folders.some((f) => f.id === id)),
    )
  }, [folderIds, folders])

  if (!open || !anchorRect) return null

  const top = Math.min(anchorRect.bottom + 6, window.innerHeight - 320)
  const left = Math.min(anchorRect.left, window.innerWidth - 280)

  async function handleToggle(folderId: string, inFolder: boolean) {
    setBusyId(folderId)
    setError(null)
    const folderName = folders.find((f) => f.id === folderId)?.name ?? 'folder'
    try {
      await toggleInFolder(folderId, questionId, inFolder)
      if (inFolder) {
        setLocalFolderIds((prev) => prev.filter((id) => id !== folderId))
        toast(`Removed from “${folderName}”`, 'info')
      } else {
        setLocalFolderIds((prev) =>
          prev.includes(folderId) ? prev : [...prev, folderId],
        )
        toast(`Saved to “${folderName}”`, 'success')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update bookmark')
    } finally {
      setBusyId(null)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    const name = newName.trim()
    if (!name) return
    setBusyId('new')
    setError(null)
    try {
      const folderId = await createFolder(name)
      setLocalFolderIds((prev) =>
        prev.includes(folderId) ? prev : [...prev, folderId],
      )
      await toggleInFolder(folderId, questionId, false)
      toast(`Created “${name}” and saved question`, 'success')
      setNewName('')
      setCreating(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create folder')
    } finally {
      setBusyId(null)
    }
  }

  return createPortal(
    <div
      ref={menuRef}
      className="pc-bookmark-menu"
      style={{ top, left }}
      role="dialog"
      aria-label="Save to bookmark folder"
      onMouseDown={stopBubble}
      onClick={stopBubble}
      onPointerDown={stopBubble}
    >
      <div className="pc-bookmark-menu-head">
        <Star size={14} strokeWidth={1.6} />
        <span>Save to folder</span>
      </div>

      {error && <p className="pc-bookmark-menu-error">{error}</p>}

      <div className="pc-bookmark-menu-list">
        {loading && folders.length === 0 && (
          <p className="pc-bookmark-menu-empty">Loading folders…</p>
        )}
        {!loading && folders.length === 0 && !creating && (
          <p className="pc-bookmark-menu-empty">No folders yet. Create one below.</p>
        )}
        {folders.map((folder) => {
          const checked = activeFolderIds.includes(folder.id)
          return (
            <button
              key={folder.id}
              type="button"
              className={'pc-bookmark-menu-row' + (checked ? ' is-on' : '')}
              disabled={busyId === folder.id || folder.id.startsWith('opt-')}
              onMouseDown={stopBubble}
              onClick={(e) => {
                stopBubble(e)
                void handleToggle(folder.id, checked)
              }}
            >
              <input
                type="checkbox"
                className="pc-bookmark-menu-check"
                checked={checked}
                readOnly
                tabIndex={-1}
              />
              <span className="pc-bookmark-menu-row-label">{folder.name}</span>
              <span className="pc-num pc-bookmark-menu-count">
                {folder.questionCount}
              </span>
            </button>
          )
        })}
      </div>

      {creating ? (
        <form
          className="pc-bookmark-menu-new"
          onSubmit={(e) => void handleCreate(e)}
          onMouseDown={stopBubble}
          onClick={stopBubble}
        >
          <input
            type="text"
            placeholder="Folder name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onMouseDown={stopBubble}
            onClick={stopBubble}
            autoFocus
            maxLength={80}
          />
          <button
            type="submit"
            className="pc-btn is-primary is-sm"
            disabled={!newName.trim() || busyId === 'new'}
            onMouseDown={stopBubble}
          >
            Create
          </button>
          <button
            type="button"
            className="pc-btn is-ghost is-sm"
            onMouseDown={stopBubble}
            onClick={(e) => {
              stopBubble(e)
              setCreating(false)
            }}
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          className="pc-bookmark-menu-add"
          onMouseDown={stopBubble}
          onClick={(e) => {
            stopBubble(e)
            setCreating(true)
          }}
        >
          <FolderPlus size={14} strokeWidth={1.6} />
          Create new folder
        </button>
      )}

      {!creating && folders.length > 0 && (
        <button
          type="button"
          className="pc-bookmark-menu-add is-muted"
          onMouseDown={stopBubble}
          onClick={(e) => {
            stopBubble(e)
            setCreating(true)
          }}
        >
          <Plus size={13} strokeWidth={1.6} />
          New folder
        </button>
      )}
    </div>,
    document.body,
  )
}
