// scripts/auth-manager.js
import { auth, db, googleProvider } from './firebase-config.js';
import { signInWithRedirect, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, writeBatch, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

class AuthManagerInternal {
    constructor() {
        this.currentUser = null;
        this.onUserChangeCallbacks = [];
        this.isInitialized = false;
        this.LOCAL_STORAGE_KEY = 'app_gamification_data'; // คีย์หลักที่คุณใช้เก็บข้อมูลใน LocalStorage
        
        // Promise เพื่อรอให้ตรวจสอบ Auth เสร็จสิ้นครั้งแรก
        this.authReadyPromise = new Promise((resolve) => {
            this.resolveAuthReady = resolve;
        });
        
        this.init();
    }

    init() {
        onAuthStateChanged(auth, async (user) => {
            this.isInitialized = true;
            this.currentUser = user;
            if (user) {
                console.log("User signed in:", user.uid);
                await this.syncLocalToCloud(user);
                await this.syncHistory(user); // ซิงค์ประวัติการทำข้อสอบ
            } else {
                console.log("User signed out");
            }
            this.notifyUserChange(user);
            
            // แจ้งว่า Auth ตรวจสอบเสร็จแล้ว (ไม่ว่าจะล็อกอินหรือไม่)
            if (this.resolveAuthReady) {
                this.resolveAuthReady(user);
                this.resolveAuthReady = null; // เรียกแค่ครั้งเดียว
            }
        });
    }

    // ฟังก์ชัน Login
    async login() {
        try {
            await signInWithRedirect(auth, googleProvider);
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    }

    // ฟังก์ชัน Logout
    async logout() {
        try {
            await signOut(auth);
            // Optional: ล้างหน้าจอหรือรีโหลด
            window.location.reload();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    // ลงทะเบียน Callback เพื่ออัปเดต UI เมื่อสถานะล็อกอินเปลี่ยน
    onUserChange(callback) {
        this.onUserChangeCallbacks.push(callback);
        if (this.isInitialized) {
            callback(this.currentUser);
        }
    }

    notifyUserChange(user) {
        this.onUserChangeCallbacks.forEach(cb => cb(user));
    }

    // ฟังก์ชันสำหรับรอให้ Auth พร้อมใช้งาน
    async waitForAuthReady() {
        await this.authReadyPromise;
        return this.currentUser;
    }

    // --- ส่วนจัดการข้อมูล (Data Sync) ---

    // ฟังก์ชันหลักสำหรับโหลดข้อมูล (ใช้แทนการดึง localStorage โดยตรง)
    async loadUserData() {
        if (this.currentUser) {
            // ถ้าล็อกอิน ให้ดึงจาก Firestore
            const docRef = doc(db, "users", this.currentUser.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const cloudData = docSnap.data();
                // อัปเดตลง LocalStorage ด้วยเพื่อให้โค้ดเดิมทำงานต่อได้ (Hybrid)
                localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(cloudData));
                this.updateLastSyncTime();
                return cloudData;
            }
        }
        
        // ถ้าไม่ล็อกอิน หรือไม่มีข้อมูลบน Cloud ให้ดึงจาก LocalStorage
        const localData = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        return localData ? JSON.parse(localData) : null;
    }

    // ฟังก์ชันหลักสำหรับบันทึกข้อมูล (ใช้แทนการ setItem)
    async saveUserData(data) {
        // 1. บันทึกลง LocalStorage เสมอ (เพื่อความเร็วและ Offline เบื้องต้น)
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(data));

        // 2. ถ้าล็อกอิน ให้บันทึกลง Firestore ด้วย
        if (this.currentUser) {
            try {
                const userRef = doc(db, "users", this.currentUser.uid);
                // ใช้ setDoc แบบ merge: true เพื่อไม่ให้ข้อมูลอื่นหาย
                await setDoc(userRef, data, { merge: true });
                this.updateLastSyncTime();
                
                // อัปเดต Leaderboard (ถ้ามี)
                if (data.totalXP) {
                    const leaderboardRef = doc(db, "leaderboard", this.currentUser.uid);
                    await setDoc(leaderboardRef, {
                        displayName: this.currentUser.displayName || "Anonymous",
                        photoURL: this.currentUser.photoURL,
                        totalXP: data.totalXP,
                        level: data.level || 1,
                        lastUpdated: new Date()
                    }, { merge: true });
                }
            } catch (e) {
                console.error("Error saving to cloud:", e);
            }
        }
    }

    // ฟังก์ชัน Sync ข้อมูลเก่าขึ้น Cloud เมื่อล็อกอินครั้งแรก
    async syncLocalToCloud(user) {
        const localDataString = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        if (!localDataString) return; // ไม่มีข้อมูลเก่า ไม่ต้องทำอะไร

        const localData = JSON.parse(localDataString);
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            // กรณี: ผู้ใช้ใหม่บน Cloud แต่มีข้อมูลในเครื่อง (ผู้เรียนเก่าเพิ่งล็อกอิน)
            // ให้อัปโหลดข้อมูลในเครื่องขึ้น Cloud ทันที
            console.log("Migrating local data to cloud...");
            await setDoc(userRef, localData);
            
            // สร้าง Leaderboard entry ด้วย
            if (localData.totalXP) {
                await setDoc(doc(db, "leaderboard", user.uid), {
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    totalXP: localData.totalXP,
                    level: localData.level || 1,
                    lastUpdated: new Date()
                });
            }
            alert("ซิงค์ข้อมูลเก่าของคุณขึ้นระบบเรียบร้อยแล้ว!");
        } else {
            // กรณี: มีข้อมูลบน Cloud อยู่แล้ว (อาจจะเล่นเครื่องอื่นมา)
            // กลยุทธ์: ใช้ข้อมูลบน Cloud เป็นหลัก (Overwrite Local)
            // หรือถ้าคุณต้องการ Logic ที่ซับซ้อนกว่านี้ (เช่น เอา XP ที่มากกว่า) ก็แก้ตรงนี้ได้
            console.log("Found cloud data, syncing to local...");
            const cloudData = docSnap.data();
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(cloudData));
        }
    }

    // บันทึกเวลาซิงค์ล่าสุดและแจ้งเตือน UI
    updateLastSyncTime() {
        const now = new Date().toISOString();
        localStorage.setItem('last_cloud_sync', now);
        // ส่ง Event ให้หน้าจออื่นรับรู้
        window.dispatchEvent(new CustomEvent('auth-synced', { detail: { time: now } }));
    }

    getLastSyncTime() {
        return localStorage.getItem('last_cloud_sync');
    }

    // --- ส่วนจัดการการลบข้อมูล (Deletion Management) ---

    /**
     * ลบประวัติการทำแบบทดสอบ 1 รายการ ทั้งใน LocalStorage และ Firestore
     * @param {string} key - The storage key of the quiz history to delete (e.g., 'quizState-...')
     */
    async deleteQuizHistoryItem(key) {
        localStorage.removeItem(key); // Remove from local
        if (this.currentUser) {
            try {
                const docRef = doc(db, "users", this.currentUser.uid, "quiz_history", key);
                await deleteDoc(docRef);
                console.log(`Deleted history item ${key} from cloud.`);
            } catch (e) {
                console.error("Error deleting quiz history item from cloud:", e);
            }
        }
    }

    /**
     * รีเซ็ตข้อมูล Gamification ทั้งหมด (XP, Level, Badges)
     */
    async resetGamificationData() {
        localStorage.removeItem(this.LOCAL_STORAGE_KEY); // Remove from local
        if (this.currentUser) {
            try {
                const batch = writeBatch(db);
                const userDocRef = doc(db, "users", this.currentUser.uid);
                const leaderboardDocRef = doc(db, "leaderboard", this.currentUser.uid);
                
                // ลบข้อมูลผู้ใช้และข้อมูลบน Leaderboard
                batch.delete(userDocRef);
                batch.delete(leaderboardDocRef);
                
                await batch.commit();
                console.log("Deleted user gamification and leaderboard data from cloud.");
            } catch (e) {
                console.error("Error resetting gamification data on cloud:", e);
            }
        }
    }

    /**
     * ลบประวัติการทำข้อสอบและแบบทดสอบที่สร้างเองทั้งหมดจาก Cloud
     */
    async clearAllCloudHistory() {
        if (!this.currentUser) return;

        const batch = writeBatch(db);
        let deletedCount = 0;

        try {
            // ลบ quiz_history ทั้งหมด
            const historyRef = collection(db, "users", this.currentUser.uid, "quiz_history");
            const historySnapshot = await getDocs(historyRef);
            historySnapshot.forEach(doc => { batch.delete(doc.ref); deletedCount++; });

            // ลบ custom_quizzes ทั้งหมด
            const customQuizzesRef = collection(db, "users", this.currentUser.uid, "custom_quizzes");
            const customQuizzesSnapshot = await getDocs(customQuizzesRef);
            customQuizzesSnapshot.forEach(doc => { batch.delete(doc.ref); deletedCount++; });

            if (deletedCount > 0) await batch.commit();
            console.log(`Successfully deleted ${deletedCount} history/custom quiz documents from cloud.`);
        } catch (e) {
            console.error("Error clearing all cloud history:", e);
        }
    }

    // --- ส่วนจัดการประวัติการทำข้อสอบ (Quiz History Sync) ---

    // ฟังก์ชันซิงค์ประวัติทั้งหมด (ทำงานตอนล็อกอิน)
    async syncHistory(user) {
        if (!user) return;
        
        const historyRef = collection(db, "users", user.uid, "quiz_history");
        
        try {
            // 1. ดึงข้อมูลจาก Cloud มาเทียบ
            const cloudSnapshot = await getDocs(historyRef);
            const cloudMap = new Map();
            cloudSnapshot.forEach(doc => {
                cloudMap.set(doc.id, doc.data());
            });

            const batch = writeBatch(db);
            let batchCount = 0;
            let hasChanges = false;

            // 2. วนลูปดูข้อมูลในเครื่อง (LocalStorage)
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                // เช็คว่าเป็น key ของประวัติข้อสอบหรือไม่
                if (key && key.startsWith('quizState-')) {
                    try {
                        const localData = JSON.parse(localStorage.getItem(key));
                        const cloudData = cloudMap.get(key);
                        
                        const localTime = localData.lastAttemptTimestamp || 0;
                        const cloudTime = cloudData ? (cloudData.lastAttemptTimestamp || 0) : -1;

                        if (localTime > cloudTime) {
                            // ถ้าข้อมูลในเครื่องใหม่กว่า -> อัปขึ้น Cloud
                            const docRef = doc(historyRef, key);
                            batch.set(docRef, localData);
                            batchCount++;
                            hasChanges = true;
                        } else if (cloudTime > localTime) {
                            // ถ้าข้อมูลบน Cloud ใหม่กว่า -> ดึงลงเครื่อง
                            localStorage.setItem(key, JSON.stringify(cloudData));
                            hasChanges = true;
                        }
                    } catch (e) {
                        console.warn("Error syncing key:", key, e);
                    }
                }
            }

            // 3. เช็คข้อมูลที่มีบน Cloud แต่ไม่มีในเครื่อง (กรณีเครื่องใหม่)
            cloudMap.forEach((data, key) => {
                if (!localStorage.getItem(key)) {
                    localStorage.setItem(key, JSON.stringify(data));
                    hasChanges = true;
                }
            });

            if (batchCount > 0) {
                await batch.commit();
                console.log(`Uploaded ${batchCount} quiz history items.`);
            }
            
            if (hasChanges) {
                this.updateLastSyncTime();
            }
        } catch (e) {
            console.error("Error syncing history:", e);
        }
    }

    // ฟังก์ชันบันทึกประวัติรายข้อ (เรียกใช้ตอนทำข้อสอบ)
    async saveQuizHistoryItem(key, data) {
        if (!this.currentUser) return;
        try {
            // บันทึกลง Subcollection 'quiz_history' โดยใช้ key เป็น ID เอกสาร
            const docRef = doc(db, "users", this.currentUser.uid, "quiz_history", key);
            await setDoc(docRef, data, { merge: true });
            this.updateLastSyncTime();
        } catch (e) {
            console.error("Error saving quiz history item:", e);
        }
    }
}

// Create and export a single, shared instance of the AuthManager.
export const authManager = new AuthManagerInternal();
