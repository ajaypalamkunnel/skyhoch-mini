# Skyhoch Mini Assessment Repository

A modular, production-oriented mini-application implementing core educational platform mechanics: **JWT authentication with httpOnly cookie sessions**, **role-based access control (RBAC)**, **out-of-order/overlapping attendance interval calculations**, **PostgreSQL database schema with Prisma 7 migrations**, **server-authenticated Next.js student dashboard**, and **elevated admin course inspection**.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Assessment Requirements Mapping](#2-assessment-requirements-mapping)
3. [Implemented Scope vs. Future Production Architecture](#3-implemented-scope-vs-future-production-architecture)
4. [Tech Stack](#4-tech-stack)
5. [Backend Architecture](#5-backend-architecture)
6. [Project Structure](#6-project-structure)
7. [Prerequisites](#7-prerequisites)
8. [Clone Repository](#8-clone-repository)
9. [PostgreSQL & Docker Setup](#9-postgresql--docker-setup)
10. [Environment Variables](#10-environment-variables)
11. [Database Migrations (Prisma 7)](#11-database-migrations-prisma-7)
12. [Database Seeding](#12-database-seeding)
13. [Seeded Demo Data & Test Accounts](#13-seeded-demo-data--test-accounts)
14. [Backend Setup & Execution](#14-backend-setup--execution)
15. [Frontend Setup & Execution](#15-frontend-setup--execution)
16. [Step-by-Step Running Guide](#16-step-by-step-running-guide)
17. [Application URLs (Local & Production)](#17-application-urls-local--production)
18. [Authentication & Session Lifecycle](#18-authentication--session-lifecycle)
19. [JWT Design & Security Architecture](#19-jwt-design--security-architecture)
20. [Role-Based Access Control (RBAC)](#20-role-based-access-control-rbac)
21. [Complete API Endpoints Reference](#21-complete-api-endpoints-reference)
22. [Course Authorization & IDOR / BOLA Prevention](#22-course-authorization--idor--bola-prevention)
23. [Admin Course Management](#23-admin-course-management)
24. [Attendance Data Model](#24-attendance-data-model)
25. [Attendance Calculation Engine & Interval Resolution](#25-attendance-calculation-engine--interval-resolution)
26. [Attendance Threshold & Formula](#26-attendance-threshold--formula)
27. [Attendance Edge Cases & Worked Examples](#27-attendance-edge-cases--worked-examples)
28. [Attendance Automated Unit Tests](#28-attendance-automated-unit-tests)
29. [Next.js Server-Side Authentication & Session Forwarding](#29-nextjs-server-side-authentication--session-forwarding)
30. [Student Dashboard & Course Workflow](#30-student-dashboard--course-workflow)
31. [Live Class Experience & Scheduling](#31-live-class-experience--scheduling)
32. [Attendance Simulation & Interactive Component](#32-attendance-simulation--interactive-component)
33. [Responsive & Mobile-Friendly UI](#33-responsive--mobile-friendly-ui)
34. [Manual End-to-End Testing Guide](#34-manual-end-to-end-testing-guide)
35. [Architecture Question 1: Webhook Discrepancy & Out-of-Order Events](#35-architecture-question-1-webhook-discrepancy--out-of-order-events)
36. [Architecture Question 2: Bunny Stream Signed URL Security & Scraping Prevention](#36-architecture-question-2-bunny-stream-signed-url-security--scraping-prevention)
37. [Production Architecture & Deployment Guide](#37-production-architecture--deployment-guide)
38. [Development & Operations Commands Reference](#38-development--operations-commands-reference)
39. [Troubleshooting Guide](#39-troubleshooting-guide)
40. [Submission & Deployment Verification Checklist](#40-submission--deployment-verification-checklist)

---

## 1. Project Overview

The **Skyhoch Mini Repository** (`skyhoch-mini`) is a dedicated technical assessment implementation built to demonstrate end-to-end engineering excellence across backend API design, database modeling, algorithmic calculation, security posture, and full-stack integration using **Next.js (App Router)**, **Express (TypeScript)**, and **PostgreSQL (Prisma 7)**.

### Core Capabilities Demonstrated
- **Stateful JWT Session Handling**: Stored in `httpOnly`, `SameSite=Lax` cookies with server-side refresh rotation and Argon2-hashed database token storage.
- **Strict RBAC Enforcement**: Role checking via Express middleware (`STUDENT`, `TUTOR`, `DEPARTMENT_HEAD`, `SUPER_ADMIN`).
- **Deterministic Attendance Engine**: Robust interval algebra merging multi-tab/multi-device overlaps, clamping to class boundaries, handling missing `LEAVE` events, out-of-order signals, and evaluating the 70% attendance threshold.
- **Prisma 7 Multi-File Schema & Version-Controlled Migrations**: Clean modular schema definitions with automated migration pipelines.
- **SSR Server Authentication**: Next.js Server Components verifying sessions server-to-server with Express via forwarded cookies.
- **Zero-IDOR Security**: Strict database-level ownership and enrollment queries derived solely from cryptographically verified token identities.

> [!NOTE]
> **Database & Container Naming Convention:**  
> The PostgreSQL database name is intentionally configured as `skyhoc` and the Docker container is named `skyhoc-postgres`. The application connection string uses `postgresql://postgres:postgres@localhost:5433/skyhoc` (connecting from host machine via forwarded port `5433`). The product brand is **Skyhoch**.

---

## 2. Assessment Requirements Mapping

| Assessment Requirement | Implementation Details | Verified Source File Path |
|---|---|---|
| **1. Authentication & RBAC** | JWT Access (15m) + Refresh (7d) in `httpOnly` cookies, Argon2 password/session hashing, role middleware | [`skyhoch-mini/api/src/modules/auth/`](api/src/modules/auth/)<br>[`skyhoch-mini/api/src/middleware/auth.middleware.ts`](api/src/middleware/auth.middleware.ts)<br>[`skyhoch-mini/api/src/middleware/rbac.middleware.ts`](api/src/middleware/rbac.middleware.ts) |
| **2. Attendance Interval Calculation** | `AttendanceCalculatorService` resolves out-of-order events, multi-tab overlapping intervals, clamps boundaries, auto-closes missing LEAVEs, calculates minutes and 70% threshold | [`skyhoch-mini/api/src/modules/attendance/services/attendance-calculator.service.ts`](api/src/modules/attendance/services/attendance-calculator.service.ts) |
| **3. Automated Attendance Unit Tests** | 26 Vitest unit tests covering single/multiple intervals, duplicates, overlapping times, boundary clamping, missing LEAVEs, unmatched LEAVEs | [`skyhoch-mini/api/src/modules/attendance/__tests__/attendance-calculator.service.spec.ts`](api/src/modules/attendance/__tests__/attendance-calculator.service.spec.ts) |
| **4. PostgreSQL Schema & Migrations** | Prisma 7 multi-file schema models, 10 version-controlled migrations, relational foreign keys, cascades, composite indexes | [`skyhoch-mini/api/prisma/models/`](api/prisma/models/)<br>[`skyhoch-mini/api/prisma/migrations/`](api/prisma/migrations/) |
| **5. Elevated Admin Course Access** | `GET /api/admin/courses` restricted to `DEPARTMENT_HEAD` and `SUPER_ADMIN` with search, sorting, and status filtering | [`skyhoch-mini/api/src/modules/courses/routes/admin-course.routes.ts`](api/src/modules/courses/routes/admin-course.routes.ts)<br>[`skyhoch-mini/api/src/modules/courses/controller/admin-course.controller.ts`](api/src/modules/courses/controller/admin-course.controller.ts) |
| **6. Student Dashboard** | Next.js Server Components fetching enrolled courses and upcoming live classes; unauthenticated redirect | [`skyhoch-mini/client/src/app/(protected)/dashboard/student/page.tsx`](client/src/app/(protected)/dashboard/student/page.tsx) |
| **7. Server-Side Cookie Auth** | React `cache`-wrapped `getCurrentUser()` reading `httpOnly` cookie and calling `GET /api/auth/me`; Next.js middleware token refresh | [`skyhoch-mini/client/src/lib/auth/server-auth.ts`](client/src/lib/auth/server-auth.ts)<br>[`skyhoch-mini/client/src/middleware.ts`](client/src/middleware.ts) |
| **8. Interactive UI Component** | Client-side Attendance Simulation studio with dynamic interval addition, time validation, event submission, real-time calculation, and state reset | [`skyhoch-mini/client/src/features/attendance/components/attendance-simulation.tsx`](client/src/features/attendance/components/attendance-simulation.tsx) |
| **9. Responsive / Mobile UI** | Tailwind CSS responsive grids, sliding mobile navigation, collapsible cards, and touch-optimized input controls | [`skyhoch-mini/client/src/features/dashboard/components/dashboard-header.tsx`](client/src/features/dashboard/components/dashboard-header.tsx) |
| **10. Webhook & Security Architecture** | Written architectural breakdowns answering out-of-order webhook reconciliation and Bunny Stream signed URL protection | Documented in Sections 35 & 36 of this README |

---

## 3. Implemented Scope vs. Future Production Architecture

| Feature Domain | Implemented in Mini Repository | Planned Target Production Architecture |
|---|---|---|
| **Authentication** | JWT in `httpOnly` cookies, Argon2 password & refresh token hashing, session rotation, server-side logout revocation. | Biometric MFA / Passkeys, Redis session store, device fingerprinting, brute-force adaptive IP rate limiting. |
| **RBAC Authorization** | Role check middleware (`STUDENT`, `TUTOR`, `DEPARTMENT_HEAD`, `SUPER_ADMIN`), API boundary checks. | Fine-grained ABAC / CASL permission matrices, departmental sub-scopes, multi-tenant organization isolation. |
| **Course & Enrollment Management** | Student course queries, strict enrollment scoping, IDOR-protected course detail lookups (Enrollments are pre-seeded). | Self-service checkout / cart, automated payment-triggered enrollment workflows, batch student enrollment management. |
| **Live Classes** | Filtered class queries (`upcoming` vs `completed`), scheduled sorting, course scoping (Classes are pre-seeded). | LiveKit WebRTC room creation, dynamic token issuance, automated room recording, tutor scheduling engine. |
| **Attendance Ingestion** | REST endpoints (`POST /events`, `POST /calculate`, `DELETE`), client simulation studio. | LiveKit room webhook ingestion service, webhook signature verification, BullMQ background worker calculation. |
| **Media & Video Delivery** | Mock live-class metadata and simulation pages. | Bunny Stream signed expiring playback URLs, dynamic user watermarking, Cloudflare R2 lesson storage. |
| **Payments** | *Out of scope for mini assessment*. | Razorpay checkout integration, signed webhook idempotency handler, automated invoice generation. |
| **Asynchronous Jobs** | Synchronous execution for API requests. | BullMQ / Redis queues for video transcoding, certificate PDF generation, email notifications, daily attendance audits. |

---

## 4. Tech Stack

### Frontend (`client/`)
- **Framework**: [Next.js 16.4.0](https://nextjs.org/) (App Router, Server Components & Client Components)
- **UI Library**: [React 19.3.0](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand 5.0.15](https://zustand-demo.pmnd.rs/) (where client global state is required)
- **Language**: [TypeScript 5.x](https://www.typescriptlang.org/)

### Backend (`api/`)
- **Runtime & Framework**: [Node.js](https://nodejs.org/) & [Express 5.2.1](https://expressjs.com/)
- **Database & ORM**: [PostgreSQL 17](https://www.postgresql.org/) & [Prisma ORM 7.10.0](https://www.prisma.io/) (via `@prisma/adapter-pg` & `pg 8.23.1`)
- **Security & Cryptography**:
  - `argon2 0.45.1` (Password hashing & refresh token storage hashing)
  - `jsonwebtoken 9.0.3` (Access & Refresh JWT issuance and verification)
  - `helmet 8.3.0` (HTTP security headers)
  - `cors 2.8.6` (Credentialed CORS enforcement)
  - `cookie-parser 1.4.7` (Cookie parsing)
- **Schema Validation**: [Zod 4.6.5](https://zod.dev/)
- **Development Tooling**: `tsx 4.23.15` (TypeScript watch execution), `typescript 7.0.2`
- **Testing Engine**: [Vitest 5.0.3](https://vitest.dev/)

### Infrastructure & Containerization
- **Container**: Docker Compose (`docker-compose.yml`)
- **Image**: `postgres:17-alpine`
- **Port Mapping**: Host `5433` $\rightarrow$ Container `5432`

---

## 5. Backend Architecture

The backend adopts a **clean, decoupled, layered Modular Monolith architecture** that enforces strict boundary isolation and dependency inversion:

```mermaid
graph TD
    Client[HTTP Client / Next.js] -->|HTTP Request with Cookies| Middleware[Middleware Layer<br>Auth, RBAC, Helmet, CORS, Logger]
    Middleware --> Controller[Controller Layer<br>Request Parsing, DTO Validation via Zod]
    Controller --> ServiceInterface[Service Interface]
    ServiceInterface --> Service[Service Layer<br>Business Logic & Interval Algorithms]
    Service --> RepoInterface[Repository Interface]
    RepoInterface --> Repository[Repository Layer<br>Data Access & Query Construction]
    Repository --> Prisma[Prisma 7 Client]
    Prisma --> Postgres[(PostgreSQL 17 Database)]
```

### Architectural Separation Rationale
1. **Controllers (`*.controller.ts`)**: Pure HTTP handlers. Parse input parameters, invoke Zod DTO schemas, call services, and return standardized JSON responses using `sendSuccess()`.
2. **Services (`*.service.ts`)**: Pure business logic and domain rules. Contains zero Express/HTTP imports. Fully unit-testable in isolation via mocked repository interfaces.
3. **Repositories (`*.repository.ts`)**: Pure persistence layer. Encapsulates Prisma database queries, schema relations, and composite indexing logic.
4. **Interfaces (`*.interface.ts`)**: Explicit dependency contracts enabling mock injection during automated testing.

---

## 6. Project Structure

```
skyhoch-mini/
├── docker-compose.yml               # PostgreSQL 17 Alpine container configuration
├── .gitignore                       # Repository exclusion rules (node_modules, .env, dist, .next)
├── SECURITY_AUDIT_REPORT.md         # Full backend vulnerability & architecture audit report
├── README.md                        # Master repository documentation
│
├── api/                             # Express TypeScript Backend Service
│   ├── package.json                 # Backend scripts and dependencies
│   ├── tsconfig.json                # TypeScript configuration
│   ├── prisma7.config.ts            # Prisma 7 configuration (migrations & seeders)
│   ├── .env.example                 # Template for backend environment variables
│   │
│   ├── prisma/                      # Database Schema & Migrations
│   │   ├── schema.prisma            # Root Prisma schema generator and datasource
│   │   ├── seed.ts                  # Master seeder orchestrator
│   │   ├── models/                  # Modular Prisma model files
│   │   │   ├── role.prisma          # Role enum and model
│   │   │   ├── user.prisma          # User model with role relation
│   │   │   ├── session.prisma       # Refresh session model with token hash
│   │   │   ├── course.prisma        # Course model
│   │   │   ├── enrollment.prisma    # User-to-Course enrollment junction
│   │   │   ├── live-class.prisma    # Scheduled live classes
│   │   │   ├── attendance-event.prisma  # Raw JOIN/LEAVE signals
│   │   │   └── attendance-record.prisma # Calculated metrics and status
│   │   ├── migrations/              # 10 Version-controlled SQL migrations
│   │   └── seeders/                 # Individual entity seeders
│   │       ├── role.seeder.ts       # Seeds 4 system roles
│   │       ├── user.seeder.ts       # Seeds demo students, tutors, admins
│   │       ├── course.seeder.ts     # Seeds German A1, A2, B1
│   │       ├── enrollment.seeder.ts # Seeds student course enrollments
│   │       └── live-class.seeder.ts # Seeds 6 scheduled live classes
│   │
│   └── src/                         # Application Source Code
│       ├── app.ts                   # Express application setup & middleware assembly
│       ├── server.ts                # HTTP server listener entry point
│       ├── config/                  # Environment and Database client configurations
│       ├── middleware/              # Auth, RBAC, Error, and Request logging middlewares
│       ├── utils/                   # JWT, Argon2, Cookie, and Response utilities
│       └── modules/
│           ├── auth/                # Authentication & Session module
│           ├── courses/             # Student & Admin course management module
│           ├── live-classes/        # Live class schedule queries
│           └── attendance/          # Attendance event storage, calculator & unit tests
│               ├── __tests__/       # Vitest unit & integration test suites
│               ├── controller/      # Attendance HTTP handlers
│               ├── dto/             # Attendance Zod validation schemas & types
│               ├── repository/      # Attendance database queries
│               ├── routes/          # Attendance REST routes
│               ├── services/        # Calculator engine and attendance business service
│               └── types/           # Domain types and calculation interfaces
│
└── client/                          # Next.js 16 App Router Frontend Service
    ├── package.json                 # Frontend dependencies & scripts
    ├── tsconfig.json                # TypeScript configuration
    ├── next.config.ts               # Next.js configuration
    ├── .env.example                 # Template for frontend environment variables
    └── src/
        ├── middleware.ts            # Next.js Edge Middleware for session refresh rotation
        ├── config/                  # Client environment configuration
        ├── types/                   # Shared API and response types
        ├── lib/
        │   ├── api/                 # Fetch-based API client
        │   └── auth/                # Server-side auth verification (`getCurrentUser`, `requireRole`)
        ├── features/                # Feature-scoped UI components & state
        │   ├── auth/                # Login, Signup, and role redirection logic
        │   ├── dashboard/           # Student, Tutor, Dept-Head, and Admin layouts
        │   ├── courses/             # Course card grids and detail pages
        │   ├── live-classes/        # Upcoming and completed live class listings
        │   ├── admin-courses/       # Super Admin searchable/filterable course table
        │   └── attendance/          # Interactive Attendance Simulation components
        └── app/                     # Next.js App Router route hierarchy
            ├── (public)/            # Public routes: `/login`, `/signup`
            └── (protected)/         # Authenticated routes: `/dashboard/**`
```

---

## 7. Prerequisites

Before installing and launching the repository, verify that your workstation has:
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v10.x` or higher
- **Docker Desktop**: Running with Docker Compose support
- **Git**: Installed and available in your terminal

---

## 8. Clone Repository

```bash
# Run from: any directory where you store projects
git clone https://github.com/ajaypalamkunnel/skyhoch-mini.git
cd skyhoch-mini
```

*(If you are evaluating a private archive, extract the archive and enter `skyhoch-mini`)*.

---

## 9. PostgreSQL & Docker Setup

The repository uses Docker Compose to run PostgreSQL 17 on host port `5433` (mapped to `5432` internally).

```yaml
# docker-compose.yml configuration
services:
  postgres:
    image: postgres:17-alpine
    container_name: skyhoc-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: skyhoc
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### Docker Commands

```bash
# Run from: skyhoch-mini
docker compose up -d
```

Verify the container is healthy:
```bash
# Run from: skyhoch-mini
docker compose ps
```

Inspect database logs if needed:
```bash
# Run from: skyhoch-mini
docker compose logs postgres
```

To stop the database (data remains safe in persistent volume `postgres_data`):
```bash
# Run from: skyhoch-mini
docker compose down
```

---

## 10. Environment Variables

### Backend Configuration (`api/.env`)
Create `api/.env` from the provided `api/.env.example`:

```bash
# Run from: skyhoch-mini/api
cp .env.example .env
```

Ensure the contents match your local port setup:
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/skyhoc"

JWT_ACCESS_SECRET="skyhoch_dev_access_secret_super_secure_key_123"
JWT_REFRESH_SECRET="skyhoch_dev_refresh_secret_super_secure_key_456"
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

> [!IMPORTANT]
> - Notice the port in `DATABASE_URL` is `5433` because host connections connect through the forwarded Docker port.
> - Secrets provided above are **DEVELOPMENT / DEMO ONLY**. In production environments, store high-entropy keys in a secure secret manager.

### Frontend Configuration (`client/.env.local`)
Create `client/.env.local` from the provided `client/.env.example`:

```bash
# Run from: skyhoch-mini/client
cp .env.example .env.local
```

Template contents:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Environment Differences & Secret Isolation (Local vs. Production)

Local development and production environments intentionally utilize distinct configurations:

| Parameter / Scope | Local Development Workstation | Production Deployment (Vercel & AWS EC2) | Architecture Rationale & Security Isolation |
|---|---|---|---|
| **Frontend API Target (`NEXT_PUBLIC_API_URL`)** | `http://localhost:5000` | `https://skyhoch-mini.vercel.app` (Vercel Origin) | In production, client and server-side calls target the Vercel domain; Next.js rewrites (`/api/*`) proxy requests to the public API origin to guarantee same-origin cookie flows. |
| **Backend Allowed Origin (`CLIENT_URL`)** | `http://localhost:3000` | `https://skyhoch-mini.vercel.app` | Configured for CORS origin validation and cookie domain allowance. |
| **Database Connection (`DATABASE_URL`)** | `postgresql://postgres:postgres@localhost:5433/skyhoc` | Private EC2 Docker internal network string | Local connects through mapped host port `5433`. Production connects via private Docker container network inside the EC2 instance. |
| **Secret Storage & Management** | Local `.env` / `.env.local` files on workstation | Vercel Environment Variables & EC2 secure runtime env | High-entropy production secrets, JWT keys, and database passwords are configured directly in platform secret stores, completely separate from local files. |

> [!IMPORTANT]
> **Do NOT replace your local environment values with production values.**  
> Keep `client/.env.local` configured with `NEXT_PUBLIC_API_URL=http://localhost:5000` and `api/.env` with `CLIENT_URL=http://localhost:3000` for all local development and testing. Production configurations are managed separately within Vercel project settings and AWS EC2 runtime environments.

---

## 11. Database Migrations (Prisma 7)

The repository uses Prisma 7 with multi-file models defined under `api/prisma/models/` and outputs the generated TypeScript client to `api/src/generated/prisma`.

```bash
# Run from: skyhoch-mini/api
npm install
```

Generate the Prisma Client:
```bash
# Run from: skyhoch-mini/api
npx prisma generate
```

Apply all 10 version-controlled migrations:
```bash
# Run from: skyhoch-mini/api
npx prisma migrate dev
```

---

## 12. Database Seeding

The seed pipeline populates roles, users with Argon2-hashed passwords, German courses, student enrollments, and scheduled live classes.

```bash
# Run from: skyhoch-mini/api
npx prisma db seed
```

Output:
```text
✓ Roles seeded
✓ Users seeded
✓ Courses seeded
✓ Enrollments seeded
✓ Live classes seeded
✓ Database seeding completed
```

---

## 13. Seeded Demo Data & Test Accounts

All seeded accounts share the default development password:  
**`Skyhoc@123`** *(Development / Demo Only)*

### System Users & Role Assignments

| Role | Name | Email | Default Password | Enrolled Courses / Scope |
|---|---|---|---|---|
| **STUDENT** | Student One | `student1@skyhoc.com` | `Skyhoc@123` | German A1, German A2 |
| **STUDENT** | Student Two | `student2@skyhoc.com` | `Skyhoc@123` | German A2, German B1 |
| **TUTOR** | Tutor One | `tutor1@skyhoc.com` | `Skyhoc@123` | Assigned to German A1, B1, A2 classes |
| **TUTOR** | Tutor Two | `tutor2@skyhoc.com` | `Skyhoc@123` | Assigned to German A2, A1, B1 classes |
| **DEPARTMENT_HEAD** | Department Head | `department.head@skyhoc.com` | `Skyhoc@123` | Elevated Admin Course Audit Access |
| **SUPER_ADMIN** | Super Admin | `admin@skyhoc.com` | `Skyhoc@123` | Elevated Admin Course Audit Access |

### Seeded Courses
1. **German A1 – Beginner**: *Introduction to German language, vocabulary, grammar, and everyday communication.*
2. **German A2 – Elementary**: *Elementary German grammar, conversation, reading, and listening skills.*
3. **German B1 – Intermediate**: *Intermediate German communication, grammar, vocabulary, and practical conversation.*

### Seeded Live Classes (October 2026)

| ID | Course | Title | Tutor | Scheduled Start | Duration | Status |
|---|---|---|---|---|---|---|
| **1** | German A1 | German A1 – Introduction & Basic Greetings | Tutor 1 | Oct 12, 2026 10:00 AM | 60 min | `SCHEDULED` |
| **2** | German A2 | German A2 – Everyday Conversations | Tutor 2 | Oct 13, 2026 02:00 PM | 60 min | `SCHEDULED` |
| **3** | German B1 | German B1 – Advanced Grammar | Tutor 1 | Oct 14, 2026 10:00 AM | 60 min | `SCHEDULED` |
| **4** | German A1 | German A1 – Numbers, Dates & Time | Tutor 2 | Oct 15, 2026 02:00 PM | 60 min | `SCHEDULED` |
| **5** | German A2 | German A2 – Reading & Listening Practice | Tutor 1 | Oct 16, 2026 10:00 AM | 60 min | `SCHEDULED` |
| **6** | German B1 | German B1 – Practical Conversation | Tutor 2 | Oct 17, 2026 02:00 PM | 60 min | `SCHEDULED` |

> [!NOTE]
> **Deliberate Assessment Scope:**
> - Full course enrollment management (e.g. self-checkout, cart, admin enrollment editor) is **intentionally not implemented**. Enrollments are seeded so that RBAC and IDOR protections can be proven.
> - Live class scheduling and room video streaming are **intentionally not implemented**. Live classes are seeded so that attendance interval calculation and student dashboards can be evaluated.

---

## 14. Backend Setup & Execution

```bash
# Run from: skyhoch-mini/api
npm install

# Generate Prisma Client
npx prisma generate

# Run TypeScript type check
npm run typecheck

# Build and start the backend (Recommended for evaluation)
npm run build
npm start

# Alternatively, run development server with live reload
# npm run dev
```

The Express API starts on **`http://localhost:5000`**.

---

## 15. Frontend Setup & Execution

```bash
# Run from: skyhoch-mini/client
npm install
cp .env.example .env.local

# Build optimized production bundle and start Next.js (Recommended for fast UI evaluation)
npm run build
npm start

# Alternatively, run development server
# npm run dev
```

The Next.js App starts on **`http://localhost:3000`**.

---

## 16. Step-by-Step Running Guide

Follow this sequence to start the entire system from scratch:

```bash
# Step 1: Start PostgreSQL container
# Run from: skyhoch-mini
docker compose up -d

# Step 2: Install backend dependencies & configure env
# Run from: skyhoch-mini/api
npm install
cp .env.example .env

# Step 3: Generate Prisma Client, run migrations & seed database
# Run from: skyhoch-mini/api
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Step 4: Build & start Express API server
# Run from: skyhoch-mini/api
npm run build
npm start

# Step 5: (In a new terminal) Install frontend dependencies, configure env, build & start Next.js
# Run from: skyhoch-mini/client
npm install
cp .env.example .env.local
npm run build
npm start

# Step 6: Open browser at http://localhost:3000
```

---

## 17. Application URLs (Local & Production)

### Local Development Access URLs
| Application Service | Local Access URL | Description |
|---|---|---|
| **Next.js Frontend** | `http://localhost:3000` | Landing, Login, Student Dashboard, Admin Courses |
| **Express Backend API** | `http://localhost:5000` | REST API Server |
| **API Health Check** | `http://localhost:5000/health` | Returns `{ success: true, message: "Skyhoch API is running" }` |
| **PostgreSQL Database** | `localhost:5433` | PostgreSQL 17 (DB: `skyhoc`, User: `postgres`, Port: `5433`) |

### Verified Live Production Deployment URLs
| Service Component | Live Production URL | Hosting Platform & Network Notes |
|---|---|---|
| **Production Frontend** | [`https://skyhoch-mini.vercel.app`](https://skyhoch-mini.vercel.app) | Deployed on Vercel (Next.js 16 App Router) |
| **Public API Origin** | [`https://3.26.131.202.nip.io`](https://3.26.131.202.nip.io) | Hosted on AWS EC2 (proxied via Nginx HTTPS) |
| **Production API Health Check** | [`https://3.26.131.202.nip.io/health`](https://3.26.131.202.nip.io/health) | Returns `{ "success": true, "message": "Skyhoch API is running" }` |
| **Rewritten API Gateway** | `https://skyhoch-mini.vercel.app/api/*` | Vercel rewrites proxying requests to public API origin |
| **PostgreSQL Database** | *Private / Internal Only* | Runs in Docker on EC2 with persistent storage; not exposed to public internet |

*(For full architecture details, request-flow diagrams, and operational commands, see [Section 37: Production Architecture & Deployment Guide](#37-production-architecture--deployment-guide).)*

---

## 18. Authentication & Session Lifecycle

Authentication uses a **stateful refresh session model with short-lived stateless JWT access tokens**:

```mermaid
sequenceDiagram
    autonumber
    actor User as Student Browser
    participant Client as Next.js Client / SSR
    participant API as Express API
    participant DB as PostgreSQL

    User->>API: POST /api/auth/login { email, password }
    API->>DB: Query user by email & verify Argon2 password hash
    API->>DB: Insert new Session record with Argon2(refreshToken)
    API-->>User: Set-Cookie: access_token (15m, httpOnly)<br>Set-Cookie: refresh_token (7d, httpOnly)
    
    User->>Client: Navigate to /dashboard/student
    Client->>API: GET /api/auth/me (Forward access_token cookie)
    API->>API: Verify JWT signature & expiration
    API->>DB: Query User & Role active status
    API-->>Client: Return CurrentUser DTO
    Client-->>User: Render Student Dashboard SSR

    Note over User,API: When access_token expires (15 min):
    User->>API: POST /api/auth/refresh (Cookie: refresh_token)
    API->>DB: Validate session, check revocation, verify Argon2(refresh_token)
    API->>DB: Rotate refresh token: store new Argon2 hash & update lastUsedAt
    API-->>User: Set-Cookie: new access_token & new refresh_token

    Note over User,API: Logout flow:
    User->>API: POST /api/auth/logout (Cookie: refresh_token)
    API->>DB: Revoke session (set revokedAt = NOW())
    API-->>User: Clear access_token & refresh_token cookies
```

---

## 19. JWT Design & Security Architecture

### Token Payloads
- **Access Token (15-Minute Expiry)**:
  ```json
  {
    "userId": 1,
    "role": "STUDENT",
    "iat": 1760086800,
    "exp": 1760087700
  }
  ```
- **Refresh Token (7-Day Expiry)**:
  ```json
  {
    "userId": 1,
    "sessionId": 42,
    "jti": "b5a796e6-...",
    "iat": 1760086800,
    "exp": 1760691600
  }
  ```

### Key Security Safeguards
1. **Zero Client Token Storage**: Tokens are stored exclusively in `httpOnly`, `SameSite=Lax` cookies with `path: "/"`. Browser JavaScript cannot access `document.cookie` tokens, mitigating Cross-Site Scripting (XSS) token theft.
2. **Hashed Refresh Tokens at Rest**: The `sessions` table never stores plaintext refresh tokens. Only `Argon2` password hashes (`refreshTokenHash`) are persisted. A database read breach does not compromise active user refresh tokens.
3. **Session Revocation**: A revoked session (`revokedAt IS NOT NULL`) immediately invalidates refresh operations.
4. **Token Rotation**: Every `/api/auth/refresh` invocation produces a brand-new cryptographically random refresh token and replaces the hash in the database.
5. **Safe Logout**: `/api/auth/logout` operates without requiring a valid access token. Even if the user's 15-minute access token has expired, logging out reads the refresh token cookie, revokes the database session, and clears all client cookies.

---

## 20. Role-Based Access Control (RBAC)

The system enforces 4 hierarchical roles defined in `RoleType`:
- **`STUDENT`**: Access to enrolled courses, scheduled live classes, and personal attendance simulation.
- **`TUTOR`**: Access to assigned live classes and teaching schedules.
- **`DEPARTMENT_HEAD`**: Elevated access to inspect and audit all active/inactive curriculum courses.
- **`SUPER_ADMIN`**: Global system administrative access.

### HTTP Status Code Enforcement
- **`401 Unauthorized`**: Request is missing authentication cookies, or provided token is invalid/expired.
- **`403 Forbidden`**: Request is authenticated, but the user's role lacks permission (e.g. Student accessing Admin courses), or account is deactivated.
- **`404 Not Found`**: Request targets a resource that does not exist or that the user is not enrolled in (avoiding IDOR information leakage).

---

## 21. Complete API Endpoints Reference

All endpoints return standardized JSON structures: `{ "success": boolean, "message": string, "data"?: any }`.

| Method | Endpoint | Auth Required | Role Allowed | Description & Query / Body Parameters |
|---|---|---|---|---|
| `POST` | `/api/auth/signup` | No | Public | Register new student: `{ name, email, password }` |
| `POST` | `/api/auth/login` | No | Public | Authenticate user & issue httpOnly cookies: `{ email, password }` |
| `GET` | `/api/auth/me` | Yes | All Roles | Fetch current authenticated user profile |
| `POST` | `/api/auth/refresh` | Yes (Cookie) | All Roles | Rotate refresh token & issue new access token |
| `POST` | `/api/auth/logout` | No / Soft Auth | All Roles | Revoke database session and clear auth cookies |
| `GET` | `/api/courses/my-courses` | Yes | `STUDENT` | List active courses the authenticated student is enrolled in |
| `GET` | `/api/courses/:courseId` | Yes | `STUDENT` | Get enrolled course details (returns 404 if unenrolled) |
| `GET` | `/api/courses/:courseId/live-classes` | Yes | `STUDENT` | Get live classes for enrolled course (`?status=upcoming` or `completed`) |
| `GET` | `/api/live-classes/my-live-classes` | Yes | `STUDENT` | Aggregated live classes across all enrolled courses (`?status=upcoming` / `completed`) |
| `GET` | `/api/attendance/live-classes/:liveClassId` | Yes | `STUDENT` | Fetch calculated attendance record for enrolled live class |
| `GET` | `/api/attendance/live-classes/:liveClassId/events` | Yes | `STUDENT` | Fetch raw attendance JOIN/LEAVE events for live class |
| `POST` | `/api/attendance/events` | Yes | `STUDENT` | Record raw attendance signal: `{ liveClassId, eventType: "JOIN"\|"LEAVE", eventAt }` |
| `POST` | `/api/attendance/live-classes/:liveClassId/calculate` | Yes | `STUDENT` | Execute calculation engine and create derived `AttendanceRecord` |
| `DELETE` | `/api/attendance/live-classes/:liveClassId` | Yes | `STUDENT` | Reset personal attendance events & records for demo repeatability |
| `GET` | `/api/admin/courses` | Yes | `DEPARTMENT_HEAD`, `SUPER_ADMIN` | Elevated course audit: `?status=all\|active\|inactive&search=...&sortBy=id\|title\|createdAt&sortOrder=asc\|desc` |

---

## 22. Course Authorization & IDOR / BOLA Prevention

**Broken Object Level Authorization (BOLA / IDOR)** occurs when an application accepts a user-controlled identifier (such as `userId` in query parameters or request bodies) to scope database queries.

### How Skyhoch Prevents IDOR
1. **Untrusted Client Identifiers are Ignored**: Endpoints never read `req.query.userId` or `req.body.userId`.
2. **Identity from Cryptographic JWT**: The student's `userId` is extracted exclusively from the cryptographically verified access token (`req.auth.userId`).
3. **Database-Level Ownership Filtering**:
   ```typescript
   // Example from CourseRepository:
   prisma.course.findFirst({
     where: {
       id: courseId,
       isActive: true,
       enrollments: {
         some: {
           userId: authenticatedUserId, // Derived from JWT
         },
       },
     },
   });
   ```
4. **Information Leakage Prevention**: If Student One attempts to query German B1 (which only Student Two is enrolled in), the API returns `404 Course not found` rather than confirming the course's existence.

---

## 23. Admin Course Management

The elevated course endpoint (`GET /api/admin/courses`) allows Department Heads and Super Admins to audit the entire curriculum.

### Key Characteristics
- **Strict Role Gate**: `authorize(RoleType.DEPARTMENT_HEAD, RoleType.SUPER_ADMIN)` rejects `STUDENT` and `TUTOR` with `403 Forbidden`.
- **Visibility into Inactive Courses**: Unlike student endpoints (which filter `isActive: true`), admins can view both active and archived/draft courses.
- **Advanced Filtering & Sorting**: Supports case-insensitive substring searching (`?search=German`), status filtering (`?status=active|inactive|all`), and sorting by `id`, `title`, or `createdAt`.

---

## 24. Attendance Data Model

Attendance uses a **two-tier architecture** separating raw, append-only event signals from derived, calculated records:

```mermaid
erDiagram
    USERS ||--o{ ATTENDANCE_EVENTS : "records"
    USERS ||--o{ ATTENDANCE_RECORDS : "owns"
    LIVE_CLASSES ||--o{ ATTENDANCE_EVENTS : "tracks"
    LIVE_CLASSES ||--o{ ATTENDANCE_RECORDS : "evaluates"

    ATTENDANCE_EVENTS {
        int id PK
        int live_class_id FK
        int user_id FK
        enum event_type "JOIN | LEAVE"
        datetime event_at
        string external_event_id UK "Nullable"
        datetime created_at
    }

    ATTENDANCE_RECORDS {
        int id PK
        int live_class_id FK
        int user_id FK
        int total_minutes
        decimal attendance_percentage "5,2"
        enum status "PRESENT | ABSENT"
        datetime calculated_at
        datetime created_at
        datetime updated_at
    }
```

### Constraints & Indexes
- `attendance_events`: Indexed on `(user_id, live_class_id)` and `(live_class_id, event_at)`.
- `attendance_records`: Unique composite constraint on `@@unique([userId, liveClassId])` preventing duplicate records for the same student in a single class.

---

## 25. Attendance Calculation Engine & Interval Resolution

The calculation engine (`AttendanceCalculatorService`) processes raw attendance signals through a deterministic 8-step pipeline:

```mermaid
graph TD
    A[Raw JOIN / LEAVE Events] --> B[1. Validate Schedule & Timestamps]
    B --> C[2. Sort Events Chronologically by eventAt]
    C --> D[3. Deduplicate Identical Consecutive Events]
    D --> E[4. Resolve Intervals with Active Join Depth Tracking]
    E --> F[5. Auto-Close Missing LEAVE at Class End]
    F --> G[6. Clamp Intervals to Class Boundaries 0..Duration]
    G --> H[7. Merge Overlapping & Contiguous Intervals]
    H --> I[8. Sum Net Attended Minutes & Apply 70% Threshold]
```

### Algorithmic Highlights
1. **Join Depth Tracking (`activeJoins`)**: Handles multi-tab or multi-device connections. When a student opens 2 tabs (`JOIN 10:00`, `JOIN 10:05`), the interval starts at `10:00` and only closes when `activeJoins` drops to `0` (`LEAVE 10:30`, `LEAVE 10:40`).
2. **Unmatched LEAVE Handling**: If a student sends a `LEAVE` event while `activeJoins === 0`, it is safely ignored and produces zero negative duration.
3. **Missing LEAVE Auto-Close**: If the class ends while `activeJoins > 0`, the open interval is capped at the exact class conclusion timestamp (`classEndMs`).
4. **Boundary Clamping**: Events that occurred before class start or after class finish are clamped strictly to `[classStartMs, classEndMs]`.

---

## 26. Attendance Threshold & Formula

### Mathematical Formula
$$\text{attendancePercentage} = \min\left(100, \max\left(0, \frac{\text{totalAttendedMinutes}}{\text{classDurationMinutes}} \times 100\right)\right)$$

$$\text{status} = \begin{cases} \text{PRESENT} & \text{if } \text{attendancePercentage} \ge 70.00\% \\ \text{ABSENT} & \text{if } \text{attendancePercentage} < 70.00\% \end{cases}$$

- **Attendance Threshold**: **70.00%**
- **Precision**: Percentage rounded to 2 decimal places.
- **Minutes**: Total attended milliseconds converted to whole integer minutes via `Math.floor(totalMs / 60000)`.

---

## 27. Attendance Edge Cases & Worked Examples

All examples assume a **60-minute live class** scheduled from **10:00 AM to 11:00 AM**.

| Scenario | Raw Events Sequence | Resolved Intervals | Total Minutes | Percentage | Final Status |
|---|---|---|---|---|---|
| **1. Standard Single Session** | `JOIN 10:00`, `LEAVE 10:30` | `[10:00 - 10:30]` (30 min) | 30 min | 50.00% | `ABSENT` |
| **2. Disconnect & Reconnect** | `JOIN 10:00`, `LEAVE 10:20`, `JOIN 10:25`, `LEAVE 10:55` | `[10:00 - 10:20]` (20 min) + `[10:25 - 10:55]` (30 min) | 50 min | 83.33% | `PRESENT` |
| **3. Multi-Tab Overlap** | `JOIN 10:00`, `JOIN 10:10`, `LEAVE 10:30`, `LEAVE 10:40` | `[10:00 - 10:40]` (40 min, no double-count) | 40 min | 66.67% | `ABSENT` |
| **4. Missing LEAVE Event** | `JOIN 10:15` (no LEAVE signal received) | Auto-closed at class end: `[10:15 - 11:00]` | 45 min | 75.00% | `PRESENT` |
| **5. Boundary Clamping** | `JOIN 09:45`, `LEAVE 10:45` | Clamped to class start: `[10:00 - 10:45]` | 45 min | 75.00% | `PRESENT` |
| **6. Unmatched LEAVE** | `LEAVE 10:05`, `JOIN 10:10`, `LEAVE 10:55` | Unmatched LEAVE ignored; `[10:10 - 10:55]` | 45 min | 75.00% | `PRESENT` |
| **7. Out-of-Order Delivery** | `LEAVE 10:50`, `JOIN 10:00` | Chronologically sorted before resolution | 50 min | 83.33% | `PRESENT` |

---

## 28. Attendance Automated Unit Tests

The repository includes a comprehensive automated unit test suite for the attendance calculation engine executed via **Vitest**.

```bash
# Run from: skyhoch-mini/api
npm run test
```

### Test Suite Results (26/26 Tests Passing)
```text
 ✓ src/modules/attendance/__tests__/attendance-calculator.service.spec.ts (26 tests)

 Test Files  1 passed (1)
      Tests  26 passed (26)
```

### Edge Cases Covered in Unit Tests
- Zero events $\rightarrow$ `0 min, 0%, ABSENT`
- Exact 70% threshold boundary (42 minutes in a 60-minute class $\rightarrow$ `PRESENT`)
- 69.9% threshold boundary (41 minutes in a 60-minute class $\rightarrow$ `ABSENT`)
- Rapid consecutive duplicate `JOIN` events at the exact same millisecond
- Out-of-order network arrival simulation
- Multi-tab simultaneous session merging
- Premature departure before class start and post-class events
- Invalid inputs (negative duration, non-date timestamps, malformed event types)

---

## 29. Next.js Server-Side Authentication & Session Forwarding

The Next.js App Router frontend implements **Server-Side Authentication** without exposing tokens to client-side scripts:

1. **Server Component Auth (`getCurrentUser()`)**:
   [`skyhoch-mini/client/src/lib/auth/server-auth.ts`](client/src/lib/auth/server-auth.ts) uses `next/headers` to read incoming `httpOnly` cookie headers and forwards them in a server-to-server request to `${env.apiUrl}/api/auth/me`.
   - **Local Development**: `${env.apiUrl}` points directly to `http://localhost:5000`.
   - **Production Deployment**: `${env.apiUrl}` is configured to the Vercel origin (`https://skyhoch-mini.vercel.app`), which routes via Next.js `/api/*` rewrites to the public EC2 API (`https://3.26.131.202.nip.io`). This architecture guarantees that browser cookies remain same-origin, eliminating cross-site cookie blocking and CORS preflight overhead.
   - Wrapped in React `cache()` for per-request deduplication across Server Components.
2. **Next.js Edge Middleware (`middleware.ts`)**:
   [`skyhoch-mini/client/src/middleware.ts`](client/src/middleware.ts) inspects access token expiration for protected routes. If the access token is expired but a refresh token is present, it transparently calls `POST /api/auth/refresh`, attaches the newly rotated cookies to the request/response headers, and prevents session dropouts.
3. **Server-Side Role Guard (`requireRole()`)**:
   [`skyhoch-mini/client/src/lib/auth/role-guard.ts`](client/src/lib/auth/role-guard.ts) executes on the Next.js server before rendering pages, redirecting unauthenticated users to `/login` and unauthorized users to their appropriate dashboard home.

---

## 30. Student Dashboard & Course Workflow

When a student logs in, the navigation workflow follows a clear hierarchical path:

```text
/dashboard/student (Enrolled Courses Grid & Upcoming Live Classes)
  └── /dashboard/courses/[courseId] (Course Overview & Class Schedule)
        └── /dashboard/courses/[courseId]/live-classes/[liveClassId]/attendance (Attendance Studio)
```

- **Enrolled Courses**: Displays enrolled German courses with direct navigation.
- **Aggregated Live Classes**: Lists upcoming classes chronologically across all courses the student is enrolled in.

---

## 31. Live Class Experience & Scheduling

- **Upcoming Classes**: Filtered by `startsAt >= NOW()` and sorted **ascending** by start time so the next immediate class appears first.
- **Completed Classes**: Filtered by `status = COMPLETED` and sorted **descending** by start time.
- **Course Isolation**: Students can only access live classes belonging to courses they are actively enrolled in.

---

## 32. Attendance Simulation & Interactive Component

The interactive Attendance Simulation studio ([`skyhoch-mini/client/src/features/attendance/components/attendance-simulation.tsx`](client/src/features/attendance/components/attendance-simulation.tsx)) fulfills the requirement for an interactive client-side component.

### Interactive State Machine
1. **State 1 — Draft & Edit**:
   - Students add/remove draft intervals (e.g. `JOIN 10:10`, `LEAVE 10:40`).
   - Time inputs validate against class bounds.
   - Click **"Submit Attendance Events"** to persist raw signals into `attendance_events`.
2. **State 2 — Persisted Events Review**:
   - Shows database-persisted event history with exact timestamps.
   - Click **"Calculate Attendance"** to trigger backend interval algebra.
3. **State 3 — Evaluated Result Display**:
   - Renders calculated minutes, attendance percentage, and status badge (`PRESENT` $\ge 70\%$ or `ABSENT` $< 70\%$).
   - Click **"Reset Demo"** (`DELETE /api/attendance/live-classes/:liveClassId`) to clear data and repeat the demonstration.

---

## 33. Responsive & Mobile-Friendly UI

The frontend is built with **Tailwind CSS v4** and designed for all screen sizes:
- **Navigation**: Mobile sliding hamburger drawer with role badges and quick logout.
- **Data Grids**: Responsive flex/grid layouts transitioning from single-column on mobile (`< 640px`) to multi-column cards on desktop (`lg:grid-cols-3`).
- **Touch Targets**: All buttons, form inputs, and interactive badges meet WCAG 44x44px touch target guidelines.

---

## 34. Manual End-to-End Testing Guide

Follow this end-to-end verification script:

### Step 1: Student Authentication & Dashboard
1. Open `http://localhost:3000/login`.
2. Login with `student1@skyhoc.com` / `Skyhoc@123`.
3. Verify redirection to `/dashboard/student`.
4. Verify enrolled courses: **German A1 – Beginner** and **German A2 – Elementary**.

### Step 2: Course Access & Attendance Simulation
1. Click on **German A1 – Beginner**.
2. Click **"Launch Attendance Studio"** on class `#1` (*German A1 – Introduction & Basic Greetings*).
3. Set `JOIN: 10:10` and `LEAVE: 10:40` (30 minutes in a 60-minute class).
4. Click **"Submit Attendance Events"**, then click **"Calculate Attendance"**.
5. Verify result: **30 minutes, 50.00%, ABSENT** (Red badge).
6. Click **"Reset Demo"**.
7. Add two intervals: `JOIN 10:00`, `LEAVE 10:25` and `JOIN 10:30`, `LEAVE 10:55` (50 minutes total).
8. Submit and Calculate. Verify result: **50 minutes, 83.33%, PRESENT** (Green badge).

### Step 3: Admin Role Authorization Check
1. In the student session, attempt to navigate to `http://localhost:3000/dashboard/admin/courses`.
2. Verify you are redirected or receive `403 Forbidden` from backend `GET /api/admin/courses`.
3. Log out.
4. Login with `department.head@skyhoc.com` / `Skyhoc@123`.
5. Access `http://localhost:3000/dashboard/admin/courses`.
6. Verify access to the Admin Course Management table with full search and filter controls.

---

## 35. Architecture Question 1: Webhook Discrepancy & Out-of-Order Events

### Question
> *Webhooks can drop or arrive out of order under network load. How does your attendance engine detect and handle missing LEAVE or JOIN events before calculating total minutes?*

### Answer
I treat webhooks as unreliable hints, not as the source of truth. The engine works in four steps:

1. **Store raw events idempotently**: The handler verifies the signature, saves the event with a unique event ID (so duplicates are ignored), and returns 200. No calculation happens here.
2. **Order and pair after the class**: Events are sorted by their own timestamp, not by arrival time, and paired by connection ID. Out-of-order delivery therefore doesn’t matter.
3. **Detect gaps**: A JOIN without a LEAVE, or a LEAVE without a JOIN, is an open interval. During the class, a job every 1 to 2 minutes compares our records with LiveKit’s participant list, which is the second source of truth.
4. **Repair and flag**: Missing events are filled from heartbeats, token issue time, or the session bounds, and marked inferred. Overlapping intervals are merged, and the total is clipped to the class window.

Tutors see which minutes were inferred and can override them, with an audit trail. The raw events are kept, so any figure can be explained.

---

### Worked Examples

**Class**: 10:00 to 11:00 (60 minutes). **Present threshold**: 75% (45 minutes).

#### Case 1: LEAVE webhook lost (student: Anu)

| Time | What happened | Webhook received? |
|---|---|---|
| **10:02** | Anu joins (connection A) | Yes |
| **10:20** | Her network drops | LEAVE lost |
| **10:25** | She rejoins (connection B) | Yes |
| **10:58** | She leaves | Yes |

- **Naive calculation**: Connection A has no LEAVE, so it stays open until the class ends. That counts 10:02 to 11:00 = 58 minutes (97%), which is wrong because she was offline for 5 minutes.
- **Our engine**:
  1. Detects connection A as an open interval.
  2. The reconciliation job at 10:22 sees she is missing from LiveKit’s participant list, and her last heartbeat was 10:19:50.
  3. It closes A at about 10:20 and marks it inferred.

| Interval | Minutes | Source |
|---|---|---|
| **10:02 to 10:20** | 18 | Inferred end |
| **10:25 to 10:58** | 33 | Verified |
| **Total** | **51 (85%)** | **Present** |

*Her record shows 18 inferred minutes, so the tutor can review them.*

#### Case 2: JOIN lost and events out of order (student: Ravi)

| Time | What happened | Webhook received? |
|---|---|---|
| **10:09** | Our API issues his join token | (Our own log) |
| **10:10** | Ravi joins | JOIN lost |
| **10:50** | Ravi leaves | Yes, arrives early or late |

- **Our engine**:
  1. Sorts events by their own timestamps, so arrival order is irrelevant.
  2. Finds a LEAVE with no JOIN and detects him in the participant list at 10:11.
  3. Infers the join time from the token time or the detection (about 10:10) and marks it inferred.

- **Result**: `10:10 to 10:50 = 40 minutes (67%) → Partial`, with the start flagged as inferred.

#### Case 3: Duplicate event
LiveKit retries a LEAVE and it arrives twice. The unique event ID rejects the second copy, so the minutes are unchanged.

---

> [!NOTE]
> **Implementation Scope Note:**  
> We can implement this multi-source reconciliation pipeline when integrating with LiveKit in production. The current repository implementation is based on the normal event capturing method with interval resolution, chronological sorting, boundary clamping, and missing LEAVE auto-close.

---

## 36. Architecture Question 2: Bunny Stream Signed URL Security & Scraping Prevention

### Question: Video Security
> *How will you prevent signed playback URLs in Bunny Stream from being shared or scraped by authenticated users?*

### Answer
No system can fully stop a logged-in student from copying a video, because anything a browser can play can be recorded. My goal is to make sharing fail quickly, make scraping detectable, and make any leak traceable. I use layers:

1. **Short-lived signed URLs**: The browser never gets a permanent link. Each time a lesson opens, the API checks login and active enrollment, then issues a Bunny token URL that expires in about 10 minutes. The player refreshes it every few minutes, and refreshing requires the student’s session. A copied link dies quickly and can’t be renewed by anyone else.
2. **Hidden video identifiers**: The frontend only sees our lesson IDs. The Bunny video ID is resolved on the server, and direct MP4 download is disabled.
3. **Session and device limits**: One active playback session per account, tracked in Redis with a heartbeat, plus a device limit. This stops account sharing.
4. **Anomaly detection**: The backend flags accounts that request far more video than real time allows, use many IPs, or sweep through a whole course. Flagged accounts are rate-limited and reviewed.
5. **Dynamic watermark**: The student’s name or email appears at moving positions on the video, so a leaked recording can be traced.
6. **DRM as a later step**: Widevine/FairPlay encryption is the real defence against segment downloading, but it adds a recurring cost, so I’d add it in Phase 3 if piracy appears in the data. The VideoProvider interface makes that a small change.

Offenders face warnings and then suspension under the terms of use.

---

### Worked Examples

**Setup**: Anu is enrolled in the B1 course. Her friend Ravi is not.

#### Case 1: Anu shares a playback link
1. Anu opens Lesson 5 at 10:00. The API verifies her enrollment and returns a URL valid until 10:10.
2. She copies it from the browser’s network tab and sends it to Ravi at 10:03.
3. Ravi’s video plays until 10:10, then the link expires.
4. Ravi can’t get a new token, because that endpoint needs Anu’s login and her active session.

- **Result**: At most a few minutes of exposure, with no lasting access.

#### Case 2: Anu shares her password
1. Anu is watching Lesson 5 on her phone.
2. Ravi logs in with her password and starts a lesson.
3. Redis sees a second active session, so Anu’s stream stops and a *“your account is in use elsewhere”* message appears.
4. After repeated conflicts, the account gets a warning and then a temporary suspension.

- **Result**: Account sharing becomes inconvenient and gets enforced.

#### Case 3: A student scrapes the course
1. A student with a valid login runs a script that requests tokens for all 40 lessons within an hour (about 40 hours of video).
2. The anomaly check sees 40 hours of content requested in 60 minutes, from 3 different IPs.
3. The account is rate-limited automatically, and an admin gets an alert.

- **Result**: Bulk downloading is detected and throttled. A slow, patient scraper could still get through, which is why DRM is the long-term answer.

#### Case 4: A leaked screen recording
1. Someone records the screen and posts the video online.
2. The watermark shows `anu@example.com` drifting across the frame.
3. The team identifies the source account and suspends it.

---

## 37. Production Architecture & Deployment Guide

This section documents the live production architecture, continuous integration pipeline, and operational rollout procedures for Skyhoch Mini.

### Production Infrastructure Overview

The production system is deployed across **Vercel** and **AWS EC2**, leveraging containerization, reverse proxying, and automated container image publishing:

| Component | Technology & Hosting Platform | Verified Production Host / Endpoint | Network & Security Architecture |
|---|---|---|---|
| **Frontend Web App** | Next.js 16 (App Router) on **Vercel** | [`https://skyhoch-mini.vercel.app`](https://skyhoch-mini.vercel.app) | Global Edge CDN; executes Server Components and handles client UI. |
| **Reverse Proxy & TLS** | Nginx on **AWS EC2** | [`https://3.26.131.202.nip.io`](https://3.26.131.202.nip.io) | Listens on port 443 with TLS certificates; terminates HTTPS and proxies to the local Docker API container. |
| **Backend API** | Express 5 & TypeScript in **Docker** | Port 5000 (Internal to EC2 localhost) | Containerized Node.js service; internal port is not publicly exposed to the internet. |
| **Database** | PostgreSQL 17 in **Docker** | Port 5432 (Internal Docker Network) | Runs in container with persistent host storage volume (`postgres_data`); completely shielded from public internet. |
| **Container Registry** | GitHub Packages / **GHCR** | `ghcr.io/<repository-owner>/api` | Stores immutable versioned and tagged (`latest`, `sha`) backend Docker images. |
| **CI / CD Pipeline** | **GitHub Actions** | `.github/workflows/main.yml` | Automatically builds and pushes Docker images to GHCR on changes to `main`. |

---

### Production Request-Flow Architecture

```mermaid
graph LR
    Browser["1. Browser<br>(End User)"] -->|"HTTPS<br>Same-Origin Cookies"| Vercel["2. Vercel Frontend<br>skyhoch-mini.vercel.app"]
    Vercel -->|"Next.js Rewrite<br>/api/*"| Nginx["3. Nginx Reverse Proxy<br>3.26.131.202.nip.io:443 (HTTPS)"]
    Nginx -->|"Local Proxy Pass<br>http://127.0.0.1:5000"| API["4. Docker API Container<br>Express / Node.js"]
    API -->|"Internal Bridge Network<br>Port 5432"| DB[("5. Docker PostgreSQL<br>Persistent Volume")]
```

#### Component Roles & Communication Mechanics:
1. **End-User Browser**: Interacts with the frontend over secure HTTPS. All cookie headers (`access_token`, `refresh_token` with `httpOnly; SameSite=Lax`) are issued and bound to the Vercel domain.
2. **Vercel Frontend (Next.js)**: Serves static and dynamic web pages. For API interactions, Next.js handles two communication paths:
   - **Client-Side Requests**: Routed to `/api/*` on the same Vercel origin. The `next.config.ts` rewrite transparently proxies `/api/:path*` to `https://3.26.131.202.nip.io/api/:path*`.
   - **Server-Side Requests (`getCurrentUser()`)**: Server Components and Edge Middleware evaluate `${env.apiUrl}/api/...` using the production environment variable.
3. **Nginx Reverse Proxy & HTTPS Termination (AWS EC2)**:
   - Receives inbound public traffic exclusively on HTTPS port 443 via `https://3.26.131.202.nip.io`.
   - Terminates TLS/SSL encryption and enforces secure HTTP protocol headers.
   - Forwards decrypted HTTP traffic locally to `http://127.0.0.1:5000` on the EC2 loopback interface.
4. **Docker API Container (Express 5 & TypeScript)**:
   - Runs the compiled backend application (`node dist/server.js`) inside an isolated Alpine Linux container.
   - Port 5000 is bound strictly to `127.0.0.1:5000` (or an internal Docker bridge), ensuring it cannot be reached directly from the public internet.
   - Evaluates JWT signatures, enforces RBAC middleware, runs attendance interval algebra, and communicates with the database.
5. **PostgreSQL Database Container**:
   - Runs in Docker on EC2 with data persisted to host storage.
   - Port 5432 is not exposed to the public internet; only containers residing on the private internal Docker network or host bridge can connect.

---

### Environment Configuration & Same-Origin Cookie Flow

#### Why Next.js Rewrites are Essential in Production
In modern web browsers, cross-origin cookies between distinct domains (e.g., from `vercel.app` to a separate IP/domain) are subject to stringent Third-Party Cookie blocking, CORS preflight checks (`OPTIONS`), and strict `SameSite` constraints.

To eliminate cross-origin authentication failures:
- In production, `NEXT_PUBLIC_API_URL` is set to the Vercel deployment origin (`https://skyhoch-mini.vercel.app`).
- The Next.js configuration in [`client/next.config.ts`](client/next.config.ts) defines an asynchronous rewrite rule:
  ```typescript
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://3.26.131.202.nip.io/api/:path*",
      },
    ];
  }
  ```
- **Benefit**: The browser issues requests directly to `https://skyhoch-mini.vercel.app/api/...`. Because this is **same-origin**, the browser seamlessly dispatches and stores the `httpOnly` authentication cookies without CORS headers or third-party cookie restrictions.

#### Secret Isolation & Security Rules
- **Separate Production Secrets**: Production JWT secrets, database credentials, and session salts are configured exclusively within Vercel's Environment Variables panel and the EC2 server's protected `.env` runtime environment.
- **No Shared Credentials**: Local development defaults (`Skyhoc@123`, `skyhoch_dev_access_secret_...`) are strictly forbidden in production.
- **No Production Overwrites**: Developers must **not** copy production values into local `.env` or `.env.local` files. Local workstations must remain configured with `http://localhost:5000` and `http://localhost:3000`.

---

### Database Migrations: Local vs. Production

Understanding the difference between development and production migration commands is critical to preventing accidental data loss:

| Characteristic | `npx prisma migrate dev` (Local Development) | `npx prisma migrate deploy` (Production Deployment) |
|---|---|---|
| **Intended Environment** | Local Developer Workstation | Staging & Production Servers |
| **New Migration Creation** | Detects schema diffs and generates new SQL files in `prisma/migrations/`. | **Never creates migrations.** Strictly applies pre-existing SQL files. |
| **Schema Drift & Resets** | Detects drift and prompts to reset/drop database if history deviates. | **Never prompts or resets.** Fails immediately if an inconsistency occurs. |
| **Seeding Execution** | Automatically runs `prisma.seed` if configured. | **Never runs seeders.** Does not populate or overwrite data. |
| **Prisma Client Generation** | Runs `prisma generate` automatically. | Does not generate client automatically (client is baked into Docker image during build). |
| **Execution Context** | Executed directly from terminal on developer workstation. | Executed inside the running production API Docker container on EC2. |

> [!CAUTION]
> **Never run `npx prisma migrate dev` in production.**  
> Running `migrate dev` on a production database can trigger unexpected schema prompts or full database resets. Always use `npx prisma migrate deploy` for production rollouts.

---

### Step-by-Step Production Deployment Workflow

Deploying a backend update follows a reliable, multi-stage procedure combining automated CI publishing with an intentional, manual EC2 server rollout.

> [!IMPORTANT]
> **Pushing to GitHub does NOT automatically update the EC2 server.**  
> GitHub Actions builds and pushes the container image to GitHub Container Registry (GHCR). Deploying the image to the EC2 host and running database migrations is a deliberate manual step performed by an authorized administrator.

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer / Engineer
    participant GH as GitHub (main branch)
    participant GHA as GitHub Actions CI
    participant GHCR as GitHub Container Registry
    actor Ops as Administrator (SSH)
    participant EC2 as AWS EC2 Host
    participant API as Docker API Container
    participant DB as Docker PostgreSQL

    Dev->>GH: Push commit to main (api/**)
    GH->>GHA: Trigger .github/workflows/main.yml
    GHA->>GHA: Run Docker Buildx & compile TypeScript
    GHA->>GHCR: Push ghcr.io/<owner>/api:latest & :sha
    GHA-->>Dev: Workflow Completed (Green check)

    Note over Ops,EC2: Manual Rollout Phase:
    Ops->>EC2: SSH into EC2 server using authorized key
    Ops->>DB: Execute pg_dump pre-deployment backup
    Ops->>GHCR: docker pull ghcr.io/<owner>/api:latest
    Ops->>API: Execute npx prisma migrate deploy inside container
    Ops->>API: Restart / recreate container with latest image
    Ops->>EC2: Verify logs & curl https://3.26.131.202.nip.io/health
```

#### Step 1: Push Backend Changes to `main`
Push verified code changes to the `main` branch:
```bash
# Run from: local repository
git checkout main
git merge <feature-branch>
git push origin main
```

#### Step 2: Verify GitHub Actions Workflow Run
1. Open the repository on GitHub and navigate to **Actions**.
2. Confirm the **"Build and Publish API Docker Image"** workflow completes successfully.
3. Verify that the image is published to GHCR under packages (`ghcr.io/<repository-owner>/skyhoch-mini/api:latest`).

#### Step 3: Connect to the AWS EC2 Instance via SSH
Connect securely using your administrative SSH private key:
```bash
# Run from: your administrative terminal
ssh -i <path-to-authorized-key>.pem <ec2-user>@<ec2-ip-or-host>
```

#### Step 4: Back Up the Production Database
Always capture a snapshot of the PostgreSQL database before performing any container or migration changes:
```bash
# Run from: EC2 host terminal
docker exec <postgres-container-name> pg_dump -U <db-user> -d <db-name> > ~/backups/backup_$(date +%Y%m%d_%H%M%S).sql
```
*(Verify that the generated backup file has non-zero size before proceeding).*

#### Step 5: Pull the Latest Docker Image from GHCR
Authenticate with GHCR and pull the newly published image:
```bash
# Run from: EC2 host terminal
echo <github-token> | docker login ghcr.io -u <github-username> --password-stdin
docker pull ghcr.io/<repository-owner>/skyhoch-mini/api:latest
```

#### Step 6: Apply Pending Prisma Migrations
Apply any new database schema migrations safely using `prisma migrate deploy`:
```bash
# Run from: EC2 host terminal (using existing API container or temporary runner)
docker exec <api-container-name> npx prisma migrate deploy
```

#### Step 7: Restart / Recreate the API Container
Recreate the container with the newly pulled image while preserving environment variables and networking:
```bash
# Run from: EC2 host terminal
# Stop and remove the existing container
docker stop <api-container-name>
docker rm <api-container-name>

# Launch the updated container (bound locally to port 5000)
docker run -d \
  --name <api-container-name> \
  --restart unless-stopped \
  --network <docker-network-name> \
  --env-file <path-to-production-.env> \
  -p 127.0.0.1:5000:5000 \
  ghcr.io/<repository-owner>/skyhoch-mini/api:latest
```

#### Step 8: Verify Container Health & Services
Confirm that the deployment succeeded:
```bash
# Check container status
docker ps

# Inspect recent application logs
docker logs --tail 50 <api-container-name>

# Test the public HTTPS health endpoint via Nginx
curl -f https://3.26.131.202.nip.io/health
```
Expected response:
```json
{
  "success": true,
  "message": "Skyhoch API is running"
}
```
Finally, open [`https://skyhoch-mini.vercel.app`](https://skyhoch-mini.vercel.app) in your browser and verify end-to-end authentication and dashboard functionality.

---

## 38. Development & Operations Commands Reference

### Local Development Commands

#### Root Directory (`skyhoch-mini/`)
```bash
# Start PostgreSQL container
# Run from: skyhoch-mini
docker compose up -d

# Check PostgreSQL container status
# Run from: skyhoch-mini
docker compose ps

# View PostgreSQL container logs
# Run from: skyhoch-mini
docker compose logs postgres

# Stop PostgreSQL container
# Run from: skyhoch-mini
docker compose down
```

#### Backend Directory (`skyhoch-mini/api/`)
```bash
# Install backend dependencies
# Run from: skyhoch-mini/api
npm install

# Run TypeScript type check
# Run from: skyhoch-mini/api
npm run typecheck

# Run Vitest test suite
# Run from: skyhoch-mini/api
npm run test

# Run Prisma 7 migration (Local development only)
# Run from: skyhoch-mini/api
npx prisma migrate dev

# Generate Prisma Client
# Run from: skyhoch-mini/api
npx prisma generate

# Seed Database
# Run from: skyhoch-mini/api
npx prisma db seed

# Start API in development mode
# Run from: skyhoch-mini/api
npm run dev

# Build TypeScript to dist/
# Run from: skyhoch-mini/api
npm run build

# Start production server
# Run from: skyhoch-mini/api
npm start
```

#### Frontend Directory (`skyhoch-mini/client/`)
```bash
# Install frontend dependencies & configure env
# Run from: skyhoch-mini/client
npm install
cp .env.example .env.local

# Start Next.js development server
# Run from: skyhoch-mini/client
npm run dev

# Run ESLint check
# Run from: skyhoch-mini/client
npm run lint

# Build Next.js production bundle
# Run from: skyhoch-mini/client
npm run build

# Start Next.js production server
# Run from: skyhoch-mini/client
npm start
```

### Production Operations Commands (EC2 / Docker)

```bash
# Connect to EC2 server
ssh -i <path-to-key>.pem <ec2-user>@<ec2-ip>

# Back up production database
docker exec <postgres-container-name> pg_dump -U <db-user> -d <db-name> > ~/backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Pull updated API container image
docker pull ghcr.io/<repository-owner>/skyhoch-mini/api:latest

# Run production Prisma migrations inside container
docker exec <api-container-name> npx prisma migrate deploy

# Check container status on EC2
docker ps

# Inspect API container logs
docker logs --tail 100 -f <api-container-name>

# Test local HTTPS endpoint
curl -f https://3.26.131.202.nip.io/health
```

---

## 39. Troubleshooting Guide

### 1. PostgreSQL Connection Refused on Port 5433 (Local Development)
- **Cause**: Docker container is stopped or port 5433 is in use.
- **Fix**: Run `docker compose ps` from `skyhoch-mini`. Verify `skyhoc-postgres` is `Up`. Ensure `api/.env` has `DATABASE_URL="postgresql://postgres:postgres@localhost:5433/skyhoc"`.

### 2. Prisma Client Generation Missing
- **Cause**: `npx prisma generate` has not been run after cloning or modifying models.
- **Fix**: Run `npx prisma generate` from `skyhoch-mini/api`.

### 3. Migrations or Seeder Failures (Local Development)
- **Cause**: Prisma client was not generated or database tables have not been migrated before seeding.
- **Fix**:
  ```bash
  # Run from: skyhoch-mini/api
  npx prisma generate
  npx prisma migrate dev
  npx prisma db seed
  ```

### 4. CORS Errors on Client Requests
- **Cause**: Express `CLIENT_URL` does not match the frontend origin.
- **Fix**:
  - In local development: Verify `CLIENT_URL=http://localhost:3000` in `api/.env` and restart the backend.
  - In production: Verify `CLIENT_URL=https://skyhoch-mini.vercel.app` on the EC2 server and ensure requests route via the Next.js rewrite.

### 5. Authentication Cookies Not Transmitted
- **Cause**: Browser accessing frontend on `127.0.0.1` while backend cookie was set on `localhost`, or cross-origin cookies blocked.
- **Fix**:
  - In local development: Always access the application via `http://localhost:3000`.
  - In production: Access via `https://skyhoch-mini.vercel.app`, allowing Next.js rewrites to proxy `/api/*` within the same origin.

### 6. Production Nginx 502 Bad Gateway
- **Cause**: The API Docker container on EC2 is stopped or failed to bind to `127.0.0.1:5000`.
- **Fix**: Run `docker ps` on the EC2 host. Check `docker logs <api-container-name>`. Verify the container is listening on port 5000.

### 7. Production Prisma Migration Failed
- **Cause**: Schema drift or manual database changes conflict with migration SQL files.
- **Fix**: Check `docker exec <api-container-name> npx prisma migrate status` to identify conflicting migration records before attempting fixes.

---

## 40. Submission & Deployment Verification Checklist

### Local Development Verification
- [x] **Repository Clones Cleanly**: Cloned and verified from source.
- [x] **Docker PostgreSQL Starts**: Verified on port `5433` (DB: `skyhoc`, container: `skyhoc-postgres`).
- [x] **Environment Variables Documented**: Clean templates in `api/.env.example` and `client/.env.example`.
- [x] **Prisma 7 Migrations Applied**: 10 migrations in `api/prisma/migrations/`.
- [x] **Database Seeded**: Demo accounts for Student, Tutor, Department Head, Super Admin.
- [x] **Backend Starts Cleanly**: Express running on port `5000` with `/health` check.
- [x] **Frontend Starts Cleanly**: Next.js App Router running on port `3000`.
- [x] **Student Authentication Works**: Sign up, login, `/me`, refresh, and logout verified.
- [x] **httpOnly Cookie Security**: Zero client token exposure in `document.cookie`.
- [x] **Student Dashboard Verified**: Enrolled courses and upcoming live classes rendered.
- [x] **IDOR / BOLA Prevention**: Verified; student cannot query unenrolled courses.
- [x] **Attendance Engine Functional**: Interval resolution, boundary clamping, missing LEAVE auto-close.
- [x] **Automated Tests Passing**: 26/26 Vitest unit tests passing in `attendance-calculator.service.spec.ts`.
- [x] **Admin Courses Protected**: `STUDENT`/`TUTOR` receive `403 Forbidden`; `DEPARTMENT_HEAD`/`SUPER_ADMIN` receive course data.
- [x] **Server-Side Cookie Verification**: Next.js Server Components verifying auth server-to-server.
- [x] **Responsive Mobile Layout**: Validated across mobile and desktop breakpoints.
- [x] **Architecture Questions Answered**: Comprehensive sections on webhooks and Bunny Stream.
- [x] **Zero Application Code Modified**: Integrity of all existing codebase files preserved.

### Production Deployment Verification
- [x] **Live Frontend Deployed**: Verified at [`https://skyhoch-mini.vercel.app`](https://skyhoch-mini.vercel.app).
- [x] **Live Backend API Deployed**: Verified at [`https://3.26.131.202.nip.io`](https://3.26.131.202.nip.io).
- [x] **HTTPS Termination Verified**: Nginx proxies incoming TLS traffic to the Docker API container.
- [x] **Same-Origin API Rewrite**: Next.js rewrites `/api/*` to avoid cross-origin cookie issues.
- [x] **CI/CD Image Publishing**: GitHub Actions workflow publishes Docker images to GHCR.
- [x] **Production Migration Path Documented**: `npx prisma migrate deploy` documented for safe production deployment.
- [x] **Database & Port Shielding**: PostgreSQL and internal API ports protected from public internet exposure.

---

*Authored for the Skyhoch Mini Technical Assessment.*
