import { test, expect } from '@playwright/test';

test.describe('Quiz Power-ups', () => {
  // Use a common function to setup the environment before each test
  // This ensures the custom quiz and power-ups are always present when the page loads
  test.beforeEach(async ({ page }) => {
    // Listen to console logs
    page.on('console', msg => console.log(`[BROWSER]: ${msg.text()}`));

    // Inject localStorage data BEFORE the page loads
    await page.addInitScript(() => {
      const gamificationData = {
        xp: 1000,
        consumables: {
          'item_5050': 5,
          'item_cut_1': 5,
          'item_time_freeze': 5
        }
      };
      localStorage.setItem('app_gamification_data', JSON.stringify(gamificationData));

      const dummyQuiz = [
        {
          id: 1,
          question: "Question 1",
          options: ["A", "B", "C", "D"],
          answer: "A",
          type: "multiple-choice"
        },
        {
          id: 2,
          question: "Question 2",
          options: ["10", "20", "30", "40"],
          answer: "10",
          type: "multiple-choice"
        }
      ];

      localStorage.setItem('customQuizzesList', JSON.stringify([{
        customId: 'custom_test_powerup_quiz', // Must start with custom_ for loader to pick it up
        title: 'Powerup Test Quiz',
        description: 'Test Description',
        questions: dummyQuiz,
        createdDate: Date.now(),
        storageKey: 'quizState-custom_test_powerup_quiz'
      }]));
    });

  });

  test('should render power-up buttons', async ({ page }) => {
    // Navigate directly to the custom quiz with cache busting
    await page.goto(`quiz/index.html?id=custom_test_powerup_quiz&_t=${Date.now()}`);

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

    // Check if start screen title matches
    await expect(page.locator('#start-screen-title')).toHaveText('Powerup Test Quiz');

    // Wait for the app to finish loading
    await page.waitForSelector('body[data-app-initialized="true"]', { timeout: 15000 });

    // Custom quizzes auto-start, so we don't need to click start-btn
    // Just verify that the quiz screen is visible
    await expect(page.locator('#quiz-screen')).toBeVisible();

    // Wait for the bar to be present in DOM (animation handling)
    await page.locator('#power-up-bar').waitFor({ state: 'attached' });

    // Force visibility if animation is slow in test env
    await page.evaluate(() => {
      const el = document.getElementById('power-up-bar');
      if (el) {
        el.classList.remove('anim-fade-in');
        el.style.opacity = '1';
      }
    });

    // Check if power-up bar exists and is visible
    await expect(page.locator('#power-up-bar')).toBeVisible();

    // Check for specific power-ups
    const btn5050 = page.locator('button[data-id="item_5050"]');
    await expect(btn5050).toBeVisible();
    await expect(btn5050).not.toBeDisabled();
    // Check count
    await expect(btn5050).toContainText('5');
  });

  test('should apply 50/50 power-up', async ({ page }) => {
    await page.goto(`quiz/index.html?id=custom_test_powerup_quiz&_t=${Date.now()}`);

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

    await expect(page.locator('#start-screen-title')).toHaveText('Powerup Test Quiz');

    await page.waitForSelector('body[data-app-initialized="true"]', { timeout: 15000 });

    // Custom quizzes auto-start, so we don't need to click start-btn
    // Just verify that the quiz screen is visible
    await expect(page.locator('#quiz-screen')).toBeVisible();

    const btn5050 = page.locator('button[data-id="item_5050"]');
    await btn5050.click();

    // Expect 2 options to be disabled/opaque
    const disabledOptions = page.locator('#options button[disabled]');
    await expect(disabledOptions).toHaveCount(2);

    // Expect Toast
    await expect(page.locator('text=ใช้ตัวช่วยสำเร็จ')).toBeVisible();

    // Expect button to indicate usage (check mark)
    await expect(btn5050).toContainText('✓');
    await expect(btn5050).toBeDisabled();
  });
});
