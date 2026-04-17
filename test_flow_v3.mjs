import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('📱 Starting signup flow...');
    
    // Screen 1: Enter phone
    console.log('Step 1️⃣ : Entering phone...');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    const testPhone = '555-' + Math.random().toString().substring(2, 8);
    await page.fill('input[placeholder="YOUR NUMBER"]', testPhone);
    console.log(`Typed phone: ${testPhone}`);
    
    // Click and wait for screen change
    await page.click('button:has-text("ENTER")');
    await page.waitForTimeout(2000); // Wait for page change
    console.log('✅ Phone submitted');
    
    // Screen 2: Enter email
    console.log('Step 2️⃣ : Entering email...');
    const testEmail = `test-${Date.now()}@example.com`;
    await page.fill('input[placeholder="YOUR EMAIL"]', testEmail);
    console.log(`Typed email: ${testEmail}`);
    
    // Click and wait
    await page.click('button:has-text("ENTER")');
    await page.waitForTimeout(2000);
    console.log('✅ Email submitted');
    
    // Go to admin
    console.log('\n🔐 Navigating to admin login...');
    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'domcontentloaded' });
    
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Login")');
    await page.waitForTimeout(2000);
    
    await page.waitForSelector('table tbody tr');
    console.log('✅ Admin dashboard loaded');
    
    // Refresh
    await page.click('button:has-text("Refresh")');
    await page.waitForTimeout(1500);
    
    // Get rows
    const allRows = await page.$$eval('table tbody tr', trs => {
      return trs.map(tr => {
        const cells = tr.querySelectorAll('td');
        return {
          sr: cells[0]?.textContent.trim(),
          phone: cells[1]?.textContent.trim(),
          email: cells[2]?.textContent.trim()
        };
      });
    });

    console.log(`\n📊 Total rows: ${allRows.length}`);
    console.log('Last 3 rows:');
    allRows.slice(-3).forEach(row => {
      const hasBoth = row.phone !== '—' && row.email !== '—' ? '✅' : '❌';
      console.log(`${hasBoth} SR#${row.sr}: Phone="${row.phone}" Email="${row.email}"`);
    });

    // Check latest
    const latest = allRows[allRows.length - 1];
    console.log('\n' + (latest.phone !== '—' && latest.email !== '—' ? '✅ SUCCESS' : '❌ ISSUE') + ': Latest row phone+email');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
