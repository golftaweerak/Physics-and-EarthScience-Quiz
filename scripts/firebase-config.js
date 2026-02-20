// scripts/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, memoryLocalCache, getFirestore, enableNetwork } from "firebase/firestore";


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

// Initialize Firestore with persistent cache settings (New API)


let db;
// OPTIMIZED: Use memory cache by default for better performance on iOS/Mobile
// Persistent cache (IndexedDB) can cause significant startup lag on some devices.
try {
    db = initializeFirestore(app, {
        localCache: memoryLocalCache()
    });
} catch (e) {
    console.warn("Firestore persistence failed, falling back to default:", e);
    // iOS often falls back here anyway if multiple tabs are open or storage is restricted
    db = getFirestore(app);
}

// FIX: iOS Safari aggressively suspends WebSockets and IndexedDB when the app is backgrounded.
// This listener forces Firestore to reconnect its network immediately upon foregrounding,
// preventing "infinite loading" loops when joining or starting lobbies.
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        console.log("[Firebase] App foregrounded. Forcing network reconnect for iOS compatibility.");
        if (db) {
            enableNetwork(db).catch(err => console.error("Error enabling network:", err));
        }
    }
});

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export { app, analytics, auth, db, googleProvider };
