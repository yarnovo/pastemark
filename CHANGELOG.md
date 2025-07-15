# 更新日志

所有重要的更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 新增
- 初始版本发布
- 支持从剪贴板粘贴图片到 Markdown 文件
- 手动命名模式：选中文本作为图片文件名
- 智能命名模式：集成 Ollama AI 自动生成语义化文件名
- 支持多种图片格式（PNG、JPG、GIF、BMP、WebP 等）
- 快捷键支持（Shift+Alt+V）
- 跨平台支持（Windows、macOS、Linux、WSL）
- 自动降级策略：Ollama 不可用时使用时间戳命名
- 可配置的 Ollama 服务设置
- 支持自定义 AI 提示词
- 完整的错误处理和用户提示

### 技术特性
- TypeScript 开发，类型安全
- 模块化架构设计
- 完整的测试覆盖（单元测试、集成测试、端到端测试）
- 资源文件自动管理
- 智能缓存机制