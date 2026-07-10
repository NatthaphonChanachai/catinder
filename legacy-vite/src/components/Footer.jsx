import { Globe, Share2, Link2 } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  const footerLinks = [
    t('nav.browseCats'), t('nav.howItWorks'), t('nav.forBreeders'), 'Contact', 'Privacy'
  ]

  return (
    <footer style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'Space Grotesk, sans-serif', padding: '64px 24px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          flexWrap: 'wrap', gap: 40, marginBottom: 48, paddingBottom: 48,
          borderBottom: '1px solid rgba(255,255,255,0.1)' }}>

          {/* Brand */}
          <div style={{ maxWidth: 320 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#F97316', marginBottom: 12, letterSpacing: '-0.5px' }}>
              🐾 Catinder
            </div>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontWeight: 500, marginBottom: 24 }}>
              {t('footer.tagline')}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { icon: <Globe size={18} />, label: 'Instagram' },
                { icon: <Share2 size={18} />, label: 'Facebook' },
                { icon: <Link2 size={18} />, label: 'Twitter' },
              ].map(({ icon, label }) => (
                <a key={label} href="#" aria-label={label}
                  style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F97316'; e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#F97316', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
              {t('footer.quickLinks')}
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {footerLinks.map((link) => (
                <a key={link} href="#"
                  style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#F97316'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                  {link}
                </a>
              ))}
            </nav>
          </div>

          {/* Status */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#F97316', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
              {t('footer.status')}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
              backgroundColor: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)',
              padding: '8px 16px', borderRadius: 999, marginBottom: 16 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F97316', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#F97316' }}>{t('footer.beta')}</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 500, lineHeight: 1.6 }}>
              🇹🇭 Bangkok, Thailand<br />Expanding across Thailand in 2025
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{t('footer.copyright')}</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{t('footer.currentlyBeta')}</p>
        </div>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
            Built by Tanasorn Thongkaew (CEO & CTO) · Suchanayasinee Trisuk (COO)
          </p>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </footer>
  )
}
