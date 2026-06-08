import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default function AuthModal() {
  const { showAuthModal, closeAuthModal, signInWithGoogle, signInWithEmail, signUpWithEmail, authMode, isConfigured } = useAuth()
  const { t } = useLanguage()
  const [mode, setMode] = useState(authMode || 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!showAuthModal) return null

  const getFirebaseErrorMsg = (errMsg) => {
    if (!errMsg) return t('auth.errorGeneral')
    if (errMsg.includes('popup-closed-by-user') || errMsg.includes('cancelled-popup-request')) return ''
    if (errMsg.includes('popup-blocked')) return t('auth.errorPopupBlocked')
    if (errMsg.includes('unauthorized-domain')) return t('auth.errorDomain')
    if (errMsg.includes('operation-not-allowed')) return t('auth.errorNotEnabled')
    if (errMsg.includes('wrong-password') || errMsg.includes('invalid-credential') || errMsg.includes('user-not-found')) return t('auth.errorInvalid')
    if (errMsg.includes('email-already-in-use')) return t('auth.errorEmailInUse')
    if (errMsg.includes('weak-password')) return t('auth.errorWeakPassword')
    if (errMsg.includes('invalid-email')) return t('auth.errorInvalidEmail')
    if (errMsg.includes('network-request-failed')) return t('auth.errorNetwork')
    return t('auth.errorGeneral')
  }

  const handleGoogle = async () => {
    if (!isConfigured) { setError(t('auth.notConfigured')); return }
    setLoading(true)
    setError('')
    const res = await signInWithGoogle()
    setLoading(false)
    if (res?.error) {
      const msg = getFirebaseErrorMsg(res.error)
      if (msg) setError(msg)
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!isConfigured) { setError(t('auth.notConfigured')); return }
    setLoading(true)
    setError('')
    const fn = mode === 'signin' ? signInWithEmail : signUpWithEmail
    const res = await fn(email, password)
    setLoading(false)
    if (res?.error) setError(getFirebaseErrorMsg(res.error))
  }

  return (
    <AnimatePresence>
      <motion.div
        key="auth-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAuthModal}
        style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
      >
        <motion.div
          key="auth-modal"
          initial={{ opacity: 0, scale: 0.88, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 32 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#fff',
            borderRadius: 28,
            padding: '40px 36px',
            width: '100%',
            maxWidth: 420,
            position: 'relative',
            boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
            fontFamily: 'Space Grotesk, sans-serif',
          }}
        >
          {/* Close */}
          <button
            onClick={closeAuthModal}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'none', border: 'none', cursor: 'pointer',
              width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#999', backgroundColor: '#f5f5f5',
            }}
          >
            <X size={16} />
          </button>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🐾</div>
            <h2 style={{
              fontSize: 22, fontWeight: 800, color: '#000',
              margin: 0,
            }}>
              {mode === 'signin' ? t('auth.welcomeBack') : t('auth.createAccount')}
            </h2>
            <p style={{ fontSize: 14, color: '#888', marginTop: 6, fontWeight: 500 }}>
              Catinder — Find Your Cat's Perfect Match
            </p>
          </div>

          {/* Firebase not configured warning */}
          {!isConfigured && (
            <div style={{
              backgroundColor: '#FFF7ED',
              border: '1px solid #F97316',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 20,
              fontSize: 13,
              color: '#c2410c',
              fontWeight: 600,
            }}>
              ⚠️ {t('auth.notConfigured')}
            </div>
          )}

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px 20px',
              borderRadius: 14,
              border: '1.5px solid #e5e7eb',
              backgroundColor: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              fontSize: 15,
              fontWeight: 700,
              color: '#000',
              marginBottom: 20,
              transition: 'all 0.2s',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
          >
            <GoogleIcon />
            {t('auth.googleBtn')}
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
          }}>
            <div style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
            <span style={{ fontSize: 13, color: '#999', fontWeight: 600 }}>{t('auth.orEmail')}</span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#333', display: 'block', marginBottom: 6 }}>
                {t('auth.emailLabel')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1.5px solid #e5e7eb',
                  fontSize: 15,
                  fontFamily: 'Space Grotesk, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border 0.2s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#F97316'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#333', display: 'block', marginBottom: 6 }}>
                {t('auth.passwordLabel')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1.5px solid #e5e7eb',
                  fontSize: 15,
                  fontFamily: 'Space Grotesk, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border 0.2s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#F97316'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                ⚠️ {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 14,
                border: 'none',
                backgroundColor: loading ? '#ccc' : '#F97316',
                color: '#fff',
                fontSize: 16,
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Space Grotesk, sans-serif',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#EA6A00' }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#F97316' }}
            >
              {loading ? '...' : mode === 'signin' ? t('auth.signInBtn') : t('auth.signUpBtn')}
            </button>
          </form>

          {/* Switch mode */}
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#666', fontWeight: 500 }}>
            {mode === 'signin' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#F97316', fontWeight: 700, fontSize: 14,
                fontFamily: 'Space Grotesk, sans-serif',
              }}
            >
              {mode === 'signin' ? t('auth.switchSignUp') : t('auth.switchSignIn')}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
