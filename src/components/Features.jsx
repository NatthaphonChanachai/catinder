import { motion } from 'framer-motion'
import { Shield, FlaskConical, ClipboardList, Users } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

const icons = [
  <Shield size={28} color="#F97316" strokeWidth={2} />,
  <FlaskConical size={28} color="#F97316" strokeWidth={2} />,
  <ClipboardList size={28} color="#F97316" strokeWidth={2} />,
  <Users size={28} color="#F97316" strokeWidth={2} />,
]

export default function Features() {
  const { t } = useLanguage()
  const items = t('features.items')

  return (
    <section id="features" style={{ padding: '96px 24px', backgroundColor: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{
            display: 'inline-block', backgroundColor: 'rgba(249,115,22,0.1)', color: '#F97316',
            fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 999,
            letterSpacing: '0.08em', marginBottom: 16, textTransform: 'uppercase',
          }}>{t('features.badge')}</span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#000', marginBottom: 14 }}>
            {t('features.title')}<br />
            <span style={{ color: '#F97316' }}>{t('features.titleAccent')}</span>
          </h2>
          <p style={{ fontSize: 17, color: '#555', maxWidth: 500, margin: '0 auto', fontWeight: 500 }}>
            {t('features.subtitle')}
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {items.map((feature, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.55, delay: i * 0.1 }}
              whileHover={{ y: -6, boxShadow: '0 16px 48px rgba(249,115,22,0.1)', borderColor: '#F97316' }}
              style={{ backgroundColor: '#fff', borderRadius: 24, padding: '36px 32px',
                border: '1px solid #F3F4F6', boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
                transition: 'all 0.25s ease', cursor: 'default' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(249,115,22,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                {icons[i]}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#000', marginBottom: 12, lineHeight: 1.25 }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: 15, color: '#666', lineHeight: 1.75, fontWeight: 500 }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
