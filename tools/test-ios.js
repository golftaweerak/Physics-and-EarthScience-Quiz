const { webkit, devices } = require('playwright');

(async () => {
  const browser = await webkit.launch({ headless: false }); // false เพื่อให้เห็นหน้าต่าง Browser
  const context = await browser.newContext({
    ...devices['iPhone 12'], // จำลองเป็น iPhone 12
  });
  const page = await context.newPage();
  await page.goto('http://localhost:5500/index.html'); // ใส่ URL ของคุณ (เช่น Live Server)

  // รอให้คุณดูผลลัพธ์สักพัก (หรือใส่ breakpoint)
  // await browser.close();
})();
