import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
  query, orderBy, where, getDocs, getDoc,
} from 'firebase/firestore'
import {
  Shield, Plus, Pencil, Trash2, X, Check, Users, Building2,
  Home, Coffee, HeartPulse, Stethoscope, Fish, TreePine, MapPin, Phone,
  FileText, ShieldCheck, AlertCircle, Clock, Eye, Headphones, Send,
  CalendarDays, CheckCircle, XCircle, ToggleLeft, ToggleRight,
  PawPrint, Search, Syringe, Scissors, Heart, Hotel, Loader2,
} from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { loadProvinces } from '../utils/thailandGeo'
import { searchAddress } from '../utils/geo'

const VENUE_FACILITIES = ['ac', 'cctv', 'wifi', 'vet_nearby', 'separate_rooms', 'playground']
const VENUE_FACILITY_LABELS = {
  th: { ac: 'แอร์', cctv: 'CCTV', wifi: 'Wi-Fi', vet_nearby: 'คลินิกใกล้', separate_rooms: 'ห้องแยก', playground: 'สนามเล่น' },
  en: { ac: 'AC', cctv: 'CCTV', wifi: 'Wi-Fi', vet_nearby: 'Vet Nearby', separate_rooms: 'Separate Rooms', playground: 'Play Area' },
}
const EMPTY_VENUE = { name: '', location: '', province: 'กรุงเทพมหานคร', description: '', price: 0, priceUnit: 'night', facilities: [], photoURL: '', isActive: true }

