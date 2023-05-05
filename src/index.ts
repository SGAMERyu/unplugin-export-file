import { createUnplugin } from 'unplugin'
import type { Options } from './core/option'
import { Context } from './core/context'

export default createUnplugin<Options>((options) => {
  const ctx = new Context(options)

  return {
    name: 'unplugin-export-file',
    vite: {
      configResolved() {
        ctx.generateExportFile()
        ctx.setupWatcher()
      },
    },
  }
})
