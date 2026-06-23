import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface RoleGuardProps {
  allowedRoles: ('student' | 'teacher' | 'admin')[]
  children: React.ReactNode
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { profile, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center text-text-primary">
        Loading...
      </div>
    )
  }

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to={`/${profile.role}/dashboard`} replace />
  }

  return <>{children}</>
}
