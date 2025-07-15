import { BasePlatformClipboard } from './base'
import { ClipboardImageData } from './types'
import { spawn } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import * as vscode from 'vscode'

/**
 * Linux 平台剪贴板实现（支持 X11 和 Wayland）
 */
export class LinuxClipboard extends BasePlatformClipboard {
  private scriptPath: string
  private tempFiles: Set<string> = new Set()

  constructor(extensionPath: string, outputChannel?: vscode.OutputChannel) {
    super(outputChannel)
    this.scriptPath = path.join(extensionPath, 'out', 'resources', 'linux-clipboard.sh')
  }

  async hasImage(): Promise<boolean> {
    try {
      const result = await this.runShellScript()
      return result !== 'no image' && result !== '' && !result.startsWith('error:')
    } catch (error) {
      this.logError('Failed to check clipboard', error)
      return false
    }
  }

  async getImage(): Promise<ClipboardImageData | null> {
    try {
      const tempFilePath = await this.runShellScript()
      
      if (!tempFilePath || tempFilePath === 'no image' || tempFilePath.startsWith('error:')) {
        if (tempFilePath.startsWith('error:')) {
          this.logError(`Clipboard error: ${tempFilePath}`)
        } else {
          this.log('No image in clipboard')
        }
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

  private runShellScript(): Promise<string> {
    return new Promise((resolve, reject) => {
      const shell = spawn('bash', [this.scriptPath])

      let stdout = ''
      let stderr = ''

      shell.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      shell.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      shell.on('error', (error) => {
        this.logError('Shell spawn error', error)
        reject(error)
      })

      shell.on('close', (code) => {
        if (code !== 0 && code !== 1) {
          this.logError(`Shell script exited with code ${code}`, stderr)
          reject(new Error(`Shell script exited with code ${code}: ${stderr}`))
        } else {
          const result = stdout.trim()
          this.log(`Shell script result: ${result}`)
          resolve(result)
        }
      })

      // Set timeout
      setTimeout(() => {
        shell.kill()
        reject(new Error('Shell script timeout'))
      }, 5000)
    })
  }
}