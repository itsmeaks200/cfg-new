# Database Design

## Database

PostgreSQL

---

# Core Entities

The initial MVP contains five core entities:

1. Users
2. Coordinator Invitations
3. Events
4. Registrations
5. Attendance

---

# 1. Users

Stores all system users.

```text
users
-----
id
name
email
password_hash
role
created_at
updated_at
```

## Roles

```text
ADMIN
COORDINATOR
VOLUNTEER
```

## Rules

- `email` must be unique.
- `password_hash` stores a password hash, never plaintext.
- `role` determines permissions.
- Admin account is created separately.
- Public signup can only create `VOLUNTEER`.
- `COORDINATOR` is created only through the Coordinator invitation flow.

---

# 2. Coordinator Invitations

Stores invitations issued by Admins.

```text
coordinator_invites
-------------------
id
email
token_hash
expires_at
used_at
created_by
created_at
```

## Relationships

```text
created_by -> users.id
```

`created_by` must reference an Admin.

## Rules

- Token must be cryptographically random.
- Store a hash of the token rather than the raw token where practical.
- Invitation must have an expiration time.
- Invitation can only be used once.
- Invitation email must match the email submitted during Coordinator signup.
- Used or expired invitations cannot be reused.
- Invitation cannot grant Admin privileges.

---

# 3. Events

Stores NGO events.

```text
events
------
id
title
description
location
start_time
end_time
required_volunteers
status
coordinator_id
created_by
created_at
updated_at
```

## Relationships

```text
coordinator_id -> users.id
created_by     -> users.id
```

## Status

```text
DRAFT
OPEN
CLOSED
COMPLETED
CANCELLED
```

## Rules

- `required_volunteers > 0`
- `end_time > start_time`
- `coordinator_id` must reference a user with role `COORDINATOR`.
- `created_by` must reference an Admin.

---

# 4. Registrations

Represents a volunteer registering for an event.

```text
registrations
-------------
id
event_id
volunteer_id
status
registered_at
cancelled_at
```

## Relationships

```text
event_id     -> events.id
volunteer_id -> users.id
```

`volunteer_id` must reference a user with role `VOLUNTEER`.

## Status

```text
REGISTERED
CANCELLED
```

## Important Constraint

A volunteer should not be able to create duplicate active registrations for the same event.

The final database constraint should account for cancelled registrations and whether a cancelled volunteer is allowed to register again.

---

# 5. Attendance

Stores event participation.

```text
attendance
----------
id
registration_id
status
marked_at
```

## Status

```text
PRESENT
ABSENT
```

## Relationship

```text
registration_id -> registrations.id
```

---

# Relationships

```text
USER
 |
 +---- ADMIN
 |       |
 |       +---- creates ----> COORDINATOR INVITE
 |       |
 |       +---- creates ----> EVENT
 |
 +---- COORDINATOR
 |        |
 |        +---- manages ----> EVENT
 |
 +---- VOLUNTEER
          |
          +---- registers ----> REGISTRATION
                                  |
                                  v
                                EVENT
                                  |
                                  v
                              ATTENDANCE
```

---

# Cardinality

## Admin -> Events

One Admin can create many events.

```text
1 : N
```

## Admin -> Coordinator Invitations

One Admin can create many Coordinator invitations.

```text
1 : N
```

## Coordinator -> Events

One Coordinator can manage multiple events.

Each event has one coordinator in the MVP.

```text
1 : N
```

## Volunteer -> Events

A volunteer can register for multiple events.

An event can have multiple volunteers.

```text
N : M
```

This relationship is represented through `registrations`.

---

# Capacity

The number of active registrations is compared against:

```text
events.required_volunteers
```

Conceptually:

```text
remaining =
required_volunteers - active_registrations
```

Capacity validation must happen on the backend.

Concurrent registrations must be handled safely so that capacity cannot be exceeded.

---

# Role Provisioning

The database should never trust a client-provided role for public signup.

### Volunteer

```text
Public signup
     |
     v
role = VOLUNTEER
```

### Coordinator

```text
Admin invitation
     |
     v
Valid invitation
     |
     v
role = COORDINATOR
```

### Admin

```text
Pre-created account
     |
     v
role = ADMIN
```

---

# Data Integrity Rules

- Foreign keys should be enforced by PostgreSQL.
- Email must be unique.
- Required fields should use appropriate `NOT NULL` constraints.
- Registration uniqueness must be enforced.
- Passwords must never be stored in plaintext.
- Historical registration and attendance data should be preserved where required.
- Invitation expiration and one-time use must be enforced.
