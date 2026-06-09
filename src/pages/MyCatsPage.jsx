import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { Plus, Edit2, Trash2, Cat, Syringe, Scissors, ClipboardList, ArrowRight } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

const LOOKING_FOR_LABELS = {
  mate: 'หาคู่',
  friend: 'หาเพื่อน',
  adopt: 'หาบ้าน',
  any: 'ทุกอย่าง',
}

export default function MyCatsPage() {
  const { user } = useAuth()
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const navigate = useNavigate()

  const load = async () => {
    if (!user) return
    setLoading(true)
    setLoadError('')
    try {
      const snap = await getDocs(query(collection(db, 'cats'), where('ownerId', '==', user.uid)))
      const sorted = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setCats(sorted)
    } catch (e) {
      console.error('MyCatsPage load error:', e)
      setLoadError(e.message || 'โหลดข้อมูลไม่ได้')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const handleDelete = async (catId, catName) => {
    if (!confirm(`ลบโปรไฟล์ "${catName}" ใช่ไหม?`)) return
    await deleteDoc(doc(db, 'cats', catId))
    setCats(prev => prev.filter(c => c.id !== catId))
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#f8f8f8', fontFamily: 'Space Grotesk, sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#000', marginBottom: 2 }}>น้องแมวของฉัน</h1>
            <p style={{ fontSize: 13, color: '#aaa', fontWeight: 500 }}>จัดการโปรไฟล์แมวทุกตัว</p>
          </div>
          <Link
            to="/my-cats/new"
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              backgroundColor: '#F97316', color: '#fff',
              padding: '10px 18px', borderRadius: 11,
              textDecoration: 'none', fontSize: 13, fontWeight: 800,
              boxShadow: '0 4px 14px rgba(249,115,22,0.3)',
              whiteSpace: 'nowrap',
            }}
          >
            <Plus size={14} /> เพิ่มแมว
          </Link>
        </div>

        {loadError && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            โหลดไม่สำเร็จ: {loadError}
            <button onClick={load} style={{ marginLeft: 10, fontSize: 12, fontWeight: 700, color: '#dc2626', background: 'none', border: '1px solid #dc2626', borderRadius: 7, padding: '2px 10px', cursor: 'pointer' }}>ลองใหม่</button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>กำลังโหลด...</div>
        ) : cats.length === 0 && !loadError ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#fff', borderRadius: 18, border: '2px dashed #e5e7eb' }}
          >
            <div style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Cat size={32} color="#F97316" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#000', marginBottom: 8 }}>ยังไม่มีโปรไฟล์แมว</h3>
            <p style={{ fontSize: 13, color: '#888', fontWeight: 500, marginBottom: 20 }}>สร้างโปรไฟล์น้องแมวเพื่อเริ่ม Discover</p>
            <Link to="/my-cats/new" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              backgroundColor: '#F97316', color: '#fff',
              padding: '11px 24px', borderRadius: 11,
              textDecoration: 'none', fontSize: 14, fontWeight: 800,
            }}>
              <Plus size={14} /> สร้างโปรไฟล์แมวแรก
            </Link>
          </motion.div>
        ) : cats.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {cats.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid #f0f0f0' }}
              >
                <div style={{
                  height: 170, backgroundColor: '#f5f5f5',
                  backgroundImage: cat.photoURL ? `url(${cat.photoURL})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}>
                  {!cat.photoURL && <Cat size={48} color="#ddd" />}
                  {cat.lookingFor && (
                    <div style={{
                      position: 'absolute', top: 10, left: 10,
                      backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                      color: '#fff', fontSize: 11, fontWeight: 700,
                      padding: '3px 10px', borderRadius: 999,
                    }}>
                      {LOOKING_FOR_LABELS[cat.lookingFor] || cat.lookingFor}
                    </div>
                  )}
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#000', marginBottom: 1 }}>
                        {cat.name} <span style={{ fontWeight: 500, fontSize: 14 }}>{cat.gender === 'male' ? '(ตัวผู้)' : '(ตัวเมีย)'}</span>
                      </h3>
                      <p style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>
                        {cat.breed}{cat.ageYears > 0 ? ` · ${cat.ageYears} ปี` : ''}{cat.ageMonths > 0 ? ` ${cat.ageMonths} เดือน` : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                      {cat.vaccinated && <div title="ฉีดวัคซีนแล้ว" style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Syringe size={12} color="#10b981" /></div>}
                      {cat.sterilized && <div title="ทำหมันแล้ว" style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Scissors size={12} color="#8b5cf6" /></div>}
                    </div>
                  </div>

                  {cat.description && (
                    <p style={{
                      fontSize: 12, color: '#666', lineHeight: 1.5, marginBottom: 12, fontWeight: 500,
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>{cat.description}</p>
                  )}

                  <div style={{ display: 'flex', gap: 7 }}>
                    <button onClick={() => navigate(`/my-cats/${cat.id}/health`)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      padding: '8px', borderRadius: 9, border: '1.5px solid #e5e7eb',
                      backgroundColor: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#555',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#555' }}
                    >
                      <ClipboardList size={13} />
                    </button>
                    <button onClick={() => navigate(`/my-cats/${cat.id}/edit`)} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '8px', borderRadius: 9, border: '1.5px solid #e5e7eb',
                      backgroundColor: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#333',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.color = '#F97316' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#333' }}
                    >
                      <Edit2 size={13} /> แก้ไข
                    </button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} style={{
                      width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 9, border: '1.5px solid #fecaca', backgroundColor: '#fff', cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                    >
                      <Trash2 size={13} color="#ef4444" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
