# 部署文档

本文档详细介绍 PasteMark 项目的 CI/CD 流程和部署步骤。

## CI/CD 流程概述

PasteMark 使用 GitHub Actions 实现自动化的持续集成和持续部署。整个流程包括：

1. **持续集成（CI）**：代码提交后自动进行质量检查和测试
2. **持续部署（CD）**：通过 Git tag 触发自动发布到 VSCode Marketplace

## 工作流触发条件

### 自动触发

- **推送到 main 分支**：运行 CI 流程
- **创建 Pull Request**：运行 CI 流程，确保代码质量
- **创建版本 Tag**：运行完整的 CI/CD 流程，包括发布

### 手动触发

可以在 GitHub Actions 页面手动触发工作流运行。

## CI 流程详解

### 构建环境

- 操作系统：Ubuntu Latest
- Node.js 版本：20.x

### 代码质量检查步骤

1. **安装依赖**
   ```bash
   npm ci
   ```

2. **运行 Linter**
   ```bash
   npm run lint
   ```

3. **TypeScript 类型检查**
   ```bash
   npm run typecheck
   ```

4. **运行测试**
   ```bash
   npm test
   ```

5. **生成测试覆盖率报告**
   ```bash
   npm run test:coverage
   ```
   > 注：覆盖率报告仅在本地生成，不会上传到外部服务

6. **构建扩展**
   ```bash
   npm run vscode:prepublish
   ```

## CD 流程详解

### 发布前提条件

1. 创建符合语义化版本的 Git tag（如 `v1.0.0`）
2. 在本地更新 package.json 中的版本号
3. 配置 GitHub Secret：`VSCE_PAT`

### 发布步骤

1. **打包扩展**：使用 vsce 打包成 .vsix 文件
2. **发布到 Marketplace**：自动发布到 VSCode 扩展市场
3. **创建 GitHub Release**：包含 .vsix 文件和更新说明

## 部署准备

### 1. 获取 VSCode Marketplace 发布令牌

1. 访问 [Azure DevOps](https://dev.azure.com/)
2. 创建个人访问令牌（PAT）
   - 点击右上角用户设置 → Personal access tokens
   - 点击 "New Token" 创建新令牌
   - **重要**：在 "Organization" 下拉框中选择 "All accessible organizations"（这是避免 401 错误的关键）
3. 权限范围选择：
   - 推荐选择 "Full access"（所有权限）
   - 或者至少选择 "Marketplace" → "Manage"
4. 设置令牌有效期（建议 90 天或更长）
5. 保存生成的令牌（注意：令牌只显示一次，请妥善保存）

### 2. 配置 GitHub Secret

在仓库设置中添加 Secret：

| Secret 名称 | 说明 | 必需 |
|------------|------|------|
| VSCE_PAT | VSCode Marketplace 发布令牌 | ✅ |

### 3. 创建发布者账号

如果还没有发布者账号：

```bash
# 安装 vsce（注意：包名已从 vsce 更改为 @vscode/vsce）
npm install -g @vscode/vsce

# 创建发布者（注意：create-publisher 命令已弃用）
# 现在需要直接在 Visual Studio Marketplace 网站上创建发布者：
# 1. 访问 https://marketplace.visualstudio.com/manage/publishers/
# 2. 使用 Microsoft 账号登录
# 3. 点击 "Create publisher" 创建新的发布者
# 4. 填写发布者 ID、显示名称等信息

# 登录发布者账号（创建发布者后执行）
vsce login <publisher-name>
```

## 发布流程

### 版本管理

1. **在本地更新版本号**：
   ```bash
   # 修改 package.json 中的 version 字段
   # 例如：从 "0.0.0" 改为 "1.0.0"
   ```

2. **提交版本更新**：
   ```bash
   git add package.json
   git commit -m "chore: bump version to 1.0.0"
   git push origin main
   ```

### 创建发布

1. **创建并推送 tag**：
   ```bash
   # 创建版本 tag
   git tag v1.0.0
   
   # 推送 tag 到远程仓库
   git push origin v1.0.0
   ```

2. **监控发布过程**：
   - 访问仓库的 Actions 页面
   - 查看 CI/CD 工作流执行状态
   - 确认发布成功

### 手动发布（备用方案）

如果自动发布失败，可以手动发布：

```bash
# 安装依赖
npm ci

# 构建项目
npm run vscode:prepublish

# 打包扩展
vsce package

# 发布到 Marketplace
vsce publish
```

## 版本号规范

遵循语义化版本规范（Semantic Versioning）：

- **主版本号（Major）**：不兼容的 API 修改
- **次版本号（Minor）**：向下兼容的功能新增
- **修订号（Patch）**：向下兼容的问题修正

### 版本 Tag 格式

- 必须以 `v` 开头
- 后跟语义化版本号
- 示例：`v1.0.0`、`v1.2.3`、`v2.0.0`

## 发布检查清单

发布前请确保：

- [ ] 所有测试通过
- [ ] 代码已经过 review
- [ ] package.json 中的版本号已更新
- [ ] CHANGELOG.md 已更新
- [ ] README.md 中的功能说明是最新的
- [ ] 没有调试代码或临时修改
- [ ] 资源文件（如脚本）都包含在构建中

## 故障排除

### CI 失败

1. **测试失败**：
   ```bash
   # 本地运行测试
   npm test
   ```

2. **类型检查失败**：
   ```bash
   # 查看类型错误
   npm run typecheck
   ```

3. **Lint 错误**：
   ```bash
   # 查看并修复 lint 问题
   npm run lint
   ```

### CD 失败

1. **VSCE_PAT 无效**：
   - 检查令牌是否过期
   - 确认令牌权限正确
   - 重新生成并更新 Secret

2. **打包失败**：
   - 确保所有必需文件都存在
   - 检查 .vscodeignore 配置

## 监控和维护

### 构建状态

在 README.md 中添加构建状态徽章：

```markdown
[![CI/CD](https://github.com/yarnovo/pastemark/actions/workflows/ci-cd.yaml/badge.svg)](https://github.com/yarnovo/pastemark/actions/workflows/ci-cd.yaml)
```

### 依赖更新

定期更新项目依赖：

```bash
# 检查过时的依赖
npm outdated

# 更新依赖
npm update

# 运行测试确保兼容性
npm test
```

## 最佳实践

1. **版本管理**：在本地管理版本号，确保与 tag 一致
2. **测试先行**：发布前确保所有测试通过
3. **文档同步**：及时更新 CHANGELOG.md
4. **小步迭代**：频繁发布小版本，降低风险

## 相关资源

- [GitHub Actions 文档](https://docs.github.com/cn/actions)
- [VSCode 扩展发布指南](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [vsce 命令行工具](https://github.com/microsoft/vscode-vsce)