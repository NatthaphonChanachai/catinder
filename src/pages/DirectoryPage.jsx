import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection, getDocs, addDoc, query, orderBy, where,
  serverTimestamp, doc, updateDoc, increment,
} from 'firebase/firestore'
import {
  MapPin, Phone, Clock, Globe, Search, ExternalLink,
  Home, Coffee, HeartPulse, Stethoscope, Fish, TreePine, Hotel,
  Star, X, Send, Navigation, Banknote, Gift,
} from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { getCurrentPosition, haversineKm } from '../utils/geo'
import { loadProvinces } from '../utils/thailandGeo'

const CATEGORIES = [
  { value: 'all', label: 'ทั้งหมด', icon: MapPin },
  { value: 'farm', label: 'ฟาร์มแมว', icon: Home },
  { value: 'cafe', label: 'คาเฟ่แมว', icon: Coffee },
  { value: 'vet', label: 'โรงพยาบาลสัตว์', icon: HeartPulse },
  { value: 'clinic', label: 'คลินิก', icon: Stethoscope },
  { value: 'food', label: 'ร้านอาหารแมว', icon: Fish },
  { value: 'place', label: 'ที่เที่ยว', icon: TreePine },
  { value: 'hotel', label: 'โรงแรม (Cat Friendly)', icon: Hotel },
]

const CAT_STYLES = {
  farm: { color: '#F97316', bg: '#FFF7ED' },
  cafe: { color: '#7c3aed', bg: '#faf5ff' },
  vet: { color: '#059669', bg: '#f0fdf4' },
  clinic: { color: '#0284c7', bg: '#f0f9ff' },
  food: { color: '#d97706', bg: '#fffbeb' },
  place: { color: '#dc2626', bg: '#fef2f2' },
  hotel: { color: '#0d9488', bg: '#f0fdfa' },
}

