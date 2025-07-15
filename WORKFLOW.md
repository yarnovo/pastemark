# PasteMark 工作流程

## 项目概览

PasteMark 是一个 VSCode 扩展，用于在 Markdown 文件中智能粘贴剪贴板图片。主要特性包括跨平台剪贴板支持、Ollama 智能命名和灵活的配置选项。

## 核心模型

**使用的 AI 模型**: `llava`
- 默认模型: `llava` 
- 配置项: `pastemark.ollamaModel`
- 服务地址: `http://localhost:11434`
- 超时设置: 3秒

## 完整工作流程

### 1. 用户操作触发
```
用户在 Markdown 文件中按下 Shift+Alt+V
                    ↓
           触发 pasteImageCommand
```

### 2. 环境检查阶段
```
检查当前文件是否为 Markdown 文件
                    ↓
           检查剪贴板是否包含图片
                    ↓
         读取用户配置 (Ollama、路径等)
```

### 3. 剪贴板图片读取
```
根据操作系统选择读取方式:
    
Windows → PowerShell 脚本 → System.Windows.Forms.Clipboard
macOS   → AppleScript     → 系统剪贴板 API
Linux   → xclip/wl-paste → X11/Wayland 剪贴板
WSL     → Windows 调用   → 路径转换处理
                    ↓
         获取图片 Buffer 数据
```

### 4. 智能文件名生成
```
文件名生成优先级：

1. 选中文本存在？
   是 → 使用选中文本作为文件名
   否 → 继续下一步

2. 启用 Ollama？
   是 → 调用 Ollama 分析图片
       ↓
   检查服务可用性 (缓存1分钟)
       ↓
   发送图片到 llava 模型
       ↓
   提示词: "Analyze this image and provide a short, 
   descriptive filename (2-4 words, English, use 
   hyphens to separate words, no file extension)"
       ↓
   清理返回结果 (移除引号、空格转连字符、小写)
   否 → 使用时间戳命名

3. 回退机制：
   - Ollama 不可用 → 时间戳命名
   - 超时 (3秒) → 时间戳命名
   - 返回空结果 → 时间戳命名
```

### 5. 图片处理与保存
```
生成完整文件名 (添加扩展名)
                    ↓
     创建目标目录 (如果不存在)
                    ↓
       保存图片文件到指定路径
                    ↓
    生成 Markdown 图片引用语法
```

### 6. 编辑器集成
```
在当前光标位置插入图片引用
格式: ![description](path/to/image.png)
                    ↓
         显示成功提示信息
```

## 技术架构

### 核心服务模块
```
ClipboardManager (剪贴板管理器)
    ├── WindowsClipboard
    ├── MacOSClipboard  
    ├── LinuxClipboard
    └── WSLClipboard

OllamaClient (AI 模型客户端)
    ├── 图片分析接口
    ├── 服务可用性检查
    └── 响应清理处理

ImageProcessor (图片处理器)
    ├── 文件名生成逻辑
    ├── 图片格式转换
    └── 路径处理
```

### 配置系统
```json
{
  "pastemark.ollamaEnabled": true,
  "pastemark.ollamaEndpoint": "http://localhost:11434",
  "pastemark.ollamaModel": "llava",
  "pastemark.imagePath": "./",
  "pastemark.imageFormat": "png"
}
```

## 错误处理机制

### 多层回退策略
1. **Ollama 服务不可用** → 时间戳命名
2. **网络超时 (3秒)** → 时间戳命名  
3. **模型返回空结果** → 时间戳命名
4. **剪贴板读取失败** → 显示错误信息
5. **文件保存失败** → 显示错误信息

### 缓存机制
- Ollama 服务可用性检查缓存 1 分钟
- 避免频繁的网络请求

## 跨平台支持

### 资源文件
```
src/resources/
├── windows-clipboard.ps1    # Windows PowerShell 脚本
├── mac-clipboard.applescript # macOS AppleScript
└── linux-clipboard.sh       # Linux shell 脚本
```

### 构建时处理
- 资源文件自动复制到 `out/` 目录
- 脚本权限设置 (Linux/macOS)
- 路径转换处理 (WSL)

## 性能优化

### 异步处理
- 所有 I/O 操作均为异步
- 避免阻塞 VSCode 主线程

### 资源管理
- 临时文件自动清理
- 内存使用优化
- 连接池管理

## 扩展点

### 支持的图片格式
- PNG (默认)
- JPEG
- BMP
- GIF

### 可扩展的 AI 模型
- 当前支持: `llava`
- 未来可扩展: `llava:13b`, `bakllava`, `moondream` 等

### 自定义提示词
- 可配置的图片分析提示词
- 支持多语言输出
- 自定义命名规则

---

*此工作流程文档描述了 PasteMark 项目从用户操作到最终结果的完整流程，包括 AI 模型集成、跨平台支持和错误处理机制。*