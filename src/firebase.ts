import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCOddQKpbTQ6Pc4v0HlpGPpHXm3s_RhC6I",
  authDomain: "syrian-series.firebaseapp.com",
  projectId: "syrian-series",
  storageBucket: "syrian-series.firebasestorage.app",
  messagingSenderId: "1052594174245",
  appId: "1:1052594174245:web:8d2fd5f894f664250342cc",
  measurementId: "G-5T3P2BXSDZ"
}

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()