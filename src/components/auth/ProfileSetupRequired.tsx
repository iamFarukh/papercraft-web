import { LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

/** Shown when Firebase Auth succeeded but users/{uid} is missing or misconfigured. */
export function ProfileSetupRequired() {
  const { user, logout } = useAuth()
  const loginId = user?.email ?? 'your login ID'

  return (
    <div className="pc-auth-loading">
      <div className="pc-profile-setup-card">
        <p className="pc-profile-setup-kicker">Account setup required</p>
        <h1 className="pc-profile-setup-title">Your profile is not ready yet</h1>
        <p className="pc-profile-setup-lead">
          You signed in as <strong>{loginId}</strong>, but PaperCraft does not have a
          teacher or administrator profile for this account.
        </p>
        <ul className="pc-profile-setup-list">
          <li>
            If you are a <strong>teacher</strong>, ask your school admin to add you under
            Organization → Teachers and set your initial password, then sign in again.
          </li>
          <li>
            If you are an <strong>administrator</strong>, set{' '}
            <code>role: &quot;admin&quot;</code> on your user document in the Firebase
            console (<code>users/{'{your uid}'}</code>).
          </li>
        </ul>
        <button type="button" className="pc-btn is-primary" onClick={() => void logout()}>
          <LogOut size={14} strokeWidth={1.6} />
          Sign out
        </button>
      </div>
    </div>
  )
}
