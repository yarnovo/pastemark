# PasteMark 架构设计文档

## 概述

PasteMark 是一个 VSCode 插件，采用模块化架构设计，将功能划分为多个独立的模块，便于维护和扩展。插件的核心功能是处理剪贴板图片并将其保存到本地文件系统。

## 技术栈

- **开发语言**: TypeScript 5.x
- **运行时**: VSCode Extension Host
- **构建工具**: TypeScript Compiler (tsc)
- **目标环境**: Node.js 16.x+
- **测试框架**: Vitest + @vscode/test-electron
- **外部依赖**: 
  - VSCode Extension API
  - Ollama HTTP API（可选）
- **支持平台**: Windows、macOS、Linux、WSL

## 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        VSCode Editor                         │
├─────────────────────────────────────────────────────────────┤
│                    Extension Host Process                    │
├─────────────────────────────────────────────────────────────┤
│                      PasteMark Extension                     │
│  ┌─────────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ Command Handler │  │   Clipboard  │  │     Image     │ │
│  │                 ├──┤   Manager    ├──┤   Processor   │ │
│  └────────┬────────┘  └──────────────┘  └───────┬───────┘ │
│           │                                      │          │
│  ┌────────▼────────┐  ┌──────────────┐  ┌──────▼────────┐ │
│  │   Text Editor   │  │   Ollama     │  │     File      │ │
│  │    Service      │  │   Client     │  │    Manager    │ │
│  └─────────────────┘  └──────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                        ┌───────▼────────┐
                        │ Ollama Service │
                        │  (localhost)   │
                        └────────────────┘
```

### 模块设计

#### 1. Extension Entry Point (`src/extension.ts`)

**职责**：
- 插件生命周期管理
- 注册命令和快捷键
- 初始化各个服务模块
- 配置管理

**关键方法**：
```typescript
export function activate(context: vscode.ExtensionContext)
export function deactivate()
```

#### 2. Command Handler (`src/commands/pasteImageCommand.ts`)

**职责**：
- 处理 `pastemark.pasteImage` 命令
- 协调各个服务完成图片粘贴流程
- 错误处理和用户反馈

**核心流程**：
1. 检查当前编辑器是否为 Markdown 文件
2. 获取选中文本或光标位置
3. 调用剪贴板服务获取图片
4. 根据模式生成文件名
5. 保存图片并更新编辑器内容

#### 3. Clipboard Manager (`src/clipboard/`)

**职责**：
- 跨平台剪贴板图片读取
- 判断剪贴板是否包含图片
- 提取图片数据和格式
- 处理不同平台的特殊情况

**平台实现**：
- Windows: PowerShell 脚本调用 .NET Framework
- macOS: AppleScript 访问剪贴板
- Linux: xclip (X11) 或 wl-paste (Wayland)
- WSL: 调用 Windows PowerShell + 路径转换

**关键接口**：
```typescript
interface ClipboardManager {
  hasImage(): Promise<boolean>
  readImage(): Promise<ClipboardImage | null>
  cleanup(): Promise<void>
}

interface ClipboardImage {
  data: Buffer
  format: ImageFormat
  tempFilePath?: string
}
```

#### 4. Image Processor (`src/services/imageProcessor.ts`)

**职责**：
- 处理图片数据格式转换
- 生成文件名（手动/智能/随机）
- 调用 Ollama 服务进行图片分析
- 实现降级策略

**关键接口**：
```typescript
interface ImageProcessor {
  generateFileName(options: FileNameOptions): Promise<string>
  processImage(data: ImageData): Promise<ProcessedImage>
}

interface FileNameOptions {
  selectedText?: string
  useOllama: boolean
  imageData: ImageData
}
```

#### 5. Ollama Client (`src/services/ollamaClient.ts`)

**职责**：
- 与 Ollama API 通信
- 发送图片进行分析
- 处理响应和超时
- 错误处理

**关键接口**：
```typescript
interface OllamaClient {
  generateImageName(imageBuffer: Buffer, mimeType: string): Promise<string | null>
  isServiceAvailable(): Promise<boolean>
}
```

**特性**：
- 服务可用性缓存（1分钟）
- 3秒超时控制
- 自动降级处理

#### 6. File Manager (`src/services/fileManager.ts`)

**职责**：
- 保存图片到文件系统
- 处理文件路径
- 检查文件名冲突
- 生成唯一文件名

**关键接口**：
```typescript
interface FileManager {
  saveImage(filePath: string, data: Buffer): Promise<void>
  ensureUniqueFileName(basePath: string): string
}
```

#### 7. Text Editor Service (`src/services/editorService.ts`)

**职责**：
- 获取编辑器状态
- 读取选中文本
- 插入或替换文本
- 生成 Markdown 语法

**关键接口**：
```typescript
interface EditorService {
  getSelection(): TextSelection | null
  replaceSelection(text: string): Promise<void>
  insertAtCursor(text: string): Promise<void>
}
```

### 数据流

#### 场景 1：手动命名模式

```
用户操作 ──► 命令触发 ──► 获取选中文本 ──► 读取剪贴板
                │                          │
                ▼                          ▼
         检查是否为MD文件            获取图片数据
                │                          │
                └──────────┬───────────────┘
                          ▼
                    使用选中文本作为文件名
                          │
                          ▼
                    保存图片到文件系统
                          │
                          ▼
                 替换选中文本为Markdown语法
