# System Architecture

## Architecture Style

The MVP uses a **modular monolith**.

There is one Express backend application with separate logical modules.

Microservices are intentionally avoided for the MVP.

---

# High-Level Architecture

```text
                    +------------------+
                    |      Client      |
                    |   React / Web    |
                    +--------+---------+
                             |
                             | HTTPS / JSON
                             v
                    +------------------+
                    |   Express API    |
                    +--------+---------+
                             |
             +---------------+----------------+
             |               |                |
             v               v                v
        Auth Module      Event Module   Registration Module
             |               |                |
             +---------------+----------------+
                             |
                             v
                    +------------------+
                    |    PostgreSQL    |
                    +------------------+
```

---

# Backend Structure

```text
src/
├── app.js
├── index.js
│
├── config/
│   └── db.js
│
├── routes/
│   ├── auth.routes.js
│   ├── coordinator.routes.js
│   ├── event.routes.js
│   └── registration.routes.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── coordinator.controller.js
│   ├── event.controller.js
│   └── registration.controller.js
│
├── services/
│   ├── auth.service.js
│   ├── coordinator.service.js
│   ├── event.service.js
│   └── registration.service.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   └── error.middleware.js
│
└── models/
    ├── user.model.js
    ├── coordinatorInvite.model.js
    ├── event.model.js
    ├── registration.model.js
    └── attendance.model.js
```

---

# app.js

Responsible for configuring the Express application.

Responsibilities:

- Create Express instance.
- Register middleware.
- Register routes.
- Register error handling.
- Export the application.

`app.js` should not directly start the HTTP server.

---

# index.js

Responsible for starting the application.

Responsibilities:

- Load the Express application.
- Establish required startup connections.
- Start the HTTP server.
- Handle startup configuration.

---

# Request Flow

```text
HTTP Request
     |
     v
Route
     |
     v
Authentication Middleware
     |
     v
Authorization Middleware
     |
     v
Controller
     |
     v
Service
     |
     v
Database
     |
     v
Service
     |
     v
Controller
     |
     v
HTTP Response
```

---

# Authentication, Authorization and Role Provisioning

These are separate concepts.

## Authentication

Answers:

> Who is this user?

Examples:

- Email/password.
- Google OAuth.
- Other identity providers.

## Authorization

Answers:

> What can this authenticated user do?

Implemented using role-based and resource-based checks.

Example:

```text
COORDINATOR
    |
    v
POST /events/10/open-registration
    |
    v
Is coordinator assigned to Event 10?
    |
    +---- YES ---> Allow
    |
    +---- NO ----> 403 Forbidden
```

## Role Provisioning

Answers:

> How did the user receive this role?

Current rules:

```text
Public signup
    |
    v
VOLUNTEER

Admin invitation
    |
    v
COORDINATOR

Pre-created account
    |
    v
ADMIN
```

The frontend cannot grant itself a trusted role.

---

# Coordinator Invitation Flow

```text
ADMIN
  |
  v
POST /coordinators/invite
  |
  v
Generate random token
  |
  v
Store secure token representation
  |
  v
Associate token with email
  |
  v
Set expiry
  |
  v
Send/display invitation
  |
  v
COORDINATOR
  |
  v
POST /auth/coordinator-signup
  |
  v
Validate token
  |
  +---- Invalid/expired/used -> Reject
  |
  v
Check invited email
  |
  v
Create user
  |
  v
role = COORDINATOR
  |
  v
Mark invitation used
```

---

# Routes

Routes define API endpoints and connect them to middleware and controllers.

Routes should not contain significant business logic.

---

# Middleware

Middleware handles cross-cutting concerns:

- Authentication.
- Authorization.
- Request validation.
- Error handling.

---

# Controllers

Controllers are responsible for:

- Reading request data.
- Calling services.
- Returning HTTP responses.

Controllers should remain thin.

---

# Services

Services contain business logic.

Examples:

- Create Coordinator invitation.
- Validate invitation.
- Create Coordinator account.
- Create event.
- Assign coordinator.
- Open registration.
- Register volunteer.
- Check capacity.
- Mark attendance.

---

# Database Layer

Database access should be organized separately from controllers.

The application uses PostgreSQL.

---

# Two-Developer Backend Ownership

## Developer A — Authentication and User Management

```text
auth.routes.js
auth.controller.js
auth.service.js
auth.middleware.js
role.middleware.js
user.model.js
coordinatorInvite.model.js
coordinator.service.js
```

Responsibilities:

- Volunteer signup.
- Coordinator invitation.
- Coordinator signup.
- Login.
- Password hashing.
- JWT.
- Authentication middleware.
- Role authorization.

## Developer B — Events and Registrations

```text
event.routes.js
event.controller.js
event.service.js
registration.routes.js
registration.controller.js
registration.service.js
event.model.js
registration.model.js
attendance.model.js
```

Responsibilities:

- Event CRUD.
- Coordinator assignment.
- Registration.
- Capacity.
- Event state transitions.
- Attendance.

Both developers must follow:

- `api.md`
- `database.md`
- `workflows.md`
- Git conventions.

---

# Frontend Integration

The frontend communicates with the backend only through the API.

```text
React
  |
  | HTTP
  v
Express API
  |
  v
PostgreSQL
```

The frontend must never directly access PostgreSQL.

---

# Deployment

Initial target:

```text
                 Internet
                    |
          +---------+---------+
          |                   |
          v                   v
      Frontend             Backend
      Hosting              Hosting
                               |
                               v
                          PostgreSQL
                            Hosting
```

---

# Design Principles

1. Use a modular monolith.
2. Keep controllers thin.
3. Put business logic in services.
4. Keep database access organized.
5. Enforce authorization on the backend.
6. Treat role provisioning as separate from authentication.
7. Never trust client-provided trusted roles.
8. Use API contracts between frontend and backend.
9. Avoid unnecessary abstractions.
10. Optimize for rapid development and maintainability.
