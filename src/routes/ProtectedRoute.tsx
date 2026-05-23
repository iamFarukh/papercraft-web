import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AuthLoading } from '@/components/auth/AuthLoading'
import { ProfileSetupRequired } from '@/components/auth/ProfileSetupRequired'

export function ProtectedRoute() {
  const { user, bootstrapping, profile, profileReady } = useAuth()

  if (bootstrapping || (user && !profileReady && !profile)) {
    return <AuthLoading />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profileReady && !profile) {
    return <ProfileSetupRequired />
  }

  return <Outlet />
}
