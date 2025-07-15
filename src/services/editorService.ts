import * as vscode from 'vscode';
import { TextSelection } from '../types';

export class EditorService {
  /**
   * 获取当前选中的文本
   */
  getSelection(): TextSelection | null {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return null;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      return null;
    }

    const text = editor.document.getText(selection);
    return {
      text,
      range: selection,
    };
  }

  /**
   * 替换选中的文本
   */
  async replaceSelection(text: string): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      throw new Error('No active editor');
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      throw new Error('No selection to replace');
    }

    await editor.edit((editBuilder) => {
      editBuilder.replace(selection, text);
    });
  }

  /**
   * 在光标位置插入文本
   */
  async insertAtCursor(text: string): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      throw new Error('No active editor');
    }

    const position = editor.selection.active;
    await editor.edit((editBuilder) => {
      editBuilder.insert(position, text);
    });
  }

  /**
   * 获取当前编辑器
   */
  getActiveEditor(): vscode.TextEditor | undefined {
    return vscode.window.activeTextEditor;
  }

  /**
   * 检查是否为 Markdown 文件
   */
  isMarkdownFile(): boolean {
    const editor = this.getActiveEditor();
    if (!editor) {
      return false;
    }

    return editor.document.languageId === 'markdown';
  }

  /**
   * 获取当前文档路径
   */
  getDocumentPath(): string | null {
    const editor = this.getActiveEditor();
    if (!editor) {
      return null;
    }

    return editor.document.uri.fsPath;
  }

  /**
   * 构建 Markdown 图片语法
   */
  buildMarkdownImage(altText: string, imagePath: string): string {
    // 确保路径使用正斜杠
    const normalizedPath = imagePath.replace(/\\/g, '/');
    return `![${altText}](${normalizedPath})`;
  }
}
