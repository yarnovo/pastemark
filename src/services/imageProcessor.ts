import { FileNameOptions, ProcessedImage, ImageData } from '../types';
import { OllamaClient } from './ollamaClient';
import {
  sanitizeFileName,
  truncateFileName,
  generateTimestampFileName,
} from '../utils/stringUtils';
import * as vscode from 'vscode';

export class ImageProcessor {
  private ollamaClient: OllamaClient;
  private maxFileNameLength = 255;

  constructor() {
    this.ollamaClient = new OllamaClient();
  }

  /**
   * 生成文件名
   */
  async generateFileName(options: FileNameOptions): Promise<string> {
    const { selectedText, useOllama, imageData } = options;
    let baseName: string;

    // 1. 如果有选中的文本，使用选中的文本
    if (selectedText && selectedText.trim()) {
      baseName = sanitizeFileName(selectedText.trim());
    }
    // 2. 如果启用 Ollama 且没有选中文本，尝试智能命名
    else if (useOllama) {
      try {
        const isAvailable = await this.ollamaClient.isAvailable();
        if (isAvailable) {
          const suggestedName = await this.ollamaClient.analyzeImage(imageData.buffer);
          if (suggestedName && suggestedName.trim()) {
            baseName = sanitizeFileName(suggestedName.trim());
          } else {
            baseName = generateTimestampFileName();
          }
        } else {
          baseName = generateTimestampFileName();
        }
      } catch (error) {
        console.error('Ollama naming failed, falling back to timestamp:', error);
        baseName = generateTimestampFileName();
      }
    }
    // 3. 否则使用时间戳命名
    else {
      baseName = generateTimestampFileName();
    }

    // 添加文件扩展名
    const fileName = `${baseName}.${imageData.format}`;

    // 确保文件名不超过最大长度
    return truncateFileName(fileName, this.maxFileNameLength);
  }

  /**
   * 处理图片数据
   */
  async processImage(imageData: ImageData): Promise<ProcessedImage> {
    // 验证图片大小（10MB 限制）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageData.buffer.length > maxSize) {
      throw new Error('Image size exceeds 10MB limit');
    }

    // 这里可以添加更多的图片处理逻辑
    // 例如：格式转换、压缩等

    return {
      buffer: imageData.buffer,
      format: imageData.format,
    };
  }

  /**
   * 获取配置中的图片格式
   */
  getConfiguredFormat(): string {
    const config = vscode.workspace.getConfiguration('pastemark');
    return config.get<string>('imageFormat') || 'png';
  }
}
