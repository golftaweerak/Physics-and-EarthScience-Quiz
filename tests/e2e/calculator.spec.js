import { test, expect } from '@playwright/test';

test('verify scientific calculator functionality', async ({ page }) => {
  // Navigate to quiz page (using a valid quiz ID)
  await page.goto('quiz/index.html?id=phy_m4/phy_m4_ch6-1');

  // Wait for page load and skip intro if needed
  await page.locator('#start-btn').click();

  const toggleBtn = page.locator('#calculator-toggle-btn');
  const modal = page.locator('#scientific-calculator-modal');
  const display = page.locator('#calc-display-rendered');
  const equalsBtn = page.locator('#calc-equals');
  const modeBtn = page.locator('#calc-mode-toggle');

  // 1. Toggle visibility
  await expect(toggleBtn).toBeVisible();
  await toggleBtn.click();
  await expect(modal).toBeVisible();

  // Helper to click calculator buttons
  const clickBtn = async (val) => {
    await page.locator(`.calc-btn[data-val="${val}"]`).click({ force: true });
  };

  // 2. Basic Arithmetic & Order of Operations: 2 + 3 * 4 = 14
  await clickBtn('2');
  await clickBtn('+');
  await clickBtn('3');
  await clickBtn('*');
  await clickBtn('4');
  await equalsBtn.click();
  await expect(display).toContainText('14');

  // 3. Clear (AC)
  await clickBtn('AC');
  await expect(display).toContainText('0');

  // 4. Scientific - Square Root: sqrt(9) = 3
  await clickBtn('sqrt(');
  await clickBtn('9');
  await clickBtn(')');
  await equalsBtn.click();
  await expect(display).toHaveText('3');

  // 4b. Fractions & S-D Toggle: 1/2 + 1/4 = 0.75 or 3/4
  await clickBtn('AC');
  await clickBtn('1');
  await clickBtn('FRAC');
  await clickBtn('2');
  await clickBtn('+');
  await clickBtn('1');
  await clickBtn('FRAC');
  await clickBtn('4');
  await equalsBtn.click();

  // Toggle to fraction mode and check (math.js might default to decimal or fraction)
  // We'll toggle it to ensure we see the fraction
  await clickBtn('SD');
  // KaTeX renders fractions visually, check for component numbers
  await expect(display).toContainText('3');
  await expect(display).toContainText('4');

  // Toggle back to decimal
  await clickBtn('SD');
  await expect(display).toHaveText('0.75');

  // 5. Trigonometry - DEG Mode: sin(30) = 0.5
  await clickBtn('AC');
  // Ensure we are in DEG mode (default)
  const modeText = await modeBtn.innerText();
  if (modeText !== 'DEG') await modeBtn.click();

  await clickBtn('sin(');
  await clickBtn('3');
  await clickBtn('0');
  await clickBtn(')');
  await equalsBtn.click();
  const val = await display.innerText();
  // We use closeTo because floating point precision
  expect(parseFloat(val)).toBeCloseTo(0.5, 5);

  // 6. Trigonometry - RAD Mode: sin(pi) approx 0
  await modeBtn.click({ force: true });
  // Small delay for state change/DOM update
  await page.waitForTimeout(100);
  await expect(modeBtn).toHaveText('RAD');
  await clickBtn('AC');
  await clickBtn('sin(');
  await clickBtn('PI');
  await clickBtn(')');
  await equalsBtn.click();
  const radVal = await display.inputValue();
  expect(parseFloat(radVal)).toBeCloseTo(0, 5);

  // 7. Draggable - Verify header exists
  await expect(page.locator('#calc-header')).toBeVisible();

  // 8. Close
  await page.locator('#calc-close').click({ force: true });
  await expect(modal).toBeHidden();
});
