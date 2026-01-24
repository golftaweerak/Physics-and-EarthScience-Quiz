import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Gamification, XP_THRESHOLDS } from '../scripts/gamification.js';

// Mock AuthManager dependency
vi.mock('../scripts/auth-manager.js', () => ({
  authManager: {
    onUserChange: vi.fn(() => () => { }),
    loadUserData: vi.fn().mockResolvedValue({}),
    saveUserData: vi.fn().mockResolvedValue({}),
    currentUser: null
  }
}));

// Mock toast and utils
vi.mock('../scripts/toast.js', () => ({
  showToast: vi.fn()
}));

describe('Gamification System', () => {
  let game;

  beforeEach(() => {
    localStorage.clear();
    // Create new instance
    game = new Gamification();
  });

  afterEach(() => {
    if (game && game.destroy) game.destroy();
  });

  describe('Initialization', () => {
    it('should initialize with default level 1 and 0 XP', () => {
      // Need to access state. Since constructor is async-ish with loadUserData, 
      // we might need to wait or check default state immediately.
      expect(game.state.level).toBe(1);
      expect(game.state.xp).toBe(0);
    });
  });

  describe('XP Thresholds', () => {
    it('should have valid threshold data', () => {
      expect(Array.isArray(XP_THRESHOLDS)).toBe(true);
      expect(XP_THRESHOLDS.length).toBeGreaterThan(0);
      expect(XP_THRESHOLDS[0]).toHaveProperty('xp');
    });
  });
});
