import React from 'react';
import { useShowcase } from '../../context/ShowcaseContext.tsx';
import { useLocale } from '../../context/LocaleContext.tsx';
import { personaFor, CARRIER_DEMO_CONFIG } from '../../fixtures/showcase/personas.ts';

/**
 * Persistent View As indicator — admin-only inside Showcase.
 * View As changes the effective interface/permissions preview, not the data environment.
 * Real admin remains the auditing actor; viewed persona is the effective subject.
 */
const ViewAsBanner: React.FC = () => {
  const { state, exitViewAs } = useShowcase();
  const { t } = useLocale();
  if (!state.viewAsActive) return null;

  const persona = personaFor(state.carrierId, state.personaRole);
  const roleLabel = state.personaRole === 'admin' ? t('common.admin') : t('common.driver');
  const carrier = CARRIER_DEMO_CONFIG[state.carrierId].displayName;

  return (
    <div className="view-as-banner" role="status" aria-live="polite">
      <p className="view-as-banner-text">
        {t('showcase.viewingAs')} <strong>{persona.displayName}</strong> · {roleLabel} ·{' '}
        {state.carrierId} ({carrier})
      </p>
      <button type="button" className="demo-chrome-btn" onClick={() => exitViewAs()}>
        {t('showcase.exitViewAs')}
      </button>
    </div>
  );
};

export default ViewAsBanner;
