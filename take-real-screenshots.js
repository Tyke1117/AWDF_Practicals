const puppeteer = require('./backend/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, 'doc_assets');

async function capture() {
  console.log('Launching Chrome for real-time screenshots...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1280, height: 820, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    console.log('Navigating to http://localhost:5173/...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));

    // -------------------------------------------------------------
    // Screenshot 1: Full Browser Task Manager Dashboard (Page 7 img 1)
    // -------------------------------------------------------------
    console.log('Capturing Dashboard screenshot (page_7_img_1.jpeg)...');
    const p7_1_path = path.join(OUT_DIR, 'page_7_img_1.jpeg');
    await page.screenshot({ path: p7_1_path, type: 'jpeg', quality: 95 });
    console.log('Saved:', p7_1_path);

    // -------------------------------------------------------------
    // Screenshot 2: AI-Assisted Task Form with Suggestion (Page 7 img 2)
    // -------------------------------------------------------------
    console.log('Interacting with TaskForm: filling title and generating AI description...');
    await page.click('#task-title');
    await page.type('#task-title', 'Implement JWT Authentication and Refresh Token Rotation');
    await new Promise(r => setTimeout(r, 500));

    // Click "Generate Description with AI" button
    const btnAi = await page.$('.btn-ai');
    if (btnAi) {
      await btnAi.click();
      console.log('Clicked Generate AI button, waiting for generation...');
      // Wait for textarea to populate and disclaimer box to appear
      await page.waitForSelector('.ai-disclaimer-box', { timeout: 10000 });
      await new Promise(r => setTimeout(r, 800));
    }

    const formEl = await page.$('.task-form');
    if (formEl) {
      const p7_2_path = path.join(OUT_DIR, 'page_7_img_2.png');
      await formEl.screenshot({ path: p7_2_path });
      console.log('Saved:', p7_2_path);
    }

    // -------------------------------------------------------------
    // Screenshot 3: Interactive AI Assistant Studio Modal UI (Page 8 img 1)
    // -------------------------------------------------------------
    console.log('Opening AI Studio Modal via header pill...');
    const pill = await page.$('.ai-service-badge.clickable');
    if (pill) {
      await pill.click();
      await page.waitForSelector('.ai-studio-modal', { timeout: 5000 });
      await new Promise(r => setTimeout(r, 500));

      // Click "Generate AI Suggestion" in playground
      const runBtn = await page.$('.studio-run-btn');
      if (runBtn) {
        await runBtn.click();
        console.log('Triggered Studio playground generation...');
        await page.waitForSelector('.studio-result-card', { timeout: 10000 });
        await new Promise(r => setTimeout(r, 800));
      }

      const p8_1_path = path.join(OUT_DIR, 'page_8_img_1.jpeg');
      await page.screenshot({ path: p8_1_path, type: 'jpeg', quality: 95 });
      console.log('Saved:', p8_1_path);
    }

  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

capture();
