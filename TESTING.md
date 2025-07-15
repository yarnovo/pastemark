# PasteMark 测试文档

## 概述

PasteMark 采用现代化的测试策略，使用 Vitest 作为主要测试框架，配合 VSCode 官方测试工具进行端到端测试。我们实施三层测试架构：单元测试、集成测试和端到端测试。

## 测试框架选择

### 单元测试和集成测试
- **框架**: Vitest
- **原因**: 
  - 极快的执行速度（基于 Vite）
  - 原生 TypeScript 支持
  - 内置 mock 功能，无需额外依赖
  - 兼容 Jest API，学习成本低
  - 优秀的 VSCode 集成

### 端到端测试
- **框架**: @vscode/test-electron + Playwright
- **原因**:
  - @vscode/test-electron 提供真实的 VSCode 环境
  - Playwright 提供强大的 UI 自动化能力
  - 支持多平台测试

## 测试目录结构

```
pastemark/
├── tests/
│   ├── unit/           # 单元测试
│   │   ├── services/   # 服务层测试
│   │   └── utils/      # 工具函数测试
│   └── integration/    # 集成测试
│       └── commands/   # 命令集成测试
├── e2e/                # 端到端测试
│   ├── specs/          # 测试规格
│   └── fixtures/       # 测试数据
└── vitest.config.ts    # Vitest 配置
```

## 测试策略

### 1. 单元测试 (60%)
- 测试独立的函数和类
- Mock 所有外部依赖
- 关注业务逻辑正确性
- 执行速度快，便于 TDD

### 2. 集成测试 (30%)
- 测试模块间的交互
- Mock VSCode API
- 验证服务协作
- 确保组件正确集成

### 3. 端到端测试 (10%)
- 测试完整用户流程
- 使用真实 VSCode 环境
- 验证用户体验
- 覆盖关键路径

## 安装配置

### 1. 安装依赖

```bash
# Vitest 及相关工具
npm install -D vitest @vitest/coverage-v8 @vitest/ui

# TypeScript 和类型定义
npm install -D @types/node @types/vscode

# VSCode 测试工具
npm install -D @vscode/test-electron @vscode/test-cli

# UI 自动化测试
npm install -D playwright @playwright/test

# 代码质量工具
npm install -D eslint@9 @eslint/js typescript-eslint
```

### 2. 配置文件

#### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/test/**',
        'src/**/*.d.ts',
        'src/extension.ts' // 入口文件通常在集成测试中覆盖
      ]
    },
    setupFiles: ['./tests/setup.ts']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'vscode': path.resolve(__dirname, './tests/mocks/vscode.ts')
    }
  }
})
```

#### tests/setup.ts
```typescript
import { vi } from 'vitest'

// 全局 mock 设置
global.vscode = {
  window: {
    showInformationMessage: vi.fn(),
    showErrorMessage: vi.fn(),
    showWarningMessage: vi.fn()
  },
  workspace: {
    getConfiguration: vi.fn().mockReturnValue({
      get: vi.fn()
    })
  },
  commands: {
    registerCommand: vi.fn()
  }
}
```

### 3. package.json 脚本

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "vitest run --dir tests/unit",
    "test:integration": "vitest run --dir tests/integration",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "npm run compile && node ./e2e/runTests.js",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

## 测试用例规范

### 命名规范
- 文件名: `<被测试文件>.test.ts`
- 测试套件: 使用 `describe` 描述模块
- 测试用例: 使用 `it` 或 `test`，描述预期行为

### 测试结构
```typescript
describe('模块名称', () => {
  beforeEach(() => {
    // 测试前准备
  })

  afterEach(() => {
    // 清理工作
  })

  describe('功能点', () => {
    it('应该执行预期行为', () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

## Mock 策略

### VSCode API Mock
```typescript
// tests/mocks/vscode.ts
import { vi } from 'vitest'

export const window = {
  showInformationMessage: vi.fn(),
  showErrorMessage: vi.fn(),
  activeTextEditor: undefined
}

export const workspace = {
  getConfiguration: vi.fn(() => ({
    get: vi.fn(),
    update: vi.fn()
  }))
}

export const Uri = {
  file: vi.fn((path: string) => ({ fsPath: path })),
  parse: vi.fn()
}
```

### 服务 Mock
```typescript
// 使用 vi.mock 自动 mock
vi.mock('@/services/ollamaClient', () => ({
  OllamaClient: {
    analyzeImage: vi.fn().mockResolvedValue('test-image-name')
  }
}))
```

## 测试执行

### 开发时
```bash
# 监听模式，自动重跑测试
npm run test:watch

# 带 UI 的测试运行器
npm run test:ui
```

### CI/CD
```bash
# 运行所有测试并生成覆盖率
npm run test:coverage

# 运行所有测试（包括 e2e）
npm run test:all
```

### 调试测试
VSCode 调试配置：
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "autoAttachChildProcesses": true,
  "skipFiles": ["<node_internals>/**", "**/node_modules/**"],
  "program": "${workspaceRoot}/node_modules/vitest/vitest.mjs",
  "args": ["run", "${file}"],
  "smartStep": true,
  "console": "integratedTerminal"
}
```

## 持续集成

### GitHub Actions
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20]
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
      
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## 测试最佳实践

1. **保持测试独立**: 每个测试应该能独立运行
2. **使用描述性名称**: 测试名称应该清楚描述测试内容
3. **遵循 AAA 模式**: Arrange, Act, Assert
4. **避免过度 Mock**: 只 Mock 必要的依赖
5. **测试边界情况**: 不只测试正常路径
6. **保持测试简洁**: 一个测试只验证一个行为
7. **及时更新测试**: 功能变更时同步更新测试

## 故障排除

### 常见问题

1. **VSCode API 未定义**
   - 确保正确配置了 mock
   - 检查 vitest.config.ts 中的 alias

2. **测试超时**
   - 增加 timeout 配置
   - 检查异步操作是否正确处理

3. **覆盖率不准确**
   - 检查 coverage 配置
   - 确保源文件路径正确

## 相关资源

- [Vitest 文档](https://vitest.dev/)
- [VSCode 测试指南](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Playwright 文档](https://playwright.dev/)