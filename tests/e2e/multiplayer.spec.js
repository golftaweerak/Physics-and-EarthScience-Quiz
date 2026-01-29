import { test, expect } from '@playwright/test';

test.describe('Multiplayer Lobby', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should validate login requirement when creating a lobby', async ({ page }) => {
    // 1. Open Main Menu if needed
    const menuBtn = page.locator('#main-menu-btn');
    const dropdown = page.locator('#main-menu-dropdown');

    // 1. Open Main Menu if needed
    // Deterministic check: only click if currently hidden
    if (await dropdown.isHidden()) {
      await menuBtn.click();
    }
    // Verify it ends up visible
    await expect(dropdown).toBeVisible();

    // 2. Click "Play with friends"
    await page.locator('#header-challenge-menu-btn').click();

    // 3. Click "Create Lobby"
    const createBtn = page.locator('#challenge-create-btn');
    await expect(createBtn).toBeVisible();
    // Use standard click to ensure button is interactive
    await createBtn.click();

    const modeModal = page.locator('#mode-select-modal');
    await expect(modeModal).toBeVisible();

    const classicBtn = page.locator('.mode-select-btn[data-mode="classic"]');
    await expect(classicBtn).toBeVisible();
    await classicBtn.click();

    const quizModal = page.locator('#quiz-select-modal');
    await expect(quizModal).toBeVisible();

    // 4. Click Random Quiz -> Triggers Create Lobby
    const randomBtn = page.locator('#quiz-select-random');
    await expect(randomBtn).toBeVisible();
    // Small wait to ensure animation checks don't interfere
    await page.waitForTimeout(300);
    await randomBtn.click();

    // 5. Verify "Login Required" Toast
    // Matches "ต้องเข้าสู่ระบบ" or any Login related warning
    const toast = page.locator('div').filter({ hasText: /ต้องเข้าสู่ระบบ|กรุณาเข้าสู่ระบบ/ }).first();
    await expect(toast).toBeVisible({ timeout: 10000 });
  });

  test('should show join input when clicking join', async ({ page }) => {
    // 1. Open Main Menu if needed
    const menuBtn = page.locator('#main-menu-btn');
    const dropdown = page.locator('#main-menu-dropdown');

    // 1. Open Main Menu if needed
    // Deterministic check
    if (await dropdown.isHidden()) {
      await menuBtn.click();
    }
    await expect(dropdown).toBeVisible();

    // 2. Click "Play with friends"
    await page.locator('#header-challenge-menu-btn').click();

    // 3. Click "Join Room"
    const joinBtn = page.locator('#challenge-join-btn');
    await expect(joinBtn).toBeVisible();
    await joinBtn.click();

    // 4. Verify Join Modal
    await expect(page.locator('#join-lobby-modal')).toBeVisible();
    await expect(page.locator('#join-room-code-input')).toBeVisible();
    await expect(page.locator('#confirm-join-btn')).toBeVisible();
  });
});
