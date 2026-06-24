import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { Send, ArrowLeft, MessageCircle, Compass, PawPrint } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

const COPY = {
  th: {
    matchAndChat: 'Match & แชท',
    conversationsCount: (n) => `${n} การสนทนา`,
    noMatchYet: 'ยังไม่มี Match',
    goDiscover: 'ไป Discover เพื่อ Match กับแมวตัวอื่น',
    discover: 'Discover',
    unknown: 'ไม่ทราบ',
    justMatched: 'เพิ่ง Match',
    selectConversation: 'เลือกการสนทนา',
    selectMatchToChat: 'เลือก Match จากรายการเพื่อเริ่มแชท',
    newMatch: 'Match ใหม่!',
    sendFirstMessage: (name) => `ส่งข้อความแรกให้กับ ${name}`,
    match: 'Match',
    messagePlaceholder: (name) => `ข้อความถึง ${name}...`,
    today: 'วันนี้',
    yesterday: 'เมื่อวาน',
  },
  en: {
    matchAndChat: 'Matches & Chat',
    conversationsCount: (n) => `${n} conversation${n === 1 ? '' : 's'}`,
    noMatchYet: 'No matches yet',
    goDiscover: 'Go to Discover to match with other cats',
    discover: 'Discover',
    unknown: 'Unknown',
    justMatched: 'Just matched',
    selectConversation: 'Select a conversation',
    selectMatchToChat: 'Pick a match from the list to start chatting',
    newMatch: 'New match!',
    sendFirstMessage: (name) => `Send the first message to ${name}`,
    match: 'Match',
    messagePlaceholder: (name) => `Message ${name}...`,
    today: 'Today',
    yesterday: 'Yesterday',
  },
}

function formatTime(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(ts, c) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const diff = Date.now() - d.getTime()
  if (diff < 86400000) return c.today
  if (diff < 172800000) return c.yesterday
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}

