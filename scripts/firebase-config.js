// scripts/firebase-config.js
// ใช้ CDN URL เพื่อให้ทำงานได้บน Browser โดยไม่ต้องตั้งค่า Bundler เพิ่มเติม
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBwfM8-ksMj17-K5fWMjn83U9MRO0ZvL2Y",
  authDomain: "physics-and-earthscience-quiz.firebaseapp.com",
  projectId: "physics-and-earthscience-quiz",
  storageBucket: "physics-and-earthscience-quiz.firebasestorage.app",
  messagingSenderId: "306857385894",
  appId: "1:306857385894:web:b4179e9f8818d80b53f967",
  measurementId: "G-QWQGBGNPDJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export { app, analytics, auth, db, googleProvider };
