import { chromium } from 'playwright';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_HBER3nkU0spg@ep-quiet-dew-amnbcv6p-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require'
});

const BASE_URL = 'http://localhost:5173';
const colors = { reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', blue: '\x1b[34m', yellow: '\x1b[33m', cyan: '\x1b[36m' };

function log(color, title, msg) { console.log(`${color}${title}${colors.reset} ${msg}`); }

async function testCompleteFlow() {
  console.clear();
  log(colors.blue, '🧪', '='.repeat(70));
  log(colors.blue, '🧪', 'COMPLETE END-TO-END FLOW TEST - Playwright');
  log(colors.blue, '🧪', '='.repeat(70) + '\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    // SCREEN 1
    log(colors.cyan, '📱 SCREEN 1:', 'Loading app and entering phone number...\n');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/tmp/flow-screen1-start.png' });
    log(colors.green, '✅', 'Screen 1 loaded');

    const phoneInput = page.locator('input[placeholder="YOUR NUMBER"]');
    await phoneInput.waitFor({ timeout: 5000 });
    
    const phoneNumber = '555-123-4567';
    await phoneInput.fill(phoneNumber);
    log(colors.green, '✅', `Entered phone: ${phoneNumber}`);
    await page.screenshot({ path: '/tmp/flow-screen1-filled.png' });

    await page.click('.fullwidth-btn');
    log(colors.green, '✅', 'Clicked ENTER button');

    // Wait for navigation to screen 2
    await page.waitForURL(/\/screen2/, { timeout: 10000 });
    await page.waitForLoadState('load');
    await page.screenshot({ path: '/tmp/flow-screen2-start.png' });
    log(colors.green, '✅', 'Navigated to Screen 2\n');

    // SCREEN 2
    log(colors.cyan, '📧 SCREEN 2:', 'Entering email address...\n');
    const emailInput = page.locator('input[placeholder="YOUR EMAIL"]');
    await emailInput.waitFor({ timeout: 5000 });

    const email = 'john.doe@example.com';
    await emailInput.fill(email);
    log(colors.green, '✅', `Entered email: ${email}`);
    await page.screenshot({ path: '/tmp/flow-screen2-filled.png' });

    await page.click('.fullwidth-btn');
    log(colors.green, '✅', 'Clicked ENTER button');

    // Wait for navigation to screen 3
    await page.waitForURL(/\/screen3/, { timeout: 10000 });
    await page.waitForLoadState('load');
    await page.screenshot({ path: '/tmp/flow-screen3-start.png' });
    log(colors.green, '✅', 'Navigated to Screen 3\n');

    // SCREEN 3
    log(colors.cyan, '🛍️ SCREEN 3:', 'Verifying shop image and restart button...\n');
    const shopImage = page.locator('.full-screen-image');
    await shopImage.waitFor({ timeout: 5000 });
    log(colors.green, '✅', 'Shop image displayed');

    const restartBtn = page.locator('.screen3-restart-btn');
    await restartBtn.waitFor({ timeout: 5000 });
    log(colors.green, '✅', '"Start Over" button found');
    await page.screenshot({ path: '/tmp/flow-screen3-complete.png' });

    log(colors.green, '\n✅ COMPLETE FLOW SUCCESSFUL!\n', '');

    // Check database for logged queries
    log(colors.cyan, '🔍', 'Checking database for logged queries...\n');
    const logs = await pool.query(`
      SELECT * FROM query_logs 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    if (logs.rows.length > 0) {
      log(colors.green, '✅', `Found ${logs.rows.length} logged queries in database\n`);

      console.log(colors.cyan + '📋 Latest Logged Queries:' + colors.reset);
      console.log('━'.repeat(80));
      logs.rows.slice(0, 5).forEach((row, idx) => {
        console.log(`\n${colors.yellow}Query #${idx + 1}${colors.reset}`);
        console.log(`  ID:          ${row.id}`);
        console.log(`  User ID:     ${row.user_id}`);
        console.log(`  Field:       "${row.field_name}"`);
        console.log(`  Value:       "${row.query_value}"`);
        console.log(`  Action:      "${row.action}"`);
        console.log(`  IP:          ${row.ip_address}`);
        console.log(`  Time:        ${new Date(row.created_at).toLocaleString()}`);
      });
      console.log('\n' + '━'.repeat(80) + '\n');
    } else {
      log(colors.yellow, '⚠️', 'No queries found in database yet (logging may be in progress)\n');
    }

    log(colors.green, '✅ TEST COMPLETE!\n', 'All screens working, flow verified');

  } catch (error) {
    log(colors.red, '❌ ERROR:', error.message);
    console.error(error);
  } finally {
    console.log(colors.blue + '\n' + '='.repeat(70));
    console.log('Screenshots saved to /tmp/flow-screen*.png');
    console.log('='.repeat(70) + colors.reset + '\n');
    
    await pool.end();
    await browser.close();
  }
}

// Run test
testCompleteFlow().catch(err => {
  log(colors.red, '❌ FATAL:', err.message);
  process.exit(1);
});
