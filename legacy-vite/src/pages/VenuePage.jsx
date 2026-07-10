import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { MapPin, X, Check, PawPrint, ChevronRight, Home, Calendar } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

const FACILITY_LABELS = {
  th: {
    ac: 'แอร์',
    cctv: 'CCTV',
    wifi: 'Wi-Fi',
    vet_nearby: 'คลินิกใกล้',
    separate_rooms: 'ห้องแยก',
    playground: 'สนามเล่น',
  },
  en: {
    ac: 'A/C',
    cctv: 'CCTV',
    wifi: 'Wi-Fi',
    vet_nearby: 'Nearby Clinic',
    separate_rooms: 'Separate Rooms',
    playground: 'Playground',
  },
}

const COPY = {
  th: {
    notSpecified: 'ไม่ระบุ',
    bookingDone: 'ส่งคำขอจองแล้ว!',
    bookingDoneSub: 'ทีมงานจะติดต่อยืนยันภายใน 24 ชั่วโมง',
    done: 'เสร็จสิ้น',
    bookVenue: 'จองสถานที่',
    selectCat: 'เลือกน้องแมว *',
    addCatFirst: 'กรุณาเพิ่มโปรไฟล์แมวก่อนจอง',
    checkIn: 'เช็คอิน *',
    checkOut: 'เช็คเอาท์ *',
    notesLabel: 'หมายเหตุเพิ่มเติม',
    notesPlaceholder: 'เช่น สายพันธุ์ที่ต้องการจับคู่, ข้อกังวลพิเศษ...',
    perSession: 'ครั้ง',
    perNight: 'คืน',
    priceConfirmNote: 'ราคาจะได้รับการยืนยันจากทีมงานอีกครั้ง',
    sendingRequest: 'กำลังส่งคำขอ...',
    sendBookingRequest: 'ส่งคำขอจอง',
    serviceLabel: 'บริการ',
    pageTitle: 'สถานที่ผสมพันธุ์',
    pageSubtitle: 'สถานที่มาตรฐาน ปลอดภัย รับรองโดยทีม Catinder',
    all: 'ทั้งหมด',
    noVenuesNow: 'ยังไม่มีสถานที่ในขณะนี้',
    noVenuesSub: <>เรากำลังคัดเลือกสถานที่มาตรฐาน<br />ติดตามได้เร็วๆ นี้</>,
    bookNow: 'จองเลย',
  },
  en: {
    notSpecified: 'Not specified',
    bookingDone: 'Booking request sent!',
    bookingDoneSub: 'Our team will contact you to confirm within 24 hours.',
    done: 'Done',
    bookVenue: 'Book Venue',
    selectCat: 'Select Your Cat *',
    addCatFirst: 'Please add a cat profile before booking',
    checkIn: 'Check-in *',
    checkOut: 'Check-out *',
    notesLabel: 'Additional Notes',
    notesPlaceholder: 'e.g. preferred breed to match with, special concerns...',
    perSession: 'session',
    perNight: 'night',
    priceConfirmNote: 'Price will be confirmed by our team',
    sendingRequest: 'Sending request...',
    sendBookingRequest: 'Send Booking Request',
    serviceLabel: 'Service',
    pageTitle: 'Mating Venues',
    pageSubtitle: 'Standard, safe locations certified by the Catinder team',
    all: 'All',
    noVenuesNow: 'No venues available yet',
    noVenuesSub: <>We're curating standard venues<br />Check back soon</>,
    bookNow: 'Book Now',
  },
}

