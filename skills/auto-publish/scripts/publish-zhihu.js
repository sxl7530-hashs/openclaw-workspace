const { chromium } = require('/Users/sxl/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs = require('fs');
const { execSync } = require('child_process');

async function publishZhihu(mdFile) {
  const content = fs.readFileSync(mdFile, 'utf-8');
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : '未命名文章';
  
  // md→html
  const htmlContent = execSync(`node ${__dirname}/md2html.js "${mdFile}"`, { encoding: 'utf-8' });
  
  const ctx = await chromium.launchPersistentContext(
    process.env.HOME + '/.openclaw/zhihu-profile',
    { headless: true }
  );
  const page = await ctx.newPage();
  await page.goto('https://www.zhihu.com', { waitUntil: 'domcontentloaded' });
  
  const cookies = await ctx.cookies('https://www.zhihu.com');
  const xsrf = cookies.find(c => c.name === '_xsrf')?.value;
  
  // 创建草稿
  const draft = await page.evaluate(async (args) => {
    const r = await fetch('https://zhuanlan.zhihu.com/api/articles/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-xsrftoken': args.xsrf },
      credentials: 'include',
      body: JSON.stringify({ title: args.title, content: args.html })
    });
    return r.json();
  }, { title, html: htmlContent, xsrf });
  
  if (!draft.id) {
    console.error('❌ 创建草稿失败:', draft);
    await ctx.close();
    return;
  }
  
  const articleId = draft.id;
  console.log('✅ 知乎草稿已创建:', articleId);
  
  // 发布
  await page.evaluate(async (args) => {
    return fetch('https://zhuanlan.zhihu.com/api/articles/' + args.id + '/publish', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-xsrftoken': args.xsrf },
      credentials: 'include',
      body: JSON.stringify({ title: args.title, content: args.html })
    }).then(r => r.json());
  }, { id: articleId, title, html: htmlContent, xsrf });
  
  console.log('✅ 知乎文章已发布: https://zhuanlan.zhihu.com/p/' + articleId);
  await ctx.close();
}

if (require.main === module) {
  publishZhihu(process.argv[2]).catch(console.error);
}

module.exports = publishZhihu;
