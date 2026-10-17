# Technical Decisions

This document records the architectural and technical decisions for the Booking Platform, including the reasoning behind each choice and the trade-offs accepted.

The purpose is to keep the implementation consistent, reduce unnecessary tool switching, and make important engineering decisions explicit.

## 1. Repository and Workspace

**Decision:** Use a monorepo managed with pnpm workspaces and Turborepo.

**Structure:**
- `apps/web`: Next.js frontend
- `apps/api`: Express API
- `apps/worker`: Background job worker
- `packages/shared`: Shared Zod schemas and TypeScript types

**Reasoning:**

The frontend, API, worker, and shared contracts belong to the same product. Keeping them in one repository makes coordinated changes easier and allows shared code to be versioned alongside its consumers.

pnpm manages dependencies and workspace relationships. Turborepo coordinates tasks such as building, testing, and linting across packages.

**Trade-off:** The repository requires workspace configuration and careful task management. Deployment configuration must also account for applications living inside subdirectories.

## 2. Separate Frontend and API

**Decision:** Use Next.js for the frontend and Express for a separately deployed API.

**Reasoning:**

The frontend and backend have distinct responsibilities. Next.js handles the application interface, while Express provides an explicit API boundary for authentication, validation, business rules, and database operations.

This separation also provides an opportunity to practise API design, backend testing, and independent deployment.

**Trade-off:** The system requires additional configuration for CORS, authentication cookies, API URLs, and deployment environments. A separate API is not inherently more scalable than a single application, but it supports the learning goals of this project.

## 3. PostgreSQL and Prisma

**Decision:** Use PostgreSQL as the primary database and Prisma for normal database access.

**Reasoning:**

The booking domain contains related entities such as businesses, memberships, staff, services, working hours, customers, and bookings. PostgreSQL provides relational integrity and transactional operations suited to these relationships.

Prisma provides typed database access and migrations for the normal application schema.

Use raw SQL migrations when a required PostgreSQL feature cannot be expressed adequately through Prisma's schema or migration abstractions.

**Trade-off:** Some database-specific features require SQL knowledge and explicit migration management. This is intentional because understanding database constraints is a core learning objective.

## 4. Preventing Double Bookings

**Decision:** Enforce booking-overlap protection in PostgreSQL, backed by transactional application logic and concurrency tests.

**Reasoning:**

Checking availability in application code is not sufficient by itself. Two requests can observe the same slot as available before either request creates its booking.

The design will use a PostgreSQL exclusion constraint with range-overlap semantics, supported by `btree_gist` where needed, to prevent conflicting active booking intervals for the same staff member.

The protected interval will account for the applicable booking buffer through a clearly defined range representation.

Booking creation will use a database transaction and return a suitable conflict response when the requested interval is no longer available.

**Trade-off:** The constraint and migration require PostgreSQL-specific SQL. The exact representation of pending, confirmed, cancelled, and expired bookings must be designed carefully so that only the appropriate booking states block availability.

**Verification:** Automated tests must include simultaneous requests attempting to reserve the same staff member's time slot. Exactly one conflicting booking should succeed.

## 5. Shared Validation with Zod

**Decision:** Define reusable Zod schemas in `packages/shared`.

**Reasoning:**

The frontend and API need consistent definitions for request payloads and other shared data contracts. Shared schemas reduce duplication and help prevent the frontend from submitting data that the backend does not expect.

The API remains responsible for validating incoming requests. Frontend validation improves usability but is not a security boundary.

**Trade-off:** Shared packages must avoid importing browser-only code into the backend or server-only code into the frontend. Shared contracts should represent genuine boundaries rather than become a dumping ground for unrelated utilities.

## 6. Authentication and Sessions

**Decision:** Use server-side sessions stored in PostgreSQL and deliver session identifiers through HTTP-only cookies.

**Reasoning:**

Server-side sessions can be revoked and centrally invalidated. HTTP-only cookies prevent ordinary client-side JavaScript from reading the session identifier.

Passwords will be hashed with Argon2 or bcrypt. Authorization checks will distinguish business owners from staff and verify that users can only access data belonging to the appropriate business.

**Trade-off:** Session storage, cookie settings, CSRF protection, session expiry, and cross-origin deployment require deliberate configuration. HTTP-only cookies alone do not prevent every form of session abuse.

## 7. Time Zones and Availability

**Decision:** Use Luxon for time-zone-aware date and time calculations, and store appointment instants in UTC.

**Reasoning:**

Businesses operate in local time zones, while persisted appointment instants need a consistent representation. Availability must account for working hours, service duration, buffers, time off, existing bookings, and daylight saving time where applicable.

The business's time-zone identifier will be stored explicitly. Local working hours will be interpreted in that zone before being converted into UTC instants.

**Trade-off:** UTC storage does not eliminate time-zone complexity. Daylight saving transitions, ambiguous local times, nonexistent local times, and changes to time-zone rules require explicit handling and tests.

## 8. Background Jobs

**Decision:** Use pg-boss for background job processing.

**Reasoning:**

The project needs asynchronous email delivery, appointment reminders, and expiration of pending booking holds. pg-boss uses PostgreSQL as its job store, avoiding the need to introduce Redis solely for the initial job queue.

**Trade-off:** Jobs can be retried or delivered more than once. Job handlers must be designed to tolerate retries, and scheduled jobs must be cancelled or reconciled when their associated bookings change.

## 9. Email and Payments

**Decision:** Use Resend for email and Stripe in test mode for payments.

**Reasoning:**

Resend will handle booking confirmations and reminders. Stripe's test environment allows payment workflows and failure cases to be implemented without processing real payments.

Payment events will be verified and handled idempotently. A unique event identifier will be recorded so that replaying the same webhook does not repeat its business effects.

**Trade-off:** External services introduce network failures, delayed events, configuration requirements, and provider-specific behaviour. Payment status must be determined from verified server-side events rather than trusting a frontend redirect.

## 10. Testing

**Decision:** Use Vitest, Supertest, and Playwright.

**Responsibilities:**
- Vitest: unit tests and application-level tests.
- Supertest: Express API integration tests.
- Playwright: end-to-end browser tests.

**Reasoning:**

The most important business rules should be tested independently of the interface. API integration tests will verify database and authentication behaviour, while end-to-end tests will cover complete customer workflows.

**Trade-off:** Automated tests require fixtures, test database management, and maintenance. Critical business rules will receive more attention than superficial implementation details.

## 11. Deployment and Continuous Integration

**Decision:** Deploy the web application to Vercel, the API and worker to Render, and PostgreSQL to Neon. Use GitHub Actions for continuous integration.

**Reasoning:**

This setup separates the main runtime responsibilities and provides a practical path to a public demo without managing an entire server infrastructure.

Continuous integration will run the relevant linting, type-checking, unit tests, API integration tests, and end-to-end tests.

**Trade-off:** Separate providers introduce environment configuration, service connectivity, deployment ordering, and operational dependencies. The production cookie and CORS configuration must match the chosen hostnames.

## 12. Explicitly Out of Scope

The initial release will not include:
- Google Calendar synchronization
- SMS notifications
- Recurring appointments
- Multiple locations per business
- A native mobile application

These features will be reconsidered only after the core booking workflow, availability calculations, and double-booking protections are reliable.

## 13. Decision Review

A decision may be changed when implementation evidence reveals a concrete problem, a requirement changes, or a meaningful alternative offers a clear benefit.

Before changing an established decision:
1. Describe the problem with the current approach.
2. Identify the alternative and its costs.
3. Explain the expected benefit.
4. Update this document when the change is accepted.

Tool popularity alone is not sufficient reason to change the stack.