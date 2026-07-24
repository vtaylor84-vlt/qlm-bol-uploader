import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MissionShell from '../components/mission-control/MissionShell.tsx';
import RouteMilestoneBar from '../components/mission-control/RouteMilestoneBar.tsx';
import ElmCard from '../design-system/components/ElmCard.tsx';
import LocalizedCapabilityBadge from '../components/mission-control/LocalizedCapabilityBadge.tsx';
import LanguageSelector from '../components/i18n/LanguageSelector.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useDriverExperience } from '../context/DriverExperienceContext.tsx';
import { useShowcaseOptional } from '../context/ShowcaseContext.tsx';
import { useLocale } from '../context/LocaleContext.tsx';
import { getCompanyDisplayName } from '../utils/companyMap.ts';
import { ELM_VERSION } from '../design-system/tokens.ts';
import { getReleaseIdentity } from '../utils/releaseIdentity.ts';
import { isShowcaseGrantPresentAndUnexpired } from '../utils/showcaseGrantStorage.ts';
import type { LoadBucket, LoadListItem } from '../services/dataSource/types.ts';
import { openPayrollTripSubmission } from '../utils/payrollTripSubmission.ts';
import type { MessageKey } from '../i18n/messages/en.ts';

const BUCKET_KEYS: Record<LoadBucket, MessageKey> = {
  current: 'trips.current',
  upcoming: 'trips.upcoming',
  completed: 'trips.completed',
};

function tripBadgeTone(load: LoadListItem): 'ok' | 'info' | 'warning' | 'critical' {
  if ((load.documentsLabel || '').toLowerCase().includes('missing')) return 'critical';
  if (load.bucket === 'completed') return 'ok';
  if ((load.statusLabel || '').toLowerCase().includes('breakdown')) return 'critical';
  if ((load.statusLabel || '').toLowerCase().includes('delay')) return 'warning';
  return 'info';
}

