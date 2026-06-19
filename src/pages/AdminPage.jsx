import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
  query, orderBy, where, getDocs, getDoc,
} from 'firebase/firestore'
import {
  Shield, Plus, Pencil, Trash2, X, Check, Users, Building2,
  Home, Coffee, HeartPulse, Stethoscope, Fish, TreePine, MapPin, Phone,
  FileText, ShieldCheck, AlertCircle, Clock, Eye, Headphones, Send,
  CalendarDays, CheckCircle, XCircle, ToggleLeft, ToggleRight,
  PawPrint, Search, Syringe, Scissors, Heart, Hotel, Loader2,
} from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { loadProvinces } from '../utils/thailandGeo'
import { searchAddress } from '../utils/geo'

const VENUE_FACILITIES = ['ac', 'cctv', 'wifi', 'vet_nearby', 'separate_rooms', 'playground']
const VENUE_FACILITY_LABELS = { ac: 'แอร์', cctv: 'CCTV', wifi: 'Wi-Fi', vet_nearby: 'คลินิกใกล้', separate_rooms: 'ห้องแยก', playground: 'สนามเล่น' }
const EMPTY_VENUE = { name: '', location: '', province: 'กรุงเทพมหานคร', description: '', price: 0, priceUnit: 'night', facilities: [], photoURL: '', isActive: true }

function VenueFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? { ...EMPTY_VENUE, ...initial } : EMPTY_VENUE)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleFacility = (f) => setForm(prev => ({
    ...prev,
    facilities: prev.facilities?.includes(f) ? prev.facilities.filter(x => x !== f) : [...(prev.facilities || []), f],
  }))

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave({ ...form, price: Number(form.price) || 0 })
    setSaving(false)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 3000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        style={{ backgroundColor: '#fff', borderRadius: '22px 22px 0 0', width: '100%', maxWidth: 560, maxHeight: '90dvh', overflowY: 'auto', padding: '24px 22px 36px', fontFamily: 'Space Grotesk, sans-serif' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: '#000' }}>{initial?.id ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่ใหม่'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={19} color="#888" /></button>
        </div>

        {[
          { key: 'name', label: 'ชื่อสถานที่ *', placeholder: 'เช่น Cat Villa บางนา', type: 'text' },
          { key: 'location', label: 'ที่อยู่', placeholder: 'เช่น บางนา กรุงเทพฯ', type: 'text' },
          { key: 'province', label: 'จังหวัด', placeholder: 'กรุงเทพมหานคร', type: 'text' },
          { key: 'photoURL', label: 'URL รูปภาพ', placeholder: 'https://...', type: 'url' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>{f.label}</label>
            <input type={f.type} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder}
              style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#F97316'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        ))}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>ราคา (บาท)</label>
            <input type="number" value={form.price || ''} onChange={e => set('price', e.target.value)} placeholder="0" min="0"
              style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#F97316'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>หน่วย</label>
            <select value={form.priceUnit} onChange={e => set('priceUnit', e.target.value)}
              style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}>
              <option value="night">ต่อคืน</option>
              <option value="session">ต่อครั้ง</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>รายละเอียด</label>
          <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="รายละเอียดสถานที่..." rows={3}
            style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#F97316'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 8 }}>สิ่งอำนวยความสะดวก</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {VENUE_FACILITIES.map(f => {
              const active = form.facilities?.includes(f)
              return (
                <button key={f} onClick={() => toggleFacility(f)} style={{
                  padding: '7px 14px', borderRadius: 999, border: `1.5px solid ${active ? '#F97316' : '#e5e7eb'}`,
                  backgroundColor: active ? '#FFF7ED' : '#fff', color: active ? '#F97316' : '#555',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
                  transition: 'all 0.15s',
                }}>
                  {VENUE_FACILITY_LABELS[f]}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer' }} onClick={() => set('isActive', !form.isActive)}>
          {form.isActive
            ? <ToggleRight size={24} color="#F97316" />
            : <ToggleLeft size={24} color="#bbb" />}
          <span style={{ fontSize: 13, fontWeight: 700, color: form.isActive ? '#F97316' : '#888', userSelect: 'none' }}>
            {form.isActive ? 'เปิดรับจอง' : 'ปิดรับจอง'}
          </span>
        </div>

        <button onClick={handleSave} disabled={saving || !form.name.trim()} style={{
          width: '100%', padding: 13, borderRadius: 13, border: 'none',
          backgroundColor: form.name.trim() ? '#F97316' : '#e5e7eb',
          color: '#fff', fontSize: 15, fontWeight: 800,
          cursor: form.name.trim() ? 'pointer' : 'not-allowed',
          fontFamily: 'Space Grotesk, sans-serif',
        }}>
          {saving ? 'กำลังบันทึก...' : (initial?.id ? 'บันทึกการแก้ไข' : 'เพิ่มสถานที่')}
        </button>
      </motion.div>
    </motion.div>
  )
}

function BookingBadge({ status }) {
  const map = {
    pending: { label: 'รอยืนยัน', color: '#92400e', bg: '#FEF3C7' },
    confirmed: { label: 'ยืนยันแล้ว', color: '#065f46', bg: '#D1FAE5' },
    cancelled: { label: 'ยกเลิก', color: '#991b1b', bg: '#FEE2E2' },
    completed: { label: 'เสร็จสิ้น', color: '#1e40af', bg: '#DBEAFE' },
  }
  const s = map[status] || map.pending
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: s.color, backgroundColor: s.bg, padding: '3px 10px', borderRadius: 999 }}>
      {s.label}
    </span>
  )
}