const COPY = {
  th: {
    // VenueFormModal
    editVenueTitle: 'แก้ไขสถานที่',
    addVenueTitle: 'เพิ่มสถานที่ใหม่',
    venueNameLabel: 'ชื่อสถานที่ *',
    venueNamePlaceholder: 'เช่น Cat Villa บางนา',
    addressLabel: 'ที่อยู่',
    addressPlaceholder: 'เช่น บางนา กรุงเทพฯ',
    provinceLabel: 'จังหวัด',
    provincePlaceholder: 'กรุงเทพมหานคร',
    photoUrlLabel: 'URL รูปภาพ',
    priceLabel: 'ราคา (บาท)',
    unitLabel: 'หน่วย',
    perNight: 'ต่อคืน',
    perSession: 'ต่อครั้ง',
    descriptionLabel: 'รายละเอียด',
    venueDescPlaceholder: 'รายละเอียดสถานที่...',
    facilitiesLabel: 'สิ่งอำนวยความสะดวก',
    bookingOpen: 'เปิดรับจอง',
    bookingClosed: 'ปิดรับจอง',
    saving: 'กำลังบันทึก...',
    saveEdit: 'บันทึกการแก้ไข',
    addVenue: 'เพิ่มสถานที่',
    // BookingBadge
    statusPending: 'รอยืนยัน',
    statusConfirmed: 'ยืนยันแล้ว',
    statusCancelled: 'ยกเลิก',
    statusCompleted: 'เสร็จสิ้น',
    // CATEGORIES
    catFarm: 'ฟาร์มแมว',
    catCafe: 'คาเฟ่แมว',
    catVet: 'โรงพยาบาลสัตว์',
    catClinic: 'คลินิก',
    catFood: 'ร้านอาหารแมว',
    catPlace: 'ที่เที่ยว Cat-Friendly',
    catHotel: 'โรงแรม (Cat Friendly)',
    // HotelLocationFields
    hotelLocationLabel: 'ที่ตั้งโรงแรม',
    loadingProvinces: 'กำลังโหลดข้อมูลจังหวัด...',
    selectProvince: 'จังหวัด',
    selectDistrict: 'อำเภอ/เขต',
    selectSubdistrict: 'ตำบล/แขวง',
    geocodeFillFirst: 'กรอกที่อยู่หรือเลือกจังหวัด/อำเภอก่อน',
    geocodeFound: (lat, lng) => `พบตำแหน่งแล้ว ✓ (${lat}, ${lng})`,
    geocodeNotFound: 'ไม่พบตำแหน่ง ลองแก้ไขที่อยู่',
    geocodeFailed: 'ค้นหาตำแหน่งไม่สำเร็จ',
    geocoding: 'กำลังค้นหา...',
    geocodeButton: 'ค้นหาตำแหน่งจากที่อยู่',
    // ListingModal
    editListingTitle: 'แก้ไขสถานที่',
    addListingTitle: 'เพิ่มสถานที่',
    listingNameLabel: 'ชื่อสถานที่ *',
    listingNamePlaceholder: 'ชื่อร้าน / สถานที่',
    phoneLabel: 'โทรศัพท์',
    websiteLabel: 'เว็บไซต์',
    categoryLabel: 'หมวดหมู่ *',
    catCostLabel: 'ค่าใช้จ่ายสำหรับแมว',
    stayFree: 'พักฟรี',
    stayPaid: 'เสียค่าใช้จ่าย',
    pricePerNightPlaceholder: 'ราคาต่อคืน (บาท)',
    listingDescPlaceholder: 'รายละเอียดเพิ่มเติม...',
    verified: 'Verified',
    // DocStatusBadge
    docPending: 'รอตรวจสอบ',
    docVerified: 'ยืนยันแล้ว',
    docRejected: 'ไม่ผ่าน',
    // SupportPanel
    rulesErrorTitle: 'Firestore Rules ไม่อนุญาตให้ Admin อ่าน supportChats',
    rulesErrorBody: 'ไปที่ Firebase Console → Firestore Database → Rules แล้วเพิ่ม rule นี้:',
    supportChatsCount: (n) => `Support Chats (${n})`,
    noConversationsYet: 'ยังไม่มีการสนทนา',
    unspecified: 'ไม่ระบุ',
    selectSupportChat: 'เลือก Support Chat ทางซ้าย',
    replyPlaceholder: 'ตอบกลับ...',
    // AdminPage - access denied
    adminOnlyTitle: 'เฉพาะ Admin เท่านั้น',
    adminOnlyBody: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้',
    // AdminPage - header
    adminPanelTitle: 'Admin Panel',
    adminPanelSubtitle: 'จัดการข้อมูล Catinder',
    // Tabs
    tabDirectory: 'Directory',
    tabCats: 'แมวทั้งหมด',
    tabUsers: 'ผู้ใช้',
    tabDocuments: 'เอกสาร',
    tabVenues: 'สถานที่',
    tabSupport: 'Support',
    // Directory tab
    itemsCount: (n) => `${n} รายการ`,
    addPlace: 'เพิ่มสถานที่',
    noListingsYet: 'ยังไม่มีรายการ',
    pressAddToStart: 'กดปุ่มเพิ่มสถานที่เพื่อเริ่มต้น',
    edit: 'แก้ไข',
    deleting: '...',
    delete: 'ลบ',
    // Documents tab
    docsSummary: (total, pending) => `${total} เอกสารทั้งหมด · ${pending} รอตรวจสอบ`,
    noPendingDocs: 'ยังไม่มีเอกสารรอตรวจสอบ',
    catLabel: 'แมว:',
    ownerLabel: 'เจ้าของ:',
    noteLabel: 'หมายเหตุ:',
    reasonLabel: 'เหตุผล:',
    viewDocument: 'ดูเอกสาร',
    confirm: 'ยืนยัน',
    rejectAction: 'ไม่ผ่าน',
    rejectReasonTitle: 'ระบุเหตุผลที่ไม่ผ่าน',
    rejectReasonSubtitle: (typeLabel, catName) => `เอกสาร: ${typeLabel} · ${catName}`,
    rejectReasonPlaceholder: 'เช่น เอกสารไม่ชัดเจน, ข้อมูลไม่ตรงกัน...',
    cancel: 'ยกเลิก',
    // Venues tab
    subTabVenues: 'สถานที่',
    subTabBookings: 'การจอง',
    venuesCount: (n) => `${n} สถานที่`,
    noVenuesYet: 'ยังไม่มีสถานที่ — กดเพิ่มสถานที่เพื่อเริ่มต้น',
    open: 'เปิดรับจอง',
    closed: 'ปิด',
    perSessionShort: 'ครั้ง',
    perNightShort: 'คืน',
    filterAll: 'ทั้งหมด',
    filterPending: 'รอยืนยัน',
    filterConfirmed: 'ยืนยันแล้ว',
    filterCompleted: 'เสร็จสิ้น',
    filterCancelled: 'ยกเลิก',
    noBookingsYet: 'ยังไม่มีการจอง',
    catNameLabel: 'น้องแมว:',
    // Cats tab
    lookingMate: 'หาคู่ผสมพันธุ์',
    lookingFriend: 'หาเพื่อนเล่น',
    lookingAdopt: 'หาบ้าน',
    lookingFoster: 'Foster',
    lookingSell: 'ขาย',
    lookingExchange: 'แลกเปลี่ยน',
    lookingAny: 'ทุกอย่าง',
    lookingOther: 'อื่นๆ',
    catSearchPlaceholder: 'ค้นหาชื่อแมว, สายพันธุ์, เจ้าของ, ที่อยู่...',
    catCountSuffix: (n, total) => `${n}/${total} ตัว`,
    noCatsFound: 'ไม่พบแมวที่ค้นหา',
    noCatsYet: 'ยังไม่มีแมวในระบบ',
    yearsUnit: 'ปี',
    monthsUnit: 'เดือน',
    female: '♀ ตัวเมีย',
    male: '♂ ตัวผู้',
    ownerInline: 'เจ้าของ:',
    ageInline: 'อายุ',
    weightUnit: 'กก.',
    vaccinated: 'วัคซีนครบ',
    sterilized: 'ทำหมันแล้ว',
    microchipped: 'ไมโครชิป',
    fivFelvTested: 'FIV/FeLV ✓',
    // Users tab
    usersCount: (n) => `${n} ผู้ใช้`,
    admin: 'Admin',
  },
  en: {
    // VenueFormModal
    editVenueTitle: 'Edit Venue',
    addVenueTitle: 'Add New Venue',
    venueNameLabel: 'Venue Name *',
    venueNamePlaceholder: 'e.g. Cat Villa Bangna',
    addressLabel: 'Address',
    addressPlaceholder: 'e.g. Bangna, Bangkok',
    provinceLabel: 'Province',
    provincePlaceholder: 'Bangkok',
    photoUrlLabel: 'Photo URL',
    priceLabel: 'Price (THB)',
    unitLabel: 'Unit',
    perNight: 'Per night',
    perSession: 'Per session',
    descriptionLabel: 'Description',
    venueDescPlaceholder: 'Venue description...',
    facilitiesLabel: 'Facilities',
    bookingOpen: 'Open for booking',
    bookingClosed: 'Closed for booking',
    saving: 'Saving...',
    saveEdit: 'Save Changes',
    addVenue: 'Add Venue',
    // BookingBadge
    statusPending: 'Pending',
    statusConfirmed: 'Confirmed',
    statusCancelled: 'Cancelled',
    statusCompleted: 'Completed',
    // CATEGORIES
    catFarm: 'Cat Farm',
    catCafe: 'Cat Cafe',
    catVet: 'Animal Hospital',
    catClinic: 'Clinic',
    catFood: 'Cat Food Shop',
    catPlace: 'Cat-Friendly Spot',
    catHotel: 'Hotel (Cat Friendly)',
    // HotelLocationFields
    hotelLocationLabel: 'Hotel Location',
    loadingProvinces: 'Loading provinces...',
    selectProvince: 'Province',
    selectDistrict: 'District',
    selectSubdistrict: 'Subdistrict',
    geocodeFillFirst: 'Enter an address or select a province/district first',
    geocodeFound: (lat, lng) => `Location found ✓ (${lat}, ${lng})`,
    geocodeNotFound: 'Location not found. Try editing the address',
    geocodeFailed: 'Failed to search location',
    geocoding: 'Searching...',
    geocodeButton: 'Find location from address',
    // ListingModal
    editListingTitle: 'Edit Listing',
    addListingTitle: 'Add Listing',
    listingNameLabel: 'Listing Name *',
    listingNamePlaceholder: 'Shop / place name',
    phoneLabel: 'Phone',
    websiteLabel: 'Website',
    categoryLabel: 'Category *',
    catCostLabel: 'Cost for cats',
    stayFree: 'Free stay',
    stayPaid: 'Paid',
    pricePerNightPlaceholder: 'Price per night (THB)',
    listingDescPlaceholder: 'Additional details...',
    verified: 'Verified',
    // DocStatusBadge
    docPending: 'Pending Review',
    docVerified: 'Verified',
    docRejected: 'Rejected',
    // SupportPanel
    rulesErrorTitle: 'Firestore Rules do not allow Admin to read supportChats',
    rulesErrorBody: 'Go to Firebase Console → Firestore Database → Rules and add this rule:',
    supportChatsCount: (n) => `Support Chats (${n})`,
    noConversationsYet: 'No conversations yet',
    unspecified: 'Unspecified',
    selectSupportChat: 'Select a support chat on the left',
    replyPlaceholder: 'Reply...',
    // AdminPage - access denied
    adminOnlyTitle: 'Admins Only',
    adminOnlyBody: 'You do not have permission to access this page',
    // AdminPage - header
    adminPanelTitle: 'Admin Panel',
    adminPanelSubtitle: 'Manage Catinder data',
    // Tabs
    tabDirectory: 'Directory',
    tabCats: 'All Cats',
    tabUsers: 'Users',
    tabDocuments: 'Documents',
    tabVenues: 'Venues',
    tabSupport: 'Support',
    // Directory tab
    itemsCount: (n) => `${n} listings`,
    addPlace: 'Add Listing',
    noListingsYet: 'No listings yet',
    pressAddToStart: 'Press Add Listing to get started',
    edit: 'Edit',
    deleting: '...',
    delete: 'Delete',
    // Documents tab
    docsSummary: (total, pending) => `${total} total documents · ${pending} pending review`,
    noPendingDocs: 'No documents pending review',
    catLabel: 'Cat:',
    ownerLabel: 'Owner:',
    noteLabel: 'Note:',
    reasonLabel: 'Reason:',
    viewDocument: 'View Document',
    confirm: 'Verify',
    rejectAction: 'Reject',
    rejectReasonTitle: 'Specify rejection reason',
    rejectReasonSubtitle: (typeLabel, catName) => `Document: ${typeLabel} · ${catName}`,
    rejectReasonPlaceholder: 'e.g. unclear document, mismatched info...',
    cancel: 'Cancel',
    // Venues tab
    subTabVenues: 'Venues',
    subTabBookings: 'Bookings',
    venuesCount: (n) => `${n} venues`,
    noVenuesYet: 'No venues yet — press Add Venue to get started',
    open: 'Open',
    closed: 'Closed',
    perSessionShort: 'session',
    perNightShort: 'night',
    filterAll: 'All',
    filterPending: 'Pending',
    filterConfirmed: 'Confirmed',
    filterCompleted: 'Completed',
    filterCancelled: 'Cancelled',
    noBookingsYet: 'No bookings yet',
    catNameLabel: 'Cat:',
    // Cats tab
    lookingMate: 'Looking for Mate',
    lookingFriend: 'Looking for Friend',
    lookingAdopt: 'Looking for Home',
    lookingFoster: 'Foster',
    lookingSell: 'For Sale',
    lookingExchange: 'Exchange',
    lookingAny: 'Anything',
    lookingOther: 'Other',
    catSearchPlaceholder: 'Search by cat name, breed, owner, location...',
    catCountSuffix: (n, total) => `${n}/${total} cats`,
    noCatsFound: 'No cats found',
    noCatsYet: 'No cats in the system yet',
    yearsUnit: 'yr',
    monthsUnit: 'mo',
    female: '♀ Female',
    male: '♂ Male',
    ownerInline: 'Owner:',
    ageInline: 'Age',
    weightUnit: 'kg',
    vaccinated: 'Fully Vaccinated',
    sterilized: 'Sterilized',
    microchipped: 'Microchipped',
    fivFelvTested: 'FIV/FeLV ✓',
    // Users tab
    usersCount: (n) => `${n} users`,
    admin: 'Admin',
  },
}

