import { Bell, ChevronRight, Search } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNotifications } from '@/context/NotificationContext'
import { NotificationPanel } from '@/components/notifications/NotificationPanel'

type TopbarProps = {
  crumbs: string[]
  actions?: ReactNode
}

export function Topbar({ crumbs, actions }: TopbarProps) {
  const { user, profile, isAdmin } = useAuth()
  const { unreadCount } = useNotifications()
  const [panelOpen, setPanelOpen] = useState(false)

  const profileName =
    profile?.displayName ||
    user?.displayName ||
    user?.email?.split('@')[0] ||
    'User'
  const profileRole = isAdmin ? 'Administrator' : 'Teacher'
  const profileInitials = profileName
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
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

        <button
          type="button"
          className="pc-icon-btn"
          title="Notifications"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : 'Notifications'
          }
          onClick={() => setPanelOpen(true)}
        >
          <Bell size={15} strokeWidth={1.6} />
          {unreadCount > 0 ? <span className="pc-icon-btn-dot" aria-hidden /> : null}
        </button>

        {actions}

        <div className="pc-topbar-profile">
          <div className="pc-avatar is-blue">{profileInitials || 'PC'}</div>
          <div className="pc-topbar-profile-meta">
            <div className="pc-foot-name">{profileName}</div>
            <div className="pc-foot-role">{profileRole}</div>
          </div>
        </div>
      </header>

      <NotificationPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  )
}
