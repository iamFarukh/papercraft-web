export function AuthLoading() {
  return (
    <div
      className="pc-auth-loading"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="pc-brand-mark" aria-hidden />
      <span className="pc-auth-loading-text">PaperCraft</span>
    </div>
  )
}
