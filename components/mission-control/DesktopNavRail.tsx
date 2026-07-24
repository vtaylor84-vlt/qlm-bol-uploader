import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  desktopNavItems,
  isShellNavActive,
  type PrimaryNavId,
  type BottomNavId,
} from './shellNav.tsx';
import { useDriverExperienceOptional } from '../../context/DriverExperienceContext.tsx';
import { useCarrierTheme } from '../../context/CarrierThemeContext.tsx';
import { useLocale } from '../../context/LocaleContext.tsx';
import { ShellIcons } from './ShellIcons.tsx';
import BrandMark from '../brand/BrandMark.tsx';
import ElmBrandLogo from '../terminal/ElmBrandLogo.tsx';
import LanguageSelector from '../i18n/LanguageSelector.tsx';
import type { MessageKey } from '../../i18n/messages/en.ts';

interface DesktopNavRailProps {
  active: PrimaryNavId | BottomNavId;
  routePrefix?: '' | '/showcase';
  onLogout: () => void;
}

const NAV_KEYS: Record<PrimaryNavId, MessageKey> = {
  home: 'nav.home',
  trips: 'nav.trips',
  capture: 'nav.capture',
  pay: 'nav.pay',
  more: 'nav.more',
};

/**
 * Persistent desktop navigation rail — same five destinations as mobile.
 * Nested capabilities (messages, vehicle, safety) live under More.
 */
const DesktopNavRail: React.FC<DesktopNavRailProps> = ({
  active,
  routePrefix = '',
  onLogout,
}) => {
  const { pathname } = useLocation();
  const prefix = routePrefix || '';
  const experience = useDriverExperienceOptional();
  const { theme: brandTheme } = useCarrierTheme();
  const { t } = useLocale();
  const mode = experience?.mode || 'production';
  const items = desktopNavItems(mode);
  const railTheme = mode === 'showcase' ? 'elm' : brandTheme;

  return (
    <aside className="mc-desktop-rail" aria-label={t('nav.application')}>
      <div className="mc-desktop-rail-brand">
        {railTheme === 'elm' ? (
          <ElmBrandLogo size="sm" subtitle={false} />
        ) : (
          <BrandMark theme={railTheme} size="sm" />
        )}
        <p className="mc-desktop-rail-sub">{t('nav.workspace')}</p>
      </div>

      <nav className="mc-desktop-rail-nav" aria-label={t('nav.primary')}>
        <ul className="mc-desktop-rail-list">
          {items.map((item) => {
            const to = `${prefix}${item.path}`;
            const selected = isShellNavActive(pathname, item, prefix, active);
            const label = t(NAV_KEYS[item.id]);
            return (
              <li key={item.id}>
                <NavLink
                  to={to}
                  title={label}
                  className={() =>
                    `mc-desktop-rail-item${selected ? ' is-active' : ''}${
                      item.id === 'capture' ? ' mc-desktop-rail-item--capture' : ''
                    }`
                  }
                  aria-current={selected ? 'page' : undefined}
                  aria-label={label}
                  end={item.path === '/home'}
                >
                  <span className="mc-desktop-rail-icon">{item.icon}</span>
                  <span className="mc-desktop-rail-label">{label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mc-desktop-rail-footer">
        <LanguageSelector variant="shell" id="elm-rail-language" />
        {mode === 'showcase' ? (
          <div className="mc-desktop-rail-utils" aria-label={t('nav.utilities')}>
            <NavLink
              to={`${prefix}/search`}
              className="mc-desktop-rail-util"
              title={t('common.search')}
              aria-label={t('shell.openSearch')}
            >
              <span className="mc-desktop-rail-util-icon">
                <ShellIcons.Search />
              </span>
              {t('common.search')}
            </NavLink>
            <NavLink
              to={`${prefix}/notifications`}
              className="mc-desktop-rail-util"
              title={t('common.notifications')}
              aria-label={t('shell.openNotifications')}
            >
              <span className="mc-desktop-rail-util-icon">
                <ShellIcons.Notifications />
              </span>
              {t('common.notifications')}
            </NavLink>
            <NavLink
              to={`${prefix}/assistant`}
              className="mc-desktop-rail-util"
              title={t('common.elmAi')}
              aria-label={t('shell.openElmAi')}
            >
              <span className="mc-desktop-rail-util-icon">
                <ShellIcons.ElmAi />
              </span>
              {t('common.elmAi')}
            </NavLink>
          </div>
        ) : null}
        <button type="button" className="mc-desktop-rail-logout" onClick={onLogout}>
          {t('common.signOut')}
        </button>
      </div>
    </aside>
  );
};

export default DesktopNavRail;
