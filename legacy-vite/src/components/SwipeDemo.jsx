import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { MapPin, Star, Heart, X, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { swipeCats } from '../data/cats'

function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -60, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          style={{
            position: 'fixed', top: 88, left: '50%', transform: 'translateX(-50%)',
            zIndex: 1000,
            backgroundColor: toast.type === 'like' ? '#000' : '#3f3f46',
            color: '#fff', padding: '12px 28px', borderRadius: 999,
            fontSize: 16, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif',
            boxShadow: toast.type === 'like' ? '0 8px 32px rgba(249,115,22,0.5)' : '0 8px 24px rgba(0,0,0,0.35)',
            whiteSpace: 'nowrap',
            border: toast.type === 'like' ? '2px solid #F97316' : '2px solid rgba(255,255,255,0.1)',
          }}
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function AuthGate({ onSignIn, t }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(10px)',
        borderRadius: 24,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 28px', textAlign: 'center',
      }}
    >
      <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: 'rgba(249,115,22,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Lock size={32} color="#F97316" strokeWidth={2} />
      </div>
      <h3 style={{
        fontSize: 20, fontWeight: 800, color: '#fff',
        marginBottom: 12, fontFamily: 'Space Grotesk, sans-serif',
      }}>
        {t('swipe.authTitle')}
      </h3>
      <p style={{
        fontSize: 14, color: 'rgba(255,255,255,0.75)',
        fontWeight: 500, marginBottom: 24, lineHeight: 1.6,
        fontFamily: 'Space Grotesk, sans-serif',
      }}>
        {t('swipe.authDesc')}
      </p>
      <button
        onClick={onSignIn}
        style={{
          backgroundColor: '#F97316', color: '#fff',
          fontWeight: 800, fontSize: 15,
          padding: '13px 28px', borderRadius: 999,
          border: 'none', cursor: 'pointer',
          fontFamily: 'Space Grotesk, sans-serif',
          boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EA6A00'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F97316'}
      >
        {t('swipe.authBtn')}
      </button>
    </motion.div>
  )
}

