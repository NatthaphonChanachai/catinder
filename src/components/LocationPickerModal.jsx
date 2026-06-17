import { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, MapPin, Loader2, Check } from 'lucide-react'
import { getCurrentPosition, searchAddress, reverseGeocode } from '../utils/geo'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })

const DEFAULT_CENTER = { lat: 13.7563, lng: 100.5018 } // Bangkok

function ClickHandler({ onPick }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng) } })
  return null
}

export default function LocationPickerModal({ open, initialLat, initialLng, onConfirm, onClose }) {
  const [position, setPosition] = useState(
    initialLat != null && initialLng != null ? { lat: initialLat, lng: initialLng } : DEFAULT_CENTER
  )
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [address, setAddress] = useState('')
  const [resolvingAddress, setResolvingAddress] = useState(false)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setPosition(initialLat != null && initialLng != null ? { lat: initialLat, lng: initialLng } : DEFAULT_CENTER)
    setResults([])
    setQuery('')
  }, [open, initialLat, initialLng])

  useEffect(() => {
    if (!open) return
    setResolvingAddress(true)
    reverseGeocode(position.lat, position.lng)
      .then(setAddress)
      .catch(() => setAddress(''))
      .finally(() => setResolvingAddress(false))
  }, [position, open])

  if (!open) return null

  const flyTo = (lat, lng, zoom = 16) => {
    setPosition({ lat, lng })
    mapRef.current?.flyTo([lat, lng], zoom)
  }

  const handleUseMyLocation = async () => {
    try {
      const { lat, lng } = await getCurrentPosition({ enableHighAccuracy: true, timeout: 8000 })
      flyTo(lat, lng)
    } catch { /* ignore — user can still pick manually */ }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    try {
      setResults(await searchAddress(query))
    } catch { setResults([]) }
    setSearching(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 4000,
          backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 16,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          onClick={e => e.stopPropagation()}
          style={{
            backgroundColor: '#fff', borderRadius: 22, width: '100%', maxWidth: 560,
            maxHeight: '90dvh', display: 'flex', flexDirection: 'column', overflowY: 'auto',
            fontFamily: 'Space Grotesk, sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 12px' }}>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: '#1C1917', margin: 0 }}>เลือกตำแหน่งบนแผนที่</h2>
            <button onClick={onClose} style={{
              width: 30, height: 30, borderRadius: '50%', border: 'none', backgroundColor: '#f5f5f4',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}><X size={14} color="#888" /></button>
          </div>

          <div style={{ padding: '0 18px 12px', display: 'flex', gap: 8 }}>
            <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: 8 }}>
              <input
                type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="ค้นหาที่อยู่ เช่น สยามพารากอน, เชียงใหม่..."
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 11,
                  border: '1.5px solid #E7E5E4', fontSize: 13.5,
                  fontFamily: 'Space Grotesk, sans-serif', outline: 'none',
                }}
              />
              <button type="submit" disabled={searching} style={{
                width: 40, borderRadius: 11, border: 'none',
                background: 'linear-gradient(135deg,#F97316,#F59E0B)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
              }}>
                {searching ? <Loader2 size={15} className="spin" style={{ animation: 'spin 0.8s linear infinite' }} /> : <Search size={15} />}
              </button>
            </form>
            <button type="button" onClick={handleUseMyLocation} title="ใช้ตำแหน่งปัจจุบัน" style={{
              width: 40, borderRadius: 11, border: '1.5px solid rgba(249,115,22,0.30)',
              backgroundColor: '#FFF7ED', color: '#F97316', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}><MapPin size={15} /></button>
          </div>

          {results.length > 0 && (
            <div style={{ padding: '0 18px 12px', display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 140, overflowY: 'auto' }}>
              {results.map((r, i) => (
                <button key={i} type="button" onClick={() => { flyTo(r.lat, r.lng); setResults([]) }} style={{
                  textAlign: 'left', padding: '8px 11px', borderRadius: 10,
                  border: '1px solid #eee', backgroundColor: '#FAFAF9', cursor: 'pointer',
                  fontSize: 12.5, color: '#44403C', fontFamily: 'Space Grotesk, sans-serif',
                }}>{r.label}</button>
              ))}
            </div>
          )}

          <div style={{ height: 360, position: 'relative', flexShrink: 0 }}>
            <MapContainer
              center={[position.lat, position.lng]} zoom={14} style={{ height: 360, width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <ClickHandler onPick={(lat, lng) => setPosition({ lat, lng })} />
              <Marker
                position={[position.lat, position.lng]}
                draggable
                eventHandlers={{ dragend: e => { const p = e.target.getLatLng(); setPosition({ lat: p.lat, lng: p.lng }) } }}
              />
            </MapContainer>
          </div>

          <div style={{ padding: '12px 18px 18px' }}>
            <p style={{ fontSize: 11.5, color: '#A8A29E', fontWeight: 500, marginBottom: 10, lineHeight: 1.5 }}>
              📍 {resolvingAddress ? 'กำลังค้นหาที่อยู่...' : (address || `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`)}
            </p>
            <button
              type="button"
              onClick={() => onConfirm({ lat: position.lat, lng: position.lng, address })}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 13, border: 'none',
                background: 'linear-gradient(135deg,#F97316,#F59E0B)', color: '#fff',
                fontSize: 13.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              }}
            ><Check size={14} /> ใช้ตำแหน่งนี้</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
