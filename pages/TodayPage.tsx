import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useSubmissionDraft } from '../context/SubmissionDraftContext.tsx';
import { useDriverExperience } from '../context/DriverExperienceContext.tsx';
import { useLocale } from '../context/LocaleContext.tsx';
import MissionShell from '../components/mission-control/MissionShell.tsx';
import ActiveHaulCard from '../components/mission-control/ActiveHaulCard.tsx';
import OutstandingTasks from '../components/mission-control/OutstandingTasks.tsx';
import ElmCard from '../design-system/components/ElmCard.tsx';
import LocalizedCapabilityBadge from '../components/mission-control/LocalizedCapabilityBadge.tsx';
import { getCompanyDisplayName } from '../utils/companyMap.ts';
import {
  activateMissionCapture,
  type MissionCaptureTarget,
} from '../utils/missionCapture.ts';
import { openPayrollTripSubmission } from '../utils/payrollTripSubmission.ts';
import { formatLastLogin } from '../utils/lastLogin.ts';

function greetingKeyForNow(): 'home.greetingMorning' | 'home.greetingAfternoon' | 'home.greetingEvening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'home.greetingMorning';
  if (hour < 18) return 'home.greetingAfternoon';
  return 'home.greetingEvening';
}

/**
 * Driver Home — Next step, Needs attention, Current trip, Recent activity, Shortcuts.
 */
