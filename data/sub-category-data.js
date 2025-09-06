/**
 * A centralized list of all sub-categories for quizzes.
 * This file serves as the single source of truth for quiz topic structures.
 * This can be used to populate dropdowns in generator tools or for filtering.
 * The structure is designed to match the different ways sub-categories are used across quiz types.
 */

/**
 * Constants for quiz levels to avoid magic strings and ensure consistency.
 */
export const LEVELS = {
  JUNIOR_AND_SENIOR: "ม.ต้น และ ม.ปลาย",
  JUNIOR_ONLY: "ม.ต้น เท่านั้น",
  SENIOR_ONLY: "ม.ปลาย เท่านั้น",
};

/**
 * Constants for main category keys.
 */
export const MAIN_CATEGORIES = {
  EARTH_SCIENCE: 'EarthScience',
  ASTRONOMY_GENERAL: 'AstronomyGeneral', // Formerly ASTRONOMY_REVIEW
  ASTRONOMY_OLYMPIAD: 'AstronomyOlympiad', // Formerly ASTRONOMY_POSN
  GENERAL_KNOWLEDGE: 'GeneralKnowledge',
  CHALLENGE: 'Challenge', // Formerly CHALLENGE_POSN
  PHYSICS: 'Physics',
  EARTH_SPACE_SCIENCE_BASIC: 'EarthSpaceScienceBasic',
  EARTH_SPACE_SCIENCE_ADVANCE: 'EarthSpaceScienceAdvance',
};

/**
 * Centralized constants for core astronomy topics to avoid duplication
 * and ensure consistency between EarthAndSpace and ASTRONOMY_POSN lists.
 */
export const CORE_ASTRONOMY_TOPICS = Object.freeze({
  SPHERICAL_ASTRONOMY: "ทรงกลมท้องฟ้าและระบบพิกัด",
  CELESTIAL_MECHANICS: "กลศาสตร์ท้องฟ้าและกฎของเคปเลอร์",
  SOLAR_SYSTEM: "ระบบสุริยะและองค์ประกอบ",
  STARS: "สมบัติและวิวัฒนาการของดาวฤกษ์",
  GALAXIES: "กาแล็กซีและเอกภพวิทยา",
  TELESCOPES: "กล้องโทรทรรศน์และเทคโนโลยีอวกาศ",
});

export const GEOLOGY_TOPICS = Object.freeze({
  STRUCTURE_AND_TECTONICS: "โครงสร้างโลกและธรณีแปรสัณฐาน",
  MINERALS_ROCKS_CYCLE: "แร่ หิน และวัฏจักรหิน",
  GEOHISTORY_STRATIGRAPHY: "ธรณีประวัติและลำดับชั้นหิน",
  GEOMORPHOLOGY_SURFACE_PROCESSES: "ธรณีสัณฐานและกระบวนการบนพื้นผิวโลก",
  GEOHAZARDS: "ธรณีพิบัติภัย",
  GEORESOURCES_ENVIRONMENT: "ทรัพยากรธรณีและธรณีวิทยาสิ่งแวดล้อม",
  MAPS_SURVEYING: "แผนที่และการสำรวจทางธรณีวิทยา",
});

export const METEOROLOGY_TOPICS = Object.freeze({
  COMPOSITION_LAYERS: "องค์ประกอบและชั้นบรรยากาศ",
  ENERGY_BALANCE_RADIATION: "สมดุลพลังงานของโลกและรังสี",
  TEMP_PRESSURE_WIND: "อุณหภูมิ ความกดอากาศ และลม",
  HUMIDITY_CLOUDS_PRECIPITATION: "ความชื้น เมฆ และหยาดน้ำฟ้า",
  AIR_MASSES_FRONTS: "มวลอากาศและแนวปะทะอากาศ",
  STORMS_SEVERE_WEATHER: "พายุและสภาพอากาศรุนแรง",
  WEATHER_MAPS_FORECASTING: "แผนที่อากาศและการพยากรณ์อากาศ",
  CLIMATE_CHANGE: "ภูมิอากาศและการเปลี่ยนแปลง",
});

