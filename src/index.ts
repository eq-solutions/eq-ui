/**
 * @eq-solutions/ui
 *
 * Canonical EQ shared React component library.
 * Consuming apps must import @eq-solutions/tokens/tokens.css before mounting
 * any component so the --eq-* custom properties are defined on :root.
 */

// Button
export { Button } from './Button/Button'
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button/Button'

// FormInput
export { FormInput } from './FormInput/FormInput'
export type { FormInputProps } from './FormInput/FormInput'

// StatusBadge
export { StatusBadge } from './StatusBadge/StatusBadge'
export type { StatusBadgeProps, StatusKind } from './StatusBadge/StatusBadge'

// KindPill
export { KindPill } from './KindPill/KindPill'
export type { KindPillProps, WorkKind } from './KindPill/KindPill'

// Card
export { Card } from './Card/Card'
export type { CardProps } from './Card/Card'

// Modal / ConfirmDialog
export { Modal } from './Modal/Modal'
export type { ModalProps } from './Modal/Modal'
export { ConfirmDialog } from './Modal/ConfirmDialog'
export type { ConfirmDialogProps } from './Modal/ConfirmDialog'

// Tabs
export { Tabs } from './Tabs/Tabs'
export type { TabsProps, TabItem } from './Tabs/Tabs'

// Toast
export { ToastProvider, useToast } from './Toast/Toast'
export type { ToastOptions, ToastTone } from './Toast/Toast'

// Skeleton
export { Skeleton, SkeletonRows, SkeletonCards } from './Skeleton/Skeleton'
export type {
  SkeletonProps,
  SkeletonShape,
  SkeletonRowsProps,
  SkeletonCardsProps,
} from './Skeleton/Skeleton'

// Table
export { Table, TableBulkAction } from './Table/Table'
export type {
  TableProps,
  TableColumn,
  TableColumnDef,
  TableSlicer,
  TablePagination,
  TableBulkActionProps,
} from './Table/Table'

// AppShell — layout chrome (sidebar, icon rail, layout wrapper)
export { AppShell, AppSidebar, AppRail } from './AppShell/index'
export type {
  AppShellProps,
  AppSidebarProps,
  AppSidebarSection,
  AppSidebarItem,
  AppSidebarUser,
  AppRailProps,
  AppRailItem,
} from './AppShell/index'
