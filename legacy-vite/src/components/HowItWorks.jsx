import { motion } from 'framer-motion'
import { PawPrint, Search, Heart } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

const icons = [
  <PawPrint size={34} color="#F97316" strokeWidth={1.8} />,
  <Search size={34} color="#F97316" strokeWidth={1.8} />,
  <Heart size={34} color="#F97316" strokeWidth={1.8} />,
]

export default function HowItWorks() {
  const { t } = useLanguage()
  const steps = t('howItWorks.steps')

  return (
    <section id="how-it-works" style={{ padding: '96px 24px', backgroundColor: '#FFF7ED', fontFamily: 'Space Grotesk, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{
            display: 'inline-block', backgroundColor: 'rgba(249,115,22,0.1)', color: '#F97316',
            fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 999,
            letterSpacing: '0.08em', marginBottom: 16, textTransform: 'uppercase',
          }}>{t('howItWorks.badge')}</span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#000', marginBottom: 14 }}>
            {t('howItWorks.title')}
          </h2>
          <p style={{ fontSize: 17, color: '#555', maxWidth: 500, margin: '0 auto', fontWeight: 500 }}>
            {t('howItWorks.subtitle')}
          </p>
        </motion.div>

        <div style={{ display: 'flex', gap: 0, alignItems: 'stretch', flexDirection: 'row', position: 'relative' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'stretch', flex: 1 }}>
              <motion.div
                initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(249,115,22,0.12)' }}
                style={{ flex: 1, backgroundColor: '#fff', borderRadius: 24, padding: '36px 32px',
                  border: '1px solid #F3F4F6', boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                  position: 'relative', textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                <div style={{ position: 'absolute', top: 20, left: 24, fontSize: 13, fontWeight: 800,
                  color: 'rgba(249,115,22,0.3)', letterSpacing: '0.05em' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(249,115,22,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px' }}>
                  {icons[i]}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#000', marginBottom: 12, lineHeight: 1.2 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, fontWeight: 500 }}>{step.desc}</p>
              </motion.div>

              {i < steps.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', flexShrink: 0 }}>
                  <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.15 + 0.3 }}
                    style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#F97316',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>→</motion.div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #how-it-works > div > div:last-child { flex-direction: column !important; }
        }
      `}</style>
    </section>
  )
}