function CatCard({ cat, isTop, zIndex, stackOffset, stackScale, onSwipe, onRegisterTrigger }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-240, 240], [-30, 30])
  const likeOpacity = useTransform(x, [20, 130], [0, 1])
  const passOpacity = useTransform(x, [-130, -20], [1, 0])
  const controls = useAnimation()

  const triggerSwipe = useCallback(async (direction) => {
    await controls.start({
      x: direction === 'right' ? 1300 : -1300,
      rotate: direction === 'right' ? 30 : -30,
      opacity: 0,
      transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
    })
    onSwipe(direction)
  }, [controls, onSwipe])

  useEffect(() => {
    if (isTop && onRegisterTrigger) onRegisterTrigger(triggerSwipe)
  }, [isTop, triggerSwipe, onRegisterTrigger])

  const handleDragEnd = useCallback((_, info) => {
    if (info.offset.x > 100) triggerSwipe('right')
    else if (info.offset.x < -100) triggerSwipe('left')
    else controls.start({ x: 0, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 26 } })
  }, [controls, triggerSwipe])

  return (
    <motion.div
      animate={isTop ? controls : undefined}
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 460,
        x: isTop ? x : 0, rotate: isTop ? rotate : 0,
        zIndex, scale: stackScale, y: stackOffset,
        borderRadius: 24, overflow: 'hidden',
        cursor: isTop ? 'grab' : 'default',
        boxShadow: isTop ? '0 20px 60px rgba(0,0,0,0.22)' : '0 6px 20px rgba(0,0,0,0.1)',
        touchAction: 'none', userSelect: 'none',
        transformOrigin: 'top center',
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.92}
      onDragEnd={handleDragEnd}
      whileTap={isTop ? { cursor: 'grabbing' } : {}}
    >
      <img
        src={cat.img}
        alt={cat.nameEn}
        draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
      />

      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.78) 100%)' }} />

      {/* Verified badge */}
      <div style={{
        position: 'absolute', top: 16, right: 16,
        backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
        fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 999,
        fontFamily: 'Space Grotesk, sans-serif',
      }}>✅ Verified</div>

      {isTop && (
        <motion.div style={{
          position: 'absolute', top: 22, left: 18, opacity: likeOpacity,
          border: '3px solid #F97316', color: '#F97316',
          fontSize: 20, fontWeight: 900, padding: '4px 14px', borderRadius: 10,
          transform: 'rotate(-12deg)', fontFamily: 'Space Grotesk, sans-serif',
          letterSpacing: 2, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
        }}>LIKE ❤️</motion.div>
      )}
      {isTop && (
        <motion.div style={{
          position: 'absolute', top: 22, right: 18, opacity: passOpacity,
          border: '3px solid #ef4444', color: '#ef4444',
          fontSize: 20, fontWeight: 900, padding: '4px 14px', borderRadius: 10,
          transform: 'rotate(12deg)', fontFamily: 'Space Grotesk, sans-serif',
          letterSpacing: 2, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
        }}>NOPE ✗</motion.div>
      )}

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 20px 22px', fontFamily: 'Space Grotesk, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
              {cat.name} <span style={{ fontSize: 20 }}>{cat.gender}</span>
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.82)', fontWeight: 500, marginTop: 3 }}>
              {cat.breed} · {cat.age}
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
            padding: '5px 10px', borderRadius: 999,
          }}>
            <Star size={13} fill="#F97316" color="#F97316" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{cat.rating}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
          <MapPin size={13} color="rgba(255,255,255,0.65)" />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{cat.location}</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {cat.tags.map((tag) => (
            <span key={tag} style={{
              backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.22)', color: '#fff',
              fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function SwipeDemo() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [toast, setToast] = useState(null)
  const [showAuthGate, setShowAuthGate] = useState(false)
  const toastTimer = useRef(null)
  const swipeTrigger = useRef(null)
  const { user, openAuthModal } = useAuth()
  const { t } = useLanguage()

  const showToast = useCallback((message, type, duration = 2000) => {
    clearTimeout(toastTimer.current)
    setToast({ message, type, id: Date.now() })
    toastTimer.current = setTimeout(() => setToast(null), duration)
  }, [])

  const handleSwipe = useCallback((direction) => {
    if (direction === 'right') {
      confetti({ particleCount: 130, spread: 82, origin: { x: 0.5, y: 0.55 },
        colors: ['#F97316', '#FB923C', '#FCD34D', '#ffffff'], startVelocity: 38, gravity: 0.9 })
      showToast(t('swipe.likeToast'), 'like', 2200)
    } else {
      showToast(t('swipe.passToast'), 'pass', 1500)
    }
    setCurrentIndex((prev) => prev + 1)
  }, [showToast, t])

  const requireAuth = useCallback((action) => {
    if (!user) {
      setShowAuthGate(true)
      return false
    }
    return true
  }, [user])

  const handleRegisterTrigger = useCallback((fn) => { swipeTrigger.current = fn }, [])

  const handleLike = useCallback(() => {
    if (!requireAuth()) return
    if (currentIndex >= swipeCats.length) return
    setShowAuthGate(false)
    swipeTrigger.current?.('right')
  }, [currentIndex, requireAuth])

  const handlePass = useCallback(() => {
    if (!requireAuth()) return
    if (currentIndex >= swipeCats.length) return
    setShowAuthGate(false)
    swipeTrigger.current?.('left')
  }, [currentIndex, requireAuth])

  const handleCardDragAttempt = useCallback(() => {
    if (!user) setShowAuthGate(true)
  }, [user])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') handleLike()
      if (e.key === 'ArrowLeft') handlePass()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleLike, handlePass])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  // Hide auth gate when user logs in
  useEffect(() => { if (user) setShowAuthGate(false) }, [user])

  const remaining = swipeCats.length - currentIndex
  const isDone = currentIndex >= swipeCats.length
  const visibleCats = swipeCats.slice(currentIndex, currentIndex + 3)

  return (
    <section id="swipe-demo" style={{ padding: '96px 24px 80px', backgroundColor: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>
      <Toast toast={toast} />

      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <span style={{
          display: 'inline-block', backgroundColor: 'rgba(249,115,22,0.1)', color: '#F97316',
          fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 999,
          letterSpacing: '0.08em', marginBottom: 16, textTransform: 'uppercase',
        }}>{t('swipe.badge')}</span>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#000', marginBottom: 12 }}>
          {t('swipe.title')}
        </h2>
        <p style={{ fontSize: 17, color: '#666', fontWeight: 500 }}>{t('swipe.subtitle')}</p>
        <p style={{ fontSize: 13, color: '#bbb', marginTop: 8, fontWeight: 500 }}>{t('swipe.hint')}</p>
      </div>

      <div style={{ maxWidth: 360, margin: '0 auto' }}>
        {isDone ? (
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            style={{ height: 460, borderRadius: 24, border: '2px dashed #F97316',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 16, backgroundColor: '#FFF7ED' }}>
            <div style={{ fontSize: 56 }}>🐾</div>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#000', textAlign: 'center', padding: '0 24px' }}>
              {t('swipe.allSeen')}
            </p>
            <p style={{ fontSize: 14, color: '#888', textAlign: 'center', padding: '0 32px', fontWeight: 500 }}>
              {t('swipe.joinToSeeMore')}
            </p>
            <button onClick={() => { swipeTrigger.current = null; setCurrentIndex(0); setShowAuthGate(false) }}
              style={{ marginTop: 8, backgroundColor: '#F97316', color: '#fff', fontWeight: 700, fontSize: 14,
                padding: '11px 28px', borderRadius: 999, border: 'none', cursor: 'pointer',
                fontFamily: 'Space Grotesk, sans-serif', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EA6A00'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F97316'}>
              {t('swipe.startOver')}
            </button>
          </motion.div>
        ) : (
          <div style={{ position: 'relative', height: 520 }}>
            {/* Auth gate overlay */}
            {showAuthGate && (
              <AuthGate t={t} onSignIn={() => { setShowAuthGate(false); openAuthModal('signin') }} />
            )}

            {[...visibleCats].reverse().map((cat, reversedI) => {
              const i = visibleCats.length - 1 - reversedI
              const isTop = i === 0
              return (
                <CatCard
                  key={cat.id}
                  cat={cat}
                  isTop={isTop}
                  zIndex={visibleCats.length - i}
                  stackScale={1 - i * 0.045}
                  stackOffset={i * 18}
                  onSwipe={handleSwipe}
                  onRegisterTrigger={isTop ? handleRegisterTrigger : null}
                />
              )
            })}
          </div>
        )}

        {!isDone && (
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#bbb', fontWeight: 600 }}>
            {remaining} {remaining === 1 ? 'cat' : 'cats'} remaining
          </p>
        )}

        {!isDone && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 28 }}>
            <motion.button onClick={handlePass} whileTap={{ scale: 0.88 }} whileHover={{ scale: 1.1, y: -3 }}
              style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#fff',
                border: '2px solid #fecaca', boxShadow: '0 4px 20px rgba(239,68,68,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                transition: 'border-color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#fecaca'}
              aria-label="Pass">
              <X size={26} color="#ef4444" strokeWidth={2.5} />
            </motion.button>

            <motion.button onClick={handleLike} whileTap={{ scale: 0.88 }} whileHover={{ scale: 1.1, y: -3 }}
              style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#F97316',
                border: '2px solid #F97316', boxShadow: '0 4px 24px rgba(249,115,22,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EA6A00'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F97316'}
              aria-label="Like">
              <Heart size={26} color="#fff" fill="#fff" strokeWidth={2} />
            </motion.button>
          </div>
        )}
      </div>
    </section>
  )
}
