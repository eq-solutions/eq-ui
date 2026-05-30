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

### Skeleton

Animated grey placeholder blocks for content that is still loading. All animation is driven by the `--eq-duration-default` CSS token — no raw Tailwind classes or hardcoded values.

Three exports: `Skeleton` (single block), `SkeletonRows` (table loading rows), `SkeletonCards` (card grid).

#### Skeleton props

| Prop | Type | Default | Description |
|---|---|---|---|
| `shape` | `'text' \| 'line' \| 'circle' \| 'card'` | `'text'` | Pre-built shape |
| `count` | `number` | `1` | Repeat the block N times |
| `width` | `string \| number` | — | Override width (CSS string or px number) |
| `height` | `string \| number` | — | Override height |
| `...props` | `HTMLAttributes<HTMLSpanElement>` | — | All span attributes forwarded |

| Shape | Dimensions | Use for |
|---|---|---|
| `text` | `1rem` tall, `100%` wide | Single text line |
| `line` | `0.5rem` tall, pill-shaped | Caption / sub-label |
| `circle` | Set `width` + `height` | Avatar / icon |
| `card` | `8rem` tall, `100%` wide | Card placeholder |

#### SkeletonRows props

| Prop | Type | Default | Description |
|---|---|---|---|
| `count` | `number` | `5` | Number of table rows |
| `columns` | `number` | `4` | Cells per row |

#### SkeletonCards props

| Prop | Type | Default | Description |
|---|---|---|---|
| `count` | `number` | `4` | Number of card tiles |

#### Usage

```tsx
import { Skeleton, SkeletonRows, SkeletonCards } from '@eq-solutions/ui'

// Single text line
<Skeleton shape="text" width="60%" />

// Three text lines
<Skeleton shape="text" count={3} />

// Avatar circle
<Skeleton shape="circle" width={40} height={40} />

// Card placeholder
<Skeleton shape="card" />

// Table loading state — drop inside <tbody>
<tbody>
  {isLoading ? <SkeletonRows count={8} columns={5} /> : rows.map(…)}
</tbody>

// Dashboard card grid
{isLoading ? <SkeletonCards count={6} /> : cards.map(…)}
```

---

### Table

Generic sortable data table. Supports filterable columns, row selection checkboxes, row-click navigation, per-row style overrides, and an empty state. All styling uses `--eq-*` CSS custom properties.

Generic over row type `T`.

#### TableColumn definition

| Field | Type | Description |
|---|---|---|
| `key` | `string` | Unique column key (used for sort + filter state) |
| `header` | `string` | Column header label |
| `render` | `(row: T) => ReactNode` | Optional cell renderer. Defaults to `String(row[key])` |
| `sortAccessor` | `(row: T) => string \| number \| null \| undefined` | Value to sort by. Omit to use `row[key]` directly |
| `sortable` | `false` | Set to disable sorting on this column |
| `filterable` | `'text' \| 'select'` | Enable a filter input under the header |
| `filterOptions` | `{ value: string; label: string }[]` | Explicit select options (auto-detected from data when omitted) |
| `className` | `string` | CSS class on every `<td>` in this column |
| `width` | `string \| number` | Fixed column width |
| `align` | `'left' \| 'right' \| 'center'` | Text alignment. Defaults to `'left'` |

#### Table props

| Prop | Type | Default | Description |
|---|---|---|---|
| `rows` | `T[]` | — | Row data |
| `columns` | `TableColumn<T>[]` | — | Column definitions |
| `getRowId` | `(row: T) => string` | `row.id` | Stable unique ID per row |
| `defaultSort` | `{ key: string; dir?: 'asc' \| 'desc' }` | — | Initial sort column + direction |
| `emptyMessage` | `string` | `'No data to display.'` | Empty state text |
| `className` | `string` | — | Extra class on the wrapper `<div>` |
| `rowStyle` | `(row: T) => CSSProperties \| undefined` | — | Per-row inline style (conditional colours) |
| `selectable` | `boolean` | `false` | Add leading checkbox column |
| `selectedIds` | `Set<string>` | — | Controlled selection state |
| `onSelectionChange` | `(ids: Set<string>) => void` | — | Selection change callback |
| `onRowClick` | `(row: T) => void` | — | Row click callback |

#### Usage

```tsx
import { Table } from '@eq-solutions/ui'
import type { TableColumn } from '@eq-solutions/ui'

interface Order {
  id: string
  ref: string
  status: string
  amount: number
}

const columns: TableColumn<Order>[] = [
  {
    key: 'ref',
    header: 'Ref',
    sortAccessor: r => r.ref,
    filterable: 'text',
  },
  {
    key: 'status',
    header: 'Status',
    filterable: 'select',
    render: r => <span>{r.status}</span>,
  },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    sortAccessor: r => r.amount,
    render: r => `$${r.amount.toFixed(2)}`,
  },
]

// Basic sortable + filterable table
<Table
  rows={orders}
  columns={columns}
  getRowId={r => r.id}
/>

// With row selection + navigation
const [selected, setSelected] = useState<Set<string>>(new Set())

<Table
  rows={orders}
  columns={columns}
  getRowId={r => r.id}
  selectable
  selectedIds={selected}
  onSelectionChange={setSelected}
  onRowClick={r => router.push(`/orders/${r.id}`)}
/>

// Conditional row colour
<Table
  rows={orders}
  columns={columns}
  getRowId={r => r.id}
  rowStyle={r => r.status === 'overdue' ? { color: 'var(--eq-error-text)' } : undefined}
/>
```

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