export default function ChatPage() {
  const { user, userProfile } = useAuth()
  const { lang } = useLanguage()
  const c = COPY[lang]
  const { chatId: routeChatId } = useParams()
  const navigate = useNavigate()

  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(routeChatId || null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [showSidebar, setShowSidebar] = useState(!routeChatId)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid))
    return onSnapshot(q, snap => {
      const sorted = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.lastMessageAt?.seconds || b.createdAt?.seconds || 0) - (a.lastMessageAt?.seconds || a.createdAt?.seconds || 0))
      setChats(sorted)
    })
  }, [user])

  useEffect(() => {
    if (!activeChatId) { setMessages([]); return }
    const q = query(collection(db, 'chats', activeChatId, 'messages'), orderBy('createdAt', 'asc'))
    return onSnapshot(q, snap => setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [activeChatId])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { if (routeChatId) { setActiveChatId(routeChatId); setShowSidebar(false) } }, [routeChatId])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!text.trim() || !activeChatId || sending) return
    setSending(true)
    const msg = text.trim()
    setText('')
    try {
      await addDoc(collection(db, 'chats', activeChatId, 'messages'), { senderId: user.uid, text: msg, createdAt: serverTimestamp() })
      await updateDoc(doc(db, 'chats', activeChatId), { lastMessage: msg, lastMessageAt: serverTimestamp() })
    } catch (e) { console.error(e) }
    setSending(false)
  }

  const activeChat = chats.find(c => c.id === activeChatId)
  const otherUid = activeChat?.participants?.find(id => id !== user?.uid)
  const otherName = otherUid ? (activeChat?.participantNames?.[otherUid] || c.unknown) : ''
  const otherPhoto = otherUid ? (activeChat?.participantPhotos?.[otherUid] || '') : ''

  const openChat = (chatId) => {
    setActiveChatId(chatId)
    setShowSidebar(false)
    navigate(`/chat/${chatId}`)
    localStorage.setItem(`lastSeenChat_${user.uid}`, Date.now().toString())
  }

  return (
    <div style={{
      height: 'calc(100dvh - 60px)',
      display: 'flex', backgroundColor: '#f8f8f8',
      fontFamily: 'Space Grotesk, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Sidebar */}
      <div style={{
        width: 280, flexShrink: 0,
        backgroundColor: '#fff', borderRight: '1px solid #f0f0f0',
        display: 'flex', flexDirection: 'column',
        // mobile: show/hide based on showSidebar
        ...(typeof window !== 'undefined' && window.innerWidth < 640 ? {
          position: 'absolute', left: showSidebar ? 0 : '-100%', top: 0, bottom: 0, zIndex: 10,
          width: '100%', transition: 'left 0.25s',
        } : {}),
      }} className={showSidebar ? 'chat-sidebar open' : 'chat-sidebar'}>
        <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: 17, fontWeight: 900, color: '#000', marginBottom: 1 }}>{c.matchAndChat}</h2>
          <p style={{ fontSize: 12, color: '#aaa', fontWeight: 500 }}>{c.conversationsCount(chats.length)}</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <MessageCircle size={24} color="#F97316" />
              </div>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#000', marginBottom: 5 }}>{c.noMatchYet}</p>
              <p style={{ fontSize: 12, color: '#aaa', fontWeight: 500, lineHeight: 1.5, marginBottom: 14 }}>{c.goDiscover}</p>
              <Link to="/discover" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                backgroundColor: '#F97316', color: '#fff',
                padding: '9px 18px', borderRadius: 9,
                textDecoration: 'none', fontSize: 12, fontWeight: 800,
              }}>
                <Compass size={13} /> {c.discover}
              </Link>
            </div>
          ) : chats.map(chat => {
            const uid = chat.participants?.find(id => id !== user?.uid)
            const name = chat.participantNames?.[uid] || c.unknown
            const photo = chat.participantPhotos?.[uid] || ''
            const active = chat.id === activeChatId
            return (
              <button key={chat.id} onClick={() => openChat(chat.id)} style={{
                width: '100%', padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 11,
                background: active ? '#FFF7ED' : 'transparent',
                borderLeft: active ? '3px solid #F97316' : '3px solid transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.15s', borderBottom: '1px solid #f9f9f9',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = '#f9f9f9' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  backgroundColor: '#f5f5f5',
                  backgroundImage: photo ? `url(${photo})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: active ? '2px solid #F97316' : '2px solid transparent',
                }}>
                  {!photo && <PawPrint size={18} color="#ddd" />}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#000' }}>{name}</div>
                  <div style={{ fontSize: 11, color: '#aaa', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chat.lastMessage || c.justMatched}
                  </div>
                </div>
                {chat.lastMessageAt && (
                  <div style={{ fontSize: 10, color: '#bbb', fontWeight: 600, flexShrink: 0 }}>{formatDate(chat.lastMessageAt, c)}</div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {!activeChatId ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <MessageCircle size={36} color="#F97316" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#000', marginBottom: 6 }}>{c.selectConversation}</h3>
            <p style={{ fontSize: 13, color: '#aaa', fontWeight: 500 }}>{c.selectMatchToChat}</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{ padding: '14px 18px', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <button onClick={() => { setActiveChatId(null); setShowSidebar(true); navigate('/chat') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
              >
                <ArrowLeft size={17} color="#888" />
              </button>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0, backgroundColor: '#f5f5f5',
                backgroundImage: otherPhoto ? `url(${otherPhoto})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {!otherPhoto && <PawPrint size={16} color="#ddd" />}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#000' }}>{otherName}</div>
                <div style={{ fontSize: 10, color: '#10b981', fontWeight: 700 }}>{c.match}</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <MessageCircle size={24} color="#F97316" />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#000', marginBottom: 4 }}>{c.newMatch}</p>
                  <p style={{ fontSize: 12, color: '#aaa', fontWeight: 500 }}>{c.sendFirstMessage(otherName)}</p>
                </div>
              )}

              {messages.map((msg, i) => {
                const isMe = msg.senderId === user?.uid
                const prev = messages[i - 1]
                const showDate = !prev || (msg.createdAt && prev.createdAt && Math.abs((msg.createdAt.seconds || 0) - (prev.createdAt.seconds || 0)) > 3600)
                return (
                  <div key={msg.id}>
                    {showDate && msg.createdAt && (
                      <div style={{ textAlign: 'center', margin: '12px 0 8px', fontSize: 11, color: '#bbb', fontWeight: 600 }}>{formatDate(msg.createdAt, c)}</div>
                    )}
                    <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 5 }}>
                      <div style={{
                        maxWidth: '72%', padding: '9px 13px',
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        backgroundColor: isMe ? '#F97316' : '#fff',
                        color: isMe ? '#fff' : '#000',
                        fontSize: 14, fontWeight: 500, lineHeight: 1.5,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                        wordBreak: 'break-word',
                      }}>
                        {msg.text}
                        <div style={{ fontSize: 10, marginTop: 3, textAlign: 'right', color: isMe ? 'rgba(255,255,255,0.6)' : '#bbb', fontWeight: 600 }}>
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={{ padding: '12px 16px 16px', backgroundColor: '#fff', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 9, alignItems: 'center', flexShrink: 0 }}>
              <input
                type="text" value={text} onChange={e => setText(e.target.value)}
                placeholder={c.messagePlaceholder(otherName)}
                style={{
                  flex: 1, padding: '11px 15px', borderRadius: 999,
                  border: '1.5px solid #e5e7eb', fontSize: 14,
                  fontFamily: 'Space Grotesk, sans-serif', outline: 'none',
                  transition: 'border-color 0.2s', backgroundColor: '#fafafa',
                  minWidth: 0,
                }}
                onFocus={e => e.target.style.borderColor = '#F97316'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              <motion.button type="submit" disabled={!text.trim() || sending} whileTap={{ scale: 0.9 }}
                style={{
                  width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                  backgroundColor: text.trim() ? '#F97316' : '#e5e7eb',
                  border: 'none', cursor: text.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
              >
                <Send size={16} color="#fff" />
              </motion.button>
            </form>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .chat-sidebar { position: fixed !important; width: 100% !important; transition: left 0.25s !important; z-index: 10; }
          .chat-sidebar:not(.open) { left: -100% !important; }
          .chat-sidebar.open { left: 0 !important; }
        }
      `}</style>
    </div>
  )
}
