import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should look correct', async ({ page }) => {
    // Check title (Matches actual deployed title)
    await expect(page).toHaveTitle(/แบบฝึกหัดฟิสิกส์ & วิทย์โลก/);

    // Check header
    await expect(page.locator('header')).toBeVisible();
    // main_header-placeholder is often hidden or just a spacer, so skipping visibility check.

    // Check quiz categories container
    const categoriesContainer = page.locator('#quiz-categories-container');
    await expect(categoriesContainer).toBeVisible();

    // Check for at least one category section
    await expect(page.locator('.section-accordion').first()).toBeVisible();
  });

  test('should navigate to a quiz', async ({ page }) => {
    // 1. Wait for the loading placeholder to disappear (ensures main.js has rendered content)
    await expect(page.locator('#categories-placeholder')).toBeHidden({ timeout: 10000 });

    // 2. Find the first category toggle
    const firstToggle = page.locator('.section-toggle').first();
    await expect(firstToggle).toBeVisible({ timeout: 5000 });

    // 2. Click to expand if not already expanded
    const isExpanded = await firstToggle.getAttribute('aria-expanded') === 'true';
    if (!isExpanded) {
      await firstToggle.click();
      const sectionId = await firstToggle.getAttribute('aria-controls');
      const contentDiv = page.locator(`#${sectionId}`);
      await expect(contentDiv).toHaveClass(/grid-rows-\[1fr\]/);
    }

    // 3. Handle Nested Accordions (Sub-categories)
    // Check if there is a sub-accordion toggle visible inside the expanded section
    // Use .first() but ensure it's visible. If none visible, skip.
    const subToggle = page.locator('.section-content .sub-section-toggle:visible').first();
    if (await subToggle.isVisible()) {
      const isSubExpanded = await subToggle.getAttribute('aria-expanded') === 'true';
      if (!isSubExpanded) {
        await subToggle.click();
        const subContent = subToggle.locator('xpath=following-sibling::div');
        await expect(subContent).toHaveClass(/grid-rows-\[1fr\]/);
      }
    }

    // 4. Click a Quiz Card
    // Use force: true to bypass potential overlay interception (like fixed headers)
    const card = page.locator('.quiz-card:visible').first();
    await expect(card).toBeVisible();

    // Get the href to verify later
    const quizUrl = await card.getAttribute('href');

    // Force click to ensure it works even if header overlaps slightly
    // Better practice: scroll into view if needed, don't use force unless necessary
    await card.scrollIntoViewIfNeeded();
    await card.click();

    // 5. Verify Navigation
    const expectedId = quizUrl.split('id=')[1];
    await expect(page).toHaveURL(new RegExp(`id=${expectedId}`));

    // 6. Verify Quiz Start Screen (or Quiz Screen for random scenarios)
    // Use .first() to avoid strict mode violations if both exist (one hidden)
    const validScreens = page.locator('#start-screen, #quiz-screen').filter({ hasText: /./ }); // Basic filter
    // Better: check for visibility
    const visibleScreen = page.locator('#start-screen:visible, #quiz-screen:visible');
    await expect(visibleScreen.first()).toBeVisible({ timeout: 15000 });
  });
});
