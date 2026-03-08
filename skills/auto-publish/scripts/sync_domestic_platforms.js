#!/usr/bin/env node
/**
 * 批量同步文章到国内技术平台
 * 支持：开源中国(OSCHINA)、博客园(cnblogs)、简书(jianshu)、51CTO
 */

const fs = require('fs');
const path = require('path');

// 平台配置（需要先手动注册账号并获取 token/cookie）
const PLATFORMS = {
  oschina: {
    name: '开源中国',
    enabled: false, // 需要先注册账号
    apiUrl: 'https://www.oschina.net/action/api/blog_api',
    // 注册后在浏览器 DevTools 获取 cookie
    cookie: ''
  },
  cnblogs: {
    name: '博客园',
    enabled: false,
    apiUrl: 'https://i.cnblogs.com/api/posts',
    // 需要在博客园后台申请 MetaWeblog API
    username: '',
    password: ''
  },
  jianshu: {
    name: '简书',
    enabled: false,
    // 简书没有公开 API，需要用 Playwright 自动化
    loginUrl: 'https://www.jianshu.com/sign_in'
  },
  cto51: {
    name: '51CTO',
    enabled: false,
    apiUrl: 'https://blog.51cto.com/api/blog/save',
    cookie: ''
  }
};

// 读取所有文章
function getArticles() {
  const articlesDir = path.join(__dirname, '../../../articles');
  return fs.readdirSync(articlesDir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const filePath = path.join(articlesDir, f);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // 提取标题（第一个 # 开头的行）
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : f.replace('.md', '');
      
      return { file: f, path: filePath, title, content };
    });
}

// 标题去重策略（避免被判定为重复内容）
function diversifyTitle(title, platform) {
  const prefixes = {
    oschina: '【实战】',
    cnblogs: '【深度】',
    jianshu: '【避坑】',
    cto51: '【教程】'
  };
  
  return `${prefixes[platform] || ''}${title}`;
}

// 发布到开源中国
async function publishToOSChina(article) {
  if (!PLATFORMS.oschina.enabled) {
    console.log(`⊘ 开源中国未启用（需要先注册账号并配置 cookie）`);
    return false;
  }
  
  // TODO: 实现 OSCHINA API 调用
  console.log(`→ 开源中国: ${article.title}`);
  return true;
}

// 发布到博客园（MetaWeblog API）
async function publishToCnblogs(article) {
  if (!PLATFORMS.cnblogs.enabled) {
    console.log(`⊘ 博客园未启用（需要先申请 MetaWeblog API）`);
    return false;
  }
  
  // TODO: 实现 MetaWeblog XML-RPC 调用
  console.log(`→ 博客园: ${article.title}`);
  return true;
}

// 生成配置指南
function printSetupGuide() {
  console.log(`
📋 平台配置指南

1. 开源中国 (OSCHINA)
   - 注册：https://www.oschina.net/home/reg
   - 登录后打开 DevTools → Application → Cookies
   - 复制 cookie 填入脚本 PLATFORMS.oschina.cookie

2. 博客园 (cnblogs)
   - 注册：https://account.cnblogs.com/signup
   - 开通博客后，进入"设置" → "MetaWeblog 访问地址"
   - 复制用户名和密码填入脚本

3. 简书 (jianshu)
   - 注册：https://www.jianshu.com/sign_up
   - 需要用 Playwright 自动化发布（暂不支持 API）

4. 51CTO
   - 注册：https://blog.51cto.com/register
   - 登录后打开 DevTools 获取 cookie

配置完成后，将对应平台的 enabled 改为 true
`);
}

async function main() {
  console.log('🚀 批量同步文章到国内平台\n');
  
  // 检查是否有启用的平台
  const enabledPlatforms = Object.entries(PLATFORMS)
    .filter(([_, config]) => config.enabled);
  
  if (enabledPlatforms.length === 0) {
    printSetupGuide();
    return;
  }
  
  const articles = getArticles();
  console.log(`找到 ${articles.length} 篇文章\n`);
  
  const results = [];
  
  for (const article of articles) {
    console.log(`\n📝 ${article.title}`);
    
    for (const [platform, config] of enabledPlatforms) {
      try {
        const newTitle = diversifyTitle(article.title, platform);
        const success = await publishToPlatform(platform, { ...article, title: newTitle });
        results.push({ article: article.file, platform: config.name, success });
      } catch (error) {
        console.error(`✗ ${config.name} 失败: ${error.message}`);
        results.push({ article: article.file, platform: config.name, success: false });
      }
    }
  }
  
  // 统计
  console.log('\n\n📊 发布统计:');
  const summary = {};
  results.forEach(r => {
    if (!summary[r.platform]) summary[r.platform] = { success: 0, failed: 0 };
    r.success ? summary[r.platform].success++ : summary[r.platform].failed++;
  });
  
  Object.entries(summary).forEach(([platform, stats]) => {
    console.log(`${platform}: ${stats.success} 成功, ${stats.failed} 失败`);
  });
}

async function publishToPlatform(platform, article) {
  switch (platform) {
    case 'oschina': return publishToOSChina(article);
    case 'cnblogs': return publishToCnblogs(article);
    default: return false;
  }
}

main().catch(console.error);
