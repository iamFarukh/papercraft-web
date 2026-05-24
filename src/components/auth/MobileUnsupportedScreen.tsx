import { LogOut, MonitorSmartphone } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function MobileUnsupportedScreen() {
  const { logout, profile } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  const displayName =
    profile?.displayName?.trim() ||
    profile?.email?.split('@')[0] ||
    'Signed in'

  async function handleSignOut() {
    setBusy(true)
    try {
      await logout()
      navigate('/login', { replace: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pc-mobile-gate">
      <div className="pc-mobile-gate-card">
        <div className="pc-brand" style={{ padding: 0, marginBottom: 20 }}>
          <div className="pc-brand-mark" aria-hidden />
          <div>
            <div className="pc-brand-name">
              Paper<em>Craft</em>
            </div>
            <div className="pc-brand-sub">
              {profile?.role === 'teacher' ? 'Teacher Workspace' : 'Admin Workspace'}
            </div>
          </div>
        </div>

        <div className="pc-mobile-gate-icon" aria-hidden>
          <MonitorSmartphone size={28} strokeWidth={1.5} />
        </div>

        <p className="pc-mobile-gate-kicker">Desktop &amp; tablet required</p>
        <h1 className="pc-mobile-gate-title pc-serif">
          PaperCraft isn&apos;t available on phones yet
        </h1>
        <p className="pc-mobile-gate-lead">
          You&apos;re signed in as <strong>{displayName}</strong>. The full workspace
          needs a larger screen — repository, paper builder, curriculum, and print
          layouts are built for desktop and tablet widths.
        </p>
        <p className="pc-mobile-gate-note">
          Mobile support is planned for a future release. For now, open PaperCraft on
          a laptop, desktop, or tablet in landscape.
        </p>

        <button
          type="button"
          className="pc-btn is-primary"
          onClick={() => void handleSignOut()}
          disabled={busy}
        >
          <LogOut size={14} strokeWidth={1.6} />
          {busy ? 'Signing out…' : 'Sign out'}
        </button>

        <p className="pc-mobile-gate-foot">
          Wider window? Resize your browser or rotate your device, then refresh.
        </p>
      </div>
    </div>
  )
}
