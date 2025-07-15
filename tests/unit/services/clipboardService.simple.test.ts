import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock vscode module before importing
vi.mock('vscode', () => ({
  env: {
    clipboard: {
      readText: vi.fn()
    }
  }
}))

import { ClipboardService } from '../../../src/services/clipboardService'
import * as vscode from 'vscode'

describe('ClipboardService - Simple Tests', () => {
  let service: ClipboardService
  let mockReadText: any

  beforeEach(() => {
    service = new ClipboardService()
    mockReadText = vi.mocked(vscode.env.clipboard.readText)
    vi.clearAllMocks()
  })

  it('should detect PNG image in clipboard', async () => {
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    mockReadText.mockResolvedValue(`data:image/png;base64,${pngBase64}`)
    
    const hasImage = await service.hasImage()
    expect(hasImage).toBe(true)
  })

  it('should return false when clipboard is empty', async () => {
    mockReadText.mockResolvedValue('')
    
    const hasImage = await service.hasImage()
    expect(hasImage).toBe(false)
  })

  it('should return false for plain text', async () => {
    mockReadText.mockResolvedValue('Hello World')
    
    const hasImage = await service.hasImage()
    expect(hasImage).toBe(false)
  })

  it('should extract image data from data URL', async () => {
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    mockReadText.mockResolvedValue(`data:image/png;base64,${pngBase64}`)
    
    const imageData = await service.getImage()
    expect(imageData).not.toBeNull()
    expect(imageData?.format).toBe('png')
    expect(imageData?.buffer).toBeInstanceOf(Buffer)
  })

  it('should handle clipboard read errors gracefully', async () => {
    mockReadText.mockRejectedValue(new Error('Clipboard error'))
    
    const hasImage = await service.hasImage()
    expect(hasImage).toBe(false)
  })
})