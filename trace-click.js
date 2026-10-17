const puppeteer = require('./backend/node_modules/puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('request', r => console.log('REQ:', r.method(), r.url(), r.postData() || ''));
  page.on('response', r => console.log('RES:', r.status(), r.url()));

  await page.goto('http://127.0.0.1:5173/');
  await new Promise(r => setTimeout(r, 1000));

  console.log('Focusing input...');
  const titleInput = await page.$('#task-title');
  await titleInput.click();
  await page.keyboard.type('Implement JWT Authentication and Refresh Token Rotation', { delay: 10 });

  console.log('Finding button...');
  const btn = await page.$('.btn-ai');
  console.log('Btn found, disabled =', await btn.evaluate(b => b.disabled));
  await btn.click();
  console.log('Clicked btn!');

  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 500));
    const btnText = await btn.evaluate(b => b.innerText);
    const desc = await page.evaluate(() => document.querySelector('#task-description')?.value);
    const disclaimer = await page.evaluate(() => !!document.querySelector('.ai-disclaimer-box'));
    console.log(`[t=${(i+1)*500}ms] btnText: "${btnText}", descLen: ${desc?.length}, disclaimer: ${disclaimer}`);
    if (disclaimer) break;
  }

  await browser.close();
})();
