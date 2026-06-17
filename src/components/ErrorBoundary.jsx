import { Component } from 'react'
import { PawPrint, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[Catinder] UI crashed:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        minHeight: this.props.fullPage ? '100dvh' : 320,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Space Grotesk, sans-serif', padding: 24, backgroundColor: '#fff',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, backgroundColor: '#FFF7ED',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <PawPrint size={32} color="#F97316" />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#000', marginBottom: 8 }}>
            มีบางอย่างผิดพลาด
          </h2>
          <p style={{ fontSize: 13, color: '#888', fontWeight: 500, marginBottom: 22, lineHeight: 1.6 }}>
            ขออภัยในความไม่สะดวก ลองโหลดหน้านี้ใหม่อีกครั้ง
          </p>
          <button onClick={() => window.location.reload()} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            backgroundColor: '#F97316', color: '#fff', padding: '11px 22px', borderRadius: 11,
            border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800,
            fontFamily: 'Space Grotesk, sans-serif',
          }}>
            <RefreshCw size={14} /> โหลดใหม่
          </button>
        </div>
      </div>
    )
  }
}
