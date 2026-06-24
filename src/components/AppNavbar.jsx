import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Compass, PawPrint, MessageCircle, MapPin,
  Shield, LogOut, ChevronDown, Menu, X, Bell, UserPen, Headphones, Building2, BookOpen,
} from 'lucide-react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import EditProfileModal from './EditProfileModal'

const NAV = [
  { path: '/discover', label: { th: 'ค้นพบ', en: 'Discover' }, icon: Compass },
  { path: '/my-cats', label: { th: 'แมวของฉัน', en: 'My Cats' }, icon: PawPrint },
  { path: '/chat', label: { th: 'แชท', en: 'Chat' }, icon: MessageCircle },
  { path: '/directory', label: { th: 'ไดเรกทอรี', en: 'Directory' }, icon: MapPin },
  { path: '/venues', label: { th: 'สถานที่', en: 'Venues' }, icon: Building2 },
  { path: '/registries', label: { th: 'รีจิสทรี', en: 'Registry' }, icon: BookOpen },
]

const COPY = {
  th: {
    firestoreWarning: 'Firestore ยังไม่พร้อม — ไปที่ Firebase Console สร้าง Firestore Database ก่อน',
    admin: 'Admin',
    contactSupport: 'ติดต่อทีมงาน',
    editProfile: 'แก้ไขโปรไฟล์',
    signOut: 'ออกจากระบบ',
    defaultUser: 'ผู้ใช้',
  },
  en: {
    firestoreWarning: 'Firestore is not ready — go to Firebase Console and create a Firestore Database first.',
    admin: 'Admin',
    contactSupport: 'Contact Support',
    editProfile: 'Edit Profile',
    signOut: 'Log Out',
    defaultUser: 'User',
  },
}

