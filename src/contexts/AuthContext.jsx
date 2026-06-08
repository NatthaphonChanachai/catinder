import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [authMode, setAuthMode] = useState('signin') // 'signin' | 'signup'

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
      if (firebaseUser) {
        // Show quiz if first time login (no quiz completed in localStorage)
        const quizDone = localStorage.getItem(`catinder_quiz_${firebaseUser.uid}`)
        if (!quizDone) {
          setShowQuiz(true)
        }
      }
    })
    return unsub
  }, [])

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) return { error: 'not_configured' }
    try {
      const result = await signInWithPopup(auth, googleProvider)
      setShowAuthModal(false)
      return { user: result.user }
    } catch (err) {
      return { error: err.message }
    }
  }

  const signInWithEmail = async (email, password) => {
    if (!isFirebaseConfigured) return { error: 'not_configured' }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      setShowAuthModal(false)
      return { user: result.user }
    } catch (err) {
      return { error: err.message }
    }
  }

  const signUpWithEmail = async (email, password) => {
    if (!isFirebaseConfigured) return { error: 'not_configured' }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      setShowAuthModal(false)
      return { user: result.user }
    } catch (err) {
      return { error: err.message }
    }
  }

  const logout = async () => {
    if (!isFirebaseConfigured) return
    await signOut(auth)
    setUser(null)
  }

  const openAuthModal = (mode = 'signin') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  const closeAuthModal = () => setShowAuthModal(false)

  const completeQuiz = (answers) => {
    if (user) {
      localStorage.setItem(`catinder_quiz_${user.uid}`, JSON.stringify(answers))
    }
    setShowQuiz(false)
  }

  const skipQuiz = () => {
    if (user) {
      localStorage.setItem(`catinder_quiz_${user.uid}`, 'skipped')
    }
    setShowQuiz(false)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      showAuthModal,
      showQuiz,
      authMode,
      openAuthModal,
      closeAuthModal,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      logout,
      completeQuiz,
      skipQuiz,
      isConfigured: isFirebaseConfigured,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
