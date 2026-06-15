import { useCurriculumWorkspace } from '@/hooks/useCurriculumWorkspace'
import { CurriculumDetailPanel } from '@/components/curriculum/CurriculumDetailPanel'
import { CurriculumInsightsPanel } from '@/components/curriculum/CurriculumInsightsPanel'
import { CurriculumTreePanel } from '@/components/curriculum/CurriculumTreePanel'

export function CurriculumWorkspace() {
  const {
    tree,
    selection,
    insights,
    linkedQuestions,
    loading,
    busy,
    error,
    showArchived,
    isAdmin,
    setShowArchived,
    selectNode,
    addChild,
    renameNode,
    setArchived,
    reload,
  } = useCurriculumWorkspace()

  return (
    <div className="pc-curr-workspace">
      <header className="pc-curr-header">
        <div>
          <p className="pc-curr-header-kicker">Academic foundation</p>
          <h1 className="pc-curr-header-title pc-serif">Curriculum workspace</h1>
          <p className="pc-curr-header-lead">
            Manage the structured taxonomy that powers the repository, paper builder,
            and examination workflows.
          </p>
        </div>
        {!isAdmin ? (
          <span className="pc-curr-header-badge">Read-only</span>
        ) : null}
      </header>

      {error ? (
        <div className="pc-curr-error" role="alert">
          <p>{error}</p>
          <button type="button" className="pc-btn is-sm" onClick={() => void reload()}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="pc-curr-panels">
        <CurriculumTreePanel
          tree={tree}
          selectionId={selection?.id ?? null}
          selectionType={selection?.type ?? null}
          loading={loading}
          error={error}
          showArchived={showArchived}
          onToggleArchived={setShowArchived}
          onSelect={selectNode}
        />
        <CurriculumDetailPanel
          tree={tree}
          selection={selection}
          insights={insights}
          linkedQuestions={linkedQuestions}
          isAdmin={isAdmin}
          busy={busy}
          onAddChild={addChild}
          onRename={renameNode}
          onSetArchived={setArchived}
        />
        <CurriculumInsightsPanel
          insights={insights}
          selection={selection}
          loading={loading}
        />
      </div>
    </div>
  )
}
