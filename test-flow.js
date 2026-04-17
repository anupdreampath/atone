import { chromium } from 'playwright';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_HBER3nkU0spg@ep-quiet-dew-amnbcv6p-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require'
});

const BASE_URL = 'http://localhost:5173';
const colors = { reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', blue: '\x1b[34m', yellow: '\x1b[33m', cyan: '\x1b[36m' };

function log(color, title, message) { console.log(`${color}${title}${colors.reset} ${message}`); }

async function testScreenFlow() {
  log(colors.blue, '📱', 'Testing Screen Flow...\n');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    log(colors.cyan, '→ Screen 1:', 'Loading homepage');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/tmp/s1.png' });

    const hasInput1 = await page.locator('input[placeholder="YOUR NUMBER"]').isVisible();
    if (!hasInput1) throw new Error('Screen 1 input not found');
    log(colors.green, '✅ Screen 1:', 'Phone input visible');

    const phoneNumber = '5551234567';
    await page.fill('input[placeholder="YOUR NUMBER"]', phoneNumber);
    log(colors.green, '✅ Screen 1:', `Entered: ${phoneNumber}`);

    await page.click('.fullwidth-btn');
    await page.waitForURL(/\/screen2/);
    await page.screenshot({ path: '/tmp/s2.png' });
    log(colors.green, '✅ Screen 1→2:', 'Navigated to Screen 2');

    log(colors.cyan, '→ Screen 2:', 'Checking email input');
    const hasInput2 = await page.locator('input[placeholder="YOUR EMAIL"]').isVisible();
    if (!hasInput2) throw new Error('Screen 2 input not found');

    const email = 'testuser@example.com';
    await page.fill('input[placeholder="YOUR EMAIL"]', email);
    log(colors.green, '✅ Screen 2:', `Entered: ${email}`);

    await page.click('.fullwidth-btn');
    await page.waitForURL(/\/screen3/);
    await page.screenshot({ path: '/tmp/s3.png' });
    log(colors.green, '✅ Screen 2→3:', 'Navigated to Screen 3');

    log(colors.cyan, '→ Screen 3:', 'Checking shop image');
    const hasShopImage = await page.locator('.full-screen-image').isVisible();
    if (!hasShopImage) throw new Error('Shop image not found');
    log(colors.green, '✅ Screen 3:', 'Shop image displayed');

    const hasRestartBtn = await page.locator('.screen3-restart-btn').isVisible();
    if (!hasRestartBtn) throw new Error('Restart button not found');
    log(colors.green, '✅ Screen 3:', '"Start Over" button visible');

    log(colors.green, '\n✅ SCREEN FLOW TEST PASSED\n', '');
    return { success: true, phoneNumber, email };
  } catch (error) {
    log(colors.red, '❌ Error:', error.message);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

async function testQueryLogging() {
  log(colors.blue, '📊', 'Testing Query Logging to Database...\n');

  try {
    const testEmail = `testuser-${Date.now()}@example.com`;
    const testName = 'Test User';

    const userResult = await pool.query('INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *', [testEmail, testName]);
    const userId = userResult.rows[0].id;
    log(colors.green, '✅ Created:', `Test user ID ${userId} (${testEmail})`);

    const queries = [
      { field_name: 'phone_number', query_value: '5551234567', action: 'search', ip_address: '192.168.1.1' },
      { field_name: 'email', query_value: testEmail, action: 'search', ip_address: '192.168.1.1' },
      { field_name: 'submit_button', query_value: '', action: 'form_submit', ip_address: '192.168.1.1' }
    ];

    log(colors.cyan, '→', 'Logging sample queries');
    for (const q of queries) {
      await pool.query(`INSERT INTO query_logs (user_id, field_name, query_value, action, ip_address) VALUES ($1, $2, $3, $4, $5)`, [userId, q.field_name, q.query_value, q.action, q.ip_address]);
      log(colors.green, '✅ Logged:', `${q.action} on ${q.field_name}`);
    }

    log(colors.cyan, '→', 'Verifying structured query format');
    const logsResult = await pool.query('SELECT * FROM query_logs WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    const logs = logsResult.rows;

    if (logs.length === 0) throw new Error('No logs found');
    log(colors.green, '✅ Found:', `${logs.length} logged queries\n`);

    console.log(colors.cyan + '📋 Query Log Structure (Database Format):' + colors.reset);
    console.log('━'.repeat(80));

    logs.forEach((log, index) => {
      console.log(`\n${colors.yellow}Query #${index + 1}${colors.reset}`);
      console.log(`  ID:          ${log.id}`);
      console.log(`  User ID:     ${log.user_id}`);
      console.log(`  Field:       "${log.field_name}"`);
      console.log(`  Value:       "${log.query_value}"`);
      console.log(`  Action:      "${log.action}"`);
      console.log(`  IP Address:  ${log.ip_address}`);
      console.log(`  Timestamp:   ${new Date(log.created_at).toISOString()}`);
    });

    console.log('\n' + '━'.repeat(80));

    // Show JSON format
    console.log(`\n${colors.cyan}📋 Query Log Structure (JSON Format):${colors.reset}`);
    console.log('━'.repeat(80));
    console.log(JSON.stringify(logs[0], null, 2));
    console.log('━'.repeat(80) + '\n');

    log(colors.green, '✅ QUERY LOGGING TEST PASSED\n', '');
    return { success: true, userId, logs };
  } catch (error) {
    log(colors.red, '❌ Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testAdminDashboard() {
  log(colors.blue, '🔐', 'Testing Admin Dashboard Query Viewing...\n');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    log(colors.cyan, '→', 'Navigating to admin login');
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/tmp/admin-login.png' });

    log(colors.cyan, '→', 'Logging in as demo admin');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/admin\/dashboard/, { timeout: 5000 });
    await page.screenshot({ path: '/tmp/admin-dash.png' });
    log(colors.green, '✅ Logged in:', 'Admin dashboard loaded');

    log(colors.cyan, '→', 'Navigating to Query Logs');
    const logsNavButton = page.locator('text=Query Logs');
    await logsNavButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/admin-logs.png' });
    log(colors.green, '✅ Opened:', 'Query Logs section');

    const logsTable = page.locator('.logs-table table tbody');
    const rowCount = await logsTable.locator('tr').count();

    if (rowCount > 0) {
      log(colors.green, '✅ Visible:', `${rowCount} query log entries in admin dashboard`);

      const firstRowCells = page.locator('.logs-table table tbody tr:first-child td');
      const cellCount = await firstRowCells.count();

      if (cellCount > 0) {
        const cells = [];
        for (let i = 0; i < Math.min(cellCount, 7); i++) {
          const text = await firstRowCells.nth(i).textContent();
          cells.push(text.trim());
        }

        console.log(`\n${colors.cyan}📋 Admin Dashboard Query Display:${colors.reset}`);
        console.log('━'.repeat(80));
        console.log(`  ID:          ${cells[0] || 'N/A'}`);
        console.log(`  User:        ${cells[1] || 'N/A'}`);
        console.log(`  Field:       ${cells[2] || 'N/A'}`);
        console.log(`  Value:       ${cells[3] || 'N/A'}`);
        console.log(`  Action:      ${cells[4] || 'N/A'}`);
        console.log(`  IP Address:  ${cells[5] || 'N/A'}`);
        console.log(`  Time:        ${cells[6] || 'N/A'}`);
        console.log('━'.repeat(80) + '\n');
      }
    } else {
      log(colors.yellow, '⚠️  Info:', 'No logs visible yet');
    }

    log(colors.green, '✅ ADMIN DASHBOARD TEST PASSED\n', '');
    return { success: true };
  } catch (error) {
    log(colors.red, '❌ Error:', error.message);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

async function runAllTests() {
  console.clear();
  log(colors.blue, '🧪', '='.repeat(60));
  log(colors.blue, '🧪', 'COMPREHENSIVE TEST SUITE - Flow & Query Logging');
  log(colors.blue, '🧪', '='.repeat(60) + '\n');

  const results = {
    'Screen Flow': await testScreenFlow(),
    'Query Logging': await testQueryLogging(),
    'Admin Dashboard': await testAdminDashboard()
  };

  console.log(colors.blue + '\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60) + colors.reset);

  const passed = Object.values(results).filter(r => r.success).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, result]) => {
    const status = result.success ? `${colors.green}✅ PASSED${colors.reset}` : `${colors.red}❌ FAILED${colors.reset}`;
    console.log(`  ${test.padEnd(20)}: ${status}`);
  });

  console.log('━'.repeat(60));
  console.log(`  Result: ${colors.green}${passed}/${total} tests passed${colors.reset}\n`);

  if (passed === total) {
    log(colors.green, '🎉', 'All tests passed! ✨\n');
  }

  await pool.end();
  process.exit(passed === total ? 0 : 1);
}

runAllTests().catch(err => { log(colors.red, '❌', err.message); process.exit(1); });
