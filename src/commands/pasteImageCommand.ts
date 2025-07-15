import * as vscode from 'vscode'
import * as path from 'path'
import { ClipboardService } from '../services/clipboardService'
import { ImageProcessor } from '../services/imageProcessor'
import { FileManager } from '../services/fileManager'
import { EditorService } from '../services/editorService'

export class PasteImageCommand {
  private clipboardService: ClipboardService
  private imageProcessor: ImageProcessor
  private fileManager: FileManager
  private editorService: EditorService

  constructor() {
    this.clipboardService = new ClipboardService()
    this.imageProcessor = new ImageProcessor()
    this.fileManager = new FileManager()
    this.editorService = new EditorService()
  }

  /**
   * 执行粘贴图片命令
   */
  async execute(): Promise<void> {
    try {
      // 1. 检查是否在 Markdown 文件中
      if (!this.editorService.isMarkdownFile()) {
        vscode.window.showErrorMessage('请在 Markdown 文件中使用此功能')
        return
      }

      // 2. 检查剪贴板是否有图片
      const hasImage = await this.clipboardService.hasImage()
      if (!hasImage) {
        vscode.window.showWarningMessage('剪贴板中没有图片')
        return
      }

      // 3. 获取图片数据
      const imageData = await this.clipboardService.getImage()
      if (!imageData) {
        vscode.window.showErrorMessage('无法读取剪贴板中的图片')
        return
      }

      // 4. 获取选中的文本（如果有）
      const selection = this.editorService.getSelection()
      const selectedText = selection?.text

      // 5. 获取配置
      const config = vscode.workspace.getConfiguration('pastemark')
      const useOllama = config.get<boolean>('ollamaEnabled', true)
      const imagePath = config.get<string>('imagePath', './')

      // 6. 生成文件名
      const fileName = await this.imageProcessor.generateFileName({
        selectedText,
        useOllama,
        imageData
      })

      // 7. 构建保存路径
      const documentPath = this.editorService.getDocumentPath()
      if (!documentPath) {
        vscode.window.showErrorMessage('无法获取当前文档路径')
        return
      }

      const fullImagePath = this.fileManager.buildImagePath(documentPath, fileName, imagePath)
      const uniqueImagePath = await this.fileManager.ensureUniqueFileName(fullImagePath)

      // 8. 保存图片
      let savedImagePath: string | null = null
      try {
        await this.fileManager.saveImage(uniqueImagePath, imageData.buffer)
        savedImagePath = uniqueImagePath
      } catch (error: any) {
        vscode.window.showErrorMessage(`保存图片失败: ${error.message}`)
        return
      }

      // 9. 生成 Markdown 语法
      const relativePath = this.fileManager.getRelativePath(documentPath, uniqueImagePath)
      const altText = selectedText || path.basename(uniqueImagePath, path.extname(uniqueImagePath))
      const markdownImage = this.editorService.buildMarkdownImage(altText, `./${relativePath}`)

      // 10. 插入或替换文本
      try {
        if (selection) {
          await this.editorService.replaceSelection(markdownImage)
        } else {
          await this.editorService.insertAtCursor(markdownImage)
        }
      } catch (error: any) {
        // 如果插入失败，删除已保存的图片
        if (savedImagePath) {
          await this.fileManager.deleteFile(savedImagePath)
        }
        vscode.window.showErrorMessage(`插入图片引用失败: ${error.message}`)
        return
      }

      // 11. 显示成功消息
      vscode.window.showInformationMessage(`图片已保存: ${path.basename(uniqueImagePath)}`)

    } catch (error: any) {
      console.error('PasteImageCommand error:', error)
      vscode.window.showErrorMessage(`粘贴图片失败: ${error.message}`)
    }
  }
}