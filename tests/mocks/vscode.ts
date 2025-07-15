import { vi } from 'vitest'

// Window API Mock
export const window = {
  showInformationMessage: vi.fn(),
  showErrorMessage: vi.fn(),
  showWarningMessage: vi.fn(),
  activeTextEditor: undefined as any,
  createOutputChannel: vi.fn(() => ({
    appendLine: vi.fn(),
    show: vi.fn()
  }))
}

// Workspace API Mock
export const workspace = {
  getConfiguration: vi.fn(() => ({
    get: vi.fn((key: string) => {
      const defaults: Record<string, any> = {
        'pastemark.ollamaEnabled': true,
        'pastemark.ollamaEndpoint': 'http://localhost:11434',
        'pastemark.ollamaModel': 'llava',
        'pastemark.imagePath': './',
        'pastemark.imageFormat': 'png'
      }
      return defaults[key]
    }),
    update: vi.fn()
  })),
  fs: {
    writeFile: vi.fn(),
    readFile: vi.fn(),
    stat: vi.fn()
  }
}

// Uri API Mock
export const Uri = {
  file: vi.fn((path: string) => ({ 
    fsPath: path,
    path: path,
    scheme: 'file'
  })),
  parse: vi.fn(),
  joinPath: vi.fn((uri: any, ...paths: string[]) => ({
    fsPath: path.join(uri.fsPath, ...paths),
    path: path.join(uri.path, ...paths),
    scheme: 'file'
  }))
}

// Commands API Mock
export const commands = {
  registerCommand: vi.fn(),
  executeCommand: vi.fn()
}

// TextDocument Mock
export class TextDocument {
  uri = { fsPath: '/test/file.md' }
  fileName = 'file.md'
  languageId = 'markdown'
  version = 1
  isDirty = false
  isClosed = false
  save = vi.fn()
  lineCount = 10
  
  getText(range?: any) {
    return 'test content'
  }
  
  getWordRangeAtPosition(position: any) {
    return undefined
  }
  
  lineAt(line: number) {
    return {
      lineNumber: line,
      text: '',
      range: null,
      rangeIncludingLineBreak: null,
      firstNonWhitespaceCharacterIndex: 0,
      isEmptyOrWhitespace: true
    }
  }
}

// Selection and Position Mocks
export class Position {
  constructor(public line: number, public character: number) {}
}

export class Range {
  constructor(
    public start: Position | number,
    public end: Position | number
  ) {
    if (typeof start === 'number') {
      this.start = new Position(start, 0)
    }
    if (typeof end === 'number') {
      this.end = new Position(end, 0)
    }
  }
}

export class Selection extends Range {
  constructor(
    anchor: Position | number,
    active: Position | number
  ) {
    super(anchor, active)
  }
}

// ExtensionContext Mock
export const ExtensionContext = {
  subscriptions: [],
  workspaceState: {
    get: vi.fn(),
    update: vi.fn()
  },
  globalState: {
    get: vi.fn(),
    update: vi.fn(),
    setKeysForSync: vi.fn()
  },
  extensionPath: '/test/extension',
  extensionUri: Uri.file('/test/extension'),
  asAbsolutePath: vi.fn((relativePath: string) => `/test/extension/${relativePath}`),
  storagePath: '/test/storage',
  globalStoragePath: '/test/global-storage',
  logPath: '/test/logs'
}

// 导出默认的 vscode 对象
export default {
  window,
  workspace,
  Uri,
  commands,
  Position,
  Range,
  Selection,
  TextDocument,
  ExtensionContext
}