import { useState } from 'react'
import { Plus, Trash2, Copy, MoreHorizontal } from 'lucide-react'
import { Button } from '../src/Button/Button'
import { FormInput } from '../src/FormInput/FormInput'
import { StatusBadge, type StatusKind } from '../src/StatusBadge/StatusBadge'
import { KindPill, type WorkKind } from '../src/KindPill/KindPill'
import { Card } from '../src/Card/Card'
import { Modal } from '../src/Modal/Modal'
import { ConfirmDialog } from '../src/Modal/ConfirmDialog'
import { Tabs } from '../src/Tabs/Tabs'
import { useToast } from '../src/Toast/Toast'
import { Skeleton, SkeletonRows, SkeletonCards } from '../src/Skeleton/Skeleton'
import { Spinner, type SpinnerVariant } from '../src/Spinner/Spinner'
import { Table, type TableColumn } from '../src/Table/Table'
import { DropdownMenu } from '../src/DropdownMenu/DropdownMenu'
import { AppSidebar, type AppSidebarSection } from '../src/AppShell/index'
import { Tooltip } from '../src/Tooltip/Tooltip'
import { EmptyState } from '../src/EmptyState/EmptyState'
import { Pagination } from '../src/Pagination/Pagination'
import { DateRangePicker, type DateRange } from '../src/DateRangePicker/DateRangePicker'
import { MultiSelect } from '../src/MultiSelect/MultiSelect'

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger'] as const
const SIZES = ['sm', 'md', 'lg'] as const
const STATUSES: StatusKind[] = ['open', 'in-progress', 'overdue', 'closed', 'await']
const KINDS: WorkKind[] = ['preventive', 'corrective', 'inspection']
const SPINNER_VARIANTS: SpinnerVariant[] = ['bars', 'ring', 'dots', 'trail']

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="ks-section">
      <h2 className="ks-section__title">{title}</h2>
      <div className="ks-section__body">{children}</div>
    </section>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="ks-row">{children}</div>
}

interface WorkOrderRow {
  id: string
  title: string
  status: StatusKind
  kind: WorkKind
}

const TABLE_ROWS: WorkOrderRow[] = [
  { id: 'wo-1', title: 'Replace air filter — Unit 4', status: 'open', kind: 'preventive' },
  { id: 'wo-2', title: 'Fix leaking valve — Bay 2', status: 'overdue', kind: 'corrective' },
  { id: 'wo-3', title: 'Quarterly safety walk', status: 'closed', kind: 'inspection' },
]

const TABLE_COLUMNS: TableColumn<WorkOrderRow>[] = [
  { key: 'title', header: 'Work order' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'kind',
    header: 'Kind',
    render: (row) => <KindPill kind={row.kind} />,
  },
]

const SIDEBAR_SECTIONS: AppSidebarSection[] = [
  {
    key: 'records',
    label: 'Records',
    items: [
      { key: 'work-orders', label: 'Work orders', href: '#', icon: <span aria-hidden="true">▤</span>, isActive: true, count: 12 },
      { key: 'assets', label: 'Assets', href: '#', icon: <span aria-hidden="true">▤</span> },
    ],
  },
]

