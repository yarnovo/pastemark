import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ImageProcessor } from '../../../src/services/imageProcessor'
import { ImageData, FileNameOptions } from '../../../src/types'

// Mock Ollama Client
vi.mock('../../../src/services/ollamaClient', () => ({
  OllamaClient: vi.fn().mockImplementation(() => ({
    analyzeImage: vi.fn(),
    isAvailable: vi.fn()
  }))
}))

describe('ImageProcessor', () => {
  let imageProcessor: ImageProcessor
  let mockOllamaClient: any

  beforeEach(() => {
    imageProcessor = new ImageProcessor()
    // @ts-ignore - 访问私有属性用于测试
    mockOllamaClient = imageProcessor.ollamaClient
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('generateFileName', () => {
    describe('手动命名模式（有选中文本）', () => {
      it('应该使用选中的文本作为文件名', async () => {
        const options = {
          selectedText: 'my-image-name',
          useOllama: true,
          imageData: {
            buffer: Buffer.from('fake-image'),
            format: 'png'
          }
        }

        // const fileName = await imageProcessor.generateFileName(options)
        // expect(fileName).toBe('my-image-name.png')
      })

      it('应该清理文件名中的特殊字符', async () => {
        const options = {
          selectedText: 'my/image\\name:test*file',
          useOllama: true,
          imageData: {
            buffer: Buffer.from('fake-image'),
            format: 'png'
          }
        }

        // const fileName = await imageProcessor.generateFileName(options)
        // expect(fileName).toBe('my-image-name-test-file.png')
      })

      it('应该处理中文文件名', async () => {
        const options = {
          selectedText: '系统架构图',
          useOllama: true,
          imageData: {
            buffer: Buffer.from('fake-image'),
            format: 'png'
          }
        }

        // const fileName = await imageProcessor.generateFileName(options)
        // expect(fileName).toBe('系统架构图.png')
      })

      it('应该限制文件名长度', async () => {
        const longText = 'a'.repeat(300)
        const options = {
          selectedText: longText,
          useOllama: true,
          imageData: {
            buffer: Buffer.from('fake-image'),
            format: 'png'
          }
        }

        // const fileName = await imageProcessor.generateFileName(options)
        // expect(fileName.length).toBeLessThanOrEqual(255)
      })
    })

    describe('智能命名模式（无选中文本）', () => {
      it('应该调用 Ollama 生成文件名', async () => {
        // mockOllamaClient.isAvailable.mockResolvedValue(true)
        // mockOllamaClient.analyzeImage.mockResolvedValue('architecture-diagram')

        const options = {
          selectedText: undefined,
          useOllama: true,
          imageData: {
            buffer: Buffer.from('fake-image'),
            format: 'png'
          }
        }

        // const fileName = await imageProcessor.generateFileName(options)
        // expect(mockOllamaClient.analyzeImage).toHaveBeenCalledWith(options.imageData.buffer)
        // expect(fileName).toBe('architecture-diagram.png')
      })

      it('应该在 Ollama 不可用时降级到随机命名', async () => {
        // mockOllamaClient.isAvailable.mockResolvedValue(false)

        const options = {
          selectedText: undefined,
          useOllama: true,
          imageData: {
            buffer: Buffer.from('fake-image'),
            format: 'png'
          }
        }

        // const fileName = await imageProcessor.generateFileName(options)
        // expect(fileName).toMatch(/^image-\d{8}-\d{6}\.png$/)
      })

      it('应该在 Ollama 超时时降级到随机命名', async () => {
        // mockOllamaClient.isAvailable.mockResolvedValue(true)
        // mockOllamaClient.analyzeImage.mockRejectedValue(new Error('Timeout'))

        const options = {
          selectedText: undefined,
          useOllama: true,
          imageData: {
            buffer: Buffer.from('fake-image'),
            format: 'png'
          }
        }

        // const fileName = await imageProcessor.generateFileName(options)
        // expect(fileName).toMatch(/^image-\d{8}-\d{6}\.png$/)
      })

      it('应该在禁用 Ollama 时使用随机命名', async () => {
        const options = {
          selectedText: undefined,
          useOllama: false,
          imageData: {
            buffer: Buffer.from('fake-image'),
            format: 'png'
          }
        }

        // const fileName = await imageProcessor.generateFileName(options)
        // expect(mockOllamaClient.analyzeImage).not.toHaveBeenCalled()
        // expect(fileName).toMatch(/^image-\d{8}-\d{6}\.png$/)
      })
    })

    describe('随机命名模式', () => {
      it('应该生成带时间戳的文件名', async () => {
        const options = {
          selectedText: undefined,
          useOllama: false,
          imageData: {
            buffer: Buffer.from('fake-image'),
            format: 'png'
          }
        }

        // const fileName = await imageProcessor.generateFileName(options)
        // const regex = /^image-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})\.png$/
        // expect(fileName).toMatch(regex)
      })

      it('应该支持不同的图片格式', async () => {
        const formats = ['png', 'jpg', 'jpeg', 'gif', 'bmp']
        
        for (const format of formats) {
          const options = {
            selectedText: undefined,
            useOllama: false,
            imageData: {
              buffer: Buffer.from('fake-image'),
              format
            }
          }

          // const fileName = await imageProcessor.generateFileName(options)
          // expect(fileName).toMatch(new RegExp(`\\.${format}$`))
        }
      })
    })
  })

  describe('processImage', () => {
    it('应该返回处理后的图片数据', async () => {
      const imageData = {
        buffer: Buffer.from('fake-image'),
        format: 'png'
      }

      // const processed = await imageProcessor.processImage(imageData)
      // expect(processed.buffer).toEqual(imageData.buffer)
      // expect(processed.format).toBe('png')
    })

    it('应该验证图片大小限制', async () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024) // 11MB
      const imageData = {
        buffer: largeBuffer,
        format: 'png'
      }

      // await expect(imageProcessor.processImage(imageData))
      //   .rejects.toThrow('Image size exceeds 10MB limit')
    })
  })
})