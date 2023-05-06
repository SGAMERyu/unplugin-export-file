import { existsSync } from 'node:fs'
import fg from 'fast-glob'
import type { Entry } from 'fast-glob'

export function findDirectoryIncludeIndex(dir: string[], root: string) {
  let directoryIncludeIndexes: string[] = []

  const directories = fg.sync(`${dir}/**`, {
    onlyDirectories: true,
    cwd: root,
    absolute: false,
  })
  directoryIncludeIndexes = directoryIncludeIndexes.concat(directories.filter(directory => existsSync(`${directory}/index.ts`)))

  return directoryIncludeIndexes
}

export function findFiles(dir: string[], root: string) {
  let allFiles: Entry[] = []

  const files = fg.sync(`${dir}/**`, {
    ignore: [`${dir}/index.ts`],
    cwd: root,
    onlyFiles: true,
    absolute: false,
    objectMode: true,
  })

  allFiles = allFiles.concat(files)
  return allFiles
}
