import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import AuthModal from './components/AuthModal'
import OnboardingQuiz from './components/OnboardingQuiz'
import NotificationPrompt from './components/NotificationPrompt'
import ProfileSetupModal from './components/ProfileSetupModal'
import Navbar from './components/Navbar'
import AppNavbar from './components/AppNavbar'
import ErrorBoundary from './components/ErrorBoundary'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import DiscoverPage from './pages/DiscoverPage'
import MyCatsPage from './pages/MyCatsPage'
import CreateCatPage from './pages/CreateCatPage'
import HealthPassportPage from './pages/HealthPassportPage'
import ChatPage from './pages/ChatPage'
import DirectoryPage from './pages/DirectoryPage'
import AdminPage from './pages/AdminPage'
import SupportChatPage from './pages/SupportChatPage'
import VenuePage from './pages/VenuePage'
import RegistriesPage from './pages/RegistriesPage'
import PedigreeFormPage from './pages/PedigreeFormPage'
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

// Resets the boundary on every navigation (including param-only changes) by remounting via `key`
function PageBoundary({ children }) {
  const location = useLocation()
  return <ErrorBoundary key={location.pathname} fullPage>{children}</ErrorBoundary>
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
              <PageBoundary><LandingPage /></PageBoundary>
            </div>
          )
        } />

        <Route path="/dashboard" element={<ProtectedRoute><AppNavbar /><PageBoundary><DashboardPage /></PageBoundary></ProtectedRoute>} />
        <Route path="/discover" element={<ProtectedRoute><AppNavbar /><PageBoundary><DiscoverPage /></PageBoundary></ProtectedRoute>} />
        <Route path="/my-cats" element={<ProtectedRoute><AppNavbar /><PageBoundary><MyCatsPage /></PageBoundary></ProtectedRoute>} />
        <Route path="/my-cats/new" element={<ProtectedRoute><AppNavbar /><PageBoundary><CreateCatPage /></PageBoundary></ProtectedRoute>} />
        <Route path="/my-cats/:catId/edit" element={<ProtectedRoute><AppNavbar /><PageBoundary><CreateCatPage /></PageBoundary></ProtectedRoute>} />
        <Route path="/my-cats/:catId/health" element={<ProtectedRoute><AppNavbar /><PageBoundary><HealthPassportPage /></PageBoundary></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><AppNavbar /><PageBoundary><ChatPage /></PageBoundary></ProtectedRoute>} />
        <Route path="/chat/:chatId" element={<ProtectedRoute><AppNavbar /><PageBoundary><ChatPage /></PageBoundary></ProtectedRoute>} />

        <Route path="/directory" element={
          <>{user ? <AppNavbar /> : <Navbar />}<PageBoundary><DirectoryPage /></PageBoundary></>
        } />

        <Route path="/admin" element={<ProtectedRoute><AppNavbar /><PageBoundary><AdminPage /></PageBoundary></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><AppNavbar /><PageBoundary><SupportChatPage /></PageBoundary></ProtectedRoute>} />
        <Route path="/venues" element={<ProtectedRoute><AppNavbar /><PageBoundary><VenuePage /></PageBoundary></ProtectedRoute>} />
        <Route path="/pedigree" element={<ProtectedRoute><AppNavbar /><PageBoundary><PedigreeFormPage /></PageBoundary></ProtectedRoute>} />
        <Route path="/registries" element={<>{user ? <AppNavbar /> : <Navbar />}<PageBoundary><RegistriesPage /></PageBoundary></>} />
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
