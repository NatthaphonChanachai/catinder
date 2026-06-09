import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, Upload, PawPrint, AlertCircle, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { prepareImage, blobToBase64, ACCEPT_IMAGE_TYPES } from '../utils/imageUtils'

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


export default function EditProfileModal({ onClose }) {
  const { user, userProfile, updateUserProfile } = useAuth()
  const [name, setName] = useState(userProfile?.displayName || user?.displayName || '')
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState(null)
  const [uploadedPhoto, setUploadedPhoto] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const currentPhoto = userProfile?.photoURL || user?.photoURL || ''

  const previewUrl = uploadedPhoto?.previewUrl
    ?? (selectedAvatarIdx !== null ? CAT_AVATARS[selectedAvatarIdx] : null)
    ?? (currentPhoto || null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setError('')
    try {
      const blob = await prepareImage(file, 500)
      const base64 = await blobToBase64(blob)
      setUploadedPhoto({ previewUrl: base64, base64 })
      setSelectedAvatarIdx(null)
    } catch {
      setError('ไม่สามารถโหลดรูปได้')
    }
    setUploading(false)
    e.target.value = ''
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true); setError('')
    let photoURL = currentPhoto

    if (uploadedPhoto?.base64) {
      photoURL = uploadedPhoto.base64
    } else if (selectedAvatarIdx !== null) {
      photoURL = CAT_AVATARS[selectedAvatarIdx]
    }

    const res = await updateUserProfile(name.trim(), photoURL)
    setSaving(false)
    if (res?.error) {
      setError('บันทึกไม่สำเร็จ: ' + res.error)
    } else {
      setSaved(true)
      setTimeout(() => { setSaved(false); onClose() }, 900)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 4000,
          backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16, fontFamily: 'Space Grotesk, sans-serif',
        }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          style={{
            backgroundColor: '#fff', borderRadius: 28,
            padding: '32px 28px', width: '100%', maxWidth: 420,
            maxHeight: '92dvh', overflowY: 'auto',
            boxShadow: '0 32px 80px rgba(0,0,0,0.3)', position: 'relative',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#000' }}>แก้ไขโปรไฟล์</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} color="#888" />
            </button>
          </div>

          {/* Avatar */}
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{
                width: 96, height: 96, borderRadius: '50%',
                backgroundColor: '#f5f5f5',
                backgroundImage: previewUrl ? `url(${previewUrl})` : 'none',
                backgroundSize: 'cover', backgroundPosition: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid #F97316',
                boxShadow: '0 4px 16px rgba(249,115,22,0.2)',
              }}>
                {!previewUrl && <PawPrint size={36} color="#ddd" />}
              </div>
              <button type="button" onClick={() => fileRef.current?.click()} style={{
                position: 'absolute', bottom: 2, right: 2,
                width: 30, height: 30, borderRadius: '50%',
                backgroundColor: '#F97316', border: '2.5px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <Camera size={13} color="#fff" />
              </button>
            </div>
            <input ref={fileRef} type="file" accept={ACCEPT_IMAGE_TYPES} onChange={handleFileChange} style={{ display: 'none' }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
              fontSize: 12, fontWeight: 700, color: '#F97316',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Space Grotesk, sans-serif',
            }}>
              <Upload size={12} /> {uploading ? 'กำลังโหลด...' : 'อัพโหลดจากเครื่อง'}
            </button>
          </div>

          {/* Cat avatars */}
          <div style={{ marginBottom: 22 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#aaa', textAlign: 'center', marginBottom: 10 }}>
              หรือเลือกรูปแมวสำเร็จรูป
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
              {CAT_AVATARS.map((av, i) => (
                <button key={i} type="button"
                  onClick={() => { setSelectedAvatarIdx(i); setUploadedPhoto(null) }}
                  style={{
                    width: 50, height: 50, borderRadius: '50%', padding: 0,
                    backgroundImage: `url(${av})`, backgroundSize: 'cover',
                    border: selectedAvatarIdx === i ? '3px solid #F97316' : '3px solid #f0f0f0',
                    cursor: 'pointer', transition: 'all 0.15s',
                    transform: selectedAvatarIdx === i ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: selectedAvatarIdx === i ? '0 0 0 2px rgba(249,115,22,0.3)' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#333', display: 'block', marginBottom: 7 }}>
              ชื่อที่แสดง <span style={{ color: '#F97316' }}>*</span>
            </label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="ชื่อของคุณ" maxLength={30}
              style={{
                width: '100%', padding: '13px 16px', borderRadius: 13,
                border: '1.5px solid #e5e7eb', fontSize: 15,
                fontFamily: 'Space Grotesk, sans-serif', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#F97316'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <span style={{ fontSize: 11, color: '#bbb', fontWeight: 500 }}>{name.length}/30</span>
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 7 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button type="button" onClick={handleSave} disabled={saving || !name.trim()} style={{
            width: '100%', padding: 14, borderRadius: 14, border: 'none',
            backgroundColor: saved ? '#10b981' : (name.trim() ? '#F97316' : '#e5e7eb'),
            color: '#fff', fontSize: 15, fontWeight: 800,
            cursor: name.trim() ? 'pointer' : 'not-allowed',
            fontFamily: 'Space Grotesk, sans-serif', transition: 'background 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {saved ? <><Check size={16} /> บันทึกแล้ว</> : saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
