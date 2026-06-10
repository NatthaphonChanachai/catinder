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
    { id: 'users', label: 'ผู้ใช้', icon: Users },
    { id: 'documents', label: 'เอกสาร', icon: FileText },
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
              const badge = t.id === 'documents' ? pendingDocs.filter(d => d.status === 'pending').length : 0
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
