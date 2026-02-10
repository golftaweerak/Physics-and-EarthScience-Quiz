import { test, expect } from '@playwright/test';

test('create and start a custom quiz', async ({ page }) => {
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('[DEBUG]')) {
      console.log(`[BROWSER] ${msg.type().toUpperCase()}: ${msg.text()}`);
    }
  });
  // 1. Go to homepage
  await page.goto('./');

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

  // Wait for app to be fully initialized
  await page.waitForSelector('body[data-app-initialized="true"]', { timeout: 30000 });

  // 2. Open Hub Modal
  const createBtn = page.locator('#create-custom-quiz-btn');
  await expect(createBtn).toBeVisible({ timeout: 15000 });
  await createBtn.scrollIntoViewIfNeeded();

  // Wait for the modal component to be injected
  await page.locator('#custom-quiz-hub-modal').waitFor({ state: 'attached', timeout: 15000 });
  await createBtn.click({ force: true });

  // 3. Wait for Hub Modal
  const hubModal = page.locator('#custom-quiz-hub-modal');
  await expect(hubModal).toBeVisible({ timeout: 15000 });

  // 4. Click "Create New Quiz" in Hub
  const openGeneratorBtn = page.locator('#open-create-quiz-modal-btn');
  await expect(openGeneratorBtn).toBeVisible({ timeout: 10000 });
  await openGeneratorBtn.click();

  // 5. Wait for Generator Modal
  const generatorModal = page.locator('#custom-quiz-modal');
  await expect(generatorModal).toBeVisible({ timeout: 30000 });

  // 5.5. Open the "Test Generator" Accordion
  const subjectToggle = generatorModal.locator('#test-generator-subject-toggle');
  await expect(subjectToggle).toBeVisible({ timeout: 30000 });

  // Ensure it's expanded
  let isSubjectExpanded = await subjectToggle.getAttribute('aria-expanded');
  if (isSubjectExpanded !== 'true') {
    await subjectToggle.click();
    // Wait for the specific container for this generator
    await expect(generatorModal.locator('#test-generator-chapters-container')).toBeVisible({ timeout: 15000 });
  }

  // 6. Select questions (Random All)
  const randomAllBtn = generatorModal.locator('#generator-random-all-btn');
  await expect(randomAllBtn).toBeVisible({ timeout: 15000 });
  await randomAllBtn.click();

  // 7. Confirm random selection
  // Wait for the modal and a specific child to ensure it's fully rendered and visible
  const randomConfirmModal = page.locator('#random-all-modal');
  const confirmBtn = page.locator('#random-all-confirm-btn');

  // Ensure the modal is visible and has the is-open class
  await expect(randomConfirmModal).toHaveClass(/is-open/, { timeout: 10000 });
  await expect(confirmBtn).toBeVisible({ timeout: 15000 });

  await confirmBtn.click();

  await expect(randomConfirmModal).toBeHidden({ timeout: 10000 });

  // 7. Verify total count updated
  const totalCount = page.locator('#total-question-count');
  await expect(totalCount).not.toHaveText('0', { timeout: 15000 });

  // 8. Start Quiz
  const startBtn = page.locator('#custom-quiz-start-btn');
  await expect(startBtn).toBeEnabled({ timeout: 15000 });
  await startBtn.click();

  // 9. Verify Navigation and Quiz Screen
  // Use a selector that only matches visible elements to avoid strict mode violations
  // 9. Verify Navigation and Quiz Screen
  // Use a selector that only matches visible elements to avoid strict mode violations
  await expect(page.locator('#quiz-screen')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('#start-screen')).toBeHidden();
});
