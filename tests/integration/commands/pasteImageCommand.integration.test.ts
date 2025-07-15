import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock vscode before any imports
vi.mock('vscode', () => ({
  window: {
    showErrorMessage: vi.fn(),
    showWarningMessage: vi.fn(),
    showInformationMessage: vi.fn(),
    activeTextEditor: {
      document: {
        uri: { fsPath: '/test/document.md' },
        languageId: 'markdown'
      },
      selection: {
        isEmpty: true,
        active: { line: 0, character: 0 }
      },
      edit: vi.fn((callback: any) => {
        callback({
          insert: vi.fn(),
          replace: vi.fn()
        })
        return Promise.resolve(true)
      })
    }
  },
  workspace: {
    getConfiguration: vi.fn(() => ({
      get: vi.fn((key: string) => {
        const defaults: Record<string, any> = {
          'ollamaEnabled': false,
          'ollamaEndpoint': 'http://localhost:11434',
          'ollamaModel': 'llava',
          'imagePath': './',
          'imageFormat': 'png'
        }
        return defaults[key]
      })
    })),
    fs: {
      writeFile: vi.fn().mockResolvedValue(undefined),
      stat: vi.fn().mockRejectedValue(new Error('File not found')),
      createDirectory: vi.fn().mockResolvedValue(undefined)
    }
  },
  env: {
    clipboard: {
      readText: vi.fn()
    }
  },
  Uri: {
    file: vi.fn((path: string) => ({ fsPath: path }))
  },
  Range: class {
    constructor(public start: any, public end: any) {}
  },
  Selection: class {
    constructor(public anchor: any, public active: any) {
      this.isEmpty = false
    }
    isEmpty: boolean
  },
  FileType: {
    File: 1,
    Directory: 2
  }
}))

import { PasteImageCommand } from '../../../src/commands/pasteImageCommand'
import * as vscode from 'vscode'

describe('PasteImageCommand Integration Tests', () => {
  let command: PasteImageCommand

  beforeEach(() => {
    vi.clearAllMocks()
    command = new PasteImageCommand()
  })

  it('should show error when not in markdown file', async () => {
    const mockWindow = vi.mocked(vscode.window)
    const mockEditor = mockWindow.activeTextEditor as any
    mockEditor.document.languageId = 'javascript'
    
    await command.execute()
    
    expect(mockWindow.showErrorMessage).toHaveBeenCalledWith('请在 Markdown 文件中使用此功能')
  })

  it('should show warning when no image in clipboard', async () => {
    const mockWindow = vi.mocked(vscode.window)
    const mockClipboard = vi.mocked(vscode.env.clipboard)
    const mockEditor = mockWindow.activeTextEditor as any
    
    mockEditor.document.languageId = 'markdown'
    mockClipboard.readText.mockResolvedValue('plain text')
    
    await command.execute()
    
    expect(mockWindow.showWarningMessage).toHaveBeenCalledWith('剪贴板中没有图片')
  })

  it('should paste image successfully', async () => {
    const mockWindow = vi.mocked(vscode.window)
    const mockClipboard = vi.mocked(vscode.env.clipboard)
    const mockWorkspace = vi.mocked(vscode.workspace)
    const mockEditor = mockWindow.activeTextEditor as any
    
    // Setup
    mockEditor.document.languageId = 'markdown'
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    mockClipboard.readText.mockResolvedValue(`data:image/png;base64,${pngBase64}`)
    
    // Execute
    await command.execute()
    
    // Verify
    expect(mockWorkspace.fs.writeFile).toHaveBeenCalled()
    expect(mockWindow.showInformationMessage).toHaveBeenCalledWith(
      expect.stringContaining('图片已保存:')
    )
  })
})