import * as path from 'path'
import { runTests } from '@vscode/test-electron'

/**
 * PasteMark E2E 测试运行器
 * 
 * 基于用户行为的端到端测试，包含以下场景：
 * - 新手用户：基础功能测试
 * - 高级用户：Ollama 智能命名测试
 * - 开发者：技术文档编写测试
 * - 边界情况：错误处理和性能测试
 */
async function main() {
  try {
    console.log('🚀 启动 PasteMark E2E 测试...')
    
    const extensionDevelopmentPath = path.resolve(__dirname, '../../')
    const extensionTestsPath = path.resolve(__dirname, './scenarios')

    console.log('📁 扩展开发路径:', extensionDevelopmentPath)
    console.log('📁 测试路径:', extensionTestsPath)

    // 运行用户场景测试
    await runScenarioTests(extensionDevelopmentPath, extensionTestsPath)
    
    console.log('✅ 所有 E2E 测试完成！')
  } catch (err) {
    console.error('❌ E2E 测试失败:', err)
    process.exit(1)
  }
}

/**
 * 运行用户场景测试
 */
async function runScenarioTests(extensionDevelopmentPath: string, extensionTestsPath: string) {
  try {
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        '--disable-extensions',  // 禁用其他扩展，避免干扰
        '--disable-gpu',         // 在 CI 环境中禁用 GPU
        '--no-sandbox',          // 某些环境需要
        '--disable-dev-shm-usage' // 减少内存使用
      ]
    })
    
    console.log(`✅ 所有场景测试通过`)
  } catch (error) {
    console.error(`❌ 场景测试失败:`, error)
    throw error
  }
}

/**
 * 检查测试环境
 */
async function checkEnvironment() {
  console.log('🔍 检查测试环境...')
  
  // 检查 Node.js 版本
  const nodeVersion = process.version
  console.log('Node.js 版本:', nodeVersion)
  
  // 检查操作系统
  const os = process.platform
  console.log('操作系统:', os)
  
  // 检查扩展文件
  const extensionPath = path.resolve(__dirname, '../../package.json')
  const fs = require('fs')
  
  if (!fs.existsSync(extensionPath)) {
    throw new Error('找不到扩展的 package.json 文件')
  }
  
  console.log('✅ 测试环境检查完成')
}

// 运行前检查环境
checkEnvironment()
  .then(() => main())
  .catch(err => {
    console.error('❌ 环境检查失败:', err)
    process.exit(1)
  })