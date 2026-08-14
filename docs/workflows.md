# Workflows

## System Roles

The system currently has three roles:

- ADMIN
- COORDINATOR
- VOLUNTEER

---

# 1. Volunteer Signup

**Actor:** Volunteer

## Goal

Create a volunteer account through public signup.

## Flow

1. User opens the signup page.
2. User enters name, email, and password.
3. User submits the public signup form.
4. Backend validates the information.
5. Backend checks whether the email already exists.
6. Password is securely hashed.
7. User account is created with role `VOLUNTEER`.
8. User can log in.

## Business Rules

- Public signup always creates a `VOLUNTEER`.
- The client must not be allowed to choose an arbitrary role.
- Email must be unique.
- Password must satisfy minimum security requirements.
- Public signup cannot create `COORDINATOR` or `ADMIN` accounts.

---

# 2. Coordinator Invitation

**Actor:** Admin

## Goal

Authorize a trusted person to create a Coordinator account.

## Flow

1. Admin opens Coordinator management.
2. Admin enters the coordinator's email.
3. Backend generates a cryptographically random invitation token/code.
4. Backend stores a secure representation of the invitation.
5. Invitation is associated with the invited email.
6. Invitation receives an expiration time.
7. Admin shares/sends the invitation to the coordinator.

## Invitation Properties

- Single-use.
- Expiring.
- Associated with a specific email.
- Cannot be used after being consumed.
- Cannot be used to create an Admin account.

For the CFG MVP, the invitation can initially be displayed to the Admin instead of integrating an email service.

---

# 3. Coordinator Signup Using Invitation

**Actor:** Coordinator

## Goal

Create a Coordinator account using an Admin-issued invitation.

## Flow

1. Coordinator opens the coordinator registration page.
2. Coordinator enters the invitation code/token.
3. Coordinator enters name, email, and password.
4. Backend validates the invitation.
5. Backend verifies that the invitation has not expired.
6. Backend verifies that it has not already been used.
7. Backend verifies that the submitted email matches the invited email.
8. Password is securely hashed.
9. User account is created with role `COORDINATOR`.
10. Invitation is marked as used.
11. Coordinator can log in.

## Security Rules

The backend determines the role.

The client never sends:

```text
role = COORDINATOR
```

as a trusted value.

The invitation is the authorization mechanism for Coordinator provisioning.

---

# 4. Login

**Actor:** Admin / Coordinator / Volunteer

## Flow

1. User enters email and password.
2. Backend validates credentials.
3. Backend identifies the user.
4. Backend generates an authentication token.
5. Token is returned to the client.
6. Client uses the token for protected requests.

## Important Distinction

Authentication answers:

> Who is this user?

Authorization answers:

> What can this user do?

Role provisioning answers:

> How did this user receive their role?

---

# 5. Admin Creates Event

**Actor:** Admin

## Goal

Create an event that can later be opened for volunteer registration.

## Flow

1. Admin opens event management.
2. Admin enters event information.
3. Admin specifies the number of volunteers required.
4. Admin submits the event.
5. Backend validates the data.
6. Event is created with status `DRAFT`.

## Required Information

- Title
- Description
- Location
- Start time
- End time
- Required volunteer count

## Business Rules

- Only Admin can create events.
- Required volunteer count must be greater than zero.
- End time must be after start time.
- New events start in `DRAFT` state.

---

# 6. Admin Assigns Coordinator

**Actor:** Admin

## Flow

1. Admin selects an event.
2. Admin selects a Coordinator.
3. Backend verifies that the user has role `COORDINATOR`.
4. Coordinator is assigned to the event.

## Business Rules

- Only Admin can assign coordinators.
- MVP supports one coordinator per event.
- A coordinator may manage multiple events.

---

# 7. Coordinator Configures Event

**Actor:** Coordinator

## Goal

Prepare an assigned event for volunteer registration.

## Flow

1. Coordinator logs in.
2. Coordinator views assigned events.
3. Coordinator selects an event.
4. Backend verifies assignment.
5. Coordinator configures permitted event settings.
6. Coordinator opens registration.

## Business Rules

- Coordinator can only manage events assigned to them.
- Coordinator cannot manage another coordinator's event.
- Admin retains system-wide control.

---

# 8. Coordinator Opens Registration

**Actor:** Coordinator

## Flow

