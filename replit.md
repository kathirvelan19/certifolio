# Certfolio

A full-stack web app where students upload certificates (PDF/images), get shareable public links, and showcase them on a personal portfolio page. Recruiters can view certificates without logging in.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxy at `/api`)
- `pnpm --filter @workspace/certfolio run dev` — run the frontend (port dynamic, proxy at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite, Wouter (routing), TanStack Query, Tailwind CSS, shadcn/ui, Clerk auth
- API: Express 5 + Clerk Express middleware
- DB: PostgreSQL + Drizzle ORM (`lib/db`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- File storage: Replit Object Storage (`lib/object-storage-web`)
- API codegen: Orval (from OpenAPI spec in `lib/api-spec`)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/index.ts` — DB schema (users + certificates tables)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `artifacts/api-server/src/app.ts` — Express app setup + Clerk middleware
- `artifacts/api-server/src/routes/` — Route handlers (certificates, users, portfolio, storage)
- `artifacts/certfolio/src/App.tsx` — React app entry with routing + Clerk provider
- `artifacts/certfolio/src/pages/` — Dashboard, Upload, CertificateView, PortfolioView, ProfileEdit, Home
- `artifacts/certfolio/src/components/` — Navbar, PublicHeader, UI components

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed React Query hooks + Zod schemas
- Clerk auth on both server (express middleware) and client (ClerkProvider + useAuth)
- Public portfolio pages (`/u/:username`) require no login — recruiters can view without accounts
- Object Storage for certificate files; metadata (title, issuer, date, etc.) stored in PostgreSQL
- Wouter used instead of React Router for lighter bundle

## Product

- Students sign up, upload certificate PDFs/images with metadata (title, issuer, date, skills)
- Each certificate gets a shareable public link and QR code
- Each student has a personal portfolio page at `/u/:username` visible to anyone
- Dashboard shows all uploaded certificates with stats

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Clerk package versions must stay in sync: use `@clerk/react@^6.x`, `@clerk/express@^2.x`, and force `@clerk/shared@^4.21.0` via root pnpm override. See `.agents/memory/clerk-versions.md`.
- `@clerk/*` is excluded from `minimumReleaseAge` in `pnpm-workspace.yaml` to prevent pnpm from pinning stale versions.
- Do not run `pnpm dev` at workspace root — use workflow restart or per-package `--filter` commands.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
