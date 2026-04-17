import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Go through signup
    console.log('📱 Testing user signup flow...');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    
    const phone = '555-' + Math.random().toString().substring(2, 8);
    const email = `test-${Date.now()}@example.com`;
    
    await page.fill('input[placeholder="YOUR NUMBER"]', phone);
    await page.click('button:has-text("ENTER")');
    await page.waitForTimeout(1500);
    
    await page.fill('input[placeholder="YOUR EMAIL"]', email);
    await page.click('button:has-text("ENTER")');
    await page.waitForTimeout(2000);
    
    console.log(`✅ Submitted: Phone="${phone}" Email="${email}"`);
    
    // Go to admin
    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Login")');
    await page.waitForTimeout(2000);
    
    // Wait for table and refresh
    try {
      await page.click('button:has-text("Refresh")');
      await page.waitForTimeout(1500);
    } catch (e) {
      console.log('No refresh button found');
    }
    
    // Check table
    const tableExists = await page.$('table tbody tr') !== null;
    if (!tableExists) {
      console.log('⚠️  No table rows found');
      process.exit(0);
    }
    
    const rows = await page.$$eval('table tbody tr', trs => {
      return trs.map(tr => {
        const cells = tr.querySelectorAll('td');
        return {
          sr: cells[0]?.textContent.trim(),
          phone: cells[1]?.textContent.trim(),
          email: cells[2]?.textContent.trim(),
          action: cells[3]?.textContent.trim()
        };
      });
    });

    console.log(`\n📊 Admin Dashboard - All ${rows.length} rows:`);
    rows.forEach((row, i) => {
      const hasBoth = row.phone !== '—' && row.email !== '—';
      const emoji = hasBoth ? '✅' : '❌';
      console.log(`${emoji} SR#${row.sr}: Phone="${row.phone}" | Email="${row.email.substring(0, 20)}..."`);
    });

    const withBoth = rows.filter(r => r.phone !== '—' && r.email !== '—').length;
    console.log(`\n📈 Summary: ${withBoth}/${rows.length} rows have BOTH phone & email`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
