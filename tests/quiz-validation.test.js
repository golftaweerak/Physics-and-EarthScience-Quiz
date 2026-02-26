import { describe, it, expect } from 'vitest';
import { quizList } from '../public/data/quizzes-list.js';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(PROJECT_ROOT, 'public', 'data');

/**
 * Helper to resolve expected file path from quiz ID
 * Logic mirrors verify-data.mjs and quiz-loader.js
 */
function getExpectedPath(quizId) {
  let relativePath;
  if (quizId.includes('/')) {
    relativePath = `${quizId}-data.js`;
  } else {
    let folder = '';
    if (quizId.startsWith('phy_m4')) folder = 'phy_m4/';
    else if (quizId.startsWith('phy_m5')) folder = 'phy_m5/';
    else if (quizId.startsWith('phy_m6')) folder = 'phy_m6/';
    else if (quizId.startsWith('ess_basic')) folder = 'ess_basic/';
    else if (quizId.startsWith('ess_adv')) folder = 'ess_adv/';
    relativePath = `${folder}${quizId}-data.js`;
  }
  return path.join(DATA_DIR, relativePath);
}

describe('Quiz Data Validation', () => {

  it('should have unique quiz IDs', () => {
    const ids = new Set();
    const duplicates = [];

    quizList.forEach(q => {
      if (ids.has(q.id)) {
        duplicates.push(q.id);
      }
      ids.add(q.id);
    });

    if (duplicates.length > 0) {
      console.error('Duplicate IDs found:', duplicates);
    }

    expect(duplicates).toHaveLength(0);
  });

  it('should have a valid data file for each quiz', () => {
    const missingFiles = [];

    quizList.forEach(quiz => {
      const fullPath = getExpectedPath(quiz.id);
      if (!fs.existsSync(fullPath)) {
        missingFiles.push({ id: quiz.id, path: fullPath });
      }
    });

    if (missingFiles.length > 0) {
      console.error('Missing Data Files:', missingFiles);
    }

    expect(missingFiles).toHaveLength(0);
  });

  it('should check for orphaned data files (optional warning)', () => {
    // This test collects files in data/ and checks if they are in quizList
    // We might not want to fail the build on this, but good to know.

    function getAllFiles(dirPath, arrayOfFiles = []) {
      if (!fs.existsSync(dirPath)) return arrayOfFiles;

      const files = fs.readdirSync(dirPath);

      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
          if (file !== 'syllabus') {
            getAllFiles(fullPath, arrayOfFiles);
          }
        } else {
          if (file.endsWith('-data.js')) {
            arrayOfFiles.push(fullPath);
          }
        }
      });
      return arrayOfFiles;
    }

    const allDataFiles = getAllFiles(DATA_DIR);
    const expectedPaths = new Set(quizList.map(q => getExpectedPath(q.id).toLowerCase()));

    // Filter out known non-quiz files
    const orphanedFiles = allDataFiles.filter(file => {
      const lowerFile = file.toLowerCase();
      // Ignore base/template files
      if (lowerFile.endsWith('scores-data.js') ||
        lowerFile.endsWith('template-data.js') ||
        lowerFile.endsWith('sub-category-data.js') ||
        lowerFile.includes('user-scores-data.js')) return false;

      // Check if it's in our expected list
      // Since getExpectedPath returns absolute paths, we strictly check
      // However, paths might differ in casing on Windows, so we use lowerCase for check
      return !expectedPaths.has(lowerFile);
    });

    if (orphanedFiles.length > 0) {
      console.warn(`WARNING: Found ${orphanedFiles.length} orphaned data files:`);
      orphanedFiles.forEach(f => console.warn(`   - ${path.relative(DATA_DIR, f)}`));
    }

    // We choose NOT to fail the test for orphaned files, as they might be WIP or backup
    expect(true).toBe(true);
  });
});
