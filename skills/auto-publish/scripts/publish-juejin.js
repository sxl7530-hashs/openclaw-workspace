const { chromium } = require('/Users/sxl/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs = require('fs');

async function publishJuejin(mdFile) {
  const content = fs.readFileSync(mdFile, 'utf-8');
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : '未命名文章';
  const brief = content.replace(/[#*`]/g, '').slice(0, 100);
  
  const ctx = await chromium.launchPersistentContext(
    process.env.HOME + '/.openclaw/playwright-profile',
    { headless: true }
  );
  const page = await ctx.newPage();
  await page.goto('https://juejin.cn', { waitUntil: 'domcontentloaded' });
  
  // 创建草稿
  const draft = await page.evaluate(async (args) => {
    const r = await fetch('https://api.juejin.cn/content_api/v1/article_draft/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: args.title,
        mark_content: args.content,
        brief_content: args.brief,
        category_id: '6809637769959178254',
        tag_ids: ['6809640398105870343']
      })
    });
    return r.json();
  }, { title, content, brief });
  
  if (!draft.data || !draft.data.id) {
    console.error('❌ 创建草稿失败:', draft);
    await ctx.close();
    return;
  }
  
  const draftId = draft.data.id;
  console.log('✅ 掘金草稿已创建:', draftId);
  
  // 发布
  const pub = await page.evaluate(async (args) => {
    const r = await fetch('https://api.juejin.cn/content_api/v1/article/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        draft_id: args.draftId,
        brief_content: args.brief,
        category_id: '6809637769959178254',
        tag_ids: ['6809640398105870343']
      })
    });
    return r.json();
  }, { draftId, brief });
  
  if (pub.data && pub.data.article_id) {
    console.log('✅ 掘金文章已发布: https://juejin.cn/post/' + pub.data.article_id);
  } else {
    console.error('❌ 发布失败:', pub);
  }
  
  await ctx.close();
}

if (require.main === module) {
  publishJuejin(process.argv[2]).catch(console.error);
}

module.exports = publishJuejin;
