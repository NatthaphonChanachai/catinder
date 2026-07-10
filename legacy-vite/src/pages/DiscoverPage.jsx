import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  collection, query, where, getDocs, doc, setDoc, getDoc, serverTimestamp,
} from 'firebase/firestore'
import { Heart, X, MapPin, Plus, RefreshCw, Syringe, Scissors, PawPrint, MessageCircle, SlidersHorizontal, RotateCcw } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { Link as RouterLink } from 'react-router-dom'
import { BREEDS, REGISTRY_OPTIONS, LOOKING_FOR_LABELS } from '../constants/catOptions'
import { getCurrentPosition, haversineKm } from '../utils/geo'
import { useLanguage } from '../contexts/LanguageContext'

const LOOKING_LABELS = LOOKING_FOR_LABELS
const MAX_RADIUS_KM = 50
const REGISTRY_FILTER_OPTIONS = REGISTRY_OPTIONS.filter(o => o.value)

const COPY = {
  th: {
    male: '(ตัวผู้)', female: '(ตัวเมีย)',
    years: 'ปี', months: 'เดือน', km: 'กม.',
    vaccinated: 'วัคซีนครบ', sterilized: 'ทำหมัน',
    like: 'LIKE', nope: 'NOPE',
    registryCompatible: (otherReg) => `✅ ทั้งคู่อยู่ใน ${otherReg} — ออกใบ Pedigree ได้`,
    registryIncompatible: (myReg, otherReg) => `⚠️ แมวคุณอยู่ใน ${myReg} · แมวนี้อยู่ใน ${otherReg}`,
    registryWarningDetail: 'ลูกแมวอาจออกใบเพ็ดดีกรีไม่ได้ เนื่องจากพ่อแม่อยู่ต่างชมรม',
    itsAMatch: "It's a Match!",
    matchedWith: (name) => <>คุณ Match กับ<br />{name}</>,
    startChatting: (name) => `เริ่มต้นพูดคุยกับ ${name} ได้เลย`,
    chatNow: 'แชทเลย',
    keepDiscovering: 'Discover ต่อ',
    preparePedigree: '📋 เตรียมเอกสาร Pedigree',
    filters: 'ตัวกรอง',
    clearFilters: 'ล้างตัวกรอง',
    distanceRadius: 'รัศมีระยะทาง',
    all: 'ทั้งหมด',
    enableLocationForFilter: 'เปิดสิทธิ์เข้าถึงตำแหน่งของเบราว์เซอร์เพื่อใช้ตัวกรองนี้',
    breed: 'สายพันธุ์',
    registryLabel: 'ชมรม / Registry',
    lookingForLabel: 'กำลังมองหา',
    applyFilters: 'ใช้ตัวกรอง',
    loading: 'กำลังโหลด...',
    createCatProfileFirst: 'สร้างโปรไฟล์แมวก่อนเลย',
    needAtLeastOneCat: 'คุณต้องมีโปรไฟล์แมวอย่างน้อย 1 ตัว',
    addCatProfile: 'เพิ่มโปรไฟล์แมว',
    swipeHint: 'ลากขวา Like · ลากซ้าย Pass',
    noCatsInSystem: 'ยังไม่มีแมวในระบบ',
    noCatsMatchFilter: 'ไม่พบแมวตามตัวกรอง',
    seenAllCats: 'ดูครบทุกตัวแล้ว',
    inviteFriends: 'ชวนเพื่อนมาสร้างโปรไฟล์แมวด้วยกัน',
    tryAdjustFilter: 'ลองปรับรัศมีหรือล้างตัวกรองดู',
    waitForNewCats: 'รอแมวใหม่เข้าระบบ หรือ refresh',
    refresh: 'Refresh',
    catsWaiting: (n) => `${n} แมวรอให้ค้นพบ`,
    unknown: 'ไม่ทราบ',
    newMatchNotifTitle: 'Match ใหม่!',
    newMatchNotifBody: (name) => `คุณ Match กับ ${name}`,
  },
  en: {
    male: '(Male)', female: '(Female)',
    years: 'yrs', months: 'mo', km: 'km',
    vaccinated: 'Vaccinated', sterilized: 'Sterilized',
    like: 'LIKE', nope: 'NOPE',
    registryCompatible: (otherReg) => `✅ Both in ${otherReg} — Pedigree can be issued`,
    registryIncompatible: (myReg, otherReg) => `⚠️ Your cat is in ${myReg} · This cat is in ${otherReg}`,
    registryWarningDetail: 'Kittens may not be eligible for a pedigree certificate since the parents belong to different registries.',
    itsAMatch: "It's a Match!",
    matchedWith: (name) => <>You matched with<br />{name}</>,
    startChatting: (name) => `Start chatting with ${name} now`,
    chatNow: 'Chat Now',
    keepDiscovering: 'Keep Discovering',
    preparePedigree: '📋 Prepare Pedigree Documents',
    filters: 'Filters',
    clearFilters: 'Clear Filters',
    distanceRadius: 'Distance Radius',
    all: 'All',
    enableLocationForFilter: 'Enable browser location access to use this filter',
    breed: 'Breed',
    registryLabel: 'Club / Registry',
    lookingForLabel: 'Looking For',
    applyFilters: 'Apply Filters',
    loading: 'Loading...',
    createCatProfileFirst: 'Create a Cat Profile First',
    needAtLeastOneCat: 'You need at least 1 cat profile',
    addCatProfile: 'Add Cat Profile',
    swipeHint: 'Swipe right to Like · Swipe left to Pass',
    noCatsInSystem: 'No cats in the system yet',
    noCatsMatchFilter: 'No cats match your filters',
    seenAllCats: "You've seen them all",
    inviteFriends: 'Invite friends to create cat profiles too',
    tryAdjustFilter: 'Try adjusting the radius or clearing filters',
    waitForNewCats: 'Wait for new cats to join, or refresh',
    refresh: 'Refresh',
    catsWaiting: (n) => `${n} cats waiting to be discovered`,
    unknown: 'Unknown',
    newMatchNotifTitle: 'New Match!',
    newMatchNotifBody: (name) => `You matched with ${name}`,
  },
}

