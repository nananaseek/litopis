import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout/Layout'
import ArsenalPage from './pages/ArsenalPage'
import ToolDetailPage from './pages/ToolDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import LandingPage from './pages/LandingPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen text-lg text-slate-500">Завантаження...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <div className="flex items-center justify-center min-h-screen text-lg text-slate-500">Завантаження...</div>

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/arsenal" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/arsenal" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/arsenal" replace /> : <RegisterPage />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/arsenal" element={<ArsenalPage />} />
        <Route path="/tools/:id" element={<ToolDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/arsenal' : '/'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
