/**
 * Helper to get data modules via Vite's import.meta.glob.
 * Extracted to a separate file to facilitate mocking in tests.
 */
export function getDataModules() {
  return import.meta.glob([
    '../data/quizzes-list.js',
    '../data/**/*-data.js',
    '!../data/scores-data*.js',
    '!../data/sub-category-data.js',
    '!../data/template-data.js',
  ]);
}
