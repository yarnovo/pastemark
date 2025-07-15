# PasteMark 架构设计文档

## 概述

PasteMark 是一个 VSCode 插件，采用模块化架构设计，将功能划分为多个独立的模块，便于维护和扩展。插件的核心功能是处理剪贴板图片并将其保存到本地文件系统。

## 技术栈

- **开发语言**: TypeScript 5.x
- **运行时**: VSCode Extension Host
- **构建工具**: TypeScript Compiler (tsc)
- **目标环境**: Node.js 16.x+
- **外部依赖**: 
  - VSCode Extension API
  - Ollama HTTP API（可选）

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

#### 3. Clipboard Manager (`src/services/clipboardService.ts`)

**职责**：
- 读取系统剪贴板内容
- 判断剪贴板是否包含图片
- 提取图片数据和格式
- 处理 WSL2 环境兼容性

**关键接口**：
```typescript
interface ClipboardService {
  hasImage(): Promise<boolean>
  getImage(): Promise<ImageData | null>
}

interface ImageData {
  buffer: Buffer
  format: string  // png, jpg, etc.
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
  analyzeImage(imageBuffer: Buffer): Promise<string>
  isAvailable(): Promise<boolean>
}
```

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
3. **Ollama 服务错误**：自动降级到随机命名
4. **编辑器错误**：提示当前不是 Markdown 文件

### 性能考虑

1. **异步操作**：所有 I/O 操作使用异步方法
2. **超时控制**：Ollama 调用设置 3 秒超时
3. **内存管理**：及时释放图片 Buffer
4. **错误恢复**：失败操作不影响编辑器状态

### 扩展性设计

插件采用模块化设计，便于未来扩展：

1. **图片处理器**：可扩展支持更多图片格式
2. **命名策略**：可添加新的文件命名策略
3. **AI 服务**：可集成其他 AI 服务提供商
4. **存储位置**：可扩展支持云存储等

### 安全考虑

1. **文件名清理**：移除特殊字符，防止路径注入
2. **文件大小限制**：限制处理图片最大 10MB
3. **权限控制**：仅在用户工作区内创建文件
4. **隐私保护**：Ollama 本地运行，图片不上传云端

## 开发和测试

### 目录结构

```
src/
├── extension.ts              # 插件入口
├── commands/
│   └── pasteImageCommand.ts  # 命令处理
├── services/
│   ├── clipboardService.ts   # 剪贴板服务
│   ├── imageProcessor.ts     # 图片处理
│   ├── ollamaClient.ts       # Ollama 客户端
│   ├── fileManager.ts        # 文件管理
│   └── editorService.ts      # 编辑器服务
├── utils/
│   ├── config.ts            # 配置工具
│   └── logger.ts            # 日志工具
└── types/
    └── index.ts             # 类型定义
```

### 测试策略

1. **单元测试**：每个服务模块独立测试
2. **集成测试**：测试模块间交互
3. **端到端测试**：模拟用户操作流程
4. **手动测试**：在不同环境下测试

## 部署

1. **编译**：`npm run compile`
2. **打包**：`vsce package`
3. **发布**：`vsce publish`

## 维护和监控

- 使用 VSCode 输出通道记录日志
- 错误上报到 VSCode 问题面板
- 用户反馈通过 GitHub Issues 收集