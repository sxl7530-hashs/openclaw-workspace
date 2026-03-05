---
name: content-monitor
description: 监控热点话题（V2EX/HackerNews/36kr），自动生成选题建议。适用场景：每日早晚运营前，获取最新热点；发现大模型/API相关话题。NOT for：历史话题查询、非技术内容。
---

# Content Monitor Skill

监控技术社区热点，生成每日选题建议。

## 监控源

1. **V2EX** - 国内开发者社区
   - API: https://www.v2ex.com/api/topics/hot.json
   - 关注：AI、大模型、API、Claude、GPT、Gemini

2. **Hacker News** - 国际技术社区
   - API: https://hacker-news.firebaseio.com/v0/topstories.json
   - 关注：AI、LLM、API、Anthropic、OpenAI

3. **36氪** - 科技媒体
   - 用 Firecrawl 抓取: https://36kr.com/newsflashes
   - 关注：大模型融资、产品发布、人事变动

## 使用方式

```bash
node skills/content-monitor/monitor.js
```

输出格式：
```json
{
  "date": "2026-03-05",
  "hotTopics": [
    {
      "source": "v2ex",
      "title": "Claude 4.5 发布",
      "url": "https://...",
      "score": 156,
      "reason": "包含关键词 Claude，热度高"
    }
  ],
  "suggestions": [
    {
      "title": "Claude 4.5 实测：性价比如何？",
      "angle": "性能测评 + 价格对比",
      "platforms": ["知乎", "掘金", "CSDN"],
      "priority": "high"
    }
  ]
}
```

## 关键词过滤

**必须包含（任一）：**
- AI, 大模型, LLM, GPT, Claude, Gemini, API
- 人工智能, 机器学习, 深度学习
- OpenAI, Anthropic, Google, 阿里, 百度

**排除：**
- 招聘, 求职, 内推
- 八卦, 娱乐, 游戏（非AI相关）

## 选题生成规则

1. **热度判断**
   - V2EX: 回复数 > 50 或点击数 > 1000
   - HN: score > 100
   - 36氪: 快讯类优先

2. **角度建议**
   - 新产品发布 → 实测评测 + 接入教程
   - 价格变动 → 成本对比 + 省钱方案
   - 人事变动 → 行业分析 + 技术路线
   - 技术突破 → 原理解读 + 应用场景

3. **平台匹配**
   - 深度分析 → 知乎
   - 代码教程 → 掘金、CSDN
   - 快速体验 → 小红书
   - 故事感 → 公众号

## 定时任务

建议每日运行 2 次：
- 早上 7:00 - 为早间发布准备选题
- 晚上 18:00 - 为晚间发布准备选题

cron 配置：
```
0 7,18 * * * cd ~/.openclaw/workspace && node skills/content-monitor/monitor.js >> logs/monitor.log 2>&1
```

## 输出位置

- 选题建议：`memory/hot-topics-today.md`
- 原始数据：`memory/raw-topics-YYYY-MM-DD.json`
