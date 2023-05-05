export interface Options {
  dirs: string[]
  root?: string
}

export function resolveOptions(options: Options): Options {
  const opt = options

  return {
    dirs: opt.dirs,
    root: opt.root || process.cwd(),
  }
}