export const OCEANOGRAPHY_TOPICS = Object.freeze({
  PHYSICAL_CHEMICAL_PROPERTIES: "คุณสมบัติทางกายภาพและเคมีของน้ำทะเล",
  WAVES_TIDES_CURRENTS: "คลื่น น้ำขึ้นน้ำลง และการหมุนเวียนของกระแสน้ำ",
  OCEAN_ATMOSPHERE_INTERACTION: "ปฏิสัมพันธ์ระหว่างมหาสมุทรและบรรยากาศ",
  MARINE_LIFE_ECOSYSTEMS: "สิ่งมีชีวิตและระบบนิเวศทางทะเล",
  SEAFLOOR_GEOLOGY_MORPHOLOGY: "ธรณีวิทยาและสัณฐานพื้นสมุทร",
  MARINE_RESOURCES_POLLUTION: "ทรัพยากรและมลพิษทางทะเล",
});

export const PHYSICS_TOPICS = Object.freeze({
  MECHANICS_1: "กลศาสตร์ 1: ธรรมชาติของฟิสิกส์และการเคลื่อนที่",
  MECHANICS_2: "กลศาสตร์ 2: สมดุล งาน และพลังงาน",
  WAVES: "คลื่น",
  ELECTRICITY: "ไฟฟ้า",
  MAGNETISM_FLUIDS: "แม่เหล็กและของไหล",
  MODERN_PHYSICS: "ฟิสิกส์ยุคใหม่",
});

export const EARTH_SPACE_SCIENCE_BASIC_TOPICS = Object.freeze({
  UNIVERSE: "เอกภพ",
  EARTH_PROCESSES: "กระบวนการเปลี่ยนแปลงภายในโลก",
  WEATHER_CLIMATE: "ลมฟ้าอากาศและภูมิอากาศ",
});

export const EARTH_SPACE_SCIENCE_ADVANCE_TOPICS = Object.freeze({
  EARTH_STRUCTURE: "โครงสร้างโลก",
  PLATE_TECTONICS: "ธรณีแปรสัณฐาน",
  GEOHAZARDS: "ธรณีพิบัติภัย",
  STRATIGRAPHY: "ลำดับชั้นหิน",
  GEOLOGICAL_RESOURCES: "ทรัพยากรธรณี",
  MAPS: "แผนที่",
  ATMOSPHERE: "อากาศ",
  GLOBAL_WIND_SYSTEMS: "การหมุนเวียนของระบบลมของโลก",
  OCEAN_CIRCULATION: "การหมุนเวียนของน้ำในมหาสมุทร",
  ATMOSPHERIC_STABILITY_FRONTS: "เสถียรภาพอากาศและแนวปะทะอากาศ",
  CLIMATE_CHANGE: "การเปลี่ยนแปลงภูมิอากาศของโลก",
  WEATHER_FORECASTING: "การพยากรณ์อากาศ",
  UNIVERSE_GALAXIES: "เอกภพและกาแล็กซี",
  STARS: "ดาวฤกษ์",
  SOLAR_SYSTEM: "ระบบสุริยะ",
  CELESTIAL_SPHERE: "ทรงกลมฟ้า",
  PLANETARY_MOTION: "การเคลื่อนที่ปรากฏของดาวเคราะห์",
  SPACE_TECHNOLOGY: "เทคโนโลยีอวกาศและการประยุกต์ใช้",
});

