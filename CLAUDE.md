# PasteMark 项目记忆

## 项目概述

PasteMark 是一个智能的 VSCode 插件，用于在 Markdown 文件中快速粘贴剪贴板图片。支持手动命名和 AI 智能命名两种模式。

### 核心功能
- 🚀 一键粘贴（Shift+Alt+V）
- 🎯 智能命名（集成 Ollama AI）
- 📝 手动命名（选中文本作为文件名）
- 🔧 零配置（开箱即用）

## 技术架构

### 项目结构
```
src/
├── extension.ts           # 扩展入口
├── commands/              # 命令处理
│   └── pasteImageCommand.ts
├── clipboard/             # 剪贴板管理模块
│   ├── types.ts          # 接口定义
│   ├── base.ts           # 基类实现
│   ├── clipboardManager.ts # 统一管理器
│   ├── windows.ts        # Windows 实现
│   ├── macos.ts          # macOS 实现
│   ├── linux.ts          # Linux 实现
│   └── wsl.ts            # WSL 实现
├── services/              # 核心服务
│   ├── editorService.ts  # 编辑器服务
│   ├── fileManager.ts    # 文件管理
│   ├── imageProcessor.ts # 图片处理
│   └── ollamaClient.ts   # AI 客户端
├── resources/             # 系统脚本
│   ├── windows-clipboard.ps1
│   ├── mac-clipboard.applescript
│   └── linux-clipboard.sh
├── types/                 # 类型定义
│   └── index.ts
└── utils/                 # 工具函数
    └── stringUtils.ts

tests/                     # 测试文件
├── unit/                 # 单元测试
├── integration/          # 集成测试
└── e2e/                  # 端到端测试
```

### 技术栈
- TypeScript 5.x
- VSCode Extension API
- Node.js 16.x+
- 测试框架：Vitest + @vscode/test-electron
- 构建工具：tsc + esbuild
- CI/CD：GitHub Actions
- 外部服务：Ollama HTTP API（可选）

## 剪贴板图片读取实现

### 问题背景
VSCode Extension API 只支持 `vscode.env.clipboard.readText()` 和 `writeText()`，不支持读取二进制图片数据。这意味着无法直接从截图工具（如 Windows Snipping Tool、macOS Screenshot）读取图片。

### 解决方案
通过调用系统命令的方式实现跨平台剪贴板图片读取：

1. **Windows**: 使用 PowerShell 脚本调用 .NET Framework 的 `System.Windows.Forms.Clipboard`
2. **macOS**: 使用 AppleScript 读取剪贴板图片
3. **Linux**: 使用 xclip (X11) 或 wl-paste (Wayland)
4. **WSL**: 调用 Windows 的 PowerShell，并转换路径格式

### 实现细节
- **资源文件管理**：系统脚本需要在构建时复制到 out/resources 目录
- **格式支持**：Windows 支持 PNG、Bitmap、DIB 等多种剪贴板格式
- **临时文件**：操作完成后自动清理，即使出错也会尝试清理
- **路径处理**：WSL 环境下的 Windows 路径需要转换为 WSL 路径格式
- **权限要求**：Linux 需要安装 xclip 或 wl-clipboard

## Ollama 集成

### 模型配置
- 默认模型：`llava`
- 支持模型：所有 Ollama 视觉模型（不限制模型选择）
  - 常用：llava、llava:13b、llava:34b、llava-llama3
  - 推荐：qwen2-vl（2025年推荐，中英文支持好）
  - 新技术：pixtral、moondream
  - 自定义模型也可以使用
- 服务地址：`http://localhost:11434`
- 超时设置：3秒
- 可用性缓存：1分钟

### 文件名生成策略
1. **手动命名**：选中文本 → 使用选中文本作为文件名
2. **智能命名**：无选中文本 → 调用 Ollama AI 生成描述性文件名
3. **降级策略**：Ollama 不可用 → 使用时间戳命名（image-20250115-143025.png）

### 文件名处理
- **特殊字符清理**：移除 `/\:*?"<>|` 等不安全字符
- **长度限制**：最大 255 字符
- **去重机制**：文件存在时自动添加数字后缀（-1、-2、-3...）
- **路径格式**：统一使用正斜杠

### 提示词配置
默认提示词：
```
Analyze this image and provide a short, descriptive filename (2-4 words, English, use hyphens to separate words, no file extension). For example: "user-interface-design" or "system-architecture". Only respond with the filename, nothing else.
```

用户可自定义提示词以支持不同语言和命名风格。

