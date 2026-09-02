# RiderLink Delivery Coordination

RiderLink helps Kenyan retailers create, assign, track, and verify deliveries from one shared operations desk.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the Node.js/Express API server
- `pnpm run check` — run JavaScript syntax checks across packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `lib/db/schema.sql` — PostgreSQL schema reference for the database
- Required env: `DATABASE_URL` — Postgres connection string
- Before a team member can use the app, create a corresponding `users` row with
  their Clerk user ID in `clerk_user_id`; roles are `owner`, `admin`,
  `dispatcher`, or `rider`.

## Stack

- pnpm workspaces, Node.js 24
- API: Node.js + Express 5 + JavaScript
- DB: PostgreSQL + parameterized SQL via `pg`
- Validation: Zod (`zod/v4`)
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (ESM bundle)

## Where things live

- `artifacts/reflex/src/` — React dashboard, delivery queue, rider mode, and settings.
- `artifacts/api-server/src/routes/reflex.js` — delivery API routes and state transitions.
- `lib/api-spec/openapi.yaml` — source of truth for API contracts.
- `lib/db/schema.sql` — PostgreSQL schema for businesses, users, deliveries, assignments, events, and proof.
- `lib/api-client-react/src/index.js` and `lib/api-zod/src/index.js` — JavaScript API client and validation modules.

## Architecture decisions

- The API remains a modular monolith for the first release, with delivery state changes and history represented as separate records.
- Delivery writes use optimistic version checks so competing dispatcher/rider updates fail explicitly instead of overwriting silently.
- Rider status events accept client event IDs so offline retries are idempotent.
- The initial web experience uses PostgreSQL-backed data and polling-friendly query invalidation; push and mobile-specific transport can be layered on later.

## Product

- Dispatcher dashboard with operational summary, activity feed, rider health, and queue navigation.
- Delivery creation, search/filtering, assignment and reassignment, cancellation, lifecycle status updates, and proof-of-delivery validation.
- Rider mode with local offline queue persistence and sync endpoint.
- Team roster and business settings.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
