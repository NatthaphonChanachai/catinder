import { motion } from 'framer-motion'
import { ExternalLink, CheckCircle2, XCircle, BookOpen, PawPrint, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const REGISTRIES = [
  {
    id: 'CFA',
    name: 'CFA',
    fullName: "Cat Fanciers' Association",
    origin: 'ก่อตั้ง 1906 · สหรัฐอเมริกา',
    color: '#1d4ed8',
    lightColor: '#eff6ff',
    textColor: '#1e40af',
    borderColor: '#bfdbfe',
    description:
      'องค์กรจดทะเบียนแมวที่เก่าแก่และมีชื่อเสียงที่สุดในโลก ยอมรับ 45 สายพันธุ์และมีมาตรฐานสูง',
    rules: [
      'ต้องจดทะเบียน Cattery ก่อนจึงจะจดทะเบียนลูกแมวได้',
      'พ่อแมวและแม่แมวต้องมีใบ CFA ทั้งคู่',
      'รองรับ 45 สายพันธุ์ที่ได้รับการยอมรับ',
      'เป็นที่ยอมรับในระดับนานาชาติสูงมาก',
    ],
    website: 'https://cfa.org',
  },
  {
    id: 'TICA',
    name: 'TICA',
    fullName: 'The International Cat Association',
    origin: 'ก่อตั้ง 1979 · นานาชาติ',
    color: '#047857',
    lightColor: '#ecfdf5',
    textColor: '#065f46',
    borderColor: '#a7f3d0',
    description:
      'สมาคมระดับนานาชาติที่ยืดหยุ่นกว่า รองรับสายพันธุ์มากกว่ารวมถึง Bengal และสายพันธุ์ที่กำลังพัฒนา',
    rules: [
      'รองรับสายพันธุ์มากกว่า CFA รวมถึง Bengal',
      'มีระบบจดทะเบียนที่ยืดหยุ่นและเป็นมิตรกว่า',
      'รองรับการจดทะเบียนนานาชาติทั่วโลก',
      'เปิดรับสายพันธุ์ใหม่ที่กำลังได้รับการพัฒนา',
    ],
    website: 'https://tica.org',
  },
  {
    id: 'SCFC',
    name: 'SCFC',
    fullName: "Siam Cat Fanciers' Club",
    origin: 'สมาคมแมวสยาม · ประเทศไทย',
    color: '#be123c',
    lightColor: '#fff1f2',
    textColor: '#9f1239',
    borderColor: '#fecdd3',
    description:
      'สมาคมแมวของไทย มี 3 ประเภทการจดทะเบียนเพื่อรองรับแมวหลากหลายที่มาในประเทศไทย',
    rules: [
      'ประเภท 1: โอนจากทะเบียนต่างประเทศ',
      'ประเภท 2: พ่อแม่ต้องจดทะเบียน SCFC ทั้งคู่',
      'ประเภท 3: Foundation — ห้ามต่อยอดสายเลือดได้',
      'พ่อแมวและแม่แมวต้องอยู่ในชมรมเดียวกันเท่านั้น',
    ],
    website: 'https://siamcatthailand.com',
  },
  {
    id: 'WCF',
    name: 'WCF',
    fullName: 'World Cat Federation',
    origin: 'ก่อตั้ง 1988 · ยุโรป',
    color: '#7c3aed',
    lightColor: '#f5f3ff',
    textColor: '#6d28d9',
    borderColor: '#ddd6fe',
    description:
      'สหพันธ์แมวระดับโลกที่ตั้งอยู่ในยุโรป มีสมาชิกในกว่า 40 ประเทศทั่วโลก',
    rules: [
      'เป็นองค์กรระดับยุโรปที่มีสมาชิกนานาชาติ',
      'มีระบบจดทะเบียน pedigree ของตัวเอง',
      'รองรับสายพันธุ์ตามมาตรฐาน FIFe',
      'พ่อแมวและแม่แมวต้องมีใบ WCF ทั้งคู่',
    ],
    website: 'https://wcf-online.de',
  },
]

const MATRIX_KEYS = ['CFA', 'TICA', 'SCFC', 'WCF']

export default function RegistriesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#f8f8f8',
        fontFamily: 'Space Grotesk, sans-serif',
        paddingBottom: 80,
      }}
    >
      {/* Hero header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fff 100%)',
          borderBottom: '1px solid #f0f0f0',
          padding: '32px 16px 28px',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
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
            <ArrowLeft size={14} /> กลับ
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: 'rgba(249,115,22,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={22} color="#F97316" />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: '#000', margin: 0 }}>
                ศูนย์ข้อมูล Registry
              </h1>
              <p style={{ fontSize: 13, color: '#888', fontWeight: 500, margin: '2px 0 0' }}>
                เรียนรู้เกี่ยวกับสมาคมจดทะเบียนแมวสายพันธุ์
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#fff',
              border: '1.5px solid #fed7aa',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              marginTop: 16,
            }}
          >
            <PawPrint size={16} color="#F97316" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: '#444', fontWeight: 500, margin: 0, lineHeight: 1.6 }}>
              การออกใบ Pedigree ให้กับลูกแมว{' '}
              <strong>พ่อแมวและแม่แมวต้องอยู่ในชมรมเดียวกัน</strong>{' '}
              หากต่างชมรมกัน ลูกแมวอาจออกใบเพ็ดดีกรีไม่ได้
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px 0' }}>
        {/* Registry cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: 16,
            marginBottom: 40,
          }}
        >
          {REGISTRIES.map((reg, i) => (
            <motion.div
              key={reg.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                backgroundColor: '#fff',
                borderRadius: 18,
                border: `1.5px solid ${reg.borderColor}`,
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}
            >
              {/* Card header */}
              <div
                style={{
                  backgroundColor: reg.lightColor,
                  padding: '18px 20px 14px',
                  borderBottom: `1px solid ${reg.borderColor}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 900,
                        color: reg.color,
                        lineHeight: 1,
                        marginBottom: 4,
                      }}
                    >
                      {reg.name}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: reg.textColor }}>
                      {reg.fullName}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#888',
                        fontWeight: 500,
                        marginTop: 3,
                      }}
                    >
                      {reg.origin}
                    </div>
                  </div>

                  {/* Same-registry only badge */}
                  <div
                    style={{
                      backgroundColor: reg.lightColor,
                      border: `1px solid ${reg.borderColor}`,
                      borderRadius: 99,
                      padding: '3px 10px',
                      fontSize: 10,
                      fontWeight: 800,
                      color: reg.textColor,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {reg.id} Only
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '16px 20px 20px' }}>
                <p
                  style={{
                    fontSize: 13,
                    color: '#555',
                    fontWeight: 500,
                    lineHeight: 1.6,
                    marginBottom: 14,
                  }}
                >
                  {reg.description}
                </p>

                <div style={{ marginBottom: 18 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#aaa',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 8,
                    }}
                  >
                    กฎสำคัญ
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {reg.rules.map((rule, j) => (
                      <div
                        key={j}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}
                      >
                        <CheckCircle2
                          size={14}
                          color={reg.color}
                          style={{ flexShrink: 0, marginTop: 1 }}
                        />
                        <span
                          style={{ fontSize: 13, color: '#444', fontWeight: 500, lineHeight: 1.5 }}
                        >
                          {rule}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href={reg.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: reg.lightColor,
                    color: reg.color,
                    border: `1.5px solid ${reg.borderColor}`,
                    padding: '8px 16px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: 800,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <ExternalLink size={13} /> เรียนรู้เพิ่มเติม
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Compatibility matrix */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{
            backgroundColor: '#fff',
            borderRadius: 18,
            border: '1px solid #f0f0f0',
            overflow: 'hidden',
            marginBottom: 32,
          }}
        >
          <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #f5f5f5' }}>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: '#000', margin: 0 }}>
              ตารางความเข้ากันได้
            </h2>
            <p style={{ fontSize: 12, color: '#aaa', fontWeight: 500, margin: '4px 0 0' }}>
              ✅ = ออกใบ Pedigree ได้ · ❌ = ออกใบ Pedigree ไม่ได้
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#fafafa' }}>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#aaa',
                      borderBottom: '1px solid #f0f0f0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    พ่อ \ แม่
                  </th>
                  {MATRIX_KEYS.map(k => (
                    <th
                      key={k}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'center',
                        fontSize: 13,
                        fontWeight: 900,
                        color: '#333',
                        borderBottom: '1px solid #f0f0f0',
                        minWidth: 72,
                      }}
                    >
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX_KEYS.map((row, ri) => (
                  <tr
                    key={row}
                    style={{ backgroundColor: ri % 2 === 0 ? '#fff' : '#fafafa' }}
                  >
                    <td
                      style={{
                        padding: '14px 16px',
                        fontSize: 13,
                        fontWeight: 900,
                        color: '#333',
                        borderBottom: '1px solid #f5f5f5',
                      }}
                    >
                      {row}
                    </td>
                    {MATRIX_KEYS.map(col => {
                      const compat = row === col
                      return (
                        <td
                          key={col}
                          style={{
                            padding: '14px 16px',
                            textAlign: 'center',
                            fontSize: 18,
                            borderBottom: '1px solid #f5f5f5',
                            backgroundColor: compat
                              ? 'rgba(16,185,129,0.05)'
                              : 'rgba(239,68,68,0.03)',
                          }}
                        >
                          {compat ? (
                            <CheckCircle2 size={18} color="#10b981" style={{ margin: 'auto' }} />
                          ) : (
                            <XCircle size={18} color="#ef4444" style={{ margin: 'auto', opacity: 0.5 }} />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{
            backgroundColor: '#fff',
            border: '1.5px solid #fed7aa',
            borderRadius: 18,
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#000', marginBottom: 4 }}>
              พร้อมจับคู่แมวของคุณแล้ว?
            </div>
            <div style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>
              ใส่ข้อมูล Registry ในโปรไฟล์แมวเพื่อการจับคู่ที่แม่นยำ
            </div>
          </div>
          {user ? (
            <Link
              to="/my-cats"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                backgroundColor: '#F97316',
                color: '#fff',
                padding: '11px 22px',
                borderRadius: 11,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 800,
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(249,115,22,0.3)',
              }}
            >
              <PawPrint size={15} /> จัดการแมวของฉัน
            </Link>
          ) : (
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                backgroundColor: '#F97316',
                color: '#fff',
                padding: '11px 22px',
                borderRadius: 11,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              เริ่มต้นใช้งาน
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  )
}
