import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MOBILE_NAV_ITEMS, isShellNavActive, type BottomNavId } from './shellNav.tsx';
import { useLocale } from '../../context/LocaleContext.tsx';
import type { MessageKey } from '../../i18n/messages/en.ts';

export type { BottomNavId };

interface BottomNavProps {
  active: BottomNavId;
  routePrefix?: '' | '/showcase';
}

const NAV_KEYS: Record<BottomNavId, MessageKey> = {
  home: 'nav.home',
  trips: 'nav.trips',
  capture: 'nav.capture',
  pay: 'nav.pay',
  more: 'nav.more',
};

/** Mobile / tablet primary navigation. Hidden on desktop shell layouts. */
const BottomNav: React.FC<BottomNavProps> = ({ active, routePrefix = '' }) => {
  const { pathname } = useLocation();
  const { t } = useLocale();
  const prefix = routePrefix || '';

  return (
    <nav className="mc-bottom-nav" aria-label={t('nav.primary')}>
      <ul className="mc-bottom-nav-list">
        {MOBILE_NAV_ITEMS.map((item) => {
          const to = `${prefix}${item.path}`;
          const isSelected = isShellNavActive(pathname, item, prefix, active);
          const label = t(NAV_KEYS[item.id]);

          return (
            <li key={item.id}>
              <NavLink
                to={to}
                className={() =>
                  `mc-bottom-nav-item${isSelected ? ' is-active' : ''}${
                    item.id === 'capture' ? ' mc-bottom-nav-item--capture' : ''
                  }`
                }
                aria-current={isSelected ? 'page' : undefined}
                aria-label={label}
                end={item.path === '/home'}
              >
                <span className="mc-bottom-nav-icon">{item.icon}</span>
                <span className="mc-bottom-nav-label">{label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
