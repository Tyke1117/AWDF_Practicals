const puppeteer = require('./backend/node_modules/puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.goto('http://127.0.0.1:5173/');
  await new Promise(r => setTimeout(r, 1000));

  const input = await page.$('#task-title');
  await input.focus();
  await page.keyboard.type('Implement JWT Authentication and Refresh Token Rotation', { delay: 5 });
  await new Promise(r => setTimeout(r, 300));

  console.log('Clicking .btn-ai...');
  await page.click('.btn-ai');

  await new Promise(r => setTimeout(r, 2000));

  const desc = await page.evaluate(() => document.querySelector('#task-description')?.value);
  const disclaimerExists = await page.evaluate(() => Boolean(document.querySelector('.ai-disclaimer-box')));

  console.log('Description in DOM:', desc);
  console.log('Disclaimer exists:', disclaimerExists);

  await browser.close();
})();
