#!/usr/bin/env node
/**
 * GitHub 仓库矩阵自动创建 + 发布脚本
 * 用途：批量创建技术示例仓库，每个 README 带完整域名外链
 */

const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'YOUR_GITHUB_TOKEN_HERE';
const GITHUB_USER = 'sxl7530-hashs';

// 仓库模板配置
const REPOS = [
  {
    name: 'xingjiabiapi-python-examples',
    description: 'Python examples for Claude/GPT/Gemini API via xingjiabiapi.org',
    language: 'Python',
    code: `import anthropic

client = anthropic.Anthropic(
    api_key="sk-YOUR_KEY",
    base_url="https://xingjiabiapi.org/v1"
)

message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}]
)
print(message.content[0].text)`
  },
  {
    name: 'xingjiabiapi-nodejs-examples',
    description: 'Node.js examples for Claude/GPT/Gemini API via xingjiabiapi.org',
    language: 'JavaScript',
    code: `import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: 'sk-YOUR_KEY',
  baseURL: 'https://xingjiabiapi.org/v1'
});

const message = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello' }]
});
console.log(message.content[0].text);`
  },
  {
    name: 'xingjiabiapi-langchain-demo',
    description: 'LangChain integration with xingjiabiapi.org API relay',
    language: 'Python',
    code: `from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(
    model="claude-opus-4-6",
    api_key="sk-YOUR_KEY",
    base_url="https://xingjiabiapi.org/v1"
)

response = llm.invoke("Hello")
print(response.content)`
  }
];

function githubRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'xingjiabiapi-bot',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body || '{}'));
        } else {
          reject(new Error(`GitHub API error: ${res.statusCode} ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function generateREADME(repo) {
  return `# ${repo.name}

${repo.description}

## 🚀 Quick Start

\`\`\`${repo.language.toLowerCase()}
${repo.code}
\`\`\`

## 📦 Installation

${repo.language === 'Python' ? '```bash\npip install anthropic\n```' : '```bash\nnpm install @anthropic-ai/sdk\n```'}

## 🔑 Get API Key

Visit [xingjiabiapi.org](https://xingjiabiapi.org) to get your API key.

**Price Comparison:**
- Official Claude Opus 4.6: $15/M input, $75/M output
- xingjiabiapi.org: ¥31.50/M input, ¥157.50/M output (48% cheaper)

## 📞 Contact

- Website: https://xingjiabiapi.org
- WeChat: malimalihongbebe
- Email: xingjiabiapi@163.com

## 📄 License

MIT
`;
}

async function createRepo(repo) {
  console.log(`Creating repo: ${repo.name}...`);
  
  // 1. 创建仓库
  const repoData = await githubRequest('POST', '/user/repos', {
    name: repo.name,
    description: repo.description,
    private: false,
    auto_init: false
  });
  
  console.log(`✓ Repo created: ${repoData.html_url}`);
  
  // 2. 创建 README.md
  const readme = generateREADME(repo);
  const readmeBase64 = Buffer.from(readme).toString('base64');
  
  await githubRequest('PUT', `/repos/${GITHUB_USER}/${repo.name}/contents/README.md`, {
    message: 'Initial commit: Add README',
    content: readmeBase64
  });
  
  console.log(`✓ README.md created`);
  
  return repoData.html_url;
}

async function main() {
  console.log('🚀 Starting GitHub repo matrix creation...\n');
  
  const results = [];
  
  for (const repo of REPOS) {
    try {
      const url = await createRepo(repo);
      results.push({ name: repo.name, url, status: 'success' });
      console.log('');
    } catch (error) {
      console.error(`✗ Failed to create ${repo.name}: ${error.message}\n`);
      results.push({ name: repo.name, status: 'failed', error: error.message });
    }
  }
  
  console.log('\n📊 Summary:');
  results.forEach(r => {
    if (r.status === 'success') {
      console.log(`✓ ${r.name}: ${r.url}`);
    } else {
      console.log(`✗ ${r.name}: ${r.error}`);
    }
  });
}

main().catch(console.error);
