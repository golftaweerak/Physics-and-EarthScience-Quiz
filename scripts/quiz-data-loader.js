/**
 * Helper to get data modules via Vite's import.meta.glob.
 * Extracted to a separate file to facilitate mocking in tests.
 */
export function getDataModules() {
  return import.meta.glob('../data/**/*.js');
}
