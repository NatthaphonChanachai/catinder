import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { Zap, MessageCircle, Heart, MapPin } from 'lucide-react'

const FEATURE_PILLS = [
  { icon: Heart, label: 'Swipe จับคู่' },
  { icon: MessageCircle, label: 'แชทโดยตรง' },
  { icon: Zap, label: 'Health & Pedigree' },
  { icon: MapPin, label: 'Venue Booking' },
]

export default function Waitlist() {
  const { t } = useLanguage()
  const { user, openAuthModal } = useAuth()

  return (
    <section id="waitlist" style={{
      padding: '96px 24px',
      background: 'linear-gradient(135deg, #F97316 0%, #F59E0B 100%)',
      fontFamily: 'Space Grotesk, sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div style={{ fontSize: 52, marginBottom: 20 }}>🐾</div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, color: '#fff',
            lineHeight: 1.15, marginBottom: 14, letterSpacing: '-1px' }}>
            {t('waitlist.title')}
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.90)', fontWeight: 500, marginBottom: 8 }}>
            {t('waitlist.counter')}
          </p>

          {/* feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, margin: '20px 0 36px' }}>
            {FEATURE_PILLS.map(({ icon: Icon, label }) => (
              <div key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.30)',
                borderRadius: 999, padding: '8px 18px',
                fontSize: 13, fontWeight: 700, color: '#fff',
              }}>
                <Icon size={14} /> {label}
              </div>
            ))}
          </div>

          {user ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.3)', borderRadius: 20, padding: '24px 28px',
                display: 'inline-block' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>
                ✅ คุณเข้าสู่ระบบแล้ว — ไปเริ่มจับคู่เลย!
              </p>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => openAuthModal('signin')}
              style={{
                padding: '16px 44px', borderRadius: 999, border: 'none',
                backgroundColor: '#000', color: '#fff', fontWeight: 800, fontSize: 16,
                cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
                boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
              }}>
              {t('waitlist.button')}
            </motion.button>
          )}

          <p style={{ marginTop: 18, fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
            {t('waitlist.noSpam')}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