1. Coordinator selects an assigned event.
2. Coordinator chooses "Open Registration".
3. Backend verifies authorization.
4. Backend verifies that the event can accept registrations.
5. Event status changes to `OPEN`.

## Business Rules

Registration can only be opened if:

- Event exists.
- Coordinator is assigned to the event.
- Event is not cancelled.
- Event has valid capacity.
- Event has not already completed.

---

# 9. Volunteer Views Events

**Actor:** Volunteer

## Flow

1. Volunteer logs in.
2. Volunteer requests available events.
3. Backend returns events available for registration.
4. Volunteer selects an event.
5. Volunteer views event details.

## Volunteer should see

- Event title
- Description
- Location
- Date/time
- Coordinator
- Required volunteers
- Current registrations
- Remaining capacity
- Registration status

---

# 10. Volunteer Registers

**Actor:** Volunteer

## Flow

1. Volunteer selects an event.
2. Volunteer clicks Register.
3. Backend authenticates the volunteer.
4. Backend checks that the event exists.
5. Backend checks registration status.
6. Backend checks whether the volunteer is already registered.
7. Backend checks available capacity.
8. Registration is created.
9. Volunteer receives confirmation.

## Business Rules

Volunteer cannot register if:

- Event does not exist.
- Registration is closed.
- Event is cancelled.
- Event is completed.
- Volunteer is already registered.
- Event has reached capacity.

---

# 11. Volunteer Unregisters

**Actor:** Volunteer

## Flow

1. Volunteer views registered events.
2. Volunteer selects an event.
3. Volunteer chooses to unregister.
4. Backend verifies the registration.
5. Registration status becomes `CANCELLED`.

Registration history should be preserved.

---

# 12. Coordinator Views Registrations

**Actor:** Coordinator

## Flow

1. Coordinator selects an assigned event.
2. Backend verifies coordinator assignment.
3. Backend retrieves registrations.
4. Coordinator sees registered volunteers.

A coordinator can only view registrations for events assigned to them.

---

# 13. Coordinator Closes Registration

**Actor:** Coordinator

## Flow

1. Coordinator selects an assigned event.
2. Coordinator chooses "Close Registration".
3. Backend verifies authorization.
4. Event status changes to `CLOSED`.

New volunteer registrations are rejected.

Existing registrations remain valid.

---

# 14. Attendance

**Actor:** Coordinator

## Flow

1. Event takes place.
2. Coordinator views registered volunteers.
3. Coordinator marks attendance.
4. Attendance record is stored.
5. Volunteer can later view participation history.

## Possible States

- PRESENT
- ABSENT

---

# 15. Event Completion

**Actor:** Coordinator / Admin

## Flow

1. Event takes place.
2. Attendance is finalized.
3. Event status changes to `COMPLETED`.
4. New registrations are rejected.
5. Participation information becomes historical data.

---

# 16. Admin Analytics

**Actor:** Admin

## Initial Metrics

- Total events
- Open events
- Closed events
- Completed events
- Total volunteers
- Total registrations
- Attendance count
- Participation rate

Analytics should initially be read-only.

---

# Event State Flow

```text
DRAFT
  |
  v
OPEN
  |
  v
CLOSED
  |
  v
COMPLETED
```

An event may also be cancelled:

```text
DRAFT  -> CANCELLED
OPEN   -> CANCELLED
CLOSED -> CANCELLED
```

---

# Coordinator Provisioning Flow

```text
ADMIN
  |
  v
Create Coordinator Invite
  |
  v
Random single-use token
  |
  v
Share invite
  |
  v
Coordinator Signup
  |
  v
Backend validates token
  |
  +---- Invalid/expired/used -> Reject
  |
  v
Create COORDINATOR account
```

---

# Core System Rules

1. Only Admin can create events.
2. Only Admin can create Coordinator invitations.
3. Only valid Coordinator invitations can provision Coordinator accounts.
4. Public signup always creates a Volunteer account.
5. Public signup cannot create Coordinator or Admin accounts.
6. A coordinator can manage only assigned events.
7. Volunteers can register only for `OPEN` events.
8. A volunteer cannot have duplicate active registrations for the same event.
9. Event capacity cannot be exceeded.
10. Cancelled/completed events cannot accept registrations.
11. Admin has system-wide visibility.
12. Registration history should be preserved.
13. Authorization must be enforced by the backend.
14. Coordinator invitation tokens must be single-use and expire.
15. The backend, not the frontend, determines trusted roles.
