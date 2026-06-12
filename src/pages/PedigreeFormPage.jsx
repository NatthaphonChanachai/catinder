import { useState, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import {
  ArrowLeft, Save, CheckCircle2, AlertCircle, Upload, X,
  FileText, PawPrint, Calendar, Hash, User, Phone, Building2,
} from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { prepareImage, blobToBase64, ACCEPT_IMAGE_TYPES } from '../utils/imageUtils'

const REGISTRIES = ['CFA', 'TICA', 'SCFC', 'WCF', 'อื่นๆ']

const inputStyle = {
  width: '100%',
  padding: '11px 13px',
  borderRadius: 11,
  border: '1.5px solid #e5e7eb',
  fontSize: 14,
  fontFamily: 'Space Grotesk, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
  backgroundColor: '#fff',
}

const Section = ({ title, accent, children }) => (
  <div
    style={{
      backgroundColor: '#fff',
      borderRadius: 18,
      padding: 20,
      marginBottom: 16,
      border: `1.5px solid ${accent || '#f0f0f0'}`,
    }}
  >
    <h3
      style={{
        fontSize: 13,
        fontWeight: 800,
        color: accent ? accent : '#aaa',
        marginBottom: 18,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      {title}
    </h3>
    {children}
  </div>
)

const Field = ({ label, hint, required, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label
      style={{
        display: 'block',
        fontSize: 13,
        fontWeight: 700,
        color: '#333',
        marginBottom: 5,
      }}
    >
      {label}
      {required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {hint && (
      <p style={{ fontSize: 11, color: '#bbb', marginTop: 4, fontWeight: 500 }}>{hint}</p>
    )}
  </div>
)

function CatPartySection({ title, prefix, form, set, accent }) {
  const fileRef = useRef()
  const [uploading, setUploading] = useState(false)

  const handleFile = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    try {
      const blob = await prepareImage(file, 800)
      const b64 = await blobToBase64(blob)
      set(prefix + 'RegImg', b64)
    } catch {
      alert('โหลดรูปไม่ได้ กรุณาลองไฟล์อื่น')
    }
    setUploading(false)
  }

  const fv = k => form[prefix + k] ?? ''
  const fset = (k, v) => set(prefix + k, v)

  return (
    <Section title={title} accent={accent}>
      <Field label="ชื่อแมว" required>
        <input
          type="text"
          value={fv('CatName')}
          onChange={e => fset('CatName', e.target.value)}
          placeholder="ชื่อแมว"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = accent)}
          onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="ชมรม/สมาคม" required>
          <select
            value={fv('Registry')}
            onChange={e => fset('Registry', e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
            onFocus={e => (e.target.style.borderColor = accent)}
            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
          >
            <option value="">-- เลือก --</option>
            {REGISTRIES.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>

        <Field label="หมายเลขทะเบียน" required>
          <input
            type="text"
            value={fv('RegNumber')}
            onChange={e => fset('RegNumber', e.target.value)}
            placeholder="เช่น TH-2024-00123"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = accent)}
            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
          />
        </Field>
      </div>

      <Field label="ชื่อ Cattery / ฟาร์ม">
        <input
          type="text"
          value={fv('Cattery')}
          onChange={e => fset('Cattery', e.target.value)}
          placeholder="ชื่อฟาร์มหรือ cattery"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = accent)}
          onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="ชื่อเจ้าของ" required>
          <input
            type="text"
            value={fv('OwnerName')}
            onChange={e => fset('OwnerName', e.target.value)}
            placeholder="ชื่อ-นามสกุล"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = accent)}
            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
          />
        </Field>

        <Field label="เบอร์โทรศัพท์">
          <input
            type="tel"
            value={fv('OwnerPhone')}
            onChange={e => fset('OwnerPhone', e.target.value)}
            placeholder="08x-xxx-xxxx"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = accent)}
            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
          />
        </Field>
      </div>

      {prefix === 'dam' && (
        <Field label="หมายเลขจดทะเบียนฟาร์ม (Dam's Owner)" hint="ใช้สำหรับยื่นกับสมาคม">
          <input
            type="text"
            value={fv('FarmRegNumber')}
            onChange={e => fset('FarmRegNumber', e.target.value)}
            placeholder="หมายเลขจดทะเบียนฟาร์ม"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = accent)}
            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
          />
        </Field>
      )}

      {/* Reg cert upload */}
      <Field label="รูปใบทะเบียน" hint="ถ่ายรูปใบทะเบียนแมวเพื่อแนบประกอบ">
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT_IMAGE_TYPES}
          onChange={handleFile}
          style={{ display: 'none' }}
        />
        {fv('RegImg') ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={fv('RegImg')}
              alt="ใบทะเบียน"
              style={{
                height: 100,
                borderRadius: 10,
                objectFit: 'cover',
                border: '1.5px solid #e5e7eb',
              }}
            />
            <button
              type="button"
              onClick={() => fset('RegImg', '')}
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                width: 22,
                height: 22,
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                border: '2px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={10} color="#fff" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 16px',
              borderRadius: 10,
              border: `1.5px dashed ${uploading ? '#ddd' : '#e5e7eb'}`,
              backgroundColor: '#fafafa',
              color: '#888',
              fontSize: 13,
              fontWeight: 700,
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            <Upload size={13} />
            {uploading ? 'กำลังโหลด...' : 'อัปโหลดใบทะเบียน'}
          </button>
        )}
      </Field>
    </Section>
  )
}