const CATEGORIES = [
  { id: 'farm', label: 'ฟาร์มแมว', icon: Home },
  { id: 'cafe', label: 'คาเฟ่แมว', icon: Coffee },
  { id: 'vet', label: 'โรงพยาบาลสัตว์', icon: HeartPulse },
  { id: 'clinic', label: 'คลินิก', icon: Stethoscope },
  { id: 'food', label: 'ร้านอาหารแมว', icon: Fish },
  { id: 'place', label: 'ที่เที่ยว Cat-Friendly', icon: TreePine },
  { id: 'hotel', label: 'โรงแรม (Cat Friendly)', icon: Hotel },
]

function getCatIcon(catId) {
  const c = CATEGORIES.find(c => c.id === catId)
  return c ? c.icon : Building2
}

const EMPTY_FORM = {
  name: '', category: 'cafe', address: '', phone: '', website: '', description: '', verified: false,
  priceType: 'free', price: 0,
  province: '', provinceCode: null, district: '', districtCode: null, subdistrict: '', subdistrictCode: null,
  lat: null, lng: null,
}

function HotelLocationFields({ form, setForm }) {
  const [provinces, setProvinces] = useState(null)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeMsg, setGeocodeMsg] = useState('')

  useEffect(() => { loadProvinces().then(setProvinces) }, [])

  const province = provinces?.find(p => p.code === form.provinceCode)
  const district = province?.districts.find(d => d.code === form.districtCode)

  const handleProvinceChange = (code) => {
    const p = provinces.find(x => x.code === Number(code))
    setForm(f => ({
      ...f, provinceCode: p?.code || null, province: p?.name_th || '',
      districtCode: null, district: '', subdistrictCode: null, subdistrict: '',
    }))
  }
  const handleDistrictChange = (code) => {
    const d = province?.districts.find(x => x.code === Number(code))
    setForm(f => ({ ...f, districtCode: d?.code || null, district: d?.name_th || '', subdistrictCode: null, subdistrict: '' }))
  }
  const handleSubdistrictChange = (code) => {
    const s = district?.subdistricts.find(x => x.code === Number(code))
    setForm(f => ({ ...f, subdistrictCode: s?.code || null, subdistrict: s?.name_th || '' }))
  }

  const handleGeocode = async () => {
    const query = [form.address, form.subdistrict, form.district, form.province].filter(Boolean).join(' ')
    if (!query.trim()) { setGeocodeMsg('กรอกที่อยู่หรือเลือกจังหวัด/อำเภอก่อน'); return }
    setGeocoding(true)
    setGeocodeMsg('')
    try {
      const results = await searchAddress(query)
      if (results.length > 0) {
        setForm(f => ({ ...f, lat: results[0].lat, lng: results[0].lng }))
        setGeocodeMsg(`พบตำแหน่งแล้ว ✓ (${results[0].lat.toFixed(4)}, ${results[0].lng.toFixed(4)})`)
      } else {
        setGeocodeMsg('ไม่พบตำแหน่ง ลองแก้ไขที่อยู่')
      }
    } catch {
      setGeocodeMsg('ค้นหาตำแหน่งไม่สำเร็จ')
    }
    setGeocoding(false)
  }

  const selectStyle = { width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>ที่ตั้งโรงแรม</label>
      {!provinces ? (
        <p style={{ fontSize: 12, color: '#aaa' }}>กำลังโหลดข้อมูลจังหวัด...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <select value={form.provinceCode || ''} onChange={e => handleProvinceChange(e.target.value)} style={selectStyle}>
            <option value="">จังหวัด</option>
            {provinces.map(p => <option key={p.code} value={p.code}>{p.name_th}</option>)}
          </select>
          <select value={form.districtCode || ''} onChange={e => handleDistrictChange(e.target.value)} disabled={!province} style={selectStyle}>
            <option value="">อำเภอ/เขต</option>
            {province?.districts.map(d => <option key={d.code} value={d.code}>{d.name_th}</option>)}
          </select>
          <select value={form.subdistrictCode || ''} onChange={e => handleSubdistrictChange(e.target.value)} disabled={!district} style={selectStyle}>
            <option value="">ตำบล/แขวง</option>
            {district?.subdistricts.map(s => <option key={s.code} value={s.code}>{s.name_th}</option>)}
          </select>
        </div>
      )}

      <button type="button" onClick={handleGeocode} disabled={geocoding} style={{
        marginTop: 9, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
        borderRadius: 9, border: '1.5px solid #e5e7eb', backgroundColor: '#fff', cursor: geocoding ? 'default' : 'pointer',
        fontSize: 12, fontWeight: 700, color: '#555', fontFamily: 'Space Grotesk, sans-serif',
      }}>
        {geocoding ? <Loader2 size={13} className="animate-spin" /> : <MapPin size={13} />}
        {geocoding ? 'กำลังค้นหา...' : 'ค้นหาตำแหน่งจากที่อยู่'}
      </button>
      {geocodeMsg && <p style={{ fontSize: 11.5, color: form.lat ? '#059669' : '#dc2626', fontWeight: 600, marginTop: 6 }}>{geocodeMsg}</p>}
    </div>
  )
}

function ListingModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? { ...EMPTY_FORM, ...initial } : EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave(form.category === 'hotel' ? { ...form, price: form.priceType === 'paid' ? Number(form.price) || 0 : 0 } : form)
    setSaving(false)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 3000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        style={{ backgroundColor: '#fff', borderRadius: '22px 22px 0 0', width: '100%', maxWidth: 560, maxHeight: '90dvh', overflowY: 'auto', padding: '24px 22px 32px', fontFamily: 'Space Grotesk, sans-serif' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: '#000' }}>{initial?.id ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={19} color="#888" /></button>
        </div>

        {[
          { key: 'name', label: 'ชื่อสถานที่ *', placeholder: 'ชื่อร้าน / สถานที่', type: 'text' },
          { key: 'address', label: 'ที่อยู่', placeholder: 'ที่อยู่', type: 'text' },
          { key: 'phone', label: 'โทรศัพท์', placeholder: '02-xxx-xxxx', type: 'text' },
          { key: 'website', label: 'เว็บไซต์', placeholder: 'https://...', type: 'url' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>{f.label}</label>
            <input
              type={f.type} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#F97316'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        ))}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>หมวดหมู่ *</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 7 }}>
            {CATEGORIES.map(cat => {
              const Icon = cat.icon
              const active = form.category === cat.id
              return (
                <button key={cat.id} onClick={() => set('category', cat.id)} style={{
                  padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${active ? '#F97316' : '#e5e7eb'}`,
                  backgroundColor: active ? '#FFF7ED' : '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 13, fontWeight: active ? 800 : 600, color: active ? '#F97316' : '#555',
                }}>
                  <Icon size={14} color={active ? '#F97316' : '#aaa'} /> {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {form.category === 'hotel' && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>ค่าใช้จ่ายสำหรับแมว</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: form.priceType === 'paid' ? 8 : 0 }}>
                {[{ v: 'free', l: 'พักฟรี' }, { v: 'paid', l: 'เสียค่าใช้จ่าย' }].map(opt => {
                  const active = form.priceType === opt.v
                  return (
                    <button key={opt.v} type="button" onClick={() => set('priceType', opt.v)} style={{
                      padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${active ? '#F97316' : '#e5e7eb'}`,
                      backgroundColor: active ? '#FFF7ED' : '#fff', cursor: 'pointer',
                      fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, fontWeight: active ? 800 : 600,
                      color: active ? '#F97316' : '#555',
                    }}>{opt.l}</button>
                  )
                })}
              </div>
              {form.priceType === 'paid' && (
                <input type="number" value={form.price || ''} onChange={e => set('price', e.target.value)} placeholder="ราคาต่อคืน (บาท)" min="0"
                  style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#F97316'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              )}
            </div>

            <HotelLocationFields form={form} setForm={setForm} />
          </>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>รายละเอียด</label>
          <textarea
            value={form.description || ''} onChange={e => set('description', e.target.value)}
            placeholder="รายละเอียดเพิ่มเติม..." rows={3}
            style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#F97316'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 20, cursor: 'pointer' }} onClick={() => set('verified', !form.verified)}>
          <div style={{
            width: 20, height: 20, borderRadius: 6, border: `2px solid ${form.verified ? '#F97316' : '#ddd'}`,
            backgroundColor: form.verified ? '#F97316' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            transition: 'all 0.15s',
          }}>
            {form.verified && <Check size={12} color="#fff" />}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#555', userSelect: 'none' }}>Verified</span>
        </div>

        <button onClick={handleSave} disabled={saving || !form.name.trim()} style={{
          width: '100%', padding: 13, borderRadius: 13, border: 'none',
          backgroundColor: form.name.trim() ? '#F97316' : '#e5e7eb',
          color: '#fff', fontSize: 15, fontWeight: 800, cursor: form.name.trim() ? 'pointer' : 'not-allowed',
          fontFamily: 'Space Grotesk, sans-serif',
        }}>
          {saving ? 'กำลังบันทึก...' : (initial?.id ? 'บันทึกการแก้ไข' : 'เพิ่มสถานที่')}
        </button>
      </motion.div>
    </motion.div>
  )
}

function DocStatusBadge({ status }) {
  const map = {
    pending: { label: 'รอตรวจสอบ', color: '#92400e', bg: '#FEF3C7', icon: Clock },
    verified: { label: 'ยืนยันแล้ว', color: '#065f46', bg: '#D1FAE5', icon: ShieldCheck },
    rejected: { label: 'ไม่ผ่าน', color: '#991b1b', bg: '#FEE2E2', icon: AlertCircle },
  }
  const s = map[status] || map.pending
  const Icon = s.icon
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: s.color, backgroundColor: s.bg }}>
      <Icon size={11} /> {s.label}
    </span>
  )
}

function SupportPanel({ user: adminUser }) {
  const [chats, setChats] = useState([])
  const [activeUid, setActiveUid] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [rulesError, setRulesError] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    return onSnapshot(
      collection(db, 'supportChats'),
      snap => {
        setRulesError(false)
        const sorted = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.lastMessageAt?.seconds || 0) - (a.lastMessageAt?.seconds || 0))
        setChats(sorted)
      },
      err => {
        console.error('supportChats listener error:', err)
        setRulesError(true)
      }
    )
  }, [])

  useEffect(() => {
    if (!activeUid) { setMessages([]); return }
    const q = query(collection(db, 'supportChats', activeUid, 'messages'), orderBy('createdAt', 'asc'))
    return onSnapshot(
      q,
      snap => setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error('messages listener error:', err)
    )
  }, [activeUid])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendReply = async (e) => {
    e.preventDefault()
    if (!text.trim() || !activeUid || sending) return
    setSending(true)
    const msg = text.trim()
    setText('')
    const tempId = `temp_${Date.now()}`
    setMessages(prev => [...prev, {
      id: tempId, senderId: adminUser.uid, text: msg, isAdmin: true,
      createdAt: { toDate: () => new Date() },
    }])
    try {
      await addDoc(collection(db, 'supportChats', activeUid, 'messages'), {
        senderId: adminUser.uid,
        text: msg, isAdmin: true, createdAt: serverTimestamp(),
      })
      await updateDoc(doc(db, 'supportChats', activeUid), {
        lastMessage: msg, lastMessageAt: serverTimestamp(), unreadAdmin: 0,
      })
    } catch (err) { console.error(err) }
    setSending(false)
  }

  const activeChat = chats.find(c => c.id === activeUid)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {rulesError && (
      <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 16px' }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: '#991b1b', margin: '0 0 6px' }}>Firestore Rules ไม่อนุญาตให้ Admin อ่าน supportChats</p>
        <p style={{ fontSize: 12, color: '#b91c1c', fontWeight: 500, margin: '0 0 8px' }}>ไปที่ Firebase Console → Firestore Database → Rules แล้วเพิ่ม rule นี้:</p>
        <pre style={{ backgroundColor: '#fff', borderRadius: 8, padding: '10px 14px', fontSize: 11, color: '#333', margin: 0, overflowX: 'auto', border: '1px solid #FECACA' }}>{`match /supportChats/{userId} {
  allow read, write: if request.auth != null &&
    (request.auth.uid == userId ||
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
  match /messages/{msgId} {
    allow read, write: if request.auth != null &&
      (request.auth.uid == userId ||
       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
  }
}`}</pre>
      </div>
    )}
    <div style={{ display: 'flex', gap: 16, height: 'calc(100dvh - 200px)', minHeight: 400 }}>
      {/* Chat list */}
      <div style={{ width: 260, flexShrink: 0, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#000', margin: 0 }}>Support Chats ({chats.length})</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.length === 0 && <p style={{ padding: '20px 16px', fontSize: 13, color: '#aaa', fontWeight: 500 }}>ยังไม่มีการสนทนา</p>}
          {chats.map(chat => (
            <button key={chat.id} onClick={() => setActiveUid(chat.id)} style={{
              width: '100%', padding: '12px 16px', border: 'none', textAlign: 'left', cursor: 'pointer',
              backgroundColor: activeUid === chat.id ? '#FFF7ED' : 'transparent',
              borderBottom: '1px solid #f9f9f9', fontFamily: 'Space Grotesk, sans-serif',
              display: 'flex', alignItems: 'center', gap: 10,
              transition: 'background 0.1s',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, backgroundImage: chat.userPhoto ? `url(${chat.userPhoto})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#F97316' }}>
                {!chat.userPhoto && (chat.userName?.[0]?.toUpperCase() || '?')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#000', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {chat.userName || 'ไม่ระบุ'}
                  {chat.unreadAdmin > 0 && <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F97316', display: 'inline-block' }} />}
                </div>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.lastMessage || '...'}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!activeUid ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <Headphones size={36} color="#e5e7eb" style={{ marginBottom: 10 }} />
              <p style={{ fontSize: 13, color: '#aaa', fontWeight: 600 }}>เลือก Support Chat ทางซ้าย</p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundImage: activeChat?.userPhoto ? `url(${activeChat.userPhoto})` : 'none', backgroundSize: 'cover', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#F97316' }}>
                {!activeChat?.userPhoto && (activeChat?.userName?.[0]?.toUpperCase() || '?')}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#000' }}>{activeChat?.userName}</div>
                <div style={{ fontSize: 11, color: '#aaa', fontWeight: 500 }}>{activeChat?.userEmail}</div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.map(msg => {
                const isAdmin = msg.isAdmin
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '70%', padding: '9px 13px', borderRadius: isAdmin ? '14px 14px 4px 14px' : '14px 14px 14px 4px', backgroundColor: isAdmin ? '#F97316' : '#f5f5f5', color: isAdmin ? '#fff' : '#000', fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>
                      {msg.text}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendReply} style={{ padding: '10px 12px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
              <input value={text} onChange={e => setText(e.target.value)} placeholder="ตอบกลับ..." style={{ flex: 1, padding: '9px 14px', borderRadius: 999, border: '1.5px solid #e5e7eb', fontSize: 13, fontFamily: 'Space Grotesk, sans-serif', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#F97316'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              <button type="submit" disabled={!text.trim() || sending} style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', backgroundColor: text.trim() ? '#F97316' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: text.trim() ? 'pointer' : 'not-allowed', flexShrink: 0 }}>
                <Send size={15} color="#fff" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
    </div>
  )
}

export default function AdminPage() {
  const { isAdmin, user } = useAuth()
  const [activeTab, setActiveTab] = useState('directory')
  const [listings, setListings] = useState([])
  const [users, setUsers] = useState([])
  const [pendingDocs, setPendingDocs] = useState([])
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [reviewModal, setReviewModal] = useState(null)
  const [reviewNote, setReviewNote] = useState('')
  const [venues, setVenues] = useState([])
  const [bookings, setBookings] = useState([])
  const [venueModal, setVenueModal] = useState(null)
  const [venueSubTab, setVenueSubTab] = useState('venues')
  const [bookingFilter, setBookingFilter] = useState('all')
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0)
  const [cats, setCats] = useState([])
  const [catSearch, setCatSearch] = useState('')

  useEffect(() => {
    if (!isAdmin) return
    const q = query(collection(db, 'directory'), orderBy('name'))
    return onSnapshot(q, snap => setListings(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin || activeTab !== 'users') return
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [isAdmin, activeTab])

  useEffect(() => {
    if (!isAdmin || activeTab !== 'documents') return
    const q = query(collection(db, 'catDocuments'), orderBy('uploadedAt', 'desc'))
    return onSnapshot(q, snap => setPendingDocs(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [isAdmin, activeTab])

  useEffect(() => {
    if (!isAdmin) return
    const q = query(collection(db, 'bookings'), where('status', '==', 'pending'))
    return onSnapshot(q, snap => setPendingBookingsCount(snap.size), () => {})
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin || activeTab !== 'venues') return
    const q = query(collection(db, 'venues'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setVenues(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => {})
  }, [isAdmin, activeTab])

  useEffect(() => {
    if (!isAdmin || activeTab !== 'venues' || venueSubTab !== 'bookings') return
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => {})
  }, [isAdmin, activeTab, venueSubTab])

  useEffect(() => {
    if (!isAdmin || activeTab !== 'cats') return
    const q = query(collection(db, 'cats'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setCats(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => {})
  }, [isAdmin, activeTab])

  if (!isAdmin) {
    return (
      <div style={{ minHeight: 'calc(100dvh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Shield size={32} color="#F97316" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#000', marginBottom: 8 }}>เฉพาะ Admin เท่านั้น</h2>
          <p style={{ fontSize: 14, color: '#aaa', fontWeight: 500 }}>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        </div>
      </div>
    )
  }

  const handleSave = async (form) => {
    const { id, ...data } = form
    if (modal?.id) {
      await updateDoc(doc(db, 'directory', modal.id), { ...data, updatedAt: serverTimestamp() })
    } else {
      await addDoc(collection(db, 'directory'), { ...data, createdAt: serverTimestamp() })
    }
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    await deleteDoc(doc(db, 'directory', id))
    setDeleting(null)
  }

  const saveVenue = async (form) => {
    const { id, ...data } = form
    if (venueModal?.id) {
      await updateDoc(doc(db, 'venues', venueModal.id), { ...data, updatedAt: serverTimestamp() })
    } else {
      await addDoc(collection(db, 'venues'), { ...data, createdAt: serverTimestamp() })
    }
  }

  const deleteVenue = async (id) => {
    await deleteDoc(doc(db, 'venues', id))
  }

  const updateBookingStatus = async (bookingId, status) => {
    await updateDoc(doc(db, 'bookings', bookingId), { status, updatedAt: serverTimestamp() })
  }

  const reviewDoc = async (docId, status) => {
    await updateDoc(doc(db, 'catDocuments', docId), {
      status,
      reviewNote: reviewNote.trim(),
      reviewedAt: serverTimestamp(),
    })
    setReviewModal(null)
    setReviewNote('')
  }

  const TABS = [
    { id: 'directory', label: 'Directory', icon: Building2 },
    { id: 'cats', label: 'แมวทั้งหมด', icon: PawPrint },
    { id: 'users', label: 'ผู้ใช้', icon: Users },
    { id: 'documents', label: 'เอกสาร', icon: FileText },
    { id: 'venues', label: 'สถานที่', icon: Home },
    { id: 'support', label: 'Support', icon: Headphones },
  ]

  return (
    <div style={{ minHeight: 'calc(100dvh - 60px)', backgroundColor: '#f8f8f8', fontFamily: 'Space Grotesk, sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', padding: '18px 20px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Shield size={20} color="#F97316" />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 900, color: '#000' }}>Admin Panel</h1>
              <p style={{ fontSize: 11, color: '#aaa', fontWeight: 500 }}>จัดการข้อมูล Catinder</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0 }}>
            {TABS.map(t => {
              const Icon = t.icon
              const badge = t.id === 'documents' ? pendingDocs.filter(d => d.status === 'pending').length
                : t.id === 'venues' ? pendingBookingsCount : 0
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 800, color: activeTab === t.id ? '#F97316' : '#aaa',
                  borderBottom: `2px solid ${activeTab === t.id ? '#F97316' : 'transparent'}`,
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'Space Grotesk, sans-serif', transition: 'color 0.15s', position: 'relative',
                }}>
                  <Icon size={14} /> {t.label}
                  {badge > 0 && (
                    <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 5px', borderRadius: 999, marginLeft: 2 }}>{badge}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
        {/* Directory tab */}
        {activeTab === 'directory' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>{listings.length} รายการ</p>
              <button onClick={() => setModal({})} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px',
                backgroundColor: '#F97316', color: '#fff', border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
              }}>
                <Plus size={15} /> เพิ่มสถานที่
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {listings.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <Building2 size={28} color="#F97316" />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#000', marginBottom: 6 }}>ยังไม่มีรายการ</p>
                  <p style={{ fontSize: 13, color: '#aaa', fontWeight: 500 }}>กดปุ่มเพิ่มสถานที่เพื่อเริ่มต้น</p>
                </div>
              )}

              {listings.map(listing => {
                const CatIcon = getCatIcon(listing.category)
                const catLabel = CATEGORIES.find(c => c.id === listing.category)?.label || listing.category
                return (
                  <div key={listing.id} style={{
                    backgroundColor: '#fff', borderRadius: 14, padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 13,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', flexWrap: 'wrap',
                  }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CatIcon size={20} color="#F97316" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#000' }}>{listing.name}</span>
                        {listing.verified && (
                          <span style={{ fontSize: 10, fontWeight: 800, color: '#10b981', backgroundColor: '#ecfdf5', padding: '2px 7px', borderRadius: 6 }}>Verified</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>{catLabel}</span>
                        {listing.address && (
                          <span style={{ fontSize: 11, color: '#bbb', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <MapPin size={10} /> {listing.address}
                          </span>
                        )}
                        {listing.phone && (
                          <span style={{ fontSize: 11, color: '#bbb', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Phone size={10} /> {listing.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                      <button onClick={() => setModal(listing)} style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#555', fontFamily: 'Space Grotesk, sans-serif' }}>
                        <Pencil size={12} /> แก้ไข
                      </button>
                      <button onClick={() => handleDelete(listing.id)} disabled={deleting === listing.id} style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #fee2e2', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#ef4444', fontFamily: 'Space Grotesk, sans-serif' }}>
                        <Trash2 size={12} /> {deleting === listing.id ? '...' : 'ลบ'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Documents tab */}
        {activeTab === 'documents' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>
                {pendingDocs.length} เอกสารทั้งหมด · {pendingDocs.filter(d => d.status === 'pending').length} รอตรวจสอบ
              </p>
            </div>

            {pendingDocs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: 14 }}>
                <FileText size={32} color="#e5e7eb" style={{ marginBottom: 10 }} />
                <p style={{ fontSize: 14, color: '#aaa', fontWeight: 600 }}>ยังไม่มีเอกสารรอตรวจสอบ</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pendingDocs.map(d => (
                  <div key={d.id} style={{ backgroundColor: '#fff', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#000' }}>{d.typeLabel}</span>
                        <DocStatusBadge status={d.status} />
                      </div>
                      <p style={{ fontSize: 13, color: '#555', fontWeight: 600, margin: '0 0 2px' }}>แมว: <strong>{d.catName}</strong> · เจ้าของ: {d.ownerName}</p>
                      {d.note && <p style={{ fontSize: 12, color: '#888', fontWeight: 500, margin: '0 0 2px' }}>หมายเหตุ: {d.note}</p>}
                      {d.status === 'rejected' && d.reviewNote && <p style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, margin: '0 0 2px' }}>เหตุผล: {d.reviewNote}</p>}
                      <p style={{ fontSize: 11, color: '#bbb', fontWeight: 500, margin: '4px 0 0' }}>{d.filename}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
                      <a href={d.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 8, border: '1.5px solid #e5e7eb', backgroundColor: '#fafafa', color: '#555', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                        <Eye size={12} /> ดูเอกสาร
                      </a>
                      {d.status !== 'verified' && (
                        <button onClick={async () => { await reviewDoc(d.id, 'verified') }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 8, border: 'none', backgroundColor: '#D1FAE5', color: '#065f46', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
                          <ShieldCheck size={12} /> ยืนยัน
                        </button>
                      )}
                      {d.status !== 'rejected' && (
                        <button onClick={() => { setReviewModal(d); setReviewNote('') }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 8, border: 'none', backgroundColor: '#FEE2E2', color: '#991b1b', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
                          <AlertCircle size={12} /> ไม่ผ่าน
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reject reason modal */}
            <AnimatePresence>
              {reviewModal && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                  onClick={() => setReviewModal(null)}>
                  <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
                    onClick={e => e.stopPropagation()}
                    style={{ backgroundColor: '#fff', borderRadius: 18, padding: '24px 22px', maxWidth: 380, width: '100%', fontFamily: 'Space Grotesk, sans-serif' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: '#000', marginBottom: 6 }}>ระบุเหตุผลที่ไม่ผ่าน</h3>
                    <p style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>เอกสาร: {reviewModal.typeLabel} · {reviewModal.catName}</p>
                    <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="เช่น เอกสารไม่ชัดเจน, ข้อมูลไม่ตรงกัน..." rows={3}
                      style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 14 }}
                      onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => setReviewModal(null)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid #e5e7eb', backgroundColor: '#fff', color: '#555', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>ยกเลิก</button>
                      <button onClick={() => reviewDoc(reviewModal.id, 'rejected')} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', backgroundColor: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>ไม่ผ่าน</button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Venues tab */}
        {activeTab === 'venues' && (
          <>
            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[{ id: 'venues', label: 'สถานที่', icon: Home }, { id: 'bookings', label: 'การจอง', icon: CalendarDays }].map(t => {
                const Icon = t.icon
                return (
                  <button key={t.id} onClick={() => setVenueSubTab(t.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                    borderRadius: 10, border: 'none', cursor: 'pointer',
                    backgroundColor: venueSubTab === t.id ? '#F97316' : '#fff',
                    color: venueSubTab === t.id ? '#fff' : '#555',
                    fontSize: 13, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.07)', transition: 'all 0.15s',
                  }}>
                    <Icon size={14} /> {t.label}
                    {t.id === 'bookings' && pendingBookingsCount > 0 && (
                      <span style={{ backgroundColor: venueSubTab === 'bookings' ? 'rgba(255,255,255,0.3)' : '#F97316', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 999, marginLeft: 2 }}>
                        {pendingBookingsCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {venueSubTab === 'venues' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>{venues.length} สถานที่</p>
                  <button onClick={() => setVenueModal({})} style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px',
                    backgroundColor: '#F97316', color: '#fff', border: 'none', borderRadius: 10,
                    fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
                  }}>
                    <Plus size={15} /> เพิ่มสถานที่
                  </button>
                </div>

                {venues.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#fff', borderRadius: 14 }}>
                    <Home size={32} color="#e5e7eb" style={{ marginBottom: 10 }} />
                    <p style={{ fontSize: 14, color: '#aaa', fontWeight: 600 }}>ยังไม่มีสถานที่ — กดเพิ่มสถานที่เพื่อเริ่มต้น</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {venues.map(v => (
                      <div key={v.id} style={{ backgroundColor: '#fff', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 13, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', flexWrap: 'wrap' }}>
                        <div style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0, backgroundColor: '#f5f5f5', backgroundImage: v.photoURL ? `url(${v.photoURL})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {!v.photoURL && <Home size={22} color="#ccc" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: '#000' }}>{v.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, backgroundColor: v.isActive ? '#D1FAE5' : '#f0f0f0', color: v.isActive ? '#065f46' : '#888' }}>
                              {v.isActive ? 'เปิดรับจอง' : 'ปิด'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {v.location && <span style={{ fontSize: 11, color: '#aaa', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} /> {v.location}</span>}
                            <span style={{ fontSize: 11, color: '#F97316', fontWeight: 700 }}>฿{v.price?.toLocaleString() || 0}/{v.priceUnit === 'session' ? 'ครั้ง' : 'คืน'}</span>
                          </div>
                          {v.facilities?.length > 0 && (
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 5 }}>
                              {v.facilities.map(f => (
                                <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#666', backgroundColor: '#f5f5f5', padding: '2px 8px', borderRadius: 999 }}>{VENUE_FACILITY_LABELS[f] || f}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                          <button onClick={() => setVenueModal(v)} style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#555', fontFamily: 'Space Grotesk, sans-serif' }}>
                            <Pencil size={12} /> แก้ไข
                          </button>
                          <button onClick={() => deleteVenue(v.id)} style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #fee2e2', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#ef4444', fontFamily: 'Space Grotesk, sans-serif' }}>
                            <Trash2 size={12} /> ลบ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {venueSubTab === 'bookings' && (
              <>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                    <button key={s} onClick={() => setBookingFilter(s)} style={{
                      padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
                      backgroundColor: bookingFilter === s ? '#000' : '#f0f0f0',
                      color: bookingFilter === s ? '#fff' : '#555',
                      fontSize: 12, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif',
                    }}>
                      {{ all: 'ทั้งหมด', pending: 'รอยืนยัน', confirmed: 'ยืนยันแล้ว', completed: 'เสร็จสิ้น', cancelled: 'ยกเลิก' }[s]}
                    </button>
                  ))}
                </div>

                {bookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#fff', borderRadius: 14 }}>
                    <CalendarDays size={32} color="#e5e7eb" style={{ marginBottom: 10 }} />
                    <p style={{ fontSize: 14, color: '#aaa', fontWeight: 600 }}>ยังไม่มีการจอง</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {bookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter).map(b => (
                      <div key={b.id} style={{ backgroundColor: '#fff', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                            <span style={{ fontSize: 14, fontWeight: 900, color: '#000' }}>{b.venueName}</span>
                            <BookingBadge status={b.status} />
                          </div>
                          <p style={{ fontSize: 13, color: '#555', fontWeight: 600, margin: '0 0 2px' }}>
                            {b.userName} · น้องแมว: <strong>{b.catName}</strong> ({b.catBreed})
                          </p>
                          <p style={{ fontSize: 12, color: '#888', fontWeight: 500, margin: '0 0 2px' }}>
                            {b.checkIn} → {b.checkOut}
                          </p>
                          {b.notes && <p style={{ fontSize: 12, color: '#aaa', fontWeight: 500, margin: '2px 0 0' }}>หมายเหตุ: {b.notes}</p>}
                        </div>
                        <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                          {b.status === 'pending' && (
                            <>
                              <button onClick={() => updateBookingStatus(b.id, 'confirmed')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 8, border: 'none', backgroundColor: '#D1FAE5', color: '#065f46', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
                                <CheckCircle size={12} /> ยืนยัน
                              </button>
                              <button onClick={() => updateBookingStatus(b.id, 'cancelled')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 8, border: 'none', backgroundColor: '#FEE2E2', color: '#991b1b', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
                                <XCircle size={12} /> ยกเลิก
                              </button>
                            </>
                          )}
                          {b.status === 'confirmed' && (
                            <button onClick={() => updateBookingStatus(b.id, 'completed')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 8, border: 'none', backgroundColor: '#DBEAFE', color: '#1e40af', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
                              <CheckCircle size={12} /> เสร็จสิ้น
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <AnimatePresence>
              {venueModal !== null && (
                <VenueFormModal
                  initial={venueModal?.id ? venueModal : null}
                  onSave={saveVenue}
                  onClose={() => setVenueModal(null)}
                />
              )}
            </AnimatePresence>
          </>
        )}

        {/* Cats tab */}
        {activeTab === 'cats' && (() => {
          const LOOKING_FOR_LABEL = {
            mate: 'หาคู่ผสมพันธุ์', friend: 'หาเพื่อนเล่น', adopt: 'หาบ้าน',
            foster: 'Foster', sell: 'ขาย', exchange: 'แลกเปลี่ยน',
            any: 'ทุกอย่าง', other: 'อื่นๆ',
          }
          const filtered = cats.filter(c => {
            if (!catSearch.trim()) return true
            const q = catSearch.toLowerCase()
            return (
              c.name?.toLowerCase().includes(q) ||
              c.breed?.toLowerCase().includes(q) ||
              c.ownerName?.toLowerCase().includes(q) ||
              c.location?.toLowerCase().includes(q)
            )
          })
          return (
            <>
              {/* search + count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                  <Search size={14} color="#bbb" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    value={catSearch} onChange={e => setCatSearch(e.target.value)}
                    placeholder="ค้นหาชื่อแมว, สายพันธุ์, เจ้าของ, ที่อยู่..."
                    style={{ width: '100%', padding: '9px 13px 9px 34px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#F97316'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
                <span style={{ fontSize: 13, color: '#888', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {filtered.length}/{cats.length} ตัว
                </span>
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: 14 }}>
                  <PawPrint size={32} color="#e5e7eb" style={{ marginBottom: 10 }} />
                  <p style={{ fontSize: 14, color: '#aaa', fontWeight: 600 }}>
                    {catSearch ? 'ไม่พบแมวที่ค้นหา' : 'ยังไม่มีแมวในระบบ'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filtered.map(cat => {
                    const lookingTags = Array.isArray(cat.lookingFor)
                      ? cat.lookingFor : cat.lookingFor ? [cat.lookingFor] : []
                    const ageStr = [
                      cat.ageYears ? `${cat.ageYears} ปี` : '',
                      cat.ageMonths ? `${cat.ageMonths} เดือน` : '',
                    ].filter(Boolean).join(' ') || '-'

                    return (
                      <div key={cat.id} style={{
                        backgroundColor: '#fff', borderRadius: 14, padding: '14px 16px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        display: 'flex', gap: 13, alignItems: 'flex-start', flexWrap: 'wrap',
                      }}>
                        {/* photo */}
                        <div style={{
                          width: 58, height: 58, borderRadius: 14, flexShrink: 0,
                          backgroundImage: cat.photoURL ? `url(${cat.photoURL})` : 'none',
                          backgroundSize: 'cover', backgroundPosition: 'center',
                          backgroundColor: '#FFF7ED',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid rgba(249,115,22,0.15)',
                        }}>
                          {!cat.photoURL && <PawPrint size={24} color="#F97316" style={{ opacity: 0.4 }} />}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* name + gender + breed */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
                            <span style={{ fontSize: 15, fontWeight: 900, color: '#000' }}>{cat.name}</span>
                            <span style={{
                              fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
                              backgroundColor: cat.gender === 'female' ? '#fce7f3' : '#eff6ff',
                              color: cat.gender === 'female' ? '#be185d' : '#1d4ed8',
                            }}>
                              {cat.gender === 'female' ? '♀ ตัวเมีย' : '♂ ตัวผู้'}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#F97316', backgroundColor: '#FFF7ED', padding: '2px 8px', borderRadius: 999 }}>
                              {cat.breed}
                            </span>
                          </div>

                          {/* owner + age + weight + location */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px', marginBottom: 7 }}>
                            <span style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>
                              เจ้าของ: <strong>{cat.ownerName || '-'}</strong>
                            </span>
                            <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>อายุ {ageStr}</span>
                            {cat.weight && <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{cat.weight} กก.</span>}
                            {cat.location && (
                              <span style={{ fontSize: 12, color: '#888', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
                                <MapPin size={10} /> {cat.location}
                              </span>
                            )}
                          </div>

                          {/* health badges */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: lookingTags.length ? 6 : 0 }}>
                            {cat.vaccinated && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#065f46', backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: 999 }}>
                                <Syringe size={10} /> วัคซีนครบ
                              </span>
                            )}
                            {cat.sterilized && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#5b21b6', backgroundColor: '#ede9fe', padding: '2px 8px', borderRadius: 999 }}>
                                <Scissors size={10} /> ทำหมันแล้ว
                              </span>
                            )}
                            {cat.microchipped && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#1e40af', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: 999 }}>ไมโครชิป</span>
                            )}
                            {cat.fivFelvTested && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#92400e', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: 999 }}>FIV/FeLV ✓</span>
                            )}
                            {cat.registry && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#F97316', backgroundColor: '#FFF7ED', padding: '2px 8px', borderRadius: 999 }}>
                                📋 {cat.registry}
                              </span>
                            )}
                          </div>

                          {/* looking for tags */}
                          {lookingTags.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                              {lookingTags.map(tag => (
                                <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#fff', backgroundColor: '#F97316', padding: '2px 9px', borderRadius: 999 }}>
                                  <Heart size={9} /> {LOOKING_FOR_LABEL[tag] || tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* date */}
                        <div style={{ fontSize: 10, color: '#ccc', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>
                          {cat.createdAt?.toDate ? cat.createdAt.toDate().toLocaleDateString('th-TH') : ''}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )
        })()}

        {/* Support tab */}
        {activeTab === 'support' && <SupportPanel user={user} />}

        {/* Users tab */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 6 }}>{users.length} ผู้ใช้</p>
            {users.map(u => (
              <div key={u.id} style={{
                backgroundColor: '#fff', borderRadius: 14, padding: '13px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  backgroundImage: u.photoURL ? `url(${u.photoURL})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {!u.photoURL && <Users size={18} color="#ddd" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#000' }}>{u.displayName || 'ไม่ระบุ'}</span>
                    {u.role === 'admin' && (
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#F97316', backgroundColor: '#FFF7ED', padding: '2px 7px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Shield size={9} /> Admin
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                </div>
                <div style={{ fontSize: 10, color: '#bbb', fontWeight: 600, flexShrink: 0 }}>
                  {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString('th-TH') : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal !== null && (
          <ListingModal
            initial={modal?.id ? modal : null}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
