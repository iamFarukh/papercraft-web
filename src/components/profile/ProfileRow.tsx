import type { ReactNode } from 'react'

type Props = {
  label: string
  hint?: string
  children: ReactNode
  action?: ReactNode
}

export function ProfileRow({ label, hint, children, action }: Props) {
  return (
    <div className="pc-profile-row">
      <div className="pc-profile-row-label">
        <span>{label}</span>
        {hint ? <small>{hint}</small> : null}
      </div>
      <div className="pc-profile-row-field">{children}</div>
      {action ? <div className="pc-profile-row-action">{action}</div> : null}
    </div>
  )
}
