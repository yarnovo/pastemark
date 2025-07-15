import * as vscode from 'vscode'

export interface ImageData {
  buffer: Buffer
  format: string
}

export interface FileNameOptions {
  selectedText?: string
  useOllama: boolean
  imageData: ImageData
}

export interface ProcessedImage {
  buffer: Buffer
  format: string
  fileName?: string
}

export interface TextSelection {
  text: string
  range: vscode.Range
}

export interface PasteMarkConfig {
  ollamaEnabled: boolean
  ollamaEndpoint: string
  ollamaModel: string
  imagePath: string
  imageFormat: string
}