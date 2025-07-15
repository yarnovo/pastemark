# PasteMark E2E 测试

## 测试架构

基于用户行为的端到端测试，模拟真实用户使用场景。

### 用户角色

1. **新手用户** (Novice User)
   - 首次使用 PasteMark
   - 不熟悉配置和高级功能
   - 主要使用基础的图片粘贴功能

2. **高级用户** (Advanced User)
   - 熟悉插件配置
   - 使用 Ollama 智能命名
   - 自定义提示词和模型

3. **开发者** (Developer)
   - 在技术文档中使用
   - 需要特定的命名格式
   - 使用多种图片格式

### 测试场景

#### 核心用户旅程
1. 安装插件 → 首次使用 → 粘贴图片 → 验证结果
2. 配置 Ollama → 智能命名 → 验证 AI 功能
3. 自定义配置 → 高级使用 → 验证个性化

#### 异常场景
1. 网络问题 → Ollama 不可用 → 降级处理
2. 权限问题 → 文件系统错误 → 错误提示
3. 资源限制 → 大图片处理 → 限制提示

### 文件结构

```
e2e/
├── README.md                    # 测试说明
├── runTests.ts                  # 测试运行器
├── support/                     # 测试支持文件
│   ├── fixtures.ts             # 测试数据
│   ├── helpers.ts              # 辅助函数
│   └── mocks.ts                # 模拟数据
├── scenarios/                   # 用户场景测试
│   ├── novice-user.e2e.ts      # 新手用户场景
│   ├── advanced-user.e2e.ts    # 高级用户场景
│   └── developer.e2e.ts        # 开发者场景
└── edge-cases/                  # 边界情况测试
    ├── error-handling.e2e.ts   # 错误处理
    ├── performance.e2e.ts      # 性能测试
    └── security.e2e.ts         # 安全测试
```

### 测试原则

1. **用户视角**：以用户行为为主线，模拟真实使用场景
2. **端到端完整性**：从用户操作到最终结果的完整流程
3. **可维护性**：清晰的文件结构和命名规范
4. **可读性**：测试用例描述清晰，易于理解

### 运行测试

```bash
# 运行所有端到端测试
npm run test:e2e

# 运行特定用户场景
npm run test:e2e -- --grep "新手用户"

# 运行边界情况测试
npm run test:e2e -- --grep "边界情况"
```