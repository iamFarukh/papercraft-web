type ViewMode = 'card' | 'list'

export function RepositoryToolbarSkeleton() {
  return (
    <div className="pc-repo-toolbar-wrap" aria-hidden>
      <div className="pc-repo-toolbar pc-repo-toolbar--skeleton">
        <div className="pc-skel pc-skel-cmd" />
        <div className="pc-skel pc-skel-select" />
        <div className="pc-skel pc-skel-view-toggle" />
        <div className="pc-skel pc-skel-toolbar-meta" />
        <div className="pc-skel pc-skel-toolbar-btn" />
        <div className="pc-skel pc-skel-toolbar-btn" />
        <div className="pc-skel pc-skel-toolbar-btn is-wide" />
      </div>
    </div>
  )
}

export function FilterPanelSkeleton() {
  const sections = ['Syllabus', 'Topics', 'Difficulty', 'Question type', 'Status']

  return (
    <aside className="pc-repo-filters pc-repo-filters--skeleton pc-scroll" aria-hidden>
      <div className="pc-repo-filters-intro">
        <div>
          <span className="pc-skel pc-skel-filter-title" />
          <span className="pc-skel pc-skel-filter-sub" />
        </div>
      </div>

      <div className="pc-repo-filter-search">
        <span className="pc-skel pc-skel-filter-search" />
      </div>

      {sections.map((label) => (
        <section key={label} className="pc-repo-filter-section pc-repo-filter-section--skel">
          <div className="pc-repo-filter-section-head pc-repo-filter-section-head--skel">
            <span className="pc-skel pc-skel-section-label" />
            <span className="pc-skel pc-skel-section-meta" />
          </div>
          <div className="pc-repo-filter-section-body">
            {Array.from({ length: label === 'Syllabus' ? 4 : 3 }).map((_, i) => (
              <div key={i} className="pc-repo-filter-row pc-repo-filter-row--skel">
                <span className="pc-skel pc-skel-checkbox" />
                <span
                  className="pc-skel pc-skel-filter-row-label"
                  style={{ width: `${58 + (i % 3) * 12}%` }}
                />
                <span className="pc-skel pc-skel-filter-count" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </aside>
  )
}

export function QuestionCardSkeleton({ view = 'card' }: { view?: ViewMode }) {
  const isList = view === 'list'

  return (
    <article
      className={`pc-q-card pc-q-card--skeleton${isList ? ' is-list' : ''}`}
      aria-hidden
    >
      <header className="pc-q-card-head">
        <div className="pc-q-card-head-left">
          <span className="pc-skel pc-skel-pill" />
          <span className="pc-skel pc-skel-pill is-tag" />
          <span className="pc-skel pc-skel-pips" />
          <span className="pc-skel pc-skel-pill is-marks" />
        </div>
        <div className="pc-q-card-head-right">
          <span className="pc-skel pc-skel-icon-btn" />
          <span className="pc-skel pc-skel-icon-btn" />
          <span className="pc-skel pc-skel-icon-btn" />
        </div>
      </header>

      <div className="pc-q-card-main">
        <div className="pc-skel pc-skel-body-line" />
        {!isList && <div className="pc-skel pc-skel-body-line is-short" />}
        {!isList && <div className="pc-skel pc-skel-body-line is-hindi" />}
      </div>

      <footer className="pc-q-card-foot">
        <span className="pc-skel pc-skel-foot-chapter" />
        <span className="pc-skel pc-skel-pill is-tag" />
        <span className="pc-skel pc-skel-pill is-tag" />
        {!isList && <span className="pc-skel pc-skel-foot-meta" />}
      </footer>
    </article>
  )
}

export function RepositoryStreamSkeleton({ view = 'card' }: { view?: ViewMode }) {
  return (
    <section className="pc-repo-stream pc-scroll" aria-busy="true" aria-hidden>
      <div className="pc-repo-stream-head">
        <span className="pc-skel pc-skel-stream-title" />
        <span className="pc-repo-stream-rule" />
      </div>
      <div className={'pc-repo-cards' + (view === 'list' ? ' is-list' : '')}>
        {Array.from({ length: 4 }).map((_, i) => (
          <QuestionCardSkeleton key={i} view={view} />
        ))}
      </div>
    </section>
  )
}

export function IntelligenceSidebarSkeleton() {
  return (
    <aside className="pc-repo-intel pc-repo-intel--skeleton" aria-hidden>
      <header className="pc-repo-intel-header">
        <span className="pc-skel pc-skel-line is-kicker" />
        <span className="pc-skel pc-skel-intel-title" />
        <span className="pc-skel pc-skel-intel-lead" />
      </header>
      <div className="pc-repo-stat-grid">
        <div className="pc-repo-stat-cell pc-repo-stat-cell--skel">
          <span className="pc-skel pc-skel-stat-label" />
          <span className="pc-skel pc-skel-stat-value" />
        </div>
        <div className="pc-repo-stat-cell pc-repo-stat-cell--skel">
          <span className="pc-skel pc-skel-stat-label" />
          <span className="pc-skel pc-skel-stat-value" />
        </div>
      </div>
      <span className="pc-skel pc-skel-section-label" />
      <div className="pc-repo-lifecycle pc-repo-lifecycle--skel">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="pc-repo-lifecycle-row pc-repo-lifecycle-row--skel">
            <span className="pc-skel pc-skel-life-label" />
            <span className="pc-skel pc-skel-life-value" />
          </div>
        ))}
      </div>
    </aside>
  )
}
