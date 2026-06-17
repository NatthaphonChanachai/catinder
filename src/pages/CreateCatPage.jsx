import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, addDoc, updateDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore'
import { ArrowLeft, Save, Syringe, Scissors, Heart, Home, Users, Sparkles, Camera, Upload, X, PawPrint, Award, BookOpen, HeartHandshake, Tag, ArrowLeftRight, HelpCircle, Stethoscope, Droplets, ShieldCheck, Microscope, Cpu, FileText, Pill, ChevronRight, LocateFixed, Map } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { prepareImage, blobToBase64, ACCEPT_IMAGE_TYPES } from '../utils/imageUtils'
import { getCurrentPosition } from '../utils/geo'
import { REGISTRY_OPTIONS, BREEDS } from '../constants/catOptions'
import LocationPickerModal from '../components/LocationPickerModal'

const LOOKING_FOR = [
  { value: 'mate',     label: 'หาคู่ผสมพันธุ์',           icon: Heart },
  { value: 'friend',   label: 'หาเพื่อนเล่น',              icon: Users },
  { value: 'adopt',    label: 'หาบ้าน (ยกให้)',            icon: Home },
  { value: 'foster',   label: 'รับเลี้ยงชั่วคราว (Foster)', icon: HeartHandshake },
  { value: 'sell',     label: 'ขาย',                       icon: Tag },
  { value: 'exchange', label: 'แลกเปลี่ยน',               icon: ArrowLeftRight },
  { value: 'any',      label: 'ทุกอย่าง',                  icon: Sparkles },
  { value: 'other',    label: 'อื่นๆ',                     icon: HelpCircle },
]

const HEALTH_ITEMS = [
  { field: 'vaccinated',       label: 'ฉีดวัคซีนครบแล้ว',            desc: 'วัคซีนป้องกันโรคแมวครบตามอายุ',              icon: Syringe,     color: '#10b981' },
  { field: 'sterilized',       label: 'ทำหมันแล้ว',                   desc: 'ผ่าตัดทำหมันเรียบร้อยแล้ว',                  icon: Scissors,    color: '#8b5cf6' },
  { field: 'annualCheckup',    label: 'ตรวจสุขภาพประจำปีแล้ว',        desc: 'พบสัตวแพทย์ครบตามกำหนด',                    icon: Stethoscope, color: '#3b82f6' },
  { field: 'bloodTest',        label: 'ตรวจเลือดแล้ว (Blood test)',    desc: 'ผ่านการตรวจค่าเลือดล่าสุดแล้ว',             icon: Droplets,    color: '#ef4444' },
  { field: 'noGeneticDisease', label: 'ไม่มีโรคทางพันธุกรรม',         desc: 'ไม่พบโรคที่ถ่ายทอดทางพันธุกรรม',           icon: ShieldCheck,  color: '#06b6d4' },
  { field: 'fivFelvTested',    label: 'ผ่านการตรวจ FIV/FeLV แล้ว',   desc: 'ตรวจโรคภูมิคุ้มกันและมะเร็งเม็ดเลือดขาว',  icon: Microscope,  color: '#f59e0b' },
  { field: 'microchipped',     label: 'มีไมโครชิป',                   desc: 'ฝังชิประบุตัวตน (ISO 11784)',                icon: Cpu,         color: '#6366f1' },
  { field: 'hasVaccinationBook', label: 'มีสมุดวัคซีน / เอกสารสุขภาพ', desc: 'มีเอกสารรับรองสุขภาพอย่างเป็นทางการ',    icon: FileText,    color: '#84cc16' },
  { field: 'underTreatment',   label: 'กำลังรักษาอยู่',               desc: 'อยู่ในระหว่างการรักษา (โปรดระบุ)',          icon: Pill,        color: '#f97316', noteField: 'treatmentNote' },
  { field: 'healthOther',      label: 'อื่นๆ',                        desc: 'ข้อมูลสุขภาพเพิ่มเติม',                      icon: HelpCircle,  color: '#6b7280', noteField: 'healthOtherNote' },
]

/* ── shared input style ── */
const inp = {
  width: '100%', padding: '12px 14px', borderRadius: 12,
  border: '1.5px solid #E7E5E4', fontSize: 14,
  fontFamily: 'Space Grotesk, sans-serif',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  backgroundColor: '#FAFAF9', color: '#1C1917',
}
const focusOrange = e => {
  e.target.style.borderColor = '#F97316'
  e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.12)'
}
const blurOrange = e => {
  e.target.style.borderColor = '#E7E5E4'
  e.target.style.boxShadow = 'none'
}

