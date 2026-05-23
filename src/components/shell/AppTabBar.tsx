import { Archive, Bookmark, Home } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { NAV_ROUTES } from '@/config/nav-routes'

const TABS = [
  { key: 'home', label: 'Home', icon: Home, to: NAV_ROUTES.home },
  { key: 'repo', label: 'Repository', icon: Archive, to: NAV_ROUTES.repo },
  { key: 'bookmarks', label: 'Bookmarks', icon: Bookmark, to: NAV_ROUTES.bookmarks },
] as const

export function AppTabBar() {
  return (
    <nav className="pc-tab-bar" aria-label="Main">
      {TABS.map((tab) => {
        const Icon = tab.icon
        return (
          <NavLink
            key={tab.key}
            to={tab.to}
            className={({ isActive }) =>
              'pc-tab-bar-item' + (isActive ? ' is-active' : '')
            }
            end={tab.key === 'home'}
          >
            <Icon size={18} strokeWidth={1.6} />
            <span>{tab.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
