import * as assert from 'assert'
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import { test, expect } from '@playwright/test'

// 使用 Playwright 进行 UI 自动化测试
suite('PasteMark E2E Tests', () => {
  let testWorkspace: string
  let testDocument: vscode.TextDocument

  suiteSetup(async () => {
    // 创建测试工作区
    testWorkspace = path.join(__dirname, '../fixtures/test-workspace')
    if (!fs.existsSync(testWorkspace)) {
      fs.mkdirSync(testWorkspace, { recursive: true })
    }
  })

  suiteTeardown(async () => {
    // 清理测试文件
    const files = fs.readdirSync(testWorkspace)
    for (const file of files) {
      if (file.endsWith('.png') || file.endsWith('.jpg')) {
        fs.unlinkSync(path.join(testWorkspace, file))
      }
    }
  })

  setup(async () => {
    // 创建测试 Markdown 文件
    const testFile = path.join(testWorkspace, 'test.md')
    fs.writeFileSync(testFile, '# Test Document\n\n')
    
    // 打开文档
    const uri = vscode.Uri.file(testFile)
    testDocument = await vscode.workspace.openTextDocument(uri)
    await vscode.window.showTextDocument(testDocument)
  })

  teardown(async () => {
    // 关闭所有编辑器
    await vscode.commands.executeCommand('workbench.action.closeAllEditors')
  })

  test('用户选中文本并粘贴截图', async () => {
    // Arrange
    const editor = vscode.window.activeTextEditor!
    const testText = 'my-screenshot'
    
    // 插入并选中文本
    await editor.edit(editBuilder => {
      editBuilder.insert(new vscode.Position(2, 0), testText)
    })
    
    editor.selection = new vscode.Selection(
      new vscode.Position(2, 0),
      new vscode.Position(2, testText.length)
    )

    // 模拟复制图片到剪贴板（这里需要实际的图片数据）
    // 在实际测试中，可能需要使用系统剪贴板工具或 mock
    
    // Act
    await vscode.commands.executeCommand('pastemark.pasteImage')
    
    // 等待命令执行完成
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Assert
    const content = testDocument.getText()
    assert.ok(content.includes(`![${testText}](./${testText}.png)`))
    
    const imagePath = path.join(testWorkspace, `${testText}.png`)
    assert.ok(fs.existsSync(imagePath), '图片文件应该被创建')
  })

  test('用户直接粘贴图片（智能命名）', async () => {
    // Arrange
    const editor = vscode.window.activeTextEditor!
    
    // 设置光标位置
    editor.selection = new vscode.Selection(
      new vscode.Position(2, 0),
      new vscode.Position(2, 0)
    )
    
    // Act
    await vscode.commands.executeCommand('pastemark.pasteImage')
    
    // 等待命令执行完成
    await new Promise(resolve => setTimeout(resolve, 2000)) // 可能需要调用 Ollama
    
    // Assert
    const content = testDocument.getText()
    
    // 检查是否插入了图片引用（可能是智能命名或随机命名）
    const imagePattern = /!\[.*\]\(\.\/(.*\.png)\)/
    const match = content.match(imagePattern)
    assert.ok(match, '应该插入图片引用')
    
    if (match) {
      const imageName = match[1]
      const imagePath = path.join(testWorkspace, imageName)
      assert.ok(fs.existsSync(imagePath), '图片文件应该被创建')
    }
  })

  test('用户在没有 Ollama 时粘贴图片', async () => {
    // Arrange
    // 禁用 Ollama
    await vscode.workspace.getConfiguration('pastemark').update('ollamaEnabled', false)
    
    const editor = vscode.window.activeTextEditor!
    editor.selection = new vscode.Selection(
      new vscode.Position(2, 0),
      new vscode.Position(2, 0)
    )
    
    // Act
    await vscode.commands.executeCommand('pastemark.pasteImage')
    
    // 等待命令执行完成
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Assert
    const content = testDocument.getText()
    
    // 应该使用时间戳命名
    const timestampPattern = /!\[image\]\(\.\/image-\d{8}-\d{6}\.png\)/
    assert.ok(content.match(timestampPattern), '应该使用时间戳命名')
    
    // 恢复设置
    await vscode.workspace.getConfiguration('pastemark').update('ollamaEnabled', true)
  })

  test('用户粘贴不同格式的图片', async () => {
    // 测试 JPEG 格式
    await vscode.workspace.getConfiguration('pastemark').update('imageFormat', 'jpg')
    
    const editor = vscode.window.activeTextEditor!
    await editor.edit(editBuilder => {
      editBuilder.insert(new vscode.Position(3, 0), 'test-jpeg')
    })
    
    editor.selection = new vscode.Selection(
      new vscode.Position(3, 0),
      new vscode.Position(3, 9)
    )
    
    // Act
    await vscode.commands.executeCommand('pastemark.pasteImage')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Assert
    const content = testDocument.getText()
    assert.ok(content.includes('![test-jpeg](./test-jpeg.jpg)'))
    
    // 恢复设置
    await vscode.workspace.getConfiguration('pastemark').update('imageFormat', 'png')
  })

  test('处理超大图片', async () => {
    // 这个测试需要准备一个大于 10MB 的图片
    // 在实际测试中，需要将大图片复制到剪贴板
    
    const editor = vscode.window.activeTextEditor!
    editor.selection = new vscode.Selection(
      new vscode.Position(2, 0),
      new vscode.Position(2, 0)
    )
    
    // Act & Assert
    try {
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 如果图片太大，应该显示错误消息
      // 这里需要检查是否有错误提示
    } catch (error) {
      assert.ok(error.message.includes('超过 10MB'))
    }
  })

  test('处理特殊字符文件名', async () => {
    const editor = vscode.window.activeTextEditor!
    const specialText = 'test/file:name*special?.txt'
    
    await editor.edit(editBuilder => {
      editBuilder.insert(new vscode.Position(4, 0), specialText)
    })
    
    editor.selection = new vscode.Selection(
      new vscode.Position(4, 0),
      new vscode.Position(4, specialText.length)
    )
    
    // Act
    await vscode.commands.executeCommand('pastemark.pasteImage')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Assert
    const content = testDocument.getText()
    // 特殊字符应该被清理
    assert.ok(content.includes('![test-file-name-special-.txt]'))
    
    // 检查文件是否存在
    const files = fs.readdirSync(testWorkspace)
    const createdFile = files.find(f => f.includes('test-file-name-special'))
    assert.ok(createdFile, '文件应该被创建，且特殊字符被处理')
  })

  test('处理只读文件系统', async () => {
    // 这个测试比较复杂，需要模拟只读文件系统
    // 在实际测试中，可能需要更改文件权限或使用特殊的测试环境
    
    // 临时更改目录权限（需要管理员权限）
    // fs.chmodSync(testWorkspace, '555') // 只读
    
    try {
      await vscode.commands.executeCommand('pastemark.pasteImage')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 应该显示错误消息
      assert.fail('应该抛出权限错误')
    } catch (error) {
      assert.ok(error.message.includes('权限') || error.message.includes('Permission'))
    } finally {
      // 恢复权限
      // fs.chmodSync(testWorkspace, '755')
    }
  })
})

// Playwright 测试（更高级的 UI 自动化）
test.describe('PasteMark UI Tests', () => {
  test('完整的用户操作流程', async ({ page }) => {
    // 这些测试需要在实际的 VSCode 窗口中运行
    // 使用 Playwright 或 vscode-extension-tester
    
    // 示例：
    // await page.keyboard.press('Control+Shift+P')
    // await page.type('pastemark')
    // await page.keyboard.press('Enter')
    
    // 验证命令是否在命令面板中显示
    // 验证快捷键是否正常工作
    // 验证设置页面
  })
})