/* ── Section card ── */
const Section = ({ title, icon: Icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    style={{
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: '20px 20px 22px',
      marginBottom: 14,
      border: '1.5px solid rgba(249,115,22,0.10)',
      boxShadow: '0 2px 16px rgba(249,115,22,0.06)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
      {Icon && (
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'linear-gradient(135deg,#F97316,#F59E0B)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={14} color="#fff" />
        </div>
      )}
      <h3 style={{
        fontSize: 12, fontWeight: 800, margin: 0,
        color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.07em',
      }}>{title}</h3>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(249,115,22,0.15),transparent)' }} />
    </div>
    {children}
  </motion.div>
)

/* ── Field wrapper ── */
const Field = ({ label, required, hint, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#44403C', marginBottom: 6 }}>
      {label}{required && <span style={{ color: '#F97316', marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {hint && <p style={{ fontSize: 11, color: '#A8A29E', marginTop: 4, fontWeight: 500 }}>{hint}</p>}
  </div>
)

export default function CreateCatPage() {
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const { catId } = useParams()
  const isEdit = Boolean(catId)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
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
    lat: null, lng: null,
    registry: '', registryNumber: '', catteryName: '', certPhotoURL: '',
  })
  const fileInputRef = useRef()
  const certInputRef = useRef()
  const [certUploading, setCertUploading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState('')
  const [showMapPicker, setShowMapPicker] = useState(false)

  const handleUseCurrentLocation = async () => {
    setLocating(true); setLocateError('')
    try {
      const { lat, lng } = await getCurrentPosition()
      set('lat', lat); set('lng', lng)
    } catch {
      setLocateError('ไม่สามารถระบุตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง')
    }
    setLocating(false)
  }

  const handleMapConfirm = ({ lat, lng, address }) => {
    set('lat', lat); set('lng', lng)
    if (address) set('location', address)
    setShowMapPicker(false)
  }

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
    if (file.size > 50 * 1024 * 1024) { alert('ไฟล์ใหญ่เกินไป (สูงสุด 50 MB)'); return }
    setUploading(true); setUploadProgress('compressing')
    try {
      const blob = await prepareImage(file, 700)
      setUploadProgress('encoding')
      set('photoURL', await blobToBase64(blob))
    } catch { alert('ไม่สามารถโหลดรูปได้ กรุณาลองไฟล์อื่น') }
    setUploading(false); setUploadProgress(null)
  }

  const handleCertFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (file.size > 50 * 1024 * 1024) { alert('ไฟล์ใหญ่เกินไป (สูงสุด 50 MB)'); return }
    setCertUploading(true)
    try {
      const blob = await prepareImage(file, 900)
      set('certPhotoURL', await blobToBase64(blob))
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

  const toggleLookingFor = (value) => {
    const cur = Array.isArray(form.lookingFor) ? form.lookingFor : []
    set('lookingFor', cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value])
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg,#FFF7ED 0%,#FFFBEB 22%,#fff 55%)',
      fontFamily: 'Space Grotesk, sans-serif',
      paddingBottom: 96,
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px 0' }}>
        {/* ── Page header (inline, consistent with other pages) ── */}
        <button onClick={() => navigate('/my-cats')} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.18)',
          borderRadius: 10, padding: '7px 14px', cursor: 'pointer',
          fontSize: 13, fontWeight: 700, color: '#F97316',
          fontFamily: 'Space Grotesk, sans-serif', marginBottom: 18,
        }}>
          <ArrowLeft size={14} /> กลับ
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg,#F97316,#F59E0B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(249,115,22,0.30)',
          }}>
            <PawPrint size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 21, fontWeight: 900, color: '#1C1917', margin: 0, lineHeight: 1.2 }}>
              {isEdit ? 'แก้ไขโปรไฟล์แมว' : 'เพิ่มโปรไฟล์แมว'}
            </h1>
            <p style={{ fontSize: 12.5, color: '#A8A29E', fontWeight: 500, margin: '3px 0 0' }}>
              กรอกข้อมูลน้องแมวเพื่อให้ผู้อื่นค้นพบ
            </p>
          </div>
        </div>
        <form onSubmit={handleSave}>

          {/* ── Photo ── */}
          <Section title="รูปโปรไฟล์" icon={Camera}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              {/* circle preview */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 150, height: 150, borderRadius: '50%',
                  background: form.photoURL ? `url(${form.photoURL}) center/cover` : 'linear-gradient(135deg,#FFF7ED,#FFECD2)',
                  border: '4px solid #fff',
                  boxShadow: '0 0 0 3px #F97316, 0 8px 24px rgba(249,115,22,0.20)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  {uploading ? (
                    <div style={{ textAlign: 'center' }}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                        style={{ width: 32, height: 32, border: '3px solid #F97316', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 8px' }}
                      />
                      <p style={{ fontSize: 11, color: '#F97316', fontWeight: 700 }}>
                        {uploadProgress === 'compressing' ? 'ปรับขนาด...' : 'กำลังโหลด...'}
                      </p>
                    </div>
                  ) : !form.photoURL ? (
                    <div style={{ textAlign: 'center' }}>
                      <PawPrint size={36} color="#F97316" style={{ opacity: 0.35 }} />
                      <p style={{ fontSize: 11, color: '#F97316', fontWeight: 700, marginTop: 6, opacity: 0.5 }}>ยังไม่มีรูป</p>
                    </div>
                  ) : null}
                </div>
                {form.photoURL && !uploading && (
                  <button type="button" onClick={() => set('photoURL', '')} style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 26, height: 26, borderRadius: '50%',
                    backgroundColor: '#ef4444', border: '2.5px solid #fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}>
                    <X size={12} color="#fff" />
                  </button>
                )}
              </div>

              {/* upload buttons */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button type="button" disabled={uploading} onClick={() => { fileInputRef.current.removeAttribute('capture'); fileInputRef.current.click() }} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '10px 20px', borderRadius: 12,
                  background: 'linear-gradient(135deg,#F97316,#F59E0B)',
                  border: 'none', color: '#fff', fontSize: 13, fontWeight: 800,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif',
                  opacity: uploading ? 0.6 : 1,
                  boxShadow: '0 4px 12px rgba(249,115,22,0.30)',
                }}>
                  <Upload size={14} /> เลือกจากแกลลอรี่
                </button>
                <button type="button" disabled={uploading} onClick={() => { fileInputRef.current.setAttribute('capture', 'environment'); fileInputRef.current.click() }} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '10px 20px', borderRadius: 12,
                  border: '1.5px solid #F97316', backgroundColor: '#FFF7ED',
                  color: '#F97316', fontSize: 13, fontWeight: 800,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif',
                  opacity: uploading ? 0.6 : 1,
                }}>
                  <Camera size={14} /> ถ่ายรูป
                </button>
              </div>
              <p style={{ fontSize: 11, color: '#A8A29E', fontWeight: 500 }}>รองรับ JPG, PNG, HEIC · ปรับขนาดอัตโนมัติ</p>
              <input ref={fileInputRef} type="file" accept={ACCEPT_IMAGE_TYPES} onChange={handleFileSelect} style={{ display: 'none' }} />
            </div>
          </Section>

          {/* ── Basic info ── */}
          <Section title="ข้อมูลพื้นฐาน" icon={PawPrint}>
            <Field label="ชื่อแมว" required>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="เช่น มูจิ, ลูน่า, เลโอ" required style={inp}
                onFocus={focusOrange} onBlur={blurOrange}
              />
            </Field>

            <Field label="สายพันธุ์" required>
              <select value={form.breed} onChange={e => set('breed', e.target.value)} required
                style={{ ...inp, cursor: 'pointer' }}
                onFocus={focusOrange} onBlur={blurOrange}
              >
                <option value="">-- เลือกสายพันธุ์ --</option>
                {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>

            {form.breed === 'อื่นๆ (Mixed)' && (
              <Field label="ระบุสายพันธุ์">
                <input type="text" value={form.breedCustom} onChange={e => set('breedCustom', e.target.value)}
                  placeholder="เช่น Siamese x Persian" style={inp}
                  onFocus={focusOrange} onBlur={blurOrange}
                />
              </Field>
            )}

            {/* Gender */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#44403C', marginBottom: 7 }}>
                เพศ <span style={{ color: '#F97316' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ v: 'male', l: '♂ ตัวผู้', g: 'linear-gradient(135deg,#60a5fa,#3b82f6)' }, { v: 'female', l: '♀ ตัวเมีย', g: 'linear-gradient(135deg,#f472b6,#ec4899)' }].map(({ v, l, g }) => (
                  <button key={v} type="button" onClick={() => set('gender', v)} style={{
                    flex: 1, padding: '11px 8px', borderRadius: 12,
                    border: form.gender === v ? 'none' : '1.5px solid #E7E5E4',
                    background: form.gender === v ? g : '#FAFAF9',
                    color: form.gender === v ? '#fff' : '#78716C',
                    fontSize: 14, fontWeight: 800, cursor: 'pointer',
                    fontFamily: 'Space Grotesk, sans-serif',
                    boxShadow: form.gender === v ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                    transition: 'all 0.18s',
                  }}>{l}</button>
                ))}
              </div>
            </div>

            {/* Age + Weight */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#44403C', marginBottom: 7 }}>อายุ / น้ำหนัก</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { key: 'ageYears', label: 'ปี', max: 30 },
                  { key: 'ageMonths', label: 'เดือน', max: 11 },
                  { key: 'weight', label: 'กก.', max: 20, step: 0.1 },
                ].map(({ key, label, max, step }) => (
                  <div key={key}>
                    <input type="number" min="0" max={max} step={step || 1}
                      value={form[key]} onChange={e => set(key, e.target.value)}
                      style={{ ...inp, textAlign: 'center', paddingLeft: 8, paddingRight: 8 }}
                      onFocus={focusOrange} onBlur={blurOrange}
                    />
                    <p style={{ fontSize: 11, color: '#A8A29E', textAlign: 'center', marginTop: 4, fontWeight: 700 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <Field label="สีขน">
              <input type="text" value={form.color} onChange={e => set('color', e.target.value)}
                placeholder="เช่น ขาว, ส้ม, สีสาม" style={inp}
                onFocus={focusOrange} onBlur={blurOrange}
              />
            </Field>
          </Section>

          {/* ── Details ── */}
          <Section title="รายละเอียด" icon={Sparkles}>
            <Field label="คำอธิบาย">
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="เล่าเรื่องน้องแมว บุคลิก นิสัย สิ่งที่ชอบ..." rows={3}
                style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={focusOrange} onBlur={blurOrange}
              />
            </Field>

            <Field label="ที่อยู่ / ย่าน" hint="เลือกตำแหน่งบนแผนที่เพื่อความแม่นยำ ใช้คำนวณระยะทางตอน Discover">
              <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                placeholder="เช่น กรุงเทพฯ, เชียงใหม่, บางกอกน้อย" style={{ ...inp, marginBottom: 8 }}
                onFocus={focusOrange} onBlur={blurOrange}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setShowMapPicker(true)} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 14px', borderRadius: 11,
                  border: form.lat != null ? '1.5px solid #10b981' : '1.5px solid rgba(249,115,22,0.30)',
                  backgroundColor: form.lat != null ? 'rgba(16,185,129,0.07)' : '#FFF7ED',
                  color: form.lat != null ? '#059669' : '#F97316',
                  fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}>
                  <Map size={13} />
                  {form.lat != null ? '✓ บันทึกพิกัดแล้ว · กดเพื่อแก้ไข' : 'เลือกบนแผนที่'}
                </button>
                <button type="button" disabled={locating} onClick={handleUseCurrentLocation} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 14px', borderRadius: 11,
                  border: '1.5px solid #E7E5E4', backgroundColor: '#FAFAF9', color: '#78716C',
                  fontSize: 12.5, fontWeight: 700, cursor: locating ? 'not-allowed' : 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}>
                  <LocateFixed size={13} />
                  {locating ? 'กำลังค้นหา...' : 'ใช้ตำแหน่งปัจจุบัน'}
                </button>
              </div>
              {locateError && (
                <p style={{ fontSize: 11, color: '#ef4444', marginTop: 6, fontWeight: 600 }}>{locateError}</p>
              )}
            </Field>

            {/* Looking for — multi-select */}
            <div style={{ marginBottom: 0 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#44403C', marginBottom: 10 }}>กำลังมองหา</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {LOOKING_FOR.map(({ value, label, icon: Icon }) => {
                  const active = Array.isArray(form.lookingFor) && form.lookingFor.includes(value)
                  return (
                    <button key={value} type="button" onClick={() => toggleLookingFor(value)} style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: '10px 13px', borderRadius: 12,
                      border: active ? 'none' : '1.5px solid #E7E5E4',
                      background: active
                        ? 'linear-gradient(135deg,#F97316,#F59E0B)'
                        : '#FAFAF9',
                      color: active ? '#fff' : '#78716C',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'Space Grotesk, sans-serif',
                      textAlign: 'left', transition: 'all 0.18s',
                      boxShadow: active ? '0 4px 12px rgba(249,115,22,0.28)' : 'none',
                    }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                        backgroundColor: active ? 'rgba(255,255,255,0.22)' : 'rgba(249,115,22,0.10)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={13} color={active ? '#fff' : '#F97316'} />
                      </div>
                      <span style={{ lineHeight: 1.3 }}>{label}</span>
                    </button>
                  )
                })}
              </div>
              <AnimatePresence>
                {Array.isArray(form.lookingFor) && form.lookingFor.includes('other') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden', marginTop: 10 }}
                  >
                    <input
                      type="text"
                      value={form.lookingForOther}
                      onChange={e => set('lookingForOther', e.target.value)}
                      placeholder="ระบุสิ่งที่กำลังมองหา..."
                      style={inp}
                      onFocus={focusOrange} onBlur={blurOrange}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Section>

          {/* ── Health ── */}
          <Section title="สุขภาพ" icon={Syringe}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 9 }}>
              {HEALTH_ITEMS.map(({ field, label, desc, icon: Icon, color }) => (
                <label key={field} onClick={() => set(field, !form[field])} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
                  padding: '11px 13px', borderRadius: 13,
                  border: form[field] ? `1.5px solid ${color}` : '1.5px solid #E7E5E4',
                  backgroundColor: form[field] ? `${color}0D` : '#FAFAF9',
                  transition: 'all 0.18s',
                  boxShadow: form[field] ? `0 2px 10px ${color}22` : 'none',
                }}>
                  {/* checkbox */}
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                    border: form[field] ? `2px solid ${color}` : '2px solid #D6D3D1',
                    backgroundColor: form[field] ? color : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.18s',
                  }}>
                    {form[field] && <span style={{ color: '#fff', fontSize: 10, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                  </div>
                  {/* icon badge */}
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    backgroundColor: form[field] ? `${color}20` : '#F5F5F4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.18s',
                  }}>
                    <Icon size={14} color={form[field] ? color : '#A8A29E'} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: form[field] ? '#1C1917' : '#57534E', lineHeight: 1.3 }}>{label}</div>
                    <div style={{ fontSize: 11, color: '#A8A29E', fontWeight: 500, marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
                  </div>
                </label>
              ))}
            </div>
            {/* note inputs for flagged items */}
            <AnimatePresence>
              {HEALTH_ITEMS.filter(item => item.noteField && form[item.field]).map(({ field, noteField, color }) => (
                <motion.div
                  key={noteField}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden', marginTop: 10 }}
                >
                  <input
                    type="text"
                    value={form[noteField]}
                    onChange={e => set(noteField, e.target.value)}
                    placeholder={field === 'underTreatment' ? 'ระบุโรคหรืออาการที่กำลังรักษา...' : 'ระบุข้อมูลสุขภาพเพิ่มเติม...'}
                    style={{ ...inp, borderColor: `${color}60`, backgroundColor: `${color}08` }}
                    onFocus={e => { e.target.style.borderColor = color; e.target.style.boxShadow = `0 0 0 3px ${color}20` }}
                    onBlur={e => { e.target.style.borderColor = `${color}60`; e.target.style.boxShadow = 'none' }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </Section>

          {/* ── Pedigree ── */}
          <Section title="ข้อมูล Pedigree (ถ้ามี)" icon={Award}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
              padding: '10px 14px', borderRadius: 12,
              background: 'linear-gradient(135deg,#FFF7ED,#FFFBEB)',
              border: '1px solid rgba(249,115,22,0.15)',
            }}>
              <div style={{ flex: 1, fontSize: 12.5, color: '#78716C', fontWeight: 500, lineHeight: 1.5 }}>
                ใส่ข้อมูลนี้เพื่อช่วยในการจับคู่สายเลือดและออกใบ Pedigree
              </div>
              <Link to="/registries" style={{
                display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                fontSize: 12, color: '#F97316', fontWeight: 800, textDecoration: 'none',
                padding: '6px 12px', borderRadius: 9,
                border: '1.5px solid rgba(249,115,22,0.30)',
                backgroundColor: '#fff',
              }}>
                <BookOpen size={12} /> เรียนรู้ <ChevronRight size={11} />
              </Link>
            </div>

            <Field label="ชมรม/สมาคม Registry">
              <select value={form.registry} onChange={e => set('registry', e.target.value)}
                style={{ ...inp, cursor: 'pointer' }}
                onFocus={focusOrange} onBlur={blurOrange}
              >
                {REGISTRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>

            <AnimatePresence>
              {form.registry && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <Field label="หมายเลขทะเบียน" hint="ระบุตามที่ปรากฏในใบทะเบียน">
                    <input type="text" value={form.registryNumber} onChange={e => set('registryNumber', e.target.value)}
                      placeholder="เช่น TH-2024-00123" style={inp}
                      onFocus={focusOrange} onBlur={blurOrange}
                    />
                  </Field>

                  <Field label="ชื่อฟาร์ม / Cattery">
                    <input type="text" value={form.catteryName} onChange={e => set('catteryName', e.target.value)}
                      placeholder="ชื่อ cattery หรือชื่อฟาร์มแมว" style={inp}
                      onFocus={focusOrange} onBlur={blurOrange}
                    />
                  </Field>

                  <Field label="ใบทะเบียน (รูปถ่าย)" hint="ถ่ายรูปหรืออัปโหลดใบทะเบียนแมว">
                    <input ref={certInputRef} type="file" accept={ACCEPT_IMAGE_TYPES}
                      onChange={handleCertFileSelect} style={{ display: 'none' }} />
                    {form.certPhotoURL ? (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={form.certPhotoURL} alt="ใบทะเบียน"
                          style={{ height: 110, borderRadius: 12, objectFit: 'cover', border: '2px solid rgba(249,115,22,0.20)' }} />
                        <button type="button" onClick={() => set('certPhotoURL', '')}
                          style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', backgroundColor: '#ef4444', border: '2.5px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <X size={11} color="#fff" />
                        </button>
                      </div>
                    ) : (
                      <button type="button" disabled={certUploading} onClick={() => certInputRef.current.click()}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px', borderRadius: 12,
                          border: '1.5px dashed rgba(249,115,22,0.40)', backgroundColor: '#FFF7ED', color: '#F97316',
                          fontSize: 13, fontWeight: 700, cursor: certUploading ? 'not-allowed' : 'pointer',
                          fontFamily: 'Space Grotesk, sans-serif',
                        }}>
                        <Upload size={14} /> {certUploading ? 'กำลังโหลด...' : 'อัปโหลดใบทะเบียน'}
                      </button>
                    )}
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>
          </Section>

          {/* ── Submit ── */}
          <motion.button
            type="submit"
            disabled={saving || uploading}
            whileHover={!(saving || uploading) ? { scale: 1.01 } : {}}
            whileTap={!(saving || uploading) ? { scale: 0.98 } : {}}
            style={{
              width: '100%', padding: '15px 0', borderRadius: 16, border: 'none',
              background: (saving || uploading)
                ? 'linear-gradient(135deg,#D6D3D1,#A8A29E)'
                : 'linear-gradient(135deg,#F97316 0%,#FB923C 50%,#F59E0B 100%)',
              color: '#fff', fontSize: 15, fontWeight: 900,
              cursor: (saving || uploading) ? 'not-allowed' : 'pointer',
              fontFamily: 'Space Grotesk, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              boxShadow: (saving || uploading) ? 'none' : '0 6px 24px rgba(249,115,22,0.40)',
              letterSpacing: '0.02em',
            }}
          >
            <Save size={16} />
            {saving ? 'กำลังบันทึก...' : uploading ? 'รอให้รูปโหลดเสร็จก่อน...' : isEdit ? 'บันทึกการแก้ไข' : 'สร้างโปรไฟล์แมว'}
          </motion.button>

        </form>
      </div>

      <LocationPickerModal
        open={showMapPicker}
        initialLat={form.lat}
        initialLng={form.lng}
        onConfirm={handleMapConfirm}
        onClose={() => setShowMapPicker(false)}
      />
    </div>
  )
}
