# PasteMark Demo - 使用 Ollama 智能命名

这个演示展示了如何使用 PasteMark 的 Ollama 智能命名功能。

## 配置说明

本演示配置了以下设置：

```json
{
  "pastemark.ollamaEnabled": true,
  "pastemark.ollamaEndpoint": "http://localhost:11434",
  "pastemark.ollamaModel": "qwen2-vl",
  "pastemark.ollamaPrompt": "分析这个图片并提供一个简短的描述性文件名（2-4个词，中文，用连字符分隔，不要扩展名）。例如：\"用户界面设计\" 或 \"系统架构图\"。只返回文件名，不要其他内容。",
  "pastemark.imagePath": "./images/",
  "pastemark.imageFormat": "png"
}
```

## 特点

- ✅ **启用 Ollama 智能命名**
- 🤖 **使用 qwen2-vl 模型**（优秀的中英文支持）
- 🇨🇳 **生成中文文件名**
- 📁 **图片保存到 images 文件夹**

## 使用前准备

1. **安装 Ollama**：
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. **下载 qwen2-vl 模型**：
   ```bash
   ollama pull qwen2-vl
   ```

3. **启动 Ollama 服务**：
   ```bash
   ollama serve
   ```

## 使用方法

1. **打开此文件夹**：在 VSCode 中打开 `demo/with-ollama` 文件夹
2. **复制图片**：复制任意图片到剪贴板
3. **粘贴图片**：在 `test.md` 文件中按 `Shift+Alt+V`
4. **智能命名**：系统会自动使用 qwen2-vl 模型分析图片并生成中文文件名

## 测试区域

请在 `test.md` 文件中测试图片粘贴功能。

## 故障排除

如果智能命名不工作，请检查：

1. **Ollama 服务状态**：
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. **模型是否已下载**：
   ```bash
   ollama list
   ```

3. **重启 Ollama 服务**：
   ```bash
   ollama serve
   ```

## 预期效果

- 图片会被保存到 `images/` 文件夹
- 文件名会是中文描述，如：`用户界面设计.png`、`系统架构图.png`
- 如果 Ollama 不可用，会自动降级为时间戳命名