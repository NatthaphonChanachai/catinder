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
import { useLanguage } from '../contexts/LanguageContext'
import { prepareImage, blobToBase64, ACCEPT_IMAGE_TYPES } from '../utils/imageUtils'

const COPY = {
  th: {
    registryOther: 'อื่นๆ',
    imageLoadFailed: 'โหลดรูปไม่ได้ กรุณาลองไฟล์อื่น',
    catName: 'ชื่อแมว',
    catNamePlaceholder: 'ชื่อแมว',
    registry: 'ชมรม/สมาคม',
    selectPlaceholder: '-- เลือก --',
    regNumber: 'หมายเลขทะเบียน',
    regNumberPlaceholder: 'เช่น TH-2024-00123',
    cattery: 'ชื่อ Cattery / ฟาร์ม',
    catteryPlaceholder: 'ชื่อฟาร์มหรือ cattery',
    ownerName: 'ชื่อเจ้าของ',
    ownerNamePlaceholder: 'ชื่อ-นามสกุล',
    ownerPhone: 'เบอร์โทรศัพท์',
    ownerPhonePlaceholder: '08x-xxx-xxxx',
    farmRegNumber: "หมายเลขจดทะเบียนฟาร์ม (Dam's Owner)",
    farmRegNumberHint: 'ใช้สำหรับยื่นกับสมาคม',
    farmRegNumberPlaceholder: 'หมายเลขจดทะเบียนฟาร์ม',
    regImg: 'รูปใบทะเบียน',
    regImgHint: 'ถ่ายรูปใบทะเบียนแมวเพื่อแนบประกอบ',
    regImgAlt: 'ใบทะเบียน',
    loading: 'กำลังโหลด...',
    uploadRegImg: 'อัปโหลดใบทะเบียน',
    sameRegistry: same => `✅ ทั้งคู่อยู่ใน ${same} เหมือนกัน — สามารถออกใบ Pedigree ได้`,
    diffRegistry: (sireReg, damReg) => `⚠️ พ่ออยู่ใน ${sireReg}, แม่อยู่ใน ${damReg}`,
    diffRegistryNote: 'ลูกแมวอาจออกใบเพ็ดดีกรีไม่ได้ เนื่องจากพ่อแม่อยู่ต่างชมรม — แนะนำให้ปรึกษาสมาคมก่อนดำเนินการ',
    sireCat: 'พ่อแมว',
    damCat: 'แม่แมว',
    sireOwner: 'เจ้าของพ่อ',
    damOwner: 'เจ้าของแม่',
    litterBirthDate: 'วันคลอดลูก',
    litterCount: 'จำนวนลูก',
    litterCountUnit: n => `${n} ตัว`,
    litterColorSex: 'สีขน / เพศ',
    ownerSignature: 'ลายเซ็นเจ้าของ',
    hasAttachment: 'มีไฟล์แนบ',
    noAttachment: 'ไม่มี',
    damFarmRegNumberShort: 'หมายเลขจดทะเบียนฟาร์ม (Dam)',
    saveSuccess: 'บันทึกข้อมูลสำเร็จ',
    saveSuccessHint: 'ตรวจสอบรายการด้านล่างก่อนส่งเอกสารไปยังสมาคม',
    refCode: 'รหัสอ้างอิง',
    checklistTitle: 'Checklist เอกสาร Pedigree',
    notSpecified: 'ยังไม่ระบุ',
    nextStepsPrefix: 'ขั้นตอนต่อไป:',
    nextSteps: registry => ` นำรายการนี้ไปยื่นที่สมาคม ${registry} พร้อมเอกสารต้นฉบับ เพื่อออกใบ Pedigree ให้กับลูกแมว`,
    registeredFallback: 'ที่ลงทะเบียน',
    fillAgain: 'กรอกใหม่',
    backToDiscover: 'กลับหน้า Discover',
    back: 'กลับ',
    pageTitle: 'เตรียมเอกสาร Pedigree',
    pageSubtitle: 'กรอกข้อมูลพ่อแม่แมวและลูกแมวเพื่อเตรียมยื่นกับสมาคม',
    sireSectionTitle: '🐾 สายพ่อ (Sire)',
    damSectionTitle: '🐾 สายแม่ (Dam)',
    litterSectionTitle: 'ข้อมูลลูกแมว (Litter)',
    birthDate: 'วันที่คลอด',
    litterCountField: 'จำนวนลูก (ตัว)',
    litterCountPlaceholder: 'เช่น 4',
    litterDescLabel: 'รายละเอียดลูกแมว',
    litterDescHint: 'เช่น สีขน, เพศ (ตัวผู้ 2 ตัว สีส้ม, ตัวเมีย 2 ตัว สีขาว)',
    litterDescPlaceholder: 'ระบุสีขนและเพศของลูกแมวแต่ละตัว',
    signatureSectionTitle: 'ลายเซ็นเจ้าของ / หนังสือยินยอม',
    signatureIntro: 'อัปโหลดลายเซ็นเจ้าของหรือเอกสารยินยอมการผสมพันธุ์ (ถ้ามี)',
    signatureAlt: 'ลายเซ็น',
    uploadSignature: 'อัปโหลดลายเซ็น / เอกสารยินยอม',
    notesSectionTitle: 'หมายเหตุเพิ่มเติม',
    notesPlaceholder: 'หมายเหตุอื่นๆ สำหรับการยื่นเอกสาร...',
    saving: 'กำลังบันทึก...',
    saveAndCreate: 'บันทึกและสร้าง Checklist',
    sigUploadFailed: 'โหลดรูปไม่ได้',
    fillRequiredAlert: 'กรุณากรอกชื่อแมวและชมรมทั้งสองฝ่าย',
    saveErrorAlert: 'เกิดข้อผิดพลาด กรุณาลองใหม่',
  },
  en: {
    registryOther: 'Other',
    imageLoadFailed: 'Could not load image. Please try a different file.',
    catName: 'Cat Name',
    catNamePlaceholder: 'Cat name',
    registry: 'Registry / Association',
    selectPlaceholder: '-- Select --',
    regNumber: 'Registration Number',
    regNumberPlaceholder: 'e.g. TH-2024-00123',
    cattery: 'Cattery / Farm Name',
    catteryPlaceholder: 'Farm or cattery name',
    ownerName: 'Owner Name',
    ownerNamePlaceholder: 'Full name',
    ownerPhone: 'Phone Number',
    ownerPhonePlaceholder: '08x-xxx-xxxx',
    farmRegNumber: "Farm Registration Number (Dam's Owner)",
    farmRegNumberHint: 'Used when filing with the registry',
    farmRegNumberPlaceholder: 'Farm registration number',
    regImg: 'Registration Certificate Photo',
    regImgHint: "Take a photo of the cat's registration certificate to attach",
    regImgAlt: 'Registration certificate',
    loading: 'Uploading...',
    uploadRegImg: 'Upload Registration Certificate',
    sameRegistry: same => `✅ Both are registered with ${same} — a Pedigree certificate can be issued`,
    diffRegistry: (sireReg, damReg) => `⚠️ Sire is registered with ${sireReg}, Dam is registered with ${damReg}`,
    diffRegistryNote: 'The kittens may not be eligible for a pedigree certificate since the parents are registered with different associations — we recommend checking with the registry before proceeding.',
    sireCat: 'Sire',
    damCat: 'Dam',
    sireOwner: "Sire's Owner",
    damOwner: "Dam's Owner",
    litterBirthDate: 'Litter Birth Date',
    litterCount: 'Number of Kittens',
    litterCountUnit: n => `${n} kitten(s)`,
    litterColorSex: 'Coat Color / Sex',
    ownerSignature: "Owner's Signature",
    hasAttachment: 'Attached',
    noAttachment: 'None',
    damFarmRegNumberShort: 'Farm Registration Number (Dam)',
    saveSuccess: 'Saved successfully',
    saveSuccessHint: 'Review the checklist below before submitting documents to the registry.',
    refCode: 'Reference code',
    checklistTitle: 'Pedigree Document Checklist',
    notSpecified: 'Not specified',
    nextStepsPrefix: 'Next steps:',
    nextSteps: registry => ` Submit this checklist to the ${registry} registry along with the original documents to obtain a Pedigree certificate for the kittens.`,
    registeredFallback: 'registered',
    fillAgain: 'Fill Again',
    backToDiscover: 'Back to Discover',
    back: 'Back',
    pageTitle: 'Prepare Pedigree Documents',
    pageSubtitle: "Fill in the parent cats' and litter's information to prepare for registry submission",
    sireSectionTitle: '🐾 Sire Line',
    damSectionTitle: '🐾 Dam Line',
    litterSectionTitle: 'Litter Information',
    birthDate: 'Birth Date',
    litterCountField: 'Number of Kittens',
    litterCountPlaceholder: 'e.g. 4',
    litterDescLabel: 'Litter Details',
    litterDescHint: 'e.g. coat color, sex (2 male orange, 2 female white)',
    litterDescPlaceholder: 'Describe each kitten\'s coat color and sex',
    signatureSectionTitle: "Owner's Signature / Consent Form",
    signatureIntro: "Upload the owner's signature or breeding consent document (if available)",
    signatureAlt: 'Signature',
    uploadSignature: 'Upload Signature / Consent Document',
    notesSectionTitle: 'Additional Notes',
    notesPlaceholder: 'Any other notes for the submission...',
    saving: 'Saving...',
    saveAndCreate: 'Save and Create Checklist',
    sigUploadFailed: 'Could not load image',
    fillRequiredAlert: "Please fill in both cats' names and registries",
    saveErrorAlert: 'An error occurred. Please try again.',
  },
}

