# @eq-solutions/ui

Canonical EQ shared React components. Companion to [`@eq-solutions/tokens`](https://github.com/eq-solutions/eq-design-tokens) and [`@eq-solutions/roles`](https://github.com/eq-solutions/eq-roles).

All components reference `--eq-*` CSS custom properties. No hardcoded hex values. Shell (Vite + plain CSS) and Service (Next.js + Tailwind) can both consume this package.

## Install

```sh
pnpm add github:eq-solutions/eq-ui#v1.0.0
# or
npm install github:eq-solutions/eq-ui#v1.0.0
```

`@eq-solutions/tokens` is a dependency — it installs automatically.

## Setup

Import the token CSS once, at your app root (before any component renders):

```css
/* globals.css / index.css */
@import "@eq-solutions/tokens/tokens.css";
```

That's it. Every `--eq-*` custom property is now available and every component in this package will resolve correctly.

## Components

### Button

The EQ canonical button. Supports four variants, three sizes, a loading state, ref forwarding, and all standard `<button>` props.

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Height + padding tier |
| `loading` | `boolean` | `false` | Shows spinner, disables button, keeps children mounted |
| `disabled` | `boolean` | `false` | Standard HTML disabled |
| `...props` | `ButtonHTMLAttributes<HTMLButtonElement>` | — | All standard button attributes forwarded |
| `ref` | `Ref<HTMLButtonElement>` | — | ForwardRef — access the DOM node |

#### Variants

| Variant | Use for |
|---|---|
| `primary` | Main CTA — filled `--eq-sky`, white label, hover to `--eq-deep` |
| `secondary` | Secondary actions — white background, `--eq-deep` border + label, hover to `--eq-ice` |
| `ghost` | Toolbar / nav actions — transparent background, `--eq-ink` label, hover to `--eq-ice` |
| `danger` | Destructive confirmations — `--eq-error-bg` background, `--eq-error-text` border + label, hover fills red |

#### Sizes

| Size | Height | Side padding | Font size |
|---|---|---|---|
| `sm` | 32px | 12px | `--eq-text-xs` (11px) |
| `md` | 40px | 16px | `--eq-text-sm` (12px) |
| `lg` | 48px | 24px | `--eq-text-base` (14px) |

#### Usage

```tsx
import { Button } from '@eq-solutions/ui'

// Primary (default)
<Button onClick={handleSave}>Save</Button>

// Secondary outline
<Button variant="secondary" size="sm" onClick={handleCancel}>Cancel</Button>

// Ghost — toolbar / nav
<Button variant="ghost">Settings</Button>

// Async loading state (pair with useTransition or server-action isPending)
<Button loading={isPending}>Save changes</Button>

// Danger confirmation
<Button variant="danger" onClick={handleDelete}>Delete record</Button>

// Ref forwarding
const ref = useRef<HTMLButtonElement>(null)
<Button ref={ref}>Focusable</Button>
```

---

## Planned components

Extraction order from [the component audit (2026-05-30)](https://github.com/eq-solutions/eq-context):

### TODO: Skeleton

Shell (`src/components/Skeleton.tsx`) and Service (`components/ui/Skeleton.tsx`) both ship a skeleton loader. The shared component will unify:

- **API**: `shape` prop — `'text' | 'line' | 'circle' | 'card'` (Service naming wins; Shell uses `variant`).
- **Composites**: `count` repeat prop (from Shell) and `SkeletonRows` / `SkeletonCards` helpers (from Service).
- **Animation**: CSS `animation: eq-skeleton-pulse` driven by `--eq-duration-default`, no raw Tailwind `animate-pulse`.
- **Source files**: `C:\Projects\eq-shell\src\components\Skeleton.tsx`, `C:\Projects\eq-solves-service\components\ui\Skeleton.tsx`.

### TODO: Table

Shell (`src/components/EqTable.tsx`) and Service (`components/ui/DataTable.tsx`) both have a sortable data table. The shared component will:

- Align prop naming to Service's convention: `rows`, `getRowId`, `onRowClick`.
- Migrate all Shell hex literals to `--eq-*` tokens (`--eq-ink`, `--eq-gray-200`, `--eq-gray-100`, `--eq-grey`).
- Merge Service's filterable columns, row selection, and row-click into the unified component.
- **Source files**: `C:\Projects\eq-shell\src\components\EqTable.tsx`, `C:\Projects\eq-solves-service\components\ui\DataTable.tsx`.

---

## Token compliance

Every component in this package is audited before release:

- No hardcoded hex values. Grep for `#[0-9a-fA-F]{3,6}` returns zero matches in `src/`.
- All colours reference `var(--eq-*)` properties from `@eq-solutions/tokens`.
- All sizing uses token-defined spacing and radius variables.

## Related

- [`eq-solutions/eq-design-tokens`](https://github.com/eq-solutions/eq-design-tokens) — `@eq-solutions/tokens`. CSS, TS, Tailwind preset, Flutter Dart.
- [`eq-solutions/eq-roles`](https://github.com/eq-solutions/eq-roles) — `@eq-solutions/roles`. 5-tier RBAC role model and permission matrix.
- [`eq-solutions/eq-shell`](https://github.com/eq-solutions/eq-shell) — Cross-app auth + navigation chrome.
- [`Milmlow/eq-solves-service`](https://github.com/Milmlow/eq-solves-service) — EQ Service (CMMS). Primary Button source and highest-usage consumer.
