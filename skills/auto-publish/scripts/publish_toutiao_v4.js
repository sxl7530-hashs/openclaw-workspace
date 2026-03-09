const { chromium } = require('playwright');
const fs = require('fs');
const { marked } = require('marked');

async function publishToutiao() {
  const mdPath = process.argv[2];
  if (!mdPath) {
    console.error('❌ 请提供文章路径');
    process.exit(1);
  }

  const md = fs.readFileSync(mdPath, 'utf8');
  const lines = md.split('\n');
  const title = lines[0].replace(/^#\s*/, '');
  const contentMd = lines.slice(1).join('\n').trim();
  
  // 转换 Markdown 为 HTML
  const contentHtml = marked(contentMd);

  console.log('📝 标题:', title);
  console.log('📄 内容长度:', contentHtml.length);

  const ctx = await chromium.launchPersistentContext(
    process.env.HOME + '/.openclaw/toutiao-profile',
    { headless: false }
  );
  const page = await ctx.newPage();

  console.log('🔄 打开创作中心...');
  await page.goto('https://mp.toutiao.com/profile_v4/graphic/publish');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // 关闭AI助手抽屉
  console.log('🔍 关闭AI助手...');
  const drawerMask = page.locator('.byte-drawer-mask');
  if (await drawerMask.count() > 0) {
    await drawerMask.click();
    await page.waitForTimeout(500);
  }

  // 填写标题
  console.log('✍️  填写标题...');
  const titleInput = page.locator('.editor-title textarea');
  await titleInput.fill(title);
  await page.waitForTimeout(1000);

  // 填写正文（HTML）
  console.log('📝 填写正文...');
  await page.evaluate((html) => {
    const editor = document.querySelector('.ProseMirror[contenteditable="true"]');
    if (editor) {
      editor.innerHTML = html;
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, contentHtml);
  
  await page.waitForTimeout(1000);

  // 选择"无封面" - 用 Playwright locator 点击 label
  console.log('🖼️  选择"无封面"...');
  const noCoverLabel = page.locator('label.byte-radio').filter({ has: page.locator('input[value="1"]') });
  await noCoverLabel.click();
  await page.waitForTimeout(1000);
  console.log('✅ 已选择"无封面"');

  // 点击"预览并发布"
  console.log('🚀 点击"预览并发布"...');
  const publishBtn = page.locator('button:has-text("预览并发布")');
  await publishBtn.click();
  await page.waitForTimeout(3000);

  // 点击"确认发布"
  console.log('✅ 点击"确认发布"...');
  const confirmBtn = page.locator('button:has-text("确认发布")');
  await confirmBtn.click();
  await page.waitForTimeout(3000);

  console.log('✅ 发布完成！');
  console.log('💡 浏览器保持打开，请检查发布结果');
}

publishToutiao().catch(console.error);
