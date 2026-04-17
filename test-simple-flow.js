import { chromium } from 'playwright';

async function testFlow() {
  console.log('\n🧪 SIMPLE FLOW TEST\n');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    // Screen 1
    console.log('📱 Screen 1: Loading...');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    const url1 = page.url();
    console.log(`✅ Screen 1 URL: ${url1}`);
    await page.screenshot({ path: '/tmp/s1.png' });

    // Enter phone
    console.log('📱 Screen 1: Entering phone number...');
    const input = page.locator('input');
    await input.first().fill('5551234567');
    console.log('✅ Phone entered');
    
    // Click button
    console.log('📱 Screen 1: Clicking ENTER...');
    const btn = page.locator('button').first();
    await btn.click();
    await page.waitForTimeout(3000);
    
    const url2 = page.url();
    console.log(`📧 Screen 2 URL: ${url2}`);
    
    if (url2.includes('/screen2')) {
      console.log('✅ Navigation to Screen 2 SUCCESS');
      await page.screenshot({ path: '/tmp/s2.png' });
      
      // Screen 2
      console.log('📧 Screen 2: Entering email...');
      const input2 = page.locator('input');
      await input2.first().fill('test@example.com');
      console.log('✅ Email entered');
      
      const btn2 = page.locator('button').first();
      await btn2.click();
      await page.waitForTimeout(3000);
      
      const url3 = page.url();
      console.log(`🛍️ Screen 3 URL: ${url3}`);
      
      if (url3.includes('/screen3')) {
        console.log('✅ Navigation to Screen 3 SUCCESS');
        await page.screenshot({ path: '/tmp/s3.png' });
        console.log('\n🎉 COMPLETE FLOW TEST PASSED!\n');
      } else {
        console.log('❌ Screen 3 navigation failed');
      }
    } else {
      console.log('❌ Screen 2 navigation failed');
      console.log('Console errors:');
      const logs = await page.evaluate(() => window.lastErrors || 'None');
      console.log(logs);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

testFlow();
