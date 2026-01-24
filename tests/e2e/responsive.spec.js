import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should allow menu interaction on mobile', async ({ page }) => {
    // Set viewport to iPhone 12 Pro dimensions
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Verify Menu Button is visible
    const menuBtn = page.locator('#main-menu-btn');
    await expect(menuBtn).toBeVisible();

    // Click Menu
    await menuBtn.click();

    // Verify Dropdown opens
    const dropdown = page.locator('#main-menu-dropdown');
    await expect(dropdown).toBeVisible();

    // Verify Content
    await expect(page.locator('#header-challenge-menu-btn')).toBeVisible();
  });

  test('should adjust title size on desktop', async ({ page }) => {
    await page.goto('/');

    // On Desktop (default viewport usually 1280x720 in Playwright)
    await page.setViewportSize({ width: 1920, height: 1080 });

    const title = page.locator('h1.font-kanit');
    // Check if class contains the responsive classes
    // Note: We can't easily check computed font size via class match, 
    // but we can ensure the element is visible and has the classes.
    await expect(title).toHaveClass(/md:text-3xl/);
  });
});
