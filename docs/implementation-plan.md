# Backend Implementation Plan (2 Engineers)

This plan sequences the work described in `architecture.md`, `api.md`, `database.md`, and `workflows.md` into phases for two backend engineers working in parallel.

Ownership follows the existing split in `architecture.md` ("Two-Developer Backend Ownership"):

- **Dev A — Authentication & User Management**
- **Dev B — Events & Registrations**

---

# Phase 0: Shared Setup (Both, Day 1)

Done together before splitting off, to avoid integration drift later.

- Repo/project scaffolding: `src/app.js`, `src/index.js`, `config/db.js`.
- PostgreSQL connection + migration tool choice (e.g. `node-pg-migrate` or `knex`).
- Base `error.middleware.js` (shared error shape for all endpoints).
- Agree on JWT payload shape (`id`, `role`) since both sides depend on it.
- Env/config conventions (`.env`, `DATABASE_URL`, `JWT_SECRET`).

Exit criteria: server boots, connects to Postgres, one health-check route returns 200.

---

# Phase 1: Core Domain, In Parallel

## Dev A — Auth & Users

Owns: `auth.routes.js`, `auth.controller.js`, `auth.service.js`, `auth.middleware.js`, `role.middleware.js`, `user.model.js`, `coordinatorInvite.model.js`, `coordinator.service.js`

1. `users` table migration (`database.md` §1) — role enum, unique email, password_hash.
2. `POST /auth/signup` — volunteer signup, always `role = VOLUNTEER` (ADR-004, ADR-007).
3. `POST /auth/login` — credential check, JWT issuance.
4. `GET /auth/me` — requires `auth.middleware.js`.
5. `auth.middleware.js` — verifies JWT, attaches `req.user`.
6. `role.middleware.js` — role-based guard, reusable by Dev B.
7. `coordinator_invites` table migration (`database.md` §2).
8. `POST /coordinators/invite` (ADMIN only) — random token, hashed storage, expiry.
9. `POST /auth/coordinator-signup` — validates token, email match, expiry, single-use (ADR-005, ADR-006).
10. `GET /coordinators` (ADMIN only) — list for assignment (used by Dev B's assign-coordinator endpoint).

Milestone A: Admin/Coordinator/Volunteer accounts can be created and authenticated; `role.middleware.js` is ready for Dev B to import.

## Dev B — Events & Registrations

Owns: `event.routes.js`, `event.controller.js`, `event.service.js`, `registration.routes.js`, `registration.controller.js`, `registration.service.js`, `event.model.js`, `registration.model.js`, `attendance.model.js`

Blocked on Dev A only for `auth.middleware.js` / `role.middleware.js` — use stub middleware (`req.user = {id, role}` from a header) until Phase 1 Milestone A lands, so work isn't idle.

1. `events` table migration (`database.md` §3) — status enum, constraints (`required_volunteers > 0`, `end_time > start_time`).
2. `POST /events` (ADMIN) — create in `DRAFT`.
3. `GET /events`, `GET /events/:id`.
4. `PATCH /events/:id`.
5. `PATCH /events/:id/coordinator` — validates target user has role `COORDINATOR` (needs Dev A's `users` table + `GET /coordinators` for the frontend, but only needs the table itself, not the endpoint).
6. `registrations` table migration (`database.md` §4) — uniqueness constraint per volunteer/event for active registrations.
7. `POST /events/:id/register`, `DELETE /events/:id/register` — capacity + duplicate checks (ADR-013 concurrency-safe).
8. `POST /events/:id/open-registration`, `POST /events/:id/close-registration` — assigned-coordinator check.
9. `GET /events/:id/registrations`, `GET /me/registrations`.
10. `attendance` table migration (`database.md` §5).
11. `POST /registrations/:id/attendance`, `GET /me/attendance`.

Milestone B: Full event lifecycle (`DRAFT → OPEN → CLOSED → COMPLETED`) and registration/attendance flows work against stub auth.

---

# Phase 2: Integration (Both, ~Day 3-4)

1. Swap Dev B's stub auth for Dev A's real `auth.middleware.js` / `role.middleware.js`.
2. Wire assignment-based authorization ("coordinator assigned to event") — Dev B's service checks `event.coordinator_id === req.user.id`, using `role.middleware.js` from Dev A as the base guard.
3. Cross-test the full flow end-to-end: admin invite → coordinator signup → admin creates event → assign coordinator → coordinator opens registration → volunteer signup → volunteer registers → coordinator marks attendance.
4. Reconcile any `api.md` deviations found during integration — both devs update the doc together (ADR-012).

Exit criteria: the full workflow chain in `workflows.md` passes manually or via integration test.

---

# Phase 3: Analytics & Hardening (Split, ~Day 5)

- **Dev A:** `GET /analytics` (admin-wide) — aggregate counts across events/volunteers/registrations.
- **Dev B:** `GET /events/:id/analytics` (per-event) — required/registered/remaining/attendance.
- **Both:** review concurrency handling on registration capacity (ADR-013) — use a DB-level constraint or transaction with row locking, not just an application-level check.
- **Both:** error-handling pass — consistent status codes per `api.md`, validation before DB calls (API Design Rule 8).

---

# Ongoing Conventions (Both Devs)

- Controllers stay thin; business logic lives in services (`architecture.md` Design Principles).
- Any endpoint behavior change updates `api.md` in the same PR (ADR-012).
- Any schema change updates `database.md` in the same PR.
- No client-supplied trusted roles, ever (ADR-007) — this applies to both signup and any future "assign role" endpoints.
- Follow git conventions (branch-per-endpoint-group recommended: `feat/auth-signup`, `feat/event-registration`, etc.) to keep the two developers' PRs non-overlapping.

---

# Suggested Timeline

| Day | Dev A | Dev B |
|---|---|---|
| 1 | Shared setup + users table + signup/login | Shared setup + events table + event CRUD (stub auth) |
| 2 | Coordinator invite + coordinator signup + middleware | Registration + capacity logic |
| 3 | `GET /coordinators`, polish, help integrate | Open/close registration, attendance |
| 4 | Integration (swap real auth in) | Integration (swap real auth in) |
| 5 | Admin analytics + hardening | Event analytics + hardening |

This assumes both devs work off the same DB from day 1 (shared migrations directory, applied incrementally) so foreign keys (`events.coordinator_id → users.id`, `registrations.volunteer_id → users.id`) resolve without waiting on each other's full endpoint implementation.