function CatSwipeCard({ cat, isTop, zIndex, stackScale, stackOffset, onSwipe, onRegisterTrigger, distanceKm }) {
  const { lang } = useLanguage()
  const c = COPY[lang]
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
    ? `${cat.ageYears} ${c.years}${cat.ageMonths > 0 ? ` ${cat.ageMonths} ${c.months}` : ''}`
    : cat.ageMonths > 0 ? `${cat.ageMonths} ${c.months}` : ''

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
        }}>{c.like}</motion.div>
      )}
      {isTop && (
        <motion.div style={{
          position: 'absolute', top: 22, right: 18, opacity: passOpacity,
          border: '2.5px solid #ef4444', color: '#ef4444', fontSize: 16, fontWeight: 900,
          padding: '4px 14px', borderRadius: 10, transform: 'rotate(12deg)',
          fontFamily: 'Space Grotesk, sans-serif', backgroundColor: 'rgba(0,0,0,0.4)',
          letterSpacing: 1,
        }}>{c.nope}</motion.div>
      )}

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '18px 18px 22px', fontFamily: 'Space Grotesk, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 5 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
              {cat.name} <span style={{ fontSize: 16, fontWeight: 600 }}>{cat.gender === 'male' ? c.male : c.female}</span>
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

        {(cat.location || distanceKm != null) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            <MapPin size={11} color="rgba(255,255,255,0.6)" />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
              {cat.location}{cat.location && distanceKm != null ? ' · ' : ''}{distanceKm != null ? `${distanceKm.toFixed(1)} ${c.km}` : ''}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 600, color: '#fff' }}>
            {cat.ownerName}
          </span>
          {cat.vaccinated && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, backgroundColor: 'rgba(16,185,129,0.25)', borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 600, color: '#fff' }}>
              <Syringe size={10} /> {c.vaccinated}
            </span>
          )}
          {cat.sterilized && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, backgroundColor: 'rgba(99,102,241,0.25)', borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 600, color: '#fff' }}>
              <Scissors size={10} /> {c.sterilized}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function RegistryBadge({ match, myCats }) {
  const { lang } = useLanguage()
  const c = COPY[lang]
  const otherReg = match?.otherRegistry
  if (!otherReg) return null
  const myReg = myCats.find(cat => cat.registry)?.registry
  if (!myReg) return null
  const compatible = myReg === otherReg
  return (
    <div style={{
      borderRadius: 10, padding: '10px 14px', marginBottom: 18,
      backgroundColor: compatible ? 'rgba(16,185,129,0.07)' : 'rgba(249,115,22,0.07)',
      border: compatible ? '1px solid #a7f3d0' : '1px solid #fed7aa',
      textAlign: 'left',
    }}>
      <div style={{
        fontSize: 12, fontWeight: 800,
        color: compatible ? '#065f46' : '#92400e', marginBottom: 3,
      }}>
        {compatible
          ? c.registryCompatible(otherReg)
          : c.registryIncompatible(myReg, otherReg)}
      </div>
      {!compatible && (
        <div style={{ fontSize: 11, color: '#78350f', fontWeight: 500, lineHeight: 1.5 }}>
          {c.registryWarningDetail}
        </div>
      )}
    </div>
  )
}

