import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authManager } from '../scripts/auth-manager.js';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDoc, setDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import { showToast } from '../scripts/toast.js';

// Mock dependencies
vi.mock('../scripts/firebase-config.js', () => ({
  auth: { currentUser: null },
  db: {},
  googleProvider: {}
}));

vi.mock('../scripts/toast.js', () => ({
  showToast: vi.fn()
}));

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  GoogleAuthProvider: class { }
}));

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => {
  const batchMock = {
    delete: vi.fn(),
    set: vi.fn(),
    commit: vi.fn().mockResolvedValue(true)
  };
  return {
    doc: vi.fn(),
    collection: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    writeBatch: vi.fn(() => batchMock),
    terminate: vi.fn()
  };
});

describe('AuthManager', () => {
  let authStateCallback;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();

    // Capture the onAuthStateChanged callback
    onAuthStateChanged.mockImplementation((auth, cb) => {
      authStateCallback = cb;
      return () => { }; // Unsubscribe function
    });

    // Reset singleton state if needed
    authManager.currentUser = null;
    authManager.isInitialized = false;

    // Mock global location
    delete window.location;
    window.location = { href: '', reload: vi.fn(), pathname: '/' };

    // Default mocks to prevent stale return values leaking across tests
    getDoc.mockResolvedValue({ exists: () => false });
    getDocs.mockResolvedValue({ forEach: vi.fn() });
  });

  it('should initialize and listen to auth state changes', () => {
    authManager.init();
    expect(onAuthStateChanged).toHaveBeenCalled();
  });

  it('should handle login success', async () => {
    const mockUser = { uid: 'user123', displayName: 'Test User' };
    signInWithPopup.mockResolvedValue({ user: mockUser });

    await authManager.login();

    expect(signInWithPopup).toHaveBeenCalled();
    expect(sessionStorage.getItem('login_toast')).toBe('true');
    expect(window.location.href).toContain('profile.html');
  });

  it('should handle logout success', async () => {
    authManager.currentUser = { uid: 'user123' };

    await authManager.logout();

    expect(signOut).toHaveBeenCalled();
    expect(sessionStorage.getItem('logout_toast')).toBe('true');
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('should sync local data to cloud on first login (if cloud is empty)', async () => {
    // Setup scenarios
    localStorage.setItem('app_gamification_data', JSON.stringify({ level: 5, totalXP: 1000 }));

    const mockUser = { uid: 'user123' };
    const mockDocSnap = { exists: () => false }; // Cloud empty
    getDoc.mockResolvedValue(mockDocSnap);

    // Call syncLocalToCloud directly to avoid async timing issues in init()
    await authManager.syncLocalToCloud(mockUser);

    // Verify setDoc was called to upload data
    expect(setDoc).toHaveBeenCalled();
  });

  it('should sync cloud data to local on login (if cloud exists)', async () => {
    // IMPORTANT: syncLocalToCloud only runs if local data exists (conflict resolution).
    // So we must seed local storage.
    localStorage.setItem('app_gamification_data', JSON.stringify({ level: 1, totalXP: 0 }));

    const cloudData = { level: 10, totalXP: 2000 };
    const mockUser = { uid: 'user123' };
    const mockDocSnap = {
      exists: () => true,
      data: () => cloudData
    };
    getDoc.mockResolvedValue(mockDocSnap);

    // Call syncLocalToCloud directly
    await authManager.syncLocalToCloud(mockUser);

    const localData = JSON.parse(localStorage.getItem('app_gamification_data'));
    expect(localData).toEqual(cloudData);
  });

  it('should clear data when switching accounts', async () => {
    // 1. Login as User A
    authManager.currentUser = { uid: 'A' };
    localStorage.setItem('app_gamification_data', 'DATA_A');

    // 2. Switch to User B
    const userB = { uid: 'B' };

    if (authStateCallback) {
      await authStateCallback(userB);
    }

    // Should have cleared User A's data
    expect(localStorage.getItem('app_gamification_data')).toBeNull();
  });

  it('should download cloud data even when localStorage is initially empty (new device)', async () => {
    const cloudData = { level: 7, xp: 1450, totalXP: 1450 };
    const mockUser = { uid: 'new-device-user' };
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => cloudData
    });

    expect(localStorage.getItem('app_gamification_data')).toBeNull();

    await authManager.syncLocalToCloud(mockUser);

    expect(JSON.parse(localStorage.getItem('app_gamification_data'))).toEqual(cloudData);
    expect(localStorage.getItem('last_cloud_sync')).toBeTruthy();
  });

  it('should use showToast (never blocking alert) when migrating local data on first login', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    localStorage.setItem('app_gamification_data', JSON.stringify({ level: 3, totalXP: 400 }));
    getDoc.mockResolvedValue({ exists: () => false });

    await authManager.syncLocalToCloud({ uid: 'first-login', displayName: 'Student', photoURL: '' });

    expect(setDoc).toHaveBeenCalled();
    expect(showToast).toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('should clear customQuizzesList on logout', async () => {
    authManager.currentUser = { uid: 'user123' };
    localStorage.setItem('customQuizzesList', JSON.stringify([{ customId: 'custom_1' }]));

    await authManager.logout();

    expect(localStorage.getItem('customQuizzesList')).toBeNull();
  });
});
