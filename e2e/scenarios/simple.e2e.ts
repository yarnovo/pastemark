import * as assert from 'assert';
import * as vscode from 'vscode';

/**
 * 简化的端到端测试
 * 
 * 测试目标：
 * - 验证扩展的基本功能和配置
 * - 确保扩展能够正确加载和激活
 * - 测试命令注册和配置项
 * - 验证基本的错误处理逻辑
 * 
 * 测试范围：
 * - 扩展激活状态
 * - 命令注册验证
 * - 配置项存在性检查
 * - 默认配置值验证
 * - 基本的用户交互行为
 * 
 * 特点：
 * - 不依赖剪贴板模拟
 * - 不需要复杂的测试环境
 * - 快速执行，适合CI/CD
 * - 专注于扩展的核心功能
 * 
 * 测试用例：
 * 1. 扩展激活检查 - 验证扩展是否正确加载
 * 2. 命令注册验证 - 确保所有命令都已注册
 * 3. 配置项检查 - 验证所有配置项的存在
 * 4. 默认值验证 - 检查配置项的默认值
 * 5. 基本错误处理 - 测试非 Markdown 文件的处理
 * 6. 剪贴板检查 - 测试无图片时的处理
 * 
 * 注意：这是一个轻量级的测试套件，主要用于快速验证扩展的基本功能
 */
suite('PasteMark 基本功能测试', () => {
  
  test('扩展应该被正确激活', async () => {
    // 获取扩展
    const extension = vscode.extensions.getExtension('yarnovo.pastemark');
    assert.ok(extension, '扩展应该存在');
    
    // 确保扩展已激活
    if (!extension.isActive) {
      await extension.activate();
    }
    
    assert.ok(extension.isActive, '扩展应该被激活');
  });

  test('粘贴图片命令应该被注册', async () => {
    // 获取所有命令
    const commands = await vscode.commands.getCommands(true);
    
    // 检查命令是否存在
    assert.ok(
      commands.includes('pastemark.pasteImage'),
      '应该包含 pastemark.pasteImage 命令'
    );
  });

  test('配置项应该被正确注册', async () => {
    // 获取配置
    const config = vscode.workspace.getConfiguration('pastemark');
    
    // 检查配置项是否存在
    assert.ok(config.has('ollamaEnabled'), '应该有 ollamaEnabled 配置');
    assert.ok(config.has('ollamaEndpoint'), '应该有 ollamaEndpoint 配置');
    assert.ok(config.has('ollamaModel'), '应该有 ollamaModel 配置');
    assert.ok(config.has('imagePath'), '应该有 imagePath 配置');
    assert.ok(config.has('imageFormat'), '应该有 imageFormat 配置');
  });

  test('默认配置值应该正确', async () => {
    // 获取配置
    const config = vscode.workspace.getConfiguration('pastemark');
    
    // 检查默认值
    assert.strictEqual(config.get('ollamaEnabled'), true, 'ollamaEnabled 默认应该为 true');
    assert.strictEqual(config.get('ollamaEndpoint'), 'http://localhost:11434', 'ollamaEndpoint 默认值');
    assert.strictEqual(config.get('ollamaModel'), 'llava', 'ollamaModel 默认值');
    assert.strictEqual(config.get('imagePath'), './', 'imagePath 默认值');
    assert.strictEqual(config.get('imageFormat'), 'png', 'imageFormat 默认值');
  });

  test('在非 Markdown 文件中执行命令应该成功执行但不会插入内容', async () => {
    // 创建一个 JavaScript 文件
    const doc = await vscode.workspace.openTextDocument({
      language: 'javascript',
      content: 'console.log("test");'
    });
    
    await vscode.window.showTextDocument(doc);
    const originalContent = doc.getText();
    
    // 执行命令 - 不应该抛出错误，但也不会插入内容
    await vscode.commands.executeCommand('pastemark.pasteImage');
    
    // 检查内容没有变化
    assert.strictEqual(doc.getText(), originalContent, '文档内容不应该改变');
  });

  test('在 Markdown 文件中执行命令但剪贴板无图片应该成功执行但不会插入内容', async () => {
    // 创建一个 Markdown 文件
    const doc = await vscode.workspace.openTextDocument({
      language: 'markdown',
      content: '# Test\n\nThis is a test.'
    });
    
    await vscode.window.showTextDocument(doc);
    const originalContent = doc.getText();
    
    // 执行命令 - 不应该抛出错误，但也不会插入内容
    await vscode.commands.executeCommand('pastemark.pasteImage');
    
    // 检查内容没有变化
    assert.strictEqual(doc.getText(), originalContent, '文档内容不应该改变');
  });
});