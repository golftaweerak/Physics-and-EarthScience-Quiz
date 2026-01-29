import { test, expect } from '@playwright/test';

test('create and start a custom quiz', async ({ page }) => {
  // 1. Go to homepage
  // 1. Go to homepage
  await page.goto('./');
  // Wait for app to be fully initialized
  await page.waitForSelector('body[data-app-initialized="true"]', { timeout: 15000 });

  // 2. Open Hub Modal
  // Wait for main.js to render the buttons
  const createBtn = page.locator('#create-custom-quiz-btn');
  await expect(createBtn).toBeVisible({ timeout: 15000 });

  // Handle potential overlay/sticky header issues by forcing click or scrolling
  await createBtn.scrollIntoViewIfNeeded();

  // Wait for the modal component to be injected (proof that app-loader finished component loading)
  // This prevents clicking before the event listener is attached
  await page.locator('#custom-quiz-hub-modal').waitFor({ state: 'attached', timeout: 15000 });

  await createBtn.click({ force: true });

  // 3. Wait for Hub Modal
  const hubModal = page.locator('#custom-quiz-hub-modal');
  // It might take a moment for the class to switch from hidden
  await expect(hubModal).toBeVisible({ timeout: 10000 });

  // 4. Click "Create New Quiz" in Hub
  const openGeneratorBtn = page.locator('#open-create-quiz-modal-btn');
  await expect(openGeneratorBtn).toBeVisible();
  await openGeneratorBtn.click();

  // 5. Wait for Generator Modal
  const generatorModal = page.locator('#custom-quiz-modal');
  await expect(generatorModal).toBeVisible({ timeout: 5000 });

  // 5.5. Open the "Test Generator" Accordion
  // The generator content is loaded dynamically (Firestore fetching).
  // We must wait for the loading spinner to disappear and content to render.
  const accordionToggle = generatorModal.locator('.subject-accordion-toggle').first();
  // Increase timeout to 15s to handle resource contention in slow browsers (e.g. Firefox in CI)
  await expect(accordionToggle).toBeVisible({ timeout: 15000 });

  // Check if it's already expanded (aria-expanded="true"). If not, click it.
  if (await accordionToggle.getAttribute('aria-expanded') !== 'true') {
    await accordionToggle.click();
    // Wait for animation - checking if the content becomes visible
    // The content is .chapters-container
    await expect(generatorModal.locator('.chapters-container').first()).toBeVisible();
  }

  // 6. Select questions (Random All)
  // Use the "Random All" button inside the generator if available
  const randomAllBtn = page.locator('#generator-random-all-btn');
  if (await randomAllBtn.isVisible()) {
    await randomAllBtn.click();

    // Confirm random selection in the popup modal
    const randomConfirmModal = page.locator('#random-all-modal');
    await expect(randomConfirmModal).toBeVisible();
    await page.locator('#random-all-confirm-btn').click();
    await expect(randomConfirmModal).toBeHidden();
  } else {
    // Fallback: manually enter a number if the "Random All" layout is different
    const input = generatorModal.locator('input[type="number"][data-type="theory"]').first();
    await input.fill('5');
    await input.blur();
  }

  // 7. Verify total count updated
  const totalCount = page.locator('#total-question-count');
  await expect(totalCount).not.toHaveText('0');

  // 8. Start Quiz
  const startBtn = page.locator('#custom-quiz-start-btn');
  await startBtn.click();
  await page.waitForLoadState('networkidle');

  // 9. Verify Navigation
  await page.waitForURL(/.*id=custom_.*/, { timeout: 15000 });

  // 10. Verify Quiz Screen (Custom quizzes auto-start, skipping start screen)
  // Increase timeout to 15s to handle resource contention in full test suite runs
  await expect(page.locator('#quiz-screen')).toBeVisible({ timeout: 15000 });
});