/** Trips — driver-facing trip execution (internal load objects unchanged). */
export const LoadsPage: React.FC = () => {
  const { mode, routePrefix, dataSource, actions } = useDriverExperience();
  const { t } = useLocale();
  const loads = dataSource.getLoads();
  const truck = mode === 'showcase' ? dataSource.getTruckStatus() : null;
  const captureTo = `${routePrefix}/capture`;
  const messagesTo = `${routePrefix}/messages`;

  const [bucket, setBucket] = useState<LoadBucket>('current');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState('');

  const bucketCounts = useMemo(
    () => ({
      current: loads.filter((l) => (l.bucket || 'current') === 'current').length,
      upcoming: loads.filter((l) => l.bucket === 'upcoming').length,
      completed: loads.filter((l) => l.bucket === 'completed').length,
    }),
    [loads]
  );

  const filtered = useMemo(() => {
    const byBucket = loads.filter((l) => (l.bucket || 'current') === bucket);
    const q = search.trim().toLowerCase();
    if (!q) return byBucket;
    return byBucket.filter(
      (l) =>
        l.loadNum.toLowerCase().includes(q) ||
        l.origin.toLowerCase().includes(q) ||
        l.destination.toLowerCase().includes(q)
    );
  }, [loads, bucket, search]);

  useEffect(() => {
    if (!filtered.some((l) => l.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId]);

  const selected = filtered.find((l) => l.id === selectedId) || null;

  const runTripAction = async (label: string) => {
    if (mode !== 'showcase') {
      setActionStatus(t('trips.statusNotConnected'));
      return;
    }
    setActionStatus(`SIMULATED ACTION: ${label} recorded for demonstration only.`);
  };

  return (
    <MissionShell title={t('nav.trips')} activeNav="trips">
      <div className="mc-trips space-y-6">
        <header>
          <p className="mc-kicker">{t('trips.kicker')}</p>
          <h1 className="mc-page-title">{t('trips.title')}</h1>
          <p className="mc-section-copy">
            {mode === 'showcase' ? t('trips.showcaseCopy') : t('trips.prodCopy')}
          </p>
        </header>

        {actionStatus ? (
          <p className="mc-sim-status" role="status">
            {actionStatus}
          </p>
        ) : null}

        {loads.length === 0 ? (
          <div className="space-y-4">
            <div className="mc-filter-tabs" role="tablist" aria-label={t('trips.statusTabs')}>
              {(['current', 'upcoming', 'completed'] as LoadBucket[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={bucket === id}
                  className={`mc-filter-tab${bucket === id ? ' is-active' : ''}`}
                  onClick={() => setBucket(id)}
                >
                  {t(BUCKET_KEYS[id])}
                </button>
              ))}
            </div>
            <ElmCard variant="muted" padding="md" as="section" aria-label={t('trips.assignedHeading')}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="mc-kicker mb-0">{t('trips.kicker')}</p>
                  <h2 className="mc-section-title">{t('trips.assignedHeading')}</h2>
                </div>
                <LocalizedCapabilityBadge state="NOT_CONNECTED" />
              </div>
              <p className="mc-section-copy">{t('trips.notConnected')}</p>
            </ElmCard>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div className="mc-filter-tabs" role="tablist" aria-label={t('trips.statusTabs')}>
                {(['current', 'upcoming', 'completed'] as LoadBucket[]).map((b) => (
                  <button
                    key={b}
                    type="button"
                    role="tab"
                    aria-selected={bucket === b}
                    className={`mc-filter-tab${bucket === b ? ' is-active' : ''}`}
                    onClick={() => setBucket(b)}
                  >
                    {t(BUCKET_KEYS[b])}
                    <span className="mc-filter-tab-count">{bucketCounts[b]}</span>
                  </button>
                ))}
              </div>
              <input
                type="search"
                className="elm-input"
                placeholder={t('trips.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label={t('trips.searchPlaceholder')}
              />
            </div>

            <div className="mc-inbox-layout">
              <ul className="mc-inbox-list">
                {filtered.length === 0 ? (
                  <li>
                    <ElmCard variant="muted" padding="md">
                      <p className="mc-section-copy">{t('trips.noMatches')}</p>
                    </ElmCard>
                  </li>
                ) : (
                  filtered.map((load) => {
                    const tone = tripBadgeTone(load);
                    return (
                      <li key={load.id}>
                        <button
                          type="button"
                          className={`mc-inbox-row${selectedId === load.id ? ' is-selected' : ''}`}
                          onClick={() => setSelectedId(load.id)}
                          aria-pressed={selectedId === load.id}
                        >
                          <div className="flex justify-between gap-3">
                            <div className="min-w-0">
                              <p className="mc-kicker mb-0">Trip #{load.loadNum}</p>
                              <p className="mc-inbox-row-title">
                                {load.origin} → {load.destination}
                              </p>
                              <p className="mc-inbox-row-preview">
                                {load.appointmentLabel} · {load.milesLabel} ·{' '}
                                {load.stopCount ?? load.stops?.length ?? 0} stops
                              </p>
                            </div>
                            <span className={`mc-status-badge mc-status-badge--${tone}`}>
                              {load.statusLabel}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-2 text-xs">
                            <span className="text-zinc-500">{load.documentsLabel}</span>
                            <span className="text-zinc-300 font-semibold">
                              {load.earningsEstimateLabel}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>

              {selected ? (
                <div className="mc-load-detail space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="mc-kicker mb-0">Trip #{selected.loadNum}</p>
                      <h2 className="mc-section-title">
                        {selected.origin} → {selected.destination}
                      </h2>
                      <p className="mc-section-copy">
                        {selected.dispatcherLabel
                          ? `Dispatcher · ${selected.dispatcherLabel}`
                          : null}
                      </p>
                    </div>
                    <span
                      className={`mc-status-badge mc-status-badge--${tripBadgeTone(selected)}`}
                    >
                      {selected.statusLabel}
                    </span>
                  </div>

                  <dl className="mc-meta-grid">
                    <div>
                      <dt>Miles</dt>
                      <dd>{selected.milesLabel || '—'}</dd>
                    </div>
                    <div>
                      <dt>Appointment</dt>
                      <dd>{selected.appointmentLabel || '—'}</dd>
                    </div>
                    <div>
                      <dt>BOL / POD</dt>
                      <dd>{selected.documentsLabel || '—'}</dd>
                    </div>
                    <div>
                      <dt>Earnings preview</dt>
                      <dd>{selected.earningsEstimateLabel || '—'}</dd>
                    </div>
                    {truck ? (
                      <>
                        <div>
                          <dt>Assigned truck</dt>
                          <dd>{truck.truckNumber}</dd>
                        </div>
                        <div>
                          <dt>Trailer</dt>
                          <dd>{truck.trailerNumber}</dd>
                        </div>
                      </>
                    ) : null}
                  </dl>

                  {selected.stops?.length ? (
                    <div>
                      <p className="mc-kicker mb-2">Stops &amp; appointments</p>
                      <ol className="mc-load-detail-stops">
                        {selected.stops.map((stop) => (
                          <li key={stop.id} className={`mc-load-detail-stop is-${stop.state}`}>
                            <span className="mc-load-detail-stop-dot" aria-hidden />
                            <div className="min-w-0">
                              <p className="mc-task-title">
                                {stop.sequence}. {stop.locationLabel}
                              </p>
                              <p className="mc-task-detail">
                                {stop.appointmentLabel} · {stop.statusLabel}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : null}

                  {selected.instructions ? (
                    <div>
                      <p className="mc-kicker mb-2">Pickup &amp; delivery instructions</p>
                      <p className="mc-section-copy">{selected.instructions}</p>
                    </div>
                  ) : null}

                  {selected.documentRequirements?.length ? (
                    <div>
                      <p className="mc-kicker mb-2">Required documents</p>
                      <ul className="flex flex-wrap gap-2">
                        {selected.documentRequirements.map((doc) => (
                          <li key={doc} className="mc-doc-chip">
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {bucket === 'current' ? (
                    <div>
                      <p className="mc-kicker mb-2">Trip actions</p>
                      <p className="mc-safe-driving-note mb-3">
                        Use status actions only when safely stopped.
                      </p>
                      <div className="mc-trip-actions">
                        {(
                          [
                            'Arrived',
                            'Loaded',
                            'Departed',
                            'Delivered',
                            'Report delay',
                          ] as const
                        ).map((label) => (
                          <button
                            key={label}
                            type="button"
                            className="mc-secondary-action"
                            onClick={() => runTripAction(label)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-3 pt-1">
                    <Link
                      to={`${captureTo}?type=bol_pod`}
                      className="mc-live-action mc-live-action--compact no-underline"
                    >
                      <span className="mc-live-action-title">Upload BOL / POD</span>
                    </Link>
                    {bucket === 'completed' ||
                    (selected.statusLabel || '').toLowerCase().includes('deliver') ? (
                      <button
                        type="button"
                        className="mc-live-action mc-live-action--compact"
                        onClick={() => openPayrollTripSubmission()}
                      >
                        <span className="mc-live-action-title">{t('tripForm.label')}</span>
                      </button>
                    ) : null}
                    {mode === 'showcase' ? (
                      <Link
                        to={messagesTo}
                        className="mc-secondary-action inline-flex no-underline"
                      >
                        Contact dispatch
                      </Link>
                    ) : null}
                    {mode === 'showcase' && actions.inquirePayroll ? (
                      <Link to={`${routePrefix}/pay`} className="mc-secondary-action inline-flex no-underline">
                        View trip earnings
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </MissionShell>
  );
};

/** Pay — driver-facing Payroll view (not admin Payroll product). */
export const PayPage: React.FC = () => {
  const { mode, dataSource, actions } = useDriverExperience();
  const { t } = useLocale();
  const pay = dataSource.getPaySummary();
  const [status, setStatus] = useState('');

  const reportPayQuestion = async () => {
    if (!actions.reportPayQuestion) return;
    const result = await actions.reportPayQuestion();
    setStatus(`${result.disclosure}: ${result.message}`);
  };

  const tripEarnings = pay.lineItems?.filter((li) => li.category === 'trip') || [];
  const reimbursements = pay.lineItems?.filter((li) => li.category === 'reimbursement') || [];
  const deductions = pay.lineItems?.filter((li) => li.category === 'deduction') || [];
  const otherEarnings = pay.lineItems?.filter(
    (li) => !['trip', 'reimbursement', 'deduction'].includes(li.category)
  ) || [];

  return (
    <MissionShell title={t('nav.pay')} activeNav="pay">
      <div className="space-y-6 max-w-3xl">
        <header>
          <p className="mc-kicker">{t('pay.kicker')}</p>
          <h1 className="mc-page-title">{t('pay.title')}</h1>
          <p className="mc-section-copy">
            {mode === 'showcase' ? t('pay.showcaseCopy') : t('pay.prodCopy')}
          </p>
        </header>

        <section className="mc-home-live-actions" aria-label={t('home.tripFormKicker')}>
          <button
            type="button"
            className="mc-live-action"
            onClick={() => openPayrollTripSubmission()}
            aria-label={t('tripForm.label')}
          >
            <span className="mc-live-action-kicker">{t('home.tripFormKicker')}</span>
            <span className="mc-live-action-title">{t('tripForm.label')}</span>
            <span className="mc-live-action-copy">{t('pay.tripFormHint')}</span>
          </button>
        </section>

        {mode === 'production' ? (
          <>
            <ElmCard variant="muted" padding="md" as="section" aria-label={t('pay.notConnectedTitle')}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="mc-section-title">{t('pay.notConnectedTitle')}</h2>
                <LocalizedCapabilityBadge state="NOT_CONNECTED" />
              </div>
              <p className="mc-section-copy">{t('pay.notConnectedBody')}</p>
            </ElmCard>
          </>
        ) : (
          <>
            <ElmCard variant="muted" padding="md" as="section" aria-label="Settlement summary">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="mc-kicker">{pay.periodLabel}</p>
                  <h2 className="mc-section-title">Current settlement</h2>
                  {pay.payrollStatusLabel ? (
                    <p className="mc-section-copy">{pay.payrollStatusLabel}</p>
                  ) : null}
                </div>
                <LocalizedCapabilityBadge state="DEMO_ONLY" />
              </div>

              <dl className="mc-metric-grid">
                <div className="mc-metric-tile">
                  <dt>Gross pay</dt>
                  <dd>{pay.grossLabel}</dd>
                </div>
                <div className="mc-metric-tile">
                  <dt>Net pay</dt>
                  <dd className="mc-earnings-value text-lg">{pay.netLabel}</dd>
                </div>
                <div className="mc-metric-tile">
                  <dt>Estimated earnings</dt>
                  <dd>{pay.estimatedEarningsLabel || pay.grossLabel}</dd>
                </div>
                <div className="mc-metric-tile">
                  <dt>Reimbursements</dt>
                  <dd>{pay.reimbursementsPendingLabel || '—'}</dd>
                </div>
                <div className="mc-metric-tile">
                  <dt>Escrow</dt>
                  <dd>{pay.escrowBalanceLabel || '—'}</dd>
                </div>
                <div className="mc-metric-tile">
                  <dt>Savings</dt>
                  <dd>{pay.savingsBalanceLabel || '—'}</dd>
                </div>
              </dl>
              <p className="mc-section-copy mt-4">{pay.note}</p>
            </ElmCard>

            {pay.timelineSteps?.length ? (
              <ElmCard padding="md" as="section" aria-label="Settlement status">
                <p className="mc-kicker mb-3">Settlement status</p>
                <RouteMilestoneBar milestones={pay.timelineSteps} capabilityNote={false} />
              </ElmCard>
            ) : null}

            {tripEarnings.length ? (
              <ElmCard padding="md" as="section" aria-label="Trip earnings">
                <p className="mc-kicker mb-3">Trip earnings</p>
                <ul className="mc-task-list">
                  {tripEarnings.map((li) => (
                    <li key={li.id} className="mc-task-row">
                      <div className="min-w-0 flex-1">
                        <p className="mc-task-title">{li.label}</p>
                        <p className="mc-task-detail">
                          {li.statusLabel}
                          {li.relatedLoadNum ? ` · Trip #${li.relatedLoadNum}` : ''}
                        </p>
                      </div>
                      <span className="mc-task-title">{li.amountLabel}</span>
                    </li>
                  ))}
                </ul>
              </ElmCard>
            ) : null}

            {otherEarnings.length ? (
              <ElmCard padding="md" as="section" aria-label="Additional earnings">
                <p className="mc-kicker mb-3">Additional earnings</p>
                <ul className="mc-task-list">
                  {otherEarnings.map((li) => (
                    <li key={li.id} className="mc-task-row">
                      <div className="min-w-0 flex-1">
                        <p className="mc-task-title">{li.label}</p>
                        <p className="mc-task-detail">{li.statusLabel}</p>
                      </div>
                      <span className="mc-task-title">{li.amountLabel}</span>
                    </li>
                  ))}
                </ul>
              </ElmCard>
            ) : null}

            {reimbursements.length ? (
              <ElmCard padding="md" as="section" aria-label="Reimbursements">
                <p className="mc-kicker mb-3">Reimbursements</p>
                <ul className="mc-task-list">
                  {reimbursements.map((li) => (
                    <li key={li.id} className="mc-task-row">
                      <div className="min-w-0 flex-1">
                        <p className="mc-task-title">{li.label}</p>
                        <p className="mc-task-detail">{li.statusLabel}</p>
                      </div>
                      <span className="mc-task-title">{li.amountLabel}</span>
                    </li>
                  ))}
                </ul>
              </ElmCard>
            ) : null}

            {deductions.length ? (
              <ElmCard padding="md" as="section" aria-label="Deductions">
                <p className="mc-kicker mb-3">Deductions</p>
                <ul className="mc-task-list">
                  {deductions.map((li) => (
                    <li key={li.id} className="mc-task-row">
                      <div className="min-w-0 flex-1">
                        <p className="mc-task-title">{li.label}</p>
                        <p className="mc-task-detail">{li.statusLabel}</p>
                      </div>
                      <span className="mc-task-title">{li.amountLabel}</span>
                    </li>
                  ))}
                </ul>
              </ElmCard>
            ) : null}

            {pay.history?.length ? (
              <ElmCard padding="md" as="section" aria-label="Settlement history">
                <p className="mc-kicker mb-3">Settlement history</p>
                <ul className="mc-task-list">
                  {pay.history.map((h) => (
                    <li key={h.id} className="mc-task-row">
                      <div className="min-w-0 flex-1">
                        <p className="mc-task-title">{h.periodLabel}</p>
                        <p className="mc-task-detail capitalize">{h.statusLabel}</p>
                      </div>
                      <span className="mc-task-title">{h.netLabel}</span>
                    </li>
                  ))}
                </ul>
              </ElmCard>
            ) : null}

            <ElmCard variant="default" padding="md" as="section" aria-label="Pay questions">
              <p className="mc-kicker mb-2">Question about this settlement?</p>
              <p className="mc-section-copy">
                Ask about a line item or settlement status. In Showcase this is simulated only.
              </p>
              {status ? (
                <p className="mc-sim-status mt-3" role="status">
                  {status}
                </p>
              ) : null}
              <button type="button" className="mc-exception-action mt-4" onClick={reportPayQuestion}>
                {t('pay.askAboutPay')}
              </button>
            </ElmCard>
          </>
        )}
      </div>
    </MissionShell>
  );
};

interface MoreLink {
  id: string;
  label: string;
  detail: string;
  href: string;
  state?: 'AVAILABLE' | 'COMING_SOON' | 'DEMO_ONLY' | 'NOT_CONNECTED';
}

/** More — driver mental model sections (not a tile wall). */
export const MorePage: React.FC = () => {
  const { session, logout } = useAuth();
  const { mode, routePrefix } = useDriverExperience();
  const showcase = useShowcaseOptional();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [entering, setEntering] = useState(false);
  const company = getCompanyDisplayName(session?.companyCode);
  const isBridgeAdmin =
    mode === 'production' &&
    session?.authRole === 'admin' &&
    Boolean(session?.canSelectAnyDriver);
  const hasShowcaseGrant = isShowcaseGrantPresentAndUnexpired();
  const canEnterShowcase = isBridgeAdmin && hasShowcaseGrant;

  const enterShowcase = async () => {
    if (!showcase) return;
    setEntering(true);
    const result = await showcase.enterShowcase();
    setEntering(false);
    if (result === 'ok') navigate('/showcase');
    else navigate('/showcase/home');
  };

  const refreshAdminGrant = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const p = routePrefix || '';
  const demo = mode === 'showcase';

  const sections: { id: string; title: string; links: MoreLink[] }[] = [
    {
      id: 'my-work',
      title: 'My work',
      links: [
        {
          id: 'schedule',
          label: 'Schedule & availability',
          detail: demo ? 'Request home time (demo)' : 'Not available yet',
          href: demo ? `${p}/home-time` : '#',
          state: demo ? 'DEMO_ONLY' : 'NOT_CONNECTED',
        },
        {
          id: 'documents',
          label: 'Documents',
          detail: demo ? 'Your document packet' : 'Not available yet',
          href: demo ? `${p}/documents` : '#',
          state: demo ? 'DEMO_ONLY' : 'NOT_CONNECTED',
        },
      ],
    },
    {
      id: 'my-vehicle',
      title: 'My vehicle',
      links: [
        {
          id: 'equipment',
          label: 'Assigned truck & trailer',
          detail: demo ? 'Unit status and assignment' : 'Not available yet',
          href: `${p}/equipment`,
          state: demo ? 'DEMO_ONLY' : 'NOT_CONNECTED',
        },
        {
          id: 'inspections',
          label: 'Inspections',
          detail: demo ? 'DVIR and inspection status' : 'Coming soon',
          href: `${p}/equipment`,
          state: demo ? 'DEMO_ONLY' : 'COMING_SOON',
        },
        {
          id: 'maintenance',
          label: 'Maintenance issues',
          detail: demo ? 'Open defects and repair requests' : 'Coming soon',
          href: `${p}/equipment`,
          state: demo ? 'DEMO_ONLY' : 'COMING_SOON',
        },
      ],
    },
    {
      id: 'safety',
      title: 'Safety',
      links: [
        {
          id: 'hos',
          label: 'Hours & compliance',
          detail: demo ? 'Hours of service summary' : 'Coming soon',
          href: `${p}/safety`,
          state: demo ? 'DEMO_ONLY' : 'COMING_SOON',
        },
        {
          id: 'qualifications',
          label: 'Qualifications',
          detail: demo ? 'Medical card and credentials' : 'Coming soon',
          href: `${p}/safety`,
          state: demo ? 'DEMO_ONLY' : 'COMING_SOON',
        },
        {
          id: 'training',
          label: 'Training',
          detail: demo ? 'Assigned training modules' : 'Coming soon',
          href: `${p}/safety`,
          state: demo ? 'DEMO_ONLY' : 'COMING_SOON',
        },
        {
          id: 'incident',
          label: 'Report an incident',
          detail: 'Add incident evidence',
          href: `${p}/capture?type=incident_evidence`,
          state: demo ? 'DEMO_ONLY' : 'COMING_SOON',
        },
      ],
    },
    {
      id: 'support',
      title: 'Support',
      links: [
        {
          id: 'messages',
          label: 'Messages & contacts',
          detail: demo ? 'Dispatch, payroll, and safety inbox' : 'Not available yet',
          href: `${p}/messages`,
          state: demo ? 'DEMO_ONLY' : 'NOT_CONNECTED',
        },
        {
          id: 'help',
          label: 'Help',
          detail: demo ? 'How Showcase works' : 'Support resources',
          href: demo ? `${p}/help` : '#',
          state: demo ? 'DEMO_ONLY' : 'COMING_SOON',
        },
        {
          id: 'search',
          label: 'Search',
          detail: 'Find trips, documents, and messages',
          href: `${p}/search`,
          state: demo ? 'DEMO_ONLY' : 'COMING_SOON',
        },
        {
          id: 'notifications',
          label: 'Notifications',
          detail: 'Alerts that need a response',
          href: `${p}/notifications`,
          state: demo ? 'DEMO_ONLY' : 'COMING_SOON',
        },
        {
          id: 'elm-ai',
          label: 'ELM AI',
          detail: demo ? 'Scripted demonstration answers' : 'Coming soon',
          href: `${p}/assistant`,
          state: demo ? 'DEMO_ONLY' : 'COMING_SOON',
        },
      ],
    },
    {
      id: 'account',
      title: 'Account',
      links: [
        {
          id: 'preferences',
          label: 'Notification preferences',
          detail: demo ? 'Choose which demo alerts you see' : 'Coming soon',
          href: demo ? `${p}/preferences` : '#',
          state: demo ? 'DEMO_ONLY' : 'COMING_SOON',
        },
      ],
    },
  ];

  return (
    <MissionShell title={t('nav.more')} activeNav="more">
      <div className="mc-more space-y-8">
        <header>
          <p className="mc-kicker">{t('more.kicker')}</p>
          <h1 className="mc-page-title">{t('more.title')}</h1>
          <p className="mc-section-copy">{t('more.copy')}</p>
        </header>

        <ElmCard variant="default" padding="md" as="section" aria-label={t('more.profile')}>
          <p className="mc-kicker mb-2">{t('more.profile')}</p>
          <h2 className="mc-section-title">{session?.driverName || t('common.driver')}</h2>
          <dl className="mc-meta-grid mt-4">
            <div>
              <dt>{t('more.email')}</dt>
              <dd className="normal-case font-medium break-all">
                {session?.maskedEmail || '—'}
              </dd>
            </div>
            <div>
              <dt>{t('more.role')}</dt>
              <dd>{session?.authRole === 'admin' ? t('common.admin') : t('common.driver')}</dd>
            </div>
            <div>
              <dt>{t('more.company')}</dt>
              <dd>{company || '—'}</dd>
            </div>
            <div>
              <dt>{t('more.session')}</dt>
              <dd>{t('more.sessionValue')}</dd>
            </div>
          </dl>
        </ElmCard>

        <section className="mc-more-section" aria-labelledby="more-language">
          <h2 id="more-language" className="mc-more-section-title">
            {t('more.language')}
          </h2>
          <ElmCard variant="default" padding="md" as="div">
            <p className="mc-section-copy mb-3">{t('more.languageDetail')}</p>
            <LanguageSelector variant="more" id="elm-more-language" />
          </ElmCard>
        </section>

        {sections.map((section) => (
          <section key={section.id} className="mc-more-section" aria-labelledby={`more-${section.id}`}>
            <h2 id={`more-${section.id}`} className="mc-more-section-title">
              {section.title}
            </h2>
            <ul className="mc-more-list">
              {section.links.map((item) => {
                const unavailable =
                  item.state === 'COMING_SOON' ||
                  item.state === 'NOT_CONNECTED' ||
                  item.href === '#';
                const content = (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="mc-task-title">{item.label}</p>
                      <p className="mc-task-detail">{item.detail}</p>
                    </div>
                    <div className="mc-more-item-meta">
                      {item.state && item.state !== 'AVAILABLE' ? (
                        <LocalizedCapabilityBadge state={item.state} />
                      ) : null}
                      {!unavailable ? <span aria-hidden>›</span> : null}
                    </div>
                  </>
                );
                return (
                  <li key={item.id}>
                    {unavailable ? (
                      <div
                        className="mc-task-row mc-more-item is-unavailable"
                        aria-disabled="true"
                      >
                        {content}
                      </div>
                    ) : (
                      <Link to={item.href} className="mc-task-row mc-task-row-link mc-more-item">
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {mode === 'showcase' ? (
          <ElmCard variant="default" padding="md" as="section" aria-label="Exit Showcase">
            <p className="mc-kicker mb-2">Showcase</p>
            <p className="mc-section-copy">
              Demonstration data only — nothing in Showcase reaches production dispatch, payroll,
              or messaging.
            </p>
            <Link
              to="/home"
              className="mc-exception-action mt-4 inline-flex no-underline"
              onClick={() => showcase?.exitShowcase()}
            >
              Exit Showcase
            </Link>
          </ElmCard>
        ) : null}

        {isBridgeAdmin ? (
          <div id="showcase-entry">
            <ElmCard variant="default" padding="md" as="section" aria-label="Admin Showcase">
              <p className="mc-kicker mb-2">Admin</p>
              <h2 className="mc-section-title">Showcase Mode</h2>
              <p className="mc-section-copy">
                Verified platform admin only. Demonstration fixtures for GLX and BST — not connected
                to Production.
              </p>
              {canEnterShowcase ? (
                <button
                  type="button"
                  className="mc-exception-action mt-4"
                  disabled={entering}
                  onClick={enterShowcase}
                >
                  {entering ? 'Verifying…' : 'Enter Showcase'}
                </button>
              ) : (
                <div className="mt-4 space-y-3">
                  <p className="mc-section-copy text-amber-200/90">
                    No valid Showcase grant in this browser session. Sign out and sign back in with
                    your bridge admin email so the server can issue a short-lived grant. Ordinary
                    driver accounts cannot enter Showcase.
                  </p>
                  <button type="button" className="mc-exception-action" onClick={refreshAdminGrant}>
                    Sign out to refresh Showcase grant
                  </button>
                </div>
              )}
            </ElmCard>
          </div>
        ) : null}

        <ElmCard variant="muted" padding="md" as="section" aria-label="Sign out">
          <button
            type="button"
            className="mc-secondary-action w-full justify-center"
            onClick={() => {
              showcase?.exitShowcase();
              logout();
              navigate('/login', { replace: true });
            }}
          >
            Sign out
          </button>
        </ElmCard>

        <ElmCard variant="muted" padding="md" as="section" aria-label="System">
          <p className="mc-kicker mb-2">System</p>
          {(() => {
            const release = getReleaseIdentity();
            return (
              <>
                <dl className="mc-meta-grid">
                  <div>
                    <dt>Platform</dt>
                    <dd>ELM CONNECT</dd>
                  </div>
                  <div>
                    <dt>App version</dt>
                    <dd className="font-mono">{ELM_VERSION}</dd>
                  </div>
                  <div>
                    <dt>Release</dt>
                    <dd className="font-mono text-[11px] normal-case tracking-normal">
                      {release.shortSha} · {release.environment}
                    </dd>
                  </div>
                  <div>
                    <dt>Built</dt>
                    <dd className="font-mono text-[11px] normal-case tracking-normal">
                      {release.buildTimestamp}
                    </dd>
                  </div>
                </dl>
              </>
            );
          })()}
        </ElmCard>
      </div>
    </MissionShell>
  );
};
