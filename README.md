# PasteMark

[English](./README.md) | [中文](./README_zh.md)

An intelligent VSCode extension that allows you to quickly paste images in Markdown files. Supports both manual naming and AI-powered intelligent naming modes.

## Introduction

PasteMark makes image pasting simple and efficient. Whether you're writing technical documentation, blog posts, or notes, just use a single shortcut to save clipboard images locally and insert them into your Markdown files.

### Key Features

- 🚀 **One-Key Paste** - Quick paste images with `Shift+Alt+V`
- 🎯 **Smart Naming** - Integrated Ollama AI for automatic semantic filename generation
- 📝 **Manual Naming** - Use selected text as image filename
- 🔧 **Zero Configuration** - Works out of the box, optional AI features
- 🌍 **Cross-Platform** - Perfect support for Windows, macOS, Linux, and WSL

## Features

### Two Usage Modes

1. **Manual Naming Mode**
   - Select text and press the shortcut
   - Uses selected text as the image filename
   - Perfect for precise filename control

2. **Smart Naming Mode**
   - Press shortcut directly without text selection
   - Analyzes image content using Ollama multimodal models
   - Auto-generates descriptive English filenames
   - Falls back to timestamp naming when Ollama is unavailable

### Additional Features

- 🎨 Supports multiple image formats (PNG, JPG, GIF, BMP)
- 📁 Auto-saves images to the same directory as the Markdown file (configurable)
- ⚡ Fast response with 3-second timeout and automatic fallback
- 🛡️ Robust error handling with automatic rollback and cleanup
- 🐧 Perfect WSL environment support
- 📊 Built-in debug log output channel
- 🔄 Automatic filename deduplication to prevent overwrites
- 💾 Ollama service availability caching (1 minute)
- 🔒 Safe filename processing (removes special characters)
- 📏 Filename length limit (max 255 characters)

## Installation

### Method 1: Install from VSCode Marketplace

1. Open VSCode
2. Press `Shift+X` to open the Extensions panel
3. Search for "PasteMark"
4. Click Install

### Method 2: Install from Source

```bash
# Clone repository
git clone https://github.com/yarnovo/pastemark.git
cd pastemark

# Install dependencies
npm install

# Compile and copy resources
npm run compile
npm run copy-resources

# Press F5 in VSCode to debug
```

## Usage

### Basic Usage

1. **Manual Naming**: Select text in Markdown file to use as image description
2. **Copy Image**: Copy any image to clipboard
3. **Paste Image**: Press `Shift+Alt+V`

### Usage Examples

#### Example 1: Manual Naming

```markdown
<!-- Select "system architecture" text, then press Shift+Alt+V -->
system architecture

<!-- Auto-converts to -->
![system architecture](./system-architecture.png)
```

#### Example 2: Smart Naming (requires Ollama)

```markdown
<!-- Cursor here, press Shift+Alt+V directly -->
|

<!-- Auto-inserts (assuming AI identifies as user interface flow) -->
![user-interface-flow](./user-interface-flow.png)
```

#### Example 3: Fallback Naming (when Ollama unavailable)

```markdown
<!-- Cursor here, Ollama service not running -->
|

<!-- Auto-inserts with timestamp naming -->
![image](./image-20250115-143025.png)
```

## Configuration Options

Configure the following options in VSCode settings:

```json
{
  // Enable/disable Ollama smart naming
  "pastemark.ollamaEnabled": true,
  
  // Ollama service endpoint
  "pastemark.ollamaEndpoint": "http://localhost:11434",
  
  // Model to use (any Ollama model supporting image input)
  "pastemark.ollamaModel": "llava",
  
  // Custom prompt (specify language, format, and style)
  "pastemark.ollamaPrompt": "Analyze this image and provide a short, descriptive filename (2-4 words, English, use hyphens to separate words, no file extension). For example: \"user-interface-design\" or \"system-architecture\". Only respond with the filename, nothing else.",
  
  // Image save path (relative to current file)
  "pastemark.imagePath": "./",
  
  // Default image format (supports png, jpg, jpeg, gif, bmp)
  "pastemark.imageFormat": "png"
}
```

## Ollama Smart Naming Setup

To use AI smart naming features, complete these **4 required steps**:

### 1. Install Ollama

