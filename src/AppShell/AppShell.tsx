import { useState, useCallback, useEffect, type JSX } from 'react';
import { Menu, X } from 'lucide-react';

interface AppShellSidebarProps {
  mode?: 'sidebar';
  /** The sidebar to render (e.g. <AppSidebar …/>). */
  sidebar: React.ReactNode;
  children: React.ReactNode;
  /** Skip the max-width eq-hub-content wrapper — use for full-bleed content. */
  fullWidth?: boolean;
}

interface AppShellRailProps {
  mode: 'rail';
  /** The icon rail to render (e.g. <AppRail …/>). */
  rail: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: never;
}

export type AppShellProps = AppShellSidebarProps | AppShellRailProps;

/**
 * AppShell — the outer layout container for EQ apps.
 *
 * mode="sidebar" (default): full 260px collapsible sidebar + content area.
 *   Pass <AppSidebar /> as the `sidebar` prop.
 *
 * mode="rail": 48px icon rail + offset content area (for iframe/embedded pages).
 *   Pass <AppRail /> as the `rail` prop.
 */
export function AppShell(props: AppShellProps): JSX.Element {
  if (props.mode === 'rail') {
    return (
      <>
        {props.rail}
        <div
          className="eq-icon-rail-offset"
          style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
        >
          {props.children}
        </div>
      </>
    );
  }

  return <AppShellSidebar {...props} />;
}

function AppShellSidebar({
  sidebar,
  children,
  fullWidth,
}: AppShellSidebarProps): JSX.Element {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [drawerOpen, closeDrawer]);

  return (
    <div className="eq-hub">
      {/* Mobile hamburger */}
      <button
        type="button"
        className="eq-hub-hamburger"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open navigation"
        aria-expanded={drawerOpen}
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      {/* Mobile drawer backdrop */}
      {drawerOpen && (
        <div
          className="eq-hub-drawer-backdrop"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`eq-hub-drawer${drawerOpen ? ' eq-hub-drawer--open' : ''}`}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          className="eq-hub-drawer__close"
          onClick={closeDrawer}
          aria-label="Close navigation"
        >
          <X size={20} aria-hidden="true" />
        </button>
        {sidebar}
      </div>

      {/* Desktop sidebar */}
      {sidebar}

      {/* Content */}
      <div className="eq-hub__content" style={fullWidth ? { overflow: 'hidden' } : undefined}>
        {fullWidth ? children : (
          <main className="eq-hub-content">
            {children}
          </main>
        )}
      </div>
    </div>
  );
}
