import { Check, X } from 'lucide-react'
import { m } from 'framer-motion'
import {
  profileAccessLevel,
  profileModulesForRole,
  profilePermissions,
} from '@/lib/profile-modules'
import { PC_TRANSITION } from '@/lib/motion/tokens'
import type { UserRole } from '@/services/firebase/users'

type Props = {
  role: UserRole
  embedded?: boolean
}

export function ProfileWorkspaceAccess({ role, embedded }: Props) {
  const modules = profileModulesForRole(role)
  const permissions = profilePermissions(role)

  const grid = (
      <ul className="pc-profile-module-grid">
        {modules.map((mod) => (
          <li
            key={mod.key}
            className={
              'pc-profile-module' + (mod.enabled ? ' is-on' : ' is-off')
            }
          >
            <span className="pc-profile-module-icon" aria-hidden>
              {mod.enabled ? (
                <Check size={13} strokeWidth={1.8} />
              ) : (
                <X size={13} strokeWidth={1.8} />
              )}
            </span>
            <span className="pc-profile-module-label">{mod.label}</span>
            {mod.note ? (
              <span className="pc-profile-module-note">{mod.note}</span>
            ) : null}
          </li>
        ))}
      </ul>
  )

  if (embedded) {
    return <div className="pc-profile-modules-embedded">{grid}</div>
  }

  return (
    <m.section
      className="pc-profile-panel"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...PC_TRANSITION.panel, delay: 0.04 }}
    >
      <h3 className="pc-profile-section-title">Workspace</h3>
      <p className="pc-profile-section-lead">
        Access level: <strong>{profileAccessLevel(role)}</strong>
      </p>
      {grid}
      <h4 className="pc-profile-subhead">Assigned permissions</h4>
      <ul className="pc-profile-perm-list">
        {permissions.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </m.section>
  )
}
