import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FolderPlus, X } from 'lucide-react'

type CreateFolderDialogProps = {
  open: boolean
  onClose: () => void
  onCreate: (name: string) => Promise<void>
}

export function CreateFolderDialog({
  open,
  onClose,
  onCreate,
}: CreateFolderDialogProps) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setName('')
      setError(null)
      return
    }
    inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setBusy(true)
    setError(null)
    try {
      await onCreate(trimmed)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create folder')
    } finally {
      setBusy(false)
    }
  }

  return createPortal(
    <div className="pc-folder-dialog-overlay" onClick={onClose}>
      <div
        className="pc-folder-dialog"
        role="dialog"
        aria-labelledby="create-folder-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="pc-folder-dialog-head">
          <FolderPlus size={16} strokeWidth={1.6} />
          <h2 id="create-folder-title">New bookmark folder</h2>
          <button type="button" className="pc-folder-dialog-close" onClick={onClose}>
            <X size={16} strokeWidth={1.6} />
          </button>
        </header>
        <form onSubmit={(e) => void handleSubmit(e)}>
          <label className="pc-folder-dialog-label" htmlFor="folder-name">
            Folder name
          </label>
          <input
            ref={inputRef}
            id="folder-name"
            type="text"
            placeholder="e.g. Mid-Term July"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
          />
          {error && <p className="pc-folder-dialog-error">{error}</p>}
          <div className="pc-folder-dialog-actions">
            <button type="button" className="pc-btn is-ghost is-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="pc-btn is-primary is-sm"
              disabled={!name.trim() || busy}
            >
              {busy ? 'Creating…' : 'Create folder'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
