export function RepositoryToolbarSkeleton() {
  return (
    <div className="pc-repo-toolbar pc-repo-toolbar--skeleton" aria-hidden>
      <div className="pc-skel pc-skel-cmd" />
      <div className="pc-skel pc-skel-select" />
      <div className="pc-skel pc-skel-toggle" />
    </div>
  )
}

export function QuestionCardSkeleton() {
  return (
    <article className="pc-q-card pc-q-card--skeleton" aria-hidden>
      <div className="pc-skel pc-skel-line is-short" />
      <div className="pc-skel pc-skel-line is-title" />
      <div className="pc-skel pc-skel-line" />
      <div className="pc-skel pc-skel-line is-medium" />
      <div className="pc-skel pc-skel-foot" />
    </article>
  )
}

export function IntelligenceSidebarSkeleton() {
  return (
    <aside className="pc-repo-intel pc-repo-intel--skeleton" aria-hidden>
      <div className="pc-skel pc-skel-line is-kicker" />
      <div className="pc-skel pc-skel-line is-heading" />
      <div className="pc-skel pc-skel-stat-grid" />
      <div className="pc-skel pc-skel-block" />
      <div className="pc-skel pc-skel-block is-tall" />
    </aside>
  )
}
