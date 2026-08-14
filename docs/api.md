# API Contract

## Base URL

Development:

```text
http://localhost:5000/api
```

Production URL will be added after deployment.

---

# Authentication

Protected requests use:

```http
Authorization: Bearer <access_token>
```

---

# 1. Volunteer Signup

## POST `/auth/signup`

Creates a Volunteer account.

The client does **not** provide a role.

## Request

```json
{
  "name": "Example User",
  "email": "user@example.com",
  "password": "password"
}
```

## Backend Behavior

The backend always creates:

```text
role = VOLUNTEER
```

## Response

```json
{
  "message": "Account created successfully"
}
```

## Status Codes

```text
201 Created
400 Bad Request
409 Conflict
```

---

# 2. Coordinator Invitation

## POST `/coordinators/invite`

**Role:** ADMIN

Creates an invitation for a Coordinator.

## Request

```json
{
  "email": "coordinator@example.com"
}
```

## Backend Behavior

1. Validate Admin authorization.
2. Generate a cryptographically random token.
3. Associate the invitation with the email.
4. Set an expiration time.
5. Store the secure token representation.
6. Return/display the invitation through the configured delivery mechanism.

## Example Response

For the MVP, the invitation can be returned to the Admin UI:

```json
{
  "message": "Coordinator invitation created",
  "inviteCode": "ABC-739-XQ",
  "expiresAt": "2026-08-15T12:00:00Z"
}
```

In a production implementation, the raw invitation token should preferably be delivered through a secure invitation link/email rather than exposed in a general API response.

## Status Codes

```text
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
409 Conflict
```

---

# 3. Coordinator Signup

## POST `/auth/coordinator-signup`

Creates a Coordinator account using an Admin-issued invitation.

## Request

```json
{
  "inviteCode": "ABC-739-XQ",
  "name": "Rahul",
  "email": "rahul@example.com",
  "password": "password"
}
```

## Backend Validation

The backend must verify:

1. Invitation exists.
2. Invitation is not expired.
3. Invitation has not been used.
4. Submitted email matches invited email.
5. Email is not already registered.
6. Password satisfies requirements.

If all checks pass:

```text
role = COORDINATOR
```

The invitation is then marked as used.

## Response

```json
{
  "message": "Coordinator account created successfully"
}
```

## Status Codes

```text
201 Created
400 Bad Request
401 Unauthorized
409 Conflict
```

---

# 4. Login

## POST `/auth/login`

All users.

## Request

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

## Response

```json
{
  "accessToken": "<token>",
  "user": {
    "id": 1,
    "name": "Example User",
    "role": "VOLUNTEER"
  }
}
```

## Status Codes

```text
200 OK
400 Bad Request
401 Unauthorized
```

---

# 5. Current User

## GET `/auth/me`

Requires authentication.

## Response

```json
{
  "id": 1,
  "name": "Example User",
  "email": "user@example.com",
  "role": "VOLUNTEER"
}
```

---

# 6. List Events

## GET `/events`

Returns events visible to the current user.

Volunteers should primarily see events available for registration.

## Response

```json
[
  {
    "id": 1,
    "title": "Community Camp",
    "location": "Gwalior",
    "start_time": "2026-08-25T10:00:00Z",
    "required_volunteers": 20,
    "registered_count": 12,
    "status": "OPEN"
  }
]
```

## Status Codes

```text
200 OK
```

---

# 7. Get Event

## GET `/events/:id`

Returns details for one event.

## Status Codes

```text
200 OK
404 Not Found
```

---

# 8. Create Event

## POST `/events`

**Role:** ADMIN

## Request

```json
{
  "title": "Community Camp",
  "description": "Community support event",
  "location": "Gwalior",
  "start_time": "2026-08-25T10:00:00Z",
  "end_time": "2026-08-25T16:00:00Z",
  "required_volunteers": 20
}
```

## Response

```json
{
  "id": 1,
  "title": "Community Camp",
  "status": "DRAFT"
}
```

## Status Codes

```text
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
```

---

# 9. Update Event

## PATCH `/events/:id`

**Role:** ADMIN

Coordinator access depends on the final permission rules.

## Example Request

```json
{
  "title": "Updated Community Camp",
  "required_volunteers": 25
}
```

## Status Codes

```text
200 OK
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
```

---

# 10. Assign Coordinator

## PATCH `/events/:id/coordinator`

**Role:** ADMIN

## Request

```json
{
  "coordinator_id": 42
}
```

The specified user must have role `COORDINATOR`.

---

# 11. List Coordinators

## GET `/coordinators`

