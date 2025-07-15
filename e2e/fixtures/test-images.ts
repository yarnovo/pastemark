// 测试用的图片数据
export const testImages = {
  // 1x1 透明 PNG
  smallPng: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
  ),
  
  // 1x1 红色 JPEG
  smallJpg: Buffer.from(
    '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCmAA8A/9k=',
    'base64'
  ),
  
  // 创建大图片的函数（用于测试大小限制）
  createLargeImage: (sizeMB: number): Buffer => {
    const size = sizeMB * 1024 * 1024
    const buffer = Buffer.alloc(size)
    
    // PNG 文件头
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    ])
    
    pngHeader.copy(buffer, 0)
    return buffer
  },
  
  // 模拟剪贴板数据格式
  toClipboardFormat: (buffer: Buffer, format: string): string => {
    return `data:image/${format};base64,${buffer.toString('base64')}`
  }
}

// 测试文件名
export const testFileNames = {
  normal: ['test-image', 'my-screenshot', 'architecture-diagram'],
  chinese: ['系统架构图', '用户界面', '数据流程图'],
  special: [
    'test/file\\name',
    'image:with*special?chars',
    'file<with>pipes|quotes"',
    '../../../etc/passwd', // 路径注入测试
  ],
  long: 'a'.repeat(300), // 超长文件名
  empty: '',
  onlySpaces: '   ',
  onlySpecialChars: '///\\\\:::**??'
}

// Ollama 模拟响应
export const mockOllamaResponses = {
  success: {
    model: 'llava',
    created_at: '2025-01-15T12:00:00Z',
    response: 'architecture-diagram',
    done: true
  },
  
  timeout: new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), 3000)
  }),
  
  error: {
    error: 'model not found'
  },
  
  invalidResponse: {
    model: 'llava',
    response: '!!!///invalid:::filename***',
    done: true
  }
}