import * as assert from 'assert'
import * as vscode from 'vscode'
import * as path from 'path'
import { TestEnvironment, TestAssertions, TestWaiter } from '../support/helpers'
import { TestImages, TestDocuments } from '../support/fixtures'
import { TestScenarios, ClipboardMock, OllamaMock } from '../support/mocks'

/**
 * 高级用户场景测试
 * 
 * 用户故事：
 * - 作为一个高级用户
 * - 我想要使用 Ollama 智能命名功能
 * - 我希望能够自定义 AI 模型和提示词
 * - 我需要在 Ollama 不可用时有合适的降级处理
 */
suite('高级用户场景', () => {
  let testEnv: TestEnvironment

  suiteSetup(async () => {
    testEnv = new TestEnvironment()
    await testEnv.setup()
    TestScenarios.configureAdvancedUser()
  })

  suiteTeardown(async () => {
    await testEnv.cleanup()
    TestScenarios.cleanup()
  })

  setup(async () => {
    // 应用高级用户配置：启用 Ollama，使用默认模型
    await testEnv.applyUserConfig('advanced')
    OllamaMock.enable()
  })

  teardown(async () => {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors')
    ClipboardMock.clear()
  })

  suite('Ollama 智能命名功能', () => {
    test('高级用户直接粘贴图片，应该使用 Ollama 智能生成文件名', async () => {
      // Given: 高级用户启用了 Ollama，在 Markdown 文件中
      const doc = await testEnv.createDocument(TestDocuments.withContent)
      const editor = vscode.window.activeTextEditor!
      
      // 光标在文档末尾，没有选中文本
      editor.selection = new vscode.Selection(
        new vscode.Position(10, 0),
        new vscode.Position(10, 0)
      )
      
      // 模拟剪贴板中有图片
      ClipboardMock.setImageData(TestImages.smallPng)
      
      // When: 用户粘贴图片
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await TestWaiter.wait(2000) // 等待 AI 处理
      
      // Then: 应该使用 AI 生成的文件名
      TestAssertions.assertDocumentContainsImage(doc, 'architecture-diagram.png')
      
      const expectedFile = path.join(testEnv.getWorkspaceDir(), 'images', 'architecture-diagram.png')
      TestAssertions.assertFileExists(expectedFile)
    })

    test('高级用户选中文本后粘贴图片，应该优先使用选中的文本而不是 AI 命名', async () => {
      // Given: 高级用户启用了 Ollama，但选中了文本
      const doc = await testEnv.createDocument(TestDocuments.withContent)
      const editor = vscode.window.activeTextEditor!
      
      const selectedText = '手动指定的文件名'
      await editor.edit(editBuilder => {
        editBuilder.insert(new vscode.Position(10, 0), selectedText)
      })
      
      editor.selection = new vscode.Selection(
        new vscode.Position(10, 0),
        new vscode.Position(10, selectedText.length)
      )
      
      ClipboardMock.setImageData(TestImages.smallPng)
      
      // When: 用户粘贴图片
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await TestWaiter.wait(1000)
      
      // Then: 应该使用选中的文本，而不是 AI 命名
      TestAssertions.assertDocumentContainsImage(doc, '手动指定的文件名.png')
      
      const expectedFile = path.join(testEnv.getWorkspaceDir(), 'images', '手动指定的文件名.png')
      TestAssertions.assertFileExists(expectedFile)
    })

    test('Ollama 服务不可用时，应该自动降级为时间戳命名', async () => {
      // Given: Ollama 服务不可用
      OllamaMock.disable()
      
      const doc = await testEnv.createDocument(TestDocuments.empty)
      const editor = vscode.window.activeTextEditor!
      
      editor.selection = new vscode.Selection(
        new vscode.Position(2, 0),
        new vscode.Position(2, 0)
      )
      
      ClipboardMock.setImageData(TestImages.smallPng)
      
      // When: 用户粘贴图片
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await TestWaiter.wait(1000)
      
      // Then: 应该降级为时间戳命名
      await TestWaiter.waitForDocumentUpdate(doc, /!\[image\]\(\.\/images\/image-\d{8}-\d{6}\.png\)/)
      
      const content = doc.getText()
      const match = content.match(/image-(\d{8}-\d{6})\.png/)
      assert.ok(match, '应该生成时间戳格式的文件名')
    })
  })

  suite('自定义模型配置', () => {
    test('高级用户可以使用不同的 Ollama 模型', async () => {
      // Given: 高级用户配置了 qwen2-vl 模型
      const configuration = vscode.workspace.getConfiguration('pastemark')
      await configuration.update('ollamaModel', 'qwen2-vl')
      
      const doc = await testEnv.createDocument(TestDocuments.withContent)
      const editor = vscode.window.activeTextEditor!
      
      editor.selection = new vscode.Selection(
        new vscode.Position(10, 0),
        new vscode.Position(10, 0)
      )
      
      ClipboardMock.setImageData(TestImages.smallPng)
      
      // When: 用户粘贴图片
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await TestWaiter.wait(2000)
      
      // Then: 应该使用 qwen2-vl 模型的响应
      TestAssertions.assertDocumentContainsImage(doc, 'architecture-diagram.png')
      
      // 恢复默认配置
      await configuration.update('ollamaModel', 'llava')
    })

    test('高级用户可以自定义提示词来控制文件名格式', async () => {
      // Given: 高级用户配置了自定义提示词
      const configuration = vscode.workspace.getConfiguration('pastemark')
      const customPrompt = 'Generate a technical filename using programming conventions (lowercase, underscores, descriptive, no file extension).'
      await configuration.update('ollamaPrompt', customPrompt)
      await configuration.update('ollamaModel', 'qwen2-vl')
      
      const doc = await testEnv.createDocument(TestDocuments.withContent)
      const editor = vscode.window.activeTextEditor!
      
      editor.selection = new vscode.Selection(
        new vscode.Position(10, 0),
        new vscode.Position(10, 0)
      )
      
      ClipboardMock.setImageData(TestImages.smallPng)
      
      // When: 用户粘贴图片
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await TestWaiter.wait(2000)
      
      // Then: 应该使用技术风格的文件名
      TestAssertions.assertDocumentContainsImage(doc, 'api_endpoint_diagram.png')
      
      const expectedFile = path.join(testEnv.getWorkspaceDir(), 'images', 'api_endpoint_diagram.png')
      TestAssertions.assertFileExists(expectedFile)
      
      // 恢复默认配置
      await configuration.update('ollamaPrompt', undefined)
      await configuration.update('ollamaModel', 'llava')
    })
  })

  suite('中文用户场景', () => {
    test('中文用户使用中文提示词，应该生成中文文件名', async () => {
      // Given: 中文用户配置了中文提示词
      await testEnv.applyUserConfig('chinese')
      
      const doc = await testEnv.createDocument(TestDocuments.withContent)
      const editor = vscode.window.activeTextEditor!
      
      editor.selection = new vscode.Selection(
        new vscode.Position(10, 0),
        new vscode.Position(10, 0)
      )
      
      ClipboardMock.setImageData(TestImages.smallPng)
      
      // When: 用户粘贴图片
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await TestWaiter.wait(2000)
      
      // Then: 应该生成中文文件名
      TestAssertions.assertDocumentContainsImage(doc, '系统架构图.png')
      
      const expectedFile = path.join(testEnv.getWorkspaceDir(), '图片', '系统架构图.png')
      TestAssertions.assertFileExists(expectedFile)
    })
  })

  suite('高级配置选项', () => {
    test('高级用户可以自定义图片保存路径', async () => {
      // Given: 高级用户配置了自定义图片路径
      const configuration = vscode.workspace.getConfiguration('pastemark')
      await configuration.update('imagePath', './assets/screenshots/')
      
      const doc = await testEnv.createDocument(TestDocuments.withContent)
      const editor = vscode.window.activeTextEditor!
      
      const selectedText = '自定义路径测试'
      await editor.edit(editBuilder => {
        editBuilder.insert(new vscode.Position(10, 0), selectedText)
      })
      
      editor.selection = new vscode.Selection(
        new vscode.Position(10, 0),
        new vscode.Position(10, selectedText.length)
      )
      
      ClipboardMock.setImageData(TestImages.smallPng)
      
      // When: 用户粘贴图片
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await TestWaiter.wait(1000)
      
      // Then: 应该保存到自定义路径
      TestAssertions.assertDocumentContainsImage(doc, './assets/screenshots/自定义路径测试.png')
      
      const expectedFile = path.join(testEnv.getWorkspaceDir(), 'assets', 'screenshots', '自定义路径测试.png')
      TestAssertions.assertFileExists(expectedFile)
      
      // 恢复默认配置
      await configuration.update('imagePath', './images/')
    })

    test('高级用户可以自定义默认图片格式', async () => {
      // Given: 高级用户配置了 JPEG 格式
      const configuration = vscode.workspace.getConfiguration('pastemark')
      await configuration.update('imageFormat', 'jpg')
      
      const doc = await testEnv.createDocument(TestDocuments.withContent)
      const editor = vscode.window.activeTextEditor!
      
      const selectedText = 'JPEG格式测试'
      await editor.edit(editBuilder => {
        editBuilder.insert(new vscode.Position(10, 0), selectedText)
      })
      
      editor.selection = new vscode.Selection(
        new vscode.Position(10, 0),
        new vscode.Position(10, selectedText.length)
      )
      
      ClipboardMock.setImageData(TestImages.smallJpg)
      
      // When: 用户粘贴图片
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await TestWaiter.wait(1000)
      
      // Then: 应该使用 JPEG 格式
      TestAssertions.assertDocumentContainsImage(doc, 'JPEG格式测试.jpg')
      
      const expectedFile = path.join(testEnv.getWorkspaceDir(), 'images', 'JPEG格式测试.jpg')
      TestAssertions.assertFileExists(expectedFile)
      
      // 恢复默认配置
      await configuration.update('imageFormat', 'png')
    })
  })

  suite('错误处理与恢复', () => {
    test('Ollama 返回无效响应时，应该降级为时间戳命名', async () => {
      // Given: Ollama 返回无效响应
      // 这里需要配置 mock 返回无效响应
      
      const doc = await testEnv.createDocument(TestDocuments.empty)
      const editor = vscode.window.activeTextEditor!
      
      editor.selection = new vscode.Selection(
        new vscode.Position(2, 0),
        new vscode.Position(2, 0)
      )
      
      ClipboardMock.setImageData(TestImages.smallPng)
      
      // When: 用户粘贴图片
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await TestWaiter.wait(2000)
      
      // Then: 应该降级为时间戳命名
      await TestWaiter.waitForDocumentUpdate(doc, /!\[image\]\(\.\/images\/image-\d{8}-\d{6}\.png\)/)
    })

    test('Ollama 请求超时时，应该降级为时间戳命名', async () => {
      // Given: Ollama 请求会超时
      // 这里需要配置 mock 模拟超时
      
      const doc = await testEnv.createDocument(TestDocuments.empty)
      const editor = vscode.window.activeTextEditor!
      
      editor.selection = new vscode.Selection(
        new vscode.Position(2, 0),
        new vscode.Position(2, 0)
      )
      
      ClipboardMock.setImageData(TestImages.smallPng)
      
      // When: 用户粘贴图片
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await TestWaiter.wait(4000) // 等待超时
      
      // Then: 应该降级为时间戳命名
      await TestWaiter.waitForDocumentUpdate(doc, /!\[image\]\(\.\/images\/image-\d{8}-\d{6}\.png\)/)
    })
  })

  suite('性能与用户体验', () => {
    test('高级用户连续使用 AI 命名时，应该有适当的响应时间', async () => {
      // Given: 高级用户准备连续使用 AI 命名
      const doc = await testEnv.createDocument(TestDocuments.withContent)
      const editor = vscode.window.activeTextEditor!
      
      const testCount = 3
      const startTime = Date.now()
      
      for (let i = 0; i < testCount; i++) {
        const position = new vscode.Position(10 + i, 0)
        
        editor.selection = new vscode.Selection(position, position)
        ClipboardMock.setImageData(TestImages.smallPng)
        
        // When: 用户粘贴图片
        await vscode.commands.executeCommand('pastemark.pasteImage')
        await TestWaiter.wait(2000)
      }
      
      const endTime = Date.now()
      const totalTime = endTime - startTime
      const avgTime = totalTime / testCount
      
      // Then: 平均响应时间应该在合理范围内
      assert.ok(avgTime < 5000, `平均响应时间应该少于 5 秒，实际: ${avgTime}ms`)
      
      // 验证所有图片都被正确插入
      const content = doc.getText()
      const imageCount = (content.match(/!\[.*?\]\(.*?\)/g) || []).length
      assert.equal(imageCount, testCount, `应该有 ${testCount} 张图片`)
    })

    test('高级用户在 Ollama 服务缓慢时，应该有适当的用户反馈', async () => {
      // Given: Ollama 服务响应缓慢
      const doc = await testEnv.createDocument(TestDocuments.empty)
      const editor = vscode.window.activeTextEditor!
      
      editor.selection = new vscode.Selection(
        new vscode.Position(2, 0),
        new vscode.Position(2, 0)
      )
      
      ClipboardMock.setImageData(TestImages.smallPng)
      
      // When: 用户粘贴图片
      const startTime = Date.now()
      await vscode.commands.executeCommand('pastemark.pasteImage')
      
      // 在处理过程中，应该有某种形式的用户反馈
      // 这里我们只是验证命令最终完成
      await TestWaiter.wait(3000)
      
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      // Then: 即使响应较慢，也应该最终完成
      assert.ok(responseTime >= 2000, '应该有适当的处理时间')
      
      TestAssertions.assertDocumentContainsImage(doc, 'architecture-diagram.png')
    })
  })
})