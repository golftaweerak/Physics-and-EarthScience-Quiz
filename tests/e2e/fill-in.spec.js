import { test, expect } from '@playwright/test';

test('verify fill-in question interaction', async ({ page }) => {
  const customQuiz = {
    customId: 'custom_test_fillin',
    title: 'Fill-in Test',
    description: 'Testing input logic',
    questions: [
      {
        id: 'q1',
        type: 'fill-in',
        question: 'Type 123',
        answer: '123',
        hint: 'It is a number'
      }
    ],
    created: Date.now()
  };

  await page.addInitScript((quiz) => {
    localStorage.setItem('customQuizzesList', JSON.stringify([quiz]));
  }, customQuiz);

  await page.goto('quiz/index.html?id=custom_test_fillin');

  // Wait for the app to finish loading and initializing
  await page.waitForSelector('body[data-app-initialized="true"]', { timeout: 15000 });

  await expect(page.locator('#start-screen-title')).toHaveText('Fill-in Test');

  // Custom quizzes auto-start, so we don't need to click start-btn
  // Just verify that the quiz screen is visible
  await expect(page.locator('#quiz-screen')).toBeVisible();

  // 1. Verify Input and Submit Button exist
  const input = page.getByPlaceholder('ใส่คำตอบ...');
  const submitBtn = page.locator('#next-btn'); // Use ID for stability
  const hintBtn = page.locator('#hint-btn');

  await expect(input).toBeVisible();
  await expect(submitBtn).toBeVisible();

  // 2. Verify Hint Button logic
  // Hint should be hidden initially
  const hintText = page.locator('#hint-text');
  await expect(hintText).toBeHidden();
  // Click hint button
  await hintBtn.click();
  await expect(hintText).toBeVisible();
  await expect(hintText).toBeVisible();
  await expect(hintText).toContainText('It is a number'); // Contains match for 'คำใบ้: It is a number'

  // 3. Verify Typing does NOT auto-submit
  await input.fill('12');
  // Wait a bit to ensure no auto-submit happens
  await page.waitForTimeout(500);
  await expect(page.locator('#feedback')).toBeHidden();

  // 4. Verify Submit Button
  await input.focus();
  await page.keyboard.type('123');
  // Wait for binding
  await page.waitForTimeout(500);

  await submitBtn.scrollIntoViewIfNeeded();
  await submitBtn.click();

  // 5. Verify Correct Feedback
  await expect(page.locator('#feedback')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('#feedback')).toContainText('ถูกต้อง'); // Loose match verified
});
