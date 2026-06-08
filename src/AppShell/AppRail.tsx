import type { JSX } from 'react';
import { Settings } from 'lucide-react';

export interface AppRailItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  isActive?: boolean;
  isDisabled?: boolean;
  /** Tooltip shown on disabled items. */
  disabledTitle?: string;
}

export interface AppRailProps {
  /** href for the logo link (typically the tenant home). */
  homeHref: string;
  /** Logo element — e.g. <EqLogo size={28} onDark variant="mark" /> */
  logo?: React.ReactNode;
  /** Module nav items. */
  items: AppRailItem[];
  /** Optional settings link rendered at the bottom. */
  settingsHref?: string;
  settingsActive?: boolean;
  user: {
    /** Two-letter initials. */
    initials: string;
    name: string;
  };
  onLogout: () => void;
}

export function AppRail({
  homeHref,
  logo,
  items,
  settingsHref,
  settingsActive,
  user,
  onLogout,
}: AppRailProps): JSX.Element {
  return (
    <nav className="eq-icon-rail" aria-label="App navigation" role="navigation">

      {/* Logo → home */}
      <a
        href={homeHref}
        className="eq-icon-rail__logo"
        title="EQ Solutions home"
        aria-label="Go to dashboard"
      >
        {logo}
        <span className="eq-icon-rail__label" aria-hidden="true">EQ Solutions</span>
        <span className="eq-icon-rail__sr-only">EQ Solutions home</span>
      </a>

      <div className="eq-icon-rail__sep" role="separator" />

      {/* Module items */}
      <div className="eq-icon-rail__nav">
        {items.map((item) => {
          if (item.isDisabled) {
            return (
              <span
                key={item.key}
                className="eq-icon-rail__item eq-icon-rail__item--disabled"
                title={item.disabledTitle ?? item.label}
                aria-label={`${item.label}${item.disabledTitle ? ` — ${item.disabledTitle}` : ''}`}
                role="link"
                aria-disabled="true"
              >
                <span className="eq-icon-rail__icon">{item.icon}</span>
                <span className="eq-icon-rail__label" aria-hidden="true">{item.label}</span>
                <span className="eq-icon-rail__sr-only">{item.label}</span>
              </span>
            );
          }

          return (
            <a
              key={item.key}
              href={item.href}
              className={`eq-icon-rail__item${item.isActive ? ' eq-icon-rail__item--active' : ''}`}
              title={item.label}
              aria-current={item.isActive ? 'page' : undefined}
            >
              <span className="eq-icon-rail__icon">{item.icon}</span>
              <span className="eq-icon-rail__label" aria-hidden="true">{item.label}</span>
              <span className="eq-icon-rail__sr-only">{item.label}</span>
            </a>
          );
        })}
      </div>

      {/* Bottom: settings + user */}
      <div className="eq-icon-rail__bottom">
        {settingsHref && (
          <a
            href={settingsHref}
            className={`eq-icon-rail__item${settingsActive ? ' eq-icon-rail__item--active' : ''}`}
            title="Settings"
            aria-current={settingsActive ? 'page' : undefined}
          >
            <span className="eq-icon-rail__icon">
              <Settings size={20} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="eq-icon-rail__label" aria-hidden="true">Settings</span>
            <span className="eq-icon-rail__sr-only">Settings</span>
          </a>
        )}

        <button
          type="button"
          className="eq-icon-rail__user"
          onClick={onLogout}
          title="Sign out"
          aria-label={`Sign out (${user.name})`}
        >
          <span className="eq-icon-rail__avatar" aria-hidden="true">{user.initials}</span>
          <span className="eq-icon-rail__user-info" aria-hidden="true">
            <span className="eq-icon-rail__user-name">{user.name}</span>
            <span className="eq-icon-rail__user-action">Sign out</span>
          </span>
        </button>
      </div>
    </nav>
  );
}
