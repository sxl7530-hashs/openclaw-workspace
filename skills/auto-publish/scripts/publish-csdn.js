const { chromium } = require('/Users/sxl/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs = require('fs');

async function publishCSDN(mdFile) {
  const content = fs.readFileSync(mdFile, 'utf-8');
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : '未命名文章';
  const brief = content.replace(/[#*`]/g, '').slice(0, 100);
  
  const ctx = await chromium.launchPersistentContext(
    process.env.HOME + '/.openclaw/playwright-profile',
    { headless: true, args: ['--no-sandbox'] }
  );
  const page = await ctx.newPage();
  
  await page.goto('https://editor.csdn.net/md/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  
  const fileId = 'Art' + Date.now().toString(36);
  
  // 写入 IndexedDB
  await page.evaluate(async (args) => {
    return new Promise((resolve) => {
      const req = indexedDB.open('stackedit-db');
      req.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction('objects', 'readwrite');
        const store = tx.objectStore('objects');
        
        store.put({
          id: args.fileId, type: 'file', name: args.title,
          parentId: null, hash: Date.now(),
          descr: args.brief,
          tags: 'AI,大模型',
          categories: '', articletype: 'original',
          articleid: '', articlestatus: '', tx: 1
        });
        
        store.put({
          id: args.fileId + '/content', type: 'content',
          text: args.content,
          properties: {}, discussions: {}, comments: {},
          hash: Date.now(), tx: 1
        });
        
        store.put({
          id: args.fileId + '/contentState', type: 'contentState',
          selectionStart: 0, selectionEnd: 0,
          scrollPosition: { sectionIdx: 0, posInSection: 0 },
          hash: Date.now(), tx: 1
        });
        
        store.put({
          id: args.fileId + '/syncedContent', type: 'syncedContent',
          historyData: {}, syncHistory: {}, v: 0,
          hash: Date.now(), tx: 1
        });
        
        const g = store.get('lastOpened');
        g.onsuccess = () => {
          const lo = g.result || { id: 'lastOpened', type: 'data', data: {}, hash: 0, tx: 0 };
          lo.data[args.fileId] = Date.now();
          store.put(lo);
        };
        tx.oncomplete = () => resolve('ok');
      };
    });
  }, { fileId, title, content, brief });
  
  console.log('✅ IndexedDB 已写入');
  
  // 刷新加载
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  
  // 触发自动保存
  const pre = await page.$('pre.editor__inner');
  await pre.click();
  await page.keyboard.press('End');
  await page.keyboard.type(' ');
  await page.waitForTimeout(500);
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(8000);
  
  console.log('✅ 自动保存完成');
  
  // 点发布
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent.includes('发布'))?.click();
  });
  await page.waitForTimeout(2000);
  
  // 移除遮罩并发布
  await page.evaluate(() => {
    document.querySelectorAll('.mark-mask-box-div').forEach(m => m.remove());
    Array.from(document.querySelectorAll('.modal__button-bar button'))
      .find(b => b.textContent.trim() === '发布文章')?.click();
  });
  await page.waitForTimeout(10000);
  
  const url = page.url();
  if (url.includes('/success/') || url.includes('/article/details/')) {
    console.log('✅ CSDN 文章已发布:', url);
  } else {
    console.log('⚠️ 发布状态未知，当前 URL:', url);
  }
  
  await ctx.close();
}

if (require.main === module) {
  publishCSDN(process.argv[2]).catch(console.error);
}

module.exports = publishCSDN;
