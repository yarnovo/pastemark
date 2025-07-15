# 本地打包和测试指南

## 本地打包

### 1. 安装 vsce 工具
```bash
npm install -g @vscode/vsce
```

### 2. 编译和准备资源
```bash
npm run vscode:prepublish
```

### 3. 打包扩展
```bash
# 普通打包
vsce package

# 打包预发布版本（支持 -alpha.0 等后缀）
vsce package --pre-release

# 不包含依赖的打包（推荐）
vsce package --no-dependencies
```

打包完成后会生成 `pastemark-x.x.x.vsix` 文件。

## 本地安装测试

### 方法一：通过 VSCode 界面安装
1. 打开 VSCode
2. 按 `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`) 打开命令面板
3. 输入 `Extensions: Install from VSIX...`
4. 选择生成的 `.vsix` 文件
5. 重启 VSCode

### 方法二：通过命令行安装
```bash
code --install-extension pastemark-x.x.x.vsix
```

### 方法三：在新的 VSCode 实例中测试
```bash
# 在隔离的环境中测试，不影响主 VSCode
code --extensionDevelopmentPath=. --new-window
```

## 测试功能

1. 打开一个 Markdown 文件
2. 复制一张图片到剪贴板（截图或复制图片文件）
3. 使用快捷键 `Shift+Alt+V` 粘贴图片
4. 测试两种命名模式：
   - 选中文本后粘贴：使用选中文本作为文件名
   - 不选中文本粘贴：使用 AI 智能命名（需要 Ollama 服务）

## 卸载测试版本

### 通过 VSCode 界面
1. 打开扩展面板
2. 找到 PasteMark
3. 点击卸载

### 通过命令行
```bash
code --uninstall-extension yarnovo.pastemark
```

## 版本号规则

- 稳定版：`v1.0.0`
- 预发布版：
  - Alpha 版本：`v1.0.0-alpha.1`（早期测试版）
  - Beta 版本：`v1.0.0-beta.1`（功能完整的测试版）
  - RC 版本：`v1.0.0-rc.1`（发布候选版）
  - Dev 版本：`v1.0.0-dev.1`（开发版本）

CI/CD 会根据 tag 名称自动判断发布类型：
- 稳定版 tag：`v1.0.0` → 发布到正式渠道
- 预发布版 tag：`v1.0.0-alpha.1`、`v1.0.0-dev.1` 等 → 发布为预发布版本
