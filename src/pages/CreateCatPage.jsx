import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, addDoc, updateDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore'
import { ArrowLeft, Save, Syringe, Scissors, Heart, Home, Users, Sparkles, Camera, Upload, X, PawPrint, Award, BookOpen, HeartHandshake, Tag, ArrowLeftRight, HelpCircle, Stethoscope, Droplets, ShieldCheck, Microscope, Cpu, FileText, Pill } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { prepareImage, blobToBase64, ACCEPT_IMAGE_TYPES } from '../utils/imageUtils'

const REGISTRY_OPTIONS = [
  { value: '', label: '-- ยังไม่ได้จดทะเบียน --' },
  { value: 'CFA', label: 'CFA (Cat Fanciers\' Association)' },
  { value: 'TICA', label: 'TICA (The International Cat Association)' },
  { value: 'SCFC', label: 'SCFC (Siam Cat Fanciers\' Club)' },
  { value: 'WCF', label: 'WCF (World Cat Federation)' },
  { value: 'other', label: 'อื่นๆ' },
]

const BREEDS =[
  'เปอร์เซีย', 'สกอตติชโฟลด์', 'บริติชชอร์ตแฮร์', 'เมนคูน', 'แรกดอลล์',
  'สยาม', 'อเมริกันชอร์ตแฮร์', 'รัสเซียนบลู', 'อเบสซิเนียน', 'เบงกอล',
  'บาลีนีส', 'บอมเบย์', 'เบอร์มีส', 'สปิงค์ซ์', 'เดวอนเร็กซ์',
  'ออเซียต', 'ไทย (วิเชียรมาศ)', 'โคราท', 'ขาวมณี', 'สีสวาด',
  'ศุภลักษณ์', 'อื่นๆ (Mixed)',
]

const LOOKING_FOR = [
  { value: 'mate', label: 'หาคู่ผสมพันธุ์', icon: Heart },
  { value: 'friend', label: 'หาเพื่อนเล่น', icon: Users },
  { value: 'adopt', label: 'หาบ้าน (ยกให้)', icon: Home },
  { value: 'foster', label: 'รับเลี้ยงชั่วคราว (Foster)', icon: HeartHandshake },
  { value: 'sell', label: 'ขาย', icon: Tag },
  { value: 'exchange', label: 'แลกเปลี่ยน', icon: ArrowLeftRight },
  { value: 'any', label: 'ทุกอย่าง', icon: Sparkles },
  { value: 'other', label: 'อื่นๆ', icon: HelpCircle },
]

const HEALTH_ITEMS = [
  { field: 'vaccinated', label: 'ฉีดวัคซีนครบแล้ว', desc: 'วัคซีนป้องกันโรคแมวครบตามอายุ', icon: Syringe, color: '#10b981' },
  { field: 'sterilized', label: 'ทำหมันแล้ว', desc: 'ผ่าตัดทำหมันเรียบร้อยแล้ว', icon: Scissors, color: '#8b5cf6' },
  { field: 'annualCheckup', label: 'ตรวจสุขภาพประจำปีแล้ว', desc: 'พบสัตวแพทย์ครบตามกำหนด', icon: Stethoscope, color: '#3b82f6' },
  { field: 'bloodTest', label: 'ตรวจเลือดแล้ว (Blood test)', desc: 'ผ่านการตรวจค่าเลือดล่าสุดแล้ว', icon: Droplets, color: '#ef4444' },
  { field: 'noGeneticDisease', label: 'ไม่มีโรคทางพันธุกรรม', desc: 'ไม่พบโรคที่ถ่ายทอดทางพันธุกรรม', icon: ShieldCheck, color: '#06b6d4' },
  { field: 'fivFelvTested', label: 'ผ่านการตรวจ FIV/FeLV แล้ว', desc: 'ตรวจโรคภูมิคุ้มกันและมะเร็งเม็ดเลือดขาว', icon: Microscope, color: '#f59e0b' },
  { field: 'microchipped', label: 'มีไมโครชิป', desc: 'ฝังชิประบุตัวตน (ISO 11784)', icon: Cpu, color: '#6366f1' },
  { field: 'hasVaccinationBook', label: 'มีสมุดวัคซีน / เอกสารสุขภาพ', desc: 'มีเอกสารรับรองสุขภาพอย่างเป็นทางการ', icon: FileText, color: '#84cc16' },
  { field: 'underTreatment', label: 'กำลังรักษาอยู่', desc: 'อยู่ในระหว่างการรักษา (โปรดระบุ)', icon: Pill, color: '#f97316', noteField: 'treatmentNote' },
  { field: 'healthOther', label: 'อื่นๆ', desc: 'ข้อมูลสุขภาพเพิ่มเติม', icon: HelpCircle, color: '#6b7280', noteField: 'healthOtherNote' },
]

