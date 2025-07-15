const fs = require('fs')
const path = require('path')

/**
 * 复制资源文件到输出目录
 */
function copyResources() {
  const srcDir = path.join(__dirname, '..', 'src', 'resources')
  const outDir = path.join(__dirname, '..', 'out', 'resources')

  // 创建输出目录
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  // 要复制的资源文件
  const resources = [
    'windows-clipboard.ps1',
    'mac-clipboard.applescript',
    'linux-clipboard.sh'
  ]

  // 复制每个资源文件
  resources.forEach(file => {
    const srcPath = path.join(srcDir, file)
    const destPath = path.join(outDir, file)
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath)
      console.log(`Copied: ${file}`)
      
      // 保持 Linux 脚本的执行权限
      if (file.endsWith('.sh')) {
        fs.chmodSync(destPath, '755')
      }
    } else {
      console.warn(`Resource not found: ${srcPath}`)
    }
  })

  console.log('Resource files copied successfully')
}

// 执行复制
copyResources()