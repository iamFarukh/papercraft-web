import { useState, type ReactNode } from 'react'
import { CommandPalette } from '@/components/command-center/CommandPalette'
import { ConnectivityBanner } from '@/components/ui/ConnectivityBanner'
import { useTeacherScope } from '@/hooks/useTeacherScope'
import { AppTabBar } from './AppTabBar'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

type AppShellProps = {
  children: ReactNode
  activeNav?: string
  crumbs: string[]
  topbarActions?: ReactNode
}

export function AppShell({
  children,
  activeNav = 'home',
  crumbs,
  topbarActions,
}: AppShellProps) {
  const { isScoped, isActive, hasAssignments, hasFullAccess } = useTeacherScope()
  const showInactiveBanner = isScoped && (!isActive || (!hasAssignments && !hasFullAccess))
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('pc-sidebar-collapsed') === '1'
    } catch {
      return false
    }
  })

  function handleToggleSidebar() {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('pc-sidebar-collapsed', next ? '1' : '0')
      } catch {
        /* ignore storage in private mode */
      }
      return next
    })
  }

  return (
    <div className="pc-screen">
      <div className={'pc-shell' + (sidebarCollapsed ? ' is-sidebar-collapsed' : '')}>
        <Sidebar
          activeKey={activeNav}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={handleToggleSidebar}
        />
        <div className="pc-work">
          <Topbar crumbs={crumbs} actions={topbarActions} />
          <ConnectivityBanner />
          {showInactiveBanner ? (
            <p className="pc-teacher-inactive-banner" role="status">
              {!isActive
                ? 'Your account is inactive. Contact the examination office for access.'
                : 'No class or subject assignments yet. You cannot browse the repository or build papers until an administrator assigns your subjects.'}
            </p>
          ) : null}
          <div className="pc-work-body">{children}</div>
          <AppTabBar />
        </div>
      </div>
      <CommandPalette />
    </div>
  )
}
