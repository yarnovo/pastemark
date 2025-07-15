/**
 * 清理文件名，移除特殊字符
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || fileName.trim() === '') {
    return 'untitled';
  }

  // 替换特殊字符为连字符
  const sanitized = fileName
    .replace(/[/\\:*?"<>|]/g, '-') // 替换文件系统不允许的字符
    .replace(/\s+/g, '-') // 替换空白字符
    .replace(/-+/g, '-') // 合并多个连字符
    .replace(/^-+|-+$/g, ''); // 移除首尾的连字符

  // 如果清理后为空，返回默认值
  if (sanitized === '') {
    return 'untitled';
  }

  return sanitized;
}

/**
 * 截断文件名到指定长度，保留扩展名
 */
export function truncateFileName(fileName: string, maxLength: number): string {
  if (fileName.length <= maxLength) {
    return fileName;
  }

  const lastDotIndex = fileName.lastIndexOf('.');
  const hasExtension = lastDotIndex > 0 && lastDotIndex < fileName.length - 1;

  if (hasExtension) {
    const name = fileName.substring(0, lastDotIndex);
    const extension = fileName.substring(lastDotIndex);
    const maxNameLength = maxLength - extension.length - 3; // 3 for '...'

    if (maxNameLength > 0) {
      return name.substring(0, maxNameLength) + '...' + extension;
    }
  }

  // 没有扩展名或名称太短
  return fileName.substring(0, maxLength - 3) + '...';
}

/**
 * 生成时间戳文件名
 */
export function generateTimestampFileName(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');

  return `image-${year}${month}${day}-${hour}${minute}${second}`;
}
