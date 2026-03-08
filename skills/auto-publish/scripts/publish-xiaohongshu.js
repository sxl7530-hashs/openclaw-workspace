const { chromium } = require('/Users/sxl/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs = require('fs');

async function publishXiaohongshu(mdFile, imagePaths = []) {
  const content = fs.readFileSync(mdFile, 'utf-8');
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : '未命名';
  const text = content.replace(/^#.+$/m, '').replace(/[#*`]/g, '').trim();
  
  const ctx = await chromium.launchPersistentContext(
    process.env.HOME + '/.openclaw/playwright-profile',
    { headless: true }
  );
  const page = await ctx.newPage();
  await page.goto('https://creator.xiaohongshu.com/publish/publish', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // 切到"上传图文"tab
  await page.evaluate(() => {
    const tabs = document.querySelectorAll('.creator-tab');
    for (const tab of tabs) {
      if (tab.textContent.trim() === '上传图文' && !tab.classList.contains('active')) {
        tab.click(); break;
      }
    }
  });
  await page.waitForTimeout(2000);
  
  // 上传图片
  for (const imgPath of imagePaths) {
    const fi = await page.$('input[type=file][accept*=".jpg"]');
    if (fi) {
      await fi.setInputFiles(imgPath);
      await page.waitForTimeout(3000);
    }
  }
  
  // 填标题
  await page.waitForSelector('input[placeholder*="标题"]', { timeout: 5000 }).catch(() => null);
  const titleInput = await page.$('input[placeholder*="标题"]');
  if (titleInput) {
    await titleInput.fill(title);
    await page.waitForTimeout(500);
  }
  
  // 填正文
  await page.waitForSelector('.tiptap.ProseMirror', { timeout: 5000 }).catch(() => null);
  const editor = await page.$('.tiptap.ProseMirror');
  if (editor) {
    await editor.click();
    await page.evaluate((t) => {
      const el = document.querySelector('.tiptap.ProseMirror');
      if (el) {
        el.focus();
        document.execCommand('insertText', false, t);
      }
    }, text);
    await page.waitForTimeout(2000);
  }
  
  // 发布
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent.trim() === '发布')?.click();
  });
  await page.waitForTimeout(8000);
  
  const url = page.url();
  if (url.includes('published=true')) {
    console.log('✅ 小红书已发布');
  } else {
    console.log('⚠️ 发布状态未知，当前 URL:', url);
  }
  
  await ctx.close();
}

if (require.main === module) {
  const mdFile = process.argv[2];
  const images = process.argv.slice(3);
  publishXiaohongshu(mdFile, images).catch(console.error);
}

module.exports = publishXiaohongshu;
