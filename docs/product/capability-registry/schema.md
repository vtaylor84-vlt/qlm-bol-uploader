# Capability Registry Schema

Every capability row in `capabilities.yaml` should include:

| Field | Description |
|-------|-------------|
| `id` | Stable Capability ID (kebab-case) |
| `name` | Human-readable name |
| `userProblem` | Problem the driver/admin is solving |
| `intendedOutcome` | Success outcome |
| `productDomain` | Domain bucket (access, home, trips, submit, pay, …) |
| `uiLocation` | Permanent UI location (route / section) |
| `audience` | `driver` \| `admin` \| `shared` |
| `productionStatus` | `live` \| `partial` \| `coming_soon` \| `not_connected` \| `missing` \| `showcase_only` \| `platform` |
| `productionBehavior` | What production users experience today |
| `comingSoonBehavior` | How Coming soon / unavailable is shown |
| `showcaseBehavior` | Admin Showcase behavior (or `n/a`) |
| `ownership` | `owned` \| `orchestrated` \| `integrated` |
| `canonicalRecords` | Required canonical record names |
| `permissions` | Permission / role notes |
| `auditRequirements` | Audit expectations |
| `offlineRequirements` | Offline needs |
| `integrationDependencies` | External systems |
| `activationCriteria` | What must be true to go Live |
| `roadmapPhase` | Phase number / label |
| `applicableTests` | Test file or suite references |
| `benchmark` | Optional Eleos / Platform Science / enterprise note |
