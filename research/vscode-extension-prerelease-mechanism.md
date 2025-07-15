# VSCode 扩展预发布机制调研报告

## 调研背景

在 PasteMark 项目的 CI/CD 配置中，我们遇到了版本 `0.1.0-alpha.1` 无法发布到 VSCode Marketplace 的问题。错误信息为：

```
Error: The VS Marketplace doesn't support prerelease versions: '0.1.0-alpha.1'. 
Checkout our pre-release versioning recommendation here: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#prerelease-extensions
```

本报告旨在深入了解 VSCode 扩展预发布机制的工作原理，分析语义化版本预发布标签不被支持的原因，并提供实用的解决方案。

## 1. VSCode 扩展预发布机制概述

### 1.1 引入历史
- **版本**：VSCode 1.63.0（2021年11月）
- **目的**：允许开发者发布预发布版本，获得早期用户反馈
- **实现**：通过 `vsce publish --pre-release` 命令实现

### 1.2 核心机制
- **发布标记**：使用 `--pre-release` 标志标记扩展版本
- **用户选择**：用户可在 Marketplace 中选择安装预发布版本
- **自动更新**：VSCode 会自动更新到最高可用版本
- **版本并存**：预发布版本和正式版本可以并存

### 1.3 用户体验
- 扩展页面显示 "Pre-release" 标签
- 用户可以选择 "Install Pre-Release Version"
- 可以在预发布版本和正式版本之间切换
- 预发布版本会收到自动更新

## 2. 版本号格式限制分析

### 2.1 VSCode Marketplace 版本号规则

VSCode Marketplace 对版本号有严格的格式要求：

```
格式：major.minor.patch[.build]
要求：
- 1-4 个数字段
- 每个数字范围：0-2147483647
- 用点号分隔
- 不支持任何非数字字符
```

### 2.2 不支持的格式
以下 SemVer 预发布标识符均不被支持：
- `1.0.0-alpha`
- `1.0.0-alpha.1`
- `1.0.0-beta`
- `1.0.0-rc.1`
- `1.0.0-dev`
- `1.0.0-SNAPSHOT`

### 2.3 技术原因
1. **平台限制**：VSCode Marketplace 的版本验证系统限制
2. **简化设计**：避免复杂的版本比较逻辑
3. **用户体验**：防止公共市场中预发布版本的混乱
4. **历史遗留**：VSCode 扩展系统的早期设计决策

## 3. 官方推荐的预发布策略

### 3.1 奇偶版本号策略

Microsoft 官方推荐使用奇偶版本号来区分预发布和正式版本：

```
正式版本：major.EVEN.patch
- 例如：1.0.0, 1.2.0, 1.4.0, 1.6.0

预发布版本：major.ODD.patch  
- 例如：1.1.0, 1.3.0, 1.5.0, 1.7.0
```

### 3.2 实际操作流程

```bash
# 发布预发布版本
npm version 1.3.0
vsce publish --pre-release

# 发布正式版本
npm version 1.4.0
vsce publish

# 或者直接指定版本
vsce publish 1.3.0 --pre-release
vsce publish 1.4.0
```

### 3.3 配置要求
- 扩展必须设置 `engines.vscode` 为 `>= 1.63.0`
- 预发布和正式版本必须使用不同的版本号
- 建议在 README 中说明版本策略

## 4. 社区实践和案例分析

### 4.1 主流扩展的实践

#### Pylance（Microsoft）
- 正式版本：2024.1.1, 2024.2.1, 2024.3.1
- 预发布版本：2024.1.100, 2024.2.100, 2024.3.100

#### PowerShell（Microsoft）
- 正式版本：2024.1.0, 2024.2.0
- 预发布版本：2024.1.1, 2024.2.1

#### GitHub Copilot
- 正式版本：1.150.0, 1.151.0
- 预发布版本：1.150.1, 1.151.1

### 4.2 社区反馈

从 GitHub Issues 和社区讨论中发现：
- 开发者普遍认为不支持 SemVer 预发布标签是"令人困惑的决定"
- 许多开发者被迫使用时间戳或其他变通方法
- 社区期待未来版本能够支持完整的 SemVer 规范

## 5. 技术实现细节

