import { WindowsClipboard } from './windows'
import { ClipboardImageData } from './types'
import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

/**
 * WSL 平台剪贴板实现
 * 通过调用 Windows 的 PowerShell 来访问剪贴板
 */
export class WSLClipboard extends WindowsClipboard {
  constructor(extensionPath: string, outputChannel?: vscode.OutputChannel) {
    super(extensionPath, outputChannel)
    // WSL 需要使用 powershell.exe 而不是 pwsh
  }

  async getImage(): Promise<ClipboardImageData | null> {
    const result = await super.getImage()
    
    if (result) {
      // 如果临时文件路径是 Windows 格式，需要转换为 WSL 格式
      // 例如: C:\temp\image.png -> /mnt/c/temp/image.png
      this.log('Successfully got image from Windows clipboard in WSL')
    }
    
    return result
  }

  protected async runPowerShellScript(): Promise<string> {
    // 在 WSL 中使用 powershell.exe
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process')
      
      // 获取脚本的 Windows 路径
      const wslScriptPath = this.convertToWindowsPath(this.scriptPath)
      
      const powershell = spawn('powershell.exe', [
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy', 'Bypass',
        '-File', wslScriptPath
      ])

      let stdout = ''
      let stderr = ''

      powershell.stdout.on('data', (data: Buffer) => {
        stdout += data.toString()
      })

      powershell.stderr.on('data', (data: Buffer) => {
        stderr += data.toString()
      })

      powershell.on('error', (error: Error) => {
        this.logError('PowerShell spawn error in WSL', error)
        reject(error)
      })

      powershell.on('close', (code: number) => {
        if (code !== 0 && code !== 1) {
          this.logError(`PowerShell exited with code ${code}`, stderr)
          reject(new Error(`PowerShell exited with code ${code}: ${stderr}`))
        } else {
          let result = stdout.trim()
          
          // 转换 Windows 路径为 WSL 路径
          if (result && !result.startsWith('error:') && result !== 'no image') {
            result = this.convertToWSLPath(result)
          }
          
          this.log(`PowerShell result in WSL: ${result}`)
          resolve(result)
        }
      })

      // Set timeout
      setTimeout(() => {
        powershell.kill()
        reject(new Error('PowerShell script timeout'))
      }, 5000)
    })
  }

  /**
   * 转换 WSL 路径为 Windows 路径
   */
  private convertToWindowsPath(wslPath: string): string {
    // /mnt/c/... -> C:\...
    if (wslPath.startsWith('/mnt/')) {
      const parts = wslPath.split('/')
      if (parts.length > 3) {
        const drive = parts[2].toUpperCase()
        const pathParts = parts.slice(3).join('\\')
        return `${drive}:\\${pathParts}`
      }
    }
    
    // 如果不是 /mnt/ 开头，尝试使用 wslpath 命令
    try {
      const { execSync } = require('child_process')
      const windowsPath = execSync(`wslpath -w "${wslPath}"`, { encoding: 'utf8' }).trim()
      return windowsPath
    } catch {
      // 如果 wslpath 失败，返回原路径
      return wslPath
    }
  }

  /**
   * 转换 Windows 路径为 WSL 路径
   */
  private convertToWSLPath(windowsPath: string): string {
    // C:\... -> /mnt/c/...
    const match = windowsPath.match(/^([A-Za-z]):\\(.*)$/)
    if (match) {
      const drive = match[1].toLowerCase()
      const path = match[2].replace(/\\/g, '/')
      return `/mnt/${drive}/${path}`
    }
    
    // 如果不匹配标准格式，尝试使用 wslpath 命令
    try {
      const { execSync } = require('child_process')
      const wslPath = execSync(`wslpath -u "${windowsPath}"`, { encoding: 'utf8' }).trim()
      return wslPath
    } catch {
      // 如果 wslpath 失败，返回原路径
      return windowsPath
    }
  }
}