import { Buffer } from 'buffer'

/**
 * 测试用图片数据
 */
export const TestImages = {
  // 1x1 透明 PNG (最小有效图片)
  smallPng: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
  ),

  // 1x1 红色 JPEG
  smallJpg: Buffer.from(
    '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCmAA8A/9k=',
    'base64'
  ),

  // 创建指定大小的图片
  createImage: (sizeMB: number): Buffer => {
    const size = sizeMB * 1024 * 1024
    const buffer = Buffer.alloc(size)
    
    // PNG 文件头
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    ])
    
    pngHeader.copy(buffer, 0)
    return buffer
  },

  // 超过限制的大图片 (11MB)
  get largePng(): Buffer {
    return this.createImage(11)
  }
}

/**
 * 测试用文件名
 */
export const TestFileNames = {
  // 正常文件名
  normal: [
    'screenshot',
    'ui-mockup', 
    'architecture-diagram',
    'user-interface-design'
  ],

  // 中文文件名
  chinese: [
    '系统架构图',
    '用户界面',
    '数据流程图',
    '产品原型'
  ],

  // 特殊字符文件名
  special: [
    'test/file\\name',
    'image:with*special?chars',
    'file<with>pipes|quotes"',
    '../../../etc/passwd', // 路径注入测试
    'CON', // Windows 保留字
    'PRN', // Windows 保留字
  ],

  // 边界情况
  edge: {
    empty: '',
    onlySpaces: '   ',
    onlySpecialChars: '///\\\\:::**??',
    tooLong: 'a'.repeat(300),
    unicode: '🖼️📸🎨💻',
    mixed: 'test-图片-🖼️-file'
  }
}

/**
 * 用户配置场景
 */
export const UserConfigs = {
  // 新手用户：默认配置
  novice: {
    'pastemark.ollamaEnabled': false,
    'pastemark.imagePath': './',
    'pastemark.imageFormat': 'png'
  },

  // 高级用户：启用 Ollama
  advanced: {
    'pastemark.ollamaEnabled': true,
    'pastemark.ollamaEndpoint': 'http://localhost:11434',
    'pastemark.ollamaModel': 'llava',
    'pastemark.ollamaPrompt': 'Analyze this image and provide a short, descriptive filename (2-4 words, English, use hyphens to separate words, no file extension).',
    'pastemark.imagePath': './images/',
    'pastemark.imageFormat': 'png'
  },

  // 开发者：自定义配置
  developer: {
    'pastemark.ollamaEnabled': true,
    'pastemark.ollamaModel': 'qwen2-vl',
    'pastemark.ollamaPrompt': 'Generate a technical filename using programming conventions (lowercase, underscores, descriptive, no file extension).',
    'pastemark.imagePath': './assets/screenshots/',
    'pastemark.imageFormat': 'jpg'
  },

  // 中文用户：中文提示词
  chinese: {
    'pastemark.ollamaEnabled': true,
    'pastemark.ollamaModel': 'qwen2-vl',
    'pastemark.ollamaPrompt': '分析这个图片并提供一个简短的描述性文件名（2-4个词，中文，用连字符分隔，不要扩展名）。',
    'pastemark.imagePath': './图片/',
    'pastemark.imageFormat': 'png'
  }
}

/**
 * 测试文档内容
 */
export const TestDocuments = {
  // 空的 Markdown 文档
  empty: '# 测试文档\n\n',

  // 带有内容的 Markdown 文档
  withContent: `# 项目文档

## 概述

这是一个测试文档，用于验证 PasteMark 功能。

## 功能特性

在这里插入图片：

`,

  // 技术文档
  technical: `# API 文档

## 端点说明

### POST /api/upload

上传图片的端点。

#### 请求参数

参数说明：

#### 响应格式

响应示例：

`,

  // 非 Markdown 文档
  nonMarkdown: `console.log('这是一个 JavaScript 文件')
function test() {
  return 'test'
}`
}

/**
 * Ollama 模拟响应
 */
export const MockOllamaResponses = {
  // 成功响应
  success: {
    model: 'llava',
    created_at: '2025-01-15T12:00:00Z',
    response: 'architecture-diagram',
    done: true
  },

  // 中文响应
  chinese: {
    model: 'qwen2-vl',
    created_at: '2025-01-15T12:00:00Z',
    response: '系统架构图',
    done: true
  },

  // 技术风格响应
  technical: {
    model: 'qwen2-vl',
    created_at: '2025-01-15T12:00:00Z',
    response: 'api_endpoint_diagram',
    done: true
  },

  // 错误响应
  error: {
    error: 'model not found'
  },

  // 无效响应
  invalid: {
    model: 'llava',
    response: '!!!///invalid:::filename***',
    done: true
  },

  // 空响应
  empty: {
    model: 'llava',
    response: '',
    done: true
  }
}

/**
 * 测试工作区设置
 */
export const TestWorkspace = {
  // 临时目录名
  tempDir: 'pastemark-e2e-test',
  
  // 测试文件
  files: {
    markdown: 'test.md',
    javascript: 'test.js',
    readonly: 'readonly.md'
  },

  // 图片目录
  imageDir: 'images',

  // 清理模式
  cleanup: {
    after: true,     // 测试后清理
    onError: false   // 出错时保留用于调试
  }
}