export default function AppNavbar() {
  const { user, userProfile, isAdmin, logout, firestoreReady } = useAuth()
  const { lang, toggleLang } = useLanguage()
  const location = useLocation()
  const [dropOpen, setDropOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const c = COPY[lang]

  useEffect(() => {
    if (!user) return
    const lastSeen = Number(localStorage.getItem(`lastSeenChat_${user.uid}`) || 0)
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid))
    const unsub = onSnapshot(q, snap => {
      let count = 0
      snap.docs.forEach(d => {
        const data = d.data()
        if (data.lastMessageAt) {
          const ts = data.lastMessageAt.toMillis ? data.lastMessageAt.toMillis() : 0
          if (ts > lastSeen) count++
        }
      })
      setUnread(count)
    })
    return unsub
  }, [user])

  useEffect(() => {
    if (location.pathname.startsWith('/chat') && user) {
      localStorage.setItem(`lastSeenChat_${user.uid}`, Date.now().toString())
      setUnread(0)
    }
  }, [location.pathname, user])

  const avatarLetter = userProfile?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'

  const NavLink = ({ path, label, icon: Icon }) => {
    const active = location.pathname.startsWith(path)
    const isChatLink = path === '/chat'
    return (
      <Link to={path} onClick={() => setMobileOpen(false)} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 12px', borderRadius: 9,
        textDecoration: 'none', fontSize: 13, fontWeight: 700,
        color: active ? '#F97316' : '#555',
        backgroundColor: active ? 'rgba(249,115,22,0.08)' : 'transparent',
        transition: 'all 0.15s', position: 'relative',
      }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = '#f5f5f5'; e.currentTarget.style.color = '#000' }}}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#555' }}}
      >
        <Icon size={15} />
        {label[lang]}
        {isChatLink && unread > 0 && (
          <span style={{ position: 'absolute', top: 3, right: 3, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', border: '1.5px solid #fff' }} />
        )}
      </Link>
    )
  }

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 1000,
        backgroundColor: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f0f0f0',
        fontFamily: 'Space Grotesk, sans-serif',
      }}>
        {/* Firestore warning banner */}
        {!firestoreReady && (
          <div style={{ backgroundColor: '#fef3c7', padding: '8px 20px', fontSize: 12, fontWeight: 700, color: '#92400e', textAlign: 'center' }}>
            {c.firestoreWarning}
          </div>
        )}

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: 60, gap: 8 }}>
          {/* Logo */}
          <Link to="/dashboard" style={{ textDecoration: 'none', marginRight: 20, flexShrink: 0 }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#000' }}>
              Cat<span style={{ color: '#F97316' }}>inder</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }} className="app-desktop-nav">
            {NAV.map(n => <NavLink key={n.path} {...n} />)}
            {isAdmin && (
              <Link to="/admin" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 9, textDecoration: 'none',
                fontSize: 13, fontWeight: 700,
                color: location.pathname.startsWith('/admin') ? '#7c3aed' : '#888',
                backgroundColor: location.pathname.startsWith('/admin') ? 'rgba(124,58,237,0.08)' : 'transparent',
                transition: 'all 0.15s',
              }}>
                <Shield size={15} /> {c.admin}
              </Link>
            )}
          </div>

          {/* Language toggle — desktop */}
          <div style={{ display: 'flex', border: '1.5px solid #e5e7eb', borderRadius: 999, overflow: 'hidden', flexShrink: 0, marginLeft: 'auto' }} className="app-desktop-nav">
            {['th', 'en'].map((l) => (
              <button key={l} onClick={() => l !== lang && toggleLang()}
                style={{
                  padding: '6px 11px', border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
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

          {/* Profile dropdown — desktop */}
          <div style={{ position: 'relative', marginLeft: 12, flexShrink: 0 }} className="app-desktop-nav">
            <button onClick={() => setDropOpen(!dropOpen)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '5px 10px 5px 5px', borderRadius: 999,
              border: '1.5px solid #e5e7eb', backgroundColor: '#fff',
              cursor: 'pointer', transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#F97316'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                backgroundColor: '#F97316', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, flexShrink: 0, overflow: 'hidden',
              }}>
                {userProfile?.photoURL
                  ? <img src={userProfile.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : avatarLetter}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#000', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userProfile?.displayName || user?.email?.split('@')[0]}
              </span>
              <ChevronDown size={13} color="#888" />
            </button>

            <AnimatePresence>
              {dropOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.13 }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    backgroundColor: '#fff', borderRadius: 14,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    minWidth: 200, overflow: 'hidden', zIndex: 200,
                  }}
                >
                  {/* User info */}
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        backgroundColor: '#f5f5f5', overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {userProfile?.photoURL
                          ? <img src={userProfile.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: 14, fontWeight: 800, color: '#F97316' }}>{avatarLetter}</span>}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {userProfile?.displayName || c.defaultUser}
                        </div>
                        <div style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                      </div>
                    </div>
                    {isAdmin && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#7c3aed', fontWeight: 800, backgroundColor: 'rgba(124,58,237,0.08)', padding: '2px 8px', borderRadius: 999, marginTop: 8 }}>
                        <Shield size={9} /> {c.admin}
                      </div>
                    )}
                  </div>

                  {/* Support chat */}
                  <Link to="/support" onClick={() => setDropOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '11px 16px', width: '100%', textAlign: 'left',
                    textDecoration: 'none',
                    color: '#F97316', fontSize: 13, fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    borderBottom: '1px solid #f5f5f5',
                    transition: 'background 0.1s',
                    backgroundColor: 'transparent',
                  }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FFF7ED'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Headphones size={14} /> {c.contactSupport}
                  </Link>

                  {/* Edit profile */}
                  <button onClick={() => { setDropOpen(false); setShowEditProfile(true) }} style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '11px 16px', width: '100%', textAlign: 'left',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#333', fontSize: 13, fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    borderBottom: '1px solid #f5f5f5',
                    transition: 'background 0.1s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <UserPen size={14} /> {c.editProfile}
                  </button>

                  {/* Logout */}
                  <button onClick={() => { setDropOpen(false); logout() }} style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '11px 16px', width: '100%', textAlign: 'left',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#ef4444', fontSize: 13, fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    transition: 'background 0.1s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={14} /> {c.signOut}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {dropOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setDropOpen(false)} />}
          </div>

          {/* Mobile controls */}
          <div style={{ display: 'none', alignItems: 'center', gap: 8, marginLeft: 'auto' }} className="app-mobile-controls">
            {unread > 0 && (
              <Link to="/chat" style={{ position: 'relative', display: 'flex' }}>
                <Bell size={20} color="#F97316" />
                <span style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', border: '1.5px solid #fff' }} />
              </Link>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', borderTop: '1px solid #f0f0f0', backgroundColor: '#fff' }}
            >
              <div style={{ padding: '8px 16px 16px' }}>
                {NAV.map(({ path, label, icon: Icon }) => {
                  const active = location.pathname.startsWith(path)
                  const isChatLink = path === '/chat'
                  return (
                    <Link key={path} to={path} onClick={() => setMobileOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 8px', textDecoration: 'none',
                      fontSize: 15, fontWeight: 700,
                      color: active ? '#F97316' : '#333',
                      borderBottom: '1px solid #f5f5f5', position: 'relative',
                    }}>
                      <Icon size={17} /> {label[lang]}
                      {isChatLink && unread > 0 && (
                        <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 999, marginLeft: 4 }}>{unread}</span>
                      )}
                    </Link>
                  )
                })}
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 8px',
                    textDecoration: 'none', fontSize: 15, fontWeight: 700, color: '#7c3aed',
                    borderBottom: '1px solid #f5f5f5',
                  }}>
                    <Shield size={17} /> {c.admin}
                  </Link>
                )}

                {/* Language toggle — mobile */}
                <div style={{ display: 'flex', border: '1.5px solid #e5e7eb', borderRadius: 999, overflow: 'hidden', width: 'fit-content', margin: '12px 8px 0' }}>
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

                {/* Mobile user section */}
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f5f5f5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px 12px' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, backgroundColor: '#f5f5f5', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {userProfile?.photoURL
                        ? <img src={userProfile.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 15, fontWeight: 800, color: '#F97316' }}>{avatarLetter}</span>}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#000' }}>{userProfile?.displayName || c.defaultUser}</div>
                      <div style={{ fontSize: 11, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                    </div>
                  </div>
                  <button onClick={() => { setMobileOpen(false); setShowEditProfile(true) }} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px',
                    width: '100%', textAlign: 'left', background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#333',
                    fontFamily: 'Space Grotesk, sans-serif', borderBottom: '1px solid #f5f5f5',
                  }}>
                    <UserPen size={16} /> {c.editProfile}
                  </button>
                  <button onClick={() => { setMobileOpen(false); logout() }} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px',
                    width: '100%', textAlign: 'left', background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#ef4444',
                    fontFamily: 'Space Grotesk, sans-serif',
                  }}>
                    <LogOut size={16} /> {c.signOut}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {showEditProfile && <EditProfileModal onClose={() => setShowEditProfile(false)} />}

      <style>{`
        @media (max-width: 640px) {
          .app-desktop-nav { display: none !important; }
          .app-mobile-controls { display: flex !important; }
        }
      `}</style>
    </>
  )
}
