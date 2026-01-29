import { test, expect } from '@playwright/test';

test('verify scoring and XP attribution', async ({ page }) => {
  const customQuiz = {
    customId: 'custom_test_scoring',
    title: 'Test Scoring Quiz',
    description: 'A quiz to verify XP calculation',
    questions: [
      {
        id: 'q1',
        type: 'question',
        question: 'What is the study of rocks?',
        options: ['Geology', 'Biology', 'Chemistry', 'Physics'],
        answer: 'Geology',
        subCategory: 'Geology', // Keyword trigger
        sourceQuizCategory: 'EarthSpaceScienceBasic'
      }
    ],
    created: Date.now()
  };

  // 1. Inject Custom Quiz and Reset XP
  await page.goto('quiz/index.html'); // Load page to get context (or any page)

  await page.evaluate((quiz) => {
    localStorage.setItem('customQuizzesList', JSON.stringify([quiz]));
    // Reset Gamification Data to Ensure clean state
    const cleanState = {
      xp: 0,
      level: 1,
      geologyXP: 0,
      activeQuests: [] // Prevent quest popup interference
    };
    localStorage.setItem('app_gamification_data', JSON.stringify(cleanState));
  }, customQuiz);

  // 2. Navigate to the Custom Quiz
  // 2. Navigate to the Custom Quiz
  await page.goto('quiz/index.html?id=custom_test_scoring');

  // Wait for start screen
  await expect(page.locator('#start-screen-title')).toHaveText('Test Scoring Quiz', { timeout: 15000 });

  // 3. Start Quiz
  await page.locator('#start-btn').click();
  await expect(page.locator('#quiz-screen')).toBeVisible();

  // 4. Answer Correctly
  const correctOption = page.locator('button.option-btn', { hasText: 'Geology' });
  await correctOption.click();

  // 5. Verify Correct Feedback
  await expect(page.locator('#feedback')).toContainText('ถูกต้อง!');

  // 6. Finish Quiz
  await page.locator('#next-btn').click();

  // Wait for Result Screen
  await expect(page.locator('#result-screen')).toBeVisible();
  await expect(page.locator('#score-counter')).toHaveText('1 / 1');

  // 7. Verify XP Update in LocalStorage
  // We need to wait a bit because XP update happens async/debounce in gamification.js (?)
  await page.waitForTimeout(1000); // Increased buffer

  const gamificationData = await onLocalStorage(page, 'app_gamification_data');

  expect(gamificationData.xp).toBeGreaterThanOrEqual(10);
  expect(gamificationData.geologyXP).toBe(10);
});

async function onLocalStorage(page, key) {
  return await page.evaluate((k) => {
    return JSON.parse(localStorage.getItem(k));
  }, key);
}
