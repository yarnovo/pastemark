/**
 * 统一的消息管理
 *
 * 所有用户通知消息都在这里定义，方便统一维护和国际化
 */

export const MESSAGES = {
  // 错误消息
  ERROR: {
    NOT_MARKDOWN_FILE: 'Please use this feature in Markdown files',
    NO_IMAGE_IN_CLIPBOARD: 'No image found in clipboard',
    FAILED_TO_READ_IMAGE: 'Failed to read image from clipboard',
    NO_DOCUMENT_PATH: 'Unable to get current document path',
    FAILED_TO_SAVE_IMAGE: 'Failed to save image',
    FAILED_TO_INSERT_IMAGE: 'Failed to insert image reference',
    FAILED_TO_PASTE_IMAGE: 'Failed to paste image',
  },

  // 警告消息
  WARNING: {
    NO_IMAGE_IN_CLIPBOARD: 'No image found in clipboard',
  },

  // 信息消息
  INFO: {
    IMAGE_SAVED: 'Image saved',
  },

  // 进度消息
  PROGRESS: {
    GENERATING_FILENAME: 'Generating filename',
    ANALYZING_IMAGE: 'Analyzing image',
    FILENAME_GENERATED: 'Filename generated',
    USING_FALLBACK_NAMING: 'Using fallback naming',
  },
} as const;

// 消息类型定义
export type MessageType = 'error' | 'warning' | 'info';

// 消息工具函数
export class MessageUtils {
  /**
   * 格式化错误消息
   */
  static formatError(message: string, error?: unknown): string {
    const errorDetail = error instanceof Error ? error.message : String(error);
    return `${message}: ${errorDetail}`;
  }

  /**
   * 格式化信息消息
   */
  static formatInfo(message: string, detail?: string): string {
    return detail ? `${message}: ${detail}` : message;
  }
}
