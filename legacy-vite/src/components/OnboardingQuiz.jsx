import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Trophy, Sprout, PawPrint, Heart, Star, Sparkles, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { breedOptions, cityOptions } from '../data/cats'

const TOTAL_STEPS = 4

export default function OnboardingQuiz() {
  const { showQuiz, completeQuiz, skipQuiz, user } = useAuth()
  const { t } = useLanguage()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({ role: '', breed: '', city: '', goal: '' })
  const [direction, setDirection] = useState(1)

  if (!showQuiz) return null

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1)
      setStep((s) => s + 1)
    } else {
      completeQuiz(answers)
    }
  }

  const goBack = () => {
    setDirection(-1)
    setStep((s) => s - 1)
  }

  const q1Options = t('quiz.q1Options')
  const q4Options = t('quiz.q4Options')

  const steps = [
    // Step 0 — Role
    <div key="role">
      <p style={labelStyle}>{t('quiz.q1Label')}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {q1Options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setAnswers({ ...answers, role: opt })}
            style={{
              ...optionBtn,
              borderColor: answers.role === opt ? '#F97316' : '#e5e7eb',
              backgroundColor: answers.role === opt ? '#FFF7ED' : '#fff',
              color: answers.role === opt ? '#F97316' : '#333',
            }}
          >
            {[<Home size={18} color="#F97316" />, <Trophy size={18} color="#F97316" />, <Sprout size={18} color="#F97316" />, <PawPrint size={18} color="#F97316" />][i]}
            {opt}
          </button>
        ))}
      </div>
    </div>,

    // Step 1 — Breed
    <div key="breed">
      <p style={labelStyle}>{t('quiz.q2Label')}</p>
      <select
        value={answers.breed}
        onChange={(e) => setAnswers({ ...answers, breed: e.target.value })}
        style={selectStyle}
      >
        <option value="">{t('quiz.q2Placeholder')}</option>
        {breedOptions.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>
    </div>,

    // Step 2 — City
    <div key="city">
      <p style={labelStyle}>{t('quiz.q3Label')}</p>
      <select
        value={answers.city}
        onChange={(e) => setAnswers({ ...answers, city: e.target.value })}
        style={selectStyle}
      >
        <option value="">{t('quiz.q3Placeholder')}</option>
        {cityOptions.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>,

    // Step 3 — Goal
    <div key="goal">
      <p style={labelStyle}>{t('quiz.q4Label')}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {q4Options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setAnswers({ ...answers, goal: opt })}
            style={{
              ...optionBtn,
              borderColor: answers.goal === opt ? '#F97316' : '#e5e7eb',
              backgroundColor: answers.goal === opt ? '#FFF7ED' : '#fff',
              color: answers.goal === opt ? '#F97316' : '#333',
            }}
          >
            {[<Heart size={18} color="#F97316" />, <Star size={18} color="#F97316" />, <Sparkles size={18} color="#F97316" />, <Search size={18} color="#F97316" />][i]}
            {opt}
          </button>
        ))}
      </div>
    </div>,
  ]

  const canProceed = [
    !!answers.role,
    !!answers.breed,
    !!answers.city,
    !!answers.goal,
  ][step]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        fontFamily: 'Space Grotesk, sans-serif',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 26 }}
        style={{
          backgroundColor: '#fff',
          borderRadius: 28,
          padding: '40px 36px',
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🐾</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#000', margin: '0 0 8px' }}>
            {t('quiz.title')}
          </h2>
          <p style={{ fontSize: 14, color: '#888', fontWeight: 500 }}>
            {user?.displayName ? `${user.displayName}, ` : ''}{t('quiz.subtitle')}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginBottom: 8, fontSize: 12, fontWeight: 700, color: '#999',
          }}>
            <span>{t('quiz.stepOf', step + 1, TOTAL_STEPS)}</span>
            <span style={{ color: '#F97316' }}>{Math.round(((step + 1) / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div style={{ height: 6, backgroundColor: '#F3F4F6', borderRadius: 999, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ height: '100%', backgroundColor: '#F97316', borderRadius: 999 }}
            />
          </div>
        </div>

        {/* Step content */}
        <div style={{ minHeight: 200 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.25 }}
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          {step > 0 && (
            <button
              onClick={goBack}
              style={{
                flex: '0 0 auto',
                padding: '13px 20px',
                borderRadius: 14,
                border: '1.5px solid #e5e7eb',
                backgroundColor: '#fff',
                color: '#333',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
            >
              {t('quiz.back')}
            </button>
          )}

          <button
            onClick={goNext}
            disabled={!canProceed}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 14,
              border: 'none',
              backgroundColor: canProceed ? '#F97316' : '#e5e7eb',
              color: canProceed ? '#fff' : '#aaa',
              fontSize: 15,
              fontWeight: 800,
              cursor: canProceed ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
            onMouseEnter={(e) => { if (canProceed) e.currentTarget.style.backgroundColor = '#EA6A00' }}
            onMouseLeave={(e) => { if (canProceed) e.currentTarget.style.backgroundColor = '#F97316' }}
          >
            {step === TOTAL_STEPS - 1 ? t('quiz.finish') : t('quiz.next')}
          </button>
        </div>

        <button
          onClick={skipQuiz}
          style={{
            display: 'block', width: '100%', marginTop: 14, background: 'none',
            border: 'none', cursor: 'pointer', fontSize: 13, color: '#bbb',
            fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif',
          }}
        >
          {t('quiz.skip')}
        </button>
      </motion.div>
    </div>
  )
}

const labelStyle = {
  fontSize: 18,
  fontWeight: 800,
  color: '#000',
  marginBottom: 16,
  lineHeight: 1.4,
}

const optionBtn = {
  width: '100%',
  padding: '14px 18px',
  borderRadius: 14,
  border: '1.5px solid #e5e7eb',
  backgroundColor: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  fontSize: 15,
  fontWeight: 700,
  textAlign: 'left',
  transition: 'all 0.15s',
  fontFamily: 'Space Grotesk, sans-serif',
}

const selectStyle = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 14,
  border: '1.5px solid #e5e7eb',
  fontSize: 15,
  fontFamily: 'Space Grotesk, sans-serif',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  backgroundColor: '#fff',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23F97316' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: 44,
}
