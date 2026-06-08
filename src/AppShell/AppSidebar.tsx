import { useState, useCallback, type JSX } from 'react';
import { AlignJustify, ChevronLeft, LogOut } from 'lucide-react';

export interface AppSidebarItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
  count?: number | null;
  /** Badge text rendered in a muted chip (e.g. "BETA"). */
  badge?: string;
  /** Amber warn dot beside the count. */
  warn?: boolean;
  /** Render count in muted/slate style instead of sky. */
  muted?: boolean;
  /** Show the → arrow at the trailing edge. */
  arrow?: boolean;
}

export interface AppSidebarSection {
  key: string;
  label: string;
  items: AppSidebarItem[];
}

export interface AppSidebarUser {
  /** Two-letter initials rendered in the avatar circle. */
  initials: string;
  /** Display name. */
  name: string;
  /** Subtitle line — e.g. "MANAGER · SKS Technologies". */
  meta: string;
}

export interface AppSidebarProps {
  /** href for the brand logo link (typically the tenant home). */
  homeHref: string;
  /** Logo element — e.g. <EqLogo size={40} onDark /> */
  logo?: React.ReactNode;
  /** Text displayed next to the logo. */
  brandLabel?: string;
  /** Whether to show the Live pill. */
  live?: boolean;
  /** Slot for a tenant switcher (rendered below the Live pill when expanded). */
  tenantSwitcher?: React.ReactNode;
  /** Nav sections (Records, Apps, Reports, Admin, …). */
  sections: AppSidebarSection[];
  user: AppSidebarUser;
  /** Compact density toggle state. */
  compact?: boolean;
  onToggleCompact?: () => void;
  onLogout: () => void;
  /**
   * localStorage key for persisting collapse state.
   * Defaults to 'eq-shell-sidebar-collapsed'.
   */
  storageKey?: string;
}

const DEFAULT_KEY = 'eq-shell-sidebar-collapsed';

function useCollapsed(key: string): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(key) === '1'; } catch { return false; }
  });
  const toggle = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem(key, next ? '1' : '0'); } catch { /* private mode */ }
      return next;
    });
  }, [key]);
  return [collapsed, toggle];
}

export function AppSidebar({
  homeHref,
  logo,
  brandLabel,
  live,
  tenantSwitcher,
  sections,
  user,
  compact,
  onToggleCompact,
  onLogout,
  storageKey = DEFAULT_KEY,
}: AppSidebarProps): JSX.Element {
  const [collapsed, toggleCollapsed] = useCollapsed(storageKey);

  return (
    <aside className={`eq-hub__sidebar${collapsed ? ' eq-hub__sidebar--collapsed' : ''}`}>

      {/* ── Brand row ── */}
      <div className="eq-hub-sidebar__brand-row">
        <a href={homeHref} className="eq-hub-sidebar__brand" aria-label="Go to dashboard">
          {logo}
          {brandLabel && (
            <span className="eq-hub-sidebar__brand-label">{brandLabel}</span>
          )}
        </a>
        <button
          type="button"
          className="eq-hub-sidebar__collapse"
          onClick={toggleCollapsed}
          aria-pressed={collapsed}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
      </div>

      {/* ── Live pill ── */}
      {live && (
        <div className="eq-hub-sidebar__live" aria-label="Live data">
          <span className="eq-hub-sidebar__live-dot" aria-hidden="true" />
          <span>Live</span>
        </div>
      )}

      {/* ── Tenant switcher slot ── */}
      {!collapsed && tenantSwitcher && (
        <div style={{ margin: '8px 0 12px' }}>
          {tenantSwitcher}
        </div>
      )}

      {/* ── Nav sections ── */}
      {sections.map((section) => (
        <div key={section.key}>
          <p className="eq-hub-sidebar__section-label">{section.label}</p>
          <nav className="eq-hub-sidebar__nav" aria-label={`${section.label} navigation`}>
            {section.items.map((item) => (
              <a
                key={item.key}
                href={item.href}
                data-active={item.isActive ? 'true' : undefined}
                data-tip={item.label}
                className="eq-hub-sidebar__nav-item"
                aria-current={item.isActive ? 'page' : undefined}
              >
                <span className="eq-hub-sidebar__nav-icon" aria-hidden="true">
                  {item.icon}
                  {item.warn && (
                    <span className="eq-hub-sidebar__nav-warn eq-hub-sidebar__nav-warn--chip" aria-hidden="true" />
                  )}
                </span>
                <span className="eq-hub-sidebar__nav-label">{item.label}</span>
                {item.badge && (
                  <span className="eq-hub-sidebar__nav-badge">{item.badge}</span>
                )}
                {item.warn && (
                  <span className="eq-hub-sidebar__nav-warn" aria-label="Needs attention" />
                )}
                {item.count != null && (
                  <span className={`eq-hub-sidebar__nav-count${item.muted ? ' eq-hub-sidebar__nav-count--muted' : ''}`}>
                    {item.count}
                  </span>
                )}
                {item.arrow && (
                  <span className="eq-hub-sidebar__nav-arrow" aria-hidden="true">→</span>
                )}
              </a>
            ))}
          </nav>
        </div>
      ))}

      {/* ── User footer ── */}
      <div className="eq-hub-sidebar__user">
        <div className="eq-hub-sidebar__user-avatar" aria-hidden="true">
          {user.initials}
        </div>
        <div className="eq-hub-sidebar__user-info">
          <div className="eq-hub-sidebar__user-name">{user.name}</div>
          <div className="eq-hub-sidebar__user-meta">{user.meta}</div>
        </div>
        {onToggleCompact && (
          <button
            type="button"
            className="eq-hub-sidebar__density-toggle"
            onClick={onToggleCompact}
            aria-label="Compact view"
            aria-pressed={compact}
            title={compact ? 'Switch to normal view' : 'Switch to compact view'}
          >
            <AlignJustify size={16} aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          className="eq-hub-sidebar__user-logout"
          onClick={onLogout}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={15} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
