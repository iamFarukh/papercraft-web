import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { schoolBrandingFromSettings } from '@/lib/workspace-settings-defaults'
import { subscribeWorkspaceSettings } from '@/services/firebase/workspace-settings'
import type { WorkspaceSettings } from '@/types/workspace-settings'
import { DEFAULT_WORKSPACE_SETTINGS } from '@/lib/workspace-settings-defaults'

type WorkspaceSettingsContextValue = {
  settings: WorkspaceSettings
  ready: boolean
  schoolName: string
  schoolTagline: string
  schoolLogoURL: string | null
}

const WorkspaceSettingsContext = createContext<WorkspaceSettingsContextValue>({
  settings: DEFAULT_WORKSPACE_SETTINGS,
  ready: false,
  schoolName: DEFAULT_WORKSPACE_SETTINGS.identity.schoolName,
  schoolTagline: DEFAULT_WORKSPACE_SETTINGS.identity.tagline,
  schoolLogoURL: null,
})

export function WorkspaceSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<WorkspaceSettings>(
    DEFAULT_WORKSPACE_SETTINGS,
  )
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const unsub = subscribeWorkspaceSettings(
      (next) => {
        setSettings(next)
        setReady(true)
      },
      () => {
        setReady(true)
      },
    )
    return unsub
  }, [])

  const branding = useMemo(() => schoolBrandingFromSettings(settings), [settings])

  const value = useMemo(
    () => ({
      settings,
      ready,
      schoolName: branding.schoolName,
      schoolTagline: branding.schoolTagline,
      schoolLogoURL: branding.schoolLogoURL,
    }),
    [settings, ready, branding],
  )

  return (
    <WorkspaceSettingsContext.Provider value={value}>
      {children}
    </WorkspaceSettingsContext.Provider>
  )
}

export function useWorkspaceSettings() {
  return useContext(WorkspaceSettingsContext)
}
