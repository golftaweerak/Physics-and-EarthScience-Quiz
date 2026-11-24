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

// Mock SiteConfig for categories and proficiency groups
vi.mock('../scripts/site-config.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    SiteConfig: {
      categories: [
        { id: 'physicsXP', track: 'physics', keywords: ['physics'] },
        { id: 'earthXP', track: 'earth', keywords: ['earth'] }
      ],
      proficiencyGroups: {
        physics_concept: { field: 'physicsConceptXP', track: 'physics' },
        physics_calc: { field: 'physicsCalcXP', track: 'physics' }
      },
      trackTitles: { overall: [] }
    }
  };
});

describe('Gamification System', () => {
  let game;

  beforeEach(() => {
    localStorage.clear();
    game = new Gamification();
    // Override the Date to ensure consistent testing for daily limits
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
  });

  afterEach(() => {
    if (game && game.destroy) game.destroy();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default level 1 and 0 XP', () => {
      expect(game.state.level).toBe(1);
      expect(game.state.xp).toBe(0);
    });

    it('should migrate legacy users to correct level based on XP', () => {
      game.state.xp = 5000;
      game.state.legacyMigrated = false; // Trigger migration
      game.state.level = 1;

      game.ensureConsistency(); // This checks migration

      // Given 5000 XP, they should be well above level 1
      expect(game.state.legacyMigrated).toBe(true);
      expect(game.state.level).toBeGreaterThan(1);
    });
  });

  describe('XP Thresholds', () => {
    it('should have valid threshold data', () => {
      expect(Array.isArray(XP_THRESHOLDS)).toBe(true);
      expect(XP_THRESHOLDS.length).toBeGreaterThan(0);
      expect(XP_THRESHOLDS[0]).toHaveProperty('xp');
      expect(XP_THRESHOLDS[1].xp).toBeGreaterThan(XP_THRESHOLDS[0].xp);
    });
  });

  describe('XP and Level Up', () => {
    it('should add XP correctly using addXP', () => {
      game.addXP(150, 'physics', { shouldSave: false });
      expect(game.state.xp).toBe(150);
      expect(game.state.physicsXP).toBe(150);
    });

    it('should level up when enough XP is earned', () => {
      // Find XP needed for level 2
      const level2Requirement = XP_THRESHOLDS.find((t) => t.level === 2).xp;

      game.state.xp = level2Requirement - 10;
      game.state.correctStreak = 5; // Quest for level 2 is a streak of 5
      game.updateLevel();
      expect(game.getCurrentLevel().level).toBe(1);

      game.addXP(20, 'general', { shouldSave: false });
      expect(game.getCurrentLevel().level).toBe(2);
    });
  });

  describe('Anti-Farming & Economy Limits (submitQuizResult)', () => {
    const createQuestStats = (id) => ({
      quizId: id,
      category: 'Physics',
      correctAnswers: 10,
      totalQuestions: 10,
      percentage: 100,
      theoryXP: 20,
      calculationXP: 30,
      questionCount: 10,
      isCustomQuiz: false,
    });

    beforeEach(() => {
      // Clear state before these tests to ensure baseline
      game.state = {
        ...game.getDefaultState(),
        level: 1,
        xp: 0,
        legacyMigrated: true, // Prevent auto-migration inflating XP
        totalQuestionsAnswered: 0,
        accumulatedQuestionsForBonus: 0
      };
    });

    it('should give 100% XP on the first play of a quiz', () => {
      const stats = createQuestStats('q1');
      // Submits 100 base XP
      game.submitQuizResult(100, 100, 10, false, { physics_concept: 50 }, stats);

      // Should get full points assigned to physics track via identifyTrack fallback if not matched by group
      expect(game.state.xp).toBe(100);
      expect(game.state.physicsXP).toBeGreaterThanOrEqual(100);
    });

    it('should apply 50% diminishing returns on the second play of the same quiz in one day', () => {
      const stats = createQuestStats('q2');

      // First Play
      game.submitQuizResult(100, 100, 10, false, {}, stats);
      expect(game.state.xp).toBe(100);

      // Reset duplicate debounce by moving time forward
      vi.advanceTimersByTime(6000);

      // Second Play (Should give 50% = 50 XP + 20 Bonus, total = 170)
      game.submitQuizResult(100, 100, 10, false, {}, stats);
      expect(game.state.xp).toBe(170);
    });

    it('should apply 0% multiplier on the third play of the same quiz in one day', () => {
      const stats = createQuestStats('q3');

      // First Play (100)
      game.submitQuizResult(100, 100, 10, false, {}, stats);
      vi.advanceTimersByTime(6000);

      // Second Play (50 + 20 bonus)
      game.submitQuizResult(100, 100, 10, false, {}, stats);
      vi.advanceTimersByTime(6000);

      // Third Play (0)
      game.submitQuizResult(100, 100, 10, false, {}, stats);
      expect(game.state.xp).toBe(170);
    });

    it('should limit custom quizzes to 5 per day and give 0 XP on the 6th', () => {
      // First 5 standard custom quizzes
      for (let i = 0; i < 5; i++) {
        const stats = createQuestStats(`custom_${i}`);
        stats.isCustomQuiz = true;

        game.submitQuizResult(50, 100, 10, true, {}, stats);
        vi.advanceTimersByTime(6000);
      }

      // 5 * 50 = 250 XP earned so far from custom quizzes
      const xpAfter5 = game.state.xp;
      // It includes bonus XP. 5 quizzes * 10 questions = 50. Two 20-question steps (40 XP bonus). 250 + 40 = 290
      expect(xpAfter5).toBeGreaterThanOrEqual(250);

      // 6th Custom Quiz (Should be capped)
      const stats6 = createQuestStats('custom_6');
      stats6.isCustomQuiz = true;
      game.submitQuizResult(50, 100, 10, true, {}, stats6);

      // XP should not have increased
      expect(game.state.xp).toBe(xpAfter5);
      expect(game.state.customQuizDailyCounts.count).toBe(6);
    });

    it('should block rapid duplicate submissions under 5 seconds (Debounce)', () => {
      const stats = createQuestStats('q_rapid');

      // 1st submission
      game.submitQuizResult(100, 100, 10, false, {}, stats);
      expect(game.state.xp).toBe(100);

      // 2nd submission immediately (under 5 seconds)
      game.submitQuizResult(100, 100, 10, false, {}, stats);

      // Should be completely ignored, no XP, no play count increase
      expect(game.state.xp).toBe(100);
      expect(game.state.quizPlayHistory.plays['q_rapid']).toBe(1); // Play history shouldn't increment
    });
  });

  describe('Bug Fixes Regression (Skill Tree, Theme, Mystery Chest, Weekly Quest)', () => {
    it('should allow free first respec and paid second respec without crashing', () => {
      game.state.xp = 2000;
      game.state.level = 5;
      game.state.allocatedSkillPoints = 2;
      game.state.perkLevels = { xp_boost: 2 };
      game.state.unlockedPerks = ['xp_boost'];
      game.state.hasUsedFreeRespec = false;

      // 1st respec (free)
      const firstRespec = game.resetSkillPoints();
      expect(firstRespec.success).toBe(true);
      expect(firstRespec.isFree).toBe(true);
      expect(game.state.xp).toBe(2000);

      // Re-allocate and try 2nd respec (costs 1000 XP)
      game.state.allocatedSkillPoints = 1;
      game.state.perkLevels = { xp_boost: 1 };
      game.state.unlockedPerks = ['xp_boost'];
      const secondRespec = game.resetSkillPoints();
      expect(secondRespec.success).toBe(true);
      expect(secondRespec.isFree).toBe(false);
      expect(game.state.xp).toBe(1000);
      expect(game.state.totalSpentXP).toBe(1000);

      // 3rd respec with insufficient XP (< 1000)
      game.state.xp = 500;
      game.state.allocatedSkillPoints = 1;
      const failRespec = game.resetSkillPoints();
      expect(failRespec.success).toBe(false);
    });

    it('should remove theme-sakura when switching themes', () => {
      game.applyTheme('theme-sakura');
      expect(document.documentElement.classList.contains('theme-sakura')).toBe(true);

      game.applyTheme('theme-ocean');
      expect(document.documentElement.classList.contains('theme-sakura')).toBe(false);
      expect(document.documentElement.classList.contains('theme-ocean')).toBe(true);
    });

    it('should use local date for Mystery Chest eligibility and claiming', () => {
      game.state.activeQuests = [{ id: 'q1', completed: true }];
      game.state.mysteryChestClaimedDate = null;
      expect(game.canClaimMysteryChest()).toBe(true);

      const claimRes = game.claimMysteryChest();
      expect(claimRes.success).toBe(true);
      expect(game.state.mysteryChestClaimedDate).toBe(game._getLocalDateStr());
      expect(game.canClaimMysteryChest()).toBe(false);
    });

    it('should track physics category weekly quest progress via SiteConfig track field', () => {
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
      // Pick a period index that lands on index 2 (weekly_physics_40)
      const periodIndex = 2919 + ((2 - (2919 % 7) + 7) % 7);
      vi.setSystemTime(new Date(periodIndex * oneWeekMs + 3600 * 1000));

      const initial = game.getWeeklyQuestProgress();
      expect(initial.quest.category).toBe('Physics');
      expect(initial.currentCount).toBe(0);

      game.addXP(150, 'physics', { shouldSave: false });
      const updated = game.getWeeklyQuestProgress();
      expect(updated.currentCount).toBe(15);
    });
  });
});
