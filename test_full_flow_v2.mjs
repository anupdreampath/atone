import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('📱 Starting signup flow...');
    
    // Screen 1: Enter phone
    console.log('Step 1️⃣ : Entering phone...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    const testPhone = '555-' + Math.random().toString().substring(2, 8);
    await page.fill('input[placeholder="YOUR NUMBER"]', testPhone);
    await page.click('button:has-text("ENTER")');
    await page.waitForNavigation();
    console.log(`✅ Phone submitted: ${testPhone}`);
    
    // Screen 2: Enter email
    console.log('Step 2️⃣ : Entering email...');
    const testEmail = `test-${Date.now()}@example.com`;
    await page.fill('input[placeholder="YOUR EMAIL"]', testEmail);
    await page.click('button:has-text("ENTER")');
    await page.waitForNavigation();
    console.log(`✅ Email submitted: ${testEmail}`);
    
    // Wait for logs to be recorded
    await page.waitForTimeout(2000);
    
    // Go to admin dashboard
    console.log('\n🔐 Going to admin dashboard...');
    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle' });
    
    console.log('🔓 Logging in...');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Login")');
    
    await page.waitForURL('**/admin/dashboard', { timeout: 8000 });
    await page.waitForSelector('table tbody tr', { timeout: 5000 });
    console.log('✅ Admin dashboard loaded');
    
    // Refresh logs
    await page.click('button:has-text("Refresh")');
    await page.waitForTimeout(1000);
    
    // Get latest logs
    const latestRows = await page.$$eval('table tbody tr', trs => {
      return trs.slice(-5).map(tr => {
        const cells = tr.querySelectorAll('td');
        return {
          sr: cells[0]?.textContent.trim(),
          phone: cells[1]?.textContent.trim(),
          email: cells[2]?.textContent.trim(),
          action: cells[3]?.textContent.trim()
        };
      });
    });

    console.log('\n📊 Latest 5 rows in admin dashboard:');
    latestRows.forEach((row, i) => {
      console.log(`Row: SR#${row.sr} | Phone: ${row.phone} | Email: ${row.email} | Action: ${row.action}`);
    });

    // Check if latest row has both
    const latest = latestRows[latestRows.length - 1];
    if (latest.phone !== '—' && latest.email !== '—') {
      console.log('\n✅ SUCCESS! Latest row has BOTH phone and email in one row');
    } else if (latest.phone !== '—') {
      console.log('\n❌ PROBLEM: Latest row has ONLY phone (no email)');
    } else if (latest.email !== '—') {
      console.log('\n❌ PROBLEM: Latest row has ONLY email (no phone)');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await browser.close();
  }
})();
