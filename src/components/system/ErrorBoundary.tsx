import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** Optional custom fallback. Receives a reset callback. */
  fallback?: (reset: () => void, error: Error) => ReactNode
  /** Label used in the default fallback copy (e.g. "this page"). */
  scopeLabel?: string
}

type State = { error: Error | null }

/**
 * Catches render/lifecycle errors in the subtree and shows a recoverable
 * fallback instead of unmounting the whole SPA to a blank page.
 *
 * Placement: one at the app root (last-resort) and one per route (granular
 * recovery, reset on navigation by keying with the pathname).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Observability hook — wire Sentry/logging here. Dev-only console so
    // production bundles stay free of stray logging.
    if (import.meta.env.DEV) {
       
      console.error('[ErrorBoundary]', error, info.componentStack)
    }
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    if (this.props.fallback) return this.props.fallback(this.reset, error)

    const scope = this.props.scopeLabel ?? 'this view'
    return (
      <div className="pc-error-boundary" role="alert">
        <div className="pc-error-boundary-card">
          <h2 className="pc-error-boundary-title">Something went wrong</h2>
          <p className="pc-error-boundary-desc">
            We hit an unexpected error loading {scope}. You can try again, or
            reload the app.
          </p>
          <div className="pc-error-boundary-actions">
            <button
              type="button"
              className="pc-btn is-sm"
              onClick={() => window.location.reload()}
            >
              Reload app
            </button>
            <button
              type="button"
              className="pc-btn is-sm is-primary"
              onClick={this.reset}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }
}
