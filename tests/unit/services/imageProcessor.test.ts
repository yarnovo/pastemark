import { describe, it, expect, vi } from 'vitest'
import { ImageProcessor } from '../../../src/services/imageProcessor'

// Mock vscode module
vi.mock('vscode', () => ({
  workspace: {
    getConfiguration: vi.fn(() => ({
      get: vi.fn((key: string) => {
        const defaults: Record<string, any> = {
          'imageFormat': 'png'
        }
        return defaults[key]
      })
    }))
  }
}))

// Mock OllamaClient
vi.mock('../../../src/services/ollamaClient', () => ({
  OllamaClient: vi.fn().mockImplementation(() => ({
    analyzeImage: vi.fn().mockResolvedValue('test-image'),
    isAvailable: vi.fn().mockResolvedValue(true)
  }))
}))

describe('ImageProcessor - Simple Tests', () => {
  it('should generate filename from selected text', async () => {
    const processor = new ImageProcessor()
    
    const fileName = await processor.generateFileName({
      selectedText: 'my-test-image',
      useOllama: false,
      imageData: {
        buffer: Buffer.from('test'),
        format: 'png'
      }
    })
    
    expect(fileName).toBe('my-test-image.png')
  })

  it('should generate timestamp filename when no text selected', async () => {
    const processor = new ImageProcessor()
    
    const fileName = await processor.generateFileName({
      selectedText: undefined,
      useOllama: false,
      imageData: {
        buffer: Buffer.from('test'),
        format: 'png'
      }
    })
    
    expect(fileName).toMatch(/^image-\d{8}-\d{6}\.png$/)
  })

  it('should reject images larger than 10MB', async () => {
    const processor = new ImageProcessor()
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024)
    
    await expect(processor.processImage({
      buffer: largeBuffer,
      format: 'png'
    })).rejects.toThrow('Image size exceeds 10MB limit')
  })
})