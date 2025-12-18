 import { auth, googleProvider, db } from './firebase-init.js';
 import { Gamification } from './gamification.js';
 
 export function initializeAuth() {
     const game = new Gamification(db); // ส่ง db instance เข้าไป
 
     const loginBtn = document.getElementById('main-header-login-btn');
     const profileLink = document.getElementById('main-header-profile-link');
     const logoutBtn = document.getElementById('main-header-logout-btn');
 
     // ซ่อนปุ่มโปรไฟล์และ logout เริ่มต้น
     if (profileLink) profileLink.style.display = 'none';
     if (logoutBtn) logoutBtn.style.display = 'none';
 
     // จัดการการ Login
     if (loginBtn) {
         loginBtn.addEventListener('click', () => {
             auth.signInWithPopup(googleProvider).catch(error => {
                 console.error("Login failed:", error);
                 alert(`Login failed: ${error.message}`);
             });
         });
     }
 
     // จัดการการ Logout
     if (logoutBtn) {
         logoutBtn.addEventListener('click', () => {
             auth.signOut();
         });
     }
 
     // Listener ตรวจสอบสถานะการ Login
     auth.onAuthStateChanged(async (user) => {
         if (user) {
             // --- ผู้ใช้ Login แล้ว ---
             if (loginBtn) loginBtn.style.display = 'none';
             if (profileLink) profileLink.style.display = 'flex';
             if (logoutBtn) logoutBtn.style.display = 'flex';
 
             // Handle the entire login flow, including data loading and potential migration
             await game.handleLogin(user);
 
         } else {
             // --- ผู้ใช้ Logout หรือยังไม่ได้ Login ---
             if (loginBtn) loginBtn.style.display = 'flex';
             if (profileLink) profileLink.style.display = 'none';
             if (logoutBtn) logoutBtn.style.display = 'none';
 
             // Logout จากระบบ Gamification
             game.logout();
         }
     });
 
     return game; // ส่ง instance ของ game กลับไปให้ส่วนอื่นใช้ต่อได้
 }