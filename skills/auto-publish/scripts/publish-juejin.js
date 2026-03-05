const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const mdFile = process.argv[2];
  if (!mdFile) {
    console.error('Usage: node publish-juejin.js <markdown-file>');
    process.exit(1);
  }

  const content = fs.readFileSync(mdFile, 'utf-8');
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : '未命名文章';

  const browser = await chromium.launchPersistentContext(
    `${process.env.HOME}/.openclaw/playwright-profile`,
    { headless: false }
  );
  const page = await browser.newPage();
  
  await page.goto('https://juejin.cn/editor/drafts/new');
  await page.waitForTimeout(3000);
  
  await page.locator('input[placeholder*="输入文章标题"]').fill(title);
  await page.locator('.CodeMirror').click();
  await page.keyboard.type(content);
  
  console.log('✅ 掘金文章已填充，请手动点击发布');
  await page.waitForTimeout(60000);
  await browser.close();
})();
