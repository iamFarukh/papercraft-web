import { AlertCircle, RefreshCw, ShieldAlert, WifiOff } from 'lucide-react'
import type { RepositoryError } from '@/types/question'

const ICONS = {
  network: WifiOff,
  permission: ShieldAlert,
  unknown: AlertCircle,
}

type RepositoryErrorStateProps = {
  error: RepositoryError
  onRetry?: () => void
}

export function RepositoryErrorState({ error, onRetry }: RepositoryErrorStateProps) {
  const Icon = ICONS[error.kind]

  return (
    <div className="pc-repo-error">
      <div className="pc-repo-error-icon" aria-hidden>
        <Icon size={22} strokeWidth={1.5} />
      </div>
      <h4 className="pc-repo-error-title pc-serif">Could not load the repository</h4>
      <p className="pc-repo-error-body">{error.message}</p>
      {onRetry && (
        <button type="button" className="pc-btn is-sm" onClick={onRetry}>
          <RefreshCw size={13} strokeWidth={1.6} />
          Try again
        </button>
      )}
    </div>
  )
}
