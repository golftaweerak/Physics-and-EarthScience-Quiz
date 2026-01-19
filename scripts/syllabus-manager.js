import { PHYSICS_SYLLABUS, EARTH_SCIENCE_BASIC_SYLLABUS, EARTH_SCIENCE_ADVANCE_SYLLABUS } from '../data/sub-category-data.js';

/**
 * Gets the appropriate syllabus object for a given category key.
 * This centralizes the logic for selecting a syllabus.
 * @param {string} categoryKey - The key of the category (e.g., 'PhysicsM4', 'EarthSpaceScienceBasic').
 * @returns {object|null} The syllabus object or null if not found.
 */
export function getSyllabusForCategory(categoryKey) {
    if (categoryKey.startsWith('PhysicsM')) {
        const gradeKey = categoryKey.replace('PhysicsM', 'm');
        return PHYSICS_SYLLABUS[gradeKey] || null;
    }
    if (categoryKey === 'EarthSpaceScienceBasic') {
        return EARTH_SCIENCE_BASIC_SYLLABUS;
    }
    if (categoryKey === 'EarthSpaceScienceAdvance') {
        return EARTH_SCIENCE_ADVANCE_SYLLABUS;
    }
    return null;
}