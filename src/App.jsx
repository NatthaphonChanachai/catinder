import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import AuthModal from './components/AuthModal'
import OnboardingQuiz from './components/OnboardingQuiz'
import NotificationPrompt from './components/NotificationPrompt'
import ProfileSetupModal from './components/ProfileSetupModal'
import Navbar from './components/Navbar'
import AppNavbar from './components/AppNavbar'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import DiscoverPage from './pages/DiscoverPage'
import MyCatsPage from './pages/MyCatsPage'
import CreateCatPage from './pages/CreateCatPage'
import HealthPassportPage from './pages/HealthPassportPage'
import ChatPage from './pages/ChatPage'
import DirectoryPage from './pages/DirectoryPage'
import AdminPage from './pages/AdminPage'
import { PawPrint } from 'lucide-react'

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Space Grotesk, sans-serif', backgroundColor: '#fff',
    }}>
      <div style={{ textAlign: 'center' }}>
        <PawPrint size={40} color="#F97316" style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 14, color: '#aaa', fontWeight: 600 }}>กำลังโหลด...</p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />

  return (
    <>
      <AuthModal />
      <ProfileSetupModal />
      <OnboardingQuiz />
      <NotificationPrompt />

      <Routes>
        <Route path="/" element={
          user ? <Navigate to="/dashboard" replace /> : (
            <div style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <Navbar />
              <LandingPage />
            </div>
          )
        } />

        <Route path="/dashboard" element={<ProtectedRoute><AppNavbar /><DashboardPage /></ProtectedRoute>} />
        <Route path="/discover" element={<ProtectedRoute><AppNavbar /><DiscoverPage /></ProtectedRoute>} />
        <Route path="/my-cats" element={<ProtectedRoute><AppNavbar /><MyCatsPage /></ProtectedRoute>} />
        <Route path="/my-cats/new" element={<ProtectedRoute><AppNavbar /><CreateCatPage /></ProtectedRoute>} />
        <Route path="/my-cats/:catId/edit" element={<ProtectedRoute><AppNavbar /><CreateCatPage /></ProtectedRoute>} />
        <Route path="/my-cats/:catId/health" element={<ProtectedRoute><AppNavbar /><HealthPassportPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><AppNavbar /><ChatPage /></ProtectedRoute>} />
        <Route path="/chat/:chatId" element={<ProtectedRoute><AppNavbar /><ChatPage /></ProtectedRoute>} />

        <Route path="/directory" element={
          <>{user ? <AppNavbar /> : <Navbar />}<DirectoryPage /></>
        } />

        <Route path="/admin" element={<ProtectedRoute><AppNavbar /><AdminPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
