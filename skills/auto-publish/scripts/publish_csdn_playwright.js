const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const article = fs.readFileSync('articles/csdn_claude_code_pitfalls_20260308.md', 'utf-8');
  const titleMatch = article.match(/^#+\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Claude Code 踩坑实录';
  
  const browser = await chromium.launchPersistentContext(
    process.env.HOME + '/.openclaw/playwright-profile',
    { headless: false }
  );
  
  const page = await browser.newPage();
  await page.goto('https://mp.csdn.net/mp_blog/creation/editor');
  await page.waitForTimeout(3000);
  
  // 填标题
  await page.fill('textarea[placeholder*="文章标题"]', title);
  
  // 填内容（CKEditor）
  await page.evaluate((content) => {
    if (window.CKEDITOR && window.CKEDITOR.instances.editor) {
      window.CKEDITOR.instances.editor.setData(content);
    }
  }, article);
  
  console.log('✓ CSDN 内容已填充，等待手动点击发布');
  await page.waitForTimeout(60000);
  
  await browser.close();
})();
