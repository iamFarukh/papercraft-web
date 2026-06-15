/**
 * Suspense fallback shown while a lazily-loaded route chunk downloads.
 * Intentionally minimal and on-brand — a subtle pulse, no spinner jank.
 */
export function RouteFallback() {
  return (
    <div className="pc-route-fallback" aria-busy="true" aria-live="polite">
      <div className="pc-route-fallback-bar" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