function BookingModal({ venue, myCats, userId, userProfile, userEmail, onClose }) {
  const { lang } = useLanguage()
  const c = COPY[lang]
  const [catId, setCatId] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const valid = catId && checkIn && checkOut && checkIn <= checkOut

  const submit = async () => {
    if (!valid || submitting) return
    setSubmitting(true)
    try {
      const cat = myCats.find(c => c.id === catId)
      await addDoc(collection(db, 'bookings'), {
        venueId: venue.id,
        venueName: venue.name,
        venueLocation: venue.location || '',
        userId,
        userName: userProfile?.displayName || userEmail?.split('@')[0] || c.notSpecified,
        userEmail: userEmail || '',
        catId,
        catName: cat?.name || '',
        catBreed: cat?.breed || '',
        checkIn,
        checkOut,
        notes: notes.trim(),
        price: venue.price || 0,
        priceUnit: venue.priceUnit || 'night',
        status: 'pending',
        createdAt: serverTimestamp(),
      })
      setDone(true)
    } catch (e) {
      console.error('booking error:', e)
    }
    setSubmitting(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        style={{ backgroundColor: '#fff', borderRadius: '22px 22px 0 0', width: '100%', maxWidth: 560, maxHeight: '90dvh', overflowY: 'auto', padding: '24px 22px 36px', fontFamily: 'Space Grotesk, sans-serif' }}
      >
        {done ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Check size={30} color="#10b981" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#000', marginBottom: 8 }}>{c.bookingDone}</h3>
            <p style={{ fontSize: 13, color: '#888', fontWeight: 500, lineHeight: 1.8, marginBottom: 24 }}>
              {c.bookingDoneSub}
            </p>
            <button onClick={onClose} style={{ padding: '12px 32px', borderRadius: 999, border: 'none', backgroundColor: '#F97316', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
              {c.done}
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: '#000', marginBottom: 2 }}>{c.bookVenue}</h3>
                <p style={{ fontSize: 12, color: '#aaa', fontWeight: 600 }}>{venue.name}{venue.location ? ` · ${venue.location}` : ''}</p>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={19} color="#888" />
              </button>
            </div>

            <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 8 }}>{c.selectCat}</label>
            {myCats.length === 0 ? (
              <div style={{ padding: '14px', backgroundColor: '#FFF7ED', borderRadius: 12, marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#F97316', fontWeight: 700 }}>{c.addCatFirst}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {myCats.map(cat => (
                  <button key={cat.id} onClick={() => setCatId(cat.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderRadius: 12, border: `1.5px solid ${catId === cat.id ? '#F97316' : '#e5e7eb'}`,
                    backgroundColor: catId === cat.id ? '#FFF7ED' : '#fff',
                    cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      backgroundColor: '#f5f5f5',
                      backgroundImage: cat.photoURL ? `url(${cat.photoURL})` : 'none',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {!cat.photoURL && <PawPrint size={16} color="#ddd" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: catId === cat.id ? '#F97316' : '#000' }}>{cat.name}</div>
                      <div style={{ fontSize: 11, color: '#aaa', fontWeight: 500 }}>{cat.breed}</div>
                    </div>
                    {catId === cat.id && <Check size={16} color="#F97316" />}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[{ label: c.checkIn, value: checkIn, set: setCheckIn },
                { label: c.checkOut, value: checkOut, set: setCheckOut }].map((f, i) => (
                <div key={i}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input type="date" value={f.value} onChange={e => f.set(e.target.value)} min={today}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#F97316'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>{c.notesLabel}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={c.notesPlaceholder} rows={2}
                style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#F97316'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ backgroundColor: '#FFF7ED', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Calendar size={16} color="#F97316" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#F97316' }}>
                  ฿{venue.price?.toLocaleString() || '0'} / {venue.priceUnit === 'session' ? c.perSession : c.perNight}
                </div>
                <div style={{ fontSize: 11, color: '#f97316bb', fontWeight: 500 }}>{c.priceConfirmNote}</div>
              </div>
            </div>

            <button onClick={submit} disabled={!valid || submitting || myCats.length === 0} style={{
              width: '100%', padding: 14, borderRadius: 13, border: 'none',
              backgroundColor: valid && myCats.length > 0 ? '#F97316' : '#e5e7eb',
              color: valid && myCats.length > 0 ? '#fff' : '#aaa',
              fontSize: 15, fontWeight: 800,
              cursor: valid && myCats.length > 0 ? 'pointer' : 'not-allowed',
              fontFamily: 'Space Grotesk, sans-serif',
            }}>
              {submitting ? c.sendingRequest : c.sendBookingRequest}
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function VenuePage() {
  const { user, userProfile } = useAuth()
  const { lang } = useLanguage()
  const c = COPY[lang]
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [myCats, setMyCats] = useState([])
  const [selected, setSelected] = useState(null)
  const [province, setProvince] = useState('all')

  useEffect(() => {
    getDocs(query(collection(db, 'venues'), where('isActive', '==', true)))
      .then(snap => setVenues(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!user) return
    getDocs(query(collection(db, 'cats'), where('ownerId', '==', user.uid)))
      .then(snap => setMyCats(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(() => {})
  }, [user])

  const allProvinces = [...new Set(venues.map(v => v.province).filter(Boolean))]
  const shown = province === 'all' ? venues : venues.filter(v => v.province === province)

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#f8f8f8', fontFamily: 'Space Grotesk, sans-serif' }}>
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', padding: '20px 20px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 16 }}>
          <p style={{ fontSize: 12, color: '#aaa', fontWeight: 600, marginBottom: 2 }}>{c.serviceLabel}</p>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#000', marginBottom: 4 }}>{c.pageTitle}</h1>
          <p style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>{c.pageSubtitle}</p>
        </div>
        {allProvinces.length > 0 && (
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12 }}>
              {['all', ...allProvinces].map(p => (
                <button key={p} onClick={() => setProvince(p)} style={{
                  padding: '6px 16px', borderRadius: 999, border: 'none', flexShrink: 0,
                  backgroundColor: province === p ? '#F97316' : '#f0f0f0',
                  color: province === p ? '#fff' : '#555',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.15s',
                }}>
                  {p === 'all' ? c.all : p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px 60px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #F97316', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : shown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: 18 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Home size={30} color="#F97316" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#000', marginBottom: 6 }}>{c.noVenuesNow}</h3>
            <p style={{ fontSize: 13, color: '#aaa', fontWeight: 500, lineHeight: 1.7 }}>
              {c.noVenuesSub}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {shown.map((venue, i) => (
              <motion.div key={venue.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div
                  onClick={() => setSelected(venue)}
                  style={{
                    backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden',
                    border: '1px solid #f0f0f0', cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none' }}
                >
                  <div style={{
                    height: 180, backgroundColor: '#f0f0f0',
                    backgroundImage: venue.photoURL ? `url(${venue.photoURL})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {!venue.photoURL && <Home size={44} color="#ddd" />}
                    <div style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.72)', color: '#fff', padding: '5px 12px', borderRadius: 999, fontSize: 13, fontWeight: 800, backdropFilter: 'blur(4px)' }}>
                      ฿{venue.price?.toLocaleString() || '0'}
                      <span style={{ fontSize: 10, opacity: 0.7 }}>/{venue.priceUnit === 'session' ? c.perSession : c.perNight}</span>
                    </div>
                  </div>
                  <div style={{ padding: '16px 18px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 900, color: '#000', marginBottom: 3 }}>{venue.name}</h3>
                        {venue.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888', fontWeight: 600 }}>
                            <MapPin size={11} /> {venue.location}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: '#F97316', flexShrink: 0 }}>
                        {c.bookNow} <ChevronRight size={14} />
                      </div>
                    </div>
                    {venue.description && (
                      <p style={{ fontSize: 13, color: '#888', fontWeight: 500, lineHeight: 1.6, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {venue.description}
                      </p>
                    )}
                    {venue.facilities?.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {venue.facilities.slice(0, 5).map(f => (
                          <span key={f} style={{ fontSize: 11, fontWeight: 700, color: '#666', backgroundColor: '#f5f5f5', padding: '3px 9px', borderRadius: 999 }}>
                            {FACILITY_LABELS[lang][f] || f}
                          </span>
                        ))}
                        {venue.facilities.length > 5 && (
                          <span style={{ fontSize: 11, color: '#bbb', fontWeight: 600, alignSelf: 'center' }}>+{venue.facilities.length - 5}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <AnimatePresence>
        {selected && (
          <BookingModal
            venue={selected}
            myCats={myCats}
            userId={user?.uid}
            userProfile={userProfile}
            userEmail={user?.email}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
