export function MetricCardSkeleton() {
  return (
    <article className="pc-metric-card pc-metric-card--skeleton" aria-hidden>
      <div className="pc-metric-card-top">
        <span className="pc-skel pc-skel-metric-label" />
        <span className="pc-skel pc-skel-metric-trend" />
      </div>
      <div className="pc-metric-value-row">
        <span className="pc-skel pc-skel-metric-value" />
        <span className="pc-skel pc-skel-metric-unit" />
      </div>
      <p className="pc-skel pc-skel-metric-hint" />
    </article>
  )
}
