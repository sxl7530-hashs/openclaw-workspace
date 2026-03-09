# 今日头条发布

## ⚠️ 铁律（必须遵守）

1. **营销感必须弱**（之前因营销感太强被封）
2. **科普向 > 推广向**（重点是知识分享，不是产品宣传）
3. **标题党慎用**（头条反标题党很严格）
4. **每天最多 1 篇**
5. **必须选择"无封面"**（选单图/三图但不上传会导致发布失败）

## 内容规范（避免违规）

### 绝对不能出现
- ❌ 微信号
- ❌ 邮箱
- ❌ 多次重复的网站链接
- ❌ "最强""必看""震惊"等标题党词汇
- ❌ 成本对比只夸自家产品

### 必须做到
- ✅ 标题科普向："Claude API 是什么？""大模型 API 怎么用？"
- ✅ 内容 80% 是科普知识（什么是 API、怎么调用、常见问题）
- ✅ 产品只在代码示例里自然出现
- ✅ 多角度对比（官方 + 多家中转站）

### 推广方式
- 代码里的 `base_url` 用 xingjiabiapi.org（唯一植入点）
- 文末可以带"更多资源"，但不能直接放联系方式
- 个人主页放联系方式

## 发布方式

头条创作中心：https://mp.toutiao.com/profile_v4/graphic/publish

### Profile 路径
```
~/.openclaw/toutiao-profile
```

### 发布脚本
```bash
node skills/auto-publish/scripts/publish_toutiao_v4.js articles/xxx.md
```

**完整流程**：
1. 用 `marked` 转换 Markdown → HTML
2. 关闭 AI 助手抽屉（`.byte-drawer-mask`）
3. 填写标题（`.editor-title textarea`）
4. 填写正文（`.ProseMirror[contenteditable="true"]`，直接设置 innerHTML）
5. 选择"无封面"（点击 `label.byte-radio` 包含 `input[value="1"]`）
6. 点击"预览并发布"（`button:has-text("预览并发布")`）
7. 点击"确认发布"（`button:has-text("确认发布")`）

## 注意事项
- 头条审核较严，发布后可能需要等待审核
- 避免敏感词（翻墙、VPN、代理等）
- 图片必须本地上传，不能用外链
- 代码块用 `<pre><code>` 标签
- 正文必须按段落分割，保留格式（用 `\n\n` 分段）