function RegistryWarning({ sireReg, damReg }) {
  if (!sireReg || !damReg) return null
  const same = sireReg === damReg
  return (
    <div
      style={{
        borderRadius: 12,
        padding: '12px 16px',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        marginBottom: 16,
        backgroundColor: same ? 'rgba(16,185,129,0.06)' : 'rgba(249,115,22,0.06)',
        border: `1.5px solid ${same ? '#a7f3d0' : '#fed7aa'}`,
      }}
    >
      {same ? (
        <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />
      ) : (
        <AlertCircle size={16} color="#F97316" style={{ flexShrink: 0, marginTop: 1 }} />
      )}
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: same ? '#065f46' : '#92400e',
            marginBottom: 2,
          }}
        >
          {same
            ? `✅ ทั้งคู่อยู่ใน ${sireReg} เหมือนกัน — สามารถออกใบ Pedigree ได้`
            : `⚠️ พ่ออยู่ใน ${sireReg}, แม่อยู่ใน ${damReg}`}
        </div>
        {!same && (
          <div style={{ fontSize: 12, color: '#78350f', fontWeight: 500, lineHeight: 1.5 }}>
            ลูกแมวอาจออกใบเพ็ดดีกรีไม่ได้ เนื่องจากพ่อแม่อยู่ต่างชมรม —
            แนะนำให้ปรึกษาสมาคมก่อนดำเนินการ
          </div>
        )}
      </div>
    </div>
  )
}

