# 更新日志

所有重要的更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 新增
- **统一消息管理系统**
  - 新增消息常量文件 `src/constants/messages.ts`
  - 新增消息服务类 `src/services/messageService.ts`
  - 统一管理所有用户通知消息，便于维护和国际化

### 改进
- **开发体验**
  - 添加 `lint:fix` 命令到 package.json
  - 重构 PasteImageCommand 使用统一的消息服务
  - 优化项目文档结构

## [0.1.1] - 2025-07-17

### 修复
- 项目结构优化，删除不必要的营销策略文档

### 改进
- 完善 CI/CD 配置，新增权限设置以允许创建 release
- 添加 GitHub Token 支持发布步骤

## [0.1.0] - 2025-07-16

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

### 改进
- 优化 PasteImageCommand 类，将错误和信息提示更新为英文
- 新增带进度提示的文件名生成方法，提升用户体验
- 简化 CI/CD 配置，优化扩展打包和发布流程

### 技术特性
- TypeScript 严格模式开发，类型安全
- 模块化架构设计，易于维护和扩展
- 完整的测试套件（78个测试用例，55.91% 覆盖率）
- 资源文件自动复制机制
- Ollama 服务可用性缓存（1分钟）
- 错误自动回滚和临时文件清理

## [0.1.0-alpha.1] - 2024-11-XX

### 新增
- 新增 VSCode Markdown 图片粘贴插件调研报告
- 新增中文 README 文档，详细介绍功能、安装和使用方法
- 添加 logo 图片处理脚本和相关资源文件

### 改进
- 优化 CI/CD 配置以支持新功能
- 更新 package.json 和 package-lock.json 依赖

## [0.1.0-alpha.0] - 2024-11-XX

### 新增
- **项目基础结构**
  - 初始化项目，创建基础文件结构
  - 添加 .gitignore、.vscodeignore、package.json 等配置文件
  - 创建 README.md 和项目需求文档

- **核心架构**
  - 实现跨平台剪贴板图片读取功能
  - 新增相关文档和资源文件
  - 支持 Windows、macOS、Linux 和 WSL 环境

- **开发工具**
  - 添加 Prettier 和 ESLint 配置
  - 优化代码格式化和静态检查
  - 新增 TypeScript 配置

- **测试和部署**
  - 更新测试配置，新增端到端测试用例
  - 优化测试环境设置，支持多种图片格式处理
  - 完善 CI/CD 配置，新增显示环境设置

### 文档
- 新增 CHANGELOG.md、DEPLOYMENT.md 和 LICENSE 文件
- 完善项目文档和结构
- 新增自动更新 CHANGELOG 脚本

[Unreleased]: https://github.com/yarnovo/pastemark/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/yarnovo/pastemark/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/yarnovo/pastemark/compare/v0.1.0-alpha.1...v0.1.0
[0.1.0-alpha.1]: https://github.com/yarnovo/pastemark/compare/v0.1.0-alpha.0...v0.1.0-alpha.1
[0.1.0-alpha.0]: https://github.com/yarnovo/pastemark/releases/tag/v0.1.0-alpha.0