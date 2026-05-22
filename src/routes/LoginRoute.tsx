import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AuthLoading } from '@/components/auth/AuthLoading'
import { LoginScreen } from '@/screens/auth/LoginScreen'

export function LoginRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <AuthLoading />
  }

  if (user) {
    return <Navigate to="/app" replace />
  }

  return <LoginScreen />
}
