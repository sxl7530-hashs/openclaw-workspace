const { chromium } = require('/Users/sxl/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs = require('fs');

async function publishJuejinUI(mdFile) {
  const content = fs.readFileSync(mdFile, 'utf-8');
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : '未命名文章';
  
  const ctx = await chromium.launchPersistentContext(
    process.env.HOME + '/.openclaw/playwright-profile',
    { headless: false }
  );
  const page = await ctx.newPage();
  
  await page.goto('https://juejin.cn/editor/drafts/new');
  await page.waitForTimeout(3000);
  
  // 填标题
  await page.locator('input[placeholder*="输入文章标题"]').fill(title);
  await page.waitForTimeout(1000);
  
  // 填内容
  const editor = page.locator('.CodeMirror');
  await editor.click();
  await page.keyboard.type(content);
  
  console.log('✅ 内容已填充，等待手动点击发布或自动发布');
  await page.waitForTimeout(5000);
  
  // 尝试自动点击发布
  try {
    await page.click('button:has-text("发布")');
    await page.waitForTimeout(3000);
    console.log('✅ 已点击发布按钮');
  } catch (e) {
    console.log('⚠️ 未找到发布按钮，请手动点击');
  }
  
  await page.waitForTimeout(30000);
  await ctx.close();
}

if (require.main === module) {
  publishJuejinUI(process.argv[2]).catch(console.error);
}

module.exports = publishJuejinUI;
