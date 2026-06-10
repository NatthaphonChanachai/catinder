import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection, addDoc, getDocs, deleteDoc, doc, getDoc,
  serverTimestamp, orderBy, query, updateDoc, where,
} from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import {
  ArrowLeft, Plus, Trash2, Syringe, Scissors,
  Activity, Calendar, X, Save, ClipboardList, Scale,
  FileDown, Lock, Sparkles, Check, FileText,
  ShieldCheck, Clock, AlertCircle, Upload, Eye,
} from 'lucide-react'
import { db, storage } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

const FREE_RECORD_LIMIT = 10

const RECORD_TYPES = [
  { value: 'vaccine', label: 'ฉีดวัคซีน', icon: Syringe, color: '#10b981', bg: '#f0fdf4' },
  { value: 'deworming', label: 'ถ่ายพยาธิ', icon: Activity, color: '#F97316', bg: '#FFF7ED' },
  { value: 'vet', label: 'พบสัตวแพทย์', icon: ClipboardList, color: '#0ea5e9', bg: '#f0f9ff' },
  { value: 'weight', label: 'ชั่งน้ำหนัก', icon: Scale, color: '#8b5cf6', bg: '#faf5ff' },
  { value: 'surgery', label: 'ผ่าตัด/ทำหมัน', icon: Scissors, color: '#ef4444', bg: '#fef2f2' },
  { value: 'other', label: 'อื่นๆ', icon: ClipboardList, color: '#6b7280', bg: '#f9fafb' },
]

const DOC_TYPES = [
  { value: 'pedigree', label: 'ใบ Pedigree', icon: '🏆' },
  { value: 'vaccine_book', label: 'สมุดวัคซีน', icon: '💉' },
  { value: 'health_cert', label: 'ใบรับรองสุขภาพ', icon: '🏥' },
  { value: 'vet_exam', label: 'ผลตรวจจากสัตวแพทย์', icon: '🔬' },
  { value: 'other', label: 'เอกสารอื่นๆ', icon: '📄' },
]

const inputStyle = {
  width: '100%', padding: '10px 13px', borderRadius: 10,
  border: '1.5px solid #e5e7eb', fontSize: 14,
  fontFamily: 'Space Grotesk, sans-serif',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s', backgroundColor: '#fff',
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
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      color: s.color, backgroundColor: s.bg,
    }}>
      <Icon size={11} /> {s.label}
    </span>
  )
}

