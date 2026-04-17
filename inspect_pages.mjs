import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('📱 Loading home page...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    // Get all inputs
    const inputs = await page.$$eval('input', inputs => {
      return inputs.map(inp => ({
        type: inp.type,
        name: inp.name,
        id: inp.id,
        placeholder: inp.placeholder,
        class: inp.className
      }));
    });
    
    console.log('📋 Inputs on home page:');
    console.log(JSON.stringify(inputs, null, 2));
    
    // Get all buttons
    const buttons = await page.$$eval('button', btns => {
      return btns.map(btn => ({
        text: btn.textContent.trim(),
        class: btn.className
      }));
    });
    
    console.log('\n🔘 Buttons on home page:');
    console.log(JSON.stringify(buttons, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
