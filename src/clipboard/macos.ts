import { BasePlatformClipboard } from './base'
import { ClipboardImageData } from './types'
import { spawn } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import * as vscode from 'vscode'

/**
 * macOS 平台剪贴板实现
 */
export class MacOSClipboard extends BasePlatformClipboard {
  private scriptPath: string
  private tempFiles: Set<string> = new Set()

  constructor(extensionPath: string, outputChannel?: vscode.OutputChannel) {
    super(outputChannel)
    this.scriptPath = path.join(extensionPath, 'out', 'resources', 'mac-clipboard.applescript')
  }

  async hasImage(): Promise<boolean> {
    try {
      const result = await this.runAppleScript()
      return result !== 'no image' && result !== '' && !result.startsWith('error:')
    } catch (error) {
      this.logError('Failed to check clipboard', error)
      return false
    }
  }

  async getImage(): Promise<ClipboardImageData | null> {
    try {
      const tempFilePath = await this.runAppleScript()
      
      if (!tempFilePath || tempFilePath === 'no image' || tempFilePath.startsWith('error:')) {
        this.log('No image in clipboard')
        return null
      }

      // Read the temporary file
      if (!fs.existsSync(tempFilePath)) {
        this.logError(`Temp file not found: ${tempFilePath}`)
        return null
      }

      const buffer = fs.readFileSync(tempFilePath)
      this.tempFiles.add(tempFilePath)
      
      // Detect format
      const format = this.detectImageFormat(buffer)
      
      this.log(`Successfully read image: ${buffer.length} bytes, format: ${format}`)
      return { buffer, format }
      
    } catch (error) {
      this.logError('Failed to get image from clipboard', error)
      return null
    }
  }

  async cleanup(): Promise<void> {
    // Clean up temporary files
    for (const tempFile of this.tempFiles) {
      try {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile)
          this.log(`Cleaned up temp file: ${tempFile}`)
        }
      } catch (error) {
        this.logError(`Failed to clean up temp file: ${tempFile}`, error)
      }
    }
    this.tempFiles.clear()
  }

  private runAppleScript(): Promise<string> {
    return new Promise((resolve, reject) => {
      const osascript = spawn('osascript', [this.scriptPath])

      let stdout = ''
      let stderr = ''

      osascript.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      osascript.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      osascript.on('error', (error) => {
        this.logError('osascript spawn error', error)
        reject(error)
      })

      osascript.on('close', (code) => {
        if (code !== 0) {
          this.logError(`osascript exited with code ${code}`, stderr)
          resolve('no image')
        } else {
          const result = stdout.trim()
          this.log(`osascript result: ${result}`)
          resolve(result)
        }
      })

      // Set timeout
      setTimeout(() => {
        osascript.kill()
        reject(new Error('AppleScript timeout'))
      }, 5000)
    })
  }
}