const REGISTRIES_BASE = ['CFA', 'TICA', 'SCFC', 'WCF']

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

function CatPartySection({ title, prefix, form, set, accent, c }) {
  const fileRef = useRef()
  const [uploading, setUploading] = useState(false)
  const registries = [...REGISTRIES_BASE, c.registryOther]

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
      alert(c.imageLoadFailed)
    }
    setUploading(false)
  }

  const fv = k => form[prefix + k] ?? ''
  const fset = (k, v) => set(prefix + k, v)

  return (
    <Section title={title} accent={accent}>
      <Field label={c.catName} required>
        <input
          type="text"
          value={fv('CatName')}
          onChange={e => fset('CatName', e.target.value)}
          placeholder={c.catNamePlaceholder}
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = accent)}
          onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label={c.registry} required>
          <select
            value={fv('Registry')}
            onChange={e => fset('Registry', e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
            onFocus={e => (e.target.style.borderColor = accent)}
            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
          >
            <option value="">{c.selectPlaceholder}</option>
            {registries.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>

        <Field label={c.regNumber} required>
          <input
            type="text"
            value={fv('RegNumber')}
            onChange={e => fset('RegNumber', e.target.value)}
            placeholder={c.regNumberPlaceholder}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = accent)}
            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
          />
        </Field>
      </div>

      <Field label={c.cattery}>
        <input
          type="text"
          value={fv('Cattery')}
          onChange={e => fset('Cattery', e.target.value)}
          placeholder={c.catteryPlaceholder}
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = accent)}
          onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label={c.ownerName} required>
          <input
            type="text"
            value={fv('OwnerName')}
            onChange={e => fset('OwnerName', e.target.value)}
            placeholder={c.ownerNamePlaceholder}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = accent)}
            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
          />
        </Field>

        <Field label={c.ownerPhone}>
          <input
            type="tel"
            value={fv('OwnerPhone')}
            onChange={e => fset('OwnerPhone', e.target.value)}
            placeholder={c.ownerPhonePlaceholder}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = accent)}
            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
          />
        </Field>
      </div>

      {prefix === 'dam' && (
        <Field label={c.farmRegNumber} hint={c.farmRegNumberHint}>
          <input
            type="text"
            value={fv('FarmRegNumber')}
            onChange={e => fset('FarmRegNumber', e.target.value)}
            placeholder={c.farmRegNumberPlaceholder}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = accent)}
            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
          />
        </Field>
      )}

      {/* Reg cert upload */}
      <Field label={c.regImg} hint={c.regImgHint}>
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
              alt={c.regImgAlt}
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
            {uploading ? c.loading : c.uploadRegImg}
          </button>
        )}
      </Field>
    </Section>
  )
}

