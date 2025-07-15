# PasteMark

一个智能的 VSCode 插件，让您在 Markdown 文件中快速粘贴图片。支持手动命名和 AI 智能命名两种模式。

## 简介

PasteMark 让图片粘贴变得简单高效。无论您是在撰写技术文档、博客文章还是笔记，只需一个快捷键就能将剪贴板中的图片保存到本地并插入到 Markdown 文件中。

### 核心亮点

- 🚀 **一键粘贴** - 使用 `Shift+Alt+V` 快速粘贴图片
- 🎯 **智能命名** - 集成 Ollama AI 自动生成语义化文件名
- 📝 **手动命名** - 选中文本作为图片文件名
- 🔧 **零配置** - 开箱即用，可选配置 AI 功能
- 🌍 **跨平台支持** - Windows、macOS、Linux、WSL 完美兼容

## 特性

### 两种使用模式

1. **手动命名模式**
   - 选中文本后按快捷键
   - 使用选中的文本作为图片文件名
   - 适合需要精确控制文件名的场景

2. **智能命名模式**
   - 直接按快捷键，无需选中文本
   - 通过 Ollama 多模态模型分析图片内容
   - 自动生成描述性的英文文件名
   - Ollama 不可用时自动降级为时间戳命名

### 其他特性

- 🎨 支持多种图片格式（PNG、JPG、GIF、BMP）
- 📁 图片自动保存到 Markdown 文件同级目录（可配置路径）
- ⚡ 快速响应，3 秒超时自动降级
- 🛡️ 错误处理完善，自动回滚和清理
- 🐧 完美支持 WSL 环境
- 📊 内置调试日志输出通道
- 🔄 文件名自动去重，避免覆盖
- 💾 Ollama 服务可用性缓存（1 分钟）
- 🔒 文件名安全处理（移除特殊字符）
- 📏 文件名长度限制（最大 255 字符）

## 安装

### 方式一：从 VSCode 扩展市场安装

1. 打开 VSCode
2. 按下 `Shift+X` 打开扩展面板
3. 搜索 "PasteMark"
4. 点击安装

### 方式二：从源码安装

```bash
# 克隆仓库
git clone https://github.com/yarnovo/pastemark.git
cd pastemark

# 安装依赖
npm install

# 编译并复制资源文件
npm run compile
npm run copy-resources

# 在 VSCode 中按 F5 调试运行
```

## 使用方法

### 基本使用

1. **手动命名**：在 Markdown 文件中选中要作为图片描述的文本
2. **复制图片**：复制任意图片到剪贴板
3. **粘贴图片**：按下 `Shift+Alt+V`

### 使用示例

#### 示例 1：手动命名

```markdown
<!-- 选中 "系统架构图" 这几个字，然后按 Shift+Alt+V -->
系统架构图

<!-- 自动转换为 -->
![系统架构图](./系统架构图.png)
```

#### 示例 2：智能命名（需要 Ollama）

```markdown
<!-- 光标在此处，直接按 Shift+Alt+V -->
|

<!-- 自动插入（假设 AI 识别为用户界面流程图）-->
![user-interface-flow](./user-interface-flow.png)
```

#### 示例 3：降级命名（Ollama 不可用时）

```markdown
<!-- 光标在此处，Ollama 服务未启动 -->
|

<!-- 自动插入时间戳命名 -->
![image](./image-20250115-143025.png)
```

## 配置选项

在 VSCode 设置中可以配置以下选项：

```json
{
  // 启用/禁用 Ollama 智能命名
  "pastemark.ollamaEnabled": true,
  
  // Ollama 服务地址
  "pastemark.ollamaEndpoint": "http://localhost:11434",
  
  // 使用的模型（任何支持图片输入的 Ollama 模型）
  "pastemark.ollamaModel": "llava",
  
  // 自定义提示词（可指定语言、格式和风格）
  "pastemark.ollamaPrompt": "Analyze this image and provide a short, descriptive filename (2-4 words, English, use hyphens to separate words, no file extension). For example: \"user-interface-design\" or \"system-architecture\". Only respond with the filename, nothing else.",
  
  // 图片保存路径（相对于当前文件）
  "pastemark.imagePath": "./",
  
  // 默认图片格式（支持 png, jpg, jpeg, gif, bmp）
  "pastemark.imageFormat": "png"
}
```

## Ollama 智能命名配置

要使用 AI 智能命名功能，需要完成以下 **4 个必要步骤**：

### 1. 安装 Ollama

