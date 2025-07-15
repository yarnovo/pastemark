# VSCode 插件测试调研报告

## 调研背景

本文档旨在调研 VSCode 插件测试的最新最佳实践（2024-2025），包括官方推荐方案、现代化测试框架选择、社区实践等方面。

## 一、VSCode 官方测试方案

### 1.1 官方测试框架

VSCode 官方提供了以下测试工具：

#### @vscode/test-cli
- **最新工具**：2023年推出，替代旧的 vscode-test
- **功能**：提供命令行界面，简化测试运行
- **特点**：
  - 内置 Mocha 测试框架
  - 支持多版本 VSCode 测试
  - 提供测试覆盖率报告
  - 支持 headless 模式

#### @vscode/test-electron
- **核心库**：提供 VSCode 测试环境
- **功能**：下载并运行 VSCode 实例进行测试
- **使用场景**：集成测试和端到端测试

### 1.2 官方推荐的测试架构

```typescript
// 官方示例结构
src/
  test/
    suite/
      extension.test.ts    // 集成测试
      index.ts            // 测试套件入口
    runTest.ts           // 测试运行器
```

### 1.3 测试类型

1. **单元测试**：测试纯函数和独立逻辑
2. **集成测试**：测试与 VSCode API 的交互
3. **UI 测试**：测试用户界面交互

## 二、现代化测试框架选择

### 2.1 Vitest - 新一代测试框架

#### 为什么选择 Vitest？

1. **性能优势**：
   - 基于 Vite，启动速度快
   - 支持并行测试
   - 智能文件监听

2. **开发体验**：
   - 与 VSCode 深度集成
   - 内置覆盖率报告
   - 支持 TypeScript 开箱即用
   - 兼容 Jest API

3. **VSCode 插件中使用 Vitest**：

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html']
    }
  }
})
```

#### Vitest + VSCode API 测试方案

```typescript
// 使用 vi.mock 模拟 VSCode API
import { vi } from 'vitest'

vi.mock('vscode', () => ({
  window: {
    showInformationMessage: vi.fn(),
    showErrorMessage: vi.fn()
  },
  workspace: {
    getConfiguration: vi.fn()
  }
}))
```

### 2.2 ESLint 9 - 现代化代码检查

#### Flat Config 配置方式

```javascript
// eslint.config.js (ESLint 9.x)
import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': 'error'
    }
  }
]
```

## 三、UI 自动化测试

### 3.1 ExTester (vscode-extension-tester)

最强大的 VSCode UI 测试框架：

```typescript
import { VSBrowser, WebDriver } from 'vscode-extension-tester'

describe('UI Tests', () => {
  let driver: WebDriver

  before(async () => {
    driver = VSBrowser.instance.driver
  })

  it('should open command palette', async () => {
    await VSBrowser.instance.openResources()
    const workbench = await driver.getWorkbench()
    await workbench.openCommandPalette()
  })
})
```

### 3.2 测试用例示例

```typescript
// 测试图片粘贴功能
it('should paste image with selected text', async () => {
  const editor = await new TextEditor().openFile('test.md')
  await editor.selectText('my-image')
  
  // 模拟剪贴板操作
  await workbench.executeCommand('pastemark.pasteImage')
  
  // 验证结果
  const text = await editor.getText()
  expect(text).toContain('![my-image](./my-image.png)')
})
```

## 四、社区最佳实践

### 4.1 流行插件的测试策略

#### GitHub Copilot
- 使用 Mocha + Sinon
- 大量 mock VSCode API
- 分离业务逻辑进行单元测试

#### Prettier VSCode
- Jest 用于单元测试
- VSCode 测试框架用于集成测试
- 自动化 UI 测试验证格式化效果

#### ESLint VSCode
- 混合测试策略
- 核心逻辑单元测试
- Language Server Protocol 测试

### 4.2 测试模式

1. **分层测试**：
   - 核心逻辑：Vitest 单元测试
   - VSCode 集成：官方测试框架
   - UI 交互：ExTester

2. **Mock 策略**：
   - 抽象 VSCode API 到接口
   - 使用依赖注入
   - 创建测试替身

## 五、推荐的技术栈

### 5.1 现代化方案（推荐）

```json
{
  "devDependencies": {
    // 测试框架
    "vitest": "^1.2.0",
    "@vitest/coverage-v8": "^1.2.0",
    "@vitest/ui": "^1.2.0",
    
    // VSCode 测试
    "@vscode/test-cli": "^0.0.4",
    "@vscode/test-electron": "^2.3.0",
    
    // UI 测试
    "vscode-extension-tester": "^7.0.0",
    
    // 代码质量
    "eslint": "^9.0.0",
    "@eslint/js": "^9.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    
    // 工具
    "tsx": "^4.0.0",
    "@types/node": "^20.0.0",
    "@types/vscode": "^1.85.0"
  }
}
```

### 5.2 测试脚本配置

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:vscode": "vscode-test",
    "test:e2e": "extest setup-and-run './out/test/ui/*.test.js'",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
```

