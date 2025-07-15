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
├── clipboard/              # 剪贴板管理模块
│   ├── types.ts           # 接口定义
│   ├── base.ts            # 基类实现
│   ├── clipboardManager.ts # 统一管理器
│   ├── windows.ts         # Windows 实现
│   ├── macos.ts           # macOS 实现
│   ├── linux.ts           # Linux 实现
│   └── wsl.ts             # WSL 实现
├── commands/              # 命令处理
│   └── pasteImageCommand.ts
├── services/              # 核心服务
│   ├── editorService.ts   # 编辑器服务
│   ├── fileManager.ts     # 文件管理
│   ├── imageProcessor.ts  # 图片处理
│   └── ollamaClient.ts    # AI 客户端
├── resources/             # 系统脚本
│   ├── windows-clipboard.ps1
│   ├── mac-clipboard.applescript
│   └── linux-clipboard.sh
├── types/                 # 类型定义
└── utils/                 # 工具函数
```

### 技术栈
- TypeScript 5.x
- VSCode Extension API
- Vitest（测试框架）
- Ollama HTTP API（可选）

## 剪贴板图片读取实现

### 问题背景
VSCode Extension API 不支持直接读取剪贴板中的二进制图片数据，只能读取文本。Windows Snipping Tool 截图后的图片无法通过 `vscode.env.clipboard.readText()` 读取。

### 解决方案
通过调用系统命令的方式实现跨平台剪贴板图片读取：

1. **Windows**: 使用 PowerShell 脚本调用 .NET Framework 的 `System.Windows.Forms.Clipboard`
2. **macOS**: 使用 AppleScript 读取剪贴板图片
3. **Linux**: 使用 xclip (X11) 或 wl-paste (Wayland)
4. **WSL**: 调用 Windows 的 PowerShell，并转换路径格式

### 重要提示
- 资源文件需要在构建时复制到 out 目录（使用 scripts/copy-resources.js）
- PowerShell 脚本支持多种剪贴板格式（PNG、Bitmap、DIB）
- 临时文件使用后需要清理
- WSL 环境需要特殊的路径转换处理

## Ollama 集成

### 模型配置
- 默认模型：`llava`
- 支持任何 Ollama 视觉模型（llava:13b、qwen2-vl、pixtral、moondream 等）
- 服务地址：`http://localhost:11434`
- 超时设置：3秒

### 文件名生成策略
1. **手动命名**：选中文本 → 使用选中文本作为文件名
2. **智能命名**：无选中文本 → 调用 Ollama AI 生成描述性文件名
3. **降级策略**：Ollama 不可用 → 使用时间戳命名（image-20250115-143025.png）

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
- 78个测试用例
- 55.91% 代码覆盖率
- 所有测试通过

## 配置选项

```json
{
  "pastemark.ollamaEnabled": true,          // 启用/禁用 Ollama
  "pastemark.ollamaEndpoint": "http://localhost:11434",  // Ollama 服务地址
  "pastemark.ollamaModel": "llava",         // 使用的模型
  "pastemark.ollamaPrompt": "...",          // 自定义提示词
  "pastemark.imagePath": "./",              // 图片保存路径
  "pastemark.imageFormat": "png"            // 默认图片格式
}
```

## 错误处理和降级策略

### 多层回退机制
1. Ollama 服务不可用 → 时间戳命名
2. 网络超时（3秒）→ 时间戳命名
3. 模型返回空结果 → 时间戳命名
4. 剪贴板读取失败 → 显示错误信息
5. 文件保存失败 → 显示错误信息

### 缓存策略
- Ollama 服务可用性检查缓存 1 分钟
- 避免频繁的网络请求

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

### 注意事项
- 项目缺少 extension.ts 主入口文件（需要创建）
- 支持多种图片格式（PNG、JPG、GIF、BMP、WebP）
- 完整的研究文档在 research/ 目录下