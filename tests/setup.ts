import { vi } from 'vitest'

// 设置全局 mock
beforeEach(() => {
  vi.clearAllMocks()
})

// 全局超时设置
vi.setConfig({ testTimeout: 10000 })