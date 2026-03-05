const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const htmlFile = process.argv[2];
  if (!htmlFile) {
    console.error('Usage: node publish-csdn.js <html-file>');
    process.exit(1);
  }

  const html = fs.readFileSync(htmlFile, 'utf-8');
  const titleMatch = html.match(/<h1[^>]*>(.+?)<\/h1>/);
  const title = titleMatch ? titleMatch[1] : '未命名文章';

  const browser = await chromium.launchPersistentContext(
    `${process.env.HOME}/.openclaw/playwright-profile`,
    { headless: false }
  );
  const page = await browser.newPage();
  
  await page.goto('https://mp.csdn.net/mp_blog/creation/editor');
  await page.waitForTimeout(3000);
  
  await page.locator('textarea[placeholder*="文章标题"]').fill(title);
  await page.evaluate((htmlContent) => {
    CKEDITOR.instances.editor.setData(htmlContent);
  }, html);
  
  console.log('✅ CSDN文章已填充，请手动点击发布');
  await page.waitForTimeout(60000);
  await browser.close();
})();