function UpgradeModal({ onClose, reason = 'limit' }) {
  const PERKS = [
    'บันทึกสุขภาพไม่จำกัด',
    'Export Health Passport เป็น PDF',
    'QR Code แชร์ให้สัตวแพทย์สแกนได้',
    'Badge "Verified Health" บนโปรไฟล์แมว',
    'Match ไม่จำกัดใน Discover',
  ]
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: '#fff', borderRadius: 24, padding: '32px 28px', width: '100%', maxWidth: 400, fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 32px 80px rgba(0,0,0,0.25)', position: 'relative' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <X size={18} color="#aaa" />
        </button>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg, #F97316, #FBBF24)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(249,115,22,0.35)' }}>
            <Sparkles size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#000', margin: '0 0 8px' }}>
            {reason === 'limit' ? 'ครบ 10 บันทึกแล้ว!' : 'ฟีเจอร์ Premium'}
          </h2>
          <p style={{ fontSize: 13, color: '#888', fontWeight: 500, lineHeight: 1.6 }}>
            {reason === 'limit' ? 'แผน Free จำกัด 10 บันทึกต่อแมว' : 'ฟีเจอร์นี้สำหรับผู้ใช้ Premium'}
          </p>
        </div>
        <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PERKS.map((perk, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: 999, flexShrink: 0, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={12} color="#F97316" strokeWidth={3} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{perk}</span>
            </div>
          ))}
        </div>
        <div style={{ backgroundColor: '#FFF7ED', borderRadius: 14, padding: '14px 18px', marginBottom: 18, textAlign: 'center' }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: '#F97316' }}>฿299</span>
          <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}> / เดือน</span>
          <p style={{ fontSize: 11, color: '#aaa', margin: '4px 0 0', fontWeight: 500 }}>ยกเลิกได้ทุกเมื่อ · ไม่มีสัญญาผูกมัด</p>
        </div>
        <button style={{ width: '100%', padding: '14px', borderRadius: 13, border: 'none', background: 'linear-gradient(135deg, #F97316, #FBBF24)', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 6px 20px rgba(249,115,22,0.35)' }}
          onClick={() => alert('ระบบชำระเงินกำลังพัฒนา — เร็วๆ นี้!')}>
          อัปเกรดเป็น Premium
        </button>
        <button onClick={onClose} style={{ display: 'block', width: '100%', marginTop: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#bbb', fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif' }}>
          ไว้ทีหลัง
        </button>
      </motion.div>
    </div>
  )
}

function UploadDocModal({ catId, cat, user, userProfile, onClose, onUploaded }) {
  const [docType, setDocType] = useState('pedigree')
  const [file, setFile] = useState(null)
  const [note, setNote] = useState('')
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async () => {
    if (!file) { setError('กรุณาเลือกไฟล์'); return }
    setUploading(true)
    setError('')
    try {
      const storageRef = ref(storage, `cat-documents/${catId}/${docType}_${Date.now()}_${file.name}`)
      const task = uploadBytesResumable(storageRef, file)
      await new Promise((resolve, reject) => {
        task.on('state_changed',
          snap => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject,
          resolve
        )
      })
      const url = await getDownloadURL(storageRef)
      const typeLabel = DOC_TYPES.find(d => d.value === docType)?.label || docType

      await addDoc(collection(db, 'catDocuments'), {
        catId,
        catName: cat?.name || '',
        ownerUid: user.uid,
        ownerName: userProfile?.displayName || user.email?.split('@')[0] || '',
        type: docType,
        typeLabel,
        url,
        filename: file.name,
        note,
        status: 'pending',
        uploadedAt: serverTimestamp(),
        reviewedAt: null,
        reviewNote: '',
      })
      onUploaded()
      onClose()
    } catch (err) {
      console.error(err)
      setError('อัปโหลดล้มเหลว: ' + (err.message || 'ลองใหม่อีกครั้ง'))
    }
    setUploading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: '#fff', borderRadius: '22px 22px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 560, fontFamily: 'Space Grotesk, sans-serif', maxHeight: '90dvh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: '#000' }}>อัปโหลดเอกสาร</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#888" /></button>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ประเภทเอกสาร</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DOC_TYPES.map(dt => (
              <button key={dt.value} type="button" onClick={() => setDocType(dt.value)} style={{
                padding: '10px 14px', borderRadius: 11,
                border: docType === dt.value ? '2px solid #F97316' : '1.5px solid #e5e7eb',
                backgroundColor: docType === dt.value ? '#FFF7ED' : '#fff',
                color: docType === dt.value ? '#F97316' : '#555',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Space Grotesk, sans-serif',
                display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 18 }}>{dt.icon}</span> {dt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>เลือกไฟล์ <span style={{ color: '#ef4444' }}>*</span></label>
          <label style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 8, padding: '24px 16px', borderRadius: 12,
            border: file ? '2px solid #F97316' : '2px dashed #d1d5db',
            backgroundColor: file ? '#FFF7ED' : '#fafafa', cursor: 'pointer',
            transition: 'all 0.15s',
          }}>
            <Upload size={22} color={file ? '#F97316' : '#9ca3af'} />
            <span style={{ fontSize: 13, fontWeight: 600, color: file ? '#F97316' : '#6b7280' }}>
              {file ? file.name : 'คลิกเพื่อเลือกรูปภาพหรือ PDF'}
            </span>
            {file && <span style={{ fontSize: 11, color: '#aaa' }}>{(file.size / 1024).toFixed(0)} KB</span>}
            <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>หมายเหตุ (ถ้ามี)</label>
          <input type="text" value={note} onChange={e => setNote(e.target.value)}
            placeholder="เช่น เลขที่ใบ Pedigree: TH-12345" style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#F97316'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        {uploading && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#F97316', marginBottom: 5 }}>
              <span>กำลังอัปโหลด...</span><span>{progress}%</span>
            </div>
            <div style={{ height: 5, backgroundColor: '#f3f4f6', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', backgroundColor: '#F97316', borderRadius: 999, width: `${progress}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        )}

        {error && <p style={{ fontSize: 13, color: '#ef4444', fontWeight: 600, marginBottom: 12 }}>{error}</p>}

        <div style={{ backgroundColor: '#EFF6FF', borderRadius: 11, padding: '10px 14px', marginBottom: 18, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <Clock size={14} color="#3b82f6" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: '#1e40af', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
            ทีมงานจะตรวจสอบเอกสารและยืนยันภายใน 1–2 วันทำการ เมื่อผ่านจะได้รับ badge "Verified" บนโปรไฟล์
          </p>
        </div>

        <button onClick={handleUpload} disabled={uploading || !file}
          style={{
            width: '100%', padding: '13px', borderRadius: 12, border: 'none',
            backgroundColor: !file || uploading ? '#e5e7eb' : '#F97316',
            color: '#fff', fontSize: 15, fontWeight: 800,
            cursor: !file || uploading ? 'not-allowed' : 'pointer',
            fontFamily: 'Space Grotesk, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Upload size={15} /> {uploading ? `กำลังอัปโหลด... ${progress}%` : 'ส่งเอกสารให้ตรวจสอบ'}
        </button>
      </motion.div>
    </div>
  )
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

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: '#fff', borderRadius: '22px 22px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 560, fontFamily: 'Space Grotesk, sans-serif', maxHeight: '90dvh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: '#000' }}>เพิ่มบันทึกสุขภาพ</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#888" /></button>
        </div>
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
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, transition: 'all 0.15s',
              }}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>วันที่ <span style={{ color: '#ef4444' }}>*</span></label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#F97316'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        </div>
        {form.type === 'weight' ? (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>น้ำหนัก (กก.)</label>
            <input type="number" step="0.01" min="0" max="30" value={form.value} onChange={e => set('value', e.target.value)}
              placeholder="เช่น 4.5" style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#F97316'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>รายละเอียด</label>
            <input type="text" value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="เช่น วัคซีน FVRCP, ถ่ายพยาธิ Drontal..." style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#F97316'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>สัตวแพทย์ / คลินิก</label>
          <input type="text" value={form.vet} onChange={e => set('vet', e.target.value)}
            placeholder="ชื่อหมอหรือคลินิก (ถ้ามี)" style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#F97316'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ครั้งถัดไป (ถ้ามี)</label>
          <input type="date" value={form.nextDue} onChange={e => set('nextDue', e.target.value)} style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#F97316'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        </div>
        <button onClick={handleSave} disabled={saving || !form.date} style={{
          width: '100%', padding: '13px', borderRadius: 12, border: 'none',
          backgroundColor: saving || !form.date ? '#ccc' : '#F97316',
          color: '#fff', fontSize: 15, fontWeight: 800,
          cursor: saving || !form.date ? 'not-allowed' : 'pointer',
          fontFamily: 'Space Grotesk, sans-serif',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
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

function formatTs(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function HealthPassportPage() {
  const { catId } = useParams()
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const isPremium = userProfile?.isPremium === true
  const [cat, setCat] = useState(null)
  const [records, setRecords] = useState([])
  const [catDocs, setCatDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('records')
  const [modalOpen, setModalOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState('limit')
  const [uploadDocOpen, setUploadDocOpen] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const catSnap = await getDoc(doc(db, 'cats', catId))
        if (!catSnap.exists()) { navigate('/my-cats'); return }
        setCat({ id: catSnap.id, ...catSnap.data() })

        const recSnap = await getDocs(query(collection(db, 'cats', catId, 'healthRecords'), orderBy('date', 'desc')))
        setRecords(recSnap.docs.map(d => ({ id: d.id, ...d.data() })))

        const docsQ = query(collection(db, 'catDocuments'), where('catId', '==', catId), orderBy('uploadedAt', 'desc'))
        const docsSnap = await getDocs(docsQ)
        setCatDocs(docsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [catId])

  const loadDocs = async () => {
    try {
      const docsQ = query(collection(db, 'catDocuments'), where('catId', '==', catId), orderBy('uploadedAt', 'desc'))
      const snap = await getDocs(docsQ)
      setCatDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) { console.error(e) }
  }

  const handleAddClick = () => {
    if (!isPremium && records.length >= FREE_RECORD_LIMIT) {
      setUpgradeReason('limit'); setUpgradeOpen(true); return
    }
    setModalOpen(true)
  }

  const handleExportClick = () => {
    if (!isPremium) { setUpgradeReason('export'); setUpgradeOpen(true); return }
    alert('Export PDF — กำลังพัฒนา')
  }

  const handleSave = async (form) => {
    const newDoc = await addDoc(collection(db, 'cats', catId, 'healthRecords'), { ...form, createdAt: serverTimestamp() })
    setRecords(prev => [{ id: newDoc.id, ...form }, ...prev].sort((a, b) => b.date > a.date ? 1 : -1))
  }

  const handleDelete = async (recId) => {
    if (!confirm('ลบบันทึกนี้ใช่ไหม?')) return
    await deleteDoc(doc(db, 'cats', catId, 'healthRecords', recId))
    setRecords(prev => prev.filter(r => r.id !== recId))
  }

  const atLimit = !isPremium && records.length >= FREE_RECORD_LIMIT
  const verifiedCount = catDocs.filter(d => d.status === 'verified').length

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif' }}>
      <p style={{ color: '#aaa', fontSize: 15 }}>กำลังโหลด...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#f8f8f8', fontFamily: 'Space Grotesk, sans-serif', paddingBottom: 80 }}>
      <AnimatePresence>
        {modalOpen && <AddRecordModal onClose={() => setModalOpen(false)} onSave={handleSave} />}
        {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} reason={upgradeReason} />}
        {uploadDocOpen && <UploadDocModal catId={catId} cat={cat} user={user} userProfile={userProfile} onClose={() => setUploadDocOpen(false)} onUploaded={loadDocs} />}
      </AnimatePresence>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px' }}>
        <button onClick={() => navigate('/my-cats')} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#888', marginBottom: 20, padding: 0 }}>
          <ArrowLeft size={15} /> กลับ
        </button>

        {/* Cat header */}
        <div style={{ backgroundColor: '#fff', borderRadius: 18, padding: '18px 20px', marginBottom: 12, border: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, flexShrink: 0, backgroundColor: '#f5f5f5', backgroundImage: cat?.photoURL ? `url(${cat.photoURL})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {!cat?.photoURL && <ClipboardList size={24} color="#ddd" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: 19, fontWeight: 900, color: '#000' }}>Health Passport</h1>
                {verifiedCount > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 800, color: '#065f46', backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: 999 }}>
                    <ShieldCheck size={10} /> {verifiedCount} ยืนยัน
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>{cat?.name} · {cat?.breed}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', backgroundColor: '#fff', borderRadius: 14, padding: 5, marginBottom: 16, gap: 4, border: '1px solid #f0f0f0' }}>
          {[
            { id: 'records', label: 'บันทึกสุขภาพ', icon: ClipboardList },
            { id: 'documents', label: 'เอกสาร', icon: FileText },
          ].map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                flex: 1, padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                backgroundColor: active ? '#F97316' : 'transparent',
                color: active ? '#fff' : '#888',
                fontSize: 13, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.2s',
              }}>
                <Icon size={14} /> {tab.label}
                {tab.id === 'documents' && catDocs.filter(d => d.status === 'pending').length > 0 && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: active ? '#fff' : '#F97316', display: 'inline-block' }} />
                )}
              </button>
            )
          })}
        </div>

        {/* ===== TAB: Records ===== */}
        {activeTab === 'records' && (
          <>
            {/* Usage bar + export row */}
            <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: '12px 16px', marginBottom: 12, border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11, fontWeight: 700 }}>
                  <span style={{ color: '#999' }}>{isPremium ? 'Premium — ไม่จำกัด' : `${records.length} / ${FREE_RECORD_LIMIT} บันทึก (Free)`}</span>
                  {!isPremium && <span style={{ color: atLimit ? '#ef4444' : '#F97316' }}>{atLimit ? 'เต็มแล้ว' : `เหลือ ${FREE_RECORD_LIMIT - records.length}`}</span>}
                </div>
                {!isPremium && (
                  <div style={{ height: 5, backgroundColor: '#f3f4f6', borderRadius: 999, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((records.length / FREE_RECORD_LIMIT) * 100, 100)}%` }} transition={{ duration: 0.6 }}
                      style={{ height: '100%', borderRadius: 999, backgroundColor: atLimit ? '#ef4444' : '#F97316' }} />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={handleExportClick} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 9, border: '1.5px solid', borderColor: isPremium ? '#F97316' : '#e5e7eb', backgroundColor: isPremium ? '#FFF7ED' : '#fafafa', color: isPremium ? '#F97316' : '#bbb', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {isPremium ? <FileDown size={13} /> : <Lock size={12} />} Export PDF
                </button>
                <button onClick={handleAddClick} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: atLimit ? '#e5e7eb' : '#F97316', color: atLimit ? '#aaa' : '#fff', padding: '7px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', boxShadow: atLimit ? 'none' : '0 3px 10px rgba(249,115,22,0.3)' }}>
                  {atLimit ? <Lock size={13} /> : <Plus size={14} />} เพิ่ม
                </button>
              </div>
            </div>

            <AnimatePresence>
              {atLimit && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ backgroundColor: '#FFF7ED', borderRadius: 13, padding: '12px 16px', marginBottom: 12, border: '1.5px solid #FED7AA', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <Lock size={15} color="#F97316" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#9A3412' }}>ครบ {FREE_RECORD_LIMIT} บันทึกแล้ว — อัปเกรดเพื่อบันทึกเพิ่ม</span>
                  </div>
                  <button onClick={() => { setUpgradeReason('limit'); setUpgradeOpen(true) }} style={{ padding: '6px 13px', borderRadius: 8, backgroundColor: '#F97316', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 800, flexShrink: 0, fontFamily: 'Space Grotesk, sans-serif' }}>
                    ดู Premium
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Summary chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {RECORD_TYPES.filter(rt => records.some(r => r.type === rt.value)).map(({ value, label, icon: Icon, color, bg }) => {
                const latest = records.filter(r => r.type === value).sort((a, b) => b.date > a.date ? 1 : -1)[0]
                return (
                  <div key={value} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, backgroundColor: bg, color, fontSize: 12, fontWeight: 700, border: `1px solid ${color}22` }}>
                    <Icon size={12} /> {label}: {formatDate(latest?.date)}
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
                <button onClick={handleAddClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, backgroundColor: '#F97316', color: '#fff', padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
                  <Plus size={14} /> เพิ่มบันทึกแรก
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {records.map((rec, i) => {
                  const typeInfo = RECORD_TYPES.find(r => r.value === rec.type) || RECORD_TYPES[5]
                  const Icon = typeInfo.icon
                  return (
                    <motion.div key={rec.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      style={{ backgroundColor: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, backgroundColor: typeInfo.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={17} color={typeInfo.color} />
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: typeInfo.color }}>{typeInfo.label}</span>
                          <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>{formatDate(rec.date)}</span>
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
                      <button onClick={() => handleDelete(rec.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0, opacity: 0.4, transition: 'opacity 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.4}>
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ===== TAB: Documents ===== */}
        {activeTab === 'documents' && (
          <>
            <div style={{ backgroundColor: '#EFF6FF', borderRadius: 14, padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-start', border: '1px solid #BFDBFE' }}>
              <ShieldCheck size={18} color="#3b82f6" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#1e3a8a', margin: '0 0 3px' }}>เอกสารได้รับการตรวจสอบโดยทีมงาน</p>
                <p style={{ fontSize: 12, color: '#3b82f6', fontWeight: 500, margin: 0, lineHeight: 1.5 }}>
                  อัปโหลดใบ Pedigree หรือใบรับรองสุขภาพ — แมวของคุณจะได้รับ badge "Verified" หลังผ่านการตรวจสอบ
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <button onClick={() => setUploadDocOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, backgroundColor: '#F97316', color: '#fff', padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 3px 10px rgba(249,115,22,0.3)' }}>
                <Upload size={14} /> อัปโหลดเอกสาร
              </button>
            </div>

            {catDocs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: '#fff', borderRadius: 18, border: '2px dashed #e5e7eb' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <FileText size={28} color="#3b82f6" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#000', marginBottom: 6 }}>ยังไม่มีเอกสาร</h3>
                <p style={{ fontSize: 13, color: '#888', fontWeight: 500, marginBottom: 18 }}>อัปโหลดใบ Pedigree หรือใบรับรองสุขภาพเพื่อสร้างความน่าเชื่อถือ</p>
                <button onClick={() => setUploadDocOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, backgroundColor: '#F97316', color: '#fff', padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
                  <Upload size={14} /> อัปโหลดเอกสารแรก
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {catDocs.map((d, i) => (
                  <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    style={{ backgroundColor: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {DOC_TYPES.find(dt => dt.value === d.type)?.icon || '📄'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#000' }}>{d.typeLabel}</span>
                          <DocStatusBadge status={d.status} />
                        </div>
                        {d.filename && <p style={{ fontSize: 12, color: '#888', fontWeight: 500, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.filename}</p>}
                        {d.note && <p style={{ fontSize: 12, color: '#666', fontWeight: 500, margin: '0 0 3px' }}>{d.note}</p>}
                        {d.status === 'rejected' && d.reviewNote && (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginTop: 5, backgroundColor: '#FEF2F2', borderRadius: 8, padding: '7px 10px' }}>
                            <AlertCircle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                            <p style={{ fontSize: 12, color: '#991b1b', fontWeight: 600, margin: 0 }}>{d.reviewNote}</p>
                          </div>
                        )}
                        <p style={{ fontSize: 11, color: '#bbb', fontWeight: 500, margin: '5px 0 0' }}>
                          อัปโหลด {formatTs(d.uploadedAt)}
                          {d.reviewedAt && ` · ตรวจสอบ ${formatTs(d.reviewedAt)}`}
                        </p>
                      </div>
                      <a href={d.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, border: '1.5px solid #e5e7eb', backgroundColor: '#fafafa', color: '#555', fontSize: 12, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
                        <Eye size={12} /> ดู
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
