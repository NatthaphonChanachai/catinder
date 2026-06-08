import { createContext, useContext, useState } from 'react'
import en from '../i18n/en'
import th from '../i18n/th'

const LanguageContext = createContext(null)

const langs = { en, th }

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('catinder_lang') || 'en'
  })

  const toggleLang = () => {
    const next = lang === 'en' ? 'th' : 'en'
    setLang(next)
    localStorage.setItem('catinder_lang', next)
  }

  // t('nav.signIn') → looks up nested key in translation object
  const t = (keyPath, ...args) => {
    const keys = keyPath.split('.')
    let value = langs[lang]
    for (const key of keys) {
      value = value?.[key]
      if (value === undefined) return keyPath
    }
    if (typeof value === 'function') return value(...args)
    return value
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
