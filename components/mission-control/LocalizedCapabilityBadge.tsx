import React from 'react';
import { useLocale } from '../../context/LocaleContext.tsx';
import type { CapabilityState } from './CapabilityStateBadge.tsx';
import CapabilityStateBadge from './CapabilityStateBadge.tsx';
import type { MessageKey } from '../../i18n/messages/en.ts';

const STATE_KEYS: Record<CapabilityState, MessageKey | null> = {
  AVAILABLE: null,
  NEEDS_ATTENTION: 'capability.NEEDS_ATTENTION',
  COMING_SOON: 'capability.COMING_SOON',
  NOT_CONNECTED: 'capability.NOT_CONNECTED',
  RESTRICTED: 'capability.RESTRICTED',
  DEMO_ONLY: 'capability.DEMO_ONLY',
  ADMIN_TEST: 'capability.ADMIN_TEST',
};

/** Localized capability badge — wraps CapabilityStateBadge with i18n labels. */
const LocalizedCapabilityBadge: React.FC<{
  state: CapabilityState;
  count?: number;
  className?: string;
}> = ({ state, count, className }) => {
  const { t } = useLocale();
  const key = STATE_KEYS[state];
  return (
    <CapabilityStateBadge
      state={state}
      count={count}
      className={className}
      label={key ? t(key) : undefined}
    />
  );
};

export default LocalizedCapabilityBadge;
