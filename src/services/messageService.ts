import * as vscode from 'vscode';
import { MESSAGES, MessageUtils } from '../constants/messages';

/**
 * 消息服务类
 *
 * 统一管理所有用户通知，提供类型安全的消息显示方法
 */
export class MessageService {
  private outputChannel?: vscode.OutputChannel;

  constructor(outputChannel?: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  /**
   * 显示错误消息
   */
  showError(message: string, error?: unknown): void {
    const errorMsg = error ? MessageUtils.formatError(message, error) : message;
    vscode.window.showErrorMessage(errorMsg);
    this.log('ERROR', errorMsg);
  }

  /**
   * 显示警告消息
   */
  showWarning(message: string): void {
    vscode.window.showWarningMessage(message);
    this.log('WARNING', message);
  }

  /**
   * 显示信息消息
   */
  showInfo(message: string, detail?: string): void {
    const infoMsg = MessageUtils.formatInfo(message, detail);
    vscode.window.showInformationMessage(infoMsg);
    this.log('INFO', infoMsg);
  }

  /**
   * 显示进度消息
   */
  showProgress<T>(
    title: string,
    task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>
  ): Thenable<T> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title,
        cancellable: false,
      },
      task
    );
  }

  /**
   * 便捷方法：显示常用错误消息
   */
  showNotMarkdownFileError(): void {
    this.showError(MESSAGES.ERROR.NOT_MARKDOWN_FILE);
  }

  showNoImageInClipboardWarning(): void {
    this.showWarning(MESSAGES.WARNING.NO_IMAGE_IN_CLIPBOARD);
  }

  showFailedToReadImageError(): void {
    this.showError(MESSAGES.ERROR.FAILED_TO_READ_IMAGE);
  }

  showNoDocumentPathError(): void {
    this.showError(MESSAGES.ERROR.NO_DOCUMENT_PATH);
  }

  showFailedToSaveImageError(error?: unknown): void {
    this.showError(MESSAGES.ERROR.FAILED_TO_SAVE_IMAGE, error);
  }

  showFailedToInsertImageError(error?: unknown): void {
    this.showError(MESSAGES.ERROR.FAILED_TO_INSERT_IMAGE, error);
  }

  showFailedToPasteImageError(error?: unknown): void {
    this.showError(MESSAGES.ERROR.FAILED_TO_PASTE_IMAGE, error);
  }

  showImageSavedInfo(fileName: string): void {
    this.showInfo(MESSAGES.INFO.IMAGE_SAVED, fileName);
  }

  /**
   * 便捷方法：显示生成文件名的进度
   */
  showGenerateFileNameProgress<T>(
    task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>
  ): Thenable<T> {
    return this.showProgress(MESSAGES.PROGRESS.GENERATING_FILENAME, task);
  }

  /**
   * 内部日志方法
   */
  private log(level: string, message: string): void {
    if (this.outputChannel) {
      this.outputChannel.appendLine(`[MessageService] ${level}: ${message}`);
    }
    console.log(`[PasteMark][MessageService] ${level}:`, message);
  }
}
