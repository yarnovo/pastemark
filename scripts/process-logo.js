#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * 处理 logo 图片：读取根目录的 logo.png，调整大小并输出到 images/logo.png
 */
async function processLogo() {
  const inputPath = path.join(__dirname, '..', 'logo.png');
  const outputDir = path.join(__dirname, '..', 'images');
  const outputPath = path.join(outputDir, 'logo.png');

  try {
    // 检查输入文件是否存在
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ 找不到源文件：${inputPath}`);
      console.error('请确保在项目根目录放置 logo.png 文件');
      process.exit(1);
    }

    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 创建目录：${outputDir}`);
    }

    // 获取原始图片信息
    const metadata = await sharp(inputPath).metadata();
    const originalSize = fs.statSync(inputPath).size;
    
    console.log('📋 原始图片信息：');
    console.log(`📐 尺寸：${metadata.width}x${metadata.height}`);
    console.log(`🎨 格式：${metadata.format}`);
    console.log(`💾 大小：${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`🌈 通道：${metadata.channels} (${metadata.hasAlpha ? '有透明通道' : '无透明通道'})`);

    // 检查是否需要处理
    if (metadata.width === 256 && metadata.height === 256 && originalSize < 200 * 1024) {
      console.log('\n✅ 图片已符合规格，直接复制...');
      fs.copyFileSync(inputPath, outputPath);
    } else {
      console.log('\n🔄 正在处理图片...');
      
      // 调整大小并压缩
      await sharp(inputPath)
        .resize(256, 256, {
          fit: 'contain', // 保持宽高比
          background: { r: 0, g: 0, b: 0, alpha: 0 } // 透明背景
        })
        .png({
          compressionLevel: 9, // 最高压缩级别
          adaptiveFiltering: true,
          palette: true, // 使用调色板优化
          quality: 95, // PNG 质量
          effort: 10 // 最大压缩努力
        })
        .toFile(outputPath);
    }

    // 显示处理结果
    const newMetadata = await sharp(outputPath).metadata();
    const newSize = fs.statSync(outputPath).size;
    
    console.log('\n✅ 处理完成！');
    console.log('📋 新图片信息：');
    console.log(`📐 尺寸：${newMetadata.width}x${newMetadata.height}`);
    console.log(`💾 大小：${(newSize / 1024).toFixed(2)} KB`);
    console.log(`📍 位置：${outputPath}`);
    
    if (originalSize > newSize) {
      console.log(`📉 压缩率：${((1 - newSize / originalSize) * 100).toFixed(1)}%`);
    }

    // 规格检查
    console.log('\n🔍 规格检查：');
    if (newMetadata.width === 256 && newMetadata.height === 256) {
      console.log('✅ 尺寸符合要求（256x256）');
    }
    if (newSize < 200 * 1024) {
      console.log('✅ 文件大小符合要求（< 200KB）');
    } else {
      console.log('⚠️  文件大小超过推荐值（200KB）');
    }

    // 清理提示
    console.log('\n💡 提示：处理完成后可以删除根目录的 logo.png 文件');

  } catch (error) {
    console.error('❌ 处理图片时出错：', error.message);
    
    // 如果是缺少 sharp 模块
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('\n请先安装 sharp 模块：');
      console.error('npm install --save-dev sharp');
    }
    
    process.exit(1);
  }
}

// 运行处理
processLogo();