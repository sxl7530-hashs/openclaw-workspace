#!/usr/bin/env node
/**
 * md2html.js - Markdown to HTML converter for CSDN/知乎
 * Usage: node md2html.js <input.md>
 */

const fs = require('fs');

function md2html(md) {
  // Normalize line endings
  let text = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Step 1: Extract code blocks FIRST (line-by-line to avoid regex issues)
  const codeBlocks = [];
  const lines = text.split('\n');
  const processed = [];
  let inCode = false;
  let codeLang = '';
  let codeLines = [];

  for (const line of lines) {
    if (!inCode && /^```(\w*)/.test(line)) {
      inCode = true;
      codeLang = line.match(/^```(\w*)/)[1] || '';
      codeLines = [];
    } else if (inCode && /^```\s*$/.test(line)) {
      inCode = false;
      const code = codeLines.join('\n');
      const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(`<pre><code class="language-${codeLang}">${escaped}</code></pre>`);
      processed.push(placeholder);
    } else if (inCode) {
      codeLines.push(line);
    } else {
      processed.push(line);
    }
  }

  let html = processed.join('\n');

  // Tables
  html = html.replace(/(\|.+\|\n)((?:\|[-: |]+\|\n))((?: *\|.+\|\n?)*)/g, (match, header, sep, body) => {
    const parseRow = (row) => row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
    const headers = parseRow(header).map(c => `<th>${c}</th>`).join('');
    const rows = body.trim().split('\n').filter(r => r.trim()).map(row => {
      const cells = parseRow(row).map(c => `<td>${c}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<table border="1" cellpadding="6" cellspacing="0"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>\n`;
  });

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold & italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Inline code (after code blocks)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Unordered lists
  html = html.replace(/((?:^[-*] .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(l => `<li>${l.replace(/^[-*] /, '')}</li>`).join('');
    return `<ul>${items}</ul>\n`;
  });

  // Ordered lists
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('');
    return `<ol>${items}</ol>\n`;
  });

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

  // Images
  html = html.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1">');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>');

  // Paragraphs
  const htmlLines = html.split('\n');
  const result = [];
  for (const line of htmlLines) {
    const trimmed = line.trim();
    if (!trimmed) { result.push(''); continue; }
    if (/^<(h[1-6]|ul|ol|li|pre|table|thead|tbody|tr|th|td|blockquote|hr|img)/.test(trimmed)) {
      result.push(line);
    } else {
      result.push(`<p>${trimmed}</p>`);
    }
  }

  let output = result.join('\n');

  // Restore code blocks
  for (let i = 0; i < codeBlocks.length; i++) {
    output = output.replace(`<p>__CODE_BLOCK_${i}__</p>`, codeBlocks[i]);
    output = output.replace(`__CODE_BLOCK_${i}__`, codeBlocks[i]);
  }

  return output;
}

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: node md2html.js <input.md>');
  process.exit(1);
}

const md = fs.readFileSync(inputFile, 'utf8');
const outputFile = process.argv[3];
const output = md2html(md);
if (outputFile) {
  fs.writeFileSync(outputFile, output);
  console.log('Written to', outputFile);
} else {
  console.log(output);
}
