#!/usr/bin/env node
/**
 * 自动在已发布文章里补充 GitHub 仓库引用
 * 用途：给 CSDN/掘金文章末尾加"完整代码见 GitHub"段落
 */

const fs = require('fs');
const path = require('path');

const GITHUB_REPOS = [
  'https://github.com/sxl7530-hashs/xingjiabiapi-python-examples',
  'https://github.com/sxl7530-hashs/xingjiabiapi-nodejs-examples',
  'https://github.com/sxl7530-hashs/xingjiabiapi-langchain-demo'
];

// 生成引用段落
function generateGitHubSection() {
  return `

## 📦 完整代码示例

本文涉及的所有代码已开源到 GitHub，可直接运行：

- **Python 示例**：[xingjiabiapi-python-examples](${GITHUB_REPOS[0]})
- **Node.js 示例**：[xingjiabiapi-nodejs-examples](${GITHUB_REPOS[1]})
- **LangChain 集成**：[xingjiabiapi-langchain-demo](${GITHUB_REPOS[2]})

每个仓库都包含完整的安装步骤、API 调用代码、价格对比表，复制粘贴即可使用。

---

**推广信息**：
- 网站：https://xingjiabiapi.org
- 微信：malimalihongbebe
- 商务邮箱：xingjiabiapi@163.com
`;
}

// 读取文章目录，找到所有 markdown 文件
function findArticles() {
  const articlesDir = path.join(__dirname, '../../../articles');
  if (!fs.existsSync(articlesDir)) return [];
  
  return fs.readdirSync(articlesDir)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(articlesDir, f));
}

// 给文章末尾追加 GitHub 引用
function addGitHubRef(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 检查是否已经有 GitHub 引用
  if (content.includes('xingjiabiapi-python-examples')) {
    console.log(`⊘ ${path.basename(filePath)} already has GitHub refs`);
    return false;
  }
  
  // 追加到文末
  content += generateGitHubSection();
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✓ ${path.basename(filePath)} updated`);
  return true;
}

function main() {
  console.log('🚀 Adding GitHub refs to articles...\n');
  
  const articles = findArticles();
  if (articles.length === 0) {
    console.log('No articles found in articles/ directory');
    return;
  }
  
  let updated = 0;
  articles.forEach(file => {
    if (addGitHubRef(file)) updated++;
  });
  
  console.log(`\n📊 Summary: ${updated}/${articles.length} articles updated`);
}

main();
