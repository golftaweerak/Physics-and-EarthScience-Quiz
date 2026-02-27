import { describe, it, expect, vi } from 'vitest';
import { groupAssignments } from '../scripts/scores-handler.js';

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
});
