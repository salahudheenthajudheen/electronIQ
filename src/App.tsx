import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Login, Register, Onboarding, RoleGuard } from '@/auth'
import { StudentDashboard } from '@/student/StudentDashboard'
import { TeacherPanel } from '@/teacher/TeacherPanel'
import { AdminPanel } from '@/admin/AdminPanel'
import { Phase1Page } from '@/phases/phase1/Phase1Page'
import { Phase2Page } from '@/phases/phase2/Phase2Page'
import { Phase3Page } from '@/phases/phase3/Phase3Page'
import { Phase4Page } from '@/phases/phase4/Phase4Page'
import { ToastContainer } from '@/components/ui/toast'

function App() {
  const { loadProfile, loading } = useAuthStore()

  useEffect(() => {
    loadProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center text-text-primary">
        Loading...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />

        <Route
          path="/student/dashboard"
          element={
            <RoleGuard allowedRoles={['student']}>
              <StudentDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/student/phase1"
          element={
            <RoleGuard allowedRoles={['student']}>
              <Phase1Page />
            </RoleGuard>
          }
        />
        <Route
          path="/student/phase2"
          element={
            <RoleGuard allowedRoles={['student']}>
              <Phase2Page />
            </RoleGuard>
          }
        />
        <Route
          path="/student/phase3"
          element={
            <RoleGuard allowedRoles={['student']}>
              <Phase3Page />
            </RoleGuard>
          }
        />
        <Route
          path="/student/phase4"
          element={
            <RoleGuard allowedRoles={['student']}>
              <Phase4Page />
            </RoleGuard>
          }
        />

        <Route
          path="/teacher/*"
          element={
            <RoleGuard allowedRoles={['teacher']}>
              <TeacherPanel />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/*"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <AdminPanel />
            </RoleGuard>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
