import * as vscode from 'vscode'
import { PasteImageCommand } from './commands/pasteImageCommand'

export function activate(context: vscode.ExtensionContext) {
  console.log('PasteMark extension is now active!')

  // 创建命令实例
  const pasteImageCommand = new PasteImageCommand()

  // 注册命令
  const disposable = vscode.commands.registerCommand(
    'pastemark.pasteImage',
    () => pasteImageCommand.execute()
  )

  context.subscriptions.push(disposable)
}

export function deactivate() {
  console.log('PasteMark extension is now deactivated')
}