## 六、测试挑战与解决方案

### 6.1 主要挑战

1. **VSCode API 依赖**：
   - 问题：许多 API 只能在扩展主机中使用
   - 解决：使用适配器模式和依赖注入

2. **异步操作**：
   - 问题：VSCode 操作大多是异步的
   - 解决：使用 async/await 和适当的等待策略

3. **环境差异**：
   - 问题：不同操作系统行为不一致
   - 解决：CI 中使用矩阵构建

### 6.2 实用技巧

1. **测试隔离**：
   ```typescript
   beforeEach(async () => {
     await vscode.commands.executeCommand('workbench.action.closeAllEditors')
   })
   ```

2. **等待策略**：
   ```typescript
   async function waitForCondition(condition: () => boolean, timeout = 5000) {
     const start = Date.now()
     while (!condition() && Date.now() - start < timeout) {
       await new Promise(resolve => setTimeout(resolve, 100))
     }
   }
   ```

3. **调试测试**：
   ```json
   {
     "name": "Debug Tests",
     "type": "extensionHost",
     "request": "launch",
     "runtimeExecutable": "${execPath}",
     "args": [
       "--extensionDevelopmentPath=${workspaceFolder}",
       "--extensionTestsPath=${workspaceFolder}/out/test/suite/index"
     ]
   }
   ```

## 七、AI 辅助测试

### 7.1 使用 AI 生成测试用例

现代开发中，可以利用 AI 工具：
- GitHub Copilot 生成测试代码
- ChatGPT/Claude 设计测试场景
- AI 代码审查工具检查测试覆盖率

### 7.2 示例提示词

```
为以下 VSCode 插件功能生成 Vitest 测试用例：
- 功能：从剪贴板粘贴图片到 Markdown
- 场景：用户选中文本作为图片名称
- 需要 mock VSCode API
```

## 八、总结与建议

### 8.1 技术选型建议

1. **新项目**：
   - Vitest + TypeScript + ESLint 9
   - @vscode/test-cli 进行集成测试
   - ExTester 进行关键 UI 测试

2. **现有项目迁移**：
   - 逐步引入 Vitest 进行单元测试
   - 保留现有集成测试
   - 按需添加 UI 测试

### 8.2 测试策略

1. **70% 单元测试**：业务逻辑、工具函数
2. **25% 集成测试**：VSCode API 交互
3. **5% UI 测试**：关键用户路径

### 8.3 持续集成

```yaml
# GitHub Actions 示例
name: Test
on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        vscode-version: [stable, insiders]
    
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run test:vscode -- --vscode-version=${{ matrix.vscode-version }}
```

## 参考资源

1. [VSCode Testing Extensions](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
2. [Vitest Documentation](https://vitest.dev/)
3. [ESLint 9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
4. [vscode-extension-tester](https://github.com/redhat-developer/vscode-extension-tester)
5. [VSCode Extension Samples](https://github.com/microsoft/vscode-extension-samples)