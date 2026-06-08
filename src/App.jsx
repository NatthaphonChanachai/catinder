import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import AuthModal from './components/AuthModal'
import OnboardingQuiz from './components/OnboardingQuiz'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import SwipeDemo from './components/SwipeDemo'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import BreedSpotlight from './components/BreedSpotlight'
import SocialProof from './components/SocialProof'
import Waitlist from './components/Waitlist'
import Footer from './components/Footer'

function AppContent() {
  return (
    <div style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      <Navbar />
      {/* Auth modal & quiz sit outside the page flow */}
      <AuthModal />
      <OnboardingQuiz />
      <main>
        <Hero />
        <SwipeDemo />
        <HowItWorks />
        <Features />
        <BreedSpotlight />
        <SocialProof />
        <Waitlist />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  )
}
