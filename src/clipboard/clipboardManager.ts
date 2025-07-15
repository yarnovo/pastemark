import { IClipboardManager, IPlatformClipboard, ClipboardImageData } from './types'
import { WindowsClipboard } from './windows'
import { MacOSClipboard } from './macos'
import { LinuxClipboard } from './linux'
import { WSLClipboard } from './wsl'
import * as vscode from 'vscode'
import * as os from 'os'

/**
 * 跨平台剪贴板管理器
 */
export class ClipboardManager implements IClipboardManager {
  private platform: IPlatformClipboard
  private outputChannel?: vscode.OutputChannel

  constructor(extensionPath: string, outputChannel?: vscode.OutputChannel) {
    this.outputChannel = outputChannel
    
    this.log('=== Initializing Clipboard Manager ===')
    this.log(`OS Platform: ${os.platform()}`)
    this.log(`Is WSL: ${this.isWSL()}`)
    this.log(`Extension path: ${extensionPath}`)
    
    this.platform = this.createPlatformClipboard(extensionPath)
    
    this.log(`Initialized clipboard manager for platform: ${this.getPlatformName()}`)
    this.log('=== Clipboard Manager Ready ===')
  }

  async hasImage(): Promise<boolean> {
    this.log('\n>>> Checking clipboard for image...')
    try {
      // 首先尝试平台特定的方法
      this.log('Trying platform-specific method...')
      const result = await this.platform.hasImage()
      this.log(`Platform method result: ${result}`)
      
      // 如果平台方法失败，尝试从 VSCode API 读取文本格式的图片
      if (!result) {
        this.log('Platform method returned false, checking text clipboard...')
        const clipboardText = await vscode.env.clipboard.readText()
        this.log(`Text clipboard length: ${clipboardText.length}`)
        
        if (this.isBase64Image(clipboardText)) {
          this.log('Found base64 image in text clipboard')
          return true
        } else {
          this.log('No base64 image in text clipboard')
        }
      }
      
      return result
    } catch (error) {
      this.logError('Failed to check clipboard for image', error)
      return false
    }
  }

  async getImage(): Promise<ClipboardImageData | null> {
    try {
      // 首先尝试平台特定的方法
      let result = await this.platform.getImage()
      
      // 如果平台方法失败，尝试从 VSCode API 读取文本格式的图片
      if (!result) {
        const clipboardText = await vscode.env.clipboard.readText()
        if (this.isBase64Image(clipboardText)) {
          result = this.parseBase64Image(clipboardText)
          if (result) {
            this.log('Got base64 image from text clipboard')
          }
        }
      }
      
      return result
    } catch (error) {
      this.logError('Failed to get image from clipboard', error)
      return null
    }
  }

  async cleanup(): Promise<void> {
    await this.platform.cleanup()
  }

  private createPlatformClipboard(extensionPath: string): IPlatformClipboard {
    const platform = os.platform()
    
    // 检查是否在 WSL 环境中
    if (this.isWSL()) {
      this.log('Detected WSL environment')
      return new WSLClipboard(extensionPath, this.outputChannel)
    }
    
    switch (platform) {
      case 'win32':
        return new WindowsClipboard(extensionPath, this.outputChannel)
      case 'darwin':
        return new MacOSClipboard(extensionPath, this.outputChannel)
      case 'linux':
        return new LinuxClipboard(extensionPath, this.outputChannel)
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  private isWSL(): boolean {
    // 检查 WSL 环境变量
    if (process.env.WSL_DISTRO_NAME || process.env.WSL_INTEROP) {
      return true
    }
    
    // 检查 /proc/version 文件内容
    try {
      const fs = require('fs')
      const procVersion = fs.readFileSync('/proc/version', 'utf8')
      return procVersion.toLowerCase().includes('microsoft')
    } catch {
      return false
    }
  }

  private getPlatformName(): string {
    if (this.isWSL()) {
      return `WSL (${process.env.WSL_DISTRO_NAME || 'Unknown'})`
    }
    
    const platform = os.platform()
    switch (platform) {
      case 'win32':
        return 'Windows'
      case 'darwin':
        return 'macOS'
      case 'linux':
        return 'Linux'
      default:
        return platform
    }
  }

  private isBase64Image(text: string): boolean {
    if (!text) return false
    
    // Data URL 格式
    if (text.startsWith('data:image/')) return true
    
    // 纯 base64（检查文件头）
    try {
      const buffer = Buffer.from(text.trim(), 'base64')
      return this.isImageBuffer(buffer)
    } catch {
      return false
    }
  }

  private parseBase64Image(text: string): ClipboardImageData | null {
    try {
      let buffer: Buffer
      let format: 'png' | 'jpg' | 'gif' | 'bmp' | 'webp' = 'png'

      if (text.startsWith('data:image/')) {
        const matches = text.match(/^data:image\/(\w+);base64,(.+)$/)
        if (!matches) return null
        format = matches[1] as any
        buffer = Buffer.from(matches[2], 'base64')
      } else {
        buffer = Buffer.from(text.trim(), 'base64')
        format = this.detectImageFormat(buffer)
      }

      return { buffer, format }
    } catch (error) {
      this.logError('Failed to parse base64 image', error)
      return null
    }
  }

  private isImageBuffer(buffer: Buffer): boolean {
    if (buffer.length < 4) return false

    // PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return true
    }
    // JPEG
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return true
    }
    // GIF
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return true
    }
    // BMP
    if (buffer[0] === 0x42 && buffer[1] === 0x4D) {
      return true
    }

    return false
  }

  private detectImageFormat(buffer: Buffer): 'png' | 'jpg' | 'gif' | 'bmp' | 'webp' {
    if (buffer.length < 4) return 'png'

    if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'png'
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'jpg'
    if (buffer[0] === 0x47 && buffer[1] === 0x49) return 'gif'
    if (buffer[0] === 0x42 && buffer[1] === 0x4D) return 'bmp'

    return 'png'
  }

  private log(message: string): void {
    if (this.outputChannel) {
      this.outputChannel.appendLine(`[ClipboardManager] ${message}`)
    }
    console.log(`[PasteMark][ClipboardManager] ${message}`)
  }

  private logError(message: string, error?: any): void {
    const errorMsg = error ? `${message}: ${error.message || error}` : message
    if (this.outputChannel) {
      this.outputChannel.appendLine(`[ClipboardManager] ERROR: ${errorMsg}`)
    }
    console.error(`[PasteMark][ClipboardManager] ERROR:`, errorMsg)
  }
}