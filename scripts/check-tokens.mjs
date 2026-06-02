#!/usr/bin/env node
/**
 * Token-only invariant guard for @eq-solutions/ui.
 *
 * The shared kit is styled ENTIRELY through `--eq-*` CSS custom properties so
 * that colour lives in @eq-solutions/tokens and nowhere else. This script makes
 * that rule enforceable in CI instead of relying on review discipline.
 *
 * It fails (exit 1) on any hardcoded colour literal in src/ — hex (#rgb /
 * #rrggbb / #rrggbbaa) or a colour function (rgb/rgba/hsl/hsla) — UNLESS the
 * literal sits in the fallback position of a `var(--eq-…, <fallback>)`
 * expression, which is the sanctioned "token with a sane default" pattern.
 *
 * Escape hatch: append a `token-guard-allow` comment on the offending line for
 * the rare deliberate exception (document why).
 *
 * No dependencies — plain Node, runs without `npm install`.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'src')
const EXTS = new Set(['.ts', '.tsx', '.css'])

const HEX = /#[0-9a-fA-F]{3,8}\b/
const COLOR_FN = /\b(?:rgba?|hsla?)\s*\(/i

/** Remove balanced `var(...)` spans (including nested parens) so that colour
 *  literals used only as a var() fallback are not flagged. */
function stripVar(line) {
  let out = ''
  let i = 0
  while (i < line.length) {
    if (line.startsWith('var(', i)) {
      let depth = 0
      let j = i + 3 // at the '('
      for (; j < line.length; j++) {
        if (line[j] === '(') depth++
        else if (line[j] === ')') {
          depth--
          if (depth === 0) { j++; break }
        }
      }
      i = j // skip the whole var(...)
    } else {
      out += line[i]
      i++
    }
  }
  return out
}

/** Strip comments so commented-out examples or notes don't trip the guard. */
function stripComments(line) {
  return line
    .replace(/\/\*.*?\*\//g, '')        // /* ... */ on one line
    .replace(/(^|[^:])\/\/.*$/, '$1')   // // ... but not the // in https://
}

function walk(dir) {
  const files = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) files.push(...walk(p))
    else if (EXTS.has(name.slice(name.lastIndexOf('.')))) files.push(p)
  }
  return files
}

const violations = []
for (const file of walk(SRC)) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/)
  lines.forEach((raw, idx) => {
    if (raw.includes('token-guard-allow')) return
    const line = stripVar(stripComments(raw))
    if (HEX.test(line) || COLOR_FN.test(line)) {
      violations.push({ file: relative(process.cwd(), file), line: idx + 1, text: raw.trim() })
    }
  })
}

if (violations.length) {
  console.error(`\n✗ token-only invariant violated — ${violations.length} hardcoded colour(s) in src/:\n`)
  for (const v of violations) console.error(`  ${v.file}:${v.line}  ${v.text}`)
  console.error('\nUse a --eq-* token (from @eq-solutions/tokens). For a token with a default,')
  console.error('write var(--eq-token, <fallback>). For a deliberate exception, add a')
  console.error('`token-guard-allow` comment on the line explaining why.\n')
  process.exit(1)
}

console.log('✓ token-only invariant holds — no hardcoded colours in src/')
