import { MockOllamaResponses } from './fixtures'

/**
 * Ollama 服务模拟
 */
export class OllamaMock {
  private static originalFetch: typeof fetch
  private static isActive = false
  
  /**
   * 启用 Ollama 模拟
   */
  static enable(): void {
    if (this.isActive) return
    
    this.originalFetch = global.fetch
    this.isActive = true
    
    // 模拟 fetch 请求
    global.fetch = this.mockFetch.bind(this)
  }

  /**
   * 禁用 Ollama 模拟
   */
  static disable(): void {
    if (!this.isActive) return
    
    global.fetch = this.originalFetch
    this.isActive = false
  }

  /**
   * 模拟 fetch 请求
   */
  private static async mockFetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
    const urlString = typeof input === 'string' ? input : input.toString()
    
    // 检查是否是 Ollama API 请求
    if (urlString.includes('localhost:11434')) {
      return this.handleOllamaRequest(urlString, init)
    }
    
    // 其他请求使用原始 fetch
    return this.originalFetch(input, init)
  }

  /**
   * 处理 Ollama 请求
   */
  private static async handleOllamaRequest(url: string, init?: RequestInit): Promise<Response> {
    // 检查服务状态
    if (url.includes('/api/tags')) {
      return this.createResponse(200, {
        models: [
          { name: 'llava', size: 4000000000 },
          { name: 'qwen2-vl', size: 3500000000 }
        ]
      })
    }

    // 处理图像分析请求
    if (url.includes('/api/generate')) {
      return this.handleGenerateRequest(init)
    }

    // 默认 404
    return this.createResponse(404, { error: 'Not found' })
  }

  /**
   * 处理生成请求
   */
  private static async handleGenerateRequest(init?: RequestInit): Promise<Response> {
    if (!init?.body) {
      return this.createResponse(400, { error: 'No body' })
    }

    const body = JSON.parse(init.body as string)
    const { model, prompt } = body

    // 根据模型和提示词返回不同响应
    if (model === 'llava') {
      if (prompt.includes('English')) {
        return this.createResponse(200, MockOllamaResponses.success)
      }
    }

    if (model === 'qwen2-vl') {
      if (prompt.includes('中文')) {
        return this.createResponse(200, MockOllamaResponses.chinese)
      }
      if (prompt.includes('technical')) {
        return this.createResponse(200, MockOllamaResponses.technical)
      }
    }

    // 模拟服务不可用
    if (this.shouldSimulateError()) {
      return this.createResponse(500, MockOllamaResponses.error)
    }

    // 模拟超时
    if (this.shouldSimulateTimeout()) {
      await new Promise(resolve => setTimeout(resolve, 5000))
      return this.createResponse(408, { error: 'Request timeout' })
    }

    // 默认成功响应
    return this.createResponse(200, MockOllamaResponses.success)
  }

  /**
   * 创建响应
   */
  private static createResponse(status: number, data: any): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  /**
   * 是否模拟错误
   */
  private static shouldSimulateError(): boolean {
    return Math.random() < 0.1 // 10% 概率
  }

  /**
   * 是否模拟超时
   */
  private static shouldSimulateTimeout(): boolean {
    return Math.random() < 0.05 // 5% 概率
  }
}

/**
 * 剪贴板模拟
 */
export class ClipboardMock {
  private static imageData: Buffer | null = null
  private static hasImage = false

  /**
   * 设置剪贴板图片数据
   */
  static setImageData(data: Buffer): void {
    this.imageData = data
    this.hasImage = true
  }

  /**
   * 清空剪贴板
   */
  static clear(): void {
    this.imageData = null
    this.hasImage = false
  }

  /**
   * 检查是否有图片
   */
  static hasImageData(): boolean {
    return this.hasImage
  }

  /**
   * 获取图片数据
   */
  static getImageData(): Buffer | null {
    return this.imageData
  }
}

/**
 * 文件系统模拟
 */
export class FileSystemMock {
  private static readOnlyPaths: Set<string> = new Set()
  private static failPaths: Set<string> = new Set()

  /**
   * 设置只读路径
   */
  static setReadOnly(path: string): void {
    this.readOnlyPaths.add(path)
  }

  /**
   * 设置失败路径
   */
  static setFailure(path: string): void {
    this.failPaths.add(path)
  }

  /**
   * 清理设置
   */
  static clear(): void {
    this.readOnlyPaths.clear()
    this.failPaths.clear()
  }

  /**
   * 检查路径是否只读
   */
  static isReadOnly(path: string): boolean {
    return this.readOnlyPaths.has(path) || 
           Array.from(this.readOnlyPaths).some(p => path.startsWith(p))
  }

  /**
   * 检查路径是否会失败
   */
  static willFail(path: string): boolean {
    return this.failPaths.has(path) || 
           Array.from(this.failPaths).some(p => path.startsWith(p))
  }
}

/**
 * 测试场景管理
 */
export class TestScenarios {
  /**
   * 配置新手用户场景
   */
  static configureNoviceUser(): void {
    OllamaMock.enable()
    ClipboardMock.clear()
    FileSystemMock.clear()
  }

  /**
   * 配置高级用户场景
   */
  static configureAdvancedUser(): void {
    OllamaMock.enable()
    ClipboardMock.clear()
    FileSystemMock.clear()
  }

  /**
   * 配置开发者场景
   */
  static configureDeveloper(): void {
    OllamaMock.enable()
    ClipboardMock.clear()
    FileSystemMock.clear()
  }

  /**
   * 配置错误场景
   */
  static configureErrorScenario(): void {
    OllamaMock.enable()
    ClipboardMock.clear()
    FileSystemMock.clear()
  }

  /**
   * 配置网络问题场景
   */
  static configureNetworkIssue(): void {
    OllamaMock.disable() // 禁用 mock，模拟网络不可用
    ClipboardMock.clear()
    FileSystemMock.clear()
  }

  /**
   * 配置权限问题场景
   */
  static configurePermissionIssue(): void {
    OllamaMock.enable()
    ClipboardMock.clear()
    FileSystemMock.setReadOnly('/tmp/test-workspace')
  }

  /**
   * 清理所有场景
   */
  static cleanup(): void {
    OllamaMock.disable()
    ClipboardMock.clear()
    FileSystemMock.clear()
  }
}