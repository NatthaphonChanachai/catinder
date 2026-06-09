import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection, addDoc, getDocs, deleteDoc, doc, getDoc,
  serverTimestamp, orderBy, query,
} from 'firebase/firestore'
import {
  ArrowLeft, Plus, Trash2, Syringe, Scissors,
  Activity, Calendar, X, Save, ClipboardList, Scale,
} from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

const RECORD_TYPES = [
  { value: 'vaccine', label: 'ฉีดวัคซีน', icon: Syringe, color: '#10b981', bg: '#f0fdf4' },
  { value: 'deworming', label: 'ถ่ายพยาธิ', icon: Activity, color: '#F97316', bg: '#FFF7ED' },
  { value: 'vet', label: 'พบสัตวแพทย์', icon: ClipboardList, color: '#0ea5e9', bg: '#f0f9ff' },
  { value: 'weight', label: 'ชั่งน้ำหนัก', icon: Scale, color: '#8b5cf6', bg: '#faf5ff' },
  { value: 'surgery', label: 'ผ่าตัด/ทำหมัน', icon: Scissors, color: '#ef4444', bg: '#fef2f2' },
  { value: 'other', label: 'อื่นๆ', icon: ClipboardList, color: '#6b7280', bg: '#f9fafb' },
]

const inputStyle = {
  width: '100%', padding: '10px 13px', borderRadius: 10,
  border: '1.5px solid #e5e7eb', fontSize: 14,
  fontFamily: 'Space Grotesk, sans-serif',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s', backgroundColor: '#fff',
}

function AddRecordModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    type: 'vaccine', date: new Date().toISOString().split('T')[0],
    description: '', vet: '', nextDue: '', value: '',
  })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.date) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  const typeInfo = RECORD_TYPES.find(r => r.value === form.type)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: 0,
    }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#fff', borderRadius: '22px 22px 0 0',
          padding: '24px 20px 40px', width: '100%', maxWidth: 560,
          fontFamily: 'Space Grotesk, sans-serif',
          maxHeight: '90dvh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: '#000' }}>เพิ่มบันทึกสุขภาพ</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#888" />
          </button>
        </div>

        {/* Type selector */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ประเภท</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {RECORD_TYPES.map(({ value, label, icon: Icon, color, bg }) => (
              <button key={value} type="button" onClick={() => set('type', value)} style={{
                padding: '10px 8px', borderRadius: 11,
                border: form.type === value ? `2px solid ${color}` : '1.5px solid #e5e7eb',
                backgroundColor: form.type === value ? bg : '#fff',
                color: form.type === value ? color : '#666',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Space Grotesk, sans-serif',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                transition: 'all 0.15s',
              }}>
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>วันที่ <span style={{ color: '#ef4444' }}>*</span></label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
            required style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#F97316'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        {form.type === 'weight' ? (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>น้ำหนัก (กก.)</label>
            <input type="number" step="0.01" min="0" max="30" value={form.value} onChange={e => set('value', e.target.value)}
              placeholder="เช่น 4.5" style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#F97316'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>รายละเอียด</label>
            <input type="text" value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="เช่น วัคซีน FVRCP, ถ่ายพยาธิ Drontal, ตรวจเลือดประจำปี..." style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#F97316'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>สัตวแพทย์ / คลินิก</label>
          <input type="text" value={form.vet} onChange={e => set('vet', e.target.value)}
            placeholder="ชื่อหมอหรือคลินิก (ถ้ามี)" style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#F97316'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ครั้งถัดไป (ถ้ามี)</label>
          <input type="date" value={form.nextDue} onChange={e => set('nextDue', e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#F97316'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <button onClick={handleSave} disabled={saving || !form.date}
          style={{
            width: '100%', padding: '13px', borderRadius: 12, border: 'none',
            backgroundColor: saving || !form.date ? '#ccc' : '#F97316',
            color: '#fff', fontSize: 15, fontWeight: 800,
            cursor: saving || !form.date ? 'not-allowed' : 'pointer',
            fontFamily: 'Space Grotesk, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Save size={15} /> {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </motion.div>
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function HealthPassportPage() {
  const { catId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [cat, setCat] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const catSnap = await getDoc(doc(db, 'cats', catId))
        if (!catSnap.exists()) { navigate('/my-cats'); return }
        setCat({ id: catSnap.id, ...catSnap.data() })

        const recSnap = await getDocs(query(
          collection(db, 'cats', catId, 'healthRecords'),
          orderBy('date', 'desc')
        ))
        setRecords(recSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [catId])

  const handleSave = async (form) => {
    const newDoc = await addDoc(collection(db, 'cats', catId, 'healthRecords'), {
      ...form, createdAt: serverTimestamp(),
    })
    setRecords(prev => [{ id: newDoc.id, ...form }, ...prev].sort((a, b) => b.date > a.date ? 1 : -1))
  }

  const handleDelete = async (recId) => {
    if (!confirm('ลบบันทึกนี้ใช่ไหม?')) return
    await deleteDoc(doc(db, 'cats', catId, 'healthRecords', recId))
    setRecords(prev => prev.filter(r => r.id !== recId))
  }

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif' }}>
      <p style={{ color: '#aaa', fontSize: 15 }}>กำลังโหลด...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#f8f8f8', fontFamily: 'Space Grotesk, sans-serif', paddingBottom: 80 }}>
      <AnimatePresence>
        {modalOpen && <AddRecordModal onClose={() => setModalOpen(false)} onSave={handleSave} />}
      </AnimatePresence>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px' }}>
        <button onClick={() => navigate('/my-cats')} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 700, color: '#888', marginBottom: 20, padding: 0,
        }}>
          <ArrowLeft size={15} /> กลับ
        </button>

        {/* Cat header */}
        <div style={{ backgroundColor: '#fff', borderRadius: 18, padding: '18px 20px', marginBottom: 20, border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, flexShrink: 0,
            backgroundColor: '#f5f5f5',
            backgroundImage: cat?.photoURL ? `url(${cat.photoURL})` : 'none',
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {!cat?.photoURL && <ClipboardList size={24} color="#ddd" />}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 19, fontWeight: 900, color: '#000', marginBottom: 2 }}>Health Passport</h1>
            <p style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>{cat?.name} · {cat?.breed}</p>
          </div>
          <button onClick={() => setModalOpen(true)} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            backgroundColor: '#F97316', color: '#fff',
            padding: '9px 16px', borderRadius: 10,
            border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 800,
            fontFamily: 'Space Grotesk, sans-serif',
            boxShadow: '0 3px 10px rgba(249,115,22,0.3)',
            flexShrink: 0,
          }}>
            <Plus size={14} /> เพิ่ม
          </button>
        </div>

        {/* Summary chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {RECORD_TYPES.filter(rt => records.some(r => r.type === rt.value)).map(({ value, label, icon: Icon, color, bg }) => {
            const latest = records.filter(r => r.type === value).sort((a, b) => b.date > a.date ? 1 : -1)[0]
            return (
              <div key={value} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 999,
                backgroundColor: bg, color, fontSize: 12, fontWeight: 700,
                border: `1px solid ${color}22`,
              }}>
                <Icon size={12} />
                {label}: {formatDate(latest?.date)}
              </div>
            )
          })}
        </div>

        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: '#fff', borderRadius: 18, border: '2px dashed #e5e7eb' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <ClipboardList size={28} color="#F97316" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#000', marginBottom: 6 }}>ยังไม่มีบันทึกสุขภาพ</h3>
            <p style={{ fontSize: 13, color: '#888', fontWeight: 500, marginBottom: 18 }}>เพิ่มบันทึกวัคซีน ถ่ายพยาธิ หรือการพบสัตวแพทย์</p>
            <button onClick={() => setModalOpen(true)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              backgroundColor: '#F97316', color: '#fff',
              padding: '10px 20px', borderRadius: 10,
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800,
              fontFamily: 'Space Grotesk, sans-serif',
            }}>
              <Plus size={14} /> เพิ่มบันทึกแรก
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {records.map((rec, i) => {
              const typeInfo = RECORD_TYPES.find(r => r.value === rec.type) || RECORD_TYPES[5]
              const Icon = typeInfo.icon
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    backgroundColor: '#fff', borderRadius: 14, padding: '14px 16px',
                    border: '1px solid #f0f0f0',
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    backgroundColor: typeInfo.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={17} color={typeInfo.color} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: typeInfo.color }}>{typeInfo.label}</span>
                      <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>
                        {formatDate(rec.date)}
                      </span>
                    </div>
                    {rec.type === 'weight' ? (
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#000' }}>{rec.value} <span style={{ fontSize: 13, fontWeight: 600, color: '#888' }}>กก.</span></div>
                    ) : (
                      rec.description && <div style={{ fontSize: 13, color: '#444', fontWeight: 500, marginBottom: 2 }}>{rec.description}</div>
                    )}
                    {rec.vet && <div style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{rec.vet}</div>}
                    {rec.nextDue && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 11, color: '#F97316', fontWeight: 700, backgroundColor: '#FFF7ED', padding: '2px 8px', borderRadius: 999 }}>
                        <Calendar size={10} /> ครั้งถัดไป: {formatDate(rec.nextDue)}
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleDelete(rec.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 4, flexShrink: 0, opacity: 0.4, transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0.4}
                  >
                    <Trash2 size={14} color="#ef4444" />
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
