import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Сюда потом скопируем настройки из Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAkIJaJoKaLGPAs68Tibdtk4tY-ckkqqN0",
  authDomain: "delivery-hookah-60e88.firebaseapp.com",
  projectId: "delivery-hookah-60e88",
  storageBucket: "delivery-hookah-60e88.firebasestorage.app",
  messagingSenderId: "342314450326",
  appId: "1:342314450326:web:a7653b4e73cea35bcff1b7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
