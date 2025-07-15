import * as assert from 'assert'
import * as vscode from 'vscode'
import * as path from 'path'
import { TestEnvironment, TestAssertions, TestWaiter } from '../support/helpers'
import { TestImages, TestDocuments } from '../support/fixtures'
import { TestScenarios, ClipboardMock } from '../support/mocks'

/**
 * 开发者场景测试
 * 
 * 用户故事：
 * - 作为一个开发者
 * - 我在编写技术文档和 API 文档
 * - 我需要特定的文件命名格式（技术风格）
 * - 我希望能够高效地插入各种技术图片
 */
suite('开发者场景', () => {
  let testEnv: TestEnvironment

  suiteSetup(async () => {
    testEnv = new TestEnvironment()
    await testEnv.setup()
    TestScenarios.configureDeveloper()
  })

  suiteTeardown(async () => {
    await testEnv.cleanup()
    TestScenarios.cleanup()
  })

  setup(async () => {
    // 应用开发者配置：使用 qwen2-vl 模型和技术风格提示词
    await testEnv.applyUserConfig('developer')
  })

  teardown(async () => {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors')
    ClipboardMock.clear()
  })

  suite('技术文档编写', () => {
    test('开发者编写 API 文档时，应该生成技术风格的文件名', async () => {
      // Given: 开发者在编写 API 文档
      const doc = await testEnv.createDocument(TestDocuments.technical)
      const editor = vscode.window.activeTextEditor!
      
      // 光标在"请求参数"部分
      editor.selection = new vscode.Selection(
        new vscode.Position(10, 0),
        new vscode.Position(10, 0)
      )
      
      ClipboardMock.setImageData(TestImages.smallPng)
      
      // When: 开发者粘贴 API 接口图片
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await TestWaiter.wait(2000)
      
      // Then: 应该生成技术风格的文件名
      TestAssertions.assertDocumentContainsImage(doc, 'api_endpoint_diagram.jpg')
      TestAssertions.assertFileNameFormat('api_endpoint_diagram.jpg', 'technical')
      
      const expectedFile = path.join(testEnv.getWorkspaceDir(), 'assets', 'screenshots', 'api_endpoint_diagram.jpg')
      TestAssertions.assertFileExists(expectedFile)
    })

    test('开发者插入数据库架构图，应该使用描述性的技术术语', async () => {
      // Given: 开发者选中了技术术语
      const doc = await testEnv.createDocument(TestDocuments.technical)
      const editor = vscode.window.activeTextEditor!
      
      const technicalTerm = 'database_schema_diagram'
      await editor.edit(editBuilder => {
        editBuilder.insert(new vscode.Position(12, 0), technicalTerm)
      })
      
      editor.selection = new vscode.Selection(
        new vscode.Position(12, 0),
        new vscode.Position(12, technicalTerm.length)
      )
      
      ClipboardMock.setImageData(TestImages.smallPng)
      
      // When: 开发者粘贴图片
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await TestWaiter.wait(1000)
      
      // Then: 应该使用选中的技术术语
      TestAssertions.assertDocumentContainsImage(doc, 'database_schema_diagram.jpg')
      TestAssertions.assertFileNameFormat('database_schema_diagram.jpg', 'technical')
    })
  })

  suite('代码文档场景', () => {
    test('开发者记录代码架构时，应该生成结构化的文件名', async () => {
      // Given: 开发者在记录代码架构
      const codeDoc = `# 系统架构文档

## 整体架构

### 服务架构
系统采用微服务架构，包含以下服务：

### 数据流
数据流向如下图所示：

`
      const doc = await testEnv.createDocument(codeDoc)
      const editor = vscode.window.activeTextEditor!
      
      // 在数据流部分插入图片
      editor.selection = new vscode.Selection(
        new vscode.Position(8, 0),
        new vscode.Position(8, 0)
      )
      
      ClipboardMock.setImageData(TestImages.smallPng)
      
      // When: 开发者粘贴架构图
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await TestWaiter.wait(2000)
      
      // Then: 应该生成结构化的文件名
      TestAssertions.assertDocumentContainsImage(doc, 'api_endpoint_diagram.jpg')
      
      const expectedFile = path.join(testEnv.getWorkspaceDir(), 'assets', 'screenshots', 'api_endpoint_diagram.jpg')
      TestAssertions.assertFileExists(expectedFile)
    })

    test('开发者记录错误截图时，应该使用统一的命名格式', async () => {
      // Given: 开发者记录错误截图
      const bugDoc = `# Bug 报告

## 错误描述

### 错误截图
以下是错误的截图：

### 错误详情
错误的详细信息：

`
      const doc = await testEnv.createDocument(bugDoc)
      const editor = vscode.window.activeTextEditor!
      
      const errorTypes = ['error_500_screenshot', 'login_failure_screen', 'api_timeout_error']
      
      for (let i = 0; i < errorTypes.length; i++) {
        const errorType = errorTypes[i]
        const position = new vscode.Position(6 + i, 0)
        
        // 插入错误类型描述
        await editor.edit(editBuilder => {
          editBuilder.insert(position, errorType)
        })
        
        editor.selection = new vscode.Selection(
          position,
          new vscode.Position(position.line, errorType.length)
        )
        
        ClipboardMock.setImageData(TestImages.smallPng)
        
        // When: 开发者粘贴错误截图
        await vscode.commands.executeCommand('pastemark.pasteImage')
        await TestWaiter.wait(1000)
        
        // Then: 应该使用技术风格的错误描述
        TestAssertions.assertDocumentContainsImage(doc, `${errorType}.jpg`)
        TestAssertions.assertFileNameFormat(`${errorType}.jpg`, 'technical')
      }
    })
  })

  suite('多格式图片处理', () => {
    test('开发者处理不同类型的技术图片，应该保持格式一致性', async () => {
      // Given: 开发者处理多种技术图片
      const doc = await testEnv.createDocument(TestDocuments.technical)
      const editor = vscode.window.activeTextEditor!
      
      const techImages = [
        { name: 'system_architecture', buffer: TestImages.smallPng },
        { name: 'api_flow_diagram', buffer: TestImages.smallJpg },
        { name: 'database_erd', buffer: TestImages.smallPng }
      ]
      
      for (let i = 0; i < techImages.length; i++) {
        const image = techImages[i]
        const position = new vscode.Position(10 + i, 0)
        
        await editor.edit(editBuilder => {
          editBuilder.insert(position, image.name)
        })
        
        editor.selection = new vscode.Selection(
          position,
          new vscode.Position(position.line, image.name.length)
        )
        
        ClipboardMock.setImageData(image.buffer)
        
        // When: 开发者粘贴图片
        await vscode.commands.executeCommand('pastemark.pasteImage')
        await TestWaiter.wait(1000)
        
        // Then: 应该保持统一的 JPG 格式（根据开发者配置）
        TestAssertions.assertDocumentContainsImage(doc, `${image.name}.jpg`)
        
        const expectedFile = path.join(testEnv.getWorkspaceDir(), 'assets', 'screenshots', `${image.name}.jpg`)
        TestAssertions.assertFileExists(expectedFile)
      }
    })
  })

  suite('协作开发场景', () => {
    test('开发者在团队协作文档中，应该生成标准化的文件名', async () => {
      // Given: 开发者在团队协作文档中
      const teamDoc = `# 团队开发文档

## 架构决策记录 (ADR)

### ADR-001: 选择微服务架构

#### 决策
我们决定采用微服务架构。

#### 架构图
`
      const doc = await testEnv.createDocument(teamDoc)
      const editor = vscode.window.activeTextEditor!
      
      // 在架构图部分插入图片
      editor.selection = new vscode.Selection(
        new vscode.Position(9, 0),
        new vscode.Position(9, 0)
      )
      
      ClipboardMock.setImageData(TestImages.smallPng)
      
      // When: 开发者粘贴架构图
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await TestWaiter.wait(2000)
      
      // Then: 应该生成标准化的文件名
      TestAssertions.assertDocumentContainsImage(doc, 'api_endpoint_diagram.jpg')
      
      // 文件名应该遵循团队约定的格式
      const content = doc.getText()
      const match = content.match(/!\[.*?\]\((.+?)\)/)
      assert.ok(match, '应该找到图片引用')
      
      if (match) {
        const imagePath = match[1]
        assert.ok(imagePath.includes('assets/screenshots/'), '应该保存到标准路径')
        assert.ok(imagePath.endsWith('.jpg'), '应该使用标准格式')
      }
    })

    test('开发者创建多个相关文档时，应该保持文件组织的一致性', async () => {
      // Given: 开发者创建多个相关文档
      const docs = [
        { name: 'api.md', content: TestDocuments.technical },
        { name: 'architecture.md', content: TestDocuments.technical },
        { name: 'deployment.md', content: TestDocuments.technical }
      ]
      
      for (const docInfo of docs) {
        const doc = await testEnv.createFile(docInfo.name, docInfo.content)
        const editor = vscode.window.activeTextEditor!
        
        // 在每个文档中插入图片
        editor.selection = new vscode.Selection(
          new vscode.Position(10, 0),
          new vscode.Position(10, 0)
        )
        
        ClipboardMock.setImageData(TestImages.smallPng)
        
        // When: 开发者粘贴图片
        await vscode.commands.executeCommand('pastemark.pasteImage')
        await TestWaiter.wait(2000)
        
        // Then: 所有文档应该使用相同的文件组织方式
        TestAssertions.assertDocumentContainsImage(doc, 'api_endpoint_diagram.jpg')
        
        // 验证文件路径一致性
        const content = doc.getText()
        const match = content.match(/!\[.*?\]\((.+?)\)/)
        assert.ok(match, '应该找到图片引用')
        
        if (match) {
          const imagePath = match[1]
          assert.ok(imagePath.startsWith('./assets/screenshots/'), '应该使用统一的路径前缀')
        }
      }
    })
  })

  suite('开发工具集成', () => {
    test('开发者在编写 README 文件时，应该生成用户友好的文件名', async () => {
      // Given: 开发者在编写 README 文件
      const readmeDoc = `# 项目名称

## 安装说明

### 系统要求

### 安装步骤
1. 克隆仓库
2. 安装依赖
3. 配置环境

### 使用示例
以下是使用示例：

`
      const doc = await testEnv.createDocument(readmeDoc)
      const editor = vscode.window.activeTextEditor!
      
      // 在使用示例部分插入图片
      editor.selection = new vscode.Selection(
        new vscode.Position(12, 0),
        new vscode.Position(12, 0)
      )
      
      ClipboardMock.setImageData(TestImages.smallPng)
      
      // When: 开发者粘贴使用示例图片
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await TestWaiter.wait(2000)
      
      // Then: 应该生成适合 README 的文件名
      TestAssertions.assertDocumentContainsImage(doc, 'api_endpoint_diagram.jpg')
      
      const expectedFile = path.join(testEnv.getWorkspaceDir(), 'assets', 'screenshots', 'api_endpoint_diagram.jpg')
      TestAssertions.assertFileExists(expectedFile)
    })

    test('开发者处理大量截图时，应该保持性能稳定', async () => {
      // Given: 开发者需要处理大量截图
      const doc = await testEnv.createDocument(TestDocuments.technical)
      const editor = vscode.window.activeTextEditor!
      
      const imageCount = 5
      const startTime = Date.now()
      
      for (let i = 0; i < imageCount; i++) {
        const position = new vscode.Position(10 + i, 0)
        const imageName = `screenshot_${i + 1}`
        
        await editor.edit(editBuilder => {
          editBuilder.insert(position, imageName)
        })
        
        editor.selection = new vscode.Selection(
          position,
          new vscode.Position(position.line, imageName.length)
        )
        
        ClipboardMock.setImageData(TestImages.smallPng)
        
        // When: 开发者连续粘贴多张图片
        await vscode.commands.executeCommand('pastemark.pasteImage')
        await TestWaiter.wait(1000)
      }
      
      const endTime = Date.now()
      const totalTime = endTime - startTime
      const avgTime = totalTime / imageCount
      
      // Then: 性能应该保持稳定
      assert.ok(avgTime < 3000, `每张图片处理时间应该少于 3 秒，实际平均: ${avgTime}ms`)
      
      // 验证所有图片都被正确处理
      const content = doc.getText()
      const imageMatches = content.match(/!\[.*?\]\(.*?\)/g)
      assert.equal(imageMatches?.length, imageCount, `应该有 ${imageCount} 张图片`)
    })
  })

  suite('文档标准化', () => {
    test('开发者使用统一的文档模板时，应该生成一致的文件结构', async () => {
      // Given: 开发者使用统一的文档模板
      const templateDoc = `# 功能文档模板

## 功能概述

## 技术实现

### 架构图

### 时序图

### 数据流图

## 测试说明

### 测试用例

### 测试结果
`
      const doc = await testEnv.createDocument(templateDoc)
      const editor = vscode.window.activeTextEditor!
      
      const sections = [
        { name: 'architecture_overview', line: 6 },
        { name: 'sequence_diagram', line: 8 },
        { name: 'data_flow_chart', line: 10 }
      ]
      
      for (const section of sections) {
        await editor.edit(editBuilder => {
          editBuilder.insert(new vscode.Position(section.line, 0), section.name)
        })
        
        editor.selection = new vscode.Selection(
          new vscode.Position(section.line, 0),
          new vscode.Position(section.line, section.name.length)
        )
        
        ClipboardMock.setImageData(TestImages.smallPng)
        
        // When: 开发者在各个模板部分插入图片
        await vscode.commands.executeCommand('pastemark.pasteImage')
        await TestWaiter.wait(1000)
        
        // Then: 应该生成符合模板标准的文件名
        TestAssertions.assertDocumentContainsImage(doc, `${section.name}.jpg`)
        TestAssertions.assertFileNameFormat(`${section.name}.jpg`, 'technical')
      }
      
      // 验证文件组织的一致性
      const files = testEnv.getCreatedFiles()
      const imageFiles = files.filter(f => f.includes('assets/screenshots/'))
      assert.equal(imageFiles.length, sections.length, '应该创建对应数量的图片文件')
    })
  })
})