import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  padded?: boolean
}

/** Settings card shell — matches paperCraftUIDesign AccountScreens. */
export function ProfileCard({
  title,
  subtitle,
  action,
  children,
  padded = true,
}: Props) {
  return (
    <section className="pc-profile-card">
      <header className="pc-profile-card-head">
        <div className="pc-profile-card-head-text">
          <h2 className="pc-profile-card-title pc-serif">{title}</h2>
          {subtitle ? <p className="pc-profile-card-sub">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      <div className={padded ? 'pc-profile-card-body' : 'pc-profile-card-body is-flush'}>
        {children}
      </div>
    </section>
  )
}
