import * as path from 'path'
import { runTests } from '@vscode/test-electron'

async function main() {
  try {
    // 下载并解压 VSCode
    const extensionDevelopmentPath = path.resolve(__dirname, '../')
    const extensionTestsPath = path.resolve(__dirname, './specs')

    // 运行测试
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        '--disable-extensions', // 禁用其他扩展，避免干扰
        '--disable-gpu' // 在 CI 环境中禁用 GPU
      ]
    })
  } catch (err) {
    console.error('Failed to run tests:', err)
    process.exit(1)
  }
}

main()