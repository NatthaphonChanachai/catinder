import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

const statValues = [40, 45, 98]
const statSuffixes = ['B+', '%', '%']
const avatars = [
  'https://i.pravatar.cc/60?img=5',
  'https://i.pravatar.cc/60?img=12',
  'https://i.pravatar.cc/60?img=9',
]
const names = ['คุณนภา พ.', 'คุณวิทย์ ส.', 'คุณมินตรา ก.']

function AnimatedNumber({ target, suffix, inView }) {
  const [count, setCount] = useState(0)
  const hasRun = useRef(false)
  useEffect(() => {
    if (!inView || hasRun.current) return
    hasRun.current = true
    const duration = 1600, steps = 60
    let current = 0
    const timer = setInterval(() => {
      current = Math.min(current + target / steps, target)
      setCount(Math.round(current))
      if (current >= target) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, target])
  return <span style={{ color: '#F97316' }}>{count.toLocaleString()}{suffix}</span>
}

export default function SocialProof() {
  const [inView, setInView] = useState(false)
  const sectionRef = useRef(null)
  const { t } = useLanguage()
  const statLabels = t('social.stats')
  const testimonials = t('social.testimonials')

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.3 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} style={{ padding: '96px 24px', backgroundColor: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{
            display: 'inline-block', backgroundColor: 'rgba(249,115,22,0.1)', color: '#F97316',
            fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 999,
            letterSpacing: '0.08em', marginBottom: 16, textTransform: 'uppercase',
          }}>{t('social.badge')}</span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#000' }}>
            {t('social.title')}
          </h2>
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 72,
          backgroundColor: '#FFF7ED', borderRadius: 24, padding: '40px 32px',
          border: '1px solid rgba(249,115,22,0.15)' }}>
          {statValues.map((val, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 8 }}>
                <AnimatedNumber target={val} suffix={statSuffixes[i]} inView={inView} />
              </div>
              <div style={{ fontSize: 15, color: '#555', fontWeight: 600 }}>{statLabels[i]}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {testimonials.map((t_item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }} transition={{ duration: 0.55, delay: i * 0.12 }}
              style={{ backgroundColor: '#fff', border: '1px solid #F3F4F6', borderRadius: 24,
                padding: '28px 28px', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="#F97316" color="#F97316" />)}
              </div>
              <p style={{ fontSize: 15, color: '#333', lineHeight: 1.75, fontWeight: 500, marginBottom: 20, fontStyle: 'italic' }}>
                "{t_item.text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={avatars[i]} alt={names[i]}
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #F97316' }} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#000' }}>{names[i]}</div>
                  <div style={{ fontSize: 12, color: '#F97316', fontWeight: 600, marginTop: 2 }}>{t_item.breed}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
