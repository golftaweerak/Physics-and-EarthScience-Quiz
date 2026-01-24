import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  shuffleArray
} from '../scripts/utils.js';

describe('Utils', () => {
  describe('escapeHtml', () => {
    it('should escape special characters', () => {
      const input = '<script>alert("xss")</script>';
      const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
      expect(escapeHtml(input)).toBe(expected);
    });

    it('should return empty string for null/undefined', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });

    it('should handle strings with mixed quotes', () => {
      const input = 'She said "It\'s a sunny day"';
      const expected = 'She said &quot;It&#039;s a sunny day&quot;';
      expect(escapeHtml(input)).toBe(expected);
    });
  });

  describe('shuffleArray', () => {
    it('should retain all elements after shuffle', () => {
      const input = [1, 2, 3, 4, 5];
      const output = shuffleArray([...input]); // Clone to avoid mutation affecting check
      expect(output).toEqual(expect.arrayContaining(input));
      expect(output.length).toBe(input.length);
    });

    it('should handle empty array', () => {
      expect(shuffleArray([])).toEqual([]);
    });

    // Note: Statistical randomness test is overkill for this scope, 
    // ensuring modification and length preservation is sufficient.
    it('should return a different order (usually) for large arrays', () => {
      const input = Array.from({ length: 100 }, (_, i) => i);
      const output = shuffleArray([...input]);
      expect(output).not.toEqual(input);
    });
  });
});
