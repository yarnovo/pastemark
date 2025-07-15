# VSCE 打包命令参数详解

## 问题：`--pre-release` 和 `--no-dependencies` 参数有什么区别？

这两个参数控制的是完全不同的打包行为，可以单独使用，也可以组合使用。

### `--pre-release` 参数

**作用**：允许打包带有预发布版本号的扩展

```bash
vsce package --pre-release
```

**使用场景**：
- 当 package.json 中的版本号包含预发布标识时（如 `1.0.0-alpha.1`、`1.0.0-dev.1`）
- 不使用此参数时，vsce 会拒绝打包预发布版本号

**示例**：
```json
// package.json
{
  "version": "1.0.0-alpha.1"  // 需要 --pre-release 参数
}
```

### `--no-dependencies` 参数

**作用**：打包时不包含 node_modules 中的依赖

```bash
vsce package --no-dependencies
```

**使用场景**：
- 当扩展不需要运行时依赖（只有开发时依赖）
- 减小扩展包体积
- 提高打包速度

**注意事项**：
- 只有当你的扩展在运行时不需要任何 npm 包时才能使用
- 大多数 VSCode 扩展都可以使用此参数，因为：
  - VSCode API 已经内置，不需要打包
  - 开发依赖（devDependencies）本来就不会被打包

### 参数组合使用

这两个参数可以同时使用：

```bash
# 打包预发布版本，且不包含依赖
vsce package --pre-release --no-dependencies
```

### 实际应用建议

对于 PasteMark 项目：

1. **正式版本打包**：
   ```bash
   vsce package --no-dependencies
   ```

2. **预发布版本打包**：
   ```bash
   vsce package --pre-release --no-dependencies
   ```

3. **查看打包内容**：
   ```bash
   # 列出将要打包的文件，不实际打包
   vsce ls
   ```

### 其他常用参数

- `--out <path>`：指定输出文件路径
- `--baseContentUrl`：设置资源基础 URL
- `--baseImagesUrl`：设置图片基础 URL
- `--yarn`：使用 yarn 而不是 npm

### 打包结果对比

| 命令 | 支持预发布版本 | 包含依赖 | 文件大小 | 适用场景 |
|------|--------------|---------|---------|---------|
| `vsce package` | ❌ | ✅ | 较大 | 稳定版本，有运行时依赖 |
| `vsce package --pre-release` | ✅ | ✅ | 较大 | 预发布版本，有运行时依赖 |
| `vsce package --no-dependencies` | ❌ | ❌ | 较小 | 稳定版本，无运行时依赖 |
| `vsce package --pre-release --no-dependencies` | ✅ | ❌ | 较小 | 预发布版本，无运行时依赖 |