# Architecture & Design Decisions

This document records important technical and product decisions.

---

# ADR-001: Use a Modular Monolith

## Decision

Use one Express backend application with logically separated modules.

## Reason

The MVP is relatively small and must be developed quickly.

Benefits:

- Simple deployment.
- Simple local development.
- Easier debugging.
- Lower operational complexity.
- Clear ownership between developers.

Microservices are unnecessary for the MVP.

---

# ADR-002: Use PostgreSQL

## Decision

Use PostgreSQL as the primary database.

## Reason

The application contains strongly relational data:

Users
Coordinator Invitations
Events
Registrations
Attendance

PostgreSQL provides:

- Foreign keys.
- Transactions.
- Constraints.
- Relational modeling.
- Reliable SQL support.

---

# ADR-003: Use One Users Table

## Decision

Store Admin, Coordinator, and Volunteer accounts in the same `users` table.

Use a `role` field.

```text
ADMIN
COORDINATOR
VOLUNTEER
```

## Reason

All users share common account information:

- Name.
- Email.
- Password.
- Account metadata.

Separate tables would unnecessarily duplicate these fields.

---

# ADR-004: Public Signup Creates Volunteers

## Decision

Public signup does not allow users to choose a trusted role.

Every account created through public signup receives:

```text
role = VOLUNTEER
```

## Reason

Allowing the client to submit:

```json
{
  "role": "COORDINATOR"
}
```

would allow anyone to attempt to provision themselves with a trusted role.

The backend should determine the role based on the signup mechanism.

---

# ADR-005: Coordinator Accounts Require Admin Invitations

## Decision

Coordinator accounts can only be provisioned through an Admin-issued invitation.

## Reason

Coordinators have elevated permissions compared with volunteers.

A trusted role should not be self-assigned through public registration.

The invitation provides an explicit authorization mechanism controlled by an Admin.

---

# ADR-006: Coordinator Invitations Are Single-Use and Expiring

## Decision

Coordinator invitations:

- Are cryptographically random.
- Are associated with an email.
- Expire after a defined period.
- Can only be used once.
- Become invalid after use.

## Reason

This reduces the risk of leaked, replayed, or indefinitely valid invitation credentials.

---

# ADR-007: Do Not Trust Client-Provided Roles

## Decision

The backend does not trust a role supplied by the frontend during public signup.

## Reason

Frontend code and HTTP requests can be modified by users.

For example, an attacker could bypass the UI and send:

```json
{
  "role": "ADMIN"
}
```

Therefore:

```text
Public signup -> VOLUNTEER
Valid coordinator invitation -> COORDINATOR
Pre-created account -> ADMIN
```

---

# ADR-008: Authentication, Authorization and Role Provisioning Are Separate

## Decision

Treat these as three separate concerns.

## Definitions

### Authentication

Determines:

> Who is this user?

Examples:

- Password authentication.
- Google OAuth.

### Authorization

Determines:

> What is this authenticated user allowed to do?

Examples:

- Admin can create events.
- Coordinator can manage assigned events.
- Volunteer can register.

### Role Provisioning

Determines:

> How did the user receive their role?

Examples:

- Public signup provisions Volunteer.
- Admin invitation provisions Coordinator.
- System provisioning creates Admin.

## Reason

Separating these concepts makes the security model clearer and prevents authentication mechanisms from being confused with authorization decisions.

---

# ADR-009: One Coordinator Per Event

## Decision

Each event has one primary coordinator in the MVP.

A coordinator can manage multiple events.

## Reason

This simplifies:

- Database relationships.
- Authorization.
- Event management.
- UI.
- Implementation.

Multiple coordinators can be introduced later if required.

---

# ADR-010: Preserve Cancelled Registrations

## Decision

Unregistering changes a registration's status to `CANCELLED` instead of immediately deleting the record.

## Reason

Historical information can be useful for:

- Registration analytics.
- Cancellation rate.
- Participation history.
- Auditing.

The exact re-registration behavior must be finalized during implementation.

---

# ADR-011: Backend Enforces Business Rules

## Decision

All important business rules are enforced by the backend.

## Reason

Frontend restrictions can be bypassed.

For example, hiding the Register button does not prevent a malicious client from calling:

```text
POST /events/1/register
```

The backend must independently verify:

- Authentication.
- User role.
- Event existence.
- Registration status.
- Duplicate registration.
- Capacity.
- Coordinator assignment.

---

# ADR-012: API Contract Is Shared Documentation

## Decision

All API contracts are documented in `docs/api.md`.

## Reason

The backend developers and frontend developers need a common interface.

An API change should update:

1. Implementation.
2. Documentation.
3. Tests.

---

# ADR-013: Capacity Is Enforced Server-Side

## Decision

Event capacity must be enforced by backend/database logic.

## Reason

Two volunteers may attempt to register for the final available slot simultaneously.

The backend must ensure that:

```text
active registrations <= required volunteers
```

even under concurrent requests.

---

# ADR-014: Keep the MVP Small

## Decision

The initial MVP focuses on:

- Volunteer public signup.
- Coordinator invitation and signup.
- Authentication.
- Role-based authorization.
- Event creation.
- Coordinator assignment.
- Event management.
- Volunteer registration.
- Registration management.
- Attendance.
- Basic analytics.

## Deferred Features

The following are intentionally deferred:

- Payments.
- Complex messaging.
- Notifications.
- Certificates.
- Advanced analytics.
- File uploads.
- Multiple coordinators.
- Waitlists.
- Recommendation systems.
- Full email invitation infrastructure.

These features should only be introduced after the core workflow is stable.

---

# ADR Template

Future decisions should use:

## ADR-XXX: Decision Name

### Decision

What was decided.

### Context

Why the decision was necessary.

### Alternatives

What alternatives were considered.

### Reason

Why the selected approach was preferred.

### Consequences

What becomes easier or harder because of the decision.
