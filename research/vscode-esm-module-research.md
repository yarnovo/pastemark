# VSCode 扩展开发模块系统调研报告

## 调研背景

日期：2025年7月15日

目的：评估 VSCode 扩展开发中是否应该使用 ESM (ECMAScript Modules) 即在 package.json 中设置 `"type": "module"`

## 核心结论

**不推荐**在当前（2025年7月）的 VSCode 扩展开发中使用 `"type": "module"`。应继续使用 CommonJS 模块系统。

## 详细发现

### 1. ESM 支持现状

#### 当前限制
- VSCode 扩展主机仍然主要基于 CommonJS 模块系统
- 设置 `"type": "module"` 并使用 `import` 语法会导致扩展无法正常工作
- VSCode 基于 Electron，而 Electron 应用对 ES6 模块的支持仍有限制

#### 最新进展（2025年初）
- 根据社区反馈，ESM 模块在 VSCode Insiders 版本的桌面端已获得实验性支持
- 扩展需要在 package.json 中设置 `"type": "module"` 或使用 `.mjs` 文件扩展名
- Web 平台（如 github.dev、vscode.dev）的支持仍然困难重重
- 截至2025年7月，主流 VSCode 版本仍未完全支持 ESM

### 2. 官方立场

Microsoft 在 GitHub Issue #130367 中的态度：
- 认可 ESM 支持是一个重要的功能请求
- 已加入 "Backlog" 里程碑，表示未来会实现
- 目前没有明确的时间线
- 社区反响热烈（295+ 👍），显示开发者强烈需求

### 3. 当前最佳实践

#### 推荐方案：CommonJS + 打包工具

1. **继续使用 CommonJS**
   ```json
   {
     "main": "./out/extension.js",
     // 不要添加 "type": "module"
   }
   ```

2. **使用现代打包工具**
   
   **esbuild（推荐）**- 配置简单快速：
   ```json
   {
     "scripts": {
       "esbuild-base": "esbuild ./src/extension.ts --bundle --outfile=dist/extension.js --external:vscode --format=cjs --platform=node",
       "dev": "npm run esbuild-base -- --sourcemap --watch",
       "vscode:prepublish": "npm run esbuild-base -- --minify"
     }
   }
   ```
   
   关键参数：
   - `--format=cjs`：必须使用 CommonJS 格式
   - `--external:vscode`：排除 vscode 模块（由运行时提供）
   - `--platform=node`：目标平台

   **webpack（备选）**：
   ```javascript
   {
     target: "node",
     output: {
       libraryTarget: "commonjs2"
     },
     externals: {
       vscode: "commonjs vscode"
     }
   }
   ```

3. **开发时使用 ESM 语法**
   - 可以在源代码中使用 ES6+ 语法和 import/export
   - 通过 TypeScript 或打包工具转译为 CommonJS
   - 获得现代开发体验，同时保持兼容性

### 4. 解决 ESLint 警告

对于当前项目中的警告：
```
Module type of file:///home/yarnb/pastemark/eslint.config.js is not specified
```

建议方案：
1. **保持现状**：这只是一个警告，不影响功能
2. **重命名配置文件**：将 `eslint.config.js` 改为 `eslint.config.cjs`
3. **使用旧格式**：改用 `.eslintrc.json` 配置文件

### 5. 未来展望

#### 可能的发展路径
1. VSCode 将逐步完善 ESM 支持
2. 首先在桌面端实现，然后扩展到 Web 平台
3. 预计需要 1-2 年才能完全成熟

#### 迁移准备
1. 使用现代 JavaScript/TypeScript 语法编写代码
2. 通过打包工具管理依赖
3. 保持代码模块化，便于未来迁移

## 建议行动

对于 PasteMark 项目：

1. **维持现有配置**
   - 不添加 `"type": "module"`
   - 继续使用 CommonJS 作为输出格式

2. **忽略 ESLint 警告**
   - 当前的警告不影响功能
   - 可选：将 `eslint.config.js` 重命名为 `eslint.config.cjs`

3. **考虑引入打包工具**
   - 推荐使用 esbuild 进行打包
   - 可以减小扩展体积，提高加载性能
   - 支持 tree-shaking 和代码压缩

4. **持续关注**
   - 关注 VSCode 官方博客和更新日志
   - 监控 GitHub Issue #130367 的进展
   - 在 ESM 支持成熟后再考虑迁移

## 参考资源

1. [VSCode Extension Bundling Guide](https://code.visualstudio.com/api/working-with-extensions/bundling-extension)
2. [GitHub Issue: Enable consuming of ES modules in extensions](https://github.com/microsoft/vscode/issues/130367)
3. [Why you should always bundle a VS Code extension](https://www.roboleary.net/2024/02/16/vscode-ext-esbuild)
4. [VSCode Web Extensions Guide](https://code.visualstudio.com/api/extension-guides/web-extensions)

## 结论

虽然 ESM 是 JavaScript 生态系统的未来方向，但在 VSCode 扩展开发领域，CommonJS 仍然是当前（2025年7月）的标准和推荐做法。建议继续使用 CommonJS，同时通过现代工具链获得良好的开发体验。