import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyAsI2iAszx2Idrk5j1Dj2jIgq1YR7CIsRA",
  authDomain: "catinder-d4c54.firebaseapp.com",
  projectId: "catinder-d4c54",
  storageBucket: "catinder-d4c54.firebasestorage.app",
  messagingSenderId: "223175177569",
  appId: "1:223175177569:web:7b64dbc5c755db4b0d8120",
  measurementId: "G-10E0SNRRJV"
}

export const isFirebaseConfigured = true

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
export const storage = getStorage(app)
export const analytics = getAnalytics(app)

export default app
