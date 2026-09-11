# House Cup

House Cup is a multi-tenant tournament management platform for schools and organizing committees to publish games, configure houses, register players, and celebrate leaderboard standings.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/tournament-platform run dev` — run the React frontend
- `cd backend/tournament-api && mvn spring-boot:run` — run the canonical Spring Boot + MySQL API
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env for the shared preview API: `DATABASE_URL` — Postgres connection string
- Required env for the Spring Boot service: `MYSQL_URL`, `MYSQL_USER`, and `MYSQL_PASSWORD`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/tournament-platform` — React + Vite app with home, organizer dashboard, public event, and leaderboard routes.
- `artifacts/api-server/src/routes/tournament.ts` — preview API adapter with seeded demo data.
- `backend/tournament-api` — canonical Spring Boot service with JPA entities, MySQL configuration, seed data, and the same API contract.
- `lib/api-spec/openapi.yaml` — source-of-truth API contract; generated React hooks and Zod schemas live under `lib/api-client-react` and `lib/api-zod`.

## Architecture decisions

- The global game catalogue is independent from organizer tenants; houses, tournaments, and registrations are scoped to an organizer.
- Public event pages are addressed by organizer slug so participant links stay readable and shareable.
- Spring Boot + JPA + MySQL is the canonical backend; the existing shared API service mirrors the contract for an immediately usable preview.
- OpenAPI is the frontend/backend boundary; generated hooks keep the React client aligned with server inputs and outputs.

## Product

- Global home page with sports catalogue and committee CTA.
- Organizer dashboard with summary metrics, tournaments, houses, recent registrations, and creation flows.
- Public event page with player registration, tournament programme, and house standings.
- Focused leaderboard route for sharing live results.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
