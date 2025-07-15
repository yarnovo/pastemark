import * as assert from 'assert'
import * as vscode from 'vscode'
import * as path from 'path'
import { TestEnvironment, TestAssertions, TestWaiter, ClipboardSimulator } from '../support/helpers'
import { TestImages, TestDocuments } from '../support/fixtures'
import { TestScenarios, ClipboardMock } from '../support/mocks'

/**
 * 新手用户场景测试
 * 
 * 用户故事：
 * - 作为一个新手用户
 * - 我想要快速在 Markdown 文档中插入图片
 * - 不需要复杂的配置，开箱即用
 */
suite('新手用户场景', () => {
  let testEnv: TestEnvironment

  suiteSetup(async () => {
    testEnv = new TestEnvironment()
    await testEnv.setup()
    TestScenarios.configureNoviceUser()
  })

  suiteTeardown(async () => {
    await testEnv.cleanup()
    TestScenarios.cleanup()
  })

  setup(async () => {
    // 应用新手用户配置：禁用 Ollama，使用默认设置
    await testEnv.applyUserConfig('novice')
  })

  teardown(async () => {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors')
    ClipboardMock.clear()
  })

  suite('首次使用 PasteMark', () => {
    test('新手用户第一次安装插件后，应该能够找到粘贴图片命令', async () => {
      // Given: 新手用户首次使用
      
      // When: 用户查看可用命令
      const commands = await vscode.commands.getCommands(true)
      
      // Then: 应该能找到 PasteMark 命令
      assert.ok(
        commands.includes('pastemark.pasteImage'),
        '应该能找到 pastemark.pasteImage 命令'
      )
    })

    test('新手用户在非 Markdown 文件中使用命令时，应该得到友好的错误提示', async () => {
      // Given: 用户在 JavaScript 文件中
      const doc = await testEnv.createDocument(TestDocuments.nonMarkdown, 'javascript')
      
      // When: 用户尝试粘贴图片
      try {
        await vscode.commands.executeCommand('pastemark.pasteImage')
        assert.fail('应该抛出错误')
      } catch (error) {
        // Then: 应该得到友好的错误提示
        assert.ok(
          (error as Error).message.includes('Markdown'),
          '错误信息应该提示只在 Markdown 文件中可用'
        )
      }
    })
  })

  suite('基础图片粘贴功能', () => {
    test('新手用户选中文本后粘贴图片，应该使用选中的文本作为文件名', async () => {
      // Given: 新手用户在 Markdown 文件中选中了文本
      const doc = await testEnv.createDocument(TestDocuments.withContent)
      const editor = vscode.window.activeTextEditor!
      
      const selectedText = '产品截图'
      await editor.edit(editBuilder => {
        editBuilder.insert(new vscode.Position(10, 0), selectedText)
      })
      
      // 选中文本
      editor.selection = new vscode.Selection(
        new vscode.Position(10, 0),
        new vscode.Position(10, selectedText.length)
      )
      
      // 模拟剪贴板中有图片
      ClipboardMock.setImageData(TestImages.smallPng)
      
      // When: 用户按下快捷键粘贴图片
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await TestWaiter.wait(500) // 等待处理完成
      
      // Then: 应该插入图片引用，使用选中的文本作为文件名
      TestAssertions.assertDocumentContainsImage(doc, '产品截图.png', '产品截图')
      
      // 并且应该创建对应的图片文件
      const expectedFile = path.join(testEnv.getWorkspaceDir(), '产品截图.png')
      TestAssertions.assertFileExists(expectedFile)
    })

    test('新手用户直接粘贴图片（无选中文本），应该使用时间戳命名', async () => {
      // Given: 新手用户在 Markdown 文件中，没有选中文本
      const doc = await testEnv.createDocument(TestDocuments.empty)
      const editor = vscode.window.activeTextEditor!
      
      // 光标在文档末尾
      editor.selection = new vscode.Selection(
        new vscode.Position(2, 0),
        new vscode.Position(2, 0)
      )
      
      // 模拟剪贴板中有图片
      ClipboardMock.setImageData(TestImages.smallPng)
      
      // When: 用户粘贴图片
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await TestWaiter.wait(500)
      
      // Then: 应该使用时间戳命名
      await TestWaiter.waitForDocumentUpdate(doc, /!\[image\]\(\.\/image-\d{8}-\d{6}\.png\)/)
      
      // 验证文件名格式
      const content = doc.getText()
      const match = content.match(/image-(\d{8}-\d{6})\.png/)
      assert.ok(match, '应该生成时间戳格式的文件名')
      
      if (match) {
        const fileName = `image-${match[1]}.png`
        TestAssertions.assertFileNameFormat(fileName, 'timestamp')
        
        const expectedFile = path.join(testEnv.getWorkspaceDir(), fileName)
        TestAssertions.assertFileExists(expectedFile)
      }
    })
  })

  suite('用户友好的错误处理', () => {
    test('剪贴板中没有图片时，应该显示友好的错误提示', async () => {
      // Given: 剪贴板中没有图片
      await testEnv.createDocument(TestDocuments.empty)
      ClipboardMock.clear()
      
      // When: 用户尝试粘贴图片
      try {
        await vscode.commands.executeCommand('pastemark.pasteImage')
        assert.fail('应该抛出错误')
      } catch (error) {
        // Then: 应该得到友好的错误提示
        assert.ok(
          (error as Error).message.includes('剪贴板') || 
          (error as Error).message.includes('clipboard'),
          '错误信息应该提示剪贴板中没有图片'
        )
      }
    })

    test('图片太大时，应该显示大小限制错误', async () => {
      // Given: 剪贴板中有超大图片
      await testEnv.createDocument(TestDocuments.empty)
      ClipboardMock.setImageData(TestImages.largePng)
      
      // When: 用户尝试粘贴图片
      try {
        await vscode.commands.executeCommand('pastemark.pasteImage')
        assert.fail('应该抛出错误')
      } catch (error) {
        // Then: 应该得到大小限制错误
        assert.ok(
          (error as Error).message.includes('10MB') || 
          (error as Error).message.includes('size'),
          '错误信息应该提示图片大小超过限制'
        )
      }
    })
  })

  suite('多种图片格式支持', () => {
    test('新手用户粘贴不同格式的图片，应该都能正常处理', async () => {
      // Given: 新手用户在 Markdown 文件中
      const doc = await testEnv.createDocument(TestDocuments.withContent)
      const editor = vscode.window.activeTextEditor!
      
      const testCases = [
        { name: 'PNG 图片', buffer: TestImages.smallPng, expected: 'png' },
        { name: 'JPEG 图片', buffer: TestImages.smallJpg, expected: 'jpg' }
      ]
      
      for (const testCase of testCases) {
        // 选中文本
        const selectedText = testCase.name
        const position = new vscode.Position(10 + testCases.indexOf(testCase), 0)
        
        await editor.edit(editBuilder => {
          editBuilder.insert(position, selectedText)
        })
        
        editor.selection = new vscode.Selection(
          position,
          new vscode.Position(position.line, selectedText.length)
        )
        
        // 模拟剪贴板中有对应格式的图片
        ClipboardMock.setImageData(testCase.buffer)
        
        // When: 用户粘贴图片
        await vscode.commands.executeCommand('pastemark.pasteImage')
        await TestWaiter.wait(500)
        
        // Then: 应该正确处理该格式
        TestAssertions.assertDocumentContainsImage(doc, `${selectedText}.png`)
        
        const expectedFile = path.join(testEnv.getWorkspaceDir(), `${selectedText}.png`)
        TestAssertions.assertFileExists(expectedFile)
      }
    })
  })

  suite('文件名安全性处理', () => {
    test('用户选中包含特殊字符的文本，应该自动清理为安全的文件名', async () => {
      // Given: 用户选中包含特殊字符的文本
      const doc = await testEnv.createDocument(TestDocuments.withContent)
      const editor = vscode.window.activeTextEditor!
      
      const dangerousText = '用户/界面:设计*图?'
      await editor.edit(editBuilder => {
        editBuilder.insert(new vscode.Position(10, 0), dangerousText)
      })
      
      editor.selection = new vscode.Selection(
        new vscode.Position(10, 0),
        new vscode.Position(10, dangerousText.length)
      )
      
      ClipboardMock.setImageData(TestImages.smallPng)
      
      // When: 用户粘贴图片
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await TestWaiter.wait(500)
      
      // Then: 应该清理特殊字符
      const content = doc.getText()
      assert.ok(
        content.includes('用户-界面-设计-图-.png'),
        '应该将特殊字符替换为连字符'
      )
      
      const expectedFile = path.join(testEnv.getWorkspaceDir(), '用户-界面-设计-图-.png')
      TestAssertions.assertFileExists(expectedFile)
    })
  })

  suite('工作流程连续性', () => {
    test('新手用户连续粘贴多张图片，应该都能正常处理', async () => {
      // Given: 新手用户准备连续粘贴多张图片
      const doc = await testEnv.createDocument(TestDocuments.withContent)
      const editor = vscode.window.activeTextEditor!
      
      const images = [
        { text: '截图1', buffer: TestImages.smallPng },
        { text: '截图2', buffer: TestImages.smallJpg },
        { text: '截图3', buffer: TestImages.smallPng }
      ]
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        const position = new vscode.Position(10 + i, 0)
        
        // 插入并选中文本
        await editor.edit(editBuilder => {
          editBuilder.insert(position, image.text)
        })
        
        editor.selection = new vscode.Selection(
          position,
          new vscode.Position(position.line, image.text.length)
        )
        
        // 模拟剪贴板中有图片
        ClipboardMock.setImageData(image.buffer)
        
        // When: 用户粘贴图片
        await vscode.commands.executeCommand('pastemark.pasteImage')
        await TestWaiter.wait(500)
        
        // Then: 应该正确处理
        TestAssertions.assertDocumentContainsImage(doc, `${image.text}.png`)
        
        const expectedFile = path.join(testEnv.getWorkspaceDir(), `${image.text}.png`)
        TestAssertions.assertFileExists(expectedFile)
      }
      
      // 验证所有图片都在文档中
      const content = doc.getText()
      const imageCount = (content.match(/!\[.*?\]\(.*?\)/g) || []).length
      assert.equal(imageCount, images.length, `应该有 ${images.length} 张图片`)
    })
  })
})