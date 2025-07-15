import { BasePlatformClipboard } from './base';
import { ClipboardImageData } from './types';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';

/**
 * Windows 平台剪贴板实现
 */
export class WindowsClipboard extends BasePlatformClipboard {
  protected scriptPath: string;
  protected tempFiles: Set<string> = new Set();

  constructor(extensionPath: string, outputChannel?: vscode.OutputChannel) {
    super(outputChannel);
    this.scriptPath = path.join(extensionPath, 'out', 'resources', 'windows-clipboard.ps1');
    this.log(`Script path: ${this.scriptPath}`);

    // 检查脚本文件是否存在
    if (!fs.existsSync(this.scriptPath)) {
      this.logError(`PowerShell script not found at: ${this.scriptPath}`);
    } else {
      this.log('PowerShell script found');
    }
  }

  async hasImage(): Promise<boolean> {
    this.log('Checking Windows clipboard for image...');
    try {
      const result = await this.runPowerShellScript();
      const hasImg = result !== 'no image' && result !== '' && !result.startsWith('error:');
      this.log(`Clipboard check result: ${result}, has image: ${hasImg}`);
      return hasImg;
    } catch (error) {
      this.logError('Failed to check clipboard', error);
      return false;
    }
  }

  async getImage(): Promise<ClipboardImageData | null> {
    try {
      const tempFilePath = await this.runPowerShellScript();

      if (!tempFilePath || tempFilePath === 'no image' || tempFilePath.startsWith('error:')) {
        this.log('No image in clipboard');
        return null;
      }

      // Read the temporary file
      if (!fs.existsSync(tempFilePath)) {
        this.logError(`Temp file not found: ${tempFilePath}`);
        return null;
      }

      const buffer = fs.readFileSync(tempFilePath);
      this.tempFiles.add(tempFilePath);

      // Detect format
      const format = this.detectImageFormat(buffer);

      this.log(`Successfully read image: ${buffer.length} bytes, format: ${format}`);
      return { buffer, format };
    } catch (error) {
      this.logError('Failed to get image from clipboard', error);
      return null;
    }
  }

  async cleanup(): Promise<void> {
    // Clean up temporary files
    for (const tempFile of this.tempFiles) {
      try {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          this.log(`Cleaned up temp file: ${tempFile}`);
        }
      } catch (error) {
        this.logError(`Failed to clean up temp file: ${tempFile}`, error);
      }
    }
    this.tempFiles.clear();
  }

  protected runPowerShellScript(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.log(`Running PowerShell script: ${this.scriptPath}`);

      const args = [
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        this.scriptPath,
      ];

      this.log(`PowerShell args: ${args.join(' ')}`);
      const powershell = spawn('powershell.exe', args);

      let stdout = '';
      let stderr = '';

      powershell.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      powershell.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      powershell.on('error', (error) => {
        this.logError('PowerShell spawn error', error);
        reject(error);
      });

      powershell.on('close', (code) => {
        if (code !== 0 && code !== 1) {
          this.logError(`PowerShell exited with code ${code}`, stderr);
          reject(new Error(`PowerShell exited with code ${code}: ${stderr}`));
        } else {
          const result = stdout.trim();
          this.log(`PowerShell result: ${result}`);
          resolve(result);
        }
      });

      // Set timeout
      setTimeout(() => {
        powershell.kill();
        reject(new Error('PowerShell script timeout'));
      }, 5000);
    });
  }
}
