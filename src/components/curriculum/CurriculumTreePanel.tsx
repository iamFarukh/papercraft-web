import { ChevronDown, ChevronRight, Layers } from 'lucide-react'
import { useState } from 'react'
import type { CurriculumTreeNode } from '@/lib/curriculum-workspace'

type Props = {
  tree: CurriculumTreeNode[]
  selectionId: string | null
  selectionType: string | null
  loading: boolean
  showArchived: boolean
  onToggleArchived: (v: boolean) => void
  onSelect: (node: CurriculumTreeNode) => void
}

function TreeNode({
  node,
  depth,
  selectionId,
  selectionType,
  expanded,
  onToggleExpand,
  onSelect,
}: {
  node: CurriculumTreeNode
  depth: number
  selectionId: string | null
  selectionType: string | null
  expanded: Set<string>
  onToggleExpand: (key: string) => void
  onSelect: (node: CurriculumTreeNode) => void
}) {
  const key = `${node.type}:${node.id}`
  const hasChildren = node.children.length > 0
  const isOpen = expanded.has(key)
  const isSelected = selectionId === node.id && selectionType === node.type

  return (
    <div className="pc-curr-tree-node">
      <div
        className={
          'pc-curr-tree-row' +
          (isSelected ? ' is-selected' : '') +
          (node.status === 'archived' ? ' is-archived' : '')
        }
        style={{ paddingLeft: 8 + depth * 14 }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="pc-curr-tree-chevron"
            onClick={() => onToggleExpand(key)}
            aria-label={isOpen ? 'Collapse' : 'Expand'}
          >
            {isOpen ? (
              <ChevronDown size={13} strokeWidth={1.6} />
            ) : (
              <ChevronRight size={13} strokeWidth={1.6} />
            )}
          </button>
        ) : (
          <span className="pc-curr-tree-chevron is-spacer" />
        )}
        <button
          type="button"
          className="pc-curr-tree-label"
          onClick={() => onSelect(node)}
        >
          <span className="pc-curr-tree-type">{node.type}</span>
          <span className="pc-curr-tree-name">{node.label}</span>
          {node.status === 'archived' ? (
            <span className="pc-curr-tree-archived">archived</span>
          ) : null}
        </button>
      </div>
      {hasChildren && isOpen
        ? node.children.map((child) => (
            <TreeNode
              key={`${child.type}:${child.id}`}
              node={child}
              depth={depth + 1}
              selectionId={selectionId}
              selectionType={selectionType}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
            />
          ))
        : null}
    </div>
  )
}

export function CurriculumTreePanel({
  tree,
  selectionId,
  selectionType,
  loading,
  showArchived,
  onToggleArchived,
  onSelect,
}: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())

  function toggleExpand(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <aside className="pc-curr-tree pc-scroll" aria-label="Curriculum tree">
      <div className="pc-curr-tree-head">
        <Layers size={14} strokeWidth={1.6} />
        <div>
          <span className="pc-curr-tree-title">Curriculum tree</span>
          <span className="pc-curr-tree-sub">Class → Subject → Chapter → Topic</span>
        </div>
      </div>

      <label className="pc-curr-tree-toggle-archived">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(e) => onToggleArchived(e.target.checked)}
        />
        Show archived
      </label>

      {loading ? (
        <p className="pc-curr-muted">Loading taxonomy…</p>
      ) : tree.length === 0 ? (
        <p className="pc-curr-muted">No curriculum entries yet.</p>
      ) : (
        <div className="pc-curr-tree-body">
          {tree.map((cls) => (
            <TreeNode
              key={`${cls.type}:${cls.id}`}
              node={cls}
              depth={0}
              selectionId={selectionId}
              selectionType={selectionType}
              expanded={expanded}
              onToggleExpand={toggleExpand}
              onSelect={(n) => {
                toggleExpand(`${n.type}:${n.id}`)
                onSelect(n)
              }}
            />
          ))}
        </div>
      )}
    </aside>
  )
}
