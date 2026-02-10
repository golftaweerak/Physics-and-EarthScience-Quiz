import { test, expect } from '@playwright/test';

test('verify scientific calculator functionality', async ({ page }) => {
  test.setTimeout(60000); // Extended for additional feature tests
  // Navigate to quiz page (using a valid quiz ID)
  await page.goto('quiz/index.html?id=phy_m4/phy_m4_ch6-1');

  // Wait for page load and skip intro if needed
  await page.locator('#start-btn').click();

  const toggleBtn = page.locator('#calculator-toggle-btn');
  const modal = page.locator('#scientific-calculator-modal');
  const display = page.locator('#calc-display-rendered'); // Expression area
  const resultDisplay = page.locator('#calc-result-area'); // Result area (new in Casio update)
  const equalsBtn = page.locator('#btn-equals');
  const modeBtn = page.locator('#calc-mode-indicator'); // Updated ID

  // 1. Toggle visibility
  await expect(toggleBtn).toBeVisible();
  await toggleBtn.click();
  await expect(modal).toBeVisible();

  // Helper to click calculator buttons
  const clickBtn = async (val) => {
    // Support both data-val and data-action
    const btn = page.locator(`.c-btn[data-val="${val}"], .c-btn[data-action="${val}"]`);
    await btn.first().click({ force: true });
  };

  // 2. Basic Arithmetic & Order of Operations: 2 + 3 * 4 = 14
  await clickBtn('2');
  await clickBtn('+');
  await clickBtn('3');
  await clickBtn('*');
  await clickBtn('4');
  await equalsBtn.click();
  await expect(resultDisplay).toContainText('14');

  // 3. Clear (AC)
  await clickBtn('AC');
  await expect(display).toHaveText(''); // Expression cleared
  await expect(resultDisplay).toHaveText(''); // Result cleared

  // 4. Scientific - Square Root: sqrt(9) = 3
  await clickBtn('sqrt'); // Updated selector value
  await clickBtn('9');
  await clickBtn(')');
  await equalsBtn.click();
  await expect(resultDisplay).toContainText('3'); // Relaxed check for KaTeX

  // 4b. Fractions & S-D Toggle: 1/2 + 1/4 = 0.75 or 3/4
  await clickBtn('AC');
  await clickBtn('1');
  await clickBtn('frac'); // Updated selector value
  await clickBtn('2');
  await clickBtn('+');
  await clickBtn('1');
  await clickBtn('frac');
  await clickBtn('4');
  await equalsBtn.click();

  // Toggle to fraction mode and check (math.js might default to decimal or fraction)
  // We'll toggle it to ensure we see the fraction
  await clickBtn('sd'); // Updated selector value
  // KaTeX renders fractions visually, check for component numbers
  await expect(resultDisplay).toContainText('3');
  await expect(resultDisplay).toContainText('4');

  // Toggle back to decimal
  await clickBtn('sd');
  await expect(resultDisplay).toContainText('0.75');

  // 5. Trigonometry - DEG Mode: sin(30) = 0.5
  await clickBtn('AC');
  // Ensure we are in DEG mode (default)
  const modeText = await modeBtn.innerText();
  if (modeText !== 'DEG') await modeBtn.click();

  await clickBtn('sin');
  await clickBtn('3');
  await clickBtn('0');
  await clickBtn(')');
  await equalsBtn.click();
  const val = await resultDisplay.innerText();
  // KaTeX might use U+2212 for minus, and innerText might have newlines
  const cleanVal = val.replace(/\u2212/g, '-').replace(/\n/g, '').trim();
  // We use closeTo because floating point precision
  expect(parseFloat(cleanVal)).toBeCloseTo(0.5, 5);

  // 6. Trigonometry - RAD Mode: sin(pi) approx 0
  await modeBtn.click({ force: true });
  // Small delay for state change/DOM update
  await page.waitForTimeout(100);
  await expect(modeBtn).toHaveText('RAD');
  await clickBtn('AC');
  await clickBtn('sin');
  // PI is Shift + Exp
  await clickBtn('shift'); // Replaced shift logic
  await clickBtn('exp');
  await clickBtn(')');
  await equalsBtn.click();
  const radVal = await resultDisplay.innerText(); // Corrected reading
  expect(parseFloat(radVal)).toBeCloseTo(0, 5);

  // 7. Draggable - Verify header exists
  await expect(page.locator('#calc-header')).toBeVisible();

  // 8. Close
  await page.locator('#calc-close').click({ force: true });
  await expect(modal).toBeHidden();

  // 9. Re-open and Test Custom Features (STO, ENG, Calculus)
  await toggleBtn.click();

  // 9a. STO Variable A
  await clickBtn('AC');
  await clickBtn('5');
  await equalsBtn.click(); // Result 5
  // Store in A (STO -> neg/A)
  await clickBtn('sto');
  await clickBtn('neg'); // A
  // Display should show stored notification or just clear mod.
  // Verify usage: A + 2 = 7
  await clickBtn('AC');
  await clickBtn('alpha');
  await clickBtn('neg'); // A
  await clickBtn('+');
  await clickBtn('2');
  await equalsBtn.click();
  await expect(resultDisplay).toContainText('7');

  // 9b. Differentiation: d/dx(x^2, 3) = 6
  await clickBtn('AC');
  await clickBtn('shift');
  await clickBtn('int'); // derivative(
  await clickBtn('x');
  await clickBtn('sqr'); // ^2
  await clickBtn('shift');
  await clickBtn(')'); // ,
  await clickBtn('3');
  await clickBtn(')');
  await equalsBtn.click();
  // Numerical diff might be 6.0000...
  const diffVal = await resultDisplay.innerText();
  // KaTeX might render display twice (MathML + HTML) or with hidden text
  // Split by newline to get just the first representation
  const cleanDiffVal = diffVal.split('\n')[0].replace(/\u2212/g, '-').trim();
  expect(parseFloat(cleanDiffVal)).toBeCloseTo(6, 4);

  // 9c. ENG Notation
  await clickBtn('AC');
  await clickBtn('1');
  await clickBtn('2');
  await clickBtn('0');
  await clickBtn('0');
  await equalsBtn.click(); // 1200
  await clickBtn('eng');
  // Should become 1.2e+3 or similar
  await expect(resultDisplay).toContainText('1.2');
  // Check for exponent 3 (rendered as x10^3 or e+3)
  // Our math.js format(..., {notation:'engineering'}) output?
  // Generic math.js output for 1200 eng -> 1.2e+3 usually
  const engVal = await resultDisplay.innerText();
  expect(engVal).toMatch(/1\.2.*3/);

});
