import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Login to admin
    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Login")');
    await page.waitForTimeout(2000);
    
    // Get field names from database - check actual field names in the table
    const html = await page.content();
    
    // Check the browser console for logs
    page.on('console', msg => console.log('LOG:', msg.text()));
    
    console.log('📊 Checking actual field names in the database...');
    
    // We need to inspect the raw data, so let's access the page's JavaScript
    const fieldNames = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      return Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        return {
          phone: cells[1]?.textContent.trim(),
          email: cells[2]?.textContent.trim()
        };
      });
    });
    
    console.log('Raw table data:', JSON.stringify(fieldNames, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
