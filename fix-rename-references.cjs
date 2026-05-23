#!/usr/bin/env node

/**
 * 修复重命名后所有文件中的引用链接
 * 
 * 需要更新的链接:
 * /08-云原生与容器化/ -> /06-云原生与容器化/
 * /14-消息队列与异步/ -> /07-消息队列与异步/
 * /15-项目案例与复盘/ -> /08-项目案例与复盘/
 * /16-网络通信与协议/ -> /09-网络通信与协议/
 * /17-AI 与智能应用/ -> /10-AI 与智能应用/
 */

const fs = require('fs');
const path = require('path');

// 定义链接替换映射
const linkReplacements = [
  { old: '/08-云原生与容器化/', new: '/06-云原生与容器化/' },
  { old: '/14-消息队列与异步/', new: '/07-消息队列与异步/' },
  { old: '/15-项目案例与复盘/', new: '/08-项目案例与复盘/' },
  { old: '/16-网络通信与协议/', new: '/09-网络通信与协议/' },
  { old: '/17-AI 与智能应用/', new: '/10-AI 与智能应用/' }
];

const docsPath = path.join(__dirname, 'docs');

// 递归遍历目录
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 跳过 .vuepress 等隐藏目录
      if (!file.startsWith('.')) {
        walkDir(filePath, callback);
      }
    } else if (stat.isFile() && file.endsWith('.md')) {
      callback(filePath);
    }
  }
}

let updatedFiles = 0;
let totalReplacements = 0;

console.log('开始更新文件中的引用链接...\n');

walkDir(docsPath, (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fileReplacements = 0;
    
    // 执行所有替换
    for (const replacement of linkReplacements) {
      const regex = new RegExp(replacement.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, replacement.new);
        fileReplacements += matches.length;
      }
    }
    
    // 如果内容有变化，写回文件
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      updatedFiles++;
      totalReplacements += fileReplacements;
      console.log(`✓ ${path.relative(docsPath, filePath)} (${fileReplacements} 处更新)`);
    }
  } catch (error) {
    console.error(`✗ 处理文件失败: ${filePath}`);
    console.error(`  错误: ${error.message}`);
  }
});

console.log(`\n更新完成！`);
console.log(`共更新 ${updatedFiles} 个文件，${totalReplacements} 处链接`);
