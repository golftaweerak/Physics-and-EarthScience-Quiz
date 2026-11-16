import { describe, it, expect, vi } from 'vitest';
import { quizItems as ch4RemedialItems } from '../data/phy_m4/phy_m4_ch4-re1-data.js';
import {
  buildGroupedQuizData,
  getRemedialBucketKey,
  selectBalancedRemedialQuestions,
} from '../scripts/custom-quiz-handler.js';

vi.mock('../scripts/modal-handler.js', () => ({ ModalHandler: vi.fn() }));
vi.mock('../scripts/data-manager.js', () => ({
  fetchAllQuizData: vi.fn(),
  getQuizProgress: vi.fn(),
  categoryDetails: {},
}));
vi.mock('../scripts/syllabus-manager.js', () => ({ getSyllabusForCategory: vi.fn() }));
vi.mock('../scripts/auth-manager.js', () => ({ authManager: { currentUser: null, waitForAuthReady: vi.fn() } }));
vi.mock('../scripts/toast.js', () => ({ showToast: vi.fn() }));

describe('Remedial Mode & Chapter 4 Remedial Dataset', () => {
  it('should contain 60 unique fill-in-number questions evenly split across the 4 Chapter 4 topics', () => {
    expect(ch4RemedialItems).toHaveLength(60);

    const countsByTopic = new Map();
    const seenQuestions = new Set();

    for (const q of ch4RemedialItems) {
      expect(q.type).toBe('fill-in-number');
      expect(typeof q.answer).toBe('number');
      expect(Number.isNaN(q.answer)).toBe(false);
      expect(q.subCategory?.main).toBe('บทที่ 4: สมดุลกล');
      expect(q.remedialTopic).toBeTruthy();

      expect(seenQuestions.has(q.question)).toBe(false);
      seenQuestions.add(q.question);

      countsByTopic.set(q.remedialTopic, (countsByTopic.get(q.remedialTopic) || 0) + 1);
    }

    expect(countsByTopic.get('สมดุลต่อการเลื่อนที่')).toBe(15);
    expect(countsByTopic.get('สมดุลต่อการหมุน')).toBe(15);
    expect(countsByTopic.get('เสถียรภาพของวัตถุ')).toBe(15);
    expect(countsByTopic.get('จุดศูนย์กลางมวลและศูนย์ถ่วง (CM/CG)')).toBe(15);
  });

  it('should restrict fillIn buckets to fill-in/fill-in-number questions and exclude calculation MCQs', () => {
    const sampleQuestions = [
      {
        type: 'question',
        choiceType: 'calculation',
        question: 'MCQ calculation only',
        sourceQuizCategory: 'PhysicsM4',
        subCategory: { main: 'บทที่ 4: สมดุลกล', specific: 'LO_8' },
      },
      {
        type: 'fill-in-number',
        question: 'Fill-in number question',
        sourceQuizCategory: 'PhysicsM4',
        subCategory: { main: 'บทที่ 4: สมดุลกล', specific: 'LO_8' },
      },
      {
        type: 'fill-in',
        question: 'Fill-in text question',
        sourceQuizCategory: 'PhysicsM4',
        subCategory: { main: 'บทที่ 4: สมดุลกล', specific: 'LO_9' },
      },
    ];

    const grouped = buildGroupedQuizData(sampleQuestions);
    const ch4 = grouped.PhysicsM4['บทที่ 4: สมดุลกล'];

    expect(ch4['LO_8'].calculation).toHaveLength(2);
    expect(ch4['LO_8'].fillIn).toHaveLength(1);
    expect(ch4['LO_8'].fillIn[0].question).toBe('Fill-in number question');
    expect(ch4['LO_9'].fillIn).toHaveLength(1);
  });

  it('should always sample all 4 Chapter 4 sub-topics with counts [1, 1, 1, 2] across 100 runs', () => {
    const taggedQuestions = ch4RemedialItems.map((q) => ({
      ...q,
      sourceQuizCategory: 'PhysicsM4',
    }));

    // Also include a calculation MCQ in the same chapter to ensure it is never selected
    const mcqTrap = {
      type: 'question',
      choiceType: 'calculation',
      question: 'Should never appear in remedial',
      sourceQuizCategory: 'PhysicsM4',
      subCategory: { main: 'บทที่ 4: สมดุลกล', specific: 'ซ่อมบทที่ 4 ครั้งที่ 1' },
    };

    const grouped = buildGroupedQuizData([...taggedQuestions, mcqTrap]);
    const selectedChapters = new Set(['PhysicsM4___บทที่ 4: สมดุลกล']);
    const selectedTopics = new Set();

    for (let run = 0; run < 100; run++) {
      const { chosen, totalAvailable, bucketCount } = selectBalancedRemedialQuestions(
        grouped,
        selectedChapters,
        selectedTopics,
        5
      );

      expect(totalAvailable).toBe(60);
      expect(bucketCount).toBe(4);
      expect(chosen).toHaveLength(5);

      const perBucket = new Map();
      const uniqueChosen = new Set();
      for (const q of chosen) {
        expect(['fill-in-number', 'fill-in']).toContain(q.type);
        expect(uniqueChosen.has(q.question)).toBe(false);
        uniqueChosen.add(q.question);

        const bucket = getRemedialBucketKey(q, 'PhysicsM4', 'บทที่ 4: สมดุลกล', 'ซ่อมบทที่ 4 ครั้งที่ 1');
        perBucket.set(bucket, (perBucket.get(bucket) || 0) + 1);
      }

      expect(perBucket.size).toBe(4);
      expect(Array.from(perBucket.values()).sort()).toEqual([1, 1, 1, 2]);
    }
  });
});
