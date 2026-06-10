import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  collection, query, orderBy, onSnapshot, addDoc,
  doc, setDoc, updateDoc, serverTimestamp, getDoc,
} from 'firebase/firestore'
import { Send, Headphones, ArrowLeft } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

function formatTime(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

export default function SupportChatPage() {
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const messagesEndRef = useRef(null)

  // Ensure support chat doc exists
  useEffect(() => {
    if (!user) return
    async function init() {
      try {
        const ref = doc(db, 'supportChats', user.uid)
        const snap = await getDoc(ref)
        if (!snap.exists()) {
          await setDoc(ref, {
            userId: user.uid,
            userName: userProfile?.displayName || user.email?.split('@')[0] || 'ไม่ระบุ',
            userPhoto: userProfile?.photoURL || '',
            userEmail: user.email || '',
            lastMessage: '',
            lastMessageAt: serverTimestamp(),
            unreadAdmin: 0,
            createdAt: serverTimestamp(),
          })
        }
      } catch (err) {
        console.error('supportChat init error:', err)
      } finally {
        setInitialized(true)
      }
    }
    init()
  }, [user, userProfile])

  useEffect(() => {
    if (!user || !initialized) return
    const q = query(collection(db, 'supportChats', user.uid, 'messages'), orderBy('createdAt', 'asc'))
    return onSnapshot(
      q,
      snap => {
        const serverMsgs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setMessages(prev => {
          const temps = prev.filter(m => m.id.startsWith('temp_'))
          // ถ้า server ส่งข้อมูลกลับแล้ว ลบ temp ออก
          return serverMsgs.length > 0 ? serverMsgs : [...serverMsgs, ...temps]
        })
      },
      err => console.error('messages listener error:', err)
    )
  }, [user, initialized])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim() || sending || !initialized) return
    setSending(true)
    const msg = text.trim()
    setText('')

    // Optimistic update — ขึ้นทันทีไม่รอ server
    const tempId = `temp_${Date.now()}`
    setMessages(prev => [...prev, {
      id: tempId, senderId: user.uid, text: msg, isAdmin: false,
      createdAt: { toDate: () => new Date() },
    }])

    try {
      const chatRef = doc(db, 'supportChats', user.uid)
      // Upsert chat doc in case init failed silently
      await setDoc(chatRef, {
        userId: user.uid,
        userName: userProfile?.displayName || user.email?.split('@')[0] || 'ไม่ระบุ',
        userPhoto: userProfile?.photoURL || '',
        userEmail: user.email || '',
        lastMessage: msg,
        lastMessageAt: serverTimestamp(),
        unreadAdmin: messages.filter(m => !m.isAdmin).length + 1,
        createdAt: serverTimestamp(),
      }, { merge: true })
      await addDoc(collection(db, 'supportChats', user.uid, 'messages'), {
        senderId: user.uid,
        text: msg,
        isAdmin: false,
        createdAt: serverTimestamp(),
      })
    } catch (err) { console.error('send error:', err) }
    setSending(false)
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      backgroundColor: '#f8f8f8', fontFamily: 'Space Grotesk, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0',
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 60, zIndex: 100,
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <ArrowLeft size={18} color="#888" />
        </button>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'linear-gradient(135deg, #F97316, #FBBF24)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Headphones size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#000' }}>ทีมงาน Catinder</div>
          <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>ออนไลน์ · ตอบภายใน 24 ชม.</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Welcome message */}
        <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, #F97316, #FBBF24)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px',
          }}>
            <Headphones size={24} color="#fff" />
          </div>
          <p style={{ fontSize: 13, color: '#888', fontWeight: 600, lineHeight: 1.7 }}>
            สวัสดี! ทีมงาน Catinder พร้อมช่วยเหลือคุณ<br />
            ถามได้เลยเรื่อง การยืนยันเอกสาร, การจับคู่, หรืออื่นๆ
          </p>
        </div>

        {messages.map((msg, i) => {
          const isMe = !msg.isAdmin
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i < 3 ? 0 : 0 }}
              style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}
            >
              {!isMe && (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #F97316, #FBBF24)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Headphones size={13} color="#fff" />
                </div>
              )}
              <div style={{ maxWidth: '72%' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  backgroundColor: isMe ? '#F97316' : '#fff',
                  color: isMe ? '#fff' : '#000',
                  fontSize: 14, fontWeight: 500, lineHeight: 1.5,
                  boxShadow: isMe ? '0 2px 8px rgba(249,115,22,0.3)' : '0 1px 4px rgba(0,0,0,0.07)',
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: 10, color: '#bbb', fontWeight: 600, marginTop: 3, textAlign: isMe ? 'right' : 'left' }}>
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </motion.div>
          )
        })}

        {messages.length === 0 && initialized && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {['สอบถามการยืนยันเอกสาร Pedigree', 'มีปัญหาการ Match กับแมวตัวอื่น', 'อยากสมัคร Premium'].map((q, i) => (
              <button
                key={i}
                onClick={() => setText(q)}
                style={{
                  padding: '10px 16px', borderRadius: 12,
                  border: '1.5px solid #e5e7eb', backgroundColor: '#fff',
                  color: '#555', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'Space Grotesk, sans-serif',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.color = '#F97316' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#555' }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} style={{
        padding: '12px 16px', backgroundColor: '#fff',
        borderTop: '1px solid #f0f0f0', display: 'flex', gap: 10, alignItems: 'center',
        position: 'sticky', bottom: 0,
      }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="พิมพ์ข้อความ..."
          style={{
            flex: 1, padding: '11px 16px', borderRadius: 999,
            border: '1.5px solid #e5e7eb', fontSize: 14,
            fontFamily: 'Space Grotesk, sans-serif', outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = '#F97316'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
        <button type="submit" disabled={!text.trim() || sending} style={{
          width: 44, height: 44, borderRadius: '50%', border: 'none',
          backgroundColor: text.trim() ? '#F97316' : '#e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: text.trim() ? 'pointer' : 'not-allowed', flexShrink: 0,
          transition: 'background 0.2s',
          boxShadow: text.trim() ? '0 3px 10px rgba(249,115,22,0.35)' : 'none',
        }}>
          <Send size={17} color="#fff" />
        </button>
      </form>
    </div>
  )
}
