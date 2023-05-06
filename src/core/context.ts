import { writeFile } from 'node:fs/promises'
import { basename, dirname, extname, join, resolve } from 'node:path'
import chokidar from 'chokidar'
import { normalizePath } from '@rollup/pluginutils'
import type { Options } from './option'
import { resolveOptions } from './option'
import { findDirectoryIncludeIndex, findFiles } from './utils'

const EXT_REGEXP = /^.*\.(ts|js|jsx|tsx)$/

export class Context {
  options: Options

  constructor(private rawOptions: Options) {
    this.options = resolveOptions(rawOptions)
  }

  async generateExportFile() {
    const { dirs, root } = this.options
    dirs.forEach((dir) => {
      const entryIndex = resolve(root!, dir, 'index.ts')
      const indexDirectory = findDirectoryIncludeIndex(dirs, root!)
      const allFiles = findFiles(dirs, root!)
      const exportFiles = allFiles.filter(file => !indexDirectory.includes(dirname(file.path))).map((file) => {
        const ext = extname(file.path)
        if (EXT_REGEXP.test(ext)) {
          const fileName = basename(file.path, extname(file.path))
          const filePath = join(dirname(file.path), fileName)
          return `export * from '${filePath}'`
        }
        return `export * from '${file.path}'`
      })
      const exportDirectory = indexDirectory.map(directory => `export * from '${directory}'`)
      const allExports = [...exportDirectory, ...exportFiles].map(path => normalizePath(path.replace(`${dir}/`, './'))).join('\n')
      writeFile(entryIndex, allExports)
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
