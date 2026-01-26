import {
    PHYSICS_SYLLABUS,
    EARTH_SCIENCE_BASIC_SYLLABUS,
    EARTH_SCIENCE_ADVANCE_SYLLABUS,
    POSN_EARTH_SYLLABUS,
    POSN_ASTRO_SYLLABUS
} from '../data/sub-category-data.js';

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
    if (categoryKey === 'PosnEarthScience' || categoryKey === 'POSNEarthScience') {
        return POSN_EARTH_SYLLABUS;
    }
    if (categoryKey === 'PosnAstroJunior' || categoryKey === 'PosnAstroSenior' || categoryKey === 'AstronomyPOSN' || categoryKey === 'POSNAstronomy') {
        return POSN_ASTRO_SYLLABUS;
    }
    if (categoryKey === 'ChallengePOSN') {
        return POSN_EARTH_SYLLABUS; // Assuming generic challenge maps to Earth POSN structure
    }
    if (categoryKey === 'AstronomyReview') {
        return POSN_ASTRO_SYLLABUS;
    }
    return null;
}