---
name: Clerk version compatibility
description: Which versions of Clerk packages work together in this monorepo.
---

## Rule
Use `@clerk/react@^6.0.0` and `@clerk/express@^2.1.31` together with a root pnpm override forcing `@clerk/shared@^4.21.0`.

## Why
`@clerk/react@5.x` (e.g. 5.54.0) was published with `@clerk/shared@^3.33.0` in its package.json but the actual exported API names diverged — exports like `clerkUiScriptUrl`, `loadClerkUiScript`, `SessionContext` were absent from both `@clerk/shared@3.47.7` and `@clerk/shared@4.x`, causing Vite pre-bundling to fail with "no matching export" errors. Upgrading to `@clerk/react@6.x` (latest) which declares `@clerk/shared@^4.21.0` resolves all conflicts.

## How to apply
In root `package.json` overrides:
```json
"@clerk/shared": "^4.21.0"
```
In `artifacts/certfolio/package.json`:  `"@clerk/react": "^6.0.0"`
In `artifacts/api-server/package.json`: `"@clerk/express": "^2.1.31"`, `"@clerk/shared": "^4.21.0"`

Also add `'@clerk/*'` to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml` so pnpm doesn't downgrade to stale versions.