export function KitchenSink() {
  const { toast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [tab, setTab] = useState('all')
  const [inputValue, setInputValue] = useState('')
  const [paginationPage, setPaginationPage] = useState(1)
  const [msStatus, setMsStatus] = useState<string[]>(['overdue'])
  const [msSites, setMsSites] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null })
  const [dateRangeCompact, setDateRangeCompact] = useState<DateRange>({ start: null, end: null })

  return (
    <main className="ks-page">
      <header className="ks-header">
        <h1>@eq-solutions/ui — kitchen sink</h1>
        <p>
          A visual reference for every component's variants, for eyeballing changes
          during development. Not a substitute for the tests — see each component's
          <code> *.test.tsx</code> for behavioral/accessibility coverage.
        </p>
      </header>

      <Section title="Button">
        {VARIANTS.map((variant) => (
          <Row key={variant}>
            {SIZES.map((size) => (
              <Button key={size} variant={variant} size={size}>
                {variant} / {size}
              </Button>
            ))}
          </Row>
        ))}
        <Row>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button icon={<Plus size={16} />}>With icon</Button>
          <Button variant="ghost" icon={<Trash2 size={16} />} aria-label="Delete" />
        </Row>
      </Section>

      <Section title="FormInput">
        <Row>
          <FormInput
            label="Site name"
            placeholder="e.g. Sydney depot"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <FormInput label="Email" type="email" hint="We'll only use this to sign you in." />
          <FormInput label="PIN" error="That PIN doesn't match." />
          <FormInput label="Disabled" disabled value="Can't edit this" />
          <FormInput label="Compact" density="compact" placeholder="Dense Field surfaces" />
        </Row>
      </Section>

      <Section title="StatusBadge">
        <Row>
          {STATUSES.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </Row>
        <Row>
          {STATUSES.map((status) => (
            <StatusBadge key={status} status={status} density="compact" />
          ))}
        </Row>
      </Section>

      <Section title="KindPill">
        <Row>
          {KINDS.map((kind) => (
            <KindPill key={kind} kind={kind} />
          ))}
        </Row>
        <Row>
          {KINDS.map((kind) => (
            <KindPill key={kind} kind={kind} density="compact" />
          ))}
        </Row>
      </Section>

      <Section title="Card">
        <Row>
          <Card title="Work orders" actions={<Button size="sm">New</Button>}>
            Plain card body with a header + action.
          </Card>
          <Card padding="none">
            <div style={{ padding: 16 }}>Edge-to-edge card (padding=&quot;none&quot;).</div>
          </Card>
        </Row>
      </Section>

      <Section title="Modal + ConfirmDialog">
        <Row>
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Open ConfirmDialog
          </Button>
        </Row>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Example modal"
          description="Plain Modal with a custom body."
        >
          <p>Modal body content goes here.</p>
        </Modal>
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => setConfirmOpen(false)}
          title="Delete this report?"
          description="This can't be undone."
          confirmLabel="Delete"
          destructive
        />
      </Section>

      <Section title="Tabs">
        <Tabs
          aria-label="Kitchen sink demo tabs"
          value={tab}
          onChange={setTab}
          items={[
            { key: 'all', label: 'All' },
            { key: 'open', label: 'Open', count: 4 },
            { key: 'blocked', label: 'Blocked', disabled: true },
            { key: 'closed', label: 'Closed' },
          ]}
        />
      </Section>

      <Section title="Toast">
        <Row>
          <Button onClick={() => toast({ tone: 'ok', title: 'Saved', message: 'Work order updated.' })}>
            Fire ok toast
          </Button>
          <Button onClick={() => toast({ tone: 'warn', title: 'Heads up', message: 'This value looks off.' })}>
            Fire warn toast
          </Button>
          <Button onClick={() => toast({ tone: 'err', title: 'Failed', message: 'Could not save.' })}>
            Fire err toast
          </Button>
          <Button onClick={() => toast({ tone: 'info', title: 'FYI', duration: 0 })}>
            Fire persistent toast
          </Button>
        </Row>
      </Section>

      <Section title="Skeleton">
        <Row>
          <Skeleton shape="text" width="60%" />
        </Row>
        <Row>
          <Skeleton shape="circle" width={40} height={40} />
        </Row>
        <Row>
          <Skeleton shape="card" />
        </Row>
        <Row>
          <SkeletonCards count={2} />
        </Row>
      </Section>

      <Section title="Spinner">
        <Row>
          {SPINNER_VARIANTS.map((variant) => (
            <div key={variant} className="ks-spinner-cell">
              <Spinner variant={variant} />
              <span>{variant}</span>
            </div>
          ))}
        </Row>
        <Row>
          <div className="ks-spinner-cell ks-spinner-cell--inverted">
            <Spinner variant="bars" inverted />
            <span>inverted</span>
          </div>
        </Row>
      </Section>

      <Section title="Tooltip">
        <Row>
          <Tooltip content="Runs a compliance check">
            <Button variant="secondary" size="sm">Hover me</Button>
          </Tooltip>
          <Tooltip content="Last synced 2 min ago" placement="bottom">
            <Button variant="ghost" size="sm">Sync now</Button>
          </Tooltip>
        </Row>
      </Section>

      <Section title="Table">
        <Table columns={TABLE_COLUMNS} rows={TABLE_ROWS} />
        <p className="ks-note">Loading state (SkeletonRows), rendered standalone below:</p>
        <table className="eq-table">
          <tbody>
            <SkeletonRows count={3} columns={3} />
          </tbody>
        </table>
      </Section>

      <Section title="DateRangePicker">
        <Row>
          <DateRangePicker label="Date range" value={dateRange} onChange={setDateRange} />
          <DateRangePicker
            label="Compact"
            value={dateRangeCompact}
            onChange={setDateRangeCompact}
            density="compact"
          />
        </Row>
      </Section>

      <Section title="MultiSelect">
        <Row>
          <MultiSelect
            label="Status"
            options={[
              { value: 'open', label: 'Open', color: 'var(--eq-sky)' },
              { value: 'in-progress', label: 'In progress', color: 'var(--eq-warning-text)' },
              { value: 'overdue', label: 'Overdue', color: 'var(--eq-error-text)' },
              { value: 'closed', label: 'Closed', color: 'var(--eq-success-text)' },
            ]}
            value={msStatus}
            onChange={setMsStatus}
          />
          <MultiSelect
            label="Sites (search appears past 8 options)"
            placeholder="Any site"
            options={[
              'Sydney depot', 'Parramatta yard', 'Bankstown warehouse', 'Liverpool site',
              'Penrith depot', 'Blacktown yard', 'Campbelltown site', 'Hornsby depot',
              'Chatswood office', 'Manly site',
            ].map((s) => ({ value: s, label: s }))}
            value={msSites}
            onChange={setMsSites}
          />
        </Row>
      </Section>

      <Section title="Pagination">
        <Pagination page={paginationPage} pageCount={12} onPageChange={setPaginationPage} />
        <Pagination
          page={paginationPage}
          pageCount={12}
          onPageChange={setPaginationPage}
          density="compact"
        />
      </Section>

      <Section title="EmptyState">
        <EmptyState
          title="No job numbers added yet"
          description="Job numbers you add will show up here for the whole team."
          action={<Button size="sm">Add job number</Button>}
        />
        <EmptyState
          variant="filtered"
          title="No results match your filters"
          action={<Button variant="ghost" size="sm">Clear filters</Button>}
        />
        <EmptyState
          variant="error"
          title="Couldn't load job numbers"
          action={<Button size="sm">Try again</Button>}
        />
        <EmptyState variant="no-access" title="You don't have access to this site" />
      </Section>

      <Section title="DropdownMenu">
        <Row>
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="sm" icon={<MoreHorizontal size={16} />} aria-label="More" />
            }
            items={[
              { key: 'dup', label: 'Duplicate', icon: <Copy size={14} />, onClick: () => toast({ title: 'Duplicated' }) },
              { key: 'sep', separator: true },
              { key: 'trash', label: 'Move to trash', icon: <Trash2 size={14} />, onClick: () => toast({ tone: 'err', title: 'Trashed' }), variant: 'danger' },
            ]}
          />
          <DropdownMenu
            density="compact"
            trigger={
              <Button variant="ghost" size="sm" icon={<MoreHorizontal size={16} />} aria-label="More (compact)" />
            }
            items={[
              { key: 'dup', label: 'Duplicate', icon: <Copy size={14} />, onClick: () => toast({ title: 'Duplicated' }) },
              { key: 'sep', separator: true },
              { key: 'trash', label: 'Move to trash', icon: <Trash2 size={14} />, onClick: () => toast({ tone: 'err', title: 'Trashed' }), variant: 'danger' },
            ]}
          />
        </Row>
      </Section>

      <Section title="AppSidebar (bounded preview)">
        <p className="ks-note">
          AppShell/AppSidebar/AppRail are page-level layout chrome, not gallery
          tiles — bounded here in a fixed-height box just to preview the sidebar's
          own styling. See AppShell.test.tsx for behavior coverage (drawer,
          keyboard, focus).
        </p>
        <div className="ks-shell-box">
          <AppSidebar
            homeHref="#"
            brandLabel="EQ Solutions"
            live
            sections={SIDEBAR_SECTIONS}
            user={{ initials: 'RM', name: 'Royce Milmlow', meta: 'MANAGER · EQ Solutions' }}
            onLogout={() => toast({ title: 'Logged out' })}
          />
        </div>
      </Section>
    </main>
  )
}
