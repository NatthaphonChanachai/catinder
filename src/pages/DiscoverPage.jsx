import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  collection, query, where, getDocs, doc, setDoc, getDoc, serverTimestamp,
} from 'firebase/firestore'
import { Heart, X, MapPin, Plus, RefreshCw, Syringe, Scissors, PawPrint, MessageCircle } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { Link as RouterLink } from 'react-router-dom'

const LOOKING_LABELS = { mate: 'หาคู่', friend: 'หาเพื่อน', adopt: 'หาบ้าน', any: 'ทุกอย่าง' }

function CatSwipeCard({ cat, isTop, zIndex, stackScale, stackOffset, onSwipe, onRegisterTrigger }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-240, 240], [-25, 25])
  const likeOpacity = useTransform(x, [20, 120], [0, 1])
  const passOpacity = useTransform(x, [-120, -20], [1, 0])
  const controls = useAnimation()

  const triggerSwipe = useCallback(async (direction) => {
    await controls.start({
      x: direction === 'right' ? 1100 : -1100, rotate: direction === 'right' ? 24 : -24,
      opacity: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
    })
    onSwipe(direction, cat)
  }, [controls, onSwipe, cat])

  useEffect(() => {
    if (isTop && onRegisterTrigger) onRegisterTrigger(triggerSwipe)
  }, [isTop, triggerSwipe, onRegisterTrigger])

  const handleDragEnd = useCallback((_, info) => {
    if (info.offset.x > 100) triggerSwipe('right')
    else if (info.offset.x < -100) triggerSwipe('left')
    else controls.start({ x: 0, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 26 } })
  }, [controls, triggerSwipe])

  const ageStr = cat.ageYears > 0
    ? `${cat.ageYears} ปี${cat.ageMonths > 0 ? ` ${cat.ageMonths} เดือน` : ''}`
    : cat.ageMonths > 0 ? `${cat.ageMonths} เดือน` : ''

  return (
    <motion.div
      animate={isTop ? controls : undefined}
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 460,
        x: isTop ? x : 0, rotate: isTop ? rotate : 0,
        zIndex, scale: stackScale, y: stackOffset,
        borderRadius: 22, overflow: 'hidden',
        cursor: isTop ? 'grab' : 'default',
        boxShadow: isTop ? '0 16px 48px rgba(0,0,0,0.16)' : '0 4px 16px rgba(0,0,0,0.06)',
        touchAction: 'none', userSelect: 'none', transformOrigin: 'top center',
        backgroundColor: '#f5f5f5',
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileTap={isTop ? { cursor: 'grabbing' } : {}}
    >
      {cat.photoURL
        ? <img src={cat.photoURL} alt={cat.name} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
        : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #fff7ed, #fed7aa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PawPrint size={72} color="#fdba74" />
          </div>
      }

      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 25%, rgba(0,0,0,0.78) 100%)' }} />

      {isTop && (
        <motion.div style={{
          position: 'absolute', top: 22, left: 18, opacity: likeOpacity,
          border: '2.5px solid #F97316', color: '#F97316', fontSize: 16, fontWeight: 900,
          padding: '4px 14px', borderRadius: 10, transform: 'rotate(-12deg)',
          fontFamily: 'Space Grotesk, sans-serif', backgroundColor: 'rgba(0,0,0,0.4)',
          letterSpacing: 1,
        }}>LIKE</motion.div>
      )}
      {isTop && (
        <motion.div style={{
          position: 'absolute', top: 22, right: 18, opacity: passOpacity,
          border: '2.5px solid #ef4444', color: '#ef4444', fontSize: 16, fontWeight: 900,
          padding: '4px 14px', borderRadius: 10, transform: 'rotate(12deg)',
          fontFamily: 'Space Grotesk, sans-serif', backgroundColor: 'rgba(0,0,0,0.4)',
          letterSpacing: 1,
        }}>NOPE</motion.div>
      )}

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '18px 18px 22px', fontFamily: 'Space Grotesk, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 5 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
              {cat.name} <span style={{ fontSize: 16, fontWeight: 600 }}>{cat.gender === 'male' ? '(ตัวผู้)' : '(ตัวเมีย)'}</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600, marginTop: 2 }}>
              {cat.breed}{ageStr ? ` · ${ageStr}` : ''}
            </div>
          </div>
          {cat.lookingFor && (
            <div style={{ backgroundColor: 'rgba(249,115,22,0.8)', padding: '4px 11px', borderRadius: 999, fontSize: 11, fontWeight: 800, color: '#fff' }}>
              {LOOKING_LABELS[cat.lookingFor] || cat.lookingFor}
            </div>
          )}
        </div>

        {cat.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            <MapPin size={11} color="rgba(255,255,255,0.6)" />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{cat.location}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 600, color: '#fff' }}>
            {cat.ownerName}
          </span>
          {cat.vaccinated && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, backgroundColor: 'rgba(16,185,129,0.25)', borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 600, color: '#fff' }}>
              <Syringe size={10} /> วัคซีนครบ
            </span>
          )}
          {cat.sterilized && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, backgroundColor: 'rgba(99,102,241,0.25)', borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 600, color: '#fff' }}>
              <Scissors size={10} /> ทำหมัน
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function MatchModal({ match, onClose }) {
  return (
    <AnimatePresence>
      {match && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 3000,
            backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#fff', borderRadius: 24, padding: '40px 32px',
              textAlign: 'center', maxWidth: 340, width: '100%',
              boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Heart size={32} color="#ef4444" fill="#ef4444" />
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#F97316', letterSpacing: '0.12em', marginBottom: 6, textTransform: 'uppercase' }}>
              It's a Match!
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#000', marginBottom: 8 }}>
              คุณ Match กับ<br />{match.otherName}
            </h2>
            <p style={{ fontSize: 13, color: '#888', fontWeight: 500, lineHeight: 1.6, marginBottom: 26 }}>
              เริ่มต้นพูดคุยกับ {match.otherName} ได้เลย
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/chat" onClick={onClose} style={{
                flex: 1, padding: '12px', borderRadius: 11,
                backgroundColor: '#F97316', color: '#fff',
                textDecoration: 'none', fontSize: 14, fontWeight: 800, textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              }}>
                <MessageCircle size={15} /> แชทเลย
              </Link>
              <button onClick={onClose} style={{
                flex: 1, padding: '12px', borderRadius: 11,
                border: '1.5px solid #e5e7eb', backgroundColor: '#fff',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                color: '#555', fontFamily: 'Space Grotesk, sans-serif',
              }}>
                Discover ต่อ
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function DiscoverPage() {
  const { user, userProfile } = useAuth()
  const [cats, setCats] = useState([])
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [match, setMatch] = useState(null)
  const [noCats, setNoCats] = useState(false)
  const swipeTrigger = useRef(null)

  useEffect(() => { if (user) loadCats() }, [user])

  const loadCats = async () => {
    setLoading(true)
    try {
      const myCatsSnap = await getDocs(query(collection(db, 'cats'), where('ownerId', '==', user.uid)))
      if (myCatsSnap.empty) { setNoCats(true); setLoading(false); return }

      const [likesSnap, passesSnap] = await Promise.all([
        getDocs(query(collection(db, 'likes'), where('fromUserId', '==', user.uid))),
        getDocs(query(collection(db, 'passes'), where('fromUserId', '==', user.uid))),
      ])
      const seen = new Set([
        ...likesSnap.docs.map(d => d.data().toCatId),
        ...passesSnap.docs.map(d => d.data().toCatId),
      ])

      const allCatsSnap = await getDocs(query(collection(db, 'cats'), where('ownerId', '!=', user.uid)))
      const unseen = allCatsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => !seen.has(c.id))
      setCats(unseen)
      setIdx(0)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handleSwipe = useCallback(async (direction, cat) => {
    if (!user || !cat) return
    setIdx(i => i + 1)

    try {
      if (direction === 'right') {
        await setDoc(doc(db, 'likes', `${user.uid}_${cat.id}`), {
          fromUserId: user.uid, toCatId: cat.id, toOwnerId: cat.ownerId, createdAt: serverTimestamp(),
        })
        const reverseSnap = await getDocs(query(collection(db, 'likes'), where('fromUserId', '==', cat.ownerId)))
        const hasReverseLike = reverseSnap.docs.some(d => d.data().toOwnerId === user.uid)
        if (hasReverseLike) {
          const uids = [user.uid, cat.ownerId].sort()
          const matchId = uids.join('_')
          const existing = await getDoc(doc(db, 'matches', matchId))
          if (!existing.exists()) {
            const names = { [user.uid]: userProfile?.displayName || user.email.split('@')[0], [cat.ownerId]: cat.ownerName }
            const photos = { [user.uid]: userProfile?.photoURL || '', [cat.ownerId]: cat.ownerPhotoURL || '' }
            await setDoc(doc(db, 'matches', matchId), { users: uids, userNames: names, userPhotos: photos, createdAt: serverTimestamp() })
            await setDoc(doc(db, 'chats', matchId), { participants: uids, participantNames: names, participantPhotos: photos, matchId, lastMessage: '', lastMessageAt: null, createdAt: serverTimestamp() })
            confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 }, colors: ['#F97316', '#fb923c', '#fff'] })
            setMatch({ otherName: cat.ownerName })
            if (Notification?.permission === 'granted') {
              new Notification('Match ใหม่!', { body: `คุณ Match กับ ${cat.ownerName}`, icon: '/favicon.svg' })
            }
          }
        } else {
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 }, colors: ['#F97316', '#fff'], startVelocity: 28, gravity: 1 })
        }
      } else {
        await setDoc(doc(db, 'passes', `${user.uid}_${cat.id}`), { fromUserId: user.uid, toCatId: cat.id, createdAt: serverTimestamp() })
      }
    } catch (e) {
      console.error('handleSwipe error:', e)
    }
  }, [user, userProfile])

  const visibleCats = cats.slice(idx, idx + 3)
  const isDone = idx >= cats.length && cats.length > 0

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <PawPrint size={40} color="#F97316" style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 14, color: '#aaa', fontWeight: 600 }}>กำลังโหลด...</p>
      </div>
    </div>
  )

  if (noCats) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 320 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <PawPrint size={36} color="#F97316" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#000', marginBottom: 8 }}>สร้างโปรไฟล์แมวก่อนเลย</h2>
        <p style={{ fontSize: 13, color: '#888', fontWeight: 500, marginBottom: 22, lineHeight: 1.6 }}>
          คุณต้องมีโปรไฟล์แมวอย่างน้อย 1 ตัว
        </p>
        <Link to="/my-cats/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          backgroundColor: '#F97316', color: '#fff', padding: '12px 24px', borderRadius: 11,
          textDecoration: 'none', fontSize: 14, fontWeight: 800,
        }}>
          <Plus size={15} /> เพิ่มโปรไฟล์แมว
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#f8f8f8', fontFamily: 'Space Grotesk, sans-serif', paddingBottom: 80 }}>
      <MatchModal match={match} onClose={() => setMatch(null)} />

      <div style={{ maxWidth: 420, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#000', marginBottom: 4 }}>Discover</h1>
          <p style={{ fontSize: 13, color: '#aaa', fontWeight: 500 }}>ลากขวา Like · ลากซ้าย Pass</p>
        </div>

        {isDone || cats.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              height: 460, borderRadius: 22, border: '2px dashed #e5e7eb',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 12, backgroundColor: '#fff', textAlign: 'center', padding: 28,
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PawPrint size={32} color="#F97316" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#000' }}>
              {cats.length === 0 ? 'ยังไม่มีแมวในระบบ' : 'ดูครบทุกตัวแล้ว'}
            </h3>
            <p style={{ fontSize: 13, color: '#888', fontWeight: 500, lineHeight: 1.6 }}>
              {cats.length === 0 ? 'ชวนเพื่อนมาสร้างโปรไฟล์แมวด้วยกัน' : 'รอแมวใหม่เข้าระบบ หรือ refresh'}
            </p>
            <button onClick={loadCats} style={{
              display: 'flex', alignItems: 'center', gap: 7, backgroundColor: '#F97316', color: '#fff',
              padding: '11px 22px', borderRadius: 11, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif',
            }}>
              <RefreshCw size={13} /> Refresh
            </button>
          </motion.div>
        ) : (
          <div style={{ position: 'relative', height: 510 }}>
            {[...visibleCats].reverse().map((cat, revI) => {
              const i = visibleCats.length - 1 - revI
              const isTop = i === 0
              return (
                <CatSwipeCard key={cat.id} cat={cat} isTop={isTop}
                  zIndex={visibleCats.length - i} stackScale={1 - i * 0.04} stackOffset={i * 14}
                  onSwipe={handleSwipe}
                  onRegisterTrigger={isTop ? fn => { swipeTrigger.current = fn } : null}
                />
              )
            })}
          </div>
        )}

        {!isDone && cats.length > 0 && (
          <>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', fontWeight: 600, margin: '12px 0 20px' }}>
              {cats.length - idx} แมวรอให้ค้นพบ
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
              <motion.button onClick={() => swipeTrigger.current?.('left')} whileTap={{ scale: 0.88 }} whileHover={{ scale: 1.08 }}
                style={{
                  width: 60, height: 60, borderRadius: '50%', backgroundColor: '#fff',
                  border: '2px solid #fecaca', boxShadow: '0 4px 16px rgba(239,68,68,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#fecaca'}
              >
                <X size={24} color="#ef4444" strokeWidth={2.5} />
              </motion.button>
              <motion.button onClick={() => swipeTrigger.current?.('right')} whileTap={{ scale: 0.88 }} whileHover={{ scale: 1.08 }}
                style={{
                  width: 60, height: 60, borderRadius: '50%', backgroundColor: '#F97316',
                  border: '2px solid #F97316', boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
              >
                <Heart size={24} color="#fff" fill="#fff" strokeWidth={2} />
              </motion.button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
