import type { ReactNode } from 'react'
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
  return (
    <div className="pc-screen">
      <div className="pc-shell">
        <Sidebar activeKey={activeNav} />
        <div className="pc-work">
          <Topbar crumbs={crumbs} actions={topbarActions} />
          <div className="pc-work-body">{children}</div>
          <AppTabBar />
        </div>
      </div>
    </div>
  )
}
