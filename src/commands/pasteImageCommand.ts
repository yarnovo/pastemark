import * as vscode from 'vscode';
import * as path from 'path';
import { ClipboardManager } from '../clipboard/clipboardManager';
import { ImageProcessor } from '../services/imageProcessor';
import { FileManager } from '../services/fileManager';
import { EditorService } from '../services/editorService';
import { MessageService } from '../services/messageService';
import { MESSAGES } from '../constants/messages';

export class PasteImageCommand {
  private clipboardManager: ClipboardManager;
  private imageProcessor: ImageProcessor;
  private fileManager: FileManager;
  private editorService: EditorService;
  private messageService: MessageService;
  private outputChannel?: vscode.OutputChannel;

  constructor(extensionPath: string, outputChannel?: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
    this.messageService = new MessageService(outputChannel);
    this.clipboardManager = new ClipboardManager(extensionPath, outputChannel);
    this.imageProcessor = new ImageProcessor();
    this.fileManager = new FileManager();
    this.editorService = new EditorService();
  }

  /**
   * 执行粘贴图片命令
   */
  async execute(): Promise<void> {
    try {
      // 1. 检查是否在 Markdown 文件中
      if (!this.editorService.isMarkdownFile()) {
        this.messageService.showNotMarkdownFileError();
        return;
      }

      // 2. 检查剪贴板是否有图片
      this.log('Checking clipboard for image...');
      const hasImage = await this.clipboardManager.hasImage();
      if (!hasImage) {
        this.messageService.showNoImageInClipboardWarning();
        return;
      }

      // 3. 获取图片数据
      this.log('Reading clipboard image...');
      const imageData = await this.clipboardManager.getImage();
      if (!imageData) {
        this.messageService.showFailedToReadImageError();
        return;
      }
      this.log(
        `Successfully read image: ${imageData.buffer.length} bytes, format: ${imageData.format}`
      );

      // 4. 获取选中的文本（如果有）
      const selection = this.editorService.getSelection();
      const selectedText = selection?.text;

      // 5. 获取配置
      const config = vscode.workspace.getConfiguration('pastemark');
      const useOllama = config.get<boolean>('ollamaEnabled', true);
      const imagePath = config.get<string>('imagePath', './');

      // 6. 生成文件名
      const fileName = await this.generateFileNameWithProgress({
        selectedText,
        useOllama,
        imageData,
      });

      // 7. 构建保存路径
      const documentPath = this.editorService.getDocumentPath();
      if (!documentPath) {
        this.messageService.showNoDocumentPathError();
        return;
      }

      const fullImagePath = this.fileManager.buildImagePath(documentPath, fileName, imagePath);
      const uniqueImagePath = await this.fileManager.ensureUniqueFileName(fullImagePath);

      // 8. 保存图片
      let savedImagePath: string | null = null;
      try {
        await this.fileManager.saveImage(uniqueImagePath, imageData.buffer);
        savedImagePath = uniqueImagePath;
      } catch (error) {
        this.messageService.showFailedToSaveImageError(error);
        return;
      }

      // 9. 生成 Markdown 语法
      const relativePath = this.fileManager.getRelativePath(documentPath, uniqueImagePath);
      const altText = selectedText || path.basename(uniqueImagePath, path.extname(uniqueImagePath));
      const markdownImage = this.editorService.buildMarkdownImage(altText, `./${relativePath}`);

      // 10. 插入或替换文本
      try {
        if (selection) {
          await this.editorService.replaceSelection(markdownImage);
        } else {
          await this.editorService.insertAtCursor(markdownImage);
        }
      } catch (error) {
        // 如果插入失败，删除已保存的图片
        if (savedImagePath) {
          await this.fileManager.deleteFile(savedImagePath);
        }
        this.messageService.showFailedToInsertImageError(error);
        return;
      }

      // 11. 显示成功消息
      this.messageService.showImageSavedInfo(path.basename(uniqueImagePath));

      // 12. 清理临时文件
      await this.clipboardManager.cleanup();
    } catch (error) {
      this.logError('PasteImageCommand error', error);
      this.messageService.showFailedToPasteImageError(error);

      // 清理临时文件
      try {
        await this.clipboardManager.cleanup();
      } catch (cleanupError) {
        this.logError('Cleanup error', cleanupError);
      }
    }
  }

  /**
   * 生成文件名（带进度提示）
   */
  private async generateFileNameWithProgress(options: {
    selectedText?: string;
    useOllama: boolean;
    imageData: import('../types').ImageData;
  }): Promise<string> {
    const { selectedText, useOllama, imageData } = options;

    // 如果有选中文本或不使用 Ollama，直接调用原方法
    if (selectedText?.trim() || !useOllama) {
      return this.imageProcessor.generateFileName({
        selectedText,
        useOllama,
        imageData,
      });
    }

    // 使用 Ollama 时显示进度提示
    return this.messageService.showGenerateFileNameProgress(async (progress) => {
      progress.report({ increment: 0, message: MESSAGES.PROGRESS.ANALYZING_IMAGE });

      try {
        const fileName = await this.imageProcessor.generateFileName({
          selectedText,
          useOllama,
          imageData,
        });

        progress.report({ increment: 100, message: MESSAGES.PROGRESS.FILENAME_GENERATED });
        return fileName;
      } catch (error) {
        progress.report({ increment: 100, message: MESSAGES.PROGRESS.USING_FALLBACK_NAMING });
        throw error;
      }
    });
  }

  private log(message: string): void {
    if (this.outputChannel) {
      this.outputChannel.appendLine(`[PasteImageCommand] ${message}`);
    }
    console.log(`[PasteMark][PasteImageCommand] ${message}`);
  }

  private logError(message: string, error?: unknown): void {
    const errorMsg = error
      ? `${message}: ${error instanceof Error ? error.message : String(error)}`
      : message;
    if (this.outputChannel) {
      this.outputChannel.appendLine(`[PasteImageCommand] ERROR: ${errorMsg}`);
    }
    console.error(`[PasteMark][PasteImageCommand] ERROR:`, errorMsg);
  }
}
