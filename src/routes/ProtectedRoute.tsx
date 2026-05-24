import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AuthLoading } from '@/components/auth/AuthLoading'
import { MobileUnsupportedScreen } from '@/components/auth/MobileUnsupportedScreen'
import { ProfileSetupRequired } from '@/components/auth/ProfileSetupRequired'
import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'

export function ProtectedRoute() {
  const { user, bootstrapping, profile, profileReady } = useAuth()
  const isMobile = useIsMobileViewport()

  if (bootstrapping || (user && !profileReady && !profile)) {
    return <AuthLoading />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profileReady && !profile) {
    return <ProfileSetupRequired />
  }

  if (isMobile) {
    return <MobileUnsupportedScreen />
  }

  return <Outlet />
}
