const { chromium } = require('/Users/sxl/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs = require('fs');
const { execSync } = require('child_process');

async function publishWechat(mdFile, imagePaths = []) {
  const content = fs.readFileSync(mdFile, 'utf-8');
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : '未命名';
  const brief = content.replace(/[#*`]/g, '').slice(0, 100);
  
  const htmlContent = execSync(`node ${__dirname}/md2html.js "${mdFile}"`, { encoding: 'utf-8' });
  
  const ctx = await chromium.launchPersistentContext(
    process.env.HOME + '/.openclaw/wechat-mp-profile',
    { headless: false, viewport: { width: 1400, height: 900 } }
  );
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
  
  const page = await ctx.newPage();
  await page.goto('https://mp.weixin.qq.com/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // 点"新的创作"
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('div'))
      .find(e => e.textContent.trim() === '新的创作' && e.className.includes('global'))?.click();
  });
  await page.waitForTimeout(2000);
  
  // 点"文章"
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('.new-creation__menu-item'))
      .find(e => e.textContent.trim() === '文章')?.click();
  });
  await page.waitForTimeout(5000);
  
  let ep = page;
  for (const p of ctx.pages()) {
    if (p.url().includes('appmsg')) { ep = p; break; }
  }
  
  // 填标题
  const titleArea = await ep.$('textarea.js_title');
  if (titleArea) {
    await titleArea.click();
    await titleArea.fill(title);
  }
  
  // 粘贴富文本
  await ep.evaluate(async (h) => {
    const editor = document.querySelector('.ProseMirror');
    if (editor) {
      editor.focus();
      const htmlBlob = new Blob([h], { type: 'text/html' });
      const textBlob = new Blob([h.replace(/<[^>]+>/g, '')], { type: 'text/plain' });
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': htmlBlob, 'text/plain': textBlob
      })]);
    }
  }, htmlContent);
  await ep.keyboard.down('Meta');
  await ep.keyboard.press('v');
  await ep.keyboard.up('Meta');
  await ep.waitForTimeout(800);
  
  // 粘贴图片
  for (const imgPath of imagePaths) {
    if (fs.existsSync(imgPath)) {
      const imgBuf = fs.readFileSync(imgPath);
      await ep.evaluate(async (imgArr) => {
        const blob = new Blob([new Uint8Array(imgArr)], { type: 'image/jpeg' });
        const file = new File([blob], 'image.jpeg', { type: 'image/jpeg' });
        const dt = new DataTransfer();
        dt.items.add(file);
        const editor = document.querySelector('.ProseMirror');
        if (editor) {
          editor.focus();
          editor.dispatchEvent(new ClipboardEvent('paste', {
            bubbles: true, cancelable: true, clipboardData: dt
          }));
        }
      }, Array.from(imgBuf));
      await ep.waitForTimeout(4000);
    }
  }
  
  // 填摘要
  const descArea = await ep.$('textarea.js_desc');
  if (descArea) {
    await descArea.click();
    await descArea.fill(brief);
  }
  
  // 保存草稿
  await ep.keyboard.down('Meta');
  await ep.keyboard.press('s');
  await ep.keyboard.up('Meta');
  await ep.waitForTimeout(5000);
  
  console.log('✅ 微信公众号草稿已保存');
  await ctx.close();
}

if (require.main === module) {
  const mdFile = process.argv[2];
  const images = process.argv.slice(3);
  publishWechat(mdFile, images).catch(console.error);
}

module.exports = publishWechat;