## 测试策略

### 测试框架
- 单元测试和集成测试：Vitest
- 端到端测试：@vscode/test-electron + Playwright

### 测试覆盖
- 单元测试：60%（独立函数和类）
- 集成测试：30%（模块间交互）
- 端到端测试：10%（完整用户流程）

### 当前测试状态
- 测试框架：Vitest + @vscode/test-electron
- 测试用例：78个
- 代码覆盖率：55.91%
- 测试环境：需要 Xvfb（Linux CI）
- 测试超时：10分钟

## 配置选项

```json
{
  "pastemark.ollamaEnabled": true,          // 启用/禁用 Ollama
  "pastemark.ollamaEndpoint": "http://localhost:11434",  // Ollama 服务地址
  "pastemark.ollamaModel": "llava",         // 使用的模型（支持任何视觉模型）
  "pastemark.ollamaPrompt": "...",          // 自定义提示词
  "pastemark.imagePath": "./",              // 图片保存路径（相对于当前文件）
  "pastemark.imageFormat": "png"            // 默认图片格式（png/jpg/jpeg/gif/bmp）
}
```

### 路径配置示例
- `"./"`：当前文件目录（默认）
- `"./images/"`：当前文件的 images 子目录
- `"../assets/"`：上级目录的 assets 文件夹

## 错误处理和降级策略

### 多层回退机制
1. Ollama 服务不可用 → 时间戳命名
2. 网络超时（3秒）→ 时间戳命名
3. 模型返回空结果 → 时间戳命名
4. 剪贴板读取失败 → 显示错误信息
5. 文件保存失败 → 显示错误信息

### 性能优化
- **服务缓存**：Ollama 可用性检查缓存 1 分钟
- **超时控制**：AI 请求 3 秒超时
- **内存管理**：及时释放 Buffer 和清理临时文件
- **并发控制**：避免重复的服务检查

## 开发状态

### 已完成功能
- ✅ 核心功能实现（剪贴板图片检测、文件保存、Markdown 语法生成）
- ✅ 手动命名模式（选中文本作为图片名）
- ✅ 智能命名模式（Ollama AI 集成）
- ✅ 降级策略（Ollama 不可用时使用时间戳）
- ✅ 完整的测试套件
- ✅ TypeScript 类型安全
- ✅ 模块化架构设计
- ✅ 跨平台支持（Windows、macOS、Linux、WSL）
- ✅ 完整的扩展入口实现
- ✅ 输出通道日志记录
- ✅ 文件名去重机制
- ✅ 错误回滚机制
- ✅ 临时文件自动清理
- ✅ 路径验证和创建
- ✅ CI/CD 流程（GitHub Actions）

### 已实现的核心组件
- ✅ extension.ts 主入口文件
- ✅ 完整的命令注册和生命周期管理
- ✅ 输出通道日志记录
- ✅ 资源文件自动处理

### 计划中的功能
- 🚀 支持更多图片格式（WebP、TIFF）
- 🚀 图片压缩选项
- 🚀 批量粘贴功能
- 🚀 图片水印功能
- 🚀 历史记录管理

### 项目文档
- README.md - 项目介绍和使用说明
- ARCHITECTURE.md - 架构设计文档
- DEPLOYMENT.md - 部署和 CI/CD 文档
- CHANGELOG.md - 版本更新记录
- research/ - 技术研究文档

## 命令执行流程

1. **命令注册**：`extension.ts` 注册 `pastemark.pasteImage` 命令
2. **环境检查**：EditorService 检查是否在 Markdown 文件中
3. **剪贴板检测**：ClipboardManager 检测并读取图片
4. **文件名生成**：ImageProcessor 根据配置生成文件名
5. **文件保存**：FileManager 保存图片到指定路径
6. **插入引用**：EditorService 插入 Markdown 图片语法
7. **清理临时文件**：ClipboardManager 清理临时文件
8. **错误处理**：如果任何步骤失败，回滚已创建的文件

## 版本信息

- 当前版本：0.0.0（开发中）
- 最后更新：2025-07-15
- Node.js 最低版本：16.x
- VSCode 最低版本：1.74.0
- 发布者：yarnovo
- 仓库：https://github.com/yarnovo/pastemark

## CI/CD 状态

- GitHub Actions 工作流：`.github/workflows/ci-cd.yaml`
- CI 触发：push 到 main、PR、手动触发
- CD 触发：创建 v* 标签（如 v1.0.0）
- 发布目标：VSCode Marketplace + GitHub Release