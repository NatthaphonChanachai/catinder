import Hero from '../components/Hero'
import SwipeDemo from '../components/SwipeDemo'
import HowItWorks from '../components/HowItWorks'
import Features from '../components/Features'
import BreedSpotlight from '../components/BreedSpotlight'
import SocialProof from '../components/SocialProof'
import Waitlist from '../components/Waitlist'
import Footer from '../components/Footer'

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <SwipeDemo />
      <HowItWorks />
      <Features />
      <BreedSpotlight />
      <SocialProof />
      <Waitlist />
      <Footer />
    </main>
  )
}
