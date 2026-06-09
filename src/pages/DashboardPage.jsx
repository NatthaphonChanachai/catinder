import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { Compass, PawPrint, MessageCircle, MapPin, Heart, Plus, ArrowRight, Cat } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

const QUICK_ACTIONS = [
  { path: '/discover', icon: Compass, label: 'Discover', desc: 'Swipe เจอแมวน่ารักใกล้คุณ', color: '#F97316', bg: '#FFF7ED', border: '#fed7aa' },
  { path: '/my-cats', icon: PawPrint, label: 'แมวของฉัน', desc: 'จัดการโปรไฟล์น้องแมว', color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd' },
  { path: '/chat', icon: MessageCircle, label: 'แชทและ Match', desc: 'คุยกับพ่อแม่แมวที่ match', color: '#10b981', bg: '#f0fdf4', border: '#a7f3d0' },
  { path: '/directory', icon: MapPin, label: 'ไดเรกทอรี', desc: 'ค้นหาสถานที่เกี่ยวกับแมว', color: '#8b5cf6', bg: '#faf5ff', border: '#ddd6fe' },
]

export default function DashboardPage() {
  const { user, userProfile } = useAuth()
  const [stats, setStats] = useState({ cats: 0, matches: 0 })
  const [myCats, setMyCats] = useState([])

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const [catsSnap, matchSnap] = await Promise.all([
          getDocs(query(collection(db, 'cats'), where('ownerId', '==', user.uid))),
          getDocs(query(collection(db, 'matches'), where('users', 'array-contains', user.uid))),
        ])
        const sorted = catsSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 4)
        setMyCats(sorted)
        setStats({ cats: catsSnap.size, matches: matchSnap.size })
      } catch (_) {}
    }
    load()
  }, [user])

  const displayName = userProfile?.displayName || user?.email?.split('@')[0] || 'คุณ'

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#f8f8f8', fontFamily: 'Space Grotesk, sans-serif' }}>
      {/* Header bar */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', padding: '20px 20px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ fontSize: 12, color: '#aaa', fontWeight: 600, marginBottom: 2 }}>ยินดีต้อนรับ</p>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#000' }}>{displayName}</h1>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px 60px' }}>
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}
        >
          <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: '16px 18px', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PawPrint size={18} color="#F97316" />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#000', lineHeight: 1 }}>{stats.cats}</div>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 600, marginTop: 2 }}>น้องแมว</div>
              </div>
            </div>
          </div>
          <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: '16px 18px', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={18} color="#ef4444" />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#000', lineHeight: 1 }}>{stats.matches}</div>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 600, marginTop: 2 }}>Matches</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#888', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>เมนู</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 28 }}>
            {QUICK_ACTIONS.map(({ path, icon: Icon, label, desc, color, bg, border }) => (
              <Link
                key={path}
                to={path}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 10,
                  padding: '16px', borderRadius: 16,
                  backgroundColor: '#fff', textDecoration: 'none',
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${border}`; e.currentTarget.style.backgroundColor = bg }}
                onMouseLeave={e => { e.currentTarget.style.border = '1px solid #f0f0f0'; e.currentTarget.style.backgroundColor = '#fff' }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 11, backgroundColor: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={19} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#000', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 12, color: '#999', fontWeight: 500, lineHeight: 1.4 }}>{desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* My cats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#888', letterSpacing: '0.06em', textTransform: 'uppercase' }}>น้องแมวของฉัน</h2>
            <Link to="/my-cats" style={{ fontSize: 12, fontWeight: 700, color: '#F97316', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              ดูทั้งหมด <ArrowRight size={12} />
            </Link>
          </div>

          {myCats.length === 0 ? (
            <Link to="/my-cats/new" style={{ textDecoration: 'none' }}>
              <div style={{
                border: '2px dashed #e5e7eb', borderRadius: 16,
                padding: '28px 20px', textAlign: 'center',
                backgroundColor: '#fff', cursor: 'pointer', transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#F97316'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Cat size={24} color="#F97316" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#000', marginBottom: 5 }}>เพิ่มโปรไฟล์แมวตัวแรก</div>
                <div style={{ fontSize: 12, color: '#888', fontWeight: 500, marginBottom: 16 }}>สร้างโปรไฟล์น้องแมวเพื่อเริ่ม Discover</div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  backgroundColor: '#F97316', color: '#fff',
                  padding: '9px 18px', borderRadius: 999,
                  fontSize: 13, fontWeight: 800,
                }}>
                  <Plus size={13} /> เพิ่มแมว
                </div>
              </div>
            </Link>
          ) : (
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {myCats.map(cat => (
                <Link key={cat.id} to={`/my-cats/${cat.id}/edit`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                  <div style={{
                    width: 110, borderRadius: 14, overflow: 'hidden',
                    backgroundColor: '#fff', border: '1px solid #f0f0f0',
                  }}>
                    <div style={{
                      height: 90, backgroundColor: '#f5f5f5',
                      backgroundImage: cat.photoURL ? `url(${cat.photoURL})` : 'none',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {!cat.photoURL && <Cat size={32} color="#ccc" />}
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</div>
                      <div style={{ fontSize: 11, color: '#aaa', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.breed}</div>
                    </div>
                  </div>
                </Link>
              ))}
              <Link to="/my-cats/new" style={{
                width: 110, height: 135, borderRadius: 14,
                border: '2px dashed #e5e7eb', textDecoration: 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 5, flexShrink: 0, color: '#bbb', fontSize: 11, fontWeight: 700, backgroundColor: '#fff',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#F97316'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <Plus size={22} /> เพิ่มแมว
              </Link>
            </div>
          )}
        </motion.div>

        {/* Match banner */}
        {stats.matches > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginTop: 24 }}>
            <Link to="/chat" style={{ textDecoration: 'none' }}>
              <div style={{
                backgroundColor: '#000', borderRadius: 16, padding: '18px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={20} color="#F97316" fill="#F97316" />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>คุณมี {stats.matches} Match</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>เริ่มพูดคุยกับพ่อแม่แมวได้เลย</div>
                  </div>
                </div>
                <ArrowRight size={18} color="rgba(255,255,255,0.4)" />
              </div>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
