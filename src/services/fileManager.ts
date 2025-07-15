import * as vscode from 'vscode';
import * as path from 'path';

export class FileManager {
  /**
   * 保存图片到文件系统
   */
  async saveImage(filePath: string, data: Buffer): Promise<void> {
    try {
      const uri = vscode.Uri.file(filePath);

      // 确保目录存在
      const dir = path.dirname(filePath);
      const dirUri = vscode.Uri.file(dir);

      try {
        await vscode.workspace.fs.stat(dirUri);
      } catch {
        // 目录不存在，创建它
        await vscode.workspace.fs.createDirectory(dirUri);
      }

      // 写入文件
      await vscode.workspace.fs.writeFile(uri, data);
    } catch (error: any) {
      if (error.message?.includes('ENOSPC')) {
        throw new Error('No space left on device');
      } else if (error.message?.includes('Permission') || error.message?.includes('EACCES')) {
        throw new Error('Permission denied');
      }
      throw error;
    }
  }

  /**
   * 确保文件名唯一
   */
  async ensureUniqueFileName(basePath: string): Promise<string> {
    let filePath = basePath;
    let counter = 0;

    while (await this.fileExists(filePath)) {
      counter++;
      const dir = path.dirname(basePath);
      const ext = path.extname(basePath);
      const nameWithoutExt = path.basename(basePath, ext);
      filePath = path.join(dir, `${nameWithoutExt}-${counter}${ext}`);
    }

    return filePath;
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const uri = vscode.Uri.file(filePath);
      const stat = await vscode.workspace.fs.stat(uri);
      return stat.type === vscode.FileType.File;
    } catch {
      return false;
    }
  }

  /**
   * 删除文件（用于回滚）
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const uri = vscode.Uri.file(filePath);
      await vscode.workspace.fs.delete(uri);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  }

  /**
   * 获取相对路径
   */
  getRelativePath(fromPath: string, toPath: string): string {
    return path.relative(path.dirname(fromPath), toPath).replace(/\\/g, '/');
  }

  /**
   * 构建图片保存路径
   */
  buildImagePath(documentPath: string, fileName: string, imagePath: string = './'): string {
    const docDir = path.dirname(documentPath);

    // 如果配置的路径是相对路径
    if (!path.isAbsolute(imagePath)) {
      return path.join(docDir, imagePath, fileName);
    }

    // 如果是绝对路径
    return path.join(imagePath, fileName);
  }
}
