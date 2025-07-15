# 更新日志

所有重要的更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 新增
- **核心功能**
  - 支持从剪贴板粘贴图片到 Markdown 文件（快捷键：`Shift+Alt+V`）
  - 手动命名模式：选中文本后粘贴，使用选中文本作为图片文件名
  - 智能命名模式：集成 Ollama AI 自动分析图片内容生成语义化文件名
  - 自动降级策略：Ollama 服务不可用时自动降级为时间戳命名

- **跨平台支持**
  - Windows：使用 PowerShell 脚本读取剪贴板
  - macOS：使用 AppleScript 读取剪贴板
  - Linux：支持 X11 (xclip) 和 Wayland (wl-paste)
  - WSL：自动调用 Windows PowerShell 并转换路径

- **配置选项**
  - 可配置 Ollama 服务地址、模型和提示词
  - 支持自定义图片保存路径
  - 支持设置默认图片格式

- **用户体验**
  - 文件名自动去重，避免覆盖已有文件
  - 完善的错误提示和处理机制
  - 内置输出通道记录详细日志
  - 支持多种图片格式（PNG、JPG、JPEG、GIF、BMP）

### 技术特性
- TypeScript 严格模式开发，类型安全
- 模块化架构设计，易于维护和扩展
- 完整的测试套件（78个测试用例，55.91% 覆盖率）
- 资源文件自动复制机制
- Ollama 服务可用性缓存（1分钟）
- 错误自动回滚和临时文件清理

[0.1.0-alpha]: https://github.com/yarnovo/pastemark/releases/tag/v0.1.0-alpha