### 5.1 vsce 工具行为

```bash
# 正确的预发布发布命令
vsce publish --pre-release

# 错误的尝试（会失败）
vsce publish 1.0.0-alpha.1 --pre-release
```

### 5.2 VSIX 清单差异

预发布版本的 VSIX 清单中会包含特殊标记：

```xml
<PackageManifest>
  <Metadata>
    <PreRelease>true</PreRelease>
  </Metadata>
</PackageManifest>
```

### 5.3 Marketplace API 行为
- 预发布版本和正式版本使用相同的扩展 ID
- 用户可以在两者之间切换
- API 返回时会标明版本类型

## 6. 当前状态和未来展望

### 6.1 2025年现状
- **预发布支持**：完全支持 `--pre-release` 标志
- **版本限制**：仍然不支持 SemVer 预发布标签
- **用户采用**：广泛被主流扩展使用
- **工具成熟度**：vsce 工具已经非常稳定

### 6.2 未来计划
Microsoft 在官方文档中表示：
> "Support for this [semver pre-release tags] will arrive in the future"

但至今（2025年）仍未实现，可能受到以下因素影响：
- 向后兼容性考虑
- Marketplace 基础设施改动成本
- 用户体验一致性要求

## 7. 对 PasteMark 项目的建议

### 7.1 版本策略调整

**当前问题**：
- 版本 `0.1.0-alpha.1` 无法发布到 Marketplace

**建议方案**：
```json
{
  "正式版本": ["0.2.0", "0.4.0", "0.6.0", "1.0.0"],
  "预发布版本": ["0.3.0", "0.5.0", "0.7.0", "1.1.0"]
}
```

### 7.2 CI/CD 配置优化

```yaml
# .github/workflows/ci-cd.yaml
publish:
  name: Publish to Marketplace
  needs: [ci, package]
  runs-on: ubuntu-latest
  if: startsWith(github.ref, 'refs/tags/v')
  
  steps:
    - name: Determine release type
      id: release_type
      run: |
        VERSION="${{ github.ref_name }}"
        VERSION_NUM=$(echo $VERSION | sed 's/^v//')
        
        # 解析版本号
        IFS='.' read -r major minor patch <<< "$VERSION_NUM"
        
        # 奇数次版本号为预发布
        if [ $((minor % 2)) -eq 1 ]; then
          echo "is_prerelease=true" >> $GITHUB_OUTPUT
        else
          echo "is_prerelease=false" >> $GITHUB_OUTPUT
        fi
    
    - name: Publish to VSCode Marketplace
      env:
        VSCE_PAT: ${{ secrets.VSCE_PAT }}
      run: |
        if [ "${{ steps.release_type.outputs.is_prerelease }}" = "true" ]; then
          vsce publish --pre-release -p $VSCE_PAT
        else
          vsce publish -p $VSCE_PAT
        fi
```

### 7.3 开发流程建议

1. **分支策略**：
   - `main` 分支：正式版本（0.2.x, 0.4.x）
   - `develop` 分支：预发布版本（0.3.x, 0.5.x）

2. **发布流程**：
   - 从 `develop` 分支发布预发布版本
   - 从 `main` 分支发布正式版本
   - 使用 Git tags 触发自动发布

3. **用户沟通**：
   - 在 README 中说明版本策略
   - 提供预发布版本的安装指南
   - 建立用户反馈渠道

## 8. 结论

VSCode 扩展预发布机制的设计是一个在技术限制和用户体验之间的权衡结果。虽然不支持标准的 SemVer 预发布标签，但通过奇偶版本号策略可以有效地管理预发布版本。

对于 PasteMark 项目，我们建议：
1. 立即调整版本策略，使用奇偶版本号区分预发布和正式版本
2. 更新 CI/CD 配置，支持自动化的预发布流程
3. 在文档中明确说明版本策略，帮助用户理解

这种方法虽然不完全符合 SemVer 标准，但在 VSCode 生态系统中是最实用和被广泛接受的解决方案。

---

**报告日期**：2025年7月15日  
**调研人员**：Claude  
**文档版本**：1.0  
**关键字**：VSCode 扩展, 预发布, 版本管理, Marketplace, vsce