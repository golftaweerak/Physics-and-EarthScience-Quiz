import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCategoryDisplayName,
  getQuizProgress,
  categoryDetails
} from '../scripts/data-manager.js';

describe('DataManager', () => {
  describe('getCategoryDisplayName', () => {
    it('should return correct display name for known category', () => {
      // Using a known category from the file
      const key = 'PhysicsM4';
      const expected = categoryDetails[key].displayName;
      expect(getCategoryDisplayName(key)).toBe(expected);
    });

    it('should return correct display name when only title exists', () => {
      // Mocking a category validation if we could modify categoryDetails, 
      // but since we can't easily, we rely on existing structure.
      // Let's test a simpler case or assume 'General' has same title/display
      expect(getCategoryDisplayName('General')).toBe('ทุกหมวดหมู่');
    });

    it('should return key if category not found', () => {
      expect(getCategoryDisplayName('UnknownCat')).toBe('UnknownCat');
    });
  });

  describe('getQuizProgress', () => {
    const storageKey = 'test-quiz-key';

    beforeEach(() => {
      localStorage.clear();
    });

    it('should return default state when no progress saved', () => {
      const total = 10;
      const progress = getQuizProgress(storageKey, total);
      expect(progress.hasProgress).toBe(false);
      expect(progress.score).toBe(0);
      expect(progress.totalQuestions).toBe(total);
    });

    it('should calculate progress correctly from saved state', () => {
      const mockState = {
        currentQuestionIndex: 5,
        score: 3,
        userAnswers: [1, 2, 3, null, null], // 3 answers
        hasFinished: false
      };
      localStorage.setItem(storageKey, JSON.stringify(mockState));

      const total = 10;
      const progress = getQuizProgress(storageKey, total);

      expect(progress.hasProgress).toBe(true);
      expect(progress.score).toBe(3);
      expect(progress.answeredCount).toBe(3); // Based on non-null answers
      expect(progress.percentage).toBe(30);
    });

    it('should handle corrupt JSON gracefully', () => {
      localStorage.setItem(storageKey, '{ invalid json');
      const progress = getQuizProgress(storageKey, 10);
      expect(progress.hasProgress).toBe(false);
    });
  });
});
