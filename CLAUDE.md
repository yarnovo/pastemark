# PasteMark 项目记忆

## 剪贴板图片读取实现

### 问题背景
VSCode Extension API 不支持直接读取剪贴板中的二进制图片数据，只能读取文本。Windows Snipping Tool 截图后的图片无法通过 `vscode.env.clipboard.readText()` 读取。

### 解决方案
通过调用系统命令的方式实现跨平台剪贴板图片读取：

1. **Windows**: 使用 PowerShell 脚本调用 .NET Framework 的 `System.Windows.Forms.Clipboard`
2. **macOS**: 使用 AppleScript 读取剪贴板图片
3. **Linux**: 使用 xclip (X11) 或 wl-paste (Wayland)
4. **WSL**: 调用 Windows 的 PowerShell，并转换路径格式

### 架构设计
```
src/clipboard/
├── types.ts              # 接口定义
├── base.ts               # 基类实现
├── clipboardManager.ts   # 统一管理器
├── windows.ts            # Windows 实现
├── macos.ts              # macOS 实现
├── linux.ts              # Linux 实现
└── wsl.ts                # WSL 实现

src/resources/            # 系统脚本
├── windows-clipboard.ps1
├── mac-clipboard.applescript
└── linux-clipboard.sh
```

### 重要提示
- 资源文件需要在构建时复制到 out 目录
- PowerShell 脚本支持多种剪贴板格式（PNG、Bitmap、DIB）
- 临时文件使用后需要清理
- WSL 环境需要特殊的路径转换处理