function SuccessView({ form, docId }) {
  const navigate = useNavigate()
  const items = [
    { label: 'พ่อแมว', value: form.sireCatName, sub: `${form.sireRegistry} · ${form.sireRegNumber}`, done: !!form.sireRegNumber },
    { label: 'แม่แมว', value: form.damCatName, sub: `${form.damRegistry} · ${form.damRegNumber}`, done: !!form.damRegNumber },
    { label: 'เจ้าของพ่อ', value: form.sireOwnerName, sub: form.sireOwnerPhone, done: !!form.sireOwnerName },
    { label: 'เจ้าของแม่', value: form.damOwnerName, sub: form.damOwnerPhone, done: !!form.damOwnerName },
    { label: 'วันคลอดลูก', value: form.litterBirthDate, done: !!form.litterBirthDate },
    { label: 'จำนวนลูก', value: form.litterCount ? `${form.litterCount} ตัว` : '', done: !!form.litterCount },
    { label: 'สีขน / เพศ', value: form.litterDesc, done: !!form.litterDesc },
    { label: 'ลายเซ็นเจ้าของ', value: form.signatureImg ? 'มีไฟล์แนบ' : 'ไม่มี', done: !!form.signatureImg },
    { label: 'หมายเลขจดทะเบียนฟาร์ม (Dam)', value: form.damFarmRegNumber, done: !!form.damFarmRegNumber },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px 80px' }}
    >
      <div
        style={{
          backgroundColor: 'rgba(16,185,129,0.08)',
          border: '1.5px solid #a7f3d0',
          borderRadius: 18,
          padding: '24px',
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}
        >
          <CheckCircle2 size={28} color="#10b981" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#000', marginBottom: 6 }}>
          บันทึกข้อมูลสำเร็จ
        </h2>
        <p style={{ fontSize: 13, color: '#555', fontWeight: 500, lineHeight: 1.6, marginBottom: 0 }}>
          ตรวจสอบรายการด้านล่างก่อนส่งเอกสารไปยังสมาคม
        </p>
        {docId && (
          <p style={{ fontSize: 11, color: '#aaa', fontWeight: 600, marginTop: 6 }}>
            รหัสอ้างอิง: {docId}
          </p>
        )}
      </div>

      {/* Checklist */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 18,
          border: '1px solid #f0f0f0',
          overflow: 'hidden',
          marginBottom: 16,
        }}
      >
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f5f5f5' }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#000', margin: 0 }}>
            Checklist เอกสาร Pedigree
          </h3>
        </div>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '13px 18px',
              borderBottom: i < items.length - 1 ? '1px solid #f5f5f5' : 'none',
              backgroundColor: item.done ? '#fff' : '#fffbf7',
            }}
          >
            <div style={{ flexShrink: 0 }}>
              {item.done ? (
                <CheckCircle2 size={16} color="#10b981" />
              ) : (
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: '2px solid #d1d5db',
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: item.done ? '#000' : '#bbb' }}>
                {item.label}
              </div>
              {item.value && (
                <div style={{ fontSize: 12, color: '#888', fontWeight: 500, marginTop: 1 }}>
                  {item.value}
                  {item.sub && ` · ${item.sub}`}
                </div>
              )}
            </div>
            {!item.done && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#F97316',
                  backgroundColor: '#fff7ed',
                  padding: '2px 7px',
                  borderRadius: 99,
                }}
              >
                ยังไม่ระบุ
              </span>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          border: '1.5px solid #fed7aa',
          borderRadius: 14,
          padding: '14px 18px',
          marginBottom: 24,
        }}
      >
        <p style={{ fontSize: 13, color: '#444', fontWeight: 500, lineHeight: 1.7, margin: 0 }}>
          📋 <strong>ขั้นตอนต่อไป:</strong> นำรายการนี้ไปยื่นที่สมาคม{' '}
          {form.damRegistry || form.sireRegistry || 'ที่ลงทะเบียน'} พร้อมเอกสารต้นฉบับ
          เพื่อออกใบ Pedigree ให้กับลูกแมว
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: 11,
            border: '1.5px solid #e5e7eb',
            backgroundColor: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            color: '#555',
            fontFamily: 'Space Grotesk, sans-serif',
          }}
        >
          กรอกใหม่
        </button>
        <Link
          to="/discover"
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: 11,
            backgroundColor: '#F97316',
            color: '#fff',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            boxShadow: '0 4px 14px rgba(249,115,22,0.3)',
          }}
        >
          <PawPrint size={14} /> กลับหน้า Discover
        </Link>
      </div>
    </motion.div>
  )
}

