import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy
} from 'firebase/firestore'
import {
  Shield, Plus, Pencil, Trash2, X, Check, Users, Building2,
  Home, Coffee, HeartPulse, Stethoscope, Fish, TreePine, MapPin, Phone
} from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

const CATEGORIES = [
  { id: 'farm', label: 'ฟาร์มแมว', icon: Home },
  { id: 'cafe', label: 'คาเฟ่แมว', icon: Coffee },
  { id: 'vet', label: 'โรงพยาบาลสัตว์', icon: HeartPulse },
  { id: 'clinic', label: 'คลินิก', icon: Stethoscope },
  { id: 'food', label: 'ร้านอาหารแมว', icon: Fish },
  { id: 'place', label: 'ที่เที่ยว Cat-Friendly', icon: TreePine },
]

function getCatIcon(catId) {
  const c = CATEGORIES.find(c => c.id === catId)
  return c ? c.icon : Building2
}

const EMPTY_FORM = { name: '', category: 'cafe', address: '', phone: '', website: '', description: '', verified: false }

function ListingModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave(form)
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

export default function AdminPage() {
  const { isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('directory')
  const [listings, setListings] = useState([])
  const [users, setUsers] = useState([])
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)

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

  const TABS = [
    { id: 'directory', label: 'Directory', icon: Building2 },
    { id: 'users', label: 'ผู้ใช้', icon: Users },
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
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 800, color: activeTab === t.id ? '#F97316' : '#aaa',
                  borderBottom: `2px solid ${activeTab === t.id ? '#F97316' : 'transparent'}`,
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'Space Grotesk, sans-serif', transition: 'color 0.15s',
                }}>
                  <Icon size={14} /> {t.label}
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
