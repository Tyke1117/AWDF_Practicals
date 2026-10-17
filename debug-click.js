const puppeteer = require('./backend/node_modules/puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  page.on('response', res => console.log('HTTP RESP:', res.status(), res.url()));

  await page.goto('http://127.0.0.1:5173/');
  await new Promise(r => setTimeout(r, 1000));

  await page.type('#task-title', 'Implement JWT Authentication and Refresh Token Rotation');
  const btn = await page.$('.btn-ai');
  if (btn) await btn.click();

  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
