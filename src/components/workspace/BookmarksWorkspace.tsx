import { useCallback, useEffect, useState } from 'react'
import {
  ArrowLeft,
  Bookmark,
  FolderPlus,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BookmarksEmptyPanel } from '@/components/bookmarks/BookmarksEmptyPanel'
import { CreateFolderDialog } from '@/components/bookmarks/CreateFolderDialog'
import { useAuth } from '@/context/AuthContext'
import { useBookmarks } from '@/context/BookmarkContext'
import { useToast } from '@/context/ToastContext'
import { questionDisplayRef } from '@/lib/question-display'
import { mapQuestionDoc } from '@/lib/question-mapper'
import { getQuestionById } from '@/services/firebase/questions'
import { subscribeBookmarkFolderQuestionIds } from '@/services/firebase/bookmarks'
import type { QuestionRecord } from '@/types/question'

export function BookmarksWorkspace() {
  const { folderId } = useParams<{ folderId?: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { push: toast } = useToast()
  const {
    folders,
    loading: foldersLoading,
    createFolder,
    renameFolder,
    deleteFolder,
    removeFromFolder,
  } = useBookmarks()
  const [createOpen, setCreateOpen] = useState(false)

  const folder = folders.find((f) => f.id === folderId)

  const handleCreateFolder = useCallback(
    async (name: string) => {
      const id = await createFolder(name)
      toast(`Folder “${name.trim()}” created`, 'success')
      navigate(`/app/bookmarks/${id}`)
    },
    [createFolder, navigate, toast],
  )

  if (folderId && !foldersLoading && !folder) {
    return (
      <div className="pc-bookmarks-page">
        <BookmarksEmptyPanel variant="empty-folder" />
        <div className="pc-bookmarks-empty-actions" style={{ justifyContent: 'center' }}>
          <Link to="/app/bookmarks" className="pc-btn is-sm">
            All folders
          </Link>
        </div>
      </div>
    )
  }

  if (folderId && folder) {
    return (
      <FolderDetailView
        folder={folder}
        userId={user?.uid ?? ''}
        onBack={() => navigate('/app/bookmarks')}
        onRename={renameFolder}
        onDelete={async () => {
          await deleteFolder(folder.id)
          toast(`Folder “${folder.name}” deleted`, 'info')
          navigate('/app/bookmarks')
        }}
        onRemove={async (questionId) => {
          await removeFromFolder(folder.id, questionId)
          toast('Removed from folder', 'info')
        }}
      />
    )
  }

  return (
    <div className="pc-bookmarks-page">
      <header className="pc-bookmarks-head">
        <div className="pc-bookmarks-head-text">
          <div className="pc-repo-kicker">Your collections</div>
          <h1 className="pc-repo-title">
            <Bookmark size={22} strokeWidth={1.6} />
            Bookmarks
          </h1>
          <p className="pc-bookmarks-lead">
            Organize questions into folders for exams, revision, and practice sets.
          </p>
        </div>
        {!foldersLoading && folders.length > 0 && (
          <button
            type="button"
            className="pc-btn is-primary is-sm"
            onClick={() => setCreateOpen(true)}
          >
            <FolderPlus size={14} strokeWidth={1.6} />
            New folder
          </button>
        )}
      </header>

      {foldersLoading ? (
        <div className="pc-bookmarks-grid pc-bookmarks-grid--loading">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="pc-bookmarks-folder-card pc-skel" aria-hidden />
          ))}
        </div>
      ) : folders.length === 0 ? (
        <BookmarksEmptyPanel
          variant="no-folders"
          onCreateFolder={() => setCreateOpen(true)}
        />
      ) : (
        <div className="pc-bookmarks-grid">
          {folders.map((f) => (
            <Link
              key={f.id}
              to={`/app/bookmarks/${f.id}`}
              className="pc-bookmarks-folder-card"
            >
              <span className="pc-bookmarks-folder-icon" aria-hidden>
                <Bookmark size={18} strokeWidth={1.6} />
              </span>
              <span className="pc-bookmarks-folder-name">{f.name}</span>
              <span className="pc-bookmarks-folder-meta pc-num">
                {f.questionCount} question{f.questionCount === 1 ? '' : 's'}
              </span>
            </Link>
          ))}
        </div>
      )}

      <CreateFolderDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateFolder}
      />
    </div>
  )
}

type FolderDetailViewProps = {
  folder: { id: string; name: string; questionCount: number }
  userId: string
  onBack: () => void
  onRename: (folderId: string, name: string) => Promise<void>
  onDelete: () => Promise<void>
  onRemove: (questionId: string) => Promise<void>
}

