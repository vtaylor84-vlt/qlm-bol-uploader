import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MissionShell from '../components/mission-control/MissionShell.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useSubmissionDraft } from '../context/SubmissionDraftContext.tsx';
import { useDriverExperience } from '../context/DriverExperienceContext.tsx';
import { useLocale } from '../context/LocaleContext.tsx';
import ElmPageHeader from '../design-system/components/ElmPageHeader.tsx';
import PageContainer from '../design-system/components/PageContainer.tsx';
import LocalizedCapabilityBadge from '../components/mission-control/LocalizedCapabilityBadge.tsx';
import { getCompanyDisplayName } from '../utils/companyMap.ts';
import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  CameraIcon,
  ClipboardDocumentCheckIcon,
  DocumentArrowUpIcon,
  DocumentMinusIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  ReceiptPercentIcon,
  ShieldExclamationIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { openPayrollTripSubmission } from '../utils/payrollTripSubmission.ts';
import type { MessageKey } from '../i18n/messages/en.ts';

type FutureKind =
  | 'receipt'
  | 'freight'
  | 'missingPaperwork'
  | 'detention'
  | 'lumper'
  | 'delay'
  | 'osd'
  | 'seal'
  | 'refusal'
  | 'vehicle'
  | 'breakdown'
  | 'incident'
  | 'otherException';

interface FutureSubmission {
  id: FutureKind;
  titleKey: MessageKey;
  descKey: MessageKey;
  icon: React.ReactNode;
  group: 'paperwork' | 'exceptions' | 'safety';
}

const FUTURE_SUBMISSIONS: FutureSubmission[] = [
  {
    id: 'receipt',
    titleKey: 'submit.receipt',
    descKey: 'submit.receiptDesc',
    icon: <ReceiptPercentIcon className="mc-submit-card-icon" aria-hidden />,
    group: 'paperwork',
  },
  {
    id: 'freight',
    titleKey: 'submit.freight',
    descKey: 'submit.freightDesc',
    icon: <CameraIcon className="mc-submit-card-icon" aria-hidden />,
    group: 'paperwork',
  },
  {
    id: 'missingPaperwork',
    titleKey: 'submit.missingPaperwork',
    descKey: 'submit.missingPaperworkDesc',
    icon: <DocumentMinusIcon className="mc-submit-card-icon" aria-hidden />,
    group: 'paperwork',
  },
  {
    id: 'detention',
    titleKey: 'submit.detention',
    descKey: 'submit.detentionDesc',
    icon: <ExclamationTriangleIcon className="mc-submit-card-icon" aria-hidden />,
    group: 'exceptions',
  },
  {
    id: 'lumper',
    titleKey: 'submit.lumper',
    descKey: 'submit.lumperDesc',
    icon: <ReceiptPercentIcon className="mc-submit-card-icon" aria-hidden />,
    group: 'exceptions',
  },
  {
    id: 'delay',
    titleKey: 'submit.delay',
    descKey: 'submit.delayDesc',
    icon: <ExclamationTriangleIcon className="mc-submit-card-icon" aria-hidden />,
    group: 'exceptions',
  },
  {
    id: 'osd',
    titleKey: 'submit.osd',
    descKey: 'submit.osdDesc',
    icon: <ShieldExclamationIcon className="mc-submit-card-icon" aria-hidden />,
    group: 'exceptions',
  },
  {
    id: 'seal',
    titleKey: 'submit.seal',
    descKey: 'submit.sealDesc',
    icon: <NoSymbolIcon className="mc-submit-card-icon" aria-hidden />,
    group: 'exceptions',
  },
  {
    id: 'refusal',
    titleKey: 'submit.refusal',
    descKey: 'submit.refusalDesc',
    icon: <NoSymbolIcon className="mc-submit-card-icon" aria-hidden />,
    group: 'exceptions',
  },
  {
    id: 'otherException',
    titleKey: 'submit.otherException',
    descKey: 'submit.otherExceptionDesc',
    icon: <ExclamationTriangleIcon className="mc-submit-card-icon" aria-hidden />,
    group: 'exceptions',
  },
  {
    id: 'vehicle',
    titleKey: 'submit.vehicle',
    descKey: 'submit.vehicleDesc',
    icon: <WrenchScrewdriverIcon className="mc-submit-card-icon" aria-hidden />,
    group: 'safety',
  },
  {
    id: 'breakdown',
    titleKey: 'submit.breakdown',
    descKey: 'submit.breakdownDesc',
    icon: <TruckIcon className="mc-submit-card-icon" aria-hidden />,
    group: 'safety',
  },
  {
    id: 'incident',
    titleKey: 'submit.incident',
    descKey: 'submit.incidentDesc',
    icon: <ExclamationTriangleIcon className="mc-submit-card-icon" aria-hidden />,
    group: 'safety',
  },
];

/**
 * Submit — live Upload BOL / POD + Submit Trip Form, then coming-soon submissions.
 * Route remains /capture for link stability. Label is Submit.
 */
const WorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { session } = useAuth();
  const { startDraft, clearDraft } = useSubmissionDraft();
  const { mode, routePrefix, dataSource, actions } = useDriverExperience();
  const { t } = useLocale();
  const [simMessage, setSimMessage] = useState('');

  const company = getCompanyDisplayName(session?.companyCode);
  const haul = dataSource.getMissionControl().activeHaul;
  const rawType = (params.get('type') || '').toLowerCase();
  const prefersBol =
    rawType === 'bol_pod' || rawType === 'trip_paperwork' || rawType === 'bol' || rawType === 'pod';

  const tripFormLabel = t('tripForm.label');
  const tripFormHelper = t('tripForm.helper');

  const openBolPod = async () => {
    if (mode === 'showcase') {
      const result = await actions.submitPodSimulated?.();
      if (result) setSimMessage(`${result.disclosure}: ${result.message}`);
      return;
    }

    clearDraft();
    startDraft({
      submissionType: 'BOL_POD',
      driverName: session?.driverName || '',
      company,
    });
    navigate('/submissions/bol-pod');
  };

  const bolDescription = haul
    ? t('submit.bolWithTrip', { loadNum: haul.loadNum })
    : t('submit.bolGeneric');

  const renderFutureGroup = (
    group: FutureSubmission['group'],
    headingKey: MessageKey,
    headingId: string
  ) => {
    const items = FUTURE_SUBMISSIONS.filter((item) => item.group === group);
    return (
      <section className="mc-submit-section" aria-labelledby={headingId}>
        <h2 id={headingId} className="mc-submit-section-title">
          {t(headingKey)}
        </h2>
        <ul className="mc-submit-future-list">
          {items.map((item) => (
            <li key={item.id}>
              <div
                className="mc-submit-future-card"
                aria-disabled="true"
                data-submit-future={item.id}
              >
                <span className="mc-submit-future-card-glyph" aria-hidden>
                  {item.icon}
                </span>
                <span className="mc-submit-future-card-body">
                  <span className="mc-submit-future-card-title-row">
                    <span className="mc-submit-future-card-title">{t(item.titleKey)}</span>
                    <LocalizedCapabilityBadge state="COMING_SOON" />
                  </span>
                  <span className="mc-submit-future-card-copy">{t(item.descKey)}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    );
  };

  return (
    <MissionShell title={t('nav.capture')} activeNav="capture">
      <PageContainer width="content" className="space-y-6 mc-submit-page">
        <ElmPageHeader
          eyebrow={t('submit.kicker')}
          title={t('submit.title')}
          align="left"
          description={t('submit.description')}
        />

        {haul ? (
          <p className="mc-capture-context" role="status">
            {t('home.currentTrip')} #{haul.loadNum} · {haul.origin} → {haul.destination}
            {haul.appointmentLabel ? ` · ${haul.appointmentLabel}` : ''}
          </p>
        ) : null}

        {simMessage ? (
          <p className="mc-sim-status" role="status">
            {simMessage}
          </p>
        ) : null}

        <section className="mc-submit-section" aria-labelledby="submit-available-heading">
          <h2 id="submit-available-heading" className="mc-submit-section-title">
            {t('submit.availableNow')}
          </h2>
          <div className="mc-submit-live-grid">
            <button
              type="button"
              className={`mc-submit-live-card${prefersBol ? ' is-hinted' : ''}`}
              onClick={() => openBolPod()}
              aria-label={t('submit.bolAria')}
              data-submit-action="bol-pod"
            >
              <span className="mc-submit-live-card-glyph" aria-hidden>
                <DocumentArrowUpIcon className="mc-submit-card-icon" />
              </span>
              <span className="mc-submit-live-card-body">
                <span className="mc-submit-live-card-title">{t('submit.bolTitle')}</span>
                <span className="mc-submit-live-card-copy">{bolDescription}</span>
              </span>
              <span className="mc-submit-live-card-trail" aria-hidden>
                <ArrowRightIcon className="mc-submit-card-icon mc-submit-card-icon--trail" />
              </span>
            </button>

            <button
              type="button"
              className="mc-submit-live-card"
              onClick={() => openPayrollTripSubmission()}
              aria-label={t('submit.tripFormAria', {
                label: tripFormLabel,
                helper: tripFormHelper,
              })}
              data-submit-action="trip-form"
            >
              <span className="mc-submit-live-card-glyph" aria-hidden>
                <ClipboardDocumentCheckIcon className="mc-submit-card-icon" />
              </span>
              <span className="mc-submit-live-card-body">
                <span className="mc-submit-live-card-title">{tripFormLabel}</span>
                <span className="mc-submit-live-card-copy">{tripFormHelper}</span>
              </span>
              <span className="mc-submit-live-card-trail" aria-hidden>
                <ArrowTopRightOnSquareIcon className="mc-submit-card-icon mc-submit-card-icon--trail" />
              </span>
            </button>
          </div>
        </section>

        {renderFutureGroup('paperwork', 'submit.tripPaperwork', 'submit-paperwork-heading')}
        {renderFutureGroup('exceptions', 'submit.exceptions', 'submit-exceptions-heading')}
        {renderFutureGroup('safety', 'submit.safetyEvidence', 'submit-safety-heading')}

        {mode === 'showcase' ? (
          <p className="mc-section-copy">
            {t('submit.showcaseNote')}
            {routePrefix ? ` Demo path: ${routePrefix}/capture.` : ''}
          </p>
        ) : null}
      </PageContainer>
    </MissionShell>
  );
};

export default WorkspacePage;