function RegistryWarning({ sireReg, damReg, c }) {
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
            ? c.sameRegistry(sireReg)
            : c.diffRegistry(sireReg, damReg)}
        </div>
        {!same && (
          <div style={{ fontSize: 12, color: '#78350f', fontWeight: 500, lineHeight: 1.5 }}>
            {c.diffRegistryNote}
          </div>
        )}
      </div>
    </div>
  )
}

function SuccessView({ form, docId, c }) {
  const navigate = useNavigate()
  const items = [
    { label: c.sireCat, value: form.sireCatName, sub: `${form.sireRegistry} · ${form.sireRegNumber}`, done: !!form.sireRegNumber },
    { label: c.damCat, value: form.damCatName, sub: `${form.damRegistry} · ${form.damRegNumber}`, done: !!form.damRegNumber },
    { label: c.sireOwner, value: form.sireOwnerName, sub: form.sireOwnerPhone, done: !!form.sireOwnerName },
    { label: c.damOwner, value: form.damOwnerName, sub: form.damOwnerPhone, done: !!form.damOwnerName },
    { label: c.litterBirthDate, value: form.litterBirthDate, done: !!form.litterBirthDate },
    { label: c.litterCount, value: form.litterCount ? c.litterCountUnit(form.litterCount) : '', done: !!form.litterCount },
    { label: c.litterColorSex, value: form.litterDesc, done: !!form.litterDesc },
    { label: c.ownerSignature, value: form.signatureImg ? c.hasAttachment : c.noAttachment, done: !!form.signatureImg },
    { label: c.damFarmRegNumberShort, value: form.damFarmRegNumber, done: !!form.damFarmRegNumber },
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
          {c.saveSuccess}
        </h2>
        <p style={{ fontSize: 13, color: '#555', fontWeight: 500, lineHeight: 1.6, marginBottom: 0 }}>
          {c.saveSuccessHint}
        </p>
        {docId && (
          <p style={{ fontSize: 11, color: '#aaa', fontWeight: 600, marginTop: 6 }}>
            {c.refCode}: {docId}
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
            {c.checklistTitle}
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
                {c.notSpecified}
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
          📋 <strong>{c.nextStepsPrefix}</strong>
          {c.nextSteps(form.damRegistry || form.sireRegistry || c.registeredFallback)}
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
          {c.fillAgain}
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
          <PawPrint size={14} /> {c.backToDiscover}
        </Link>
      </div>
    </motion.div>
  )
}

export default function PedigreeFormPage() {
  const { user, userProfile } = useAuth()
  const { lang } = useLanguage()
  const c = COPY[lang]
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
      alert(c.sigUploadFailed)
    }
    setSigUploading(false)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.sireCatName || !form.damCatName || !form.sireRegistry || !form.damRegistry) {
      alert(c.fillRequiredAlert)
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
      alert(c.saveErrorAlert)
    }
    setSaving(false)
  }

  if (done) return <SuccessView form={form} docId={savedDocId} c={c} />

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
          <ArrowLeft size={15} /> {c.back}
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
              {c.pageTitle}
            </h1>
          </div>
          <p style={{ fontSize: 13, color: '#aaa', fontWeight: 500, marginBottom: 0 }}>
            {c.pageSubtitle}
          </p>
        </div>

        <RegistryWarning sireReg={form.sireRegistry} damReg={form.damRegistry} c={c} />

        <form onSubmit={handleSubmit}>
          <CatPartySection
            title={c.sireSectionTitle}
            prefix="sire"
            form={form}
            set={set}
            accent="#1d4ed8"
            c={c}
          />

          <CatPartySection
            title={c.damSectionTitle}
            prefix="dam"
            form={form}
            set={set}
            accent="#be123c"
            c={c}
          />

          {/* Litter info */}
          <Section title={c.litterSectionTitle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label={c.birthDate} required>
                <input
                  type="date"
                  value={form.litterBirthDate}
                  onChange={e => set('litterBirthDate', e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#F97316')}
                  onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                />
              </Field>
              <Field label={c.litterCountField} required>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={form.litterCount}
                  onChange={e => set('litterCount', e.target.value)}
                  placeholder={c.litterCountPlaceholder}
                  style={{ ...inputStyle, textAlign: 'center' }}
                  onFocus={e => (e.target.style.borderColor = '#F97316')}
                  onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                />
              </Field>
            </div>

            <Field
              label={c.litterDescLabel}
              hint={c.litterDescHint}
              required
            >
              <textarea
                value={form.litterDesc}
                onChange={e => set('litterDesc', e.target.value)}
                placeholder={c.litterDescPlaceholder}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={e => (e.target.style.borderColor = '#F97316')}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
              />
            </Field>
          </Section>

          {/* Signature */}
          <Section title={c.signatureSectionTitle}>
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
              {c.signatureIntro}
            </p>
            {form.signatureImg ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={form.signatureImg}
                  alt={c.signatureAlt}
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
                {sigUploading ? c.loading : c.uploadSignature}
              </button>
            )}
          </Section>

          {/* Notes */}
          <Section title={c.notesSectionTitle}>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder={c.notesPlaceholder}
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
            {saving ? c.saving : c.saveAndCreate}
          </button>
        </form>
      </div>
    </div>
  )
}