**Windows/macOS**：
- 访问 [https://ollama.com/](https://ollama.com/) 下载安装包

**Linux**：
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. 启动 Ollama 服务

```bash
# 方法1: 直接启动（前台运行）
ollama serve

# 方法2: 后台启动
nohup ollama serve > ollama.log 2>&1 &
```

⚠️ **重要**：Ollama 服务必须保持运行状态，插件才能调用 AI 功能。

### 3. 下载视觉模型

```bash
# 下载默认的 llava 模型（约 4GB）
ollama pull llava

# 或者选择其他视觉模型
ollama pull llava:13b    # 更高精度，约 8GB
ollama pull qwen2-vl     # 2025推荐，中英文支持
ollama pull pixtral      # 最新技术
ollama pull moondream    # 轻量快速

# 支持任何 Ollama 视觉模型
ollama pull your-preferred-vision-model
```

### 4. 验证安装

```bash
# 检查 Ollama 服务状态
curl http://localhost:11434/api/tags

# 列出已安装的模型
ollama list

# 测试模型（可选）
ollama run llava "Describe this image" --image /path/to/image.jpg
ollama run qwen2-vl "分析这个图片" --image /path/to/image.jpg
```

### 5. VSCode 配置

在 VSCode 设置中确认以下配置：

```json
{
  "pastemark.ollamaEnabled": true,
  "pastemark.ollamaEndpoint": "http://localhost:11434",
  "pastemark.ollamaModel": "llava",
  "pastemark.ollamaPrompt": "Analyze this image and provide a short, descriptive filename (2-4 words, English, use hyphens to separate words, no file extension). For example: \"user-interface-design\" or \"system-architecture\". Only respond with the filename, nothing else."
}
```

### 使用流程

1. **准备阶段**：
   - 确保 Ollama 服务正在运行
   - 确保所需模型已下载（如 llava、qwen2-vl 等）
   - 确保 VSCode 配置正确

2. **使用阶段**：
   - 截图或复制图片到剪贴板
   - 在 Markdown 文件中按 `Shift+Alt+V`
   - 系统会自动检查 Ollama 服务可用性
   - 如果可用，发送图片到配置的模型进行分析
   - 如果不可用，自动回退到时间戳命名

### 故障排除

**常见问题及解决方案**：

1. **服务不可用**：
   ```bash
   # 检查服务状态
   curl http://localhost:11434/api/tags
   
   # 重启服务
   ollama serve
   ```

2. **模型未找到**：
   ```bash
   # 检查已安装的模型
   ollama list
   
   # 下载所需模型
   ollama pull llava
   ollama pull qwen2-vl
   ollama pull your-configured-model
   ```

3. **网络超时**：
   - 检查 localhost:11434 端口是否被占用
   - 检查防火墙设置

4. **返回空结果**：
   - 可能是图片内容无法识别
   - 尝试使用不同的图片

### 性能优化建议

1. **模型选择**：
   - `llava`（默认）- 平衡性能和准确性
   - `llava:13b` - 更高准确性，但更慢
   - `moondream` - 更快速度，但准确性较低

2. **系统资源**：
   - 建议至少 8GB 内存
   - SSD 硬盘可提升模型加载速度

3. **缓存策略**：
   - 服务可用性检查缓存 1 分钟
   - 避免频繁的网络请求

## 模型和提示词配置

### 支持的模型

PasteMark 支持所有 Ollama 视觉模型，**不限制模型选择**。用户可以使用任何支持图像输入的模型：

#### 常用推荐模型

| 模型名称 | 参数规模 | 推荐用途 | 性能特点 |
|---------|---------|---------|---------|
| `llava` | 7B | 默认选择 | 平衡性能和速度 |
| `llava:13b` | 13B | 高质量命名 | 更准确的描述 |
| `llava:34b` | 34B | 专业应用 | 最高准确性 |
| `llava-llama3` | 8B | 新一代 | 基于 Llama 3 |
| `qwen2-vl` | 7B | 2025推荐 | 优秀的中英文支持 |
| `qwen2-vl:72b` | 72B | 顶级性能 | 工业级应用 |
| `pixtral` | 12B | 最新技术 | 先进的视觉理解 |
| `moondream` | 1.7B | 轻量快速 | 资源受限环境 |

#### 自定义模型

你还可以使用：
- 任何 Ollama 支持的视觉模型
- 自定义训练的模型
- 未来发布的新模型

**示例配置**：
```json
{
  "pastemark.ollamaModel": "your-custom-vision-model",
  "pastemark.ollamaModel": "llava-next:34b", 
  "pastemark.ollamaModel": "future-vision-model:v2"
}
```

### 自定义提示词

通过 `pastemark.ollamaPrompt` 配置可以完全自定义 AI 行为：

#### 英文文件名（默认）
```json
{
  "pastemark.ollamaPrompt": "Analyze this image and provide a short, descriptive filename (2-4 words, English, use hyphens to separate words, no file extension). For example: \"user-interface-design\" or \"system-architecture\". Only respond with the filename, nothing else."
}
```

#### 中文文件名
```json
{
  "pastemark.ollamaPrompt": "分析这个图片并提供一个简短的描述性文件名（2-4个词，中文，用连字符分隔，不要扩展名）。例如：\"用户界面设计\" 或 \"系统架构图\"。只返回文件名，不要其他内容。"
}
```

#### 技术风格命名
```json
{
  "pastemark.ollamaPrompt": "Analyze this image and generate a technical filename using programming conventions (lowercase, underscores, descriptive, no file extension). Examples: \"api_endpoint_diagram\", \"database_schema\". Only respond with the filename."
}
```

#### 详细描述风格
```json
{
  "pastemark.ollamaPrompt": "Analyze this image and create a detailed descriptive filename (5-8 words, English, use hyphens, no file extension). Be specific about what you see. Examples: \"mobile-app-login-screen-mockup\", \"data-flow-architecture-diagram-overview\"."
}
```

#### 简短风格
```json
{
  "pastemark.ollamaPrompt": "Analyze this image and provide a very short filename (1-2 words, English, lowercase, no file extension). Examples: \"diagram\", \"mockup\", \"chart\"."
}
```

### 配置模型和提示词

1. **通过 VSCode 设置界面**：
   - 打开 VSCode 设置 (`,`)
   - 搜索 "pastemark"
   - 修改 `Ollama Model` 和 `Ollama Prompt`

2. **通过 settings.json**：
   ```json
   {
     "pastemark.ollamaModel": "qwen2-vl",
     "pastemark.ollamaPrompt": "分析图片内容，生成中文文件名（2-3个词，用连字符连接）"
   }
   ```

3. **通过工作区设置**：
   在项目根目录创建 `.vscode/settings.json`

### 模型兼容性

PasteMark 使用标准的 Ollama API，因此与所有 Ollama 支持的视觉模型兼容：

- ✅ **现有模型**：所有当前可用的视觉模型
- ✅ **未来模型**：自动支持新发布的模型  
- ✅ **自定义模型**：支持用户自训练的模型
- ✅ **版本变体**：支持不同参数规模的变体

**验证模型可用性**：
```bash
# 查看已安装的模型
ollama list

# 测试模型是否支持图像
ollama run your-model "describe this image" --image test.jpg
```

## 常见问题

### Q: 为什么粘贴时提示"剪贴板中没有图片"？

A: 请确保您已经复制了图片到剪贴板。支持从以下来源复制：
- 截图工具（如 Windows Snipping Tool、macOS Screenshot、Linux Screenshot）
- 网页中的图片（右键复制图片）
- 其他应用程序中的图片

### Q: 如何在 WSL 中使用？

A: PasteMark 已经针对 WSL 环境优化：
1. 自动调用 Windows 的 PowerShell 读取剪贴板
2. 自动进行路径格式转换
3. 支持 WSL 1 和 WSL 2
4. 无需额外配置

### Q: Ollama 连接失败怎么办？

A: 请按照上面的 **Ollama 智能命名配置** 章节完成所有 4 个必要步骤：
1. 安装 Ollama
2. 启动 Ollama 服务
3. 下载模型（如 llava、qwen2-vl 等）
4. 验证安装

如果想使用特定模型，请确保已下载该模型：
```bash
ollama pull your-desired-model
```

### Q: 支持哪些图片格式？

A: 支持以下图片格式：PNG、JPG、JPEG、GIF、BMP。默认保存为 PNG 格式，可通过配置修改。

### Q: 图片保存在哪里？

A: 默认保存在 Markdown 文件的同级目录。可以通过 `pastemark.imagePath` 配置修改保存路径：
- `"./"`：当前文件目录（默认）
- `"./images/"`：当前文件的 images 子目录
- `"../assets/"`：上级目录的 assets 文件夹

### Q: 文件名重复怎么办？

A: PasteMark 会自动处理文件名冲突：
- 如果文件已存在，会自动添加数字后缀
- 例如：`diagram.png` → `diagram-1.png` → `diagram-2.png`

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 开发状态

✅ **已完成的功能**：
- 核心功能实现（剪贴板图片检测、文件保存、Markdown 语法生成）
- 手动命名模式（选中文本作为图片名）
- 智能命名模式（Ollama AI 集成）
- 降级策略（Ollama 不可用时使用时间戳）
- 完整的测试套件（78个测试，55.91% 覆盖率）
- TypeScript 类型安全
- 模块化架构设计
- 跨平台剪贴板支持（Windows、macOS、Linux、WSL）
- 完整的扩展入口实现
- 输出通道日志记录
- 文件名去重机制
- 错误回滚机制
- 临时文件自动清理
- 路径验证和创建

🚧 **计划中的功能**：
- 支持更多图片格式（WebP、TIFF）
- 图片压缩选项
- 批量粘贴功能
- 图片水印功能
- 历史记录管理

## 更新日志

详见 [CHANGELOG.md](./CHANGELOG.md)