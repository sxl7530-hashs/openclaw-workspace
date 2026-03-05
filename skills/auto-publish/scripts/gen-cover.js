const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.XJB_API_KEY || 'sk-V6Hu3vXPNp3bJ8y1UJxVZf5A12FBS4e69j6hMBCYmmwdFCde';
const BASE_URL = 'xingjiabiapi.org';

const prompt = process.argv[2] || '生成一张技术博客封面图，尺寸比例3:4，风格：深蓝紫渐变背景，中央大字白色标题，副标题，字体粗体现代感，右下角小字emoji装饰，整体科技感强';
const model = process.argv[3] || 'gemini-3.1-flash-image-preview';

const payload = JSON.stringify({
  model: model,
  messages: [{ role: 'user', content: prompt }]
});

const options = {
  hostname: BASE_URL,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      
      if (json.error) {
        console.error('API Error:', json.error.message);
        if (model === 'gemini-3.1-flash-image-preview') {
          console.log('Retrying with gemini-3-pro-image-preview...');
          require('child_process').execSync(
            `node "${__filename}" "${prompt}" "gemini-3-pro-image-preview"`,
            { stdio: 'inherit' }
          );
        }
        return;
      }
      
      if (json.choices && json.choices[0]) {
        const msg = json.choices[0].message;
        
        // 检查 content_parts 里的图片
        if (msg.content_parts && msg.content_parts.length > 0) {
          for (const part of msg.content_parts) {
            if (part.image && part.image.data) {
              const imgBuffer = Buffer.from(part.image.data, 'base64');
              const outPath = path.join(__dirname, `cover-${Date.now()}.png`);
              fs.writeFileSync(outPath, imgBuffer);
              console.log('✅ Cover saved:', outPath);
              return;
            }
          }
        }
        
        // 兼容旧格式
        const content = msg.content;
        if (content) {
          const match = content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
          if (match) {
            const imgBuffer = Buffer.from(match[1], 'base64');
            const outPath = path.join(__dirname, `cover-${Date.now()}.jpg`);
            fs.writeFileSync(outPath, imgBuffer);
            console.log('✅ Cover saved:', outPath);
            return;
          }
        }
        
        console.log('⚠️ No image found in response');
      } else {
        console.log('⚠️ Unexpected response:', JSON.stringify(json).substring(0, 200));
      }
    } catch(e) {
      console.error('Parse error:', e.message);
    }
  });
});

req.on('error', e => console.error('Request error:', e.message));
req.write(payload);
req.end();
