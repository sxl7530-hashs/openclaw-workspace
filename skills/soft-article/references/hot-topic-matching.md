# 热点匹配算法

## 核心原则

**自动从 hot-topics-today.md 找出最适合当前主题的热点，提升文章打开率和传播度。**

---

## 匹配逻辑

### 1. 关键词提取

从文章主题中提取核心关键词：

**技术类关键词**：
- 模型名：Claude, GPT, Gemini, Llama, Qwen
- 技术词：API, RAG, Agent, Fine-tune, Prompt
- 场景词：客服, 翻译, 代码, 写作, 分析

**成本类关键词**：
- 省钱, 降本, 成本, 价格, 便宜, 优惠
- 对比, 选择, 推荐

**问题类关键词**：
- 怎么用, 如何, 教程, 入门, 指南
- 避坑, 踩坑, 问题, 解决

### 2. 热点分类

从 hot-topics-today.md 中提取热点，按类型分类：

**A 类（强相关）**：
- 直接提到文章主题的模型/技术
- 例：文章写 Claude → 热点提到 Claude 新版本

**B 类（间接相关）**：
- 提到同类技术或竞品
- 例：文章写 Claude → 热点提到 GPT 降价

**C 类（场景相关）**：
- 提到相同应用场景
- 例：文章写 API 接入 → 热点提到某公司用 AI 做客服

**D 类（行业相关）**：
- AI 行业大事件
- 例：融资、收购、政策

### 3. 匹配评分

每个热点计算匹配分数（0-100）：

```
匹配分数 = 关键词重叠度 × 50 + 时效性 × 30 + 热度 × 20

- 关键词重叠度：热点和主题共同关键词数量
- 时效性：热点发布时间（今天 100 分，昨天 80 分，3 天前 50 分）
- 热度：热点的点赞/评论/浏览数（归一化到 0-100）
```

### 4. 选择策略

- 优先选择 A 类热点（强相关）
- 如果没有 A 类，选择 B 类（间接相关）
- 如果 B 类也没有，选择 C 类（场景相关）
- 最后才选 D 类（行业相关）

---

## 实现代码

```javascript
// 从 hot-topics-today.md 提取热点
function parseHotTopics(mdContent) {
  const topics = [];
  const lines = mdContent.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('- [')) {
      const match = line.match(/\[(.+?)\]\((.+?)\)\s*—\s*(.+)/);
      if (match) {
        topics.push({
          title: match[1],
          url: match[2],
          summary: match[3],
          keywords: extractKeywords(match[1] + ' ' + match[3])
        });
      }
    }
  }
  
  return topics;
}

// 提取关键词
function extractKeywords(text) {
  const techKeywords = ['Claude', 'GPT', 'Gemini', 'API', 'RAG', 'Agent', 'AI'];
  const costKeywords = ['省钱', '降本', '成本', '价格', '便宜'];
  const problemKeywords = ['怎么用', '如何', '教程', '避坑', '踩坑'];
  
  const allKeywords = [...techKeywords, ...costKeywords, ...problemKeywords];
  const found = [];
  
  for (const keyword of allKeywords) {
    if (text.includes(keyword)) {
      found.push(keyword);
    }
  }
  
  return found;
}

// 计算匹配分数
function calculateScore(topic, articleKeywords) {
  // 关键词重叠度
  const overlap = topic.keywords.filter(k => articleKeywords.includes(k)).length;
  const overlapScore = Math.min(overlap * 25, 50); // 最多 50 分
  
  // 时效性（假设热点都是今天的，给满分）
  const timeScore = 30;
  
  // 热度（简化处理，给固定分）
  const heatScore = 20;
  
  return overlapScore + timeScore + heatScore;
}

// 匹配最佳热点
function matchBestTopic(articleTheme, hotTopicsContent) {
  const articleKeywords = extractKeywords(articleTheme);
  const topics = parseHotTopics(hotTopicsContent);
  
  // 计算每个热点的分数
  const scored = topics.map(topic => ({
    ...topic,
    score: calculateScore(topic, articleKeywords)
  }));
  
  // 按分数排序
  scored.sort((a, b) => b.score - a.score);
  
  // 返回前 3 个
  return scored.slice(0, 3);
}
```

---

## 使用示例

### 输入
```
文章主题：Claude API 成本优化
hot-topics-today.md 内容：
- [Claude Opus 4.6 发布](xxx) — 新版本性能提升 30%
- [GPT-5 降价 50%](xxx) — OpenAI 宣布大幅降价
- [某公司用 AI 做客服节省 80% 成本](xxx) — 实际案例分享
- [Meta 开源 Llama 4](xxx) — 免费可商用
```

### 输出
```
推荐热点（按匹配度排序）：
1. Claude Opus 4.6 发布（匹配分 85）— 强相关，直接提到 Claude
2. GPT-5 降价 50%（匹配分 65）— 间接相关，同类技术+成本话题
3. 某公司用 AI 做客服节省 80% 成本（匹配分 55）— 场景相关，成本优化案例
```

### 文章开头示例
```
最近 Claude Opus 4.6 发布，性能提升 30%，但价格也涨了。很多开发者在问：怎么在用上新版本的同时，还能控制成本？

今天分享 3 个实用方法，帮你降低 70% 的 API 开销。
```

---

## 平台差异化

### 掘金/CSDN（技术向）
- 优先选择技术类热点（新模型、新功能）
- 开头：技术背景 + 热点引入

### 知乎（观点向）
- 优先选择争议类热点（降价、对比）
- 开头：热点 + 个人观点

### 头条（科普向）
- 优先选择行业类热点（融资、政策）
- 开头：热点 + 科普解释

### 小红书（体验向）
- 优先选择场景类热点（实际案例）
- 开头：热点 + 个人体验

---

## 检查清单

匹配后自查：
- [ ] 热点和主题有明确关联（不是硬蹭）
- [ ] 热点在 3 天内（不是过时新闻）
- [ ] 开头自然过渡到主题（不突兀）
- [ ] 热点只在开头提，不贯穿全文
- [ ] 如果没有合适热点，不强行蹭