**Windows/macOS**:
- Visit [https://ollama.com/](https://ollama.com/) to download installer

**Linux**:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Start Ollama Service

```bash
# Method 1: Direct start (foreground)
ollama serve

# Method 2: Background start
nohup ollama serve > ollama.log 2>&1 &
```

⚠️ **Important**: Ollama service must remain running for AI features to work.

### 3. Download Vision Model

```bash
# Download default llava model (~4GB)
ollama pull llava

# Or choose other vision models
ollama pull llava:13b    # Higher accuracy, ~8GB
ollama pull qwen2-vl     # 2025 recommended, great Chinese/English support
ollama pull pixtral      # Latest technology
ollama pull moondream    # Lightweight and fast

# Supports any Ollama vision model
ollama pull your-preferred-vision-model
```

### 4. Verify Installation

```bash
# Check Ollama service status
curl http://localhost:11434/api/tags

# List installed models
ollama list

# Test model (optional)
ollama run llava "Describe this image" --image /path/to/image.jpg
ollama run qwen2-vl "Analyze this image" --image /path/to/image.jpg
```

### 5. VSCode Configuration

Confirm the following settings in VSCode:

```json
{
  "pastemark.ollamaEnabled": true,
  "pastemark.ollamaEndpoint": "http://localhost:11434",
  "pastemark.ollamaModel": "llava",
  "pastemark.ollamaPrompt": "Analyze this image and provide a short, descriptive filename (2-4 words, English, use hyphens to separate words, no file extension). For example: \"user-interface-design\" or \"system-architecture\". Only respond with the filename, nothing else."
}
```

### Usage Workflow

1. **Preparation**:
   - Ensure Ollama service is running
   - Ensure required models are downloaded (e.g., llava, qwen2-vl)
   - Ensure VSCode configuration is correct

2. **Usage**:
   - Take screenshot or copy image to clipboard
   - Press `Shift+Alt+V` in Markdown file
   - System automatically checks Ollama service availability
   - If available, sends image to configured model for analysis
   - If unavailable, falls back to timestamp naming

### Troubleshooting

**Common Issues and Solutions**:

1. **Service Unavailable**:
   ```bash
   # Check service status
   curl http://localhost:11434/api/tags
   
   # Restart service
   ollama serve
   ```

2. **Model Not Found**:
   ```bash
   # Check installed models
   ollama list
   
   # Download required model
   ollama pull llava
   ollama pull qwen2-vl
   ollama pull your-configured-model
   ```

3. **Network Timeout**:
   - Check if localhost:11434 port is in use
   - Check firewall settings

4. **Empty Result**:
   - Image content may not be recognizable
   - Try different images

### Performance Optimization

1. **Model Selection**:
   - `llava` (default) - Balanced performance and accuracy
   - `llava:13b` - Higher accuracy but slower
   - `moondream` - Faster but lower accuracy

2. **System Resources**:
   - Recommend at least 8GB RAM
   - SSD improves model loading speed

3. **Caching Strategy**:
   - Service availability check cached for 1 minute
   - Avoids frequent network requests

## Model and Prompt Configuration

### Supported Models

PasteMark supports all Ollama vision models with **no model restrictions**. You can use any model that supports image input:

#### Commonly Recommended Models

| Model Name | Parameters | Recommended Use | Performance |
|------------|------------|-----------------|-------------|
| `llava` | 7B | Default choice | Balanced performance |
| `llava:13b` | 13B | High-quality naming | More accurate descriptions |
| `llava:34b` | 34B | Professional use | Highest accuracy |
| `llava-llama3` | 8B | Next generation | Based on Llama 3 |
| `qwen2-vl` | 7B | 2025 recommended | Excellent Chinese/English |
| `qwen2-vl:72b` | 72B | Top performance | Industrial applications |
| `pixtral` | 12B | Latest tech | Advanced vision understanding |
| `moondream` | 1.7B | Lightweight | Resource-constrained environments |

#### Custom Models

You can also use:
- Any Ollama-supported vision model
- Custom trained models
- Future released models

**Example Configuration**:
```json
{
  "pastemark.ollamaModel": "your-custom-vision-model",
  "pastemark.ollamaModel": "llava-next:34b", 
  "pastemark.ollamaModel": "future-vision-model:v2"
}
```

### Custom Prompts

Fully customize AI behavior through `pastemark.ollamaPrompt` configuration:

#### English Filenames (Default)
```json
{
  "pastemark.ollamaPrompt": "Analyze this image and provide a short, descriptive filename (2-4 words, English, use hyphens to separate words, no file extension). For example: \"user-interface-design\" or \"system-architecture\". Only respond with the filename, nothing else."
}
```

#### Chinese Filenames
```json
{
  "pastemark.ollamaPrompt": "分析这个图片并提供一个简短的描述性文件名（2-4个词，中文，用连字符分隔，不要扩展名）。例如：\"用户界面设计\" 或 \"系统架构图\"。只返回文件名，不要其他内容。"
}
```

#### Technical Style Naming
```json
{
  "pastemark.ollamaPrompt": "Analyze this image and generate a technical filename using programming conventions (lowercase, underscores, descriptive, no file extension). Examples: \"api_endpoint_diagram\", \"database_schema\". Only respond with the filename."
}
```

#### Detailed Description Style
```json
{
  "pastemark.ollamaPrompt": "Analyze this image and create a detailed descriptive filename (5-8 words, English, use hyphens, no file extension). Be specific about what you see. Examples: \"mobile-app-login-screen-mockup\", \"data-flow-architecture-diagram-overview\"."
}
```

#### Short Style
```json
{
  "pastemark.ollamaPrompt": "Analyze this image and provide a very short filename (1-2 words, English, lowercase, no file extension). Examples: \"diagram\", \"mockup\", \"chart\"."
}
```

### Configuring Model and Prompt

1. **Via VSCode Settings UI**:
   - Open VSCode Settings (`,`)
   - Search for "pastemark"
   - Modify `Ollama Model` and `Ollama Prompt`

2. **Via settings.json**:
   ```json
   {
     "pastemark.ollamaModel": "qwen2-vl",
     "pastemark.ollamaPrompt": "Analyze the image and generate a Chinese filename (2-3 words, hyphen-separated)"
   }
   ```

3. **Via Workspace Settings**:
   Create `.vscode/settings.json` in project root

### Model Compatibility

PasteMark uses standard Ollama API, compatible with all Ollama-supported vision models:

- ✅ **Existing Models**: All currently available vision models
- ✅ **Future Models**: Automatically supports newly released models  
- ✅ **Custom Models**: Supports user-trained models
- ✅ **Version Variants**: Supports different parameter scale variants

**Verify Model Availability**:
```bash
# View installed models
ollama list

# Test if model supports images
ollama run your-model "describe this image" --image test.jpg
```

## FAQ

### Q: Why does it say "No image in clipboard" when pasting?

A: Make sure you've copied an image to clipboard. Supported sources:
- Screenshot tools (Windows Snipping Tool, macOS Screenshot, Linux Screenshot)
- Images from web pages (right-click copy image)
- Images from other applications

### Q: How to use in WSL?

A: PasteMark is optimized for WSL environments:
1. Automatically calls Windows PowerShell to read clipboard
2. Automatically converts path formats
3. Supports both WSL 1 and WSL 2
4. No additional configuration needed

### Q: What if Ollama connection fails?

A: Follow all **4 required steps** in the **Ollama Smart Naming Setup** section:
1. Install Ollama
2. Start Ollama service
3. Download models (e.g., llava, qwen2-vl)
4. Verify installation

To use a specific model, ensure it's downloaded:
```bash
ollama pull your-desired-model
```

### Q: What image formats are supported?

A: Supports: PNG, JPG, JPEG, GIF, BMP. Default saves as PNG, configurable.

### Q: Where are images saved?

A: Default saves in the same directory as the Markdown file. Configure via `pastemark.imagePath`:
- `"./"`: Current file directory (default)
- `"./images/"`: images subdirectory
- `"../assets/"`: parent directory's assets folder

### Q: What happens with duplicate filenames?

A: PasteMark automatically handles filename conflicts:
- If file exists, automatically adds numeric suffix
- Example: `diagram.png` → `diagram-1.png` → `diagram-2.png`

## Contributing

Issues and Pull Requests are welcome!

## License

MIT License

## Development Status

✅ **Completed Features**:
- Core functionality (clipboard image detection, file saving, Markdown syntax generation)
- Manual naming mode (selected text as filename)
- Smart naming mode (Ollama AI integration)
- Fallback strategy (timestamp naming when Ollama unavailable)
- Complete test suite (78 tests, 55.91% coverage)
- TypeScript type safety
- Modular architecture design
- Cross-platform clipboard support (Windows, macOS, Linux, WSL)
- Complete extension entry implementation
- Output channel logging
- Filename deduplication mechanism
- Error rollback mechanism
- Automatic temporary file cleanup
- Path validation and creation

🚧 **Planned Features**:
- Support more image formats (WebP, TIFF)
- Image compression options
- Batch paste functionality
- Image watermark feature
- History management

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)