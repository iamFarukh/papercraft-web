import type { UserRole } from '@/services/firebase/users'

export type ProfileModuleAccess = {
  key: string
  label: string
  enabled: boolean
  note?: string
}

export function profileModulesForRole(role: UserRole): ProfileModuleAccess[] {
  const isAdmin = role === 'admin'
  return [
    {
      key: 'repository',
      label: 'Repository',
      enabled: true,
      note: isAdmin ? 'Full catalogue' : 'Assigned scope',
    },
    {
      key: 'builder',
      label: 'Paper Builder',
      enabled: true,
    },
    {
      key: 'papers',
      label: 'Paper Library',
      enabled: true,
    },
    {
      key: 'blueprints',
      label: 'Blueprints',
      enabled: true,
      note: isAdmin ? 'Author & manage' : 'Use presets',
    },
    {
      key: 'approvals',
      label: 'Approvals',
      enabled: isAdmin,
    },
    {
      key: 'curriculum',
      label: 'Curriculum',
      enabled: isAdmin,
    },
    {
      key: 'teachers',
      label: 'Teachers',
      enabled: isAdmin,
    },
  ]
}

export function profileAccessLevel(role: UserRole): string {
  return role === 'admin' ? 'Institution administrator' : 'Faculty contributor'
}

export function profilePermissions(role: UserRole): string[] {
  if (role === 'admin') {
    return [
      'Manage question repository',
      'Review and approve papers',
      'Configure blueprints and curriculum',
      'Provision teacher accounts',
    ]
  }
  return [
    'Browse assigned repository scope',
    'Compose and submit examination papers',
    'Use institutional blueprint presets',
    'Track personal paper submissions',
  ]
}
