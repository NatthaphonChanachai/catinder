import { motion } from 'framer-motion'
import { CheckCircle, Trophy, ShieldCheck } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { heroFloatingCats } from '../data/cats'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
}

const PawPattern = () => (
  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, pointerEvents: 'none' }} aria-hidden="true">
    <defs>
      <pattern id="paw" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <text x="20" y="50" fontSize="28" fill="#F97316">🐾</text>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#paw)" />
  </svg>
)

export default function Hero() {
  const { t } = useLanguage()
  const scrollToSwipe = () => document.querySelector('#swipe-demo')?.scrollIntoView({ behavior: 'smooth' })
  const scrollToWaitlist = () => document.querySelector('#waitlist')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section style={{
      minHeight: '100vh', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #FFF7ED 0%, #FFFBF5 60%, #FFFFFF 100%)',
      padding: '100px 24px 60px',
    }}>
      <PawPattern />
      <div style={{ position: 'absolute', top: '10%', right: '5%', width: 340, height: 340, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', left: '3%', width: 260, height: 260, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            backgroundColor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
            borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 700, color: '#F97316',
            marginBottom: 28, letterSpacing: '0.02em',
          }}>
            {t('hero.badge')}
          </span>
        </motion.div>

        <motion.h1 custom={1} initial="hidden" animate="visible" variants={fadeUp}
          style={{ fontSize: 'clamp(42px, 7vw, 76px)', fontWeight: 800, lineHeight: 1.1,
            letterSpacing: '-2px', marginBottom: 24, fontFamily: 'Space Grotesk, sans-serif' }}>
          <span style={{ color: '#000' }}>{t('hero.headline1')} </span>
          <span style={{ color: '#F97316', fontStyle: 'italic' }}>{t('hero.headline2')}</span>
          <br />
          <span style={{ color: '#000' }}>{t('hero.headline3')}</span>
        </motion.h1>

        <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp}
          style={{ fontSize: 'clamp(16px, 2.2vw, 20px)', color: '#555', lineHeight: 1.7,
            maxWidth: 560, margin: '0 auto 40px', fontWeight: 500 }}>
          {t('hero.subtitle')}
        </motion.p>

        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={scrollToSwipe}
            style={{ backgroundColor: '#F97316', color: '#fff', fontWeight: 700, fontSize: 16,
              padding: '15px 36px', borderRadius: 999, border: 'none', cursor: 'pointer',
              transition: 'all 0.2s', fontFamily: 'Space Grotesk, sans-serif',
              boxShadow: '0 4px 24px rgba(249,115,22,0.35)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EA6A00'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F97316'; e.currentTarget.style.transform = 'translateY(0)' }}>
            {t('hero.cta1')}
          </button>
          <button onClick={scrollToWaitlist}
            style={{ backgroundColor: 'transparent', color: '#F97316', fontWeight: 700, fontSize: 16,
              padding: '15px 36px', borderRadius: 999, border: '2px solid #F97316',
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Space Grotesk, sans-serif' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F97316'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#F97316'; e.currentTarget.style.transform = 'translateY(0)' }}>
            {t('hero.cta2')}
          </button>
        </motion.div>

        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}
          style={{ marginTop: 56, display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
          {[
            { icon: <CheckCircle size={18} color="#F97316" strokeWidth={2} />, text: t('hero.trust1') },
            { icon: <Trophy size={18} color="#F97316" strokeWidth={2} />, text: t('hero.trust2') },
            { icon: <ShieldCheck size={18} color="#F97316" strokeWidth={2} />, text: t('hero.trust3') },
          ].map((item) => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#555', fontSize: 14, fontWeight: 600 }}>
              {item.icon}{item.text}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Floating cat cards */}
      <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}
        style={{ marginTop: 64, position: 'relative', display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'flex-end' }}>
        {heroFloatingCats.map((cat, i) => (
          <motion.div
            key={cat.nameEn}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
            style={{ width: i === 1 ? 160 : 140, borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              transform: `rotate(${[-6, 0, 6][i]}deg) scale(${i === 1 ? 1.06 : 1})`,
              border: '3px solid #fff', flexShrink: 0 }}>
            <img src={cat.img} alt={cat.nameEn} style={{ width: '100%', display: 'block', height: 170, objectFit: 'cover' }} />
            <div style={{ background: '#fff', padding: '10px 12px', fontFamily: 'Space Grotesk, sans-serif' }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#000' }}>{cat.nameEn}</div>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{cat.breed}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)' }}>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ color: '#F97316', fontSize: 22 }}>↓</motion.div>
      </motion.div>
    </section>
  )
}
