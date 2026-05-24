import { useMemo } from 'react'
import { useWorkspaceSettings } from '@/context/WorkspaceSettingsContext'
import type { SchoolBranding } from '@/lib/paper-builder'

export function useSchoolBranding(): SchoolBranding {
  const { schoolName, schoolTagline, schoolLogoURL } = useWorkspaceSettings()
  return useMemo(
    () => ({ schoolName, schoolTagline, schoolLogoURL }),
    [schoolName, schoolTagline, schoolLogoURL],
  )
}
