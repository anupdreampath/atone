const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('📱 Navigating to admin login...');
    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle' });

    console.log('🔐 Logging in...');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Login")');
    
    await page.waitForURL('**/admin/dashboard', { timeout: 8000 });
    console.log('✅ Logged in and navigated to dashboard');
    
    await page.waitForSelector('table thead', { timeout: 10000 });
    console.log('✅ Query logs table found');

    // Get table headers
    const headers = await page.$$eval('table thead th', ths => ths.map(th => th.textContent.trim()));
    console.log('\n📋 Table Headers:', headers);

    // Get table rows
    const rows = await page.$$eval('table tbody tr', trs => {
      return trs.slice(0, 5).map(tr => {
        const cells = tr.querySelectorAll('td');
        return Array.from(cells).map(cell => cell.textContent.trim());
      });
    });

    console.log('\n📊 First 5 Rows:');
    rows.forEach((row, i) => {
      console.log(`Row ${i + 1}:`, row);
    });

    // Analysis
    const allRows = await page.$$eval('table tbody tr', trs => {
      return trs.map(tr => {
        const cells = tr.querySelectorAll('td');
        return Array.from(cells).map(cell => cell.textContent.trim());
      });
    });

    const rowsWithBoth = allRows.filter(r => r[1] !== '—' && r[2] !== '—');
    const rowsPhoneOnly = allRows.filter(r => r[1] !== '—' && r[2] === '—');
    const rowsEmailOnly = allRows.filter(r => r[1] === '—' && r[2] !== '—');

    console.log(`\n📈 Analysis:`);
    console.log(`Total rows: ${allRows.length}`);
    console.log(`Rows with BOTH phone & email: ${rowsWithBoth.length}`);
    console.log(`Rows with ONLY phone: ${rowsPhoneOnly.length}`);
    console.log(`Rows with ONLY email: ${rowsEmailOnly.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
