const fs = require('fs');
const path = require('path');

// 查找所有使用 assets/ 相对路径的图片标签
function findMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// 修复图片路径
function fixImagePaths(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // 匹配 <img src="assets/..."> 并替换为注释
  const imgPattern = /<img\s+src="assets\/[^"]+"[^>]*>/g;
  const matches = content.match(imgPattern);
  
  if (matches && matches.length > 0) {
    console.log(`\n处理文件: ${filePath}`);
    console.log(`发现 ${matches.length} 个无效图片引用:`);
    
    matches.forEach(match => {
      console.log(`  - ${match.substring(0, 80)}...`);
      // 提取 alt 文本
      const altMatch = match.match(/alt="([^"]*)"/);
      const altText = altMatch ? altMatch[1] : '图片';
      // 替换为 TODO 注释
      const replacement = `<!-- TODO: 添加${altText} -->`;
      content = content.replace(match, replacement);
      modified = true;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✓ 已修复`);
    }
  }
  
  return modified;
}

// 主函数
function main() {
  const docsDir = path.join(__dirname, 'docs');
  console.log('开始扫描 docs 目录...\n');
  
  const markdownFiles = findMarkdownFiles(docsDir);
  console.log(`找到 ${markdownFiles.length} 个 Markdown 文件\n`);
  
  let fixedCount = 0;
  markdownFiles.forEach(file => {
    if (fixImagePaths(file)) {
      fixedCount++;
    }
  });
  
  console.log(`\n========== 修复完成 ==========`);
  console.log(`共修复 ${fixedCount} 个文件`);
  console.log('请手动添加缺失的图片文件,或删除TODO注释');
}

main();