function FolderDetailView({
  folder,
  userId,
  onBack,
  onRename,
  onDelete,
  onRemove,
}: FolderDetailViewProps) {
  const { push: toast } = useToast()
  const [questionIds, setQuestionIds] = useState<string[]>([])
  const [questions, setQuestions] = useState<QuestionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(folder.name)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!userId) return
    return subscribeBookmarkFolderQuestionIds(userId, folder.id, setQuestionIds)
  }, [userId, folder.id])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (questionIds.length === 0) {
        setQuestions([])
        setLoading(false)
        return
      }
      setLoading(true)
      const rows: QuestionRecord[] = []
      for (const id of questionIds) {
        const doc = await getQuestionById(id)
        if (doc) rows.push(mapQuestionDoc(id, doc))
      }
      if (!cancelled) {
        setQuestions(rows)
        setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [questionIds])

  const handleSaveName = useCallback(async () => {
    const name = editName.trim()
    if (!name || name === folder.name) {
      setEditing(false)
      setEditName(folder.name)
      return
    }
    setBusy(true)
    try {
      await onRename(folder.id, name)
      toast('Folder renamed', 'success')
      setEditing(false)
    } finally {
      setBusy(false)
    }
  }, [editName, folder.id, folder.name, onRename, toast])

  const handleDeleteFolder = useCallback(async () => {
    if (
      !window.confirm(
        `Delete “${folder.name}” and remove all saved questions from it?`,
      )
    ) {
      return
    }
    setBusy(true)
    try {
      await onDelete()
    } finally {
      setBusy(false)
    }
  }, [folder.name, onDelete])

  return (
    <div className="pc-bookmarks-page">
      <header className="pc-bookmarks-head pc-bookmarks-head--detail">
        <button type="button" className="pc-btn is-ghost is-sm" onClick={onBack}>
          <ArrowLeft size={14} strokeWidth={1.6} />
          All folders
        </button>
        <div className="pc-bookmarks-detail-title-row">
          {editing ? (
            <form
              className="pc-bookmarks-rename"
              onSubmit={(e) => {
                e.preventDefault()
                void handleSaveName()
              }}
            >
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                maxLength={80}
              />
              <button type="submit" className="pc-btn is-primary is-sm" disabled={busy}>
                Save
              </button>
              <button
                type="button"
                className="pc-btn is-ghost is-sm"
                onClick={() => {
                  setEditing(false)
                  setEditName(folder.name)
                }}
              >
                Cancel
              </button>
            </form>
          ) : (
            <>
              <h1 className="pc-repo-title">{folder.name}</h1>
              <button
                type="button"
                className="pc-bookmarks-icon-btn"
                aria-label="Rename folder"
                onClick={() => setEditing(true)}
              >
                <Pencil size={14} strokeWidth={1.6} />
              </button>
            </>
          )}
        </div>
        <p className="pc-bookmarks-lead pc-num">
          {questions.length} saved question{questions.length === 1 ? '' : 's'}
        </p>
        <div className="pc-bookmarks-detail-actions">
          <button
            type="button"
            className="pc-btn is-ghost is-sm"
            disabled={busy}
            onClick={() => void handleDeleteFolder()}
          >
            <Trash2 size={13} strokeWidth={1.6} />
            Delete folder
          </button>
        </div>
      </header>

      {loading ? (
        <div className="pc-bookmarks-list">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="pc-bookmarks-row pc-skel" style={{ height: 88 }} />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <BookmarksEmptyPanel variant="empty-folder" />
      ) : (
        <div className="pc-bookmarks-list">
          {questions.map((q) => (
            <article key={q.id} className="pc-bookmarks-row">
              <div className="pc-bookmarks-row-main">
                <span className="pc-bookmarks-row-ref">{questionDisplayRef(q)}</span>
                <span className="pc-tag is-ink">{q.type}</span>
                <span className="pc-bookmarks-row-meta">
                  {q.classLabel} · {q.subject} · {q.chapter}
                </span>
                <p className="pc-bookmarks-row-body pc-serif">{q.bodyText}</p>
              </div>
              <div className="pc-bookmarks-row-actions">
                <Link
                  to="/app/repository"
                  className="pc-btn is-ghost is-sm"
                  title="Open in repository"
                >
                  View
                </Link>
                <button
                  type="button"
                  className="pc-btn is-ghost is-sm"
                  onClick={() => void onRemove(q.id)}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