function VenueFormModal({ initial, onSave, onClose }) {
  const { lang } = useLanguage()
  const c = COPY[lang]
  const fl = VENUE_FACILITY_LABELS[lang]
  const [form, setForm] = useState(initial ? { ...EMPTY_VENUE, ...initial } : EMPTY_VENUE)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleFacility = (f) => setForm(prev => ({
    ...prev,
    facilities: prev.facilities?.includes(f) ? prev.facilities.filter(x => x !== f) : [...(prev.facilities || []), f],
  }))

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave({ ...form, price: Number(form.price) || 0 })
    setSaving(false)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 3000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        style={{ backgroundColor: '#fff', borderRadius: '22px 22px 0 0', width: '100%', maxWidth: 560, maxHeight: '90dvh', overflowY: 'auto', padding: '24px 22px 36px', fontFamily: 'Space Grotesk, sans-serif' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: '#000' }}>{initial?.id ? c.editVenueTitle : c.addVenueTitle}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={19} color="#888" /></button>
        </div>

        {[
          { key: 'name', label: c.venueNameLabel, placeholder: c.venueNamePlaceholder, type: 'text' },
          { key: 'location', label: c.addressLabel, placeholder: c.addressPlaceholder, type: 'text' },
          { key: 'province', label: c.provinceLabel, placeholder: c.provincePlaceholder, type: 'text' },
          { key: 'photoURL', label: c.photoUrlLabel, placeholder: 'https://...', type: 'url' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>{f.label}</label>
            <input type={f.type} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder}
              style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#F97316'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        ))}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>{c.priceLabel}</label>
            <input type="number" value={form.price || ''} onChange={e => set('price', e.target.value)} placeholder="0" min="0"
              style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#F97316'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>{c.unitLabel}</label>
            <select value={form.priceUnit} onChange={e => set('priceUnit', e.target.value)}
              style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}>
              <option value="night">{c.perNight}</option>
              <option value="session">{c.perSession}</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>{c.descriptionLabel}</label>
          <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder={c.venueDescPlaceholder} rows={3}
            style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#F97316'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 8 }}>{c.facilitiesLabel}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {VENUE_FACILITIES.map(f => {
              const active = form.facilities?.includes(f)
              return (
                <button key={f} onClick={() => toggleFacility(f)} style={{
                  padding: '7px 14px', borderRadius: 999, border: `1.5px solid ${active ? '#F97316' : '#e5e7eb'}`,
                  backgroundColor: active ? '#FFF7ED' : '#fff', color: active ? '#F97316' : '#555',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
                  transition: 'all 0.15s',
                }}>
                  {fl[f]}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer' }} onClick={() => set('isActive', !form.isActive)}>
          {form.isActive
            ? <ToggleRight size={24} color="#F97316" />
            : <ToggleLeft size={24} color="#bbb" />}
          <span style={{ fontSize: 13, fontWeight: 700, color: form.isActive ? '#F97316' : '#888', userSelect: 'none' }}>
            {form.isActive ? c.bookingOpen : c.bookingClosed}
          </span>
        </div>

        <button onClick={handleSave} disabled={saving || !form.name.trim()} style={{
          width: '100%', padding: 13, borderRadius: 13, border: 'none',
          backgroundColor: form.name.trim() ? '#F97316' : '#e5e7eb',
          color: '#fff', fontSize: 15, fontWeight: 800,
          cursor: form.name.trim() ? 'pointer' : 'not-allowed',
          fontFamily: 'Space Grotesk, sans-serif',
        }}>
          {saving ? c.saving : (initial?.id ? c.saveEdit : c.addVenue)}
        </button>
      </motion.div>
    </motion.div>
  )
}

function BookingBadge({ status }) {
  const { lang } = useLanguage()
  const c = COPY[lang]
  const map = {
    pending: { label: c.statusPending, color: '#92400e', bg: '#FEF3C7' },
    confirmed: { label: c.statusConfirmed, color: '#065f46', bg: '#D1FAE5' },
    cancelled: { label: c.statusCancelled, color: '#991b1b', bg: '#FEE2E2' },
    completed: { label: c.statusCompleted, color: '#1e40af', bg: '#DBEAFE' },
  }
  const s = map[status] || map.pending
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: s.color, backgroundColor: s.bg, padding: '3px 10px', borderRadius: 999 }}>
      {s.label}
    </span>
  )
}

const CATEGORY_ICONS = {
  farm: Home, cafe: Coffee, vet: HeartPulse, clinic: Stethoscope,
  food: Fish, place: TreePine, hotel: Hotel,
}

function getCategories(lang) {
  const c = COPY[lang]
  return [
    { id: 'farm', label: c.catFarm, icon: Home },
    { id: 'cafe', label: c.catCafe, icon: Coffee },
    { id: 'vet', label: c.catVet, icon: HeartPulse },
    { id: 'clinic', label: c.catClinic, icon: Stethoscope },
    { id: 'food', label: c.catFood, icon: Fish },
    { id: 'place', label: c.catPlace, icon: TreePine },
    { id: 'hotel', label: c.catHotel, icon: Hotel },
  ]
}

function getCatIcon(catId) {
  return CATEGORY_ICONS[catId] || Building2
}

const EMPTY_FORM = {
  name: '', category: 'cafe', address: '', phone: '', website: '', description: '', verified: false,
  priceType: 'free', price: 0,
  province: '', provinceCode: null, district: '', districtCode: null, subdistrict: '', subdistrictCode: null,
  lat: null, lng: null,
}

