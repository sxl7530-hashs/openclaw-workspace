#!/usr/bin/env node
/**
 * Playwright 自动化发布到国内平台
 * 支持：开源中国、博客园、简书、SegmentFault
 * 优势：不需要 API，直接模拟浏览器操作
 */

const fs = require('fs');
const path = require('path');

// 平台配置
const PLATFORMS = [
  {
    id: 'segmentfault',
    name: 'SegmentFault',
    enabled: true,
    profileDir: '~/.openclaw/segmentfault-profile',
    publishUrl: 'https://segmentfault.com/write',
    steps: [
      { action: 'goto', url: 'https://segmentfault.com/write' },
      { action: 'fill', selector: 'input[placeholder*="标题"]', field: 'title' },
      { action: 'fill', selector: '.CodeMirror', field: 'content', type: 'codemirror' },
      { action: 'click', selector: 'button:has-text("发布文章")' }
    ]
  },
  {
    id: 'oschina',
    name: '开源中国',
    enabled: true,
    profileDir: '~/.openclaw/oschina-profile',
    publishUrl: 'https://www.oschina.net/blog/write',
    steps: [
      { action: 'goto', url: 'https://www.oschina.net/blog/write' },
      { action: 'fill', selector: 'input[placeholder*="标题"]', field: 'title' },
      { action: 'fill', selector: 'textarea', field: 'content' },
      { action: 'click', selector: 'button:has-text("发布")' }
    ]
  },
  {
    id: 'cnblogs',
    name: '博客园',
    enabled: true,
    profileDir: '~/.openclaw/cnblogs-profile',
    publishUrl: 'https://i.cnblogs.com/EditPosts.aspx?opt=1',
    steps: [
      { action: 'goto', url: 'https://i.cnblogs.com/EditPosts.aspx?opt=1' },
      { action: 'fill', selector: '#Editor_Edit_txbTitle', field: 'title' },
      { action: 'fill', selector: '#Editor_Edit_EditorBody', field: 'content' },
      { action: 'click', selector: '#Editor_Edit_lkbPost' }
    ]
  }
];

function getArticles() {
  const articlesDir = path.join(__dirname, '../../../articles');
  return fs.readdirSync(articlesDir)
    .filter(f => f.endsWith('.md'))
    .slice(0, 5) // 先测试 5 篇
    .map(f => {
      const filePath = path.join(articlesDir, f);
      const content = fs.readFileSync(filePath, 'utf-8');
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : f.replace('.md', '');
      return { file: f, title, content };
    });
}

function diversifyTitle(title, platformId) {
  const prefixes = {
    segmentfault: '【实战】',
    oschina: '【深度】',
    cnblogs: '【教程】',
    jianshu: '【避坑】'
  };
  return `${prefixes[platformId] || ''}${title}`;
}

// 生成 browser 工具调用的 JSON
function generateBrowserCommands(platform, article) {
  const commands = [];
  
  // 1. 打开发布页
  commands.push({
    tool: 'browser',
    action: 'open',
    profile: platform.id,
    url: platform.publishUrl,
    target: 'host'
  });
  
  // 2. 等待页面加载
  commands.push({
    tool: 'browser',
    action: 'act',
    profile: platform.id,
    request: { kind: 'wait', timeMs: 2000 }
  });
  
  // 3. 执行发布步骤
  platform.steps.forEach(step => {
    if (step.action === 'fill') {
      const value = step.field === 'title' 
        ? diversifyTitle(article.title, platform.id)
        : article.content;
      
      commands.push({
        tool: 'browser',
        action: 'act',
        profile: platform.id,
        request: {
          kind: 'fill',
          selector: step.selector,
          text: value
        }
      });
    } else if (step.action === 'click') {
      commands.push({
        tool: 'browser',
        action: 'act',
        profile: platform.id,
        request: {
          kind: 'click',
          selector: step.selector
        }
      });
    }
  });
  
  return commands;
}

function main() {
  console.log('🚀 生成批量发布命令\n');
  
  const articles = getArticles();
  const enabledPlatforms = PLATFORMS.filter(p => p.enabled);
  
  console.log(`将发布 ${articles.length} 篇文章到 ${enabledPlatforms.length} 个平台\n`);
  
  const allCommands = [];
  
  articles.forEach(article => {
    enabledPlatforms.forEach(platform => {
      const commands = generateBrowserCommands(platform, article);
      allCommands.push({
        article: article.file,
        platform: platform.name,
        commands
      });
    });
  });
  
  // 保存到文件
  const outputPath = path.join(__dirname, '../../../batch_publish_plan.json');
  fs.writeFileSync(outputPath, JSON.stringify(allCommands, null, 2));
  
  console.log(`✓ 发布计划已生成: ${outputPath}`);
  console.log(`\n下一步：`);
  console.log(`1. 先手动登录各平台（用 browser 工具打开并登录）`);
  console.log(`2. 运行发布脚本执行自动化`);
  console.log(`\n或者直接告诉银子"执行批量发布"，我会自动完成`);
}

main();
