import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your Firebase configuration for React Native (iOS/Android)
// Updated with correct iOS values from GoogleService-Info.plist
const firebaseConfig = {
  apiKey: "AIzaSyBxR_jTxzxAr-4tZXKtHttR8FTFmR8WSvs",
  authDomain: "yums-food.firebaseapp.com",
  projectId: "yums-food",
  storageBucket: "yums-food.firebasestorage.app",
  messagingSenderId: "609112477058",
  appId: "1:609112477058:ios:012ee210be6e4afc1ad39b",
  measurementId: "G-CFLCRCWXXT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
