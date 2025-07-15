import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import { TestWorkspace, UserConfigs } from './fixtures'

/**
 * 测试环境管理
 */
export class TestEnvironment {
  private workspaceDir: string
  private createdFiles: string[] = []
  private originalConfigs: { [key: string]: any } = {}

  constructor() {
    this.workspaceDir = path.join(__dirname, '..', 'temp', TestWorkspace.tempDir)
  }

  /**
   * 设置测试环境
   */
  async setup(): Promise<void> {
    // 创建测试工作区
    await this.createWorkspace()
    
    // 保存原始配置
    await this.saveOriginalConfigs()
  }

  /**
   * 清理测试环境
   */
  async cleanup(): Promise<void> {
    // 关闭所有编辑器
    await vscode.commands.executeCommand('workbench.action.closeAllEditors')
    
    // 恢复原始配置
    await this.restoreOriginalConfigs()
    
    // 清理临时文件
    if (TestWorkspace.cleanup.after) {
      await this.cleanupFiles()
    }
  }

  /**
   * 创建测试工作区
   */
  private async createWorkspace(): Promise<void> {
    if (!fs.existsSync(this.workspaceDir)) {
      fs.mkdirSync(this.workspaceDir, { recursive: true })
    }

    // 创建图片目录
    const imageDir = path.join(this.workspaceDir, TestWorkspace.imageDir)
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true })
    }
  }

  /**
   * 创建测试文档
   */
  async createDocument(content: string, language: string = 'markdown'): Promise<vscode.TextDocument> {
    const doc = await vscode.workspace.openTextDocument({
      language,
      content
    })
    
    await vscode.window.showTextDocument(doc)
    return doc
  }

  /**
   * 创建文件并打开
   */
  async createFile(filename: string, content: string): Promise<vscode.TextDocument> {
    const filePath = path.join(this.workspaceDir, filename)
    fs.writeFileSync(filePath, content)
    this.createdFiles.push(filePath)
    
    const uri = vscode.Uri.file(filePath)
    const doc = await vscode.workspace.openTextDocument(uri)
    await vscode.window.showTextDocument(doc)
    
    return doc
  }

  /**
   * 应用用户配置
   */
  async applyUserConfig(configType: keyof typeof UserConfigs): Promise<void> {
    const config = UserConfigs[configType]
    const configuration = vscode.workspace.getConfiguration('pastemark')
    
    for (const [key, value] of Object.entries(config)) {
      const configKey = key.replace('pastemark.', '')
      await configuration.update(configKey, value, vscode.ConfigurationTarget.Workspace)
    }
  }

  /**
   * 保存原始配置
   */
  private async saveOriginalConfigs(): Promise<void> {
    const configuration = vscode.workspace.getConfiguration('pastemark')
    const keys = [
      'ollamaEnabled',
      'ollamaEndpoint', 
      'ollamaModel',
      'ollamaPrompt',
      'imagePath',
      'imageFormat'
    ]
    
    for (const key of keys) {
      this.originalConfigs[key] = configuration.get(key)
    }
  }

  /**
   * 恢复原始配置
   */
  private async restoreOriginalConfigs(): Promise<void> {
    const configuration = vscode.workspace.getConfiguration('pastemark')
    
    for (const [key, value] of Object.entries(this.originalConfigs)) {
      await configuration.update(key, value, vscode.ConfigurationTarget.Workspace)
    }
  }

  /**
   * 清理临时文件
   */
  private async cleanupFiles(): Promise<void> {
    for (const file of this.createdFiles) {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file)
        }
      } catch (error) {
        console.warn(`Failed to cleanup file: ${file}`, error)
      }
    }
    
    // 清理工作区目录
    try {
      if (fs.existsSync(this.workspaceDir)) {
        fs.rmSync(this.workspaceDir, { recursive: true, force: true })
      }
    } catch (error) {
      console.warn(`Failed to cleanup workspace: ${this.workspaceDir}`, error)
    }
  }

  /**
   * 获取创建的文件列表
   */
  getCreatedFiles(): string[] {
    return [...this.createdFiles]
  }

  /**
   * 获取工作区目录
   */
  getWorkspaceDir(): string {
    return this.workspaceDir
  }
}

/**
 * 剪贴板模拟工具
 */
