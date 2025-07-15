# PasteMark 运维文档

## 构建和发布

### 本地开发
```bash
# 安装依赖
npm install

# 编译 TypeScript
npm run compile

# 监听文件变化
npm run watch

# 运行测试
npm test

# 代码检查
npm run check
```

### 打包扩展
```bash
# 安装打包工具
npm install -g @vscode/vsce

# 打包稳定版本
vsce package --no-dependencies

# 打包预发布版本
vsce package --pre-release --no-dependencies
```

## 工具脚本

### 1. Logo 处理脚本

**脚本位置**: `scripts/process-logo.js`

**功能说明**: 
自动处理扩展的 logo 图片，确保符合 VSCode Marketplace 的要求。

**使用方法**:
```bash
# 1. 将原始 logo 图片放在项目根目录，命名为 logo.png
# 2. 运行脚本
node scripts/process-logo.js
```

**处理流程**:
1. 读取根目录的 `logo.png` 文件
2. 分析图片信息（尺寸、格式、大小）
3. 自动调整到 256x256 像素
4. 使用最高压缩级别优化文件大小
5. 输出到 `images/logo.png`
6. 显示处理结果和规格检查

**输出示例**:
```
📋 原始图片信息：
📐 尺寸：1328x1328
🎨 格式：png
💾 大小：1541.14 KB
🌈 通道：3 (无透明通道)

🔄 正在处理图片...

✅ 处理完成！
📋 新图片信息：
📐 尺寸：256x256
💾 大小：50.33 KB
📍 位置：/home/yarnb/pastemark/images/logo.png
📉 压缩率：96.7%

🔍 规格检查：
✅ 尺寸符合要求（256x256）
✅ 文件大小符合要求（< 200KB）
```

**注意事项**:
- 需要先安装 sharp 依赖：`npm install --save-dev sharp`
- 原始图片建议使用 PNG 格式
- 处理后会保留透明通道（如果有）
- 自动优化到小于 200KB

### 2. 资源复制脚本

**脚本位置**: `scripts/copy-resources.js`

**功能说明**: 
将系统脚本资源复制到编译输出目录。

**自动执行时机**:
- `npm run compile`
- `npm run vscode:prepublish`

**复制的资源**:
- `windows-clipboard.ps1` - Windows 剪贴板读取脚本
- `mac-clipboard.applescript` - macOS 剪贴板读取脚本
- `linux-clipboard.sh` - Linux 剪贴板读取脚本

### 3. 更新日志脚本

**脚本位置**: `scripts/update-changelog.js`

**功能说明**: 
自动更新 CHANGELOG.md 文件。

**自动执行时机**:
- `npm version` 命令时自动运行

## CI/CD 流程

### GitHub Actions 工作流

**配置文件**: `.github/workflows/ci-cd.yaml`

**触发条件**:
- Push 到 main 分支
- Pull Request 到 main 分支
- 创建版本标签（v*）
- 手动触发

**版本发布规则**:
- 稳定版标签：`v1.0.0` → 发布到正式渠道
- 预发布版标签：`v1.0.0-alpha.1`、`v1.0.0-dev.1` 等 → 发布为预发布版本

### 发布流程

1. **创建版本标签**:
   ```bash
   # 稳定版
   git tag v1.0.0
   git push origin v1.0.0
   
   # 预发布版
   git tag v1.0.0-alpha.1
   git push origin v1.0.0-alpha.1
   ```

2. **自动化流程**:
   - CI：运行测试、代码检查、构建
   - Package：打包扩展为 .vsix 文件
   - Publish：发布到 VSCode Marketplace
   - Release：创建 GitHub Release

## 环境要求

### 开发环境
- Node.js 16.x 或更高版本
- npm 7.x 或更高版本
- VSCode 1.74.0 或更高版本

### CI 环境
- Ubuntu 最新版
- Node.js 20.x
- Xvfb（用于运行测试）

### 发布权限
- VSCode Marketplace 发布者账号
- Personal Access Token（存储在 GitHub Secrets 中）

## 故障排查

### 常见问题

1. **Logo 处理失败**
   - 确保安装了 sharp：`npm install --save-dev sharp`
   - 检查原始图片是否为有效的图片格式
   - 确保有写入 images 目录的权限

2. **资源文件未找到**
   - 运行 `npm run copy-resources` 手动复制资源
   - 检查 src/resources 目录是否包含所需脚本文件

3. **发布失败**
   - 检查版本号格式是否正确
   - 确认 VSCE_PAT 是否有效
   - 预发布版本需要使用支持的后缀（alpha、beta、rc、dev）

## 监控和维护

### 关键指标
- 扩展包大小（建议 < 1MB）
- Logo 文件大小（必须 < 200KB）
- 测试覆盖率（目标 > 60%）
- 构建时间（目标 < 5分钟）

### 定期维护
- 更新依赖包
- 清理未使用的代码和资源
- 优化构建流程
- 更新文档