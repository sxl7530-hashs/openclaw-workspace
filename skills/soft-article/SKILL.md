---
name: soft-article
description: >
  撰写高质量技术营销软文，专注大模型API/AI领域。适用场景：用户要求写软文、推广文章、种草文、技术博客、产品评测、平台投稿。
  支持用户提供主题、图片素材、链接/文档作为输入。输出SEO+GEO优化、去AI痕迹、蹭热点的专业软文。
  NOT for: 纯技术文档、代码教程、新闻稿。
---

# 软文写作 Skill

## 核心原则

1. **去AI感**：禁用"值得一提的是""总而言之""在当今时代"等AI套话。用口语化表达、个人经历、具体数字替代
2. **去营销感**：不直接推销，用"我踩坑后发现""对比测试结果"等第一人称体验带出产品
3. **蹭热点**：开头必须关联最近的科技热点（新模型发布、融资、技术突破），用 web_search 查最新动态
4. **信息密度**：每段必须有新信息，删掉所有"正确的废话"

## 写作流程

### 1. 素材收集

**优先用 Firecrawl（比 web_fetch 更干净）：**

```js
// MCP tool: mcp__firecrawl__firecrawl_scrape
// API Key: fc-0821beeff0b548ab8fe50e90e2f79b30（已配置在 openclaw.json）
{
  url: "目标URL",
  formats: ["markdown"],
  onlyMainContent: true
}
```

- **热门话题抓取**（每次写文前必做）：
  - 抓 V2EX 热榜：`https://www.v2ex.com/?tab=hot`
  - 抓少数派热门：`https://sspai.com/`
  - 抓 36kr AI 频道：`https://36kr.com/information/AI/`
  - 抓 HackerNews 首页：`https://news.ycombinator.com/`
  - 从中找与 AI/大模型/API 相关的热点，作为文章开头的蹭热点素材
- 用户提供主题 → web_search 查最新热点（过去7天）→ Firecrawl 抓取热点页面正文
- 用户提供链接 → Firecrawl scrape 抓取内容提炼要点（比 web_fetch 更干净）
- 竞品文章分析 → Firecrawl 抓取竞品文章，分析写法和角度
- xingjiabiapi.org 最新价格 → Firecrawl 抓取价格页，确保文章数据准确
- 用户提供图片 → image 工具分析内容，融入文章

### 2. 热点匹配（自动）

详见 [references/hot-topic-matching.md](references/hot-topic-matching.md)：

- 从 memory/hot-topics-today.md 自动提取热点
- 根据文章主题关键词计算匹配分数
- 推荐前 3 个最相关热点
- 生成自然的开头引入

### 3. 标题生成（多平台）

详见 [references/title-generator.md](references/title-generator.md)：

- 根据目标平台生成 3 个候选标题
- 掘金：技术深度型
- CSDN：教程步骤型
- 头条：科普价值型
- 知乎：观点深度型
- 小红书：体验感型
- 公众号：故事感型

### 4. 平台差异化写作

详见 [references/platform-writing.md](references/platform-writing.md)：

- 同一主题写 3 篇不同文章（不是改改标题）
- 掘金：70% 代码 + 30% 文字
- CSDN：步骤编号 + 截图
- 头条：80% 科普 + 20% 产品
- 知乎：个人经历 + 数据支撑
- 小红书：300-500 字 + emoji
- 公众号：故事线 + 场景描述

### 5. 产品隐性植入

详见 [references/subtle-promotion.md](references/subtle-promotion.md)：

- 10 种隐性植入方式（教程式、对比式、踩坑式等）
- 平台适配（头条最隐蔽，小红书完全不提）
- 检查清单（去掉产品名文章还有 80% 价值）

### 6. 选择框架

根据目标选框架，详见 [references/frameworks.md](references/frameworks.md)：

- 转化注册/付费 → AIDA
- 种草/安利 → PAS
- 讲故事/经历 → BAB
- 产品介绍 → 4P

### 7. SEO/GEO 优化

详见 [references/seo-geo.md](references/seo-geo.md)：

- 标题含核心关键词，长尾词自然分布
- 结构化小标题（H2/H3）覆盖搜索意图
- 首段200字内出现主关键词2-3次
- 加入FAQ段落，命中AI搜索引用
- 引用权威数据源，提升GEO可信度

### 8. 去AI痕迹检查

写完后自查：
- 删除所有"值得注意的是""总的来说""不可否认"
- 加入1-2个口语化表达或吐槽
- 加入具体数字/日期/版本号
- 确保有个人视角和主观判断
- 段落长短交替，避免机械节奏

## 输出格式

- 默认 Markdown
- 用户指定平台时，按平台格式输出
- 图片素材用 `![描述](图片路径)` 标记插入位置
- **文末自动添加 GitHub 代码仓库引用**（小红书除外）
- 文末标注：目标关键词、适配平台、字数

## GitHub 仓库引用模板

每篇文章末尾自动添加（小红书除外）：

```markdown

## 📦 完整代码示例

本文涉及的所有代码已开源到 GitHub，可直接运行：

- **Python 示例**：[xingjiabiapi-python-examples](https://github.com/sxl7530-hashs/xingjiabiapi-python-examples)
- **Node.js 示例**：[xingjiabiapi-nodejs-examples](https://github.com/sxl7530-hashs/xingjiabiapi-nodejs-examples)
- **LangChain 集成**：[xingjiabiapi-langchain-demo](https://github.com/sxl7530-hashs/xingjiabiapi-langchain-demo)

每个仓库都包含完整的安装步骤、API 调用代码、价格对比表，复制粘贴即可使用。

---

**推广信息**：
- 网站：https://xingjiabiapi.org
- 微信：malimalihongbebe
- 商务邮箱：xingjiabiapi@163.com
```
