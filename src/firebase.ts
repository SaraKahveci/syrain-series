// import { initializeApp } from 'firebase/app'


// const firebaseConfig = {
//   apiKey: 'YOUR_API_KEY',
//   authDomain: 'YOUR_AUTH_DOMAIN',
//   projectId: 'YOUR_PROJECT_ID',
//   appId: 'YOUR_APP_ID',
// }

// const app = initializeApp(firebaseConfig)
// 
// // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCOddQKpbTQ6Pc4v0HlpGPpHXm3s_RhC6I",
  authDomain: "syrian-series.firebaseapp.com",
  projectId: "syrian-series",
  storageBucket: "syrian-series.firebasestorage.app",
  messagingSenderId: "1052594174245",
  appId: "1:1052594174245:web:8d2fd5f894f664250342cc",
  measurementId: "G-5T3P2BXSDZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app)