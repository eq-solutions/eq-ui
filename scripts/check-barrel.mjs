#!/usr/bin/env node
/**
 * Barrel-completeness guard for @eq-solutions/ui.
 *
 * src/index.css is the barrel stylesheet consumers import wholesale via
 * `@eq-solutions/ui/styles`. Each component owns one CSS file in its own
 * folder; the barrel must @import every one of them, and every path it
 * imports must actually exist. Drift in either direction has shipped
 * unstyled components to production before (DropdownMenu, eq-shell PR
 * #1027; DateRangePicker + MultiSelect, found 2026-09-10) because adding a
 * component's CSS file was never enforced as part of adding the component.
 *
 * No dependencies — plain Node, runs without `npm install`.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const SRC = join(ROOT, 'src')
const BARREL = join(SRC, 'index.css')

// Component CSS files: one level under src/, inside a component folder.
// This naturally excludes src/index.css itself, which lives at src/ root.
const componentCssFiles = []
for (const name of readdirSync(SRC)) {
  const dir = join(SRC, name)
  if (!statSync(dir).isDirectory()) continue
  for (const entry of readdirSync(dir)) {
    if (entry.endsWith('.css')) componentCssFiles.push(`${name}/${entry}`)
  }
}

const barrelSource = readFileSync(BARREL, 'utf8')
const localImportRe = /@import\s+["']\.\/([^"']+)["']/g
const barrelImports = [...barrelSource.matchAll(localImportRe)].map((m) => m[1])
const barrelImportSet = new Set(barrelImports)

const missingFromBarrel = componentCssFiles.filter((f) => !barrelImportSet.has(f))
const danglingInBarrel = barrelImports.filter((f) => !componentCssFiles.includes(f))

if (missingFromBarrel.length || danglingInBarrel.length) {
  console.error('\n✗ barrel/filesystem drift in src/index.css:\n')
  for (const f of missingFromBarrel) {
    console.error(`  MISSING   src/${f} exists but is not @import'd by src/index.css`)
  }
  for (const f of danglingInBarrel) {
    console.error(`  DANGLING  src/index.css @imports "./${f}" but that file doesn't exist`)
  }
  console.error('\nEvery component CSS file must be @import\'d by the barrel, and every')
  console.error('barrel @import must point at a file that exists. Fix src/index.css (or')
  console.error('remove the orphaned CSS file) before merging.\n')
  process.exit(1)
}

console.log(`✓ barrel is complete — all ${componentCssFiles.length} component CSS files are wired into src/index.css`)
