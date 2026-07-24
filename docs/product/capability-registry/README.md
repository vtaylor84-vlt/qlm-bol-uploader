# ELM CONNECT Capability Registry

**Role:** Governance metadata for Driver Workspace and related platform capabilities.  
**Not:** A remote feature-flag service or runtime entitlement engine.

## Authority

1. Entries in [`capabilities.yaml`](capabilities.yaml) are the seed inventory for Phase 1+.
2. Field meanings are defined in [`schema.md`](schema.md).
3. Typed IDs for UI/tests live in [`types/capabilityRegistry.ts`](../../../types/capabilityRegistry.ts).
4. Product vision and matrix docs may summarize status but must not contradict this registry without an explicit update here.

## Who may change status

- Product Owner (Vernon) approves status transitions (e.g., Coming soon → Live).
- Engineering may update `productionBehavior` / `comingSoonBehavior` text to match shipped UI honesty.
- Do not mark a capability Live without verified production data sources and tests.

## Related docs

- [`../ELM_CONNECT_DRIVER_APP_CAPABILITY_MATRIX.md`](../ELM_CONNECT_DRIVER_APP_CAPABILITY_MATRIX.md)
- [`../ELM_CONNECT_DRIVER_NAVIGATION_MAP.md`](../ELM_CONNECT_DRIVER_NAVIGATION_MAP.md)
- [`../ELM_CONNECT_DRIVER_INTEGRATION_BOUNDARIES.md`](../ELM_CONNECT_DRIVER_INTEGRATION_BOUNDARIES.md)
