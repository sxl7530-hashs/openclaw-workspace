# 大模型 API 是什么？5 分钟入门指南

最近"大模型 API"这个词很火，但很多人不知道它到底是什么，和我们平时用的 ChatGPT 网页版有什么区别。

今天用最简单的方式，帮你搞懂大模型 API 的核心概念。

## 什么是 API？

API（Application Programming Interface）是应用程序接口，简单理解就是：**让程序和程序之间对话的桥梁**。

举个例子：
- 你在网页上用 ChatGPT → 这是给人用的
- 你的程序调用 ChatGPT API → 这是给程序用的

## 大模型 API 能做什么？

**核心能力**：
- 文本生成（写文章、写代码、翻译）
- 对话问答（客服机器人、智能助手）
- 文档分析（读 PDF、总结长文）
- 图片理解（识别图片内容、OCR）

**实际应用场景**：
- 电商客服：自动回答用户问题
- 内容创作：批量生成文章、视频脚本
- 数据分析：自动提取表格数据、生成报告
- 教育辅导：个性化答疑、作业批改

## 怎么调用大模型 API？

以 Claude 为例，只需要几行代码：

**Python 示例**：

```python
import anthropic

client = anthropic.Anthropic(
    api_key="你的密钥"
)

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "解释一下什么是 API"}
    ]
)

print(response.content)
```

**Node.js 示例**：

```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: '你的密钥',
});

const message = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: '解释一下什么是 API' }
  ],
});

console.log(message.content);
```

## 主流大模型 API 对比

| 模型 | 优势 | 适合场景 |
|------|------|---------|
| Claude | 长文本理解强、代码能力好 | 文档分析、代码辅助 |
| GPT | 生态成熟、插件多 | 通用任务、对话 |
| Gemini | 多模态能力强、价格便宜 | 图片理解、成本敏感 |

## 成本怎么算？

大模型 API 按 token 计费，1 token ≈ 0.75 个汉字。

**实际例子**：
- 写一篇 3000 字文章：约 4000 tokens
- Claude Opus 成本：约 $0.3
- Gemini Flash 成本：约 $0.01

**省钱方法**：
1. 选择合适的模型（不是所有任务都需要最强模型）
2. 优化 prompt（减少无效输出）
3. 使用缓存（相同问题不重复调用）

## 国内怎么用？

**官方 API 的问题**：
- 需要国外信用卡
- 需要国外手机号
- 国内访问不稳定

**解决方案**：
使用 API 中转服务，代码示例：

```python
client = anthropic.Anthropic(
    base_url="https://xingjiabiapi.org/v1",
    api_key="中转站密钥"
)
```

只需要修改 `base_url`，其他代码完全不变。

## 常见问题

**Q: 需要什么技术基础？**
A: 会 Python 或 JavaScript 基础即可，官方 SDK 封装得很好，几行代码就能跑通。

**Q: 和网页版有什么区别？**
A: 网页版是给人用的，API 是给程序用的。API 可以批量处理、自动化、集成到自己的应用里。

**Q: 安全吗？**
A: 官方 API 通过 HTTPS 加密传输，数据不会被存储。选择大平台的中转服务更安全。

**Q: 有免费额度吗？**
A: 大部分官方 API 没有免费额度，按量计费。部分中转服务有新用户赠送额度。

## 入门建议

1. **先用网页版熟悉**：了解模型的能力和限制
2. **从简单任务开始**：比如文本生成、问答
3. **学会优化 prompt**：好的提示词能提升效果、降低成本
4. **关注成本**：开发时用便宜模型，生产环境再升级

## 总结

大模型 API 是让程序调用 AI 能力的接口，适合：
- 需要批量处理的场景
- 需要集成到自己产品的开发者
- 需要自动化的任务

入门门槛不高，会基础编程就能用。国内开发者可以通过 API 中转服务解决访问和支付问题。

---

**参考资源**：
- Anthropic 官方文档：https://docs.anthropic.com
- OpenAI 官方文档：https://platform.openai.com/docs
- Google AI 文档：https://ai.google.dev/docs
