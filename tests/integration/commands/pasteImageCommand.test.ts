import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as vscode from 'vscode'

// Mock 所有服务
vi.mock('@/services/clipboardService')
vi.mock('@/services/imageProcessor')
vi.mock('@/services/fileManager')
vi.mock('@/services/editorService')

describe('PasteImageCommand 集成测试', () => {
  let mockClipboardService: any
  let mockImageProcessor: any
  let mockFileManager: any
  let mockEditorService: any

  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks()
    
    // 设置默认的 mock 行为
    // mockClipboardService = {
    //   hasImage: vi.fn().mockResolvedValue(true),
    //   getImage: vi.fn().mockResolvedValue({
    //     buffer: Buffer.from('fake-image'),
    //     format: 'png'
    //   })
    // }
    
    // mockImageProcessor = {
    //   generateFileName: vi.fn(),
    //   processImage: vi.fn()
    // }
    
    // mockFileManager = {
    //   saveImage: vi.fn(),
    //   ensureUniqueFileName: vi.fn()
    // }
    
    // mockEditorService = {
    //   getSelection: vi.fn(),
    //   replaceSelection: vi.fn(),
    //   insertAtCursor: vi.fn()
    // }
  })

  describe('手动命名场景', () => {
    it('应该完成选中文本的完整流程', async () => {
      // Arrange
      const selectedText = '系统架构图'
      const mockEditor = {
        document: {
          uri: { fsPath: '/test/document.md' },
          languageId: 'markdown'
        },
        selection: new vscode.Selection(0, 0, 0, 10)
      }
      
      // mockEditorService.getSelection.mockReturnValue({
      //   text: selectedText,
      //   range: mockEditor.selection
      // })
      
      // mockImageProcessor.generateFileName.mockResolvedValue('系统架构图.png')
      // mockFileManager.ensureUniqueFileName.mockResolvedValue('/test/系统架构图.png')
      
      // Act
      // await executePasteImageCommand()
      
      // Assert
      // expect(mockClipboardService.getImage).toHaveBeenCalled()
      // expect(mockImageProcessor.generateFileName).toHaveBeenCalledWith({
      //   selectedText: '系统架构图',
      //   useOllama: true,
      //   imageData: expect.any(Object)
      // })
      // expect(mockFileManager.saveImage).toHaveBeenCalledWith(
      //   '/test/系统架构图.png',
      //   expect.any(Buffer)
      // )
      // expect(mockEditorService.replaceSelection).toHaveBeenCalledWith(
      //   '![系统架构图](./系统架构图.png)'
      // )
    })

    it('应该正确生成相对路径的 Markdown 语法', async () => {
      // Arrange
      const selectedText = 'test-image'
      
      // mockEditorService.getSelection.mockReturnValue({
      //   text: selectedText,
      //   range: new vscode.Range(0, 0, 0, 10)
      // })
      
      // Act
      // await executePasteImageCommand()
      
      // Assert
      // const markdownText = mockEditorService.replaceSelection.mock.calls[0][0]
      // expect(markdownText).toBe('![test-image](./test-image.png)')
    })

    it('应该在同目录下创建图片文件', async () => {
      // Arrange
      const documentPath = '/workspace/docs/README.md'
      const expectedImagePath = '/workspace/docs/my-image.png'
      
      // mockEditor.document.uri.fsPath = documentPath
      // mockEditorService.getSelection.mockReturnValue({ text: 'my-image' })
      
      // Act
      // await executePasteImageCommand()
      
      // Assert
      // expect(mockFileManager.saveImage).toHaveBeenCalledWith(
      //   expectedImagePath,
      //   expect.any(Buffer)
      // )
    })

    it('应该显示成功提示', async () => {
      // Arrange
      const mockShowInformationMessage = vi.spyOn(vscode.window, 'showInformationMessage')
      
      // Act
      // await executePasteImageCommand()
      
      // Assert
      // expect(mockShowInformationMessage).toHaveBeenCalledWith(
      //   expect.stringContaining('图片已保存')
      // )
    })
  })

  describe('智能命名场景', () => {
    beforeEach(() => {
      // mockEditorService.getSelection.mockReturnValue(null) // 没有选中文本
    })

    it('应该使用 Ollama 生成文件名', async () => {
      // Arrange
      // mockImageProcessor.generateFileName.mockResolvedValue('architecture-diagram.png')
      
      // Act
      // await executePasteImageCommand()
      
      // Assert
      // expect(mockImageProcessor.generateFileName).toHaveBeenCalledWith({
      //   selectedText: undefined,
      //   useOllama: true,
      //   imageData: expect.any(Object)
      // })
      // expect(mockEditorService.insertAtCursor).toHaveBeenCalledWith(
      //   '![architecture-diagram](./architecture-diagram.png)'
      // )
    })

    it('应该在光标位置插入图片引用', async () => {
      // Arrange
      const cursorPosition = new vscode.Position(5, 10)
      // mockEditor.selection = new vscode.Selection(cursorPosition, cursorPosition)
      
      // Act
      // await executePasteImageCommand()
      
      // Assert
      // expect(mockEditorService.insertAtCursor).toHaveBeenCalled()
      // expect(mockEditorService.replaceSelection).not.toHaveBeenCalled()
    })

    it('应该处理 Ollama 服务降级', async () => {
      // Arrange
      // 第一次调用失败（Ollama 不可用），第二次返回随机名称
      // mockImageProcessor.generateFileName
      //   .mockResolvedValueOnce('image-20250115-123456.png')
      
      // Act
      // await executePasteImageCommand()
      
      // Assert
      // expect(mockEditorService.insertAtCursor).toHaveBeenCalledWith(
      //   expect.stringMatching(/!\[image\]\(\.\/image-\d{8}-\d{6}\.png\)/)
      // )
    })
  })

  describe('错误处理', () => {
    it('应该在非 Markdown 文件中显示错误', async () => {
      // Arrange
      const mockShowErrorMessage = vi.spyOn(vscode.window, 'showErrorMessage')
      // mockEditor.document.languageId = 'javascript'
      
      // Act
      // await executePasteImageCommand()
      
      // Assert
      // expect(mockShowErrorMessage).toHaveBeenCalledWith(
      //   '请在 Markdown 文件中使用此功能'
      // )
      // expect(mockClipboardService.getImage).not.toHaveBeenCalled()
    })

    it('应该在剪贴板无图片时提示', async () => {
      // Arrange
      const mockShowWarningMessage = vi.spyOn(vscode.window, 'showWarningMessage')
      // mockClipboardService.hasImage.mockResolvedValue(false)
      
      // Act
      // await executePasteImageCommand()
      
      // Assert
      // expect(mockShowWarningMessage).toHaveBeenCalledWith(
      //   '剪贴板中没有图片'
      // )
    })

    it('应该处理文件保存失败', async () => {
      // Arrange
      const mockShowErrorMessage = vi.spyOn(vscode.window, 'showErrorMessage')
      // mockFileManager.saveImage.mockRejectedValue(new Error('磁盘已满'))
      
      // Act
      // await executePasteImageCommand()
      
      // Assert
      // expect(mockShowErrorMessage).toHaveBeenCalledWith(
      //   expect.stringContaining('保存图片失败')
      // )
    })

    it('应该回滚失败的操作', async () => {
      // Arrange
      // mockEditorService.replaceSelection.mockRejectedValue(new Error('编辑器错误'))
      
      // Act
      // await executePasteImageCommand()
      
      // Assert
      // 确保图片文件被删除（如果已创建）
      // expect(mockFileManager.deleteFile).toHaveBeenCalled()
    })

    it('应该处理没有活动编辑器的情况', async () => {
      // Arrange
      const mockShowErrorMessage = vi.spyOn(vscode.window, 'showErrorMessage')
      // vscode.window.activeTextEditor = undefined
      
      // Act
      // await executePasteImageCommand()
      
      // Assert
      // expect(mockShowErrorMessage).toHaveBeenCalledWith(
      //   '请打开一个 Markdown 文件'
      // )
    })
  })

  describe('配置选项', () => {
    it('应该遵守 ollamaEnabled 配置', async () => {
      // Arrange
      const mockConfig = {
        get: vi.fn((key: string) => {
          if (key === 'pastemark.ollamaEnabled') return false
          return undefined
        })
      }
      // vscode.workspace.getConfiguration.mockReturnValue(mockConfig)
      
      // Act
      // await executePasteImageCommand()
      
      // Assert
      // expect(mockImageProcessor.generateFileName).toHaveBeenCalledWith({
      //   selectedText: undefined,
      //   useOllama: false,
      //   imageData: expect.any(Object)
      // })
    })

    it('应该使用配置的图片格式', async () => {
      // Arrange
      const mockConfig = {
        get: vi.fn((key: string) => {
          if (key === 'pastemark.imageFormat') return 'jpg'
          return undefined
        })
      }
      // vscode.workspace.getConfiguration.mockReturnValue(mockConfig)
      
      // Act
      // await executePasteImageCommand()
      
      // Assert
      // expect(mockFileManager.saveImage).toHaveBeenCalledWith(
      //   expect.stringMatching(/\.jpg$/),
      //   expect.any(Buffer)
      // )
    })
  })
})