import { ChevronDown, Settings } from 'lucide-react'
import { ADMIN_NAV } from '@/config/admin-nav'

type SidebarProps = {
  activeKey?: string
  session?: string
  footName?: string
  footRole?: string
  footInitials?: string
}

export function Sidebar({
  activeKey = 'home',
  session = '2025–26 · Term II',
  footName = 'Aarav Kapoor',
  footRole = 'Vice Principal · Admin',
  footInitials = 'AK',
}: SidebarProps) {
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
              const isActive = activeKey === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  className={'pc-nav-item' + (isActive ? ' is-active' : '')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={15} strokeWidth={1.6} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="pc-nav-item-badge">{item.badge}</span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="pc-sidebar-foot">
        <div className="pc-avatar is-blue">{footInitials}</div>
        <div style={{ lineHeight: 1.2, minWidth: 0 }}>
          <div className="pc-foot-name">{footName}</div>
          <div className="pc-foot-role">{footRole}</div>
        </div>
        <div style={{ marginLeft: 'auto', color: 'var(--pc-ink-4)' }}>
          <Settings size={14} strokeWidth={1.6} />
        </div>
      </div>
    </aside>
  )
}
