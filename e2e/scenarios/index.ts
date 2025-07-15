import * as path from 'path'
import Mocha from 'mocha'
import { glob } from 'glob'

export async function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    timeout: 60000
  })

  const testsRoot = path.resolve(__dirname, '.')

  try {
    // Use glob synchronously or with promise
    // 只运行简单的端到端测试
    const files = await glob('simple.e2e.js', { cwd: testsRoot })

    // Add files to the test suite
    files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)))

    // Run the mocha test
    return new Promise((resolve, reject) => {
      mocha.run((failures: number) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`))
        } else {
          resolve()
        }
      })
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}