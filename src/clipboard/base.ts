import { IPlatformClipboard, ClipboardImageData } from './types'
import * as vscode from 'vscode'

/**
 * 平台剪贴板基类
 */
export abstract class BasePlatformClipboard implements IPlatformClipboard {
  protected outputChannel?: vscode.OutputChannel

  constructor(outputChannel?: vscode.OutputChannel) {
    this.outputChannel = outputChannel
  }

  abstract hasImage(): Promise<boolean>
  abstract getImage(): Promise<ClipboardImageData | null>
  
  async cleanup(): Promise<void> {
    // 默认实现，子类可以重写
  }

  protected log(message: string): void {
    if (this.outputChannel) {
      this.outputChannel.appendLine(`[${this.constructor.name}] ${message}`)
    }
    console.log(`[PasteMark][${this.constructor.name}] ${message}`)
  }

  protected logError(message: string, error?: any): void {
    const errorMsg = error ? `${message}: ${error.message || error}` : message
    if (this.outputChannel) {
      this.outputChannel.appendLine(`[${this.constructor.name}] ERROR: ${errorMsg}`)
    }
    console.error(`[PasteMark][${this.constructor.name}] ERROR:`, errorMsg)
  }

  /**
   * 检查 Buffer 是否为图片
   */
  protected isImageBuffer(buffer: Buffer): boolean {
    if (buffer.length < 4) return false

    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return true
    }
    // JPEG: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return true
    }
    // GIF: 47 49 46
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return true
    }
    // BMP: 42 4D
    if (buffer[0] === 0x42 && buffer[1] === 0x4D) {
      return true
    }
    // WebP: 52 49 46 46 ... 57 45 42 50
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      if (buffer.length >= 12 && 
          buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
        return true
      }
    }

    return false
  }

  /**
   * 检测图片格式
   */
  protected detectImageFormat(buffer: Buffer): 'png' | 'jpg' | 'gif' | 'bmp' | 'webp' {
    if (buffer.length < 4) return 'png'

    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return 'png'
    }
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return 'jpg'
    }
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return 'gif'
    }
    if (buffer[0] === 0x42 && buffer[1] === 0x4D) {
      return 'bmp'
    }
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      if (buffer.length >= 12 && 
          buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
        return 'webp'
      }
    }

    return 'png'
  }
}