```

#### 场景 2：智能命名模式

```
用户操作 ──► 命令触发 ──► 检查光标位置 ──► 读取剪贴板
                │                          │
                ▼                          ▼
         检查是否为MD文件            获取图片数据
                │                          │
                └──────────┬───────────────┘
                          ▼
                    调用 Ollama 分析图片
                          │
                  ┌───────┴───────┐
                  ▼               ▼
                成功            失败/超时
                  │               │
                  ▼               ▼
           使用AI生成名称    使用时间戳名称
                  │               │
                  └───────┬───────┘
                          ▼
                    保存图片到文件系统
                          │
                          ▼
                 在光标位置插入Markdown语法
```

### 配置管理

配置通过 VSCode 的 Configuration API 管理：

```typescript
interface PasteMarkConfig {
  ollamaEnabled: boolean
  ollamaEndpoint: string
  ollamaModel: string
  imagePath: string
  imageFormat: string
}
```

### 错误处理策略

1. **剪贴板错误**：提示用户剪贴板中没有图片
2. **文件系统错误**：提示具体的文件操作失败原因
3. **Ollama 服务错误**：自动降级到时间戳命名
4. **编辑器错误**：提示当前不是 Markdown 文件
5. **文件冲突**：自动添加数字后缀
6. **操作失败**：自动回滚（删除已创建的文件）

### 性能考虑

1. **异步操作**：所有 I/O 操作使用异步方法
2. **超时控制**：Ollama 调用设置 3 秒超时
3. **内存管理**：及时释放图片 Buffer 和清理临时文件
4. **错误恢复**：失败操作不影响编辑器状态
5. **服务缓存**：Ollama 可用性检查缓存 1 分钟
6. **并发控制**：避免重复的服务检查请求

### 扩展性设计

插件采用模块化设计，便于未来扩展：

1. **图片处理器**：可扩展支持更多图片格式
2. **命名策略**：可添加新的文件命名策略
3. **AI 服务**：可集成其他 AI 服务提供商
4. **存储位置**：可扩展支持云存储等

### 安全考虑

1. **文件名清理**：移除特殊字符，防止路径注入
2. **文件名长度**：限制最大 255 字符
3. **文件大小限制**：限制处理图片最大 10MB
4. **权限控制**：仅在用户工作区内创建文件
5. **隐私保护**：Ollama 本地运行，图片不上传云端
6. **临时文件**：操作完成后自动清理
7. **路径验证**：使用正斜杠统一路径格式

## 开发和测试

### 目录结构

```
src/
├── extension.ts              # 插件入口
├── commands/
│   └── pasteImageCommand.ts  # 命令处理
├── clipboard/               # 剪贴板管理
│   ├── types.ts            # 接口定义
│   ├── base.ts             # 基类实现
│   ├── clipboardManager.ts # 统一管理器
│   ├── windows.ts          # Windows 实现
│   ├── macos.ts            # macOS 实现
│   ├── linux.ts            # Linux 实现
│   └── wsl.ts              # WSL 实现
├── services/
│   ├── editorService.ts     # 编辑器服务
│   ├── fileManager.ts        # 文件管理
│   ├── imageProcessor.ts     # 图片处理
│   └── ollamaClient.ts       # Ollama 客户端
├── resources/               # 系统脚本
│   ├── windows-clipboard.ps1
│   ├── mac-clipboard.applescript
│   └── linux-clipboard.sh
├── types/
│   └── index.ts             # 类型定义
└── utils/
    └── stringUtils.ts       # 字符串工具
```

### 测试策略

1. **单元测试**：每个服务模块独立测试（Vitest）
2. **集成测试**：测试模块间交互
3. **端到端测试**：模拟用户操作流程（@vscode/test-electron）
4. **跨平台测试**：在 Windows、macOS、Linux、WSL 下测试
5. **测试覆盖率**：目标 60% 以上（当前 55.91%）
6. **Mock 策略**：VSCode API 和外部服务使用 Mock

## 部署

1. **编译**：`npm run compile`
2. **打包**：`vsce package`
3. **发布**：`vsce publish`

## 维护和监控

- 使用 VSCode 输出通道记录日志
- 错误上报到 VSCode 问题面板
- 用户反馈通过 GitHub Issues 收集