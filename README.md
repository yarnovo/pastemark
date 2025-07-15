# PasteMark

一个智能的 VSCode 插件，让您在 Markdown 文件中快速粘贴图片。支持手动命名和 AI 智能命名两种模式。

## 简介

PasteMark 让图片粘贴变得简单高效。无论您是在撰写技术文档、博客文章还是笔记，只需一个快捷键就能将剪贴板中的图片保存到本地并插入到 Markdown 文件中。

### 核心亮点

- 🚀 **一键粘贴** - 使用 `Ctrl+Alt+V` 快速粘贴图片
- 🎯 **智能命名** - 集成 Ollama AI 自动生成语义化文件名
- 📝 **手动命名** - 选中文本作为图片文件名
- 🔧 **零配置** - 开箱即用，可选配置 AI 功能

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

- 🎨 支持多种图片格式（PNG、JPG、GIF 等）
- 📁 图片自动保存到 Markdown 文件同级目录
- ⚡ 快速响应，1 秒内完成操作
- 🛡️ 错误处理完善，使用体验流畅
- 🐧 完美支持 WSL2 环境

## 安装

### 方式一：从 VSCode 扩展市场安装

1. 打开 VSCode
2. 按下 `Ctrl+Shift+X` 打开扩展面板
3. 搜索 "PasteMark"
4. 点击安装

### 方式二：从源码安装

```bash
# 克隆仓库
git clone https://github.com/yarnovo/pastemark.git
cd pastemark

# 安装依赖
npm install

# 编译
npm run compile

# 在 VSCode 中按 F5 调试运行
```

## 使用方法

### 基本使用

1. **手动命名**：在 Markdown 文件中选中要作为图片描述的文本
2. **复制图片**：复制任意图片到剪贴板
3. **粘贴图片**：按下 `Ctrl+Alt+V`（Mac 上为 `Cmd+Alt+V`）

### 使用示例

#### 示例 1：手动命名

```markdown
<!-- 选中 "系统架构图" 这几个字，然后按 Ctrl+Alt+V -->
系统架构图

<!-- 自动转换为 -->
![系统架构图](./系统架构图.png)
```

#### 示例 2：智能命名（需要 Ollama）

```markdown
<!-- 光标在此处，直接按 Ctrl+Alt+V -->
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
  
  // 使用的模型（需要支持图片输入）
  "pastemark.ollamaModel": "llava",
  
  // 图片保存路径（相对于当前文件）
  "pastemark.imagePath": "./",
  
  // 默认图片格式
  "pastemark.imageFormat": "png"
}
```

### 配置 Ollama（可选）

如果您想使用 AI 智能命名功能：

1. **安装 Ollama**
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. **下载支持视觉的模型**
   ```bash
   ollama pull llava
   ```

3. **启动 Ollama 服务**
   ```bash
   ollama serve
   ```

## 常见问题

### Q: 为什么粘贴时提示"剪贴板中没有图片"？

A: 请确保您已经复制了图片到剪贴板。支持从以下来源复制：
- 截图工具
- 网页中的图片（右键复制图片）
- 其他应用程序中的图片

### Q: 如何在 WSL2 中使用？

A: PasteMark 已经针对 WSL2 环境优化，确保：
1. 使用最新版本的 WSL2
2. 安装了 `wl-clipboard` 包：`sudo apt install wl-clipboard`

### Q: Ollama 连接失败怎么办？

A: 检查以下几点：
1. Ollama 服务是否正在运行
2. 防火墙是否允许 11434 端口
3. 在设置中确认 endpoint 地址正确

### Q: 支持哪些图片格式？

A: 支持所有常见图片格式：PNG、JPG、JPEG、GIF、BMP、WebP 等。

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

## 更新日志

暂无发布版本。