export default function PedigreeFormPage() {
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [savedDocId, setSavedDocId] = useState(null)
  const sigRef = useRef()
  const [sigUploading, setSigUploading] = useState(false)

  const initialForm = {
    sireCatName: '',
    sireRegistry: '',
    sireRegNumber: '',
    sireCattery: '',
    sireOwnerName: '',
    sireOwnerPhone: '',
    sireRegImg: '',
    damCatName: '',
    damRegistry: '',
    damRegNumber: '',
    damCattery: '',
    damOwnerName: '',
    damOwnerPhone: '',
    damFarmRegNumber: '',
    damRegImg: '',
    litterBirthDate: '',
    litterCount: '',
    litterDesc: '',
    signatureImg: '',
    notes: '',
  }

  const [form, setForm] = useState(initialForm)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSigFile = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setSigUploading(true)
    try {
      const blob = await prepareImage(file, 800)
      const b64 = await blobToBase64(blob)
      set('signatureImg', b64)
    } catch {
      alert('โหลดรูปไม่ได้')
    }
    setSigUploading(false)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.sireCatName || !form.damCatName || !form.sireRegistry || !form.damRegistry) {
      alert('กรุณากรอกชื่อแมวและชมรมทั้งสองฝ่าย')
      return
    }
    setSaving(true)
    try {
      const ref = await addDoc(collection(db, 'pedigreeRequests'), {
        ...form,
        ownerUid: user.uid,
        ownerEmail: user.email,
        ownerName: userProfile?.displayName || user.email.split('@')[0],
        createdAt: serverTimestamp(),
        status: 'draft',
      })
      setSavedDocId(ref.id)
      setDone(true)
    } catch (err) {
      console.error(err)
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
    setSaving(false)
  }

  if (done) return <SuccessView form={form} docId={savedDocId} />

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#f8f8f8',
        fontFamily: 'Space Grotesk, sans-serif',
        paddingBottom: 80,
      }}
    >
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '20px 16px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 700,
            color: '#888',
            marginBottom: 20,
            padding: 0,
            fontFamily: 'Space Grotesk, sans-serif',
          }}
        >
          <ArrowLeft size={15} /> กลับ
        </button>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                backgroundColor: '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={18} color="#F97316" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#000', margin: 0 }}>
              เตรียมเอกสาร Pedigree
            </h1>
          </div>
          <p style={{ fontSize: 13, color: '#aaa', fontWeight: 500, marginBottom: 0 }}>
            กรอกข้อมูลพ่อแม่แมวและลูกแมวเพื่อเตรียมยื่นกับสมาคม
          </p>
        </div>

        <RegistryWarning sireReg={form.sireRegistry} damReg={form.damRegistry} />

        <form onSubmit={handleSubmit}>
          <CatPartySection
            title="🐾 สายพ่อ (Sire)"
            prefix="sire"
            form={form}
            set={set}
            accent="#1d4ed8"
          />

          <CatPartySection
            title="🐾 สายแม่ (Dam)"
            prefix="dam"
            form={form}
            set={set}
            accent="#be123c"
          />

          {/* Litter info */}
          <Section title="ข้อมูลลูกแมว (Litter)">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="วันที่คลอด" required>
                <input
                  type="date"
                  value={form.litterBirthDate}
                  onChange={e => set('litterBirthDate', e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#F97316')}
                  onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                />
              </Field>
              <Field label="จำนวนลูก (ตัว)" required>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={form.litterCount}
                  onChange={e => set('litterCount', e.target.value)}
                  placeholder="เช่น 4"
                  style={{ ...inputStyle, textAlign: 'center' }}
                  onFocus={e => (e.target.style.borderColor = '#F97316')}
                  onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                />
              </Field>
            </div>

            <Field
              label="รายละเอียดลูกแมว"
              hint="เช่น สีขน, เพศ (ตัวผู้ 2 ตัว สีส้ม, ตัวเมีย 2 ตัว สีขาว)"
              required
            >
              <textarea
                value={form.litterDesc}
                onChange={e => set('litterDesc', e.target.value)}
                placeholder="ระบุสีขนและเพศของลูกแมวแต่ละตัว"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={e => (e.target.style.borderColor = '#F97316')}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
              />
            </Field>
          </Section>

          {/* Signature */}
          <Section title="ลายเซ็นเจ้าของ / หนังสือยินยอม">
            <input
              ref={sigRef}
              type="file"
              accept={ACCEPT_IMAGE_TYPES}
              onChange={handleSigFile}
              style={{ display: 'none' }}
            />
            <p
              style={{
                fontSize: 13,
                color: '#666',
                fontWeight: 500,
                lineHeight: 1.6,
                marginBottom: 14,
              }}
            >
              อัปโหลดลายเซ็นเจ้าของหรือเอกสารยินยอมการผสมพันธุ์ (ถ้ามี)
            </p>
            {form.signatureImg ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={form.signatureImg}
                  alt="ลายเซ็น"
                  style={{
                    height: 120,
                    borderRadius: 10,
                    objectFit: 'contain',
                    border: '1.5px solid #e5e7eb',
                    backgroundColor: '#fff',
                    padding: 8,
                  }}
                />
                <button
                  type="button"
                  onClick={() => set('signatureImg', '')}
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    border: '2px solid #fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={10} color="#fff" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={sigUploading}
                onClick={() => sigRef.current.click()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '10px 18px',
                  borderRadius: 11,
                  border: '1.5px dashed #e5e7eb',
                  backgroundColor: '#fafafa',
                  color: '#888',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: sigUploading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                <Upload size={14} />
                {sigUploading ? 'กำลังโหลด...' : 'อัปโหลดลายเซ็น / เอกสารยินยอม'}
              </button>
            )}
          </Section>

          {/* Notes */}
          <Section title="หมายเหตุเพิ่มเติม">
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="หมายเหตุอื่นๆ สำหรับการยื่นเอกสาร..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              onFocus={e => (e.target.style.borderColor = '#F97316')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
          </Section>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 13,
              border: 'none',
              backgroundColor: saving ? '#ccc' : '#F97316',
              color: '#fff',
              fontSize: 15,
              fontWeight: 800,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'Space Grotesk, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: saving ? 'none' : '0 4px 14px rgba(249,115,22,0.3)',
            }}
          >
            <Save size={15} />
            {saving ? 'กำลังบันทึก...' : 'บันทึกและสร้าง Checklist'}
          </button>
        </form>
      </div>
    </div>
  )
}
