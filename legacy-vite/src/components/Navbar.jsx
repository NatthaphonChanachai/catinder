import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const { user, openAuthModal, logout } = useAuth()
  const { lang, toggleLang, t } = useLanguage()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const navLinks = [
    { label: t('nav.browseCats'), href: '#swipe-demo' },
    { label: t('nav.howItWorks'), href: '#how-it-works' },
    { label: t('nav.forBreeders'), href: '#features' },
  ]

  const scrollTo = (href) => {
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'all 0.3s ease',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      backgroundColor: scrolled ? 'rgba(255,255,255,0.88)' : 'transparent',
      borderBottom: scrolled ? '1px solid #F97316' : '1px solid transparent',
      boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.07)' : 'none',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 68, gap: 0 }}>

          {/* Logo */}
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            style={{ fontSize: 22, fontWeight: 800, color: '#F97316', textDecoration: 'none',
              letterSpacing: '-0.5px', flexShrink: 0, marginRight: 'auto',
              fontFamily: 'Space Grotesk, sans-serif' }}>
            🐾 Catinder
          </a>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', gap: 32, marginRight: 28 }} className="desktop-nav">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href}
                onClick={(e) => { e.preventDefault(); scrollTo(link.href) }}
                style={{ fontSize: 14, fontWeight: 600, color: '#333', textDecoration: 'none',
                  transition: 'color 0.2s', fontFamily: 'Space Grotesk, sans-serif' }}
                onMouseEnter={(e) => e.target.style.color = '#F97316'}
                onMouseLeave={(e) => e.target.style.color = '#333'}>
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side: Lang + Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="desktop-cta">
            {/* Language toggle */}
            <div style={{ display: 'flex', border: '1.5px solid #e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
              {['th', 'en'].map((l) => (
                <button key={l} onClick={() => l !== lang && toggleLang()}
                  style={{
                    padding: '7px 13px', border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, letterSpacing: '0.05em',
                    fontFamily: 'Space Grotesk, sans-serif',
                    backgroundColor: lang === l ? '#F97316' : '#fff',
                    color: lang === l ? '#fff' : '#888',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {user ? (
              /* User avatar menu */
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px 6px 6px',
                    borderRadius: 999,
                    border: '1.5px solid #F97316',
                    backgroundColor: '#FFF7ED',
                    cursor: 'pointer',
                    fontFamily: 'Space Grotesk, sans-serif',
                  }}
                >
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=F97316&color=fff&size=32`}
                    alt=""
                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#F97316', maxWidth: 100,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(user.displayName || user.email || '').split(' ')[0]}
                  </span>
                  <ChevronDown size={14} color="#F97316" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                        backgroundColor: '#fff',
                        border: '1px solid #F3F4F6',
                        borderRadius: 16,
                        padding: 8,
                        minWidth: 160,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        zIndex: 200,
                      }}
                    >
                      <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid #f3f4f6', marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>{user.displayName || 'User'}</div>
                        <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{user.email}</div>
                      </div>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false) }}
                        style={{
                          width: '100%', padding: '9px 12px', textAlign: 'left',
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: 14, fontWeight: 600, color: '#ef4444',
                          borderRadius: 10, fontFamily: 'Space Grotesk, sans-serif',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        🚪 {t('nav.signOut')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('signin')}
                  style={{
                    padding: '9px 20px', borderRadius: 999,
                    border: '1.5px solid #F97316',
                    backgroundColor: 'transparent', color: '#F97316',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    fontFamily: 'Space Grotesk, sans-serif',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F97316'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#F97316' }}
                >
                  {t('nav.signIn')}
                </button>
                <a
                  href="#waitlist"
                  onClick={(e) => { e.preventDefault(); scrollTo('#waitlist') }}
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#F97316', color: '#fff',
                    fontWeight: 700, fontSize: 14,
                    padding: '10px 22px', borderRadius: 999,
                    textDecoration: 'none', transition: 'background 0.2s',
                    fontFamily: 'Space Grotesk, sans-serif',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EA6A00'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F97316'}
                >
                  {t('nav.joinWaitlist')}
                </a>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen((v) => !v)}
            style={{ display: 'none', background: 'none', border: 'none',
              cursor: 'pointer', padding: 8, color: '#000', marginLeft: 8 }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            style={{
              backgroundColor: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(14px)',
              borderTop: '1px solid #F3F4F6',
              padding: '12px 24px 20px',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            {navLinks.map((link) => (
              <div key={link.label} style={{ padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                <a href={link.href} onClick={(e) => { e.preventDefault(); scrollTo(link.href) }}
                  style={{ fontSize: 15, fontWeight: 600, color: '#333', textDecoration: 'none', display: 'block' }}>
                  {link.label}
                </a>
              </div>
            ))}
            <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', border: '1.5px solid #e5e7eb', borderRadius: 999, overflow: 'hidden', flex: '0 0 auto' }}>
                {['th', 'en'].map((l) => (
                  <button key={l} onClick={() => l !== lang && toggleLang()}
                    style={{
                      padding: '9px 14px', border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 700, letterSpacing: '0.05em',
                      fontFamily: 'Space Grotesk, sans-serif',
                      backgroundColor: lang === l ? '#F97316' : '#fff',
                      color: lang === l ? '#fff' : '#888',
                      transition: 'background 0.2s, color 0.2s',
                    }}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              {user ? (
                <button onClick={() => { logout(); setMobileOpen(false) }}
                  style={{ flex: 1, padding: '10px', borderRadius: 999, border: '1.5px solid #fee2e2',
                    backgroundColor: '#fff', color: '#ef4444', fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
                  🚪 {t('nav.signOut')}
                </button>
              ) : (
                <>
                  <button onClick={() => { openAuthModal('signin'); setMobileOpen(false) }}
                    style={{ flex: 1, padding: '10px', borderRadius: 999, border: '1.5px solid #F97316',
                      backgroundColor: 'transparent', color: '#F97316', fontWeight: 700, fontSize: 14,
                      cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
                    {t('nav.signIn')}
                  </button>
                  <a href="#waitlist" onClick={(e) => { e.preventDefault(); scrollTo('#waitlist') }}
                    style={{ flex: 1, display: 'block', textAlign: 'center', backgroundColor: '#F97316',
                      color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 0',
                      borderRadius: 999, textDecoration: 'none' }}>
                    {t('nav.joinWaitlist')}
                  </a>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-cta { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  )
}
