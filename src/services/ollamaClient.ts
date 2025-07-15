import * as vscode from 'vscode';

export class OllamaClient {
  private endpoint: string;
  private model: string;
  private prompt: string;
  private timeout: number = 3000; // 3秒超时
  private isAvailableCache: boolean | null = null;
  private lastAvailabilityCheck: number = 0;
  private availabilityCacheDuration: number = 60000; // 1分钟缓存

  constructor() {
    const config = vscode.workspace.getConfiguration('pastemark');
    this.endpoint = config.get<string>('ollamaEndpoint') || 'http://localhost:11434';
    this.model = config.get<string>('ollamaModel') || 'llava';
    this.prompt =
      config.get<string>('ollamaPrompt') ||
      'Analyze this image and provide a short, descriptive filename (2-4 words, English, use hyphens to separate words, no file extension). For example: "user-interface-design" or "system-architecture". Only respond with the filename, nothing else.';
  }

  /**
   * 检查 Ollama 服务是否可用
   */
  async isAvailable(): Promise<boolean> {
    // 检查缓存
    const now = Date.now();
    if (
      this.isAvailableCache !== null &&
      now - this.lastAvailabilityCheck < this.availabilityCacheDuration
    ) {
      return this.isAvailableCache;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000); // 1秒超时用于检查

      const response = await fetch(`${this.endpoint}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      this.isAvailableCache = response.ok;
      this.lastAvailabilityCheck = now;
      return response.ok;
    } catch {
      this.isAvailableCache = false;
      this.lastAvailabilityCheck = now;
      return false;
    }
  }

  /**
   * 分析图片并生成文件名
   */
  async analyzeImage(imageBuffer: Buffer): Promise<string> {
    try {
      const base64Image = imageBuffer.toString('base64');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: this.prompt,
          images: [base64Image],
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = (await response.json()) as { response?: string };

      if (!data.response) {
        throw new Error('Invalid response from Ollama');
      }

      // 清理响应，确保只有文件名
      const fileName = this.cleanFileName(data.response);

      if (!fileName) {
        throw new Error('Empty filename from Ollama');
      }

      return fileName;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * 清理 Ollama 返回的文件名
   */
  private cleanFileName(response: string): string {
    // 移除引号、空白字符和非法字符
    const cleaned = response
      .trim()
      .replace(/["'`]/g, '') // 移除引号
      .replace(/\s+/g, '-') // 空格转换为连字符
      .replace(/[^\w-]/g, '') // 只保留字母、数字、连字符
      .replace(/-+/g, '-') // 合并多个连字符
      .replace(/^-+|-+$/g, '') // 移除首尾连字符
      .toLowerCase(); // 转为小写

    return cleaned;
  }

  /**
   * 更新配置
   */
  updateConfig(): void {
    const config = vscode.workspace.getConfiguration('pastemark');
    this.endpoint = config.get<string>('ollamaEndpoint') || 'http://localhost:11434';
    this.model = config.get<string>('ollamaModel') || 'llava';
    this.prompt =
      config.get<string>('ollamaPrompt') ||
      'Analyze this image and provide a short, descriptive filename (2-4 words, English, use hyphens to separate words, no file extension). For example: "user-interface-design" or "system-architecture". Only respond with the filename, nothing else.';
    // 清除缓存
    this.isAvailableCache = null;
    this.lastAvailabilityCheck = 0;
  }
}
