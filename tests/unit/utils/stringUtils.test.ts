import { describe, it, expect } from 'vitest'
import { sanitizeFileName, truncateFileName, generateTimestampFileName } from '../../../src/utils/stringUtils'

describe('String Utils', () => {
  describe('sanitizeFileName', () => {
    it('should remove special characters', () => {
      const input = 'my/file\\name:test*file?.png'
      const result = sanitizeFileName(input)
      expect(result).toBe('my-file-name-test-file-.png')
    })

    it('should preserve Chinese characters', () => {
      const input = '系统架构图.png'
      const result = sanitizeFileName(input)
      expect(result).toBe('系统架构图.png')
    })

    it('should handle empty string', () => {
      const result = sanitizeFileName('')
      expect(result).toBe('untitled')
    })

    it('should handle only special characters', () => {
      const result = sanitizeFileName('///***//')
      expect(result).toBe('untitled')
    })
  })

  describe('truncateFileName', () => {
    it('should keep short filenames unchanged', () => {
      const result = truncateFileName('short.png', 255)
      expect(result).toBe('short.png')
    })

    it('should truncate long filenames but keep extension', () => {
      const longName = 'a'.repeat(300) + '.png'
      const result = truncateFileName(longName, 255)
      expect(result.length).toBeLessThanOrEqual(255)
      expect(result.endsWith('.png')).toBe(true)
      expect(result).toContain('...')
    })
  })

  describe('generateTimestampFileName', () => {
    it('should generate timestamp filename', () => {
      const result = generateTimestampFileName()
      const regex = /^image-\d{8}-\d{6}$/
      expect(result).toMatch(regex)
    })
  })
})