const inputStyle = {
  width: '100%', padding: '11px 13px', borderRadius: 11,
  border: '1.5px solid #e5e7eb', fontSize: 14,
  fontFamily: 'Space Grotesk, sans-serif',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s', backgroundColor: '#fff',
}

const Section = ({ title, children }) => (
  <div style={{ backgroundColor: '#fff', borderRadius: 18, padding: 20, marginBottom: 16, border: '1px solid #f0f0f0' }}>
    <h3 style={{ fontSize: 13, fontWeight: 800, color: '#aaa', marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
    {children}
  </div>
)

const Field = ({ label, required, hint, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 6 }}>
      {label}{required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {hint && <p style={{ fontSize: 11, color: '#bbb', marginTop: 4, fontWeight: 500 }}>{hint}</p>}
  </div>
)


export default function CreateCatPage() {
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const { catId } = useParams()
  const isEdit = Boolean(catId)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null) // 'compressing' | 'uploading' | null
  const [form, setForm] = useState({
    name: '', breed: '', breedCustom: '', gender: 'male',
    ageYears: 0, ageMonths: 0, weight: '',
    description: '', photoURL: '',
    vaccinated: false, sterilized: false,
    annualCheckup: false, bloodTest: false, noGeneticDisease: false,
    fivFelvTested: false, microchipped: false, hasVaccinationBook: false,
    underTreatment: false, treatmentNote: '',
    healthOther: false, healthOtherNote: '',
    lookingFor: [], lookingForOther: '', location: '', color: '',
    registry: '', registryNumber: '', catteryName: '', certPhotoURL: '',
  })
  const fileInputRef = useRef()
  const certInputRef = useRef()
  const [certUploading, setCertUploading] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    getDoc(doc(db, 'cats', catId)).then(snap => {
      if (!snap.exists()) return
      const data = snap.data()
      if (typeof data.lookingFor === 'string') {
        data.lookingFor = data.lookingFor ? [data.lookingFor] : []
      }
      setForm(prev => ({ ...prev, ...data }))
    })
  }, [catId])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    // Basic size guard (50 MB)
    if (file.size > 50 * 1024 * 1024) {
      setUploadProgress(null)
      setUploading(false)
      alert('ไฟล์ใหญ่เกินไป (สูงสุด 50 MB)')
      return
    }

    setUploading(true)
    setUploadProgress('compressing')
    try {
      // Compress to max 700px then store as base64 in Firestore (no Storage needed)
      const blob = await prepareImage(file, 700)
      setUploadProgress('encoding')
      const base64 = await blobToBase64(blob)
      set('photoURL', base64)
    } catch (err) {
      console.error('image error:', err)
      alert('ไม่สามารถโหลดรูปได้ กรุณาลองไฟล์อื่น')
    }
    setUploading(false)
    setUploadProgress(null)
  }

  const handleCertFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (file.size > 50 * 1024 * 1024) { alert('ไฟล์ใหญ่เกินไป (สูงสุด 50 MB)'); return }
    setCertUploading(true)
    try {
      const blob = await prepareImage(file, 900)
      const base64 = await blobToBase64(blob)
      set('certPhotoURL', base64)
    } catch { alert('ไม่สามารถโหลดรูปได้ กรุณาลองไฟล์อื่น') }
    setCertUploading(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.breed) return
    setSaving(true)
    try {
      const breed = form.breed === 'อื่นๆ (Mixed)' && form.breedCustom ? form.breedCustom : form.breed
      const data = {
        ...form, breed,
        ownerId: user.uid,
        ownerName: userProfile?.displayName || user.email.split('@')[0],
        ownerPhotoURL: userProfile?.photoURL || '',
        ageYears: Number(form.ageYears) || 0,
        ageMonths: Number(form.ageMonths) || 0,
        weight: form.weight ? Number(form.weight) : null,
      }
      if (isEdit) {
        await updateDoc(doc(db, 'cats', catId), data)
      } else {
        data.createdAt = serverTimestamp()
        await addDoc(collection(db, 'cats'), data)
      }
      navigate('/my-cats')
    } catch (err) {
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
      console.error(err)
    }
    setSaving(false)
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#f8f8f8', fontFamily: 'Space Grotesk, sans-serif', paddingBottom: 80 }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px' }}>
        <button onClick={() => navigate('/my-cats')} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 700, color: '#888', marginBottom: 20, padding: 0,
        }}>
          <ArrowLeft size={15} /> กลับ
        </button>

        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#000', marginBottom: 4 }}>
          {isEdit ? 'แก้ไขโปรไฟล์แมว' : 'เพิ่มโปรไฟล์แมว'}
        </h1>
        <p style={{ fontSize: 13, color: '#aaa', fontWeight: 500, marginBottom: 24 }}>
          กรอกข้อมูลน้องแมวเพื่อให้ผู้อื่นค้นพบ
        </p>

        <form onSubmit={handleSave}>
          {/* Photo upload */}
          <Section title="รูปโปรไฟล์">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              {/* Preview */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{
                  width: 130, height: 130, borderRadius: 20,
                  backgroundColor: '#f5f5f5',
                  backgroundImage: form.photoURL ? `url(${form.photoURL})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  border: '2.5px dashed #e5e7eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  {uploading ? (
                    <div style={{ textAlign: 'center', padding: 12 }}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        style={{ width: 28, height: 28, border: '3px solid #F97316', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 8px' }}
                      />
                      <p style={{ fontSize: 11, color: '#F97316', fontWeight: 700 }}>
                        {uploadProgress === 'compressing' ? 'ปรับขนาด...' : 'กำลังโหลด...'}
                      </p>
                    </div>
                  ) : !form.photoURL ? (
                    <div style={{ textAlign: 'center', padding: 16 }}>
                      <PawPrint size={32} color="#ddd" />
                      <p style={{ fontSize: 11, color: '#ccc', fontWeight: 600, marginTop: 6 }}>ยังไม่มีรูป</p>
                    </div>
                  ) : null}
                </div>

                {form.photoURL && !uploading && (
                  <button
                    type="button"
                    onClick={() => set('photoURL', '')}
                    style={{
                      position: 'absolute', top: -8, right: -8,
                      width: 24, height: 24, borderRadius: '50%',
                      backgroundColor: '#ef4444', border: '2px solid #fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={11} color="#fff" />
                  </button>
                )}
              </div>

              {/* Upload buttons */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => {
                    fileInputRef.current.removeAttribute('capture')
                    fileInputRef.current.click()
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '10px 18px', borderRadius: 11,
                    border: '1.5px solid #F97316', backgroundColor: '#FFF7ED',
                    color: '#F97316', fontSize: 13, fontWeight: 800,
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontFamily: 'Space Grotesk, sans-serif',
                    opacity: uploading ? 0.6 : 1,
                  }}
                >
                  <Upload size={14} /> เลือกจากแกลลอรี่ / ไฟล์
                </button>

                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => {
                    fileInputRef.current.setAttribute('capture', 'environment')
                    fileInputRef.current.click()
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '10px 18px', borderRadius: 11,
                    border: '1.5px solid #e5e7eb', backgroundColor: '#fff',
                    color: '#555', fontSize: 13, fontWeight: 800,
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontFamily: 'Space Grotesk, sans-serif',
                    opacity: uploading ? 0.6 : 1,
                  }}
                >
                  <Camera size={14} /> ถ่ายรูปเดี๋ยวนี้
                </button>
              </div>

              <p style={{ fontSize: 11, color: '#bbb', fontWeight: 500, textAlign: 'center' }}>
                รองรับ JPG, PNG, HEIC · ปรับขนาดอัตโนมัติ
              </p>

              {/* Hidden file input — accept all common image types incl. HEIC */}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_IMAGE_TYPES}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          </Section>

          {/* Basic info */}
          <Section title="ข้อมูลพื้นฐาน">
            <Field label="ชื่อแมว" required>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="เช่น มูจิ, ลูน่า, เลโอ" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#F97316'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </Field>

            <Field label="สายพันธุ์" required>
              <select value={form.breed} onChange={e => set('breed', e.target.value)} required
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={e => e.target.style.borderColor = '#F97316'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">-- เลือกสายพันธุ์ --</option>
                {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>

            {form.breed === 'อื่นๆ (Mixed)' && (
              <Field label="ระบุสายพันธุ์">
                <input type="text" value={form.breedCustom} onChange={e => set('breedCustom', e.target.value)}
                  placeholder="เช่น Siamese x Persian" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#F97316'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </Field>
            )}

            {/* Gender */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 7 }}>
                เพศ <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ v: 'male', l: 'ตัวผู้' }, { v: 'female', l: 'ตัวเมีย' }].map(({ v, l }) => (
                  <button key={v} type="button" onClick={() => set('gender', v)} style={{
                    flex: 1, padding: 11, borderRadius: 11,
                    border: form.gender === v ? '2px solid #F97316' : '1.5px solid #e5e7eb',
                    backgroundColor: form.gender === v ? 'rgba(249,115,22,0.06)' : '#fff',
                    color: form.gender === v ? '#F97316' : '#555',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.15s',
                  }}>{l}</button>
                ))}
              </div>
            </div>

            {/* Age + Weight */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 7 }}>อายุ / น้ำหนัก</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { key: 'ageYears', label: 'ปี', max: 30 },
                  { key: 'ageMonths', label: 'เดือน', max: 11 },
                  { key: 'weight', label: 'กก.', max: 20, step: 0.1 },
                ].map(({ key, label, max, step }) => (
                  <div key={key}>
                    <input type="number" min="0" max={max} step={step || 1}
                      value={form[key]} onChange={e => set(key, e.target.value)}
                      style={{ ...inputStyle, textAlign: 'center' }}
                      onFocus={e => e.target.style.borderColor = '#F97316'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                    <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 3, fontWeight: 600 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <Field label="สีขน">
              <input type="text" value={form.color} onChange={e => set('color', e.target.value)}
                placeholder="เช่น ขาว, ส้ม, สีสาม" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#F97316'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </Field>
          </Section>

          {/* About */}
          <Section title="รายละเอียด">
            <Field label="คำอธิบาย">
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="เล่าเรื่องน้องแมว บุคลิก นิสัย สิ่งที่ชอบ..." rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = '#F97316'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </Field>

            <Field label="ที่อยู่ / ย่าน">
              <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                placeholder="เช่น กรุงเทพฯ, เชียงใหม่, บางกอกน้อย" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#F97316'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </Field>

            <div style={{ marginBottom: 0 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 8 }}>กำลังมองหา</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {LOOKING_FOR.map(({ value, label, icon: Icon }) => {
                  const active = Array.isArray(form.lookingFor) && form.lookingFor.includes(value)
                  return (
                    <button key={value} type="button" onClick={() => {
                      const cur = Array.isArray(form.lookingFor) ? form.lookingFor : []
                      set('lookingFor', active ? cur.filter(v => v !== value) : [...cur, value])
                    }} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 12px', borderRadius: 11,
                      border: active ? '2px solid #F97316' : '1.5px solid #e5e7eb',
                      backgroundColor: active ? 'rgba(249,115,22,0.06)' : '#fff',
                      color: active ? '#F97316' : '#555',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'Space Grotesk, sans-serif',
                      textAlign: 'left', transition: 'all 0.15s',
                    }}>
                      <Icon size={14} /> {label}
                    </button>
                  )
                })}
              </div>
              {Array.isArray(form.lookingFor) && form.lookingFor.includes('other') && (
                <input
                  type="text"
                  value={form.lookingForOther}
                  onChange={e => set('lookingForOther', e.target.value)}
                  placeholder="ระบุสิ่งที่กำลังมองหา..."
                  style={{ ...inputStyle, marginTop: 8 }}
                  onFocus={e => e.target.style.borderColor = '#F97316'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              )}
            </div>
          </Section>

          {/* Health */}
          <Section title="สุขภาพ">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
              {HEALTH_ITEMS.map(({ field, label, desc, icon: Icon, color }) => (
                <label key={field} onClick={() => set(field, !form[field])} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
                  padding: '10px 12px', borderRadius: 12,
                  border: form[field] ? `1.5px solid ${color}30` : '1.5px solid #f0f0f0',
                  backgroundColor: form[field] ? `${color}08` : '#fafafa',
                  transition: 'all 0.15s',
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                    border: form[field] ? `2px solid ${color}` : '2px solid #e5e7eb',
                    backgroundColor: form[field] ? color : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {form[field] && <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>✓</span>}
                  </div>
                  <Icon size={15} color={form[field] ? color : '#ccc'} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: form[field] ? '#111' : '#444', lineHeight: 1.3 }}>{label}</div>
                    <div style={{ fontSize: 11, color: '#aaa', fontWeight: 500, marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
                  </div>
                </label>
              ))}
            </div>
            {HEALTH_ITEMS.filter(item => item.noteField && form[item.field]).map(({ field, noteField, label, color }) => (
              <div key={noteField} style={{ marginTop: 10 }}>
                <input
                  type="text"
                  value={form[noteField]}
                  onChange={e => set(noteField, e.target.value)}
                  placeholder={field === 'underTreatment' ? 'ระบุโรคหรืออาการที่กำลังรักษา...' : 'ระบุข้อมูลสุขภาพเพิ่มเติม...'}
                  style={{ ...inputStyle, borderColor: `${color}50` }}
                  onFocus={e => e.target.style.borderColor = color}
                  onBlur={e => e.target.style.borderColor = `${color}50`}
                />
              </div>
            ))}
          </Section>

          {/* Pedigree section */}
          <Section title="ข้อมูล Pedigree (ถ้ามี)">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Award size={15} color="#F97316" />
              <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                ใส่ข้อมูลนี้เพื่อช่วยในการจับคู่สายเลือดและออกใบ Pedigree
              </span>
              <Link to="/registries" style={{ fontSize: 12, color: '#F97316', fontWeight: 700, textDecoration: 'none', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <BookOpen size={12} /> เรียนรู้เพิ่มเติม
              </Link>
            </div>

            <Field label="ชมรม/สมาคม Registry">
              <select value={form.registry} onChange={e => set('registry', e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={e => e.target.style.borderColor = '#F97316'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              >
                {REGISTRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>

            {form.registry && (
              <>
                <Field label="หมายเลขทะเบียน" hint="ระบุตามที่ปรากฏในใบทะเบียน">
                  <input type="text" value={form.registryNumber} onChange={e => set('registryNumber', e.target.value)}
                    placeholder="เช่น TH-2024-00123" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#F97316'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </Field>

                <Field label="ชื่อฟาร์ม / Cattery">
                  <input type="text" value={form.catteryName} onChange={e => set('catteryName', e.target.value)}
                    placeholder="ชื่อ cattery หรือชื่อฟาร์มแมว" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#F97316'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </Field>

                <Field label="ใบทะเบียน (รูปถ่าย)" hint="ถ่ายรูปหรืออัปโหลดใบทะเบียนแมว">
                  <input ref={certInputRef} type="file" accept={ACCEPT_IMAGE_TYPES}
                    onChange={handleCertFileSelect} style={{ display: 'none' }} />
                  {form.certPhotoURL ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={form.certPhotoURL} alt="ใบทะเบียน"
                        style={{ height: 100, borderRadius: 10, objectFit: 'cover', border: '1.5px solid #e5e7eb' }} />
                      <button type="button" onClick={() => set('certPhotoURL', '')}
                        style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={10} color="#fff" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" disabled={certUploading} onClick={() => certInputRef.current.click()}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10,
                        border: '1.5px dashed #e5e7eb', backgroundColor: '#fafafa', color: '#888',
                        fontSize: 13, fontWeight: 700, cursor: certUploading ? 'not-allowed' : 'pointer',
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}>
                      <Upload size={13} /> {certUploading ? 'กำลังโหลด...' : 'อัปโหลดใบทะเบียน'}
                    </button>
                  )}
                </Field>
              </>
            )}
          </Section>

          <button type="submit" disabled={saving || uploading} style={{
            width: '100%', padding: 14, borderRadius: 13, border: 'none',
            backgroundColor: (saving || uploading) ? '#ccc' : '#F97316',
            color: '#fff', fontSize: 15, fontWeight: 800,
            cursor: (saving || uploading) ? 'not-allowed' : 'pointer',
            fontFamily: 'Space Grotesk, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: (saving || uploading) ? 'none' : '0 4px 14px rgba(249,115,22,0.3)',
          }}>
            <Save size={15} />
            {saving ? 'กำลังบันทึก...' : uploading ? 'รอให้รูปอัพโหลดเสร็จก่อน...' : isEdit ? 'บันทึกการแก้ไข' : 'สร้างโปรไฟล์แมว'}
          </button>
        </form>
      </div>
    </div>
  )
}
