import { AppShell } from '@/components/shell/AppShell'
import { ControlCenterWorkspace } from '@/components/workspace/ControlCenterWorkspace'

export function AppPage() {
  return (
    <AppShell
      activeNav="home"
      crumbs={['Saraswati Vidya Niketan', 'Control Center']}
    >
      <ControlCenterWorkspace />
    </AppShell>
  )
}
