import * as vscode from 'vscode';
import { PasteImageCommand } from './commands/pasteImageCommand';

export function activate(context: vscode.ExtensionContext) {
    console.log('PasteMark extension is now active!');
    
    const outputChannel = vscode.window.createOutputChannel('PasteMark');
    const pasteImageCommand = new PasteImageCommand(context.extensionPath, outputChannel);
    
    const disposable = vscode.commands.registerCommand('pastemark.pasteImage', () => {
        return pasteImageCommand.execute();
    });
    
    context.subscriptions.push(disposable);
    context.subscriptions.push(outputChannel);
}

export function deactivate() {
    console.log('PasteMark extension is now deactivated!');
}