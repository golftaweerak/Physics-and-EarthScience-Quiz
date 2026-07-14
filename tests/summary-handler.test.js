import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateOverallSummary, getFirstName } from '../scripts/summary-handler.js';
import { setCurrentSemester } from '../scripts/data-manager.js';

// Mock student-card-renderer
vi.mock('../scripts/student-card-renderer.js', () => ({
    calculateStudentCompletion: vi.fn(student => {
        const total = student.assignments?.length || 0;
        const submitted = student.assignments?.filter(a => a.score !== 'ยังไม่ส่ง').length || 0;
        return {
            total,
            submitted,
            missing: total - submitted,
            percentage: total > 0 ? (submitted / total) * 100 : 0,
        };
    }),
}));

describe('getFirstName', () => {
    it('should extract first name from a full name with title "นาย"', () => {
        expect(getFirstName('นายนันทิวรรธน์ ปิ่นทอง')).toBe('นันทิวรรธน์');
    });

    it('should extract first name from a full name with title "นางสาว"', () => {
        expect(getFirstName('นางสาวสมหญิง ใจดี')).toBe('สมหญิง');
    });

    it('should handle names without titles', () => {
        expect(getFirstName('สมชาย สามารถ')).toBe('สมชาย');
    });

    it('should return the full string if it is a single word', () => {
        expect(getFirstName('ทดสอบ')).toBe('ทดสอบ');
    });

    it('should return an empty string for empty or null input', () => {
        expect(getFirstName('')).toBe('');
        expect(getFirstName(null)).toBe('');
        expect(getFirstName(undefined)).toBe('');
    });
});

describe('calculateOverallSummary', () => {
    const mockScores = [
        { id: '001', name: 'A', room: '1', 'รวม [100]': 80, 'เกรด': '4', assignments: [{ name: 'งาน1', score: '10' }, { name: 'งาน2', score: '10' }] },
        { id: '002', name: 'B', room: '1', 'รวม [100]': 60, 'เกรด': '2', assignments: [{ name: 'งาน1', score: '5' }, { name: 'งาน2', score: 'ยังไม่ส่ง' }] },
        { id: '003', name: 'C', room: '2', 'รวม [100]': 90, 'เกรด': '4', assignments: [{ name: 'งาน1', score: '10' }, { name: 'งาน2', score: '10' }] },
        { id: '004', name: 'D', room: '2', 'รวม [100]': 75, 'เกรด': '3', assignments: [{ name: 'งาน1', score: '8' }, { name: 'งาน2', score: '8' }] },
        { id: '005', name: 'E', room: '1', 'เกรด': 'มส', assignments: [] }, // No score
    ];

    it('should return zero-values for empty scores array', () => {
        const summary = calculateOverallSummary([]);
        expect(summary.totalStudents).toBe(0);
        expect(summary.averageScore).toBe(0);
        expect(summary.highestScore).toBe(0);
        expect(summary.lowestScore).toBe(0);
    });

    it('should calculate summary statistics correctly', () => {
        const summary = calculateOverallSummary(mockScores);
        expect(summary.totalStudents).toBe(5);
        expect(summary.averageScore).toBe('76.25'); // (80+60+90+75)/4
        expect(summary.highestScore).toBe(90);
        expect(summary.lowestScore).toBe(60);
    });

    it('should calculate grade distribution correctly', () => {
        const summary = calculateOverallSummary(mockScores);
        expect(summary.gradeDistribution).toEqual({
            '4': 2,
            '2': 1,
            '3': 1,
            'มส': 1,
        });
    });

    it('should calculate completion percentage correctly', () => {
        const summary = calculateOverallSummary(mockScores);
        // Student A: 2/2, B: 1/2, C: 2/2, D: 2/2, E: 0/0. Total submitted: 7, Total trackable: 8
        expect(summary.completionPercentage).toBe('88'); // (7/8 * 100)
    });

    it('should calculate summary by room correctly', () => {
        const summary = calculateOverallSummary(mockScores);
        const room1 = summary.summaryByRoom['1'];
        const room2 = summary.summaryByRoom['2'];

        expect(room1.studentCount).toBe(3);
        expect(room1.averageScore).toBe('70.00'); // (80+60)/2
        expect(room1.completionPercentage).toBe('75'); // (3 submitted / 4 trackable)

        expect(room2.studentCount).toBe(2);
        expect(room2.averageScore).toBe('82.50'); // (90+75)/2
        expect(room2.completionPercentage).toBe('100'); // (4 submitted / 4 trackable)
    });
});

describe('calculateOverallSummary (Term 2 - 2/2568)', () => {
    beforeEach(() => {
        setCurrentSemester('2/2568');
    });

    afterEach(() => {
        setCurrentSemester('1/2568'); // Reset to default
    });

    const mockTerm2Scores = [
        {
            id: '001',
            name: 'A',
            room: '1',
            assignments: [
                { name: 'รวม [100]', score: '80' },
                { name: 'Quiz 6', score: '8' },
                { name: 'Quiz 7', score: '8' },
                { name: 'Quiz 8', score: '9' },
                { name: 'Quiz 9', score: 'ยังไม่ส่ง' },
                { name: 'Quiz 10', score: '8' },
                { name: 'MID [20]2', score: '15' }
            ]
        },
        {
            id: '002',
            name: 'B',
            room: '1',
            assignments: [
                { name: 'รวม [100]', score: '40' },
                { name: 'Quiz 6', score: 'ยังไม่ส่ง' },
                { name: 'Quiz 7', score: 'ยังไม่ส่ง' },
                { name: 'Quiz 8', score: 'ยังไม่ส่ง' },
                { name: 'Quiz 9', score: 'ยังไม่ส่ง' },
                { name: 'Quiz 10', score: 'ยังไม่ส่ง' },
                { name: 'MID [20]2', score: '10' } // Failed midterm (< 12)
            ]
        }
    ];

    it('should calculate midterm averages and pass/fail counts correctly for rooms', () => {
        const summary = calculateOverallSummary(mockTerm2Scores);
        const room1 = summary.summaryByRoom['1'];

        // Room 1 should have 2 students
        expect(room1.studentCount).toBe(2);
        // Average midterm: (15 + 10) / 2 = 12.50
        expect(room1.averageMidtermTerm2).toBe('12.50');
        // Pass count (MID >= 12): student A (15) passes. Student B (10) fails.
        expect(room1.passCountTerm2).toBe(1);
        expect(room1.failCountTerm2).toBe(1);

        // SD: sqrt(((15-12.5)^2 + (10-12.5)^2)/2) = 2.50
        expect(room1.midtermSD).toBe('2.50');
        expect(summary.midtermSD).toBe('2.50');

        // Overall stats
        expect(summary.midtermPassCount).toBe(1);
        expect(summary.midtermFailCount).toBe(1);
        expect(summary.averageMidtermScore).toBe('12.50');
    });
});
