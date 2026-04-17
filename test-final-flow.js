import { chromium } from 'playwright';
import pkg from 'pg';
const { Pool } = pkg;

async function test() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 END-TO-END PLAYWRIGHT FLOW TEST');
  console.log('='.repeat(70) + '\n');

  const PORT = process.argv[2] || '5173';
  const BASE_URL = `http://localhost:${PORT}`;
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    // SCREEN 1
    console.log('📱 SCREEN 1: Phone Entry');
    console.log('━'.repeat(70));
    await page.goto(BASE_URL, { waitUntil: 'load' });
    await page.waitForTimeout(3000);

    const input1 = page.locator('input[placeholder="YOUR NUMBER"]');
    await input1.waitFor({ timeout: 10000 });
    
    await input1.fill('5551234567');
    console.log('✅ Entered phone: 5551234567');
    await page.screenshot({ path: '/tmp/final-s1-filled.png' });

    const btn1 = page.locator('.fullwidth-btn').first();
    await btn1.click();
    console.log('✅ Clicked ENTER');
    
    await page.waitForURL(/\/screen2/, { timeout: 10000 });
    console.log('✅ Navigated to Screen 2\n');
    await page.screenshot({ path: '/tmp/final-s2-start.png' });

    // SCREEN 2
    console.log('📧 SCREEN 2: Email Entry');
    console.log('━'.repeat(70));
    const input2 = page.locator('input[placeholder="YOUR EMAIL"]');
    await input2.waitFor({ timeout: 10000 });
    
    await input2.fill('john.doe@example.com');
    console.log('✅ Entered email: john.doe@example.com');
    await page.screenshot({ path: '/tmp/final-s2-filled.png' });

    const btn2 = page.locator('.fullwidth-btn').first();
    await btn2.click();
    console.log('✅ Clicked ENTER');
    
    await page.waitForURL(/\/screen3/, { timeout: 10000 });
    console.log('✅ Navigated to Screen 3\n');
    await page.screenshot({ path: '/tmp/final-s3-start.png' });

    // SCREEN 3
    console.log('🛍️ SCREEN 3: Shop Display');
    console.log('━'.repeat(70));
    const shopImg = page.locator('.full-screen-image');
    await shopImg.waitFor({ timeout: 10000 });
    console.log('✅ Shop image displayed');

    const restartBtn = page.locator('.screen3-restart-btn');
    await restartBtn.waitFor({ timeout: 5000 });
    console.log('✅ "Start Over" button found\n');
    await page.screenshot({ path: '/tmp/final-s3-complete.png' });

    // Check database
    console.log('🔍 DATABASE CHECK');
    console.log('━'.repeat(70));
    const pool = new Pool({
      connectionString: 'postgresql://neondb_owner:npg_HBER3nkU0spg@ep-quiet-dew-amnbcv6p-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require'
    });

    const logs = await pool.query('SELECT * FROM query_logs ORDER BY created_at DESC LIMIT 10');
    console.log(`✅ Found ${logs.rows.length} logged queries\n`);

    console.log('📋 Latest Logged Queries:');
    console.log('━'.repeat(70));
    logs.rows.slice(0, 5).forEach((row, idx) => {
      console.log(`\nQuery #${idx + 1}:`);
      console.log(`  ID: ${row.id}`);
      console.log(`  User ID: ${row.user_id}`);
      console.log(`  Field: "${row.field_name}"`);
      console.log(`  Value: "${row.query_value}"`);
      console.log(`  Action: "${row.action}"`);
      console.log(`  IP: ${row.ip_address}`);
      console.log(`  Time: ${new Date(row.created_at).toISOString()}`);
    });

    console.log('\n' + '━'.repeat(70));
    console.log('\n🎉 SUCCESS! Complete flow test passed!\n');
    console.log('Screenshots saved to /tmp/final-s*.png\n');

    await pool.end();
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nStack:', error.stack);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

test();
