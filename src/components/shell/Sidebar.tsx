import { ChevronDown, ChevronRight, LogOut, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAuth } from '@/context/AuthContext'
import { listApprovalQueue } from '@/services/firebase/papers'
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
  collapsed?: boolean
  onToggleCollapsed?: () => void
}

export function Sidebar({
  activeKey: _activeKey = 'home',
  session = '2025–26 · Term II',
  footName = 'Aarav Kapoor',
  footRole = 'Vice Principal · Admin',
  footInitials = 'AK',
  collapsed = false,
  onToggleCollapsed,
}: SidebarProps) {
  const { logout, user, profile, isAdmin } = useAuth()
  const [approvalPending, setApprovalPending] = useState(0)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [logoutBusy, setLogoutBusy] = useState(false)

  useEffect(() => {
    if (!isAdmin) return
    let cancelled = false
    listApprovalQueue()
      .then((rows) => {
        if (!cancelled) {
          setApprovalPending(rows.filter((r) => r.status === 'submitted').length)
        }
      })
      .catch(() => {
        if (!cancelled) setApprovalPending(0)
      })
    return () => {
      cancelled = true
    }
  }, [isAdmin])
  const navigate = useNavigate()
  const { formattedCount, loading: questionCountLoading } = useQuestionCount()
  const { folders } = useBookmarks()
  const bookmarkedQuestionTotal = folders.reduce(
    (sum, f) => sum + Math.max(0, f.questionCount),
    0,
  )

  const displayName =
    user?.displayName || user?.email?.split('@')[0] || footName
  const displayRole = profile?.role === 'teacher' ? 'Teacher' : footRole
  const initials =
    footInitials ||
    displayName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  async function confirmLogout() {
    setLogoutBusy(true)
    try {
      await logout()
      navigate('/login', { replace: true })
    } finally {
      setLogoutBusy(false)
      setLogoutOpen(false)
    }
  }

  return (
    <>
    <aside className={'pc-sidebar' + (collapsed ? ' is-collapsed' : '')}>
      <div className="pc-brand">
        <div className="pc-brand-mark" aria-hidden />
        {!collapsed ? (
          <div>
            <div className="pc-brand-name">
              Paper<em>Craft</em>
            </div>
            <div className="pc-brand-sub">
              {profile?.role === 'teacher' ? 'Teacher Workspace' : 'Admin Workspace'}
            </div>
          </div>
        ) : null}
        <button
          type="button"
          className="pc-sidebar-collapse-btn"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronRight size={14} strokeWidth={1.9} />
        </button>
      </div>

      <div
        className="pc-session-pill"
        role="button"
        tabIndex={0}
        title={collapsed ? session : undefined}
      >
        <span className="pc-session-pill-dot" aria-hidden />
        {!collapsed ? (
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span className="pc-session-pill-label">Session</span>
            <span className="pc-session-pill-value">{session}</span>
          </div>
        ) : null}
        <span className="pc-session-pill-chev" aria-hidden>
          <ChevronDown size={14} strokeWidth={1.6} />
        </span>
      </div>

      <nav className="pc-nav" aria-label="Main">
        {ADMIN_NAV.map((group, gi) => {
          const items = group.items.filter((item) => {
            if (item.key === 'approval' && !isAdmin) return false
            if (group.section === 'Organization' && !isAdmin) return false
            return true
          })
          if (items.length === 0) return null

          return (
          <div className="pc-nav-group" key={gi}>
            {group.section && (
              <div className="pc-nav-label">{group.section}</div>
            )}
            {items.map((item) => {
              const Icon = item.icon
              const to = NAV_ROUTES[item.key] ?? '/app'
              return (
                (() => {
                  const shouldShowCountInTooltip =
                    item.badge === 'dynamic' ||
                    (item.key === 'approval' && approvalPending > 0) ||
                    (item.key === 'bookmarks' && bookmarkedQuestionTotal > 0)
                  const badgeCount = shouldShowCountInTooltip
                    ? item.key === 'approval'
                      ? String(approvalPending)
                      : item.badge === 'dynamic'
                        ? formattedCount
                        : String(bookmarkedQuestionTotal)
                    : null
                  const tooltipText =
                    collapsed && badgeCount !== null
                      ? `${item.label} (${badgeCount})`
                      : item.label
                  return (
                <NavLink
                  key={item.key}
                  to={to}
                  className={({ isActive }) =>
                    'pc-nav-item' + (isActive ? ' is-active' : '')
                  }
                  end={item.key === 'home'}
                  style={{ position: 'relative' }}
                  title={collapsed ? tooltipText : undefined}
                  data-tooltip={collapsed ? tooltipText : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="active-sidebar-indicator"
                          className="pc-nav-active-bg"
                          transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.85 }}
                        />
                      )}
                      <Icon size={15} strokeWidth={1.6} style={{ position: 'relative', zIndex: 2 }} />
                      {!collapsed ? (
                        <span style={{ position: 'relative', zIndex: 2 }}>{item.label}</span>
                      ) : null}
                      {!collapsed &&
                        (item.badge === 'dynamic' ||
                          (item.key === 'approval' && approvalPending > 0) ||
                          (item.key === 'bookmarks' && bookmarkedQuestionTotal > 0)) && (
                        <span
                          className={
                            'pc-nav-item-badge' +
                            (item.badge === 'dynamic' && questionCountLoading
                              ? ' is-loading'
                              : '')
                          }
                          style={{ position: 'relative', zIndex: 2 }}
                          aria-label={
                            item.badge === 'dynamic'
                              ? `Question count ${formattedCount}`
                              : undefined
                          }
                        >
                          {badgeCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
                  )
                })()
              )
            })}
          </div>
          )
        })}
      </nav>

      <div className="pc-sidebar-foot">
        <div className="pc-avatar is-blue" title={displayName}>
          {initials}
        </div>
        {!collapsed ? (
          <div style={{ lineHeight: 1.2, minWidth: 0, flex: 1 }}>
            <div className="pc-foot-name">{displayName}</div>
            <div className="pc-foot-role">{displayRole}</div>
          </div>
        ) : null}
        <div className="pc-sidebar-foot-actions">
          <button
            type="button"
            className="pc-sidebar-logout"
            onClick={() => setLogoutOpen(true)}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={15} strokeWidth={1.6} />
          </button>
          <NavLink
            to={NAV_ROUTES.profile}
            className={({ isActive }) =>
              'pc-sidebar-settings' + (isActive ? ' is-active' : '')
            }
            title="My profile"
            aria-label="My profile"
          >
            <Settings size={14} strokeWidth={1.6} />
          </NavLink>
        </div>
      </div>
    </aside>

    <ConfirmDialog
      open={logoutOpen}
      title="Sign out of PaperCraft?"
      description="You will return to the sign-in screen. Your saved login ID stays on this device if you use Remember me."
      confirmLabel="Sign out"
      cancelLabel="Cancel"
      tone="danger"
      busy={logoutBusy}
      onCancel={() => setLogoutOpen(false)}
      onConfirm={() => void confirmLogout()}
    />
    </>
  )
}
