import { useState, useCallback, useEffect, useRef, type JSX } from 'react';
import { Menu, X } from 'lucide-react';
import './AppShell.css';

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

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

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
  const drawerRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!drawerOpen) return;

    restoreRef.current = document.activeElement;
    const drawer = drawerRef.current;
    const first = drawer?.querySelector<HTMLElement>(FOCUSABLE);
    ;(first ?? drawer)?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeDrawer();
        return;
      }
      if (e.key !== 'Tab' || !drawer) return;
      const nodes = Array.from(drawer.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === firstNode) {
        e.preventDefault();
        lastNode.focus();
      } else if (!e.shiftKey && document.activeElement === lastNode) {
        e.preventDefault();
        firstNode.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = prevOverflow;
      if (restoreRef.current instanceof HTMLElement) restoreRef.current.focus();
    };
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
        ref={drawerRef}
        className={`eq-hub-drawer${drawerOpen ? ' eq-hub-drawer--open' : ''}`}
        role={drawerOpen ? 'dialog' : undefined}
        aria-modal={drawerOpen ? true : undefined}
        aria-label={drawerOpen ? 'Navigation' : undefined}
        aria-hidden={!drawerOpen}
        tabIndex={drawerOpen ? -1 : undefined}
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
