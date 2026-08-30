import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import { useAuth } from './context/AuthContext'
import { hasRole } from './utils/roles'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RegistrationsPage from './pages/RegistrationsPage'
import RegistrationDetailPage from './pages/RegistrationDetailPage'
import EventsPage from './pages/EventsPage'
import AttendancePage from './pages/AttendancePage'
import FixturesPage from './pages/FixturesPage'
import LiveStreamsPage from './pages/LiveStreamsPage'
import CertificatesPage from './pages/CertificatesPage'
import ReportsPage from './pages/ReportsPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AuditLogsPage from './pages/AuditLogsPage'
import EmailLogsPage from './pages/EmailLogsPage'
import NotFoundPage from './pages/NotFoundPage'
import ForbiddenPage from './pages/ForbiddenPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  return isAuthenticated ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

function RoleRoute({ roles, children, superOnly = false }) {
  const { role } = useAuth()
  const allowed = superOnly ? role === 'SUPER_ADMIN' : roles.length === 0 || hasRole(role, ...roles)
  return allowed ? children : <ForbiddenPage />
}

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="registrations" element={<RoleRoute roles={['REGISTRATION_ADMIN']}><RegistrationsPage /></RoleRoute>} />
        <Route path="registrations/:registrationId" element={<RoleRoute roles={['REGISTRATION_ADMIN']}><RegistrationDetailPage /></RoleRoute>} />
        <Route path="events" element={<RoleRoute roles={['REGISTRATION_ADMIN']}><EventsPage /></RoleRoute>} />
        <Route path="attendance" element={<RoleRoute roles={['ATTENDANCE_ADMIN']}><AttendancePage /></RoleRoute>} />
        <Route path="fixtures" element={<RoleRoute roles={['FIXTURE_ADMIN']}><FixturesPage /></RoleRoute>} />
        <Route path="live-streams" element={<RoleRoute roles={['FIXTURE_ADMIN']}><LiveStreamsPage /></RoleRoute>} />
        <Route path="certificates" element={<RoleRoute roles={['CERTIFICATE_ADMIN']}><CertificatesPage /></RoleRoute>} />
        <Route path="reports" element={<RoleRoute roles={['REGISTRATION_ADMIN']}><ReportsPage /></RoleRoute>} />
        <Route path="admin-users" element={<RoleRoute roles={[]} superOnly><AdminUsersPage /></RoleRoute>} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="email-logs" element={<EmailLogsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
