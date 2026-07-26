import { axe as runAxe } from 'vitest-axe'

/**
 * jsdom has no real layout/paint engine, so axe-core's `color-contrast` check
 * can't do its job here (it needs computed rendered colour, which jsdom fakes
 * via an unimplemented canvas API) — it's a structural/ARIA check in these
 * tests, not a contrast check. Real contrast needs a real browser.
 */
export function axe(
  container: Element,
  extraRules: Record<string, { enabled: boolean }> = {}
) {
  return runAxe(container, {
    rules: { 'color-contrast': { enabled: false }, ...extraRules },
  })
}