function HotelLocationFields({ form, setForm }) {
  const { lang } = useLanguage()
  const c = COPY[lang]
  const [provinces, setProvinces] = useState(null)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeMsg, setGeocodeMsg] = useState('')

  useEffect(() => { loadProvinces().then(setProvinces) }, [])

  const province = provinces?.find(p => p.code === form.provinceCode)
  const district = province?.districts.find(d => d.code === form.districtCode)

  const handleProvinceChange = (code) => {
    const p = provinces.find(x => x.code === Number(code))
    setForm(f => ({
      ...f, provinceCode: p?.code || null, province: p?.name_th || '',
      districtCode: null, district: '', subdistrictCode: null, subdistrict: '',
    }))
  }
  const handleDistrictChange = (code) => {
    const d = province?.districts.find(x => x.code === Number(code))
    setForm(f => ({ ...f, districtCode: d?.code || null, district: d?.name_th || '', subdistrictCode: null, subdistrict: '' }))
  }
  const handleSubdistrictChange = (code) => {
    const s = district?.subdistricts.find(x => x.code === Number(code))
    setForm(f => ({ ...f, subdistrictCode: s?.code || null, subdistrict: s?.name_th || '' }))
  }

  const handleGeocode = async () => {
    const query = [form.address, form.subdistrict, form.district, form.province].filter(Boolean).join(' ')
    if (!query.trim()) { setGeocodeMsg(c.geocodeFillFirst); return }
    setGeocoding(true)
    setGeocodeMsg('')
    try {
      const results = await searchAddress(query)
      if (results.length > 0) {
        setForm(f => ({ ...f, lat: results[0].lat, lng: results[0].lng }))
        setGeocodeMsg(c.geocodeFound(results[0].lat.toFixed(4), results[0].lng.toFixed(4)))
      } else {
        setGeocodeMsg(c.geocodeNotFound)
      }
    } catch {
      setGeocodeMsg(c.geocodeFailed)
    }
    setGeocoding(false)
  }

  const selectStyle = { width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>{c.hotelLocationLabel}</label>
      {!provinces ? (
        <p style={{ fontSize: 12, color: '#aaa' }}>{c.loadingProvinces}</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <select value={form.provinceCode || ''} onChange={e => handleProvinceChange(e.target.value)} style={selectStyle}>
            <option value="">{c.selectProvince}</option>
            {provinces.map(p => <option key={p.code} value={p.code}>{p.name_th}</option>)}
          </select>
          <select value={form.districtCode || ''} onChange={e => handleDistrictChange(e.target.value)} disabled={!province} style={selectStyle}>
            <option value="">{c.selectDistrict}</option>
            {province?.districts.map(d => <option key={d.code} value={d.code}>{d.name_th}</option>)}
          </select>
          <select value={form.subdistrictCode || ''} onChange={e => handleSubdistrictChange(e.target.value)} disabled={!district} style={selectStyle}>
            <option value="">{c.selectSubdistrict}</option>
            {district?.subdistricts.map(s => <option key={s.code} value={s.code}>{s.name_th}</option>)}
          </select>
        </div>
      )}

      <button type="button" onClick={handleGeocode} disabled={geocoding} style={{
        marginTop: 9, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
        borderRadius: 9, border: '1.5px solid #e5e7eb', backgroundColor: '#fff', cursor: geocoding ? 'default' : 'pointer',
        fontSize: 12, fontWeight: 700, color: '#555', fontFamily: 'Space Grotesk, sans-serif',
      }}>
        {geocoding ? <Loader2 size={13} className="animate-spin" /> : <MapPin size={13} />}
        {geocoding ? c.geocoding : c.geocodeButton}
      </button>
      {geocodeMsg && <p style={{ fontSize: 11.5, color: form.lat ? '#059669' : '#dc2626', fontWeight: 600, marginTop: 6 }}>{geocodeMsg}</p>}
    </div>
  )
}