function StarRating({ value, onChange, readonly }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => !readonly && onChange?.(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{
            background: 'none', border: 'none', cursor: readonly ? 'default' : 'pointer', padding: 1,
          }}
        >
          <Star
            size={readonly ? 13 : 20}
            fill={(hover || value) >= n ? '#F97316' : 'none'}
            color={(hover || value) >= n ? '#F97316' : '#ddd'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewModal({ listing, onClose, onSubmit }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!rating) return
    setSaving(true)
    await onSubmit({ rating, comment })
    setSaving(false)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#fff', borderRadius: '22px 22px 0 0',
          padding: '24px 20px 44px', width: '100%', maxWidth: 480,
          fontFamily: 'Space Grotesk, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 900, color: '#000', marginBottom: 2 }}>รีวิว</h3>
            <p style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{listing.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#888" />
          </button>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>คะแนน</label>
          <StarRating value={rating} onChange={setRating} />
          {rating > 0 && (
            <p style={{ fontSize: 12, color: '#F97316', fontWeight: 700, marginTop: 6 }}>
              {['', 'แย่มาก', 'แย่', 'พอใช้', 'ดี', 'ดีมาก'][rating]}
            </p>
          )}
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ความคิดเห็น (ไม่บังคับ)</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="แชร์ประสบการณ์ของคุณ..."
            rows={3}
            style={{
              width: '100%', padding: '11px 13px', borderRadius: 11,
              border: '1.5px solid #e5e7eb', fontSize: 14, resize: 'vertical',
              fontFamily: 'Space Grotesk, sans-serif', outline: 'none',
              boxSizing: 'border-box', transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#F97316'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <button onClick={handleSubmit} disabled={!rating || saving}
          style={{
            width: '100%', padding: '13px', borderRadius: 12, border: 'none',
            backgroundColor: !rating || saving ? '#e5e7eb' : '#F97316',
            color: !rating || saving ? '#aaa' : '#fff',
            fontSize: 15, fontWeight: 800, cursor: !rating || saving ? 'not-allowed' : 'pointer',
            fontFamily: 'Space Grotesk, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Send size={15} /> {saving ? 'กำลังส่ง...' : 'ส่งรีวิว'}
        </button>
      </motion.div>
    </div>
  )
}

function ListingCard({ listing, onReview, distanceKm }) {
  const { user } = useAuth()
  const cat = CATEGORIES.find(c => c.value === listing.category)
  const styles = CAT_STYLES[listing.category] || CAT_STYLES.farm
  const Icon = cat?.icon || MapPin

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        backgroundColor: '#fff', borderRadius: 18,
        border: '1px solid #f0f0f0', overflow: 'hidden',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      {listing.photoURL ? (
        <div style={{ height: 150, backgroundImage: `url(${listing.photoURL})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 10, left: 10,
            display: 'flex', alignItems: 'center', gap: 5,
            backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)',
            color: styles.color, fontSize: 11, fontWeight: 800,
            padding: '4px 10px', borderRadius: 999,
          }}>
            <Icon size={11} /> {cat?.label}
          </div>
        </div>
      ) : (
        <div style={{ height: 80, backgroundColor: styles.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <Icon size={32} color={styles.color} />
          <div style={{
            position: 'absolute', top: 10, left: 10,
            display: 'flex', alignItems: 'center', gap: 5,
            backgroundColor: '#fff', color: styles.color, fontSize: 11, fontWeight: 800,
            padding: '3px 10px', borderRadius: 999, border: `1px solid ${styles.color}22`,
          }}>
            <Icon size={10} /> {cat?.label}
          </div>
        </div>
      )}

      <div style={{ padding: '14px 16px 16px', fontFamily: 'Space Grotesk, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#000', flex: 1, lineHeight: 1.3 }}>{listing.name}</h3>
          {listing.verified && (
            <span style={{ fontSize: 10, color: '#059669', fontWeight: 700, backgroundColor: '#f0fdf4', padding: '2px 7px', borderRadius: 999, flexShrink: 0, marginLeft: 6 }}>
              Verified
            </span>
          )}
        </div>

        {listing.category === 'hotel' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800,
              color: listing.priceType === 'free' ? '#059669' : '#0d9488',
              backgroundColor: listing.priceType === 'free' ? '#f0fdf4' : '#f0fdfa',
              padding: '3px 9px', borderRadius: 999,
            }}>
              {listing.priceType === 'free' ? <Gift size={11} /> : <Banknote size={11} />}
              {listing.priceType === 'free' ? 'พักฟรี' : `${listing.price?.toLocaleString() || 0} บาท/คืน`}
            </span>
            {typeof distanceKm === 'number' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#888' }}>
                <Navigation size={10} /> {distanceKm.toFixed(1)} กม.
              </span>
            )}
          </div>
        )}

        {/* Rating display */}
        {listing.avgRating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <StarRating value={Math.round(listing.avgRating)} readonly />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#F97316' }}>{listing.avgRating.toFixed(1)}</span>
            <span style={{ fontSize: 11, color: '#aaa', fontWeight: 500 }}>({listing.reviewCount || 0} รีวิว)</span>
          </div>
        )}

        {listing.description && (
          <p style={{
            fontSize: 12, color: '#666', fontWeight: 500, lineHeight: 1.5, marginBottom: 10,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>{listing.description}</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
          {listing.address && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <MapPin size={11} color="#aaa" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 12, color: '#666', fontWeight: 500, lineHeight: 1.4 }}>{listing.address}</span>
            </div>
          )}
          {listing.category === 'hotel' && (listing.district || listing.province) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={11} color="#aaa" />
              <span style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>
                {[listing.subdistrict, listing.district, listing.province].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
          {listing.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={11} color="#aaa" />
              <a href={`tel:${listing.phone}`} style={{ fontSize: 12, color: '#F97316', fontWeight: 700, textDecoration: 'none' }}>{listing.phone}</a>
            </div>
          )}
          {listing.hours && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={11} color="#aaa" />
              <span style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>{listing.hours}</span>
            </div>
          )}
          {listing.lineId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageCircleIcon size={11} />
              <span style={{ fontSize: 12, color: '#06c755', fontWeight: 700 }}>LINE: {listing.lineId}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 7 }}>
          {listing.website && (
            <a href={listing.website} target="_blank" rel="noopener noreferrer"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                padding: '8px', borderRadius: 9, border: '1.5px solid #e5e7eb',
                textDecoration: 'none', fontSize: 12, fontWeight: 700, color: '#555',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.color = '#F97316' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#555' }}
            >
              <Globe size={11} /> เว็บไซต์
            </a>
          )}
          {listing.facebook && (
            <a href={listing.facebook} target="_blank" rel="noopener noreferrer"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                padding: '8px', borderRadius: 9, border: '1.5px solid #e5e7eb',
                textDecoration: 'none', fontSize: 12, fontWeight: 700, color: '#555',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1877f2'; e.currentTarget.style.color = '#1877f2' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#555' }}
            >
              <ExternalLink size={11} /> Facebook
            </a>
          )}
          {user && (
            <button onClick={() => onReview(listing)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '8px 12px', borderRadius: 9, border: '1.5px solid #e5e7eb',
              backgroundColor: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#555',
              fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.color = '#F97316' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#555' }}
            >
              <Star size={11} /> รีวิว
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Inline icon for LINE since lucide doesn't have one
function MessageCircleIcon({ size = 11 }) {
  return <span style={{ fontSize: size + 4, lineHeight: 1 }}>💬</span>
}

export default function DirectoryPage() {
  const { user, userProfile } = useAuth()
  const [listings, setListings] = useState([])
  const [filtered, setFiltered] = useState([])
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [reviewTarget, setReviewTarget] = useState(null)

  const [provinces, setProvinces] = useState(null)
  const [provinceFilter, setProvinceFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [myLocation, setMyLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const snap = await getDocs(query(collection(db, 'directory'), orderBy('createdAt', 'desc')))
        setListings(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (category === 'hotel' && !provinces) loadProvinces().then(setProvinces)
  }, [category, provinces])

  const selectedProvince = provinces?.find(p => p.name_th === provinceFilter)

  const handleFindNearMe = async () => {
    if (myLocation) { setMyLocation(null); return }
    setLocating(true)
    setLocationError('')
    try {
      setMyLocation(await getCurrentPosition())
    } catch {
      setLocationError('ไม่สามารถเข้าถึงตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง')
    }
    setLocating(false)
  }

  useEffect(() => {
    let r = listings
    if (category !== 'all') r = r.filter(l => l.category === category)
    if (search.trim()) {
      const s = search.toLowerCase()
      r = r.filter(l => l.name?.toLowerCase().includes(s) || l.description?.toLowerCase().includes(s) || l.address?.toLowerCase().includes(s))
    }
    if (category === 'hotel') {
      if (provinceFilter) r = r.filter(l => l.province === provinceFilter)
      if (districtFilter) r = r.filter(l => l.district === districtFilter)
      if (myLocation) {
        r = [...r].sort((a, b) => {
          const da = (a.lat != null && a.lng != null) ? haversineKm(myLocation.lat, myLocation.lng, a.lat, a.lng) : Infinity
          const db_ = (b.lat != null && b.lng != null) ? haversineKm(myLocation.lat, myLocation.lng, b.lat, b.lng) : Infinity
          return da - db_
        })
      }
    }
    setFiltered(r)
  }, [listings, category, search, provinceFilter, districtFilter, myLocation])

  const handleReviewSubmit = async ({ rating, comment }) => {
    if (!user || !reviewTarget) return
    try {
      await addDoc(collection(db, 'directory', reviewTarget.id, 'reviews'), {
        userId: user.uid,
        userName: userProfile?.displayName || user.email.split('@')[0],
        rating, comment,
        createdAt: serverTimestamp(),
      })
      // Update avg rating on listing
      const reviewsSnap = await getDocs(collection(db, 'directory', reviewTarget.id, 'reviews'))
      const ratings = reviewsSnap.docs.map(d => d.data().rating)
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
      await updateDoc(doc(db, 'directory', reviewTarget.id), {
        avgRating: Math.round(avg * 10) / 10,
        reviewCount: ratings.length,
      })
      setListings(prev => prev.map(l => l.id === reviewTarget.id
        ? { ...l, avgRating: Math.round(avg * 10) / 10, reviewCount: ratings.length }
        : l
      ))
    } catch (e) { console.error(e) }
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#f8f8f8', fontFamily: 'Space Grotesk, sans-serif', paddingBottom: 60 }}>
      <AnimatePresence>
        {reviewTarget && (
          <ReviewModal
            listing={reviewTarget}
            onClose={() => setReviewTarget(null)}
            onSubmit={handleReviewSubmit}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', padding: '20px 16px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#000', marginBottom: 3 }}>ไดเรกทอรี</h1>
          <p style={{ fontSize: 13, color: '#aaa', fontWeight: 500, marginBottom: 16 }}>ค้นหาสถานที่เกี่ยวกับแมวทุกประเภท</p>
          <div style={{ position: 'relative', maxWidth: 480 }}>
            <Search size={15} color="#bbb" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ ที่อยู่ หรือคำอธิบาย..."
              style={{
                width: '100%', padding: '11px 12px 11px 36px',
                borderRadius: 11, border: '1.5px solid #e5e7eb',
                fontSize: 14, fontFamily: 'Space Grotesk, sans-serif',
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s', backgroundColor: '#fafafa',
              }}
              onFocus={e => e.target.style.borderColor = '#F97316'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>
        {/* Category tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '16px 0' }}>
          {CATEGORIES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 999,
                border: category === value ? '2px solid #F97316' : '1.5px solid #e5e7eb',
                backgroundColor: category === value ? '#FFF7ED' : '#fff',
                color: category === value ? '#F97316' : '#666',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.15s',
              }}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {category === 'hotel' && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <button
              onClick={handleFindNearMe} disabled={locating}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999,
                border: myLocation ? '2px solid #F97316' : '1.5px solid #e5e7eb',
                backgroundColor: myLocation ? '#FFF7ED' : '#fff',
                color: myLocation ? '#F97316' : '#666',
                fontSize: 13, fontWeight: 700, cursor: locating ? 'default' : 'pointer',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
            >
              <Navigation size={13} /> {locating ? 'กำลังหาตำแหน่ง...' : myLocation ? 'ใกล้ฉัน ✓' : 'ใกล้ฉัน'}
            </button>

            <select
              value={provinceFilter}
              onChange={e => { setProvinceFilter(e.target.value); setDistrictFilter('') }}
              style={{
                padding: '8px 12px', borderRadius: 999, border: '1.5px solid #e5e7eb',
                fontSize: 13, fontWeight: 700, color: '#666', fontFamily: 'Space Grotesk, sans-serif',
                backgroundColor: '#fff', outline: 'none',
              }}
            >
              <option value="">ทุกจังหวัด</option>
              {provinces?.map(p => <option key={p.code} value={p.name_th}>{p.name_th}</option>)}
            </select>

            <select
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              disabled={!selectedProvince}
              style={{
                padding: '8px 12px', borderRadius: 999, border: '1.5px solid #e5e7eb',
                fontSize: 13, fontWeight: 700, color: '#666', fontFamily: 'Space Grotesk, sans-serif',
                backgroundColor: '#fff', outline: 'none',
              }}
            >
              <option value="">ทุกอำเภอ/เขต</option>
              {selectedProvince?.districts.map(d => <option key={d.code} value={d.name_th}>{d.name_th}</option>)}
            </select>

            {locationError && <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, alignSelf: 'center' }}>{locationError}</span>}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#fff', borderRadius: 18, border: '2px dashed #e5e7eb', marginTop: 4 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Search size={24} color="#ccc" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#000', marginBottom: 6 }}>
              {search ? 'ไม่พบผลลัพธ์' : 'ยังไม่มีข้อมูลในหมวดนี้'}
            </h3>
            <p style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>
              {search ? 'ลองใช้คำค้นหาอื่น' : 'ทีมงานกำลังเพิ่มข้อมูล'}
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 12, color: '#aaa', fontWeight: 600, marginBottom: 16 }}>พบ {filtered.length} สถานที่</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16, paddingBottom: 20 }}>
              {filtered.map(listing => (
                <ListingCard
                  key={listing.id} listing={listing} onReview={setReviewTarget}
                  distanceKm={myLocation && listing.lat != null && listing.lng != null
                    ? haversineKm(myLocation.lat, myLocation.lng, listing.lat, listing.lng)
                    : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
