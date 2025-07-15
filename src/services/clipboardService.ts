import * as vscode from 'vscode'
import { ImageData } from '../types'

export class ClipboardService {
  /**
   * 检查剪贴板是否包含图片
   */
  async hasImage(): Promise<boolean> {
    try {
      const clipboardText = await vscode.env.clipboard.readText()
      return this.isImageData(clipboardText)
    } catch (error) {
      console.error('Failed to read clipboard:', error)
      return false
    }
  }

  /**
   * 从剪贴板获取图片数据
   */
  async getImage(): Promise<ImageData | null> {
    try {
      const clipboardText = await vscode.env.clipboard.readText()
      
      if (!this.isImageData(clipboardText)) {
        return null
      }

      return this.parseImageData(clipboardText)
    } catch (error) {
      console.error('Failed to get image from clipboard:', error)
      return null
    }
  }

  /**
   * 检查文本是否为图片数据
   */
  private isImageData(text: string): boolean {
    if (!text) {
      return false
    }

    // 检查 data URL 格式
    if (text.startsWith('data:image/')) {
      return true
    }

    // 检查 base64 图片数据（PNG 或 JPEG 文件头）
    const base64Pattern = /^[A-Za-z0-9+/]+=*$/
    if (base64Pattern.test(text.replace(/\s/g, ''))) {
      // 尝试解码并检查文件头
      try {
        const buffer = Buffer.from(text, 'base64')
        return this.isImageBuffer(buffer)
      } catch {
        return false
      }
    }

    return false
  }

  /**
   * 解析图片数据
   */
  private parseImageData(text: string): ImageData | null {
    try {
      let buffer: Buffer
      let format: string

      if (text.startsWith('data:image/')) {
        // 解析 data URL
        const matches = text.match(/^data:image\/(\w+);base64,(.+)$/)
        if (!matches) {
          return null
        }
        format = matches[1]
        buffer = Buffer.from(matches[2], 'base64')
      } else {
        // 纯 base64 数据
        buffer = Buffer.from(text.trim(), 'base64')
        format = this.detectImageFormat(buffer)
      }

      if (!this.isImageBuffer(buffer)) {
        return null
      }

      return { buffer, format }
    } catch (error) {
      console.error('Failed to parse image data:', error)
      return null
    }
  }

  /**
   * 检查 Buffer 是否为图片
   */
  private isImageBuffer(buffer: Buffer): boolean {
    if (buffer.length < 4) {
      return false
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return true
    }

    // JPEG: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return true
    }

    // GIF: 47 49 46 38
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
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
  private detectImageFormat(buffer: Buffer): string {
    if (buffer.length < 4) {
      return 'png' // 默认
    }

    // PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return 'png'
    }

    // JPEG
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return 'jpg'
    }

    // GIF
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
      return 'gif'
    }

    // BMP
    if (buffer[0] === 0x42 && buffer[1] === 0x4D) {
      return 'bmp'
    }

    // WebP
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      if (buffer.length >= 12 && 
          buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
        return 'webp'
      }
    }

    return 'png' // 默认
  }
}