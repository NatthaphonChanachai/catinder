import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, PawPrint, ChevronRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { prepareImage, blobToBase64, ACCEPT_IMAGE_TYPES } from '../utils/imageUtils'

// Generate colorful cat face SVG avatars
function genCatAvatar(idx) {
  const palettes = [
    { bg: '#F97316', face: '#FDBA74', ear: '#FB923C' },
    { bg: '#6366F1', face: '#A5B4FC', ear: '#818CF8' },
    { bg: '#10B981', face: '#6EE7B7', ear: '#34D399' },
    { bg: '#EF4444', face: '#FCA5A5', ear: '#F87171' },
    { bg: '#3B82F6', face: '#93C5FD', ear: '#60A5FA' },
    { bg: '#8B5CF6', face: '#C4B5FD', ear: '#A78BFA' },
  ]
  const { bg, face, ear } = palettes[idx % palettes.length]
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">`,
    `<circle cx="100" cy="100" r="100" fill="${bg}"/>`,
    `<circle cx="100" cy="110" r="54" fill="${face}"/>`,
    `<polygon points="52,72 35,28 76,60" fill="${ear}"/>`,
    `<polygon points="148,72 165,28 124,60" fill="${ear}"/>`,
    `<polygon points="56,68 44,40 74,58" fill="#FECDD3"/>`,
    `<polygon points="144,68 156,40 126,58" fill="#FECDD3"/>`,
    `<ellipse cx="83" cy="100" rx="9" ry="11" fill="#111"/>`,
    `<ellipse cx="117" cy="100" rx="9" ry="11" fill="#111"/>`,
    `<circle cx="86" cy="97" r="3" fill="white"/>`,
    `<circle cx="120" cy="97" r="3" fill="white"/>`,
    `<ellipse cx="100" cy="116" rx="5" ry="4" fill="#F9A8D4"/>`,
    `<path d="M95,120 Q100,126 105,120" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    `<line x1="50" y1="113" x2="87" y2="117" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/>`,
    `<line x1="50" y1="120" x2="87" y2="119" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/>`,
    `<line x1="150" y1="113" x2="113" y2="117" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/>`,
    `<line x1="150" y1="120" x2="113" y2="119" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/>`,
    `</svg>`,
  ].join('')
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

const CAT_AVATARS = [0, 1, 2, 3, 4, 5].map(genCatAvatar)


export default function ProfileSetupModal() {
  const { user, userProfile, needsProfileSetup, saveProfileSetup } = useAuth()
  const [name, setName] = useState(user?.displayName || userProfile?.displayName || '')
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState(null)
  const [uploadedPhoto, setUploadedPhoto] = useState(null) // { previewUrl, blob }
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef()

  if (!needsProfileSetup) return null

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      const blob = await prepareImage(file, 500)
      const base64 = await blobToBase64(blob)
      setUploadedPhoto({ previewUrl: base64, base64 })
      setSelectedAvatarIdx(null)
    } catch {
      setUploadError('ไม่สามารถโหลดรูปได้ กรุณาลองใหม่')
    }
    setUploading(false)
    // Reset file input so same file can be re-selected
    e.target.value = ''
  }

  const previewUrl = uploadedPhoto?.previewUrl
    ?? (selectedAvatarIdx !== null ? CAT_AVATARS[selectedAvatarIdx] : null)
    ?? (user?.photoURL || userProfile?.photoURL || null)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    let photoURL = user?.photoURL || userProfile?.photoURL || ''

    if (uploadedPhoto?.base64) {
      photoURL = uploadedPhoto.base64
    } else if (selectedAvatarIdx !== null) {
      photoURL = CAT_AVATARS[selectedAvatarIdx]
    } else if (!photoURL) {
      photoURL = CAT_AVATARS[Math.floor(Math.random() * CAT_AVATARS.length)]
    }

    await saveProfileSetup(name.trim(), photoURL)
    setSaving(false)
  }

  const handleLater = async () => {
    const displayName = name.trim() || userProfile?.displayName || 'ผู้ใช้'
    const photoURL = user?.photoURL || userProfile?.photoURL || CAT_AVATARS[Math.floor(Math.random() * CAT_AVATARS.length)]
    await saveProfileSetup(displayName, photoURL)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 5000,
      backgroundColor: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, fontFamily: 'Space Grotesk, sans-serif',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        style={{
          backgroundColor: '#fff', borderRadius: 28,
          padding: '32px 28px', width: '100%', maxWidth: 420,
          maxHeight: '92dvh', overflowY: 'auto',
          boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <PawPrint size={24} color="#F97316" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#000', marginBottom: 5 }}>ตั้งค่าโปรไฟล์</h2>
          <p style={{ fontSize: 13, color: '#aaa', fontWeight: 500, lineHeight: 1.5 }}>ใส่ชื่อและรูปของคุณก่อนเริ่มใช้งาน</p>
        </div>

        {/* Avatar preview */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              backgroundColor: '#f5f5f5',
              backgroundImage: previewUrl ? `url(${previewUrl})` : 'none',
              backgroundSize: 'cover', backgroundPosition: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px solid #F97316',
              boxShadow: '0 4px 16px rgba(249,115,22,0.25)',
            }}>
              {!previewUrl && <PawPrint size={36} color="#ddd" />}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{
                position: 'absolute', bottom: 2, right: 2,
                width: 30, height: 30, borderRadius: '50%',
                backgroundColor: '#F97316', border: '2.5px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <Camera size={13} color="#fff" />
            </button>
          </div>
          <input ref={fileRef} type="file" accept={ACCEPT_IMAGE_TYPES} onChange={handleFileChange} style={{ display: 'none' }} />

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
              fontSize: 12, fontWeight: 700, color: '#F97316',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            <Upload size={12} /> {uploading ? 'กำลังโหลด...' : 'อัพโหลดจากเครื่อง'}
          </button>

          {uploadError && (
            <p style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, marginTop: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <AlertCircle size={12} /> {uploadError}
            </p>
          )}
        </div>

        {/* Cat avatar selection */}
        <div style={{ marginBottom: 22 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#aaa', textAlign: 'center', marginBottom: 12 }}>
            หรือเลือกรูปแมวสำเร็จรูป
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            {CAT_AVATARS.map((av, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setSelectedAvatarIdx(i); setUploadedPhoto(null) }}
                style={{
                  width: 52, height: 52, borderRadius: '50%', padding: 0,
                  backgroundImage: `url(${av})`, backgroundSize: 'cover',
                  border: selectedAvatarIdx === i ? '3px solid #F97316' : '3px solid #f0f0f0',
                  cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: selectedAvatarIdx === i ? '0 0 0 2px rgba(249,115,22,0.3)' : 'none',
                  transform: selectedAvatarIdx === i ? 'scale(1.1)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Name input */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#333', display: 'block', marginBottom: 7 }}>
            ชื่อที่แสดง <span style={{ color: '#F97316' }}>*</span>
          </label>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="ชื่อของคุณ" maxLength={30}
            style={{
              width: '100%', padding: '13px 16px', borderRadius: 13,
              border: `1.5px solid ${name.trim() ? '#e5e7eb' : '#fca5a5'}`,
              fontSize: 15, fontFamily: 'Space Grotesk, sans-serif',
              outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#F97316'}
            onBlur={e => e.target.style.borderColor = name.trim() ? '#e5e7eb' : '#fca5a5'}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <span style={{ fontSize: 11, color: '#bbb', fontWeight: 500 }}>{name.length}/30</span>
          </div>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !name.trim()}
          style={{
            width: '100%', padding: 14, borderRadius: 14, border: 'none',
            backgroundColor: name.trim() ? '#F97316' : '#e5e7eb',
            color: '#fff', fontSize: 15, fontWeight: 800,
            cursor: name.trim() ? 'pointer' : 'not-allowed',
            fontFamily: 'Space Grotesk, sans-serif', marginBottom: 10,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { if (name.trim() && !saving) e.currentTarget.style.backgroundColor = '#EA6A00' }}
          onMouseLeave={e => { if (name.trim()) e.currentTarget.style.backgroundColor = '#F97316' }}
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึกและเริ่มใช้งาน'}
        </button>

        {/* Later button */}
        <button
          type="button"
          onClick={handleLater}
          disabled={saving}
          style={{
            width: '100%', padding: 12, borderRadius: 14,
            border: '1.5px solid #e5e7eb', backgroundColor: '#fff',
            color: '#aaa', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#888'}
          onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
        >
          ตั้งทีหลัง <ChevronRight size={14} />
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#ccc', fontWeight: 500, marginTop: 10 }}>
          ระบบจะสุ่มรูปแมวให้หากกด "ตั้งทีหลัง"
        </p>
      </motion.div>
    </div>
  )
}
