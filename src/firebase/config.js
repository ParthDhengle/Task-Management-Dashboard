// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBLfhnP9gOGMx4P19VoneD1uO1pHfF9F68",
  authDomain: "task-management-dashboar-94ce5.firebaseapp.com",
  projectId: "task-management-dashboar-94ce5",
  storageBucket: "task-management-dashboar-94ce5.firebasestorage.app",
  messagingSenderId: "864099659153",
  appId: "1:864099659153:web:f0cdb745afb5e6cdc27e30",
  measurementId: "G-NBL4JDFVTP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;