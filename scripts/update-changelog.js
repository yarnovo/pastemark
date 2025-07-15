#!/usr/bin/env node

/**
 * 自动更新 CHANGELOG.md 文件
 * 在 npm version 命令后执行，将 [Unreleased] 替换为新版本号和日期
 */

const fs = require('fs');
const path = require('path');

// 获取当前日期（格式：YYYY-MM-DD）
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 读取 package.json 获取版本号
function getVersion() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  return packageData.version;
}

// 更新 CHANGELOG.md
function updateChangelog() {
  const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
  
  // 读取当前的 CHANGELOG 内容
  let content = fs.readFileSync(changelogPath, 'utf8');
  
  // 获取版本号和日期
  const version = getVersion();
  const date = getCurrentDate();
  
  // 查找 [Unreleased] 部分
  const unreleasedPattern = /## \[Unreleased\]\s*\n/;
  
  if (content.match(unreleasedPattern)) {
    // 在 [Unreleased] 下面插入新版本
    const newVersionHeader = `## [Unreleased]\n\n## [${version}] - ${date}\n\n`;
    content = content.replace(unreleasedPattern, newVersionHeader);
    
    // 写回文件
    fs.writeFileSync(changelogPath, content, 'utf8');
    console.log(`✅ CHANGELOG.md 已更新: [${version}] - ${date}`);
  } else {
    console.warn('⚠️  未找到 [Unreleased] 部分，跳过更新');
  }
}

// 主函数
function main() {
  try {
    updateChangelog();
  } catch (error) {
    console.error('❌ 更新 CHANGELOG 失败:', error.message);
    process.exit(1);
  }
}

// 执行
main();