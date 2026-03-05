#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// 从 memory 里读取最近的竞品监控和热点数据
const memoryDir = path.join(__dirname, '../../memory');

function readLatestTopics() {
  const files = fs.readdirSync(memoryDir)
    .filter(f => f.startsWith('competitors-') || f.startsWith('hot-topics-'))
    .sort()
    .reverse();
  
  const topics = [];
  
  for (const file of files.slice(0, 3)) {
    const content = fs.readFileSync(path.join(memoryDir, file), 'utf-8');
    
    // 提取标题和关键信息
    const lines = content.split('\n');
    lines.forEach(line => {
      if (line.startsWith('##') || line.startsWith('-')) {
        const text = line.replace(/^[#-\s]+/, '');
        if (text.length > 10 && (
          text.includes('GPT') || text.includes('Claude') || 
          text.includes('Gemini') || text.includes('API') ||
          text.includes('发布') || text.includes('降价')
        )) {
          topics.push({
            title: text.substring(0, 100),
            source: file,
            date: file.match(/\d{4}-\d{2}-\d{2}/)?.[0] || 'recent'
          });
        }
      }
    });
  }
  
  return topics.slice(0, 10);
}

function generateSuggestions(topics) {
  const suggestions = [];
  const today = new Date().toISOString().split('T')[0];
  
  topics.forEach(t => {
    const title = t.title;
    
    if (title.includes('GPT-5') || title.includes('gpt-5')) {
      suggestions.push({
        title: 'GPT-5.3 Instant 实测：对话优化版值得升级吗？',
        angle: '性能对比 + 使用场景 + 价格分析',
        platforms: ['知乎', '掘金'],
        priority: 'high'
      });
    }
    
    if (title.includes('Gemini') && title.includes('Flash')) {
      suggestions.push({
        title: 'Gemini Flash 系列全对比：Lite/Standard/Pro 怎么选？',
        angle: '性能测试 + 成本计算 + 场景推荐',
        platforms: ['CSDN', '掘金'],
        priority: 'high'
      });
    }
    
    if (title.includes('降价') || title.includes('促销')) {
      suggestions.push({
        title: '大模型 API 价格战升级，开发者如何省钱？',
        angle: '价格对比 + 中转站方案 + 成本优化',
        platforms: ['知乎', '公众号'],
        priority: 'medium'
      });
    }
  });
  
  return [...new Set(suggestions.map(s => JSON.stringify(s)))].map(s => JSON.parse(s)).slice(0, 3);
}

const topics = readLatestTopics();
const suggestions = generateSuggestions(topics);

const md = `# 今日选题建议 (${new Date().toISOString().split('T')[0]})

## 📊 近期热点

${topics.slice(0, 5).map((t, i) => `${i + 1}. ${t.title} (${t.date})`).join('\n')}

## 💡 推荐选题

${suggestions.map((s, i) => `### ${i + 1}. ${s.title}
- **角度**: ${s.angle}
- **平台**: ${s.platforms.join('、')}
- **优先级**: ${s.priority}
`).join('\n')}

---
*数据来源: memory/ 目录下的竞品监控和热点记录*
*手动更新: 发现新热点时更新 memory/hot-topics-today.md*
`;

fs.writeFileSync(path.join(memoryDir, 'hot-topics-today.md'), md);
console.log('✅ 选题建议已生成: memory/hot-topics-today.md');
console.log(`📊 分析了 ${topics.length} 个话题`);
console.log(`💡 生成了 ${suggestions.length} 个选题`);
