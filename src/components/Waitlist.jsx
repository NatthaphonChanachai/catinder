import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'

export default function Waitlist() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const { t } = useLanguage()

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateEmail(email)) { setError(t('waitlist.invalidEmail')); return }
    setError('')
    setSubmitted(true)
  }

  return (
    <section id="waitlist" style={{
      padding: '96px 24px',
      background: 'linear-gradient(135deg, #F97316 0%, #F59E0B 100%)',
      fontFamily: 'Space Grotesk, sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div style={{ fontSize: 52, marginBottom: 20 }}>🐾</div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, color: '#fff',
            lineHeight: 1.15, marginBottom: 16, letterSpacing: '-1px' }}>
            {t('waitlist.title')}
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginBottom: 8 }}>
            {t('waitlist.counter')}
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginBottom: 40 }}>
            {t('waitlist.perks')}
          </p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.3)', borderRadius: 24, padding: '36px 32px' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                  style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 34 }}>
                  ✅
                </motion.div>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{t('waitlist.success')}</p>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{t('waitlist.successMsg')}</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <input type="text" value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    placeholder={t('waitlist.placeholder')}
                    style={{ flex: '1 1 280px', maxWidth: 360, padding: '15px 24px', borderRadius: 999,
                      border: '2px solid transparent', outline: 'none', fontSize: 15, fontWeight: 600,
                      fontFamily: 'Space Grotesk, sans-serif', backgroundColor: '#fff', color: '#000',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    onFocus={(e) => e.currentTarget.style.border = '2px solid rgba(0,0,0,0.2)'}
                    onBlur={(e) => e.currentTarget.style.border = '2px solid transparent'}
                  />
                  <button type="submit"
                    style={{ padding: '15px 32px', borderRadius: 999, border: 'none',
                      backgroundColor: '#000', color: '#fff', fontWeight: 800, fontSize: 15,
                      cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.25)', transition: 'background 0.2s, transform 0.15s',
                      whiteSpace: 'nowrap' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#000'; e.currentTarget.style.transform = 'translateY(0)' }}>
                    {t('waitlist.button')}
                  </button>
                </div>
                {error && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: 12, fontSize: 13, color: '#fff', backgroundColor: 'rgba(0,0,0,0.25)',
                      display: 'inline-block', padding: '5px 14px', borderRadius: 999, fontWeight: 600 }}>
                    ⚠️ {error}
                  </motion.p>
                )}
              </motion.form>
            )}
          </AnimatePresence>

          {!submitted && (
            <p style={{ marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
              {t('waitlist.noSpam')}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  )
}
