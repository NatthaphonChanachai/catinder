import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth'
import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore'
import { auth, googleProvider, db, isFirebaseConfigured } from '../firebase'

const AuthContext = createContext(null)

async function loadOrCreateUserProfile(firebaseUser) {
  try {
    const ref = doc(db, 'users', firebaseUser.uid)
    const snap = await getDoc(ref)
    if (snap.exists()) return { profile: snap.data(), isNew: false }

    // New user — always 'user' role. Admin must be set manually in Firestore Console.
    const profile = {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL || '',
      role: 'user',
      location: '',
      bio: '',
      profileSetupDone: false,
      createdAt: serverTimestamp(),
    }
    await setDoc(ref, profile)
    return { profile, isNew: true }
  } catch (err) {
    console.error('[Catinder] Firestore error:', err.message)
    // Return a minimal profile so the app doesn't crash even if Firestore is unavailable
    const fallback = {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL || '',
      role: 'user',
      profileSetupDone: false,
    }
    return { profile: fallback, isNew: true, firestoreError: err.message }
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false)
  const [firestoreReady, setFirestoreReady] = useState(true)
  const [authMode, setAuthMode] = useState('signin')

  useEffect(() => {
    if (!isFirebaseConfigured) { setLoading(false); return }
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const { profile, isNew, firestoreError } = await loadOrCreateUserProfile(firebaseUser)
        if (firestoreError) setFirestoreReady(false)
        else setFirestoreReady(true)
        setUserProfile(profile)
        const localSetupDone = localStorage.getItem(`profileSetup_${firebaseUser.uid}`)
        const needsSetup = (isNew || !profile.profileSetupDone) && !localSetupDone
        if (needsSetup) {
          setNeedsProfileSetup(true)
        } else {
          const quizDone = profile.quizDone || localStorage.getItem(`catinder_quiz_${firebaseUser.uid}`)
          if (!quizDone) setShowQuiz(true)
        }
      } else {
        setUserProfile(null)
        setNeedsProfileSetup(false)
        setFirestoreReady(true)
      }
      setLoading(false)
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

  const saveProfileSetup = async (displayName, photoURL) => {
    if (!user) return
    // Mark in localStorage immediately so modal never shows again even if Firestore fails
    localStorage.setItem(`profileSetup_${user.uid}`, '1')
    try {
      await firebaseUpdateProfile(user, {
        displayName: displayName || 'ผู้ใช้',
        photoURL: photoURL || '',
      })
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName || 'ผู้ใช้',
        photoURL: photoURL || '',
        profileSetupDone: true,
      })
      await refreshProfile()
    } catch (err) {
      console.error('saveProfileSetup error:', err)
    }
    setNeedsProfileSetup(false)
    try {
      const snap = await getDoc(doc(db, 'users', user.uid))
      const latestProfile = snap.exists() ? snap.data() : {}
      const quizAlreadyDone = latestProfile.quizDone || localStorage.getItem(`catinder_quiz_${user.uid}`)
      if (!quizAlreadyDone) setShowQuiz(true)
    } catch {
      if (!localStorage.getItem(`catinder_quiz_${user.uid}`)) setShowQuiz(true)
    }
  }

  const updateUserProfile = async (displayName, photoURL) => {
    if (!user) return { error: 'no user' }
    try {
      await firebaseUpdateProfile(user, {
        displayName: displayName || user.displayName,
        photoURL: photoURL !== undefined ? (photoURL || '') : (user.photoURL || ''),
      })
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName || user.displayName,
        ...(photoURL !== undefined ? { photoURL: photoURL || '' } : {}),
      })
      await refreshProfile()
      return { success: true }
    } catch (err) {
      return { error: err.message }
    }
  }

  const logout = async () => {
    if (!isFirebaseConfigured) return
    await signOut(auth)
    setUser(null)
    setUserProfile(null)
    setNeedsProfileSetup(false)
  }

  const openAuthModal = (mode = 'signin') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }
  const closeAuthModal = () => setShowAuthModal(false)

  const completeQuiz = async (answers) => {
    if (user) {
      localStorage.setItem(`catinder_quiz_${user.uid}`, JSON.stringify(answers))
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          quizDone: true,
          quizAnswers: answers,
          quizCompletedAt: serverTimestamp(),
        })
        setUserProfile((prev) => prev ? { ...prev, quizDone: true, quizAnswers: answers } : prev)
      } catch (err) {
        console.error('completeQuiz error:', err)
      }
    }
    setShowQuiz(false)
  }
  const skipQuiz = async () => {
    if (user) {
      localStorage.setItem(`catinder_quiz_${user.uid}`, 'skipped')
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          quizDone: true,
          quizSkipped: true,
        })
        setUserProfile((prev) => prev ? { ...prev, quizDone: true } : prev)
      } catch (err) {
        console.error('skipQuiz error:', err)
      }
    }
    setShowQuiz(false)
  }

  const refreshProfile = async () => {
    if (!user) return
    try {
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (snap.exists()) setUserProfile(snap.data())
    } catch {}
  }

  const isAdmin = userProfile?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      user, userProfile, loading,
      showAuthModal, showQuiz, needsProfileSetup,
      authMode, isAdmin, firestoreReady,
      openAuthModal, closeAuthModal,
      signInWithGoogle, signInWithEmail, signUpWithEmail,
      saveProfileSetup, updateUserProfile,
      logout, completeQuiz, skipQuiz, refreshProfile,
      isConfigured: isFirebaseConfigured,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
