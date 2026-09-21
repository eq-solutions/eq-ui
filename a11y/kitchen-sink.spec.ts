import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Brand-token foreground/background pairs that fail WCAG AA today.
 * Evaluated in Chromium (not jsdom) so regressions outside this list still
 * fail the smoke. Token AA follow-up lives in eq-design-tokens — do not grow
 * this list for demo-scaffolding bugs (fix those in demo/kitchen-sink.css).
 */
const KNOWN_TOKEN_CONTRAST_PAIRS = new Set([
  // primary button / sky fills: white on --eq-sky
  '#ffffff|#3da8d8',
  // secondary / open badge / kind preventive: --eq-deep on white or ice
  '#2986b4|#ffffff',
  '#2986b4|#eaf5fb',
  // muted field chrome / inactive tabs: gray on white or ice
  '#6b7280|#ffffff',
  '#6b7280|#eaf5fb',
  '#9ca3af|#ffffff',
  // inverted spinner cell was ink; remaining shell chrome on dark sidebar
  '#535362|#1a1a2e',
  '#6a6a77|#1a1a2e',
  // status/kind soft fills
  '#f9fcfe|#71bfe3',
])

function isKnownTokenContrast(node: {
  any?: Array<{ data?: { fgColor?: string; bgColor?: string } }>
}): boolean {
  const data = node.any?.find((a) => a.data?.fgColor && a.data?.bgColor)?.data
  if (!data?.fgColor || !data?.bgColor) return false
  return KNOWN_TOKEN_CONTRAST_PAIRS.has(
    `${data.fgColor.toLowerCase()}|${data.bgColor.toLowerCase()}`
  )
}

/**
 * Boots the kitchen-sink demo in Chromium and fails on serious/critical axe
 * violations, including unexpected color-contrast failures (jsdom cannot
 * evaluate contrast).
 */
test('kitchen sink: no serious axe violations (incl. color-contrast)', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  const blocking = results.violations.filter((v) => {
    if (v.impact !== 'serious' && v.impact !== 'critical' && v.id !== 'color-contrast') {
      return false
    }
    if (v.id === 'color-contrast') {
      const unexpected = v.nodes.filter((n) => !isKnownTokenContrast(n))
      if (unexpected.length === 0) return false
      return true
    }
    return v.impact === 'serious' || v.impact === 'critical'
  }).map((v) => {
    if (v.id !== 'color-contrast') return v
    return { ...v, nodes: v.nodes.filter((n) => !isKnownTokenContrast(n)) }
  })

  // Prove color-contrast actually ran in a real browser (not jsdom-disabled).
  const contrastRan =
    results.passes.some((p) => p.id === 'color-contrast') ||
    results.violations.some((v) => v.id === 'color-contrast') ||
    results.incomplete.some((i) => i.id === 'color-contrast')
  expect(contrastRan).toBe(true)

  expect(
    blocking,
    blocking
      .map(
        (v) =>
          `${v.id} [${v.impact}]: ${v.help} (${v.nodes.length} node(s))`
      )
      .join('\n')
  ).toEqual([])
})