export class ClipboardSimulator {
  /**
   * 模拟复制图片到剪贴板
   * 注意：这是一个模拟实现，实际测试中可能需要使用系统剪贴板工具
   */
  static async copyImageToClipboard(imageBuffer: Buffer): Promise<void> {
    // 在实际测试中，可能需要：
    // 1. 使用系统剪贴板工具（如 xclip, pbcopy 等）
    // 2. 创建临时文件并复制
    // 3. 使用 Playwright 等工具模拟用户操作
    
    // 这里是一个简化的实现
    console.log(`模拟复制图片到剪贴板 (${imageBuffer.length} bytes)`)
  }

  /**
   * 清空剪贴板
   */
  static async clearClipboard(): Promise<void> {
    console.log('清空剪贴板')
  }
}

/**
 * 断言辅助函数
 */
export class TestAssertions {
  /**
   * 断言文档包含图片引用
   */
  static assertDocumentContainsImage(
    document: vscode.TextDocument,
    expectedFileName?: string,
    expectedDescription?: string
  ): void {
    const content = document.getText()
    
    // 检查是否包含图片语法
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
    const matches = content.match(imageRegex)
    
    if (!matches || matches.length === 0) {
      throw new Error('文档中未找到图片引用')
    }

    if (expectedFileName) {
      const found = matches.some(match => match.includes(expectedFileName))
      if (!found) {
        throw new Error(`文档中未找到预期的文件名: ${expectedFileName}`)
      }
    }

    if (expectedDescription) {
      const found = matches.some(match => match.includes(expectedDescription))
      if (!found) {
        throw new Error(`文档中未找到预期的描述: ${expectedDescription}`)
      }
    }
  }

  /**
   * 断言文件存在
   */
  static assertFileExists(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`)
    }
  }

  /**
   * 断言文件大小
   */
  static assertFileSize(filePath: string, expectedSize?: number, maxSize?: number): void {
    this.assertFileExists(filePath)
    
    const stats = fs.statSync(filePath)
    const size = stats.size
    
    if (expectedSize && size !== expectedSize) {
      throw new Error(`文件大小不匹配: 期望 ${expectedSize}, 实际 ${size}`)
    }
    
    if (maxSize && size > maxSize) {
      throw new Error(`文件大小超过限制: 最大 ${maxSize}, 实际 ${size}`)
    }
  }

  /**
   * 断言文件名符合预期格式
   */
  static assertFileNameFormat(
    fileName: string,
    expectedFormat: 'timestamp' | 'descriptive' | 'technical' | 'chinese'
  ): void {
    let regex: RegExp
    
    switch (expectedFormat) {
      case 'timestamp':
        regex = /^image-\d{8}-\d{6}\.(png|jpg|jpeg)$/
        break
      case 'descriptive':
        regex = /^[a-z0-9-]+\.(png|jpg|jpeg)$/
        break
      case 'technical':
        regex = /^[a-z0-9_]+\.(png|jpg|jpeg)$/
        break
      case 'chinese':
        regex = /^[\u4e00-\u9fa5-]+\.(png|jpg|jpeg)$/
        break
      default:
        throw new Error(`未知的文件名格式: ${expectedFormat}`)
    }
    
    if (!regex.test(fileName)) {
      throw new Error(`文件名格式不符合预期: ${fileName} (期望格式: ${expectedFormat})`)
    }
  }
}

/**
 * 等待辅助函数
 */
export class TestWaiter {
  /**
   * 等待指定时间
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 等待条件满足
   */
  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const start = Date.now()
    
    while (Date.now() - start < timeout) {
      const result = await condition()
      if (result) return
      
      await this.wait(interval)
    }
    
    throw new Error(`等待超时: ${timeout}ms`)
  }

  /**
   * 等待文档内容更新
   */
  static async waitForDocumentUpdate(
    document: vscode.TextDocument,
    expectedContent: string | RegExp,
    timeout: number = 3000
  ): Promise<void> {
    await this.waitFor(() => {
      const content = document.getText()
      
      if (typeof expectedContent === 'string') {
        return content.includes(expectedContent)
      } else {
        return expectedContent.test(content)
      }
    }, timeout)
  }

  /**
   * 等待文件创建
   */
  static async waitForFileCreation(filePath: string, timeout: number = 2000): Promise<void> {
    await this.waitFor(() => fs.existsSync(filePath), timeout)
  }
}