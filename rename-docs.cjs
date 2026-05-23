#!/usr/bin/env node

/**
 * 重命名文档目录以修复编号不连续问题
 * 
 * 原编号 -> 新编号:
 * 01-Java语言核心 -> 01-Java语言核心 (不变)
 * 02-数据库与持久化 -> 02-数据库与持久化 (不变)
 * 03-Web与微服务框架 -> 03-Web与微服务框架 (不变)
 * 04-工程化与生产实践 -> 04-工程化与生产实践 (不变)
 * 05-分布式系统与架构 -> 05-分布式系统与架构 (不变)
 * 08-云原生与容器化 -> 06-云原生与容器化
 * 14-消息队列与异步 -> 07-消息队列与异步
 * 15-项目案例与复盘 -> 08-项目案例与复盘
 * 16-网络通信与协议 -> 09-网络通信与协议
 * 17-AI 与智能应用 -> 10-AI 与智能应用
 */

const fs = require('fs');
const path = require('path');

// 定义重命名映射
const renameMap = {
  '08-云原生与容器化': '06-云原生与容器化',
  '14-消息队列与异步': '07-消息队列与异步',
  '15-项目案例与复盘': '08-项目案例与复盘',
  '16-网络通信与协议': '09-网络通信与协议',
  '17-AI 与智能应用': '10-AI 与智能应用'
};

const docsPath = path.join(__dirname, 'docs');

console.log('开始重命名文档目录...\n');

// 执行重命名
for (const [oldName, newName] of Object.entries(renameMap)) {
  const oldPath = path.join(docsPath, oldName);
  const newPath = path.join(docsPath, newName);
  
  if (fs.existsSync(oldPath)) {
    try {
      fs.renameSync(oldPath, newPath);
      console.log(`✓ ${oldName} -> ${newName}`);
    } catch (error) {
      console.error(`✗ 重命名失败: ${oldName} -> ${newName}`);
      console.error(`  错误: ${error.message}`);
    }
  } else {
    console.log(`⚠ 目录不存在: ${oldName}`);
  }
}

console.log('\n重命名完成！');
console.log('\n下一步: 运行 fix-rename-references.cjs 更新所有文件中的引用链接');
