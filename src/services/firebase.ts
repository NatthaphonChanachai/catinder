import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { type Auth, GoogleAuthProvider, getAuth } from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";
import { type FirebaseStorage, getStorage } from "firebase/storage";

// Same Firebase project as the legacy app (legacy-vite/src/firebase.js) —
// schema/collections are unchanged: users, cats, likes, passes, matches,
// chats, directory, venues, bookings, catDocuments, pedigreeRequests, supportChats.
const firebaseConfig = {
  apiKey: "AIzaSyAsI2iAszx2Idrk5j1Dj2jIgq1YR7CIsRA",
  authDomain: "catinder-d4c54.firebaseapp.com",
  projectId: "catinder-d4c54",
  storageBucket: "catinder-d4c54.firebasestorage.app",
  messagingSenderId: "223175177569",
  appId: "1:223175177569:web:7b64dbc5c755db4b0d8120",
  measurementId: "G-10E0SNRRJV",
};

const app: FirebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

export default app;
