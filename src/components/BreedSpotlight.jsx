import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { breedData } from '../data/cats'

const badgeColor = (badge) => {
  if (badge.includes('🔥')) return { bg: '#F97316', text: '#fff' }
  if (badge.includes('⭐')) return { bg: '#000', text: '#fff' }
  return { bg: '#1a1a1a', text: '#fff' }
}

export default function BreedSpotlight() {
  const { t } = useLanguage()

  return (
    <section style={{ padding: '96px 0', backgroundColor: '#FFF7ED', fontFamily: 'Space Grotesk, sans-serif', overflow: 'hidden' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 48, padding: '0 24px' }}>
        <span style={{
          display: 'inline-block', backgroundColor: 'rgba(249,115,22,0.1)', color: '#F97316',
          fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 999,
          letterSpacing: '0.08em', marginBottom: 16, textTransform: 'uppercase',
        }}>{t('breeds.badge')}</span>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#000', marginBottom: 14 }}>
          {t('breeds.title')}
        </h2>
        <p style={{ fontSize: 17, color: '#555', fontWeight: 500 }}>{t('breeds.subtitle')}</p>
      </motion.div>

      <div className="no-scrollbar" style={{ display: 'flex', gap: 20, overflowX: 'auto', padding: '8px 32px 24px', scrollSnapType: 'x mandatory' }}>
        {breedData.map((breed, i) => {
          const colors = badgeColor(breed.badge)
          return (
            <motion.div key={breed.name}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }} transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -8, boxShadow: '0 20px 50px rgba(249,115,22,0.18)', borderColor: '#F97316' }}
              style={{ minWidth: 200, maxWidth: 200, backgroundColor: '#fff', borderRadius: 24,
                overflow: 'hidden', border: '1px solid #F3F4F6', boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                scrollSnapAlign: 'start', flexShrink: 0, transition: 'all 0.25s ease', cursor: 'pointer' }}>
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img src={breed.img} alt={breed.name}
                  style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} />
                <div style={{ position: 'absolute', top: 12, left: 12, backgroundColor: colors.bg,
                  color: colors.text, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
                  {breed.badge}
                </div>
              </div>
              <div style={{ padding: '16px 16px 18px' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#000', marginBottom: 6 }}>{breed.name}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                  backgroundColor: 'rgba(249,115,22,0.08)', color: '#F97316',
                  fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>
                  <span style={{ fontSize: 10 }}>●</span>
                  {breed.available} {t('breeds.badge').includes('Dir') ? 'available' : 'available'}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
