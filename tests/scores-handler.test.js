import { describe, it, expect, vi } from 'vitest';
import { groupAssignments, sortAssignments } from '../scripts/scores-handler.js';

// Mock data-manager
vi.mock('../scripts/data-manager.js', () => ({
    getCurrentSemester: vi.fn(),
}));

describe('groupAssignments', () => {
    const assignments = [
        { name: 'กิจกรรม 1.1', score: 10 },
        { name: 'แบบฝึก 1.1', score: 5 },
        { name: 'ท้ายบท 1', score: 8 },
        { name: 'Quiz 1', score: 9 },
        { name: 'กิจกรรม 2.1', score: 10 },
        { name: 'mid [20]', score: 15 },
        { name: 'บท 1 [10]', score: 18 }, // Should be excluded
        { name: 'นำเสนอ', score: 'ส่งแล้ว' }, // Should be excluded
    ];

    it('should group assignments by chapter', () => {
        const grouped = groupAssignments(assignments);
        // Note: 'แบบทดสอบท้ายบท (Quiz)' is intentionally deleted by the function
        expect(Object.keys(grouped)).toEqual(['บทที่ 1', 'บทที่ 2', 'กลางภาค']);
        expect(grouped['บทที่ 1']).toHaveLength(3);
        expect(grouped['บทที่ 2']).toHaveLength(1);
        expect(grouped['กลางภาค']).toHaveLength(1);
    });

    it('should exclude summary assignments', () => {
        const grouped = groupAssignments(assignments);
        expect(grouped['บทที่ 1'].some(a => a.name === 'บท 1 [10]')).toBe(false);
        expect(grouped['อื่นๆ']).toBeUndefined();
    });

    it('should handle empty assignments array', () => {
        const grouped = groupAssignments([]);
        expect(Object.keys(grouped)).toHaveLength(0);
    });

    it('should handle assignments with no chapter number', () => {
        const otherAssignments = [{ name: 'ใบงานพิเศษ', score: 10 }];
        const grouped = groupAssignments(otherAssignments);
        expect(grouped['อื่นๆ']).toHaveLength(1);
    });

    it('should correctly preserve chapter ordering for multiple chapters', () => {
        const multiChapter = [
            { name: 'กิจกรรม 4.1', score: 10 },
            { name: 'กิจกรรม 1.1', score: 10 },
            { name: 'กิจกรรม 2.1', score: 10 },
            { name: 'กิจกรรม 3.1', score: 10 }
        ];
        const grouped = groupAssignments(multiChapter);
        expect(Object.keys(grouped)).toEqual(['บทที่ 1', 'บทที่ 2', 'บทที่ 3', 'บทที่ 4']);
    });

    it('should sort assignments within a chapter by type and sub-number', () => {
        const scrambledCh7 = [
            { name: 'ท้ายบท 7', score: 'ยังไม่ส่ง' },
            { name: 'ใบงาน 7.3', score: 'ยังไม่ส่ง' },
            { name: 'กิจกรรม 7.1', score: 'ส่งแล้ว' },
            { name: 'ใบงาน 7.2', score: 'ยังไม่ส่ง' },
            { name: 'ใบงาน 7.1', score: 'ส่งแล้ว' },
        ];
        const grouped = groupAssignments(scrambledCh7);
        expect(grouped['บทที่ 7'].map(a => a.name)).toEqual([
            'กิจกรรม 7.1',
            'ใบงาน 7.1',
            'ใบงาน 7.2',
            'ใบงาน 7.3',
            'ท้ายบท 7',
        ]);
    });
});

describe('sortAssignments', () => {
    it('should sort mixed-chapter Term 2 assignments by chapter, type, and sub-number', () => {
        const scrambled = [
            { name: 'Quiz 10', score: 'ยังไม่ส่ง' },
            { name: 'ใบงาน 10.2', score: 'ยังไม่ส่ง' },
            { name: 'ท้ายบท 6', score: 'ยังไม่ส่ง' },
            { name: 'Quiz 6', score: 'ยังไม่ส่ง' },
            { name: 'ใบงาน 6.1', score: 15 },
            { name: 'กิจกรรม 6.1', score: 'ส่งแล้ว' },
            { name: 'ใบงาน 10.1', score: 'ยังไม่ส่ง' },
            { name: 'ใบงาน 6.2', score: 'ยังไม่ส่ง' },
            { name: 'ท้ายบท 10', score: 'ยังไม่ส่ง' },
            { name: 'ใบงาน 10.3', score: 'ยังไม่ส่ง' },
            { name: 'Quiz 7', score: 'ยังไม่ส่ง' },
        ];
        const sorted = sortAssignments(scrambled);
        expect(sorted.map(a => a.name)).toEqual([
            'กิจกรรม 6.1',
            'ใบงาน 6.1',
            'ใบงาน 6.2',
            'ท้ายบท 6',
            'Quiz 6',
            'Quiz 7',
            'ใบงาน 10.1',
            'ใบงาน 10.2',
            'ใบงาน 10.3',
            'ท้ายบท 10',
            'Quiz 10',
        ]);
    });
});
