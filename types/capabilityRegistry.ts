/**
 * Capability Registry typed IDs — governance metadata for UI/tests.
 * Not a remote feature-flag service.
 */

export type CapabilityProductionStatus =
  | 'live'
  | 'partial'
  | 'coming_soon'
  | 'not_connected'
  | 'missing'
  | 'showcase_only'
  | 'platform';

export type CapabilityAudience = 'driver' | 'admin' | 'shared';

export type CapabilityOwnership = 'owned' | 'orchestrated' | 'integrated';

/** Stable IDs seeded in docs/product/capability-registry/capabilities.yaml */
export const CAPABILITY_IDS = [
  'access-identity',
  'home',
  'trips',
  'submit',
  'bol-pod-upload',
  'trip-form',
  'receipts',
  'freight-photos',
  'guided-exceptions',
  'pay',
  'messaging-notifications',
  'my-vehicle',
  'safety-compliance',
  'support-resources',
  'elm-ai',
  'offline-behavior',
  'document-intelligence',
  'admin-showcase',
  'view-as',
  'multilingual',
  'connected-vehicle',
  'admin-platform',
] as const;

export type CapabilityId = (typeof CAPABILITY_IDS)[number];

export function isCapabilityId(value: string): value is CapabilityId {
  return (CAPABILITY_IDS as readonly string[]).includes(value);
}

/** Minimal registry row shape for tests / future loaders. */
export interface CapabilityRegistryEntry {
  id: CapabilityId;
  name: string;
  productDomain: string;
  uiLocation: string;
  audience: CapabilityAudience;
  productionStatus: CapabilityProductionStatus;
  ownership: CapabilityOwnership;
  roadmapPhase: number | string;
}
