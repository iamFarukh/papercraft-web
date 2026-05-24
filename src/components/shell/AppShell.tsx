import type { ReactNode } from 'react'
import { CommandPalette } from '@/components/command-center/CommandPalette'
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

  return (
    <div className="pc-screen">
      <div className="pc-shell">
        <Sidebar activeKey={activeNav} />
        <div className="pc-work">
          <Topbar crumbs={crumbs} actions={topbarActions} />
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
