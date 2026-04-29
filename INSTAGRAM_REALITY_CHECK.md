# Instagram Reality Check Plan

This document is an execution plan to validate whether Instagram can power a "nearby images based on user location" feature for this project.

## Objective

Decide, with evidence, whether we should:

1. Use Instagram as a primary source for location-based images.
2. Use Instagram only in a limited role.
3. Avoid Instagram for this feature and use Google APIs as primary.

## Required Credentials

### Instagram / Meta

1. Meta Developer account.
2. Meta App ID and App Secret.
3. Instagram Professional account (Business or Creator) linked to a Facebook Page for testing.
4. Access token(s):
- User access token (for Graph API calls in sandbox/testing).
- Long-lived token strategy if moving to production.

### Google (Fallback Validation)

1. Google Cloud project.
2. Google Maps Platform API key with billing enabled.
3. Enabled APIs:
- Places API (New)
- Place Photos (New)
- Optional: Geolocation API (if needed beyond browser geolocation)

## Non-Goals

1. No scraping Instagram pages.
2. No unofficial Instagram APIs.
3. No production launch in this phase.

## Execution Plan

## Phase 1: Requirement Lock (Day 1)

1. Write exact user story in one sentence:
- "Given current user location, show nearby relevant social images in under X seconds."
2. Define acceptance thresholds:
- Minimum results per query.
- Maximum acceptable latency.
- Freshness window.
- Required metadata (author, timestamp, location granularity).
3. Define legal requirements:
- Attribution display.
- Storage duration.
- Deletion/update behavior.

Deliverable: `requirements/location-image-source-requirements.md`

## Phase 2: Capability Mapping (Day 1)

1. Build matrix:
- Requirement
- Instagram endpoint/permission
- Supported? (yes/partial/no)
- Notes/risk
2. Build same matrix for Google fallback.

Deliverable: `research/location-source-capability-matrix.md`

## Phase 3: Instagram Technical Spike (Days 2-3)

1. Configure Meta app in development mode.
2. Connect test Instagram Professional account.
3. Validate access token flow end-to-end.
4. Run minimum API probes:
- Account media read.
- Hashtag-related discovery (if available to your app/scopes).
- Any retrievable location fields on returned media.
5. Record for each probe:
- Request URL and params.
- Permissions used.
- Response shape and limitations.
- Failure modes and error codes.

Deliverable: `research/instagram-spike-results.md`

## Phase 4: Policy + Review Feasibility (Day 3)

1. List all required permissions/scopes for intended behavior.
2. Identify app review requirements and business verification dependencies.
3. Evaluate policy risk:
- Is intended production behavior explicitly allowed?
- Are there blocking restrictions for public location-based discovery?

Deliverable: `research/instagram-policy-feasibility.md`

## Phase 5: Coverage Test (Day 4)

1. Define test set:
- 5 cities.
- 10 query scenarios.
2. Measure:
- Result count.
- % queries with usable images.
- Latency p50/p95.
- Missing required fields.
3. Compare against thresholds from Phase 1.

Deliverable: `research/location-coverage-results.md`

## Phase 6: Decision Gate (Day 5)

1. Decide one:
- Go: Instagram meets product needs and policy constraints.
- Hybrid: Google primary, Instagram supplemental.
- No-go: Instagram not viable for this use case.
2. Write one-page decision memo with evidence links.

Deliverable: `research/location-image-source-decision.md`

## Implementation Tasks (Issue-Ready)

1. Create `requirements/` and `research/` folders.
2. Add capability matrix template.
3. Add spike result template with request/response logging table.
4. Add policy checklist template.
5. Add coverage benchmark script or manual test checklist.
6. Add decision memo template with go/hybrid/no-go rubric.

## Suggested Timeline

1. Day 1: Requirement lock + capability mapping.
2. Day 2-3: Instagram spike + logging.
3. Day 3: Policy/review feasibility.
4. Day 4: Coverage measurements.
5. Day 5: Final decision memo.

## Recommended Default Architecture (Until Proven Otherwise)

1. Use Google Places + Place Photos for location-based discovery.
2. Keep Instagram integration optional and isolated behind a feature flag.
3. Only enable Instagram for explicitly supported, policy-compliant flows.

## Exit Criteria

Plan is complete when all are true:

1. All deliverables listed above exist in repo.
2. Decision memo references concrete test evidence.
3. API key/token inventory is documented and stored securely.
4. A final go/hybrid/no-go decision is made with rationale.