function ListingModal({ initial, onSave, onClose }) {
  const { lang } = useLanguage()
  const c = COPY[lang]
  const categories = getCategories(lang)
  const [form, setForm] = useState(initial ? { ...EMPTY_FORM, ...initial } : EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave(form.category === 'hotel' ? { ...form, price: form.priceType === 'paid' ? Number(form.price) || 0 : 0 } : form)
    setSaving(false)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 3000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        style={{ backgroundColor: '#fff', borderRadius: '22px 22px 0 0', width: '100%', maxWidth: 560, maxHeight: '90dvh', overflowY: 'auto', padding: '24px 22px 32px', fontFamily: 'Space Grotesk, sans-serif' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: '#000' }}>{initial?.id ? c.editListingTitle : c.addListingTitle}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={19} color="#888" /></button>
        </div>

        {[
          { key: 'name', label: c.listingNameLabel, placeholder: c.listingNamePlaceholder, type: 'text' },
          { key: 'address', label: c.addressLabel, placeholder: c.addressLabel, type: 'text' },
          { key: 'phone', label: c.phoneLabel, placeholder: '02-xxx-xxxx', type: 'text' },
          { key: 'website', label: c.websiteLabel, placeholder: 'https://...', type: 'url' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>{f.label}</label>
            <input
              type={f.type} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#F97316'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        ))}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>{c.categoryLabel}</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 7 }}>
            {categories.map(cat => {
              const Icon = cat.icon
              const active = form.category === cat.id
              return (
                <button key={cat.id} onClick={() => set('category', cat.id)} style={{
                  padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${active ? '#F97316' : '#e5e7eb'}`,
                  backgroundColor: active ? '#FFF7ED' : '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 13, fontWeight: active ? 800 : 600, color: active ? '#F97316' : '#555',
                }}>
                  <Icon size={14} color={active ? '#F97316' : '#aaa'} /> {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {form.category === 'hotel' && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>{c.catCostLabel}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: form.priceType === 'paid' ? 8 : 0 }}>
                {[{ v: 'free', l: c.stayFree }, { v: 'paid', l: c.stayPaid }].map(opt => {
                  const active = form.priceType === opt.v
                  return (
                    <button key={opt.v} type="button" onClick={() => set('priceType', opt.v)} style={{
                      padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${active ? '#F97316' : '#e5e7eb'}`,
                      backgroundColor: active ? '#FFF7ED' : '#fff', cursor: 'pointer',
                      fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, fontWeight: active ? 800 : 600,
                      color: active ? '#F97316' : '#555',
                    }}>{opt.l}</button>
                  )
                })}
              </div>
              {form.priceType === 'paid' && (
                <input type="number" value={form.price || ''} onChange={e => set('price', e.target.value)} placeholder={c.pricePerNightPlaceholder} min="0"
                  style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#F97316'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              )}
            </div>

            <HotelLocationFields form={form} setForm={setForm} />
          </>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>{c.descriptionLabel}</label>
          <textarea
            value={form.description || ''} onChange={e => set('description', e.target.value)}
            placeholder={c.listingDescPlaceholder} rows={3}
            style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#F97316'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 20, cursor: 'pointer' }} onClick={() => set('verified', !form.verified)}>
          <div style={{
            width: 20, height: 20, borderRadius: 6, border: `2px solid ${form.verified ? '#F97316' : '#ddd'}`,
            backgroundColor: form.verified ? '#F97316' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            transition: 'all 0.15s',
          }}>
            {form.verified && <Check size={12} color="#fff" />}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#555', userSelect: 'none' }}>{c.verified}</span>
        </div>

        <button onClick={handleSave} disabled={saving || !form.name.trim()} style={{
          width: '100%', padding: 13, borderRadius: 13, border: 'none',
          backgroundColor: form.name.trim() ? '#F97316' : '#e5e7eb',
          color: '#fff', fontSize: 15, fontWeight: 800, cursor: form.name.trim() ? 'pointer' : 'not-allowed',
          fontFamily: 'Space Grotesk, sans-serif',
        }}>
          {saving ? c.saving : (initial?.id ? c.saveEdit : c.addVenue)}
        </button>
      </motion.div>
    </motion.div>
  )
}

function DocStatusBadge({ status }) {
  const { lang } = useLanguage()
  const c = COPY[lang]
  const map = {
    pending: { label: c.docPending, color: '#92400e', bg: '#FEF3C7', icon: Clock },
    verified: { label: c.docVerified, color: '#065f46', bg: '#D1FAE5', icon: ShieldCheck },
    rejected: { label: c.docRejected, color: '#991b1b', bg: '#FEE2E2', icon: AlertCircle },
  }
  const s = map[status] || map.pending
  const Icon = s.icon
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: s.color, backgroundColor: s.bg }}>
      <Icon size={11} /> {s.label}
    </span>
  )
}

function SupportPanel({ user: adminUser }) {
  const { lang } = useLanguage()
  const c = COPY[lang]
  const [chats, setChats] = useState([])
  const [activeUid, setActiveUid] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [rulesError, setRulesError] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    return onSnapshot(
      collection(db, 'supportChats'),
      snap => {
        setRulesError(false)
        const sorted = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.lastMessageAt?.seconds || 0) - (a.lastMessageAt?.seconds || 0))
        setChats(sorted)
      },
      err => {
        console.error('supportChats listener error:', err)
        setRulesError(true)
      }
    )
  }, [])

  useEffect(() => {
    if (!activeUid) { setMessages([]); return }
    const q = query(collection(db, 'supportChats', activeUid, 'messages'), orderBy('createdAt', 'asc'))
    return onSnapshot(
      q,
      snap => setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error('messages listener error:', err)
    )
  }, [activeUid])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendReply = async (e) => {
    e.preventDefault()
    if (!text.trim() || !activeUid || sending) return
    setSending(true)
    const msg = text.trim()
    setText('')
    const tempId = `temp_${Date.now()}`
    setMessages(prev => [...prev, {
      id: tempId, senderId: adminUser.uid, text: msg, isAdmin: true,
      createdAt: { toDate: () => new Date() },
    }])
    try {
      await addDoc(collection(db, 'supportChats', activeUid, 'messages'), {
        senderId: adminUser.uid,
        text: msg, isAdmin: true, createdAt: serverTimestamp(),
      })
      await updateDoc(doc(db, 'supportChats', activeUid), {
        lastMessage: msg, lastMessageAt: serverTimestamp(), unreadAdmin: 0,
      })
    } catch (err) { console.error(err) }
    setSending(false)
  }

  const activeChat = chats.find(ch => ch.id === activeUid)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {rulesError && (
      <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 16px' }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: '#991b1b', margin: '0 0 6px' }}>{c.rulesErrorTitle}</p>
        <p style={{ fontSize: 12, color: '#b91c1c', fontWeight: 500, margin: '0 0 8px' }}>{c.rulesErrorBody}</p>
        <pre style={{ backgroundColor: '#fff', borderRadius: 8, padding: '10px 14px', fontSize: 11, color: '#333', margin: 0, overflowX: 'auto', border: '1px solid #FECACA' }}>{`match /supportChats/{userId} {
  allow read, write: if request.auth != null &&
    (request.auth.uid == userId ||
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
  match /messages/{msgId} {
    allow read, write: if request.auth != null &&
      (request.auth.uid == userId ||
       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
  }
}`}</pre>
      </div>
    )}
    <div style={{ display: 'flex', gap: 16, height: 'calc(100dvh - 200px)', minHeight: 400 }}>
      {/* Chat list */}
      <div style={{ width: 260, flexShrink: 0, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#000', margin: 0 }}>{c.supportChatsCount(chats.length)}</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.length === 0 && <p style={{ padding: '20px 16px', fontSize: 13, color: '#aaa', fontWeight: 500 }}>{c.noConversationsYet}</p>}
          {chats.map(chat => (
            <button key={chat.id} onClick={() => setActiveUid(chat.id)} style={{
              width: '100%', padding: '12px 16px', border: 'none', textAlign: 'left', cursor: 'pointer',
              backgroundColor: activeUid === chat.id ? '#FFF7ED' : 'transparent',
              borderBottom: '1px solid #f9f9f9', fontFamily: 'Space Grotesk, sans-serif',
              display: 'flex', alignItems: 'center', gap: 10,
              transition: 'background 0.1s',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, backgroundImage: chat.userPhoto ? `url(${chat.userPhoto})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#F97316' }}>
                {!chat.userPhoto && (chat.userName?.[0]?.toUpperCase() || '?')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#000', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {chat.userName || c.unspecified}
                  {chat.unreadAdmin > 0 && <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F97316', display: 'inline-block' }} />}
                </div>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.lastMessage || '...'}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!activeUid ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <Headphones size={36} color="#e5e7eb" style={{ marginBottom: 10 }} />
              <p style={{ fontSize: 13, color: '#aaa', fontWeight: 600 }}>{c.selectSupportChat}</p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundImage: activeChat?.userPhoto ? `url(${activeChat.userPhoto})` : 'none', backgroundSize: 'cover', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#F97316' }}>
                {!activeChat?.userPhoto && (activeChat?.userName?.[0]?.toUpperCase() || '?')}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#000' }}>{activeChat?.userName}</div>
                <div style={{ fontSize: 11, color: '#aaa', fontWeight: 500 }}>{activeChat?.userEmail}</div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.map(msg => {
                const isAdmin = msg.isAdmin
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '70%', padding: '9px 13px', borderRadius: isAdmin ? '14px 14px 4px 14px' : '14px 14px 14px 4px', backgroundColor: isAdmin ? '#F97316' : '#f5f5f5', color: isAdmin ? '#fff' : '#000', fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>
                      {msg.text}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendReply} style={{ padding: '10px 12px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
              <input value={text} onChange={e => setText(e.target.value)} placeholder={c.replyPlaceholder} style={{ flex: 1, padding: '9px 14px', borderRadius: 999, border: '1.5px solid #e5e7eb', fontSize: 13, fontFamily: 'Space Grotesk, sans-serif', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#F97316'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              <button type="submit" disabled={!text.trim() || sending} style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', backgroundColor: text.trim() ? '#F97316' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: text.trim() ? 'pointer' : 'not-allowed', flexShrink: 0 }}>
                <Send size={15} color="#fff" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
    </div>
  )
}

export default function AdminPage() {
  const { isAdmin, user } = useAuth()
  const { lang } = useLanguage()
  const c = COPY[lang]
  const [activeTab, setActiveTab] = useState('directory')
  const [listings, setListings] = useState([])
  const [users, setUsers] = useState([])
  const [pendingDocs, setPendingDocs] = useState([])
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [reviewModal, setReviewModal] = useState(null)
  const [reviewNote, setReviewNote] = useState('')
  const [venues, setVenues] = useState([])
  const [bookings, setBookings] = useState([])
  const [venueModal, setVenueModal] = useState(null)
  const [venueSubTab, setVenueSubTab] = useState('venues')
  const [bookingFilter, setBookingFilter] = useState('all')
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0)
  const [cats, setCats] = useState([])
  const [catSearch, setCatSearch] = useState('')

  useEffect(() => {
    if (!isAdmin) return
    const q = query(collection(db, 'directory'), orderBy('name'))
    return onSnapshot(q, snap => setListings(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin || activeTab !== 'users') return
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [isAdmin, activeTab])

  useEffect(() => {
    if (!isAdmin || activeTab !== 'documents') return
    const q = query(collection(db, 'catDocuments'), orderBy('uploadedAt', 'desc'))
    return onSnapshot(q, snap => setPendingDocs(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [isAdmin, activeTab])

  useEffect(() => {
    if (!isAdmin) return
    const q = query(collection(db, 'bookings'), where('status', '==', 'pending'))
    return onSnapshot(q, snap => setPendingBookingsCount(snap.size), () => {})
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin || activeTab !== 'venues') return
    const q = query(collection(db, 'venues'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setVenues(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => {})
  }, [isAdmin, activeTab])

  useEffect(() => {
    if (!isAdmin || activeTab !== 'venues' || venueSubTab !== 'bookings') return
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => {})
  }, [isAdmin, activeTab, venueSubTab])

  useEffect(() => {
    if (!isAdmin || activeTab !== 'cats') return
    const q = query(collection(db, 'cats'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setCats(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => {})
  }, [isAdmin, activeTab])

  if (!isAdmin) {
    return (
      <div style={{ minHeight: 'calc(100dvh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Shield size={32} color="#F97316" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#000', marginBottom: 8 }}>{c.adminOnlyTitle}</h2>
          <p style={{ fontSize: 14, color: '#aaa', fontWeight: 500 }}>{c.adminOnlyBody}</p>
        </div>
      </div>
    )
  }

  const handleSave = async (form) => {
    const { id, ...data } = form
    if (modal?.id) {
      await updateDoc(doc(db, 'directory', modal.id), { ...data, updatedAt: serverTimestamp() })
    } else {
      await addDoc(collection(db, 'directory'), { ...data, createdAt: serverTimestamp() })
    }
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    await deleteDoc(doc(db, 'directory', id))
    setDeleting(null)
  }

  const saveVenue = async (form) => {
    const { id, ...data } = form
    if (venueModal?.id) {
      await updateDoc(doc(db, 'venues', venueModal.id), { ...data, updatedAt: serverTimestamp() })
    } else {
      await addDoc(collection(db, 'venues'), { ...data, createdAt: serverTimestamp() })
    }
  }

  const deleteVenue = async (id) => {
    await deleteDoc(doc(db, 'venues', id))
  }

  const updateBookingStatus = async (bookingId, status) => {
    await updateDoc(doc(db, 'bookings', bookingId), { status, updatedAt: serverTimestamp() })
  }

  const reviewDoc = async (docId, status) => {
    await updateDoc(doc(db, 'catDocuments', docId), {
      status,
      reviewNote: reviewNote.trim(),
      reviewedAt: serverTimestamp(),
    })
    setReviewModal(null)
    setReviewNote('')
  }

  const TABS = [
    { id: 'directory', label: c.tabDirectory, icon: Building2 },
    { id: 'cats', label: c.tabCats, icon: PawPrint },
    { id: 'users', label: c.tabUsers, icon: Users },
    { id: 'documents', label: c.tabDocuments, icon: FileText },
    { id: 'venues', label: c.tabVenues, icon: Home },
    { id: 'support', label: c.tabSupport, icon: Headphones },
  ]

  return (
    <div style={{ minHeight: 'calc(100dvh - 60px)', backgroundColor: '#f8f8f8', fontFamily: 'Space Grotesk, sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', padding: '18px 20px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Shield size={20} color="#F97316" />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 900, color: '#000' }}>{c.adminPanelTitle}</h1>
              <p style={{ fontSize: 11, color: '#aaa', fontWeight: 500 }}>{c.adminPanelSubtitle}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0 }}>
            {TABS.map(t => {
              const Icon = t.icon
              const badge = t.id === 'documents' ? pendingDocs.filter(d => d.status === 'pending').length
                : t.id === 'venues' ? pendingBookingsCount : 0
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 800, color: activeTab === t.id ? '#F97316' : '#aaa',
                  borderBottom: `2px solid ${activeTab === t.id ? '#F97316' : 'transparent'}`,
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'Space Grotesk, sans-serif', transition: 'color 0.15s', position: 'relative',
                }}>
                  <Icon size={14} /> {t.label}
                  {badge > 0 && (
                    <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 5px', borderRadius: 999, marginLeft: 2 }}>{badge}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
        {/* Directory tab */}
        {activeTab === 'directory' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>{c.itemsCount(listings.length)}</p>
              <button onClick={() => setModal({})} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px',
                backgroundColor: '#F97316', color: '#fff', border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
              }}>
                <Plus size={15} /> {c.addPlace}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {listings.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <Building2 size={28} color="#F97316" />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#000', marginBottom: 6 }}>{c.noListingsYet}</p>
                  <p style={{ fontSize: 13, color: '#aaa', fontWeight: 500 }}>{c.pressAddToStart}</p>
                </div>
              )}

              {listings.map(listing => {
                const CatIcon = getCatIcon(listing.category)
                const catLabel = getCategories(lang).find(cat => cat.id === listing.category)?.label || listing.category
                return (
                  <div key={listing.id} style={{
                    backgroundColor: '#fff', borderRadius: 14, padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 13,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', flexWrap: 'wrap',
                  }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CatIcon size={20} color="#F97316" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#000' }}>{listing.name}</span>
                        {listing.verified && (
                          <span style={{ fontSize: 10, fontWeight: 800, color: '#10b981', backgroundColor: '#ecfdf5', padding: '2px 7px', borderRadius: 6 }}>{c.verified}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>{catLabel}</span>
                        {listing.address && (
                          <span style={{ fontSize: 11, color: '#bbb', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <MapPin size={10} /> {listing.address}
                          </span>
                        )}
                        {listing.phone && (
                          <span style={{ fontSize: 11, color: '#bbb', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Phone size={10} /> {listing.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                      <button onClick={() => setModal(listing)} style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#555', fontFamily: 'Space Grotesk, sans-serif' }}>
                        <Pencil size={12} /> {c.edit}
                      </button>
                      <button onClick={() => handleDelete(listing.id)} disabled={deleting === listing.id} style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #fee2e2', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#ef4444', fontFamily: 'Space Grotesk, sans-serif' }}>
                        <Trash2 size={12} /> {deleting === listing.id ? c.deleting : c.delete}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Documents tab */}
        {activeTab === 'documents' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>
                {c.docsSummary(pendingDocs.length, pendingDocs.filter(d => d.status === 'pending').length)}
              </p>
            </div>

            {pendingDocs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: 14 }}>
                <FileText size={32} color="#e5e7eb" style={{ marginBottom: 10 }} />
                <p style={{ fontSize: 14, color: '#aaa', fontWeight: 600 }}>{c.noPendingDocs}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pendingDocs.map(d => (
                  <div key={d.id} style={{ backgroundColor: '#fff', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#000' }}>{d.typeLabel}</span>
                        <DocStatusBadge status={d.status} />
                      </div>
                      <p style={{ fontSize: 13, color: '#555', fontWeight: 600, margin: '0 0 2px' }}>{c.catLabel} <strong>{d.catName}</strong> · {c.ownerLabel} {d.ownerName}</p>
                      {d.note && <p style={{ fontSize: 12, color: '#888', fontWeight: 500, margin: '0 0 2px' }}>{c.noteLabel} {d.note}</p>}
                      {d.status === 'rejected' && d.reviewNote && <p style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, margin: '0 0 2px' }}>{c.reasonLabel} {d.reviewNote}</p>}
                      <p style={{ fontSize: 11, color: '#bbb', fontWeight: 500, margin: '4px 0 0' }}>{d.filename}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
                      <a href={d.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 8, border: '1.5px solid #e5e7eb', backgroundColor: '#fafafa', color: '#555', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                        <Eye size={12} /> {c.viewDocument}
                      </a>
                      {d.status !== 'verified' && (
                        <button onClick={async () => { await reviewDoc(d.id, 'verified') }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 8, border: 'none', backgroundColor: '#D1FAE5', color: '#065f46', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
                          <ShieldCheck size={12} /> {c.confirm}
                        </button>
                      )}
                      {d.status !== 'rejected' && (
                        <button onClick={() => { setReviewModal(d); setReviewNote('') }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 8, border: 'none', backgroundColor: '#FEE2E2', color: '#991b1b', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
                          <AlertCircle size={12} /> {c.rejectAction}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reject reason modal */}
            <AnimatePresence>
              {reviewModal && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                  onClick={() => setReviewModal(null)}>
                  <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
                    onClick={e => e.stopPropagation()}
                    style={{ backgroundColor: '#fff', borderRadius: 18, padding: '24px 22px', maxWidth: 380, width: '100%', fontFamily: 'Space Grotesk, sans-serif' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: '#000', marginBottom: 6 }}>{c.rejectReasonTitle}</h3>
                    <p style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>{c.rejectReasonSubtitle(reviewModal.typeLabel, reviewModal.catName)}</p>
                    <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder={c.rejectReasonPlaceholder} rows={3}
                      style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 14 }}
                      onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => setReviewModal(null)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid #e5e7eb', backgroundColor: '#fff', color: '#555', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>{c.cancel}</button>
                      <button onClick={() => reviewDoc(reviewModal.id, 'rejected')} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', backgroundColor: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>{c.rejectAction}</button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Venues tab */}
        {activeTab === 'venues' && (
          <>
            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[{ id: 'venues', label: c.subTabVenues, icon: Home }, { id: 'bookings', label: c.subTabBookings, icon: CalendarDays }].map(t => {
                const Icon = t.icon
                return (
                  <button key={t.id} onClick={() => setVenueSubTab(t.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                    borderRadius: 10, border: 'none', cursor: 'pointer',
                    backgroundColor: venueSubTab === t.id ? '#F97316' : '#fff',
                    color: venueSubTab === t.id ? '#fff' : '#555',
                    fontSize: 13, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.07)', transition: 'all 0.15s',
                  }}>
                    <Icon size={14} /> {t.label}
                    {t.id === 'bookings' && pendingBookingsCount > 0 && (
                      <span style={{ backgroundColor: venueSubTab === 'bookings' ? 'rgba(255,255,255,0.3)' : '#F97316', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 999, marginLeft: 2 }}>
                        {pendingBookingsCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {venueSubTab === 'venues' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>{c.venuesCount(venues.length)}</p>
                  <button onClick={() => setVenueModal({})} style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px',
                    backgroundColor: '#F97316', color: '#fff', border: 'none', borderRadius: 10,
                    fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
                  }}>
                    <Plus size={15} /> {c.addPlace}
                  </button>
                </div>

                {venues.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#fff', borderRadius: 14 }}>
                    <Home size={32} color="#e5e7eb" style={{ marginBottom: 10 }} />
                    <p style={{ fontSize: 14, color: '#aaa', fontWeight: 600 }}>{c.noVenuesYet}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {venues.map(v => (
                      <div key={v.id} style={{ backgroundColor: '#fff', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 13, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', flexWrap: 'wrap' }}>
                        <div style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0, backgroundColor: '#f5f5f5', backgroundImage: v.photoURL ? `url(${v.photoURL})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {!v.photoURL && <Home size={22} color="#ccc" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: '#000' }}>{v.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, backgroundColor: v.isActive ? '#D1FAE5' : '#f0f0f0', color: v.isActive ? '#065f46' : '#888' }}>
                              {v.isActive ? c.open : c.closed}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {v.location && <span style={{ fontSize: 11, color: '#aaa', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} /> {v.location}</span>}
                            <span style={{ fontSize: 11, color: '#F97316', fontWeight: 700 }}>฿{v.price?.toLocaleString() || 0}/{v.priceUnit === 'session' ? c.perSessionShort : c.perNightShort}</span>
                          </div>
                          {v.facilities?.length > 0 && (
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 5 }}>
                              {v.facilities.map(f => (
                                <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#666', backgroundColor: '#f5f5f5', padding: '2px 8px', borderRadius: 999 }}>{VENUE_FACILITY_LABELS[lang][f] || f}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                          <button onClick={() => setVenueModal(v)} style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#555', fontFamily: 'Space Grotesk, sans-serif' }}>
                            <Pencil size={12} /> {c.edit}
                          </button>
                          <button onClick={() => deleteVenue(v.id)} style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #fee2e2', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#ef4444', fontFamily: 'Space Grotesk, sans-serif' }}>
                            <Trash2 size={12} /> {c.delete}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {venueSubTab === 'bookings' && (
              <>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                    <button key={s} onClick={() => setBookingFilter(s)} style={{
                      padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
                      backgroundColor: bookingFilter === s ? '#000' : '#f0f0f0',
                      color: bookingFilter === s ? '#fff' : '#555',
                      fontSize: 12, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif',
                    }}>
                      {{ all: c.filterAll, pending: c.filterPending, confirmed: c.filterConfirmed, completed: c.filterCompleted, cancelled: c.filterCancelled }[s]}
                    </button>
                  ))}
                </div>

                {bookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#fff', borderRadius: 14 }}>
                    <CalendarDays size={32} color="#e5e7eb" style={{ marginBottom: 10 }} />
                    <p style={{ fontSize: 14, color: '#aaa', fontWeight: 600 }}>{c.noBookingsYet}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {bookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter).map(b => (
                      <div key={b.id} style={{ backgroundColor: '#fff', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                            <span style={{ fontSize: 14, fontWeight: 900, color: '#000' }}>{b.venueName}</span>
                            <BookingBadge status={b.status} />
                          </div>
                          <p style={{ fontSize: 13, color: '#555', fontWeight: 600, margin: '0 0 2px' }}>
                            {b.userName} · {c.catNameLabel} <strong>{b.catName}</strong> ({b.catBreed})
                          </p>
                          <p style={{ fontSize: 12, color: '#888', fontWeight: 500, margin: '0 0 2px' }}>
                            {b.checkIn} → {b.checkOut}
                          </p>
                          {b.notes && <p style={{ fontSize: 12, color: '#aaa', fontWeight: 500, margin: '2px 0 0' }}>{c.noteLabel} {b.notes}</p>}
                        </div>
                        <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                          {b.status === 'pending' && (
                            <>
                              <button onClick={() => updateBookingStatus(b.id, 'confirmed')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 8, border: 'none', backgroundColor: '#D1FAE5', color: '#065f46', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
                                <CheckCircle size={12} /> {c.confirm}
                              </button>
                              <button onClick={() => updateBookingStatus(b.id, 'cancelled')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 8, border: 'none', backgroundColor: '#FEE2E2', color: '#991b1b', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
                                <XCircle size={12} /> {c.statusCancelled}
                              </button>
                            </>
                          )}
                          {b.status === 'confirmed' && (
                            <button onClick={() => updateBookingStatus(b.id, 'completed')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 8, border: 'none', backgroundColor: '#DBEAFE', color: '#1e40af', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
                              <CheckCircle size={12} /> {c.statusCompleted}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <AnimatePresence>
              {venueModal !== null && (
                <VenueFormModal
                  initial={venueModal?.id ? venueModal : null}
                  onSave={saveVenue}
                  onClose={() => setVenueModal(null)}
                />
              )}
            </AnimatePresence>
          </>
        )}

        {/* Cats tab */}
        {activeTab === 'cats' && (() => {
          const LOOKING_FOR_LABEL = {
            mate: c.lookingMate, friend: c.lookingFriend, adopt: c.lookingAdopt,
            foster: c.lookingFoster, sell: c.lookingSell, exchange: c.lookingExchange,
            any: c.lookingAny, other: c.lookingOther,
          }
          const filtered = cats.filter(cat => {
            if (!catSearch.trim()) return true
            const q = catSearch.toLowerCase()
            return (
              cat.name?.toLowerCase().includes(q) ||
              cat.breed?.toLowerCase().includes(q) ||
              cat.ownerName?.toLowerCase().includes(q) ||
              cat.location?.toLowerCase().includes(q)
            )
          })
          return (
            <>
              {/* search + count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                  <Search size={14} color="#bbb" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    value={catSearch} onChange={e => setCatSearch(e.target.value)}
                    placeholder={c.catSearchPlaceholder}
                    style={{ width: '100%', padding: '9px 13px 9px 34px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#F97316'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
                <span style={{ fontSize: 13, color: '#888', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {c.catCountSuffix(filtered.length, cats.length)}
                </span>
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: 14 }}>
                  <PawPrint size={32} color="#e5e7eb" style={{ marginBottom: 10 }} />
                  <p style={{ fontSize: 14, color: '#aaa', fontWeight: 600 }}>
                    {catSearch ? c.noCatsFound : c.noCatsYet}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filtered.map(cat => {
                    const lookingTags = Array.isArray(cat.lookingFor)
                      ? cat.lookingFor : cat.lookingFor ? [cat.lookingFor] : []
                    const ageStr = [
                      cat.ageYears ? `${cat.ageYears} ${c.yearsUnit}` : '',
                      cat.ageMonths ? `${cat.ageMonths} ${c.monthsUnit}` : '',
                    ].filter(Boolean).join(' ') || '-'

                    return (
                      <div key={cat.id} style={{
                        backgroundColor: '#fff', borderRadius: 14, padding: '14px 16px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        display: 'flex', gap: 13, alignItems: 'flex-start', flexWrap: 'wrap',
                      }}>
                        {/* photo */}
                        <div style={{
                          width: 58, height: 58, borderRadius: 14, flexShrink: 0,
                          backgroundImage: cat.photoURL ? `url(${cat.photoURL})` : 'none',
                          backgroundSize: 'cover', backgroundPosition: 'center',
                          backgroundColor: '#FFF7ED',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid rgba(249,115,22,0.15)',
                        }}>
                          {!cat.photoURL && <PawPrint size={24} color="#F97316" style={{ opacity: 0.4 }} />}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* name + gender + breed */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
                            <span style={{ fontSize: 15, fontWeight: 900, color: '#000' }}>{cat.name}</span>
                            <span style={{
                              fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
                              backgroundColor: cat.gender === 'female' ? '#fce7f3' : '#eff6ff',
                              color: cat.gender === 'female' ? '#be185d' : '#1d4ed8',
                            }}>
                              {cat.gender === 'female' ? c.female : c.male}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#F97316', backgroundColor: '#FFF7ED', padding: '2px 8px', borderRadius: 999 }}>
                              {cat.breed}
                            </span>
                          </div>

                          {/* owner + age + weight + location */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px', marginBottom: 7 }}>
                            <span style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>
                              {c.ownerInline} <strong>{cat.ownerName || '-'}</strong>
                            </span>
                            <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{c.ageInline} {ageStr}</span>
                            {cat.weight && <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{cat.weight} {c.weightUnit}</span>}
                            {cat.location && (
                              <span style={{ fontSize: 12, color: '#888', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
                                <MapPin size={10} /> {cat.location}
                              </span>
                            )}
                          </div>

                          {/* health badges */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: lookingTags.length ? 6 : 0 }}>
                            {cat.vaccinated && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#065f46', backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: 999 }}>
                                <Syringe size={10} /> {c.vaccinated}
                              </span>
                            )}
                            {cat.sterilized && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#5b21b6', backgroundColor: '#ede9fe', padding: '2px 8px', borderRadius: 999 }}>
                                <Scissors size={10} /> {c.sterilized}
                              </span>
                            )}
                            {cat.microchipped && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#1e40af', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: 999 }}>{c.microchipped}</span>
                            )}
                            {cat.fivFelvTested && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#92400e', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: 999 }}>{c.fivFelvTested}</span>
                            )}
                            {cat.registry && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#F97316', backgroundColor: '#FFF7ED', padding: '2px 8px', borderRadius: 999 }}>
                                📋 {cat.registry}
                              </span>
                            )}
                          </div>

                          {/* looking for tags */}
                          {lookingTags.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                              {lookingTags.map(tag => (
                                <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#fff', backgroundColor: '#F97316', padding: '2px 9px', borderRadius: 999 }}>
                                  <Heart size={9} /> {LOOKING_FOR_LABEL[tag] || tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* date */}
                        <div style={{ fontSize: 10, color: '#ccc', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>
                          {cat.createdAt?.toDate ? cat.createdAt.toDate().toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US') : ''}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )
        })()}

        {/* Support tab */}
        {activeTab === 'support' && <SupportPanel user={user} />}

        {/* Users tab */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 6 }}>{c.usersCount(users.length)}</p>
            {users.map(u => (
              <div key={u.id} style={{
                backgroundColor: '#fff', borderRadius: 14, padding: '13px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  backgroundImage: u.photoURL ? `url(${u.photoURL})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {!u.photoURL && <Users size={18} color="#ddd" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#000' }}>{u.displayName || c.unspecified}</span>
                    {u.role === 'admin' && (
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#F97316', backgroundColor: '#FFF7ED', padding: '2px 7px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Shield size={9} /> {c.admin}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                </div>
                <div style={{ fontSize: 10, color: '#bbb', fontWeight: 600, flexShrink: 0 }}>
                  {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US') : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal !== null && (
          <ListingModal
            initial={modal?.id ? modal : null}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
