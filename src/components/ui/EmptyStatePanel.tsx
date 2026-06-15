import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LottiePlayer } from '@/components/motion/LottiePlayer'
import { lottiePlacement, type LottieKey } from '@/lib/motion/lottie-assets'

export type EmptyStateAction =
  | {
      kind: 'button'
      label: string
      onClick: () => void
      primary?: boolean
      disabled?: boolean
    }
  | {
      kind: 'link'
      label: string
      to: string
      primary?: boolean
    }

export type EmptyStateStep = {
  number: number
  content: ReactNode
}

type Props = {
  icon: LucideIcon
  title: string
  description: string
  steps?: EmptyStateStep[]
  hint?: string
  actions?: EmptyStateAction[]
  variant?: 'default' | 'error'
  wide?: boolean
  className?: string
  /**
   * Optional Lottie placement. When its asset is supplied (and motion is
   * allowed) it replaces the icon; otherwise the icon shows as the fallback.
   */
  lottie?: LottieKey
}

export function EmptyStatePanel({
  icon: Icon,
  title,
  description,
  steps,
  hint,
  actions = [],
  variant = 'default',
  wide,
  className = '',
  lottie,
}: Props) {
  const placement = lottie ? lottiePlacement(lottie) : null
  const panelClass = [
    'pc-empty-panel',
    variant === 'error' ? 'is-error' : '',
    wide ? 'is-wide' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={panelClass}>
      <div className="pc-empty-panel__icon" aria-hidden={!placement?.src}>
        {placement?.src ? (
          <LottiePlayer
            src={placement.src}
            loop={placement.loop}
            ariaLabel={placement.label}
            className="pc-empty-panel__lottie"
            fallback={<Icon size={26} strokeWidth={1.5} />}
          />
        ) : (
          <Icon size={26} strokeWidth={1.5} />
        )}
      </div>
      <h2 className="pc-empty-panel__title">{title}</h2>
      <p className="pc-empty-panel__text">{description}</p>
      {hint ? <p className="pc-empty-panel__hint">{hint}</p> : null}
      {steps && steps.length > 0 ? (
        <ol className="pc-empty-panel__steps">
          {steps.map((step) => (
            <li key={step.number}>
              <span className="pc-empty-panel__step-num pc-num">{step.number}</span>
              <span>{step.content}</span>
            </li>
          ))}
        </ol>
      ) : null}
      {actions.length > 0 ? (
        <div className="pc-empty-panel__actions">
          {actions.map((action) =>
            action.kind === 'link' ? (
              <Link
                key={action.label}
                to={action.to}
                className={`pc-btn is-sm${action.primary ? ' is-primary' : ''}`}
              >
                {action.label}
              </Link>
            ) : (
              <button
                key={action.label}
                type="button"
                className={`pc-btn is-sm${action.primary ? ' is-primary' : ''}`}
                disabled={action.disabled}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  )
}
