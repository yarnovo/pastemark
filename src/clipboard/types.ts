/**
 * 剪贴板图片数据
 */
export interface ClipboardImageData {
  buffer: Buffer;
  format: 'png' | 'jpg' | 'gif' | 'bmp' | 'webp';
}

/**
 * 平台特定的剪贴板接口
 */
export interface IPlatformClipboard {
  /**
   * 检查剪贴板是否包含图片
   */
  hasImage(): Promise<boolean>;

  /**
   * 获取剪贴板中的图片
   */
  getImage(): Promise<ClipboardImageData | null>;

  /**
   * 清理临时资源
   */
  cleanup(): Promise<void>;
}

/**
 * 剪贴板管理器接口
 */
export interface IClipboardManager {
  /**
   * 检查剪贴板是否包含图片
   */
  hasImage(): Promise<boolean>;

  /**
   * 获取剪贴板中的图片
   */
  getImage(): Promise<ClipboardImageData | null>;

  /**
   * 清理临时资源
   */
  cleanup(): Promise<void>;
}
