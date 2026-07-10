import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

const COPY = {
  th: {
    notifBody: 'เปิดแจ้งเตือนสำเร็จ เราจะแจ้งทุก Match ใหม่',
    title: 'เปิดการแจ้งเตือน',
    subtitle: 'รับแจ้งทันทีเมื่อมี Match ใหม่',
    allow: 'เปิด',
  },
  en: {
    notifBody: 'Notifications enabled. We\'ll alert you on every new Match.',
    title: 'Turn on notifications',
    subtitle: 'Get notified instantly when there\'s a new Match',
    allow: 'Allow',
  },
}

export default function NotificationPrompt() {
  const { user } = useAuth()
  const { lang } = useLanguage()
  const c = COPY[lang]
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!user) return
    if (!('Notification' in window)) return
    if (Notification.permission !== 'default') return
    const seen = localStorage.getItem(`notif_prompt_${user.uid}`)
    if (seen) return
    const timer = setTimeout(() => setShow(true), 3000)
    return () => clearTimeout(timer)
  }, [user])

  const handleAllow = () => {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted' && user) {
        new Notification('Catinder', { body: c.notifBody, icon: '/favicon.svg' })
      }
    })
    localStorage.setItem(`notif_prompt_${user.uid}`, '1')
    setShow(false)
  }

  const handleDismiss = () => {
    localStorage.setItem(`notif_prompt_${user.uid}`, '1')
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            zIndex: 4000, width: 'calc(100% - 32px)', maxWidth: 380,
            backgroundColor: '#000', borderRadius: 18,
            padding: '16px 18px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', gap: 14,
            fontFamily: 'Space Grotesk, sans-serif',
          }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bell size={20} color="#F97316" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{c.title}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{c.subtitle}</div>
          </div>
          <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
            <button onClick={handleAllow} style={{
              padding: '7px 14px', borderRadius: 9, border: 'none',
              backgroundColor: '#F97316', color: '#fff', fontSize: 12, fontWeight: 800,
              cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
            }}>{c.allow}</button>
            <button onClick={handleDismiss} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            }}>
              <X size={16} color="rgba(255,255,255,0.4)" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
