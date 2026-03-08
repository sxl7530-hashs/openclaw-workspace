const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const article = fs.readFileSync('articles/juejin_claude_code_api_20260308.md', 'utf-8');
  const titleMatch = article.match(/^#+\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Claude Code API 选择指南';
  
  const browser = await chromium.launchPersistentContext(
    process.env.HOME + '/.openclaw/playwright-profile',
    { headless: false }
  );
  
  const page = await browser.newPage();
  await page.goto('https://juejin.cn/editor/drafts/new');
  await page.waitForTimeout(3000);
  
  // 填标题
  await page.fill('input[placeholder*="输入文章标题"]', title);
  
  // 填内容（Markdown 编辑器）
  await page.click('.CodeMirror');
  await page.keyboard.type(article);
  
  console.log('✓ 内容已填充，等待手动点击发布');
  await page.waitForTimeout(60000);
  
  await browser.close();
})();