function MatchModal({ match, myCats, onClose }) {
  const { lang } = useLanguage()
  const c = COPY[lang]
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
              backgroundColor: '#fff', borderRadius: 24, padding: '32px 28px',
              textAlign: 'center', maxWidth: 360, width: '100%',
              boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Heart size={32} color="#ef4444" fill="#ef4444" />
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#F97316', letterSpacing: '0.12em', marginBottom: 6, textTransform: 'uppercase' }}>
              {c.itsAMatch}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#000', marginBottom: 8 }}>
              {c.matchedWith(match.otherName)}
            </h2>
            <p style={{ fontSize: 13, color: '#888', fontWeight: 500, lineHeight: 1.6, marginBottom: 18 }}>
              {c.startChatting(match.otherName)}
            </p>

            <RegistryBadge match={match} myCats={myCats} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/chat" onClick={onClose} style={{
                  flex: 1, padding: '11px', borderRadius: 11,
                  backgroundColor: '#F97316', color: '#fff',
                  textDecoration: 'none', fontSize: 13, fontWeight: 800, textAlign: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                }}>
                  <MessageCircle size={14} /> {c.chatNow}
                </Link>
                <button onClick={onClose} style={{
                  flex: 1, padding: '11px', borderRadius: 11,
                  border: '1.5px solid #e5e7eb', backgroundColor: '#fff',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  color: '#555', fontFamily: 'Space Grotesk, sans-serif',
                }}>
                  {c.keepDiscovering}
                </button>
              </div>
              {match.otherRegistry && (
                <Link to={`/pedigree?matchId=${match.matchId || ''}`} onClick={onClose} style={{
                  padding: '10px', borderRadius: 11,
                  border: '1.5px solid #fed7aa', backgroundColor: '#fff7ed',
                  color: '#F97316', textDecoration: 'none',
                  fontSize: 13, fontWeight: 800, textAlign: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                }}>
                  {c.preparePedigree}
                </Link>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ChipGroup({ options, selected, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
      {options.map(({ value, label }) => {
        const active = selected.includes(value)
        return (
          <button key={value} type="button" onClick={() => onToggle(value)} style={{
            padding: '7px 13px', borderRadius: 999,
            border: active ? 'none' : '1.5px solid #e5e7eb',
            background: active ? 'linear-gradient(135deg,#F97316,#F59E0B)' : '#fff',
            color: active ? '#fff' : '#555',
            fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Space Grotesk, sans-serif',
          }}>{label}</button>
        )
      })}
    </div>
  )
}

function FilterPanel({ open, onClose, filters, setFilters, myLocation }) {
  const { lang } = useLanguage()
  const c = COPY[lang]
  const toggleIn = (key, value) => setFilters(f => ({
    ...f, [key]: f[key].includes(value) ? f[key].filter(v => v !== value) : [...f[key], value],
  }))
  const reset = () => setFilters({ radiusKm: MAX_RADIUS_KM, breeds: [], registries: [], lookingFor: [] })

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, zIndex: 3000, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#fff', borderRadius: '22px 22px 0 0', padding: '22px 20px 28px',
              maxWidth: 420, width: '100%', maxHeight: '82dvh', overflowY: 'auto',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: '#000', margin: 0 }}>{c.filters}</h2>
              <button onClick={reset} style={{
                display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
                color: '#F97316', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Space Grotesk, sans-serif',
              }}><RotateCcw size={12} /> {c.clearFilters}</button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#1C1917' }}>{c.distanceRadius}</label>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#F97316' }}>
                  {filters.radiusKm >= MAX_RADIUS_KM ? c.all : `${filters.radiusKm} ${c.km}`}
                </span>
              </div>
              <input type="range" min={1} max={MAX_RADIUS_KM} value={filters.radiusKm} disabled={!myLocation}
                onChange={e => setFilters(f => ({ ...f, radiusKm: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#F97316', opacity: myLocation ? 1 : 0.4 }}
              />
              {!myLocation && (
                <p style={{ fontSize: 11, color: '#aaa', fontWeight: 600, marginTop: 4 }}>
                  {c.enableLocationForFilter}
                </p>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#1C1917', marginBottom: 8 }}>{c.breed}</label>
              <ChipGroup options={BREEDS.map(b => ({ value: b, label: b }))} selected={filters.breeds} onToggle={v => toggleIn('breeds', v)} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#1C1917', marginBottom: 8 }}>{c.registryLabel}</label>
              <ChipGroup options={REGISTRY_FILTER_OPTIONS} selected={filters.registries} onToggle={v => toggleIn('registries', v)} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#1C1917', marginBottom: 8 }}>{c.lookingForLabel}</label>
              <ChipGroup options={Object.entries(LOOKING_LABELS).map(([value, label]) => ({ value, label }))} selected={filters.lookingFor} onToggle={v => toggleIn('lookingFor', v)} />
            </div>

            <button onClick={onClose} style={{
              width: '100%', padding: '13px 0', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg,#F97316,#F59E0B)', color: '#fff',
              fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
            }}>{c.applyFilters}</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function DiscoverPage() {
  const { user, userProfile } = useAuth()
  const { lang } = useLanguage()
  const c = COPY[lang]
  const [cats, setCats] = useState([])
  const [myCats, setMyCats] = useState([])
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [match, setMatch] = useState(null)
  const [noCats, setNoCats] = useState(false)
  const [myLocation, setMyLocation] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({ radiusKm: MAX_RADIUS_KM, breeds: [], registries: [], lookingFor: [] })
  const swipeTrigger = useRef(null)

  useEffect(() => {
    if (user) {
      loadCats()
      checkMissedMatches()
    }
  }, [user])

  useEffect(() => {
    getCurrentPosition().then(setMyLocation).catch(() => setMyLocation(null))
  }, [])

  const filtersActive = filters.breeds.length > 0 || filters.registries.length > 0
    || filters.lookingFor.length > 0 || (myLocation && filters.radiusKm < MAX_RADIUS_KM)

  const catDistances = useMemo(() => {
    const map = new Map()
    if (!myLocation) return map
    for (const c of cats) {
      if (typeof c.lat === 'number' && typeof c.lng === 'number') {
        map.set(c.id, haversineKm(myLocation.lat, myLocation.lng, c.lat, c.lng))
      }
    }
    return map
  }, [cats, myLocation])

  const filteredCats = useMemo(() => {
    return cats.filter(c => {
      if (filters.breeds.length > 0 && !filters.breeds.includes(c.breed)) return false
      if (filters.registries.length > 0 && !filters.registries.includes(c.registry)) return false
      if (filters.lookingFor.length > 0) {
        const lf = Array.isArray(c.lookingFor) ? c.lookingFor : (c.lookingFor ? [c.lookingFor] : [])
        if (!filters.lookingFor.some(v => lf.includes(v))) return false
      }
      if (myLocation && filters.radiusKm < MAX_RADIUS_KM) {
        const d = catDistances.get(c.id)
        if (d == null || d > filters.radiusKm) return false
      }
      return true
    })
  }, [cats, filters, myLocation, catDistances])

  useEffect(() => { setIdx(0) }, [filters])

  const checkMissedMatches = async () => {
    try {
      const myLikesSnap = await getDocs(query(collection(db, 'likes'), where('fromUserId', '==', user.uid)))
      for (const likeDoc of myLikesSnap.docs) {
        const { toOwnerId, toCatId } = likeDoc.data()
        if (!toOwnerId) continue
        const reverseLikesSnap = await getDocs(query(collection(db, 'likes'), where('fromUserId', '==', toOwnerId)))
        const hasReverse = reverseLikesSnap.docs.some(d => d.data().toOwnerId === user.uid)
        if (!hasReverse) continue
        const uids = [user.uid, toOwnerId].sort()
        const matchId = uids.join('_')
        let alreadyExists = false
        try {
          const existing = await getDoc(doc(db, 'matches', matchId))
          alreadyExists = existing.exists()
        } catch { alreadyExists = false }
        if (alreadyExists) continue
        const catSnap = await getDoc(doc(db, 'cats', toCatId))
        const catData = catSnap.exists() ? catSnap.data() : {}
        const names = {
          [user.uid]: userProfile?.displayName || user.email.split('@')[0],
          [toOwnerId]: catData.ownerName || c.unknown,
        }
        const photos = {
          [user.uid]: userProfile?.photoURL || '',
          [toOwnerId]: catData.ownerPhotoURL || '',
        }
        await setDoc(doc(db, 'matches', matchId), { users: uids, userNames: names, userPhotos: photos, createdAt: serverTimestamp() })
        await setDoc(doc(db, 'chats', matchId), { participants: uids, participantNames: names, participantPhotos: photos, matchId, lastMessage: '', lastMessageAt: null, createdAt: serverTimestamp() })
      }
    } catch (e) {
      console.error('checkMissedMatches error:', e)
    }
  }

  const loadCats = async () => {
    setLoading(true)
    try {
      const myCatsSnap = await getDocs(query(collection(db, 'cats'), where('ownerId', '==', user.uid)))
      const myCatsData = myCatsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      setMyCats(myCatsData)
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
          let alreadyExists = false
          try {
            const existing = await getDoc(doc(db, 'matches', matchId))
            alreadyExists = existing.exists()
          } catch { alreadyExists = false }
          if (!alreadyExists) {
            const names = { [user.uid]: userProfile?.displayName || user.email.split('@')[0], [cat.ownerId]: cat.ownerName }
            const photos = { [user.uid]: userProfile?.photoURL || '', [cat.ownerId]: cat.ownerPhotoURL || '' }
            await setDoc(doc(db, 'matches', matchId), { users: uids, userNames: names, userPhotos: photos, createdAt: serverTimestamp() })
            await setDoc(doc(db, 'chats', matchId), { participants: uids, participantNames: names, participantPhotos: photos, matchId, lastMessage: '', lastMessageAt: null, createdAt: serverTimestamp() })
            confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 }, colors: ['#F97316', '#fb923c', '#fff'] })
            setMatch({ otherName: cat.ownerName, otherRegistry: cat.registry || '', catId: cat.id, matchId })
            if (Notification?.permission === 'granted') {
              new Notification(c.newMatchNotifTitle, { body: c.newMatchNotifBody(cat.ownerName), icon: '/favicon.svg' })
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

  const visibleCats = filteredCats.slice(idx, idx + 3)
  const isDone = idx >= filteredCats.length && filteredCats.length > 0

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <PawPrint size={40} color="#F97316" style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 14, color: '#aaa', fontWeight: 600 }}>{c.loading}</p>
      </div>
    </div>
  )

  if (noCats) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 320 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <PawPrint size={36} color="#F97316" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#000', marginBottom: 8 }}>{c.createCatProfileFirst}</h2>
        <p style={{ fontSize: 13, color: '#888', fontWeight: 500, marginBottom: 22, lineHeight: 1.6 }}>
          {c.needAtLeastOneCat}
        </p>
        <Link to="/my-cats/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          backgroundColor: '#F97316', color: '#fff', padding: '12px 24px', borderRadius: 11,
          textDecoration: 'none', fontSize: 14, fontWeight: 800,
        }}>
          <Plus size={15} /> {c.addCatProfile}
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#f8f8f8', fontFamily: 'Space Grotesk, sans-serif', paddingBottom: 80 }}>
      <MatchModal match={match} myCats={myCats} onClose={() => setMatch(null)} />
      <FilterPanel open={filtersOpen} onClose={() => setFiltersOpen(false)} filters={filters} setFilters={setFilters} myLocation={myLocation} />

      <div style={{ maxWidth: 420, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#000', marginBottom: 4 }}>Discover</h1>
            <p style={{ fontSize: 13, color: '#aaa', fontWeight: 500 }}>{c.swipeHint}</p>
          </div>
          <button onClick={() => setFiltersOpen(true)} style={{
            position: 'absolute', right: 0, top: 0,
            width: 38, height: 38, borderRadius: '50%',
            border: filtersActive ? '1.5px solid #F97316' : '1.5px solid #e5e7eb',
            backgroundColor: filtersActive ? 'rgba(249,115,22,0.08)' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <SlidersHorizontal size={16} color={filtersActive ? '#F97316' : '#888'} />
          </button>
        </div>

        {isDone || filteredCats.length === 0 ? (
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
              {cats.length === 0 ? c.noCatsInSystem : filteredCats.length === 0 ? c.noCatsMatchFilter : c.seenAllCats}
            </h3>
            <p style={{ fontSize: 13, color: '#888', fontWeight: 500, lineHeight: 1.6 }}>
              {cats.length === 0 ? c.inviteFriends : filteredCats.length === 0 ? c.tryAdjustFilter : c.waitForNewCats}
            </p>
            {filteredCats.length === 0 && cats.length > 0 ? (
              <button onClick={() => setFilters({ radiusKm: MAX_RADIUS_KM, breeds: [], registries: [], lookingFor: [] })} style={{
                display: 'flex', alignItems: 'center', gap: 7, backgroundColor: '#F97316', color: '#fff',
                padding: '11px 22px', borderRadius: 11, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif',
              }}>
                <RotateCcw size={13} /> {c.clearFilters}
              </button>
            ) : (
              <button onClick={loadCats} style={{
                display: 'flex', alignItems: 'center', gap: 7, backgroundColor: '#F97316', color: '#fff',
                padding: '11px 22px', borderRadius: 11, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif',
              }}>
                <RefreshCw size={13} /> {c.refresh}
              </button>
            )}
          </motion.div>
        ) : (
          <div style={{ position: 'relative', height: 510 }}>
            {[...visibleCats].reverse().map((cat, revI) => {
              const i = visibleCats.length - 1 - revI
              const isTop = i === 0
              return (
                <CatSwipeCard key={cat.id} cat={cat} isTop={isTop}
                  zIndex={visibleCats.length - i} stackScale={1 - i * 0.04} stackOffset={i * 14}
                  onSwipe={handleSwipe} distanceKm={catDistances.get(cat.id)}
                  onRegisterTrigger={isTop ? fn => { swipeTrigger.current = fn } : null}
                />
              )
            })}
          </div>
        )}

        {!isDone && filteredCats.length > 0 && (
          <>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', fontWeight: 600, margin: '12px 0 20px' }}>
              {c.catsWaiting(filteredCats.length - idx)}
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