const TodayPage: React.FC = () => {
  const { session, previousLoginAt, hasRecordedLogin } = useAuth();
  const { clearDraft, startDraft } = useSubmissionDraft();
  const navigate = useNavigate();
  const { mode, routePrefix, dataSource, actions } = useDriverExperience();
  const { t } = useLocale();
  const [simMessage, setSimMessage] = useState('');

  const model = useMemo(() => dataSource.getMissionControl(), [dataSource]);
  const companyForUpload = getCompanyDisplayName(session?.companyCode);
  const tasksLive = mode === 'showcase';
  const lastLoginLabel = previousLoginAt
    ? formatLastLogin(previousLoginAt)
    : hasRecordedLogin
      ? t('home.lastLoginFirst')
      : t('home.lastLoginUnavailable');

  const openBolPod = useCallback(async () => {
    const target: MissionCaptureTarget = {
      submissionType: 'BOL_POD',
      href: mode === 'showcase' ? `${routePrefix}/capture` : '/submissions/bol-pod',
    };
    if (mode === 'showcase') {
      if (actions.submitPodSimulated) {
        const result = await actions.submitPodSimulated();
        setSimMessage(`${result.disclosure}: ${result.message}`);
      }
      navigate(`${routePrefix}/capture`);
      return;
    }
    activateMissionCapture({
      ...target,
      driverName: session?.driverName || '',
      company: companyForUpload,
      clearDraft,
      startDraft,
      navigate,
    });
  }, [
    mode,
    actions,
    routePrefix,
    session?.driverName,
    companyForUpload,
    clearDraft,
    startDraft,
    navigate,
  ]);

  const safety = mode === 'showcase' ? dataSource.getSafetyStatus() : null;
  const pay = mode === 'showcase' ? dataSource.getPaySummary() : null;
  const truck = mode === 'showcase' ? dataSource.getTruckStatus() : null;
  const ackMessage =
    mode === 'showcase'
      ? dataSource.getMessages().find((m) => m.unread && m.ackRequired)
      : null;
  const recentActivity = mode === 'showcase' ? dataSource.getTimeline().slice(0, 3) : [];
  const hasShowcaseAttention =
    mode === 'showcase' &&
    (Boolean(ackMessage) ||
      Boolean(safety?.credentials?.some((c) => (c.statusLabel || '').toLowerCase().includes('expir'))) ||
      (model.tasks?.length ?? 0) > 0 ||
      (model.exceptions?.length ?? 0) > 0);

  const tripsTo = `${routePrefix}/trips`;
  const captureTo = `${routePrefix}/capture`;
  const payTo = `${routePrefix}/pay`;
  const messagesTo = `${routePrefix}/messages`;
  const tripFormLabel = t('tripForm.label');
  const tripFormHelper = t('tripForm.helper');

  return (
    <MissionShell title={t('nav.home')} activeNav="home" connectionLabel={model.connectionLabel}>
      <div className="mc-home">
        <header className="mc-home-header">
          <p className="mc-kicker">{t('home.kicker')}</p>
          <h1 className="mc-page-title">
            {mode === 'showcase'
              ? t('home.titleShowcase', {
                  greeting: t(greetingKeyForNow()),
                  name: model.driverDisplayName,
                })
              : t('home.title')}
          </h1>
          <p className="mc-section-copy">
            {mode === 'showcase' ? (
              <>
                {model.companyLabel ? `${model.companyLabel} · ` : ''}
                {t('home.demoOnly')}
              </>
            ) : (
              <>
                {model.driverDisplayName}
                {model.companyLabel ? ` · ${model.companyLabel}` : ''}
              </>
            )}
          </p>
          {mode === 'production' ? (
            <p className="mc-last-login" aria-label={`${t('home.lastLogin')} ${lastLoginLabel}`}>
              <span className="mc-last-login-kicker">{t('home.lastLogin')}</span>
              <span className="mc-last-login-value">{lastLoginLabel}</span>
            </p>
          ) : null}
        </header>

        {simMessage ? (
          <p className="mc-sim-status" role="status">
            {simMessage}
          </p>
        ) : null}

        {mode === 'production' &&
        session?.authRole === 'admin' &&
        session?.canSelectAnyDriver ? (
          <ElmCard
            variant="default"
            padding="md"
            as="section"
            aria-label={t('home.adminShowcaseTitle')}
            className="mb-6"
          >
            <p className="mc-kicker mb-2">{t('more.admin')}</p>
            <h2 className="mc-section-title">{t('home.adminShowcaseTitle')}</h2>
            <p className="mc-section-copy">{t('home.adminShowcaseCopy')}</p>
            <Link to="/more#showcase-entry" className="mc-exception-action mt-4 inline-flex no-underline">
              {t('home.adminShowcaseCta')}
            </Link>
          </ElmCard>
        ) : null}

        {/* Next step — live primary actions */}
        <section className="mc-home-live-actions mc-home-next" aria-label={t('home.nextStep')}>
          <h2 className="mc-home-section-title">{t('home.nextStepHeading')}</h2>
          <div className="mc-live-action-grid">
            <button
              type="button"
              className="mc-live-action"
              onClick={() => openBolPod()}
              aria-label={t('home.uploadBol')}
            >
              <span className="mc-live-action-kicker">{t('home.documentsKicker')}</span>
              <span className="mc-live-action-title">{t('home.uploadBol')}</span>
              <span className="mc-live-action-copy">{t('home.uploadBolCopy')}</span>
            </button>
            <button
              type="button"
              className="mc-live-action"
              onClick={() => openPayrollTripSubmission()}
              aria-label={tripFormLabel}
            >
              <span className="mc-live-action-kicker">{t('home.tripFormKicker')}</span>
              <span className="mc-live-action-title">{tripFormLabel}</span>
              <span className="mc-live-action-copy">{tripFormHelper}</span>
            </button>
          </div>
        </section>

        {/* Needs attention */}
        <section className="mc-home-attention" aria-labelledby="home-attention-heading">
          <div className="mc-home-section-head">
            <h2 id="home-attention-heading" className="mc-home-section-title">
              {t('home.needsAttention')}
            </h2>
            {mode === 'production' ? <LocalizedCapabilityBadge state="NOT_CONNECTED" /> : null}
          </div>
          {mode === 'production' ? (
            <ElmCard variant="muted" padding="md" as="div">
              <p className="mc-section-copy">{t('home.needsAttentionUnavailable')}</p>
            </ElmCard>
          ) : hasShowcaseAttention ? (
            <>
              <OutstandingTasks
                tasks={tasksLive ? model.tasks : []}
                onActivateTask={
                  tasksLive
                    ? (target) =>
                        activateMissionCapture({
                          ...target,
                          driverName: session?.driverName || '',
                          company: companyForUpload,
                          clearDraft,
                          startDraft,
                          navigate,
                        })
                    : undefined
                }
                live={tasksLive}
              />
              {ackMessage ? (
                <div className="mc-attention-card mc-attention-card--critical mt-3">
                  <div className="min-w-0">
                    <p className="mc-kicker mb-1">{t('home.messagesSlot')}</p>
                    <p className="mc-section-copy">
                      {ackMessage.from} · {ackMessage.subject}
                    </p>
                  </div>
                  <Link to={messagesTo} className="mc-exception-action no-underline shrink-0">
                    {t('home.messagesSlot')}
                  </Link>
                </div>
              ) : null}
            </>
          ) : (
            <ElmCard variant="muted" padding="md" as="div">
              <p className="mc-section-copy">{t('home.needsAttentionEmpty')}</p>
            </ElmCard>
          )}
        </section>

        {/* Current trip */}
        <section className="mc-home-trip" aria-labelledby="home-assigned-trips-heading">
          <div className="mc-home-section-head">
            <h2 id="home-assigned-trips-heading" className="mc-home-section-title">
              {t('home.currentTrip')}
            </h2>
            {mode === 'production' ? <LocalizedCapabilityBadge state="NOT_CONNECTED" /> : null}
            {mode === 'showcase' ? (
              <Link to={tripsTo} className="mc-home-section-link">
                {t('home.allTrips')}
              </Link>
            ) : null}
          </div>
          {mode === 'production' ? (
            <ElmCard variant="muted" padding="md" as="div">
              <p className="mc-section-copy">{t('home.noTripConnected')}</p>
              <p className="mc-section-copy mt-2">{t('home.tripDetailsSoon')}</p>
            </ElmCard>
          ) : (
            <>
              <ActiveHaulCard haul={model.activeHaul} dataCapability={model.dataCapability} />
              {model.activeHaul ? (
                <div className="mc-home-trip-actions">
                  <Link to={tripsTo} className="mc-secondary-action no-underline">
                    {t('home.viewTrip')}
                  </Link>
                  <button type="button" className="mc-secondary-action" onClick={() => openBolPod()}>
                    {t('home.uploadBol')}
                  </button>
                  <button
                    type="button"
                    className="mc-secondary-action"
                    onClick={() => openPayrollTripSubmission()}
                  >
                    {tripFormLabel}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>

        <aside className="mc-home-aside" aria-label={t('home.recentActivity')}>
          {mode === 'production' ? (
            <>
              <ElmCard variant="muted" padding="md" as="section" aria-label={t('home.messagesSlot')}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="mc-section-title">{t('home.messagesSlot')}</h2>
                  <LocalizedCapabilityBadge state="NOT_CONNECTED" />
                </div>
                <p className="mc-section-copy">{t('home.messagesUnavailable')}</p>
              </ElmCard>
              <ElmCard variant="muted" padding="md" as="section" aria-label={t('home.payStatus')}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="mc-section-title">{t('home.payStatus')}</h2>
                  <LocalizedCapabilityBadge state="NOT_CONNECTED" />
                </div>
                <p className="mc-section-copy">{t('home.payUnavailable')}</p>
              </ElmCard>
              <ElmCard variant="muted" padding="md" as="section" aria-label={t('home.hosSummary')}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="mc-section-title">{t('home.hosSummary')}</h2>
                  <LocalizedCapabilityBadge state="COMING_SOON" />
                </div>
                <p className="mc-section-copy">{t('home.hosUnavailable')}</p>
              </ElmCard>
              <ElmCard variant="muted" padding="md" as="section" aria-label={t('home.announcements')}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="mc-section-title">{t('home.announcements')}</h2>
                  <LocalizedCapabilityBadge state="COMING_SOON" />
                </div>
                <p className="mc-section-copy">{t('home.announcementsUnavailable')}</p>
              </ElmCard>
              <section aria-labelledby="home-activity-heading">
                <h2 id="home-activity-heading" className="mc-home-section-title mb-3">
                  {t('home.recentActivity')}
                </h2>
                <ElmCard variant="muted" padding="md" as="div">
                  <p className="mc-section-copy">{t('home.recentActivityEmpty')}</p>
                </ElmCard>
              </section>
            </>
          ) : null}

          {mode === 'showcase' &&
          safety?.credentials?.some((c) => (c.statusLabel || '').toLowerCase().includes('expir')) ? (
            <div className="mc-attention-card mc-attention-card--warning">
              <div className="min-w-0">
                <p className="mc-kicker mb-1">{t('more.qualifications')}</p>
                <p className="mc-section-copy">
                  {safety.credentials.find((c) =>
                    (c.statusLabel || '').toLowerCase().includes('expir')
                  )?.title || t('more.qualifications')}
                </p>
              </div>
              <Link
                to={`${routePrefix}/safety`}
                className="mc-exception-action no-underline shrink-0"
              >
                {t('more.safety')}
              </Link>
            </div>
          ) : null}

          {mode === 'showcase' && (pay?.reimbursementsPendingLabel || pay?.payrollStatusLabel) ? (
            <ElmCard variant="muted" padding="md" as="section" aria-label={t('home.payStatus')}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="mc-kicker mb-0">{t('nav.pay')}</p>
                <LocalizedCapabilityBadge state="DEMO_ONLY" />
              </div>
              <dl className="mc-meta-grid">
                {pay?.payrollStatusLabel ? (
                  <div>
                    <dt>{t('home.payStatus')}</dt>
                    <dd>{pay.payrollStatusLabel}</dd>
                  </div>
                ) : null}
                {pay?.reimbursementsPendingLabel ? (
                  <div>
                    <dt>{t('submit.receipt')}</dt>
                    <dd>{pay.reimbursementsPendingLabel}</dd>
                  </div>
                ) : null}
              </dl>
              <Link to={payTo} className="mc-home-section-link mt-3 inline-flex">
                {t('nav.pay')}
              </Link>
            </ElmCard>
          ) : null}

          {mode === 'showcase' && truck ? (
            <ElmCard variant="muted" padding="md" as="section" aria-label={t('more.equipment')}>
              <p className="mc-kicker mb-2">{t('more.equipment')}</p>
              <p className="mc-task-title">
                {truck.truckNumber} / {truck.trailerNumber}
              </p>
              <p className="mc-task-detail">{truck.statusLabel}</p>
              <Link
                to={`${routePrefix}/equipment`}
                className="mc-home-section-link mt-3 inline-flex"
              >
                {t('more.myVehicle')}
              </Link>
            </ElmCard>
          ) : null}

          {mode === 'showcase' && recentActivity.length > 0 ? (
            <section aria-labelledby="home-activity-heading-demo">
              <h2 id="home-activity-heading-demo" className="mc-home-section-title mb-3">
                {t('home.recentActivity')}
              </h2>
              <ElmCard variant="default" padding="md" as="div">
                <ul className="mc-task-list">
                  {recentActivity.map((e) => (
                    <li key={e.id} className="mc-task-row">
                      <div className="min-w-0 flex-1">
                        <p className="mc-task-title">{e.title}</p>
                        <p className="mc-task-detail">
                          {e.whenLabel} · {e.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </ElmCard>
            </section>
          ) : null}

          <nav className="mc-home-shortcuts" aria-label={t('home.shortcuts')}>
            <p className="mc-home-section-title mb-3">{t('home.shortcuts')}</p>
            <div className="mc-home-shortcut-row">
              <Link to={captureTo} className="mc-home-shortcut">
                {t('home.uploadBol')}
              </Link>
              <Link to={tripsTo} className="mc-home-shortcut">
                {t('nav.trips')}
              </Link>
              <Link to={payTo} className="mc-home-shortcut">
                {t('nav.pay')}
              </Link>
              {mode === 'showcase' ? (
                <Link to={messagesTo} className="mc-home-shortcut">
                  {t('home.messagesSlot')}
                </Link>
              ) : null}
            </div>
            <p className="mc-safe-driving-note">{t('home.safeDriving')}</p>
          </nav>
        </aside>
      </div>
    </MissionShell>
  );
};

export default TodayPage;
