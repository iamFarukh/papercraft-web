import { Bell, ChevronRight, Search } from 'lucide-react'
import type { ReactNode } from 'react'

type TopbarProps = {
  crumbs: string[]
  notify?: boolean
  profileName?: string
  profileRole?: string
  profileInitials?: string
  actions?: ReactNode
}

export function Topbar({
  crumbs,
  notify = true,
  profileName = 'Aarav Kapoor',
  profileRole = 'Admin',
  profileInitials = 'AK',
  actions,
}: TopbarProps) {
  return (
    <header className="pc-topbar">
      <div className="pc-crumbs">
        {crumbs.map((crumb, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && (
              <span className="pc-crumbs-sep" aria-hidden>
                <ChevronRight size={12} strokeWidth={1.6} />
              </span>
            )}
            {i === crumbs.length - 1 ? <strong>{crumb}</strong> : <span>{crumb}</span>}
          </span>
        ))}
      </div>

      <div className="pc-cmd" role="search">
        <Search size={14} strokeWidth={1.6} />
        <span>Search questions, chapters, papers…</span>
        <kbd>⌘K</kbd>
      </div>

      <button type="button" className="pc-icon-btn" title="Notifications">
        <Bell size={15} strokeWidth={1.6} />
        {notify && <span className="pc-icon-btn-dot" aria-hidden />}
      </button>

      {actions}

      <div className="pc-topbar-profile">
        <div className="pc-avatar is-blue">{profileInitials}</div>
        <div className="pc-topbar-profile-meta">
          <div className="pc-foot-name">{profileName}</div>
          <div className="pc-foot-role">{profileRole}</div>
        </div>
      </div>
    </header>
  )
}
