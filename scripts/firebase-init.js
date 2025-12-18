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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

 export const db = firebase.firestore();
 export const auth = firebase.auth();
 export const googleProvider = new firebase.auth.GoogleAuthProvider();