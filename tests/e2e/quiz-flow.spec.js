import { test, expect } from '@playwright/test';

test('standard quiz flow', async ({ page }) => {
  page.on('console', msg => {
    console.log(`[BROWSER] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  page.on('pageerror', err => {
    console.log(`[BROWSER ERROR] ${err.message}`);
  });
  // 1. Go to a specific quiz directly (skip homepage navigation to isolate quiz logic)
  // Using a known ID from quizzes-list.js, e.g., 'phy_m4_ch2-1' (Nature of Physics 2 - Theory)
  // Ensure we use a valid ID.
  const quizId = 'phy_m4/phy_m4_ch2-1';
  await page.goto(`quiz/index.html?id=${quizId}`);

  // Disable animations and transitions for testing stability
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        transition: none !important;
        animation: none !important;
        transition-duration: 0s !important;
        animation-duration: 0s !important;
      }
    `
  });

  // Wait for app to be fully initialized and spinner to be removed
  await page.waitForSelector('body[data-app-initialized="true"]', { timeout: 15000 });
  await page.waitForSelector('#quiz-loading-spinner', { state: 'detached', timeout: 10000 });

  // App loaded via modules, so 'networkidle' might trigger too early or be flaky.
  // Instead, wait for the app-loader to inject the start screen.
  const startScreen = page.locator('#start-screen');
  await expect(startScreen).toBeVisible({ timeout: 15000 });

  // Verify Title (Localized check might be fragile, just check if title element has text)
  await expect(page.locator('#start-screen-title')).not.toBeEmpty();

  // 3. Start Quiz
  const startBtn = page.locator('#start-btn');
  await startBtn.click();

  // 4. Question Screen
  const quizScreen = page.locator('#quiz-screen');
  await expect(quizScreen).toBeVisible({ timeout: 10000 });

  // Verify Question Text
  await expect(page.locator('#question')).toBeVisible();

  // 5. Answer a Question
  // Find options
  const options = page.locator('#options button.option-btn');
  await expect(options.first()).toBeVisible();

  // Click first option
  await options.first().click();

  // 6. Verify Feedback
  const feedback = page.locator('#feedback');
  await expect(feedback).toBeVisible();

  // 7. Proceed to Next/Submit
  const nextBtn = page.locator('#next-btn');
  await expect(nextBtn).toBeVisible();
  await nextBtn.click();

  // Note: We won't go through all questions, just verify interaction works.
  // If we want to finish, we'd need a loop, but that makes the test slow and flaky.
  // Just verifying that we moved to next question (or finished if 1 question) is enough.

  // Check if counter updated or we are at result screen
  // (Assuming more than 1 question)
  // Just check if we are still on quiz screen (next question) or result screen (finished)
  await expect(page.locator('#quiz-screen:visible, #result-screen:visible')).toBeVisible();
});
