# Release Log

## 2026-05-27 - Phase 2 Production Ship

Decision: ship.

Production URL: https://crypto-signal-jet.vercel.app

Inspect URL: https://vercel.com/steve-9773s-projects/crypto-signal/J4YAVfCJkB4vzzMMVq37dVFnescY

Scope:
- `crypto-signal` only.
- `wedding-os-landing` remains separate and was not touched.
- No scope reopen for this release cut.

Post-deploy canary evidence:
- `/` returned HTTP 200 from Vercel.
- `/api/signals` returned a valid payload.
- Regime label: `BEAR`.
- Signal count: 8.
- Buckets: `daytrade`, `swing`, `position`.
- Daily report engine: `deterministic-fallback`.
- Four Pillars context links are present in the API response.
- Production page contains `Crypto Signal Hub`.

Rollback:
- Use Vercel project `crypto-signal` deployment history.
- Promote the previous known-good production deployment if production canary fails.
- Keep `.vercel` local project metadata out of git.
