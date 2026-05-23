import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AuthLoading } from '@/components/auth/AuthLoading'

/** Restricts child routes to administrators. */
export function AdminRoute() {
  const { isAdmin, loading } = useAuth()

  if (loading) return <AuthLoading />

  if (!isAdmin) {
    return <Navigate to="/app/repository" replace />
  }

  return <Outlet />
}
