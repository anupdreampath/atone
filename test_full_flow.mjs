import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('📱 Starting signup flow...');
    
    // Go to home page
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    console.log('✅ Home page loaded');
    
    // Screen 1: Enter phone
    console.log('📞 Entering phone number...');
    const phoneInput = await page.$('input[type="tel"]');
    if (phoneInput) {
      await page.fill('input[type="tel"]', '555-123-4567');
      await page.click('button:has-text("ENTER")');
      await page.waitForNavigation();
      console.log('✅ Phone submitted');
    } else {
      console.log('⚠️ Phone input not found, might be different structure');
    }
    
    // Screen 2: Enter email
    console.log('📧 Entering email...');
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      const randomEmail = `test-${Date.now()}@example.com`;
      await page.fill('input[type="email"]', randomEmail);
      await page.click('button:has-text("ENTER")');
      await page.waitForNavigation();
      console.log('✅ Email submitted');
    } else {
      console.log('⚠️ Email input not found');
    }
    
    console.log('⏳ Waiting for logs to be recorded...');
    await page.waitForTimeout(2000);
    
    // Go to admin dashboard
    console.log('🔐 Going to admin login...');
    await page.goto('http://localhost:5173/admin/login');
    
    console.log('🔓 Logging in...');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Login")');
    
    await page.waitForURL('**/admin/dashboard', { timeout: 8000 });
    console.log('✅ In admin dashboard');
    
    // Refresh to get latest logs
    await page.click('button:has-text("Refresh")');
    await page.waitForTimeout(1500);
    
    // Check the table
    await page.waitForSelector('table tbody tr');
    
    const allRows = await page.$$eval('table tbody tr', trs => {
      return trs.map(tr => {
        const cells = tr.querySelectorAll('td');
        return {
          sr: cells[0]?.textContent.trim(),
          phone: cells[1]?.textContent.trim(),
          email: cells[2]?.textContent.trim(),
          action: cells[3]?.textContent.trim(),
          ip: cells[4]?.textContent.trim()
        };
      });
    });

    console.log('\n📊 Latest Query Logs (Last 5 rows):');
    allRows.slice(-5).forEach((row, i) => {
      console.log(`Row ${i + 1}:`, row);
    });

    // Analysis
    const rowsWithBoth = allRows.filter(r => r.phone !== '—' && r.email !== '—');
    const rowsPhoneOnly = allRows.filter(r => r.phone !== '—' && r.email === '—');
    const rowsEmailOnly = allRows.filter(r => r.phone === '—' && r.email !== '—');

    console.log(`\n📈 Analysis:`);
    console.log(`✅ Rows with BOTH phone & email: ${rowsWithBoth.length}`);
    console.log(`Rows with ONLY phone: ${rowsPhoneOnly.length}`);
    console.log(`Rows with ONLY email: ${rowsEmailOnly.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