**Role:** ADMIN

Returns Coordinator accounts available for event assignment.

---

# 12. Register for Event

## POST `/events/:id/register`

**Role:** VOLUNTEER

No request body is required.

The volunteer is identified from the authentication token.

## Response

```json
{
  "message": "Registration successful",
  "registration_id": 1042,
  "status": "REGISTERED"
}
```

## Status Codes

```text
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
```

Possible conflict cases:

- Already registered.
- Event capacity reached.

---

# 13. Unregister

## DELETE `/events/:id/register`

**Role:** VOLUNTEER

## Response

```json
{
  "message": "Registration cancelled"
}
```

---

# 14. My Registrations

## GET `/me/registrations`

**Role:** VOLUNTEER

## Response

```json
[
  {
    "registration_id": 1042,
    "event_id": 1,
    "event_title": "Community Camp",
    "status": "REGISTERED"
  }
]
```

---

# 15. Event Registrations

## GET `/events/:id/registrations`

**Role:** COORDINATOR assigned to the event or ADMIN.

## Response

```json
[
  {
    "registration_id": 1042,
    "volunteer_id": 12,
    "volunteer_name": "Example User",
    "status": "REGISTERED"
  }
]
```

---

# 16. Open Registration

## POST `/events/:id/open-registration`

**Role:** COORDINATOR assigned to event or ADMIN.

## Response

```json
{
  "message": "Registration opened",
  "status": "OPEN"
}
```

---

# 17. Close Registration

## POST `/events/:id/close-registration`

**Role:** COORDINATOR assigned to event or ADMIN.

## Response

```json
{
  "message": "Registration closed",
  "status": "CLOSED"
}
```

---

# 18. Mark Attendance

## POST `/registrations/:id/attendance`

**Role:** COORDINATOR assigned to the registration's event or ADMIN.

## Request

```json
{
  "status": "PRESENT"
}
```

Allowed values:

```text
PRESENT
ABSENT
```

---

# 19. Volunteer Attendance History

## GET `/me/attendance`

**Role:** VOLUNTEER

Returns the volunteer's participation history.

---

# 20. Admin Analytics

## GET `/analytics`

**Role:** ADMIN

## Response

```json
{
  "total_events": 10,
  "open_events": 3,
  "completed_events": 5,
  "total_volunteers": 250,
  "total_registrations": 670,
  "attendance_count": 520
}
```

---

# 21. Event Analytics

## GET `/events/:id/analytics`

**Role:** COORDINATOR assigned to event or ADMIN.

## Response

```json
{
  "required": 50,
  "registered": 42,
  "remaining": 8,
  "attendance": 38
}
```

---

# Authorization Summary

| Endpoint | Admin | Coordinator | Volunteer |
|---|---:|---:|---:|
| POST `/auth/signup` | No | No | Yes |
| POST `/auth/coordinator-signup` | No | No | No |
| POST `/coordinators/invite` | Yes | No | No |
| POST `/auth/login` | Yes | Yes | Yes |
| GET `/auth/me` | Yes | Yes | Yes |
| GET `/events` | Yes | Yes | Yes |
| GET `/events/:id` | Yes | Yes | Yes |
| POST `/events` | Yes | No | No |
| PATCH `/events/:id` | Yes | Assigned* | No |
| DELETE `/events/:id` | Yes | No | No |
| GET `/coordinators` | Yes | No | No |
| PATCH `/events/:id/coordinator` | Yes | No | No |
| POST `/events/:id/register` | No | No | Yes |
| DELETE `/events/:id/register` | No | No | Yes |
| GET `/me/registrations` | No | No | Yes |
| GET `/events/:id/registrations` | Yes | Assigned* | No |
| Open registration | Yes | Assigned* | No |
| Close registration | Yes | Assigned* | No |
| Mark attendance | Yes | Assigned* | No |
| GET `/me/attendance` | No | No | Yes |
| GET `/analytics` | Yes | No | No |
| GET `/events/:id/analytics` | Yes | Assigned* | No |

`Assigned*` means the coordinator must be assigned to that specific event.

---

# API Design Rules

1. Protected endpoints require authentication.
2. Authorization is enforced by the backend.
3. Public signup never accepts a trusted role from the client.
4. Coordinator provisioning requires a valid Admin-issued invitation.
5. Invitation tokens must be single-use and expire.
6. API responses use JSON.
7. Errors use appropriate HTTP status codes.
8. Request validation happens before database operations.
9. Sensitive information is never returned unnecessarily.
10. API changes must update this document.
11. Frontend developers use this document as the API contract.
