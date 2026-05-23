import { Archive, ArchiveRestore, Loader2, Pencil, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  childLabelFor,
  childTypeFor,
  selectionBreadcrumb,
  type CurriculumSelection,
  type CurriculumTreeNode,
} from '@/lib/curriculum-workspace'
import type { CurriculumInsights } from '@/lib/curriculum-workspace'

type Props = {
  tree: CurriculumTreeNode[]
  selection: CurriculumSelection | null
  insights: CurriculumInsights | null
  linkedQuestions: number
  isAdmin: boolean
  busy: boolean
  onAddChild: (name: string) => Promise<{ ok: boolean; message?: string }>
  onRename: (name: string) => Promise<{ ok: boolean; message?: string }>
  onSetArchived: (archived: boolean) => void
}

export function CurriculumDetailPanel({
  tree,
  selection,
  insights,
  linkedQuestions,
  isAdmin,
  busy,
  onAddChild,
  onRename,
  onSetArchived,
}: Props) {
  const [addName, setAddName] = useState('')
  const [renameName, setRenameName] = useState('')
  const [editing, setEditing] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    setRenameName(selection?.label ?? '')
    setEditing(false)
    setShowAdd(false)
    setAddName('')
    setFormError(null)
  }, [selection?.id, selection?.type])

  if (!selection) {
    return (
      <section className="pc-curr-detail pc-curr-detail--empty">
        <p className="pc-curr-detail-kicker">Detail workspace</p>
        <h2 className="pc-curr-detail-title pc-serif">Select a curriculum node</h2>
        <p className="pc-curr-detail-lead">
          Choose a class, subject, chapter, or topic in the tree to view structure,
          linked questions, and lifecycle controls.
        </p>
      </section>
    )
  }

  const crumbs = selectionBreadcrumb(tree, selection)
  const childType = childTypeFor(selection.type)
  const childLabel = childType ? childLabelFor(childType) : null

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    const result = await onAddChild(addName)
    if (result.ok) {
      setAddName('')
      setShowAdd(false)
    } else {
      setFormError(result.message ?? 'Could not create entry.')
    }
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    const result = await onRename(renameName)
    if (result.ok) setEditing(false)
    else setFormError(result.message ?? 'Could not rename.')
  }

  return (
    <section className="pc-curr-detail pc-scroll">
      <header className="pc-curr-detail-head">
        <p className="pc-curr-detail-kicker">Detail workspace</p>
        <nav className="pc-curr-detail-crumbs" aria-label="Hierarchy">
          {crumbs.map((c, i) => (
            <span key={`${c}-${i}`}>
              {i > 0 ? <span className="pc-curr-crumb-sep">/</span> : null}
              {c}
            </span>
          ))}
        </nav>
        <div className="pc-curr-detail-title-row">
          <h2 className="pc-curr-detail-title pc-serif">{selection.label}</h2>
          <span
            className={
              'pc-curr-lifecycle' +
              (selection.status === 'archived' ? ' is-archived' : ' is-active')
            }
          >
            {selection.status === 'archived' ? 'Archived' : 'Active'}
          </span>
        </div>
        <p className="pc-curr-detail-meta">
          <span className="pc-curr-detail-type">{selection.type}</span>
          <span className="pc-curr-detail-id pc-mono">{selection.id}</span>
        </p>
      </header>

      <div className="pc-curr-detail-stats">
        <div className="pc-curr-stat">
          <span className="pc-curr-stat-k">Linked questions</span>
          <span className="pc-curr-stat-v pc-num">{linkedQuestions}</span>
        </div>
        <div className="pc-curr-stat">
          <span className="pc-curr-stat-k">Linked papers</span>
          <span className="pc-curr-stat-v pc-num">
            {insights?.papersInSelection ?? '—'}
          </span>
        </div>
        <div className="pc-curr-stat">
          <span className="pc-curr-stat-k">In repository scope</span>
          <span className="pc-curr-stat-v pc-num">
            {insights?.questionsInSelection ?? '—'}
          </span>
        </div>
      </div>

      {!isAdmin ? (
        <p className="pc-curr-readonly-note">
          You have read-only access to the academic taxonomy. Contact an administrator
          to add or archive curriculum entries.
        </p>
      ) : (
        <div className="pc-curr-detail-actions">
          {childLabel && selection.status !== 'archived' ? (
            <div className="pc-curr-action-block">
              {!showAdd ? (
                <button
                  type="button"
                  className="pc-btn is-sm"
                  disabled={busy}
                  onClick={() => setShowAdd(true)}
                >
                  <Plus size={12} strokeWidth={1.6} />
                  Add {childLabel.toLowerCase()}
                </button>
              ) : (
                <form className="pc-curr-form" onSubmit={(e) => void handleAdd(e)}>
                  <label className="pc-curr-form-label">
                    New {childLabel.toLowerCase()}
                    <input
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      placeholder={`e.g. ${childLabel} name`}
                      autoFocus
                      disabled={busy}
                    />
                  </label>
                  <div className="pc-curr-form-btns">
                    <button type="submit" className="pc-btn is-primary is-sm" disabled={busy}>
                      {busy ? <Loader2 size={12} className="pc-spin" /> : null}
                      Create
                    </button>
                    <button
                      type="button"
                      className="pc-btn is-sm is-ghost"
                      onClick={() => setShowAdd(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : null}

          {selection.type !== 'class' ? (
            <div className="pc-curr-action-block">
              {!editing ? (
                <button
                  type="button"
                  className="pc-btn is-sm is-ghost"
                  disabled={busy}
                  onClick={() => setEditing(true)}
                >
                  <Pencil size={12} strokeWidth={1.6} />
                  Rename
                </button>
              ) : (
                <form className="pc-curr-form" onSubmit={(e) => void handleRename(e)}>
                  <label className="pc-curr-form-label">
                    Display name
                    <input
                      value={renameName}
                      onChange={(e) => setRenameName(e.target.value)}
                      disabled={busy}
                    />
                  </label>
                  <div className="pc-curr-form-btns">
                    <button type="submit" className="pc-btn is-primary is-sm" disabled={busy}>
                      Save name
                    </button>
                    <button
                      type="button"
                      className="pc-btn is-sm is-ghost"
                      onClick={() => {
                        setEditing(false)
                        setRenameName(selection.label)
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : null}

          {selection.type !== 'class' ? (
            <button
              type="button"
              className="pc-btn is-sm is-ghost"
              disabled={busy}
              onClick={() => onSetArchived(selection.status !== 'archived')}
            >
              {selection.status === 'archived' ? (
                <>
                  <ArchiveRestore size={12} strokeWidth={1.6} />
                  Restore to active
                </>
              ) : (
                <>
                  <Archive size={12} strokeWidth={1.6} />
                  Archive
                </>
              )}
            </button>
          ) : null}

          {formError ? (
            <p className="pc-curr-form-error" role="alert">
              {formError}
            </p>
          ) : null}
        </div>
      )}

      <div className="pc-curr-detail-note">
        <p>
          Questions reference <strong>subjectId</strong>, <strong>chapterId</strong>, and{' '}
          <strong>topicId</strong> — not free-text labels. Archived entries stay on
          historical papers but are hidden from new authoring.
        </p>
      </div>
    </section>
  )
}
