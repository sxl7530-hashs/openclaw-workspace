const { chromium } = require('/Users/sxl/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs = require('fs');

async function publishCSDNUI(htmlFile) {
  const html = fs.readFileSync(htmlFile, 'utf-8');
  const titleMatch = html.match(/<h1[^>]*>(.+?)<\/h1>/);
  const title = titleMatch ? titleMatch[1] : '未命名文章';
  const summary = html.replace(/<[^>]+>/g, '').slice(0, 100);

  const ctx = await chromium.launchPersistentContext(
    process.env.HOME + '/.openclaw/playwright-profile',
    { headless: false, args: ['--no-sandbox'] }
  );
  const page = await ctx.newPage();
  await page.goto('https://mp.csdn.net/mp_blog/creation/editor', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  await page.fill('textarea[placeholder*="文章标题"]', title);
  await page.waitForTimeout(1000);
  
  await page.evaluate((htmlContent) => {
    const editor = Object.values(CKEDITOR.instances)[0];
    if (editor) editor.setData(htmlContent);
  }, html);
  await page.waitForTimeout(2000);

  await page.fill('textarea[placeholder*="摘要"]', summary);
  await page.waitForTimeout(1000);
  
  console.log('✅ CSDN 内容已填充，等待手动点击发布或自动发布');
  
  try {
    await page.click('button:has-text("发布博客")');
    await page.waitForTimeout(3000);
    console.log('✅ 已点击发布按钮');
  } catch (e) {
    console.log('⚠️ 未找到发布按钮，请手动点击');
  }
  
  await page.waitForTimeout(30000);
  await ctx.close();
}

if (require.main === module) {
  publishCSDNUI(process.argv[2]).catch(console.error);
}

module.exports = publishCSDNUI;
