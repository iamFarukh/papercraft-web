import { ChevronDown, LogOut, Settings } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { ADMIN_NAV } from '@/config/admin-nav'
import { NAV_ROUTES } from '@/config/nav-routes'
import { useBookmarks } from '@/context/BookmarkContext'
import { useQuestionCount } from '@/context/QuestionCountContext'

type SidebarProps = {
  activeKey?: string
  session?: string
  footName?: string
  footRole?: string
  footInitials?: string
}

export function Sidebar({
  activeKey: _activeKey = 'home',
  session = '2025–26 · Term II',
  footName = 'Aarav Kapoor',
  footRole = 'Vice Principal · Admin',
  footInitials = 'AK',
}: SidebarProps) {
  const { logout, user, role } = useAuth()
  const navigate = useNavigate()
  const { formattedCount } = useQuestionCount()
  const { folders } = useBookmarks()
  const bookmarkedQuestionTotal = folders.reduce(
    (sum, f) => sum + Math.max(0, f.questionCount),
    0,
  )

  const displayName =
    user?.displayName || user?.email?.split('@')[0] || footName
  const displayRole = role === 'admin' ? footRole : 'Teacher'
  const initials =
    footInitials ||
    displayName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="pc-sidebar">
      <div className="pc-brand">
        <div className="pc-brand-mark" aria-hidden />
        <div>
          <div className="pc-brand-name">
            Paper<em>Craft</em>
          </div>
          <div className="pc-brand-sub">Admin Workspace</div>
        </div>
      </div>

      <div className="pc-session-pill" role="button" tabIndex={0}>
        <span className="pc-session-pill-dot" aria-hidden />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span className="pc-session-pill-label">Session</span>
          <span className="pc-session-pill-value">{session}</span>
        </div>
        <span className="pc-session-pill-chev" aria-hidden>
          <ChevronDown size={14} strokeWidth={1.6} />
        </span>
      </div>

      <nav className="pc-nav" aria-label="Main">
        {ADMIN_NAV.map((group, gi) => (
          <div className="pc-nav-group" key={gi}>
            {group.section && (
              <div className="pc-nav-label">{group.section}</div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon
              const to = NAV_ROUTES[item.key] ?? '/app'
              if (item.disabled) {
                return (
                  <div
                    key={item.key}
                    className="pc-nav-item is-disabled"
                    title={`${item.label} (Coming soon)`}
                  >
                    <Icon size={15} strokeWidth={1.6} />
                    <span>{item.label}</span>
                    {item.badge && item.badge !== 'dynamic' && (
                      <span className="pc-nav-item-badge">{item.badge}</span>
                    )}
                  </div>
                )
              }
              return (
                <NavLink
                  key={item.key}
                  to={to}
                  className={({ isActive }) =>
                    'pc-nav-item' + (isActive ? ' is-active' : '')
                  }
                  end={item.key === 'home'}
                  style={{ position: 'relative' }}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="active-sidebar-indicator"
                          className="pc-nav-active-bg"
                          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                        />
                      )}
                      <Icon size={15} strokeWidth={1.6} style={{ position: 'relative', zIndex: 2 }} />
                      <span style={{ position: 'relative', zIndex: 2 }}>{item.label}</span>
                      {(item.badge === 'dynamic' ||
                        (item.key === 'bookmarks' && bookmarkedQuestionTotal > 0)) && (
                        <span
                          className="pc-nav-item-badge"
                          style={{ position: 'relative', zIndex: 2 }}
                        >
                          {item.badge === 'dynamic'
                            ? formattedCount
                            : String(bookmarkedQuestionTotal)}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="pc-sidebar-foot">
        <div className="pc-avatar is-blue">{initials}</div>
        <div style={{ lineHeight: 1.2, minWidth: 0, flex: 1 }}>
          <div className="pc-foot-name">{displayName}</div>
          <div className="pc-foot-role">{displayRole}</div>
        </div>
        <button
          type="button"
          className="pc-sidebar-logout"
          onClick={handleLogout}
          title="Sign out"
        >
          <LogOut size={15} strokeWidth={1.6} />
        </button>
        <button
          type="button"
          className="pc-sidebar-settings"
          title="Settings"
          aria-label="Settings"
        >
          <Settings size={14} strokeWidth={1.6} />
        </button>
      </div>
    </aside>
  )
}
