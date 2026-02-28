import { test, expect } from '@playwright/test';

test.describe('Summary Dashboard Validation', () => {
  test('Landing Page and Semester Selection works', async ({ page }) => {
    // Handle console errors specifically to catch ReferenceErrors
    const errors = [];
    page.on('pageerror', err => {
      errors.push(err.message);
    });

    // Go to the summary page
    await page.goto('http://localhost:5173/Physics-and-EarthScience-Quiz/summary.html?dev=true');

    // Wait for page to initialize and animations to finish
    await page.waitForTimeout(2000);

    // Verify we are on the landing page Hub correctly
    const heading = page.locator('h3', { hasText: 'เริ่มต้นดูคะแนน' });
    await expect(heading).toBeVisible();

    // Select Term 1 via Dropdown
    console.log('Switching to Term 1 via Dropdown...');
    const selector = page.locator('#semester-selector');
    await selector.selectOption('1/2568');

    // Verify that the table renders (Wait for Room Summary Table)
    const tableHeader = page.locator('h3', { hasText: 'สรุปรายห้องเรียน' });
    await expect(tableHeader).toBeVisible();

    // Change to Term 2 via Dropdown
    console.log('Switching to Term 2 via Dropdown...');
    await selector.selectOption('2/2568');

    // Verify the Term 2 simplified table renders
    await page.waitForTimeout(1000);
    await expect(tableHeader).toBeVisible();

    // Validate that no uncaught page errors occurred during navigation
    expect(errors).toEqual([]);
  });
});
