#!/usr/bin/env node
const fs = require('fs');

const article = fs.readFileSync('articles/juejin_gpt54_20260308.md', 'utf-8');
const titleMatch = article.match(/^#\s+(.+)$/m);
const title = titleMatch[1];

console.log(JSON.stringify({
  action: 'publish_juejin',
  title,
  content: article,
  profile: 'playwright-profile'
}));
