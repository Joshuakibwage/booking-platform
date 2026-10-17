# Booking Platform

A full-stack appointment booking platform for service-based businesses, built with Next.js, Express, TypeScript, and PostgreSQL.

The goal of this project is to build a reliable booking system that allows businesses to manage their services, staff, availability, and appointments while giving customers a straightforward way to book and manage appointments online.

Beyond the user interface, the project focuses on backend engineering, data integrity, authentication, automated testing, and reliable handling of concurrent booking requests.

## Project Goals

- Build a complete full-stack application with a separately deployed frontend and API.
- Model real-world booking workflows and business rules.
- Prevent double bookings, including when multiple customers attempt to book the same slot simultaneously.
- Handle business time zones and daylight saving time correctly.
- Implement authentication, authorization, and business-level data isolation.
- Use automated testing to verify critical business logic and API behaviour.
- Deploy the application with continuous integration and a public demo.

## Planned Features

### Customer Booking

- Browse a business's public booking page.
- Select a service, staff member, date, and available time slot.
- Submit customer details and create a booking.
- Receive booking confirmation by email.
- Cancel or reschedule appointments through a secure management link.

### Business Dashboard

- Register and configure a business.
- Manage services, staff, and service assignments.
- Configure weekly working hours and time off.
- View and filter bookings.
- Manage booking statuses.
- View appointments in a calendar or list.

### Booking Reliability

- Calculate availability from working hours, service duration, buffers, time off, and existing bookings.
- Support bookings for a specific staff member or any eligible staff member.
- Prevent overlapping bookings at the database level.
- Handle simultaneous booking requests safely.
- Manage pending bookings and their expiration.
- Process payment events safely and avoid duplicate processing.

### Background Processing

- Send booking confirmation emails.
- Schedule appointment reminders.
- Expire pending booking holds.
- Handle asynchronous payment events.

## Technology Stack

| Area | Technology |
|---|---|
| Frontend | Next.js App Router, React, TypeScript |
| Styling | Tailwind CSS |
| Client-side server state | TanStack Query |
| API | Express, TypeScript |
| Validation | Zod |
| Database | PostgreSQL |
| ORM | Prisma |
| Workspace | pnpm workspaces |
| Build orchestration | Turborepo |
| Authentication | Server-side sessions, HTTP-only cookies |
| Date and time | Luxon |
| Background jobs | pg-boss |
| Email | Resend |
| Payments | Stripe in test mode |
| Unit and integration testing | Vitest, Supertest |
| End-to-end testing | Playwright |
| Frontend hosting | Vercel |
| API and worker hosting | Render |
| Database hosting | Neon |
| Continuous integration | GitHub Actions |

## Architecture

The project uses a monorepo to keep related applications and shared code in one repository while allowing each application to be deployed independently.

```text
booking-platform/
├── apps/
│   ├── web/          # Next.js frontend
│   ├── api/          # Express API
│   └── worker/       # Background jobs
├── packages/
│   └── shared/       # Shared Zod schemas and types
├── docs/             # Architecture and specifications
├── DECISIONS.md      # Technical decisions and trade-offs
├── README.md
├── package.json
└── pnpm-workspace.yaml
```

The frontend communicates with the Express API. The API and background worker use PostgreSQL, while pg-boss uses PostgreSQL for job processing.

The frontend, API, and worker run as separate deployed services. Shared validation schemas and types help keep contracts consistent across the frontend and backend.

## Local Development

### Prerequisites

- Node.js
- pnpm
- Git
- Docker with Docker Compose
- A PostgreSQL database, either local or hosted

### Setup

The detailed installation and environment configuration instructions will be added as the application is implemented.

The intended workflow is:

1. Clone the repository.
2. Install dependencies with pnpm.
3. Configure the required environment variables.
4. Start PostgreSQL locally.
5. Apply database migrations and seed development data.
6. Start the frontend and API.
7. Run the automated tests.

Never commit real credentials, API keys, session secrets, or payment secrets to the repository.

## Testing Strategy

Testing will focus on correctness, especially where failures could cause financial or operational problems.

- **Unit tests:** Availability calculations, time-zone conversions, booking rules, and status transitions.
- **API integration tests:** Authentication, authorization, validation, database operations, and error responses.
- **Concurrency tests:** Verify that simultaneous requests cannot create overlapping bookings for the same staff member.
- **End-to-end tests:** Verify complete customer booking and cancellation workflows.
- **Continuous integration:** Run linting, type checks, tests, and other required checks before changes are considered ready.

## Project Scope

The initial release focuses on a single-location booking workflow for service-based businesses, with multiple staff members and services.

The following are explicitly out of scope for the initial release:

- Google Calendar synchronization
- SMS notifications
- Recurring appointments
- Multiple locations per business
- A native mobile application

Additional features may be considered after the core booking workflow is reliable.

## Project Status

**Status:** In development

This project is being built as a practical full-stack engineering exercise, with an emphasis on understanding the implementation rather than simply assembling a working interface.

## License

No open-source license has been selected yet.