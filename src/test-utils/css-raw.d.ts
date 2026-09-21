declare module '*.css?raw' {
  const css: string
  export default css
}

/** Minimal Node builtins for test-only filesystem reads (no @types/node). */
declare module 'node:fs' {
  export function readFileSync(
    path: string,
    options?: { encoding?: BufferEncoding | null } | BufferEncoding | null
  ): string | Buffer
}

declare module 'node:path' {
  export function dirname(path: string): string
  export function join(...paths: string[]): string
}

declare module 'node:url' {
  export function fileURLToPath(url: string | URL): string
}

type BufferEncoding =
  | 'ascii'
  | 'utf8'
  | 'utf-8'
  | 'utf16le'
  | 'ucs2'
  | 'ucs-2'
  | 'base64'
  | 'base64url'
  | 'latin1'
  | 'binary'
  | 'hex'
