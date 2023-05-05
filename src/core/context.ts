import { writeFile } from 'node:fs/promises'
import { basename, extname, resolve } from 'node:path'
import chokidar from 'chokidar'
import fg from 'fast-glob'
import type { Options } from './option'
import { resolveOptions } from './option'

export class Context {
  options: Options

  constructor(private rawOptions: Options) {
    this.options = resolveOptions(rawOptions)
  }

  async generateExportFile() {
    const { dirs, root } = this.options
    dirs.forEach((dir) => {
      const exportMainPath = resolve(root!, `${dir}/index.ts`)
      const files = fg.sync(`${dir}/**`, {
        ignore: ['node_modules'],
        onlyFiles: true,
        cwd: root,
        absolute: false,
        objectMode: true,
      })
      const filePathsContent = files.filter(file => file.name !== 'index.ts').map((file) => {
        const ext = extname(file.path)
        const importPath = basename(file.path, ext)
        return `export * from './${importPath}'`
      }).join('\n')
      writeFile(exportMainPath, filePathsContent)
    })
  }

  setupWatcher() {
    const { dirs, root } = this.options
    chokidar.watch(dirs, {
      cwd: root!,
    }).on('add', () => {
      this.generateExportFile()
    }).on('unlink', () => {
      this.generateExportFile()
    })
  }
}
