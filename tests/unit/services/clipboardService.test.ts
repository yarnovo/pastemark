import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ClipboardService } from '@/services/clipboardService'

// Mock vscode.env.clipboard
vi.mock('vscode', () => ({
  env: {
    clipboard: {
      readText: vi.fn(),
      writeText: vi.fn()
    }
  }
}))

describe('ClipboardService', () => {
  let clipboardService: ClipboardService
  let mockClipboard: any

  beforeEach(() => {
    // 这里会在实际实现后导入
    // clipboardService = new ClipboardService()
    // mockClipboard = vscode.env.clipboard
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('hasImage', () => {
    it('应该在剪贴板包含图片时返回 true', async () => {
      // 模拟剪贴板包含 base64 图片数据
      // mockClipboard.readText.mockResolvedValue('data:image/png;base64,iVBORw0KG...')
      
      // const result = await clipboardService.hasImage()
      // expect(result).toBe(true)
    })

    it('应该在剪贴板为空时返回 false', async () => {
      // mockClipboard.readText.mockResolvedValue('')
      
      // const result = await clipboardService.hasImage()
      // expect(result).toBe(false)
    })

    it('应该在剪贴板只有普通文本时返回 false', async () => {
      // mockClipboard.readText.mockResolvedValue('Hello World')
      
      // const result = await clipboardService.hasImage()
      // expect(result).toBe(false)
    })

    it('应该处理剪贴板读取错误', async () => {
      // mockClipboard.readText.mockRejectedValue(new Error('Clipboard error'))
      
      // const result = await clipboardService.hasImage()
      // expect(result).toBe(false)
    })
  })

  describe('getImage', () => {
    it('应该返回 PNG 格式的图片数据', async () => {
      const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      // mockClipboard.readText.mockResolvedValue(`data:image/png;base64,${base64Data}`)
      
      // const result = await clipboardService.getImage()
      // expect(result).not.toBeNull()
      // expect(result?.format).toBe('png')
      // expect(result?.buffer).toBeInstanceOf(Buffer)
    })

    it('应该返回 JPEG 格式的图片数据', async () => {
      const base64Data = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAE...'
      // mockClipboard.readText.mockResolvedValue(`data:image/jpeg;base64,${base64Data}`)
      
      // const result = await clipboardService.getImage()
      // expect(result).not.toBeNull()
      // expect(result?.format).toBe('jpeg')
    })

    it('应该在没有图片时返回 null', async () => {
      // mockClipboard.readText.mockResolvedValue('Not an image')
      
      // const result = await clipboardService.getImage()
      // expect(result).toBeNull()
    })

    it('应该处理损坏的 base64 数据', async () => {
      // mockClipboard.readText.mockResolvedValue('data:image/png;base64,invalid-base64')
      
      // const result = await clipboardService.getImage()
      // expect(result).toBeNull()
    })

    it('应该支持不带 data URL 前缀的 base64 数据', async () => {
      const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      // mockClipboard.readText.mockResolvedValue(base64Data)
      
      // const result = await clipboardService.getImage()
      // expect(result).not.toBeNull()
      // expect(result?.format).toBe('png') // 应该能检测到 PNG 格式
    })
  })

  describe('WSL2 兼容性', () => {
    it('应该在 WSL2 环境下正常工作', async () => {
      // 设置环境变量模拟 WSL2
      process.env.WSL_DISTRO_NAME = 'Ubuntu'
      
      const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      // mockClipboard.readText.mockResolvedValue(`data:image/png;base64,${base64Data}`)
      
      // const result = await clipboardService.getImage()
      // expect(result).not.toBeNull()
      
      delete process.env.WSL_DISTRO_NAME
    })
  })
})