export const subCategoryData = {
  // Sub-categories for "วิทยาศาสตร์โลกและอวกาศ" (Earth & Space Science)
  // These are grouped by main topic (Geology, Meteorology, Astronomy)
  // and are typically used in the `specific` field of the subCategory object.
  EarthAndSpace: {
    Geology: [...Object.values(GEOLOGY_TOPICS)],
    Meteorology: [...Object.values(METEOROLOGY_TOPICS)],
    Astronomy: [
      ...Object.values(CORE_ASTRONOMY_TOPICS)
    ],
    Oceanography: [...Object.values(OCEANOGRAPHY_TOPICS)],
  },

  /**
 * A combined and structured list of all astronomy topics for the "ดาราศาสตร์" category,
 * indicating which level (Junior, Senior, or both) and which camp (1 or 2)
 * each topic belongs to.
 *
 * REVISED BASED ON SYLLABUS DATED August 2025.
 * Key changes include:
 * - Added a 'camps' object to specify the introductory camp for junior and senior levels.
 * - { junior: 1, senior: 1 } means the topic is introduced in Camp 1 for both levels.
 * - { junior: 2, senior: 1 } means the topic is introduced in Camp 2 for juniors, but Camp 1 for seniors.
 * - Corrected the 'level' for several core topics to JUNIOR_AND_SENIOR.
 * - Added more specific topics for senior-only physics concepts.
 */
  ASTRONOMY_POSN: [
    // --- Foundational Mathematics & Physics ---
    { topic: "คณิตศาสตร์สำหรับดาราศาสตร์ (พีชคณิต, เรขาคณิต, ตรีโกณมิติ)", level: LEVELS.JUNIOR_AND_SENIOR, camps: { junior: 1, senior: 1 } },
    { topic: "กลศาสตร์พื้นฐาน (กฎของนิวตัน, งานและพลังงาน)", level: LEVELS.JUNIOR_AND_SENIOR, camps: { junior: 1, senior: 1 } },
    { topic: "การแปลงหน่วยและสัญลักษณ์ทางวิทยาศาสตร์", level: LEVELS.JUNIOR_AND_SENIOR, camps: { junior: 1, senior: 1 } },
    { topic: "คุณสมบัติของคลื่นแม่เหล็กไฟฟ้าและสเปกตรัม", level: LEVELS.JUNIOR_AND_SENIOR, camps: { junior: 1, senior: 1 } },
    // Senior-only topics, introduced in their respective camps.
    { topic: "แคลคูลัสเบื้องต้นสำหรับดาราศาสตร์", level: LEVELS.SENIOR_ONLY, camps: { senior: 1 } },

    { topic: "ฟิสิกส์นิวเคลียร์และทฤษฎีสัมพัทธภาพเบื้องต้น", level: LEVELS.SENIOR_ONLY, camps: { senior: 2 } },

    // --- Core Astronomy Topics ---
    { topic: CORE_ASTRONOMY_TOPICS.SPHERICAL_ASTRONOMY, level: LEVELS.JUNIOR_AND_SENIOR, camps: { junior: 1, senior: 1 } },
    { topic: CORE_ASTRONOMY_TOPICS.CELESTIAL_MECHANICS, level: LEVELS.JUNIOR_AND_SENIOR, camps: { junior: 1, senior: 1 } },
    { topic: CORE_ASTRONOMY_TOPICS.SOLAR_SYSTEM, level: LEVELS.JUNIOR_AND_SENIOR, camps: { junior: 1, senior: 1 } },
    { topic: CORE_ASTRONOMY_TOPICS.STARS, level: LEVELS.JUNIOR_AND_SENIOR, camps: { junior: 1, senior: 1 } },
    { topic: CORE_ASTRONOMY_TOPICS.GALAXIES, level: LEVELS.JUNIOR_AND_SENIOR, camps: { junior: 1, senior: 1 } },
    { topic: CORE_ASTRONOMY_TOPICS.TELESCOPES, level: LEVELS.JUNIOR_AND_SENIOR, camps: { junior: 1, senior: 1 } },

    // --- Applied & Observational Topics ---
    { topic: "เวลา ปฏิทิน และการใช้แผนที่ดาว", level: LEVELS.JUNIOR_AND_SENIOR, camps: { junior: 1, senior: 1 } },
    { topic: "ปรากฏการณ์ในระบบสุริยะ (อุปราคา, น้ำขึ้นน้ำลง)", level: LEVELS.JUNIOR_AND_SENIOR, camps: { junior: 1, senior: 1 } },
    // Note: Binary/Cluster stars are introduced later for Juniors than for Seniors.
    { topic: "ระบบดาวคู่และกระจุกดาว", level: LEVELS.JUNIOR_AND_SENIOR, camps: { junior: 2, senior: 1 } },
    { topic: "การวิเคราะห์ข้อมูลและการคำนวณทางดาราศาสตร์", level: LEVELS.JUNIOR_AND_SENIOR, camps: { junior: 1, senior: 1 } },
    { topic: "ข่าวสารและความก้าวหน้าทางดาราศาสตร์", level: LEVELS.JUNIOR_AND_SENIOR, camps: { junior: 1, senior: 1 } },

    { topic: "กลุ่มดาวฤกษ์และการใช้ประโยชน์", level: LEVELS.JUNIOR_AND_SENIOR, camps: { junior: 1, senior: 1} },
  ],

  // Sub-categories for Physics
  Physics: [
    ...Object.values(PHYSICS_TOPICS)
  ],

  // Sub-categories for Earth and Space Science (Basic)
  EarthSpaceScienceBasic: [
    ...Object.values(EARTH_SPACE_SCIENCE_BASIC_TOPICS)
  ],

  // Sub-categories for Earth and Space Science (Advanced)
  EarthSpaceScienceAdvance: [
    ...Object.values(EARTH_SPACE_SCIENCE_ADVANCE_TOPICS)
  ],
};

