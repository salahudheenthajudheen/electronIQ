import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Register, AdminLogin, RoleGuard } from '@/auth'
import { StudentDashboard } from '@/student/StudentDashboard'
import { TeacherPanel } from '@/teacher/TeacherPanel'
import { AdminPanel } from '@/admin/AdminPanel'
import { Phase1Page } from '@/phases/phase1/Phase1Page'
import { Phase2Page } from '@/phases/phase2/Phase2Page'
import { Phase3Page } from '@/phases/phase3/Phase3Page'
import { Phase4Page } from '@/phases/phase4/Phase4Page'
import ModulePhasePage from '@/phases/ModulePhasePage'
import { ToastContainer } from '@/components/ui/toast'

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/onboarding" element={<Navigate to="/register" replace />} />

        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/phase1" element={<Phase1Page />} />
        <Route path="/student/phase2" element={<Phase2Page />} />
        <Route path="/student/phase3" element={<Phase3Page />} />
        <Route path="/student/phase4" element={<Phase4Page />} />
        <Route path="/student/module/:moduleId/phase/:phaseNum" element={<ModulePhasePage />} />

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

        <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