/**
 * @deprecated This is for backward compatibility with modules that still import combinedAstronomyTopics.
 * Please update imports to use `subCategoryData.ASTRONOMY_POSN` instead.
 */
export const combinedAstronomyTopics = subCategoryData.ASTRONOMY_POSN;
/*
/**
 * Maps filename prefixes to their corresponding main categories, icons, and sub-category validation keys.
 * - `es`, `esr`: Earth Science Olympiad (วิทยาศาสตร์โลกและอวกาศ), uses `EarthAndSpace` sub-categories.
 * - `junior`, `senior`: Astronomy Olympiad (ดาราศาสตร์ สอวน.), uses `ASTRONOMY_POSN` sub-categories.
 * - `astro`: Astronomy Review quizzes, uses `ASTRONOMY_POSN` sub-categories.
 * - `adv`: Advanced/Challenge quizzes, uses `EarthAndSpace` sub-categories.
 */
export const quizPrefixInfo = {
  // --- Earth Science Olympiad ---
  es: {
    mainCategory: MAIN_CATEGORIES.EARTH_SCIENCE, // วิทยาศาสตร์โลกและอวกาศ
    icon: './assets/icons/geology.png',
    subCategoryKey: 'EarthAndSpace',
  },
  esr: {
    mainCategory: MAIN_CATEGORIES.ASTRONOMY_GENERAL, // ทบทวนดาราศาสตร์ (ส่วนหนึ่งของโลกและอวกาศ)
    icon: './assets/icons/earth1.png',
    subCategoryKey: 'EarthAndSpace',
  },
  // --- Astronomy Olympiad ---
  junior: {
    mainCategory: MAIN_CATEGORIES.ASTRONOMY_OLYMPIAD, // ดาราศาสตร์ สอวน.
    icon: './assets/icons/astronomy1.png',
    subCategoryKey: 'ASTRONOMY_POSN', // Uses the structured Astronomy list
  },
  senior: {
    mainCategory: MAIN_CATEGORIES.ASTRONOMY_OLYMPIAD, // ดาราศาสตร์ สอวน.
    icon: './assets/icons/black-hole.png',
    subCategoryKey: 'ASTRONOMY_POSN', // Also uses the structured Astronomy list
  },
  adv_astro: {
    mainCategory: MAIN_CATEGORIES.CHALLENGE, // ข้อสอบท้าทาย (ดาราศาสตร์)
    icon: './assets/icons/galaxy.png',
    subCategoryKey: 'ASTRONOMY_POSN',
  },
  adv_geology: {
    mainCategory: MAIN_CATEGORIES.CHALLENGE, // ข้อสอบท้าทาย (ธรณีวิทยา)
    icon: './assets/icons/rock.png',
    subCategoryKey: 'EarthAndSpace',
    inferredMainCategory: 'Geology', // For files that omit the main category
  },
  adv_meteorology: { // Corrected from adv_mete to match filenames
    mainCategory: MAIN_CATEGORIES.CHALLENGE, // ข้อสอบท้าทาย (อุตุนิยมวิทยา)
    icon: './assets/icons/cloud.png', // Changed icon
    subCategoryKey: 'EarthAndSpace',
    inferredMainCategory: 'Meteorology', // For files that omit the main category
  },
  adv_oceanography: { // Corrected from adv_ocean to match filenames
    mainCategory: MAIN_CATEGORIES.CHALLENGE, // ข้อสอบท้าทาย (มหาสมุทรวิทยา)
    icon: './assets/icons/wave.png', // Changed icon
    subCategoryKey: 'EarthAndSpace',
    inferredMainCategory: 'Oceanography', // For files that omit the main category
  },
  // --- General & Mixed Topics ---
  astro: {
    mainCategory: MAIN_CATEGORIES.ASTRONOMY_GENERAL, // ทบทวนดาราศาสตร์ (ทั่วไป)
    icon: './assets/icons/space.png',
    subCategoryKey: 'ASTRONOMY_POSN', // Review quizzes are validated against the ASTRONOMY_POSN list.
  },
  // --- Physics ---
  phy_m4: {
    mainCategory: MAIN_CATEGORIES.PHYSICS,
    icon: './assets/icons/physics.png', // Assuming a physics icon exists or will be added
    subCategoryKey: 'Physics',
    inferredMainCategory: 'MECHANICS_1', // Default for M.4 Physics
  },
  phy_m5: {
    mainCategory: MAIN_CATEGORIES.PHYSICS,
    icon: './assets/icons/physics.png',
    subCategoryKey: 'Physics',
    inferredMainCategory: 'WAVES', // Default for M.5 Physics
  },
  phy_m6: {
    mainCategory: MAIN_CATEGORIES.PHYSICS,
    icon: './assets/icons/physics.png',
    subCategoryKey: 'Physics',
    inferredMainCategory: 'MAGNETISM_FLUIDS', // Default for M.6 Physics
  },
  // --- Earth and Space Science Basic ---
  ess_basic_m6: {
    mainCategory: MAIN_CATEGORIES.EARTH_SPACE_SCIENCE_BASIC,
    icon: './assets/icons/earth.png', // Reusing earth icon
    subCategoryKey: 'EarthSpaceScienceBasic',
    inferredMainCategory: 'UNIVERSE', // Default for M.6 Basic ESS
  },
  // --- Earth and Space Science Advanced ---
  ess_adv_m4: {
    mainCategory: MAIN_CATEGORIES.EARTH_SPACE_SCIENCE_ADVANCE,
    icon: './assets/icons/earth.png', // Reusing earth icon
    subCategoryKey: 'EarthSpaceScienceAdvance',
    inferredMainCategory: 'EARTH_STRUCTURE', // Default for M.4 Advanced ESS
  },
  ess_adv_m5: {
    mainCategory: MAIN_CATEGORIES.EARTH_SPACE_SCIENCE_ADVANCE,
    icon: './assets/icons/earth.png', // Reusing earth icon
    subCategoryKey: 'EarthSpaceScienceAdvance',
    inferredMainCategory: 'ATMOSPHERE', // Default for M.5 Advanced ESS
  },
  ess_adv_m6: {
    mainCategory: MAIN_CATEGORIES.EARTH_SPACE_SCIENCE_ADVANCE,
    icon: './assets/icons/earth.png', // Reusing earth icon
    subCategoryKey: 'EarthSpaceScienceAdvance',
    inferredMainCategory: 'UNIVERSE_GALAXIES', // Default for M.6 Advanced ESS
  },
  default: {
    mainCategory: MAIN_CATEGORIES.GENERAL_KNOWLEDGE,
    icon: './assets/icons/study.png',
    subCategoryKey: null,
  },
};