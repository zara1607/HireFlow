# HireFlow — Project Audit

**Audit date:** 2026-10-01  
**Auditor role:** Senior engineer / MVP completion pass  
**Scope:** Full-stack recruitment platform (JOB_SEEKER + RECRUITER)

---

## Executive Summary

HireFlow is a **substantially complete** full-stack MVP. The backend implements REST APIs, MongoDB/Mongoose models, JWT auth, RBAC, job CRUD, applications with duplicate prevention, pipeline status updates, resume uploads, notifications, and Socket.IO chat. The React client provides role-based routing, dashboards, job marketplace, apply flow, recruiter Kanban pipeline, profiles, chat, and notifications.

**Automated verification:** All 20 steps in `server/scripts/test-api.js` passed against a running HireFlow server (in-memory MongoDB fallback when local MongoDB is unavailable).

**Fixes applied during this audit:** Authenticated resume download in the UI, real-time application status on candidate pages via Socket.IO, job details “already applied” state, and `API_BASE` env support for integration tests.

---

## Feature Audit

### Authentication

| Item | Status | Notes |
|------|--------|-------|
| Registration | **COMPLETE** | `POST /api/auth/register` — JOB_SEEKER / RECRUITER |
| Login | **COMPLETE** | `POST /api/auth/login` |
| Logout | **COMPLETE** | Client clears `localStorage` (stateless JWT) |
| JWT handling | **COMPLETE** | Bearer token; axios interceptor |
| Password hashing | **COMPLETE** | bcrypt pre-save on User model |
| Current user / session | **COMPLETE** | `GET /api/auth/me` + AuthContext bootstrap |
| Protected routes | **COMPLETE** | `protect` middleware + `ProtectedRoute` |
| Role-based authorization | **COMPLETE** | `authorize()` on routes |
| Unauthorized access handling | **COMPLETE** | 401/403 JSON responses; tested cross-role and cross-recruiter |

### Candidate functionality

| Item | Status | Notes |
|------|--------|-------|
| Candidate registration | **COMPLETE** | RegisterPage + API |
| Candidate profile | **COMPLETE** | ProfilePage; skills, education, experience |
| Resume | **COMPLETE** | Upload via profile or apply modal |
| Job browsing / search / filter | **COMPLETE** | JobMarketplacePage + `GET /api/jobs` query params |
| Job details | **COMPLETE** | JobDetailsPage |
| Apply for jobs | **COMPLETE** | ApplyModal → `POST /api/applications` |
| Duplicate application prevention | **COMPLETE** | App logic + unique index `{ candidate, job }` |
| Application history | **COMPLETE** | ApplicationsPage |
| Application status visibility | **COMPLETE** | API + UI; socket refresh on dashboard/applications |

### Recruiter functionality

| Item | Status | Notes |
|------|--------|-------|
| Recruiter registration | **COMPLETE** | companyName on register |
| Company profile | **COMPLETE** | Recruiter ProfilePage |
| Create / edit / delete job | **COMPLETE** | CRUD + ownership checks |
| View own jobs | **COMPLETE** | JobsListPage + `GET /api/jobs/recruiter/my-jobs` |
| View applicants | **COMPLETE** | Per-job pipeline + dashboard |
| Candidate details | **COMPLETE** | ApplicantPipeline modal |
| Application status management | **COMPLETE** | PATCH status + notifications |

### Recruitment pipeline (APPLIED → SHORTLISTED → INTERVIEW → REJECTED → HIRED)

| Status | Status | Notes |
|--------|--------|-------|
| APPLIED | **COMPLETE** | Default on apply |
| SHORTLISTED | **COMPLETE** | Tested E2E |
| INTERVIEW | **COMPLETE** | Tested E2E |
| REJECTED | **COMPLETE** | Enum + UI (not in default E2E path) |
| HIRED | **COMPLETE** | Tested E2E |
| Recruiter updates status | **COMPLETE** | Kanban dropdown + modal |
| Candidate sees updates | **COMPLETE** | Refresh via API; live update via `application_updated` socket |

### Dashboard

| Item | Status | Notes |
|------|--------|-------|
| Candidate — total applications | **COMPLETE** | Dashboard KPI cards |
| Candidate — status summary | **COMPLETE** | Shortlisted / interview / hired counts |
| Candidate — recent applications | **COMPLETE** | Last 5 with links |
| Recruiter — total / open jobs | **COMPLETE** | KPI cards |
| Recruiter — total applicants | **COMPLETE** | |
| Recruiter — recent / pipeline | **COMPLETE** | Full Kanban on dashboard |

### Backend

| Item | Status | Notes |
|------|--------|-------|
| API routes | **COMPLETE** | auth, users, jobs, applications, conversations, notifications |
| Controllers | **COMPLETE** | Thin controllers, logic in place |
| Services layer | **NOT REQUIRED FOR MVP** | Logic lives in controllers (acceptable for student project) |
| Models | **COMPLETE** | User, Job, Application, Conversation, Message, Notification |
| Middleware | **COMPLETE** | auth, roles, upload, errorHandler |
| Validation | **PARTIALLY IMPLEMENTED** | Mongoose schema + controller checks; no express-validator |
| Error handling | **COMPLETE** | Central handler; duplicate key, validation, multer |
| HTTP status codes | **COMPLETE** | Appropriate 201/400/401/403/404 |
| Auth / authz middleware | **COMPLETE** | |

### Database

| Item | Status | Notes |
|------|--------|-------|
| Schemas | **COMPLETE** | |
| References | **COMPLETE** | candidate, job, recruiter on Application |
| Indexes | **COMPLETE** | Text search on jobs; compound unique on applications |
| Timestamps | **COMPLETE** | `timestamps: true` |
| Duplicate prevention | **COMPLETE** | Email unique; application compound unique |

### Frontend

| Item | Status | Notes |
|------|--------|-------|
| Routing | **COMPLETE** | AppRoutes.jsx |
| Protected / role routes | **COMPLETE** | |
| API integration | **COMPLETE** | axios services |
| Loading / error / empty states | **COMPLETE** | Shared components used |
| Form validation | **PARTIALLY IMPLEMENTED** | Basic client checks |
| Responsive UI | **COMPLETE** | Tailwind responsive layouts |

### Security

| Item | Status | Notes |
|------|--------|-------|
| Password hashing | **COMPLETE** | bcrypt |
| JWT | **PARTIALLY IMPLEMENTED** | Works; dev fallback secret if `JWT_SECRET` unset (see Priority List) |
| Environment variables | **COMPLETE** | `.env.example` for client and server |
| CORS | **PARTIALLY IMPLEMENTED** | Permissive in dev; production callback still allows all origins |
| Authorization | **COMPLETE** | Tested |
| Input validation | **PARTIALLY IMPLEMENTED** | Schema-level |
| File upload validation | **COMPLETE** | Extension, MIME, 5MB |
| Secret exposure | **COMPLETE** | `.env` gitignored |

### Deployment / readiness

| Item | Status | Notes |
|------|--------|-------|
| `.env.example` | **COMPLETE** | |
| `.gitignore` | **COMPLETE** | |
| Docker | **COMPLETE** | docker-compose + Dockerfiles + nginx proxy |
| Production build | **COMPLETE** | `npm run build` in client succeeds |
| README | **COMPLETE** | Detailed; mentions MIT LICENSE (file not present) |
| Tests | **COMPLETE** | `npm run test:api` (requires running server) |

### Chat & notifications (secondary)

| Item | Status | Notes |
|------|--------|-------|
| Chat | **COMPLETE** | REST + Socket.IO; included in API test suite |
| Notifications | **COMPLETE** | DB + socket emit on apply/status/message |

---

## Manual / API Testing Performed

Environment: Windows, Node v23, no local MongoDB → server used **MongoMemoryServer** fallback.

| # | Flow step | Result |
|---|-----------|--------|
| 1–20 | Full `test-api.js` suite | **PASS** |
| — | Recruiter B cannot edit Recruiter A's job | **403** as expected |
| — | Health on wrong process on `:5000` | Different app responded (not HireFlow) — see P0 below |
| — | Client production build | **PASS** |

**Note:** End-to-end browser UI was not automated in this session; API suite covers the same business flows the UI calls.

---

## Priority Fix List

### P0 — Application cannot function / critical environment issue

| Feature | Current state | Problem | Root cause | Required change | Files likely affected | Priority |
|---------|---------------|---------|------------|-----------------|----------------------|----------|
| Local dev port conflict | Another service may occupy `:5000` | Frontend/tests hit **wrong API** (registration fails with alien schema) | HireFlow defaults to 5000; no startup port check | Document; use free port or stop conflicting process; verify health returns `service: "HireFlow API"` | `README.md`, `server/.env`, `client/.env` | **P0** (environment) |

### P1 — Core MVP (fixed in this pass)

| Feature | Current state | Problem | Root cause | Required change | Files | Priority |
|---------|---------------|---------|------------|-----------------|-------|----------|
| Resume download (UI) | **Was BROKEN** | `window.open` to protected URL without JWT → 401 | Download URL not auth-aware | Blob download via axios + Bearer token | `applicationService.js`, `ApplicantPipeline.jsx` | **P1** → **FIXED** |
| Candidate live status | **Was PARTIAL** | Status only updated on full page reload | No socket listener on candidate views | Listen for `application_updated` | `DashboardPage.jsx`, `ApplicationsPage.jsx` | **P1** → **FIXED** |
| Job details duplicate UX | **Was PARTIAL** | User could open apply modal again until API error | No client-side applied state | Show “Already Applied” when job in my-applications | `JobDetailsPage.jsx` | **P1** → **FIXED** |
| API test portability | **Was PARTIAL** | Hardcoded `localhost:5000` | Fixed URL in script | `API_BASE` env variable | `server/scripts/test-api.js` | **P1** → **FIXED** |

### P2 — Important UX / reliability / security

| Feature | Current state | Problem | Root cause | Required change | Files | Priority |
|---------|---------------|---------|------------|-----------------|-------|----------|
| JWT dev fallback | Works but risky | Default secret in code if env missing | `token.js`, `auth.js` | Fail fast in production if `JWT_SECRET` unset | `server/src/utils/token.js`, `server/src/server.js` | P2 |
| CORS production | Permissive | `callback(null, true)` for all origins | `app.js` cors config | Restrict to `CLIENT_URL` in production | `server/src/app.js` | P2 |
| Logout UX | No dedicated API | Stateless JWT only | By design | Optional: client redirect already works | — | P2 |
| Unit/component tests | Missing | Only integration script | No Jest/Vitest setup | Add later if required by rubric | — | P2 |
| LICENSE file | Missing | README references MIT | Not committed | Add LICENSE or fix README | root | P3 |

### P3 — Nice-to-have

| Feature | Current state | Problem | Required change | Priority |
|---------|---------------|---------|-------------------|----------|
| Dedicated service layer | Controllers only | Larger codebase harder to test | Extract services | P3 |
| Password reset | Missing | Not in MVP spec | Email flow | P3 |
| Pagination UI | API supports page/limit | Marketplace may load 12 only | “Load more” | P3 |

---

## Final Status

### MVP feature checklist

| MVP requirement | Final status |
|-----------------|--------------|
| Authentication | **COMPLETE** |
| Role-based authorization | **COMPLETE** |
| Candidate profiles | **COMPLETE** |
| Recruiter / company profiles | **COMPLETE** |
| Job create / edit / delete | **COMPLETE** |
| Job browse / search / filter | **COMPLETE** |
| Job details | **COMPLETE** |
| Job applications | **COMPLETE** |
| Duplicate application prevention | **COMPLETE** |
| Candidate application tracking | **COMPLETE** |
| Recruiter applicant management | **COMPLETE** |
| Application status pipeline | **COMPLETE** |
| Candidate dashboard | **COMPLETE** |
| Recruiter dashboard | **COMPLETE** |
| Basic resume functionality | **COMPLETE** |
| Error handling | **COMPLETE** |
| Responsive professional UI | **COMPLETE** |

### Architecture

Monorepo: **React (Vite) SPA** → **Express REST API** → **MongoDB (Mongoose)**. **Socket.IO** on the same HTTP server for notifications, chat, and application status events. Optional **Docker Compose** stack: Mongo + API + nginx-served client.

```
Browser → client (5173 dev / 80 docker)
       → /api/* → Express (5000)
       → Socket.IO
       → MongoDB (Atlas, local, or in-memory dev fallback)
```

### Backend — important APIs

| Area | Endpoints |
|------|-----------|
| Auth | `POST /api/auth/register`, `login`, `GET me`, `PUT update-password` |
| Users | `GET/PUT /api/users/profile`, `POST /api/users/resume`, `GET /api/users/candidate/:id` |
| Jobs | `GET/POST /api/jobs`, `GET/PUT/DELETE /api/jobs/:id`, `GET /api/jobs/recruiter/my-jobs` |
| Applications | `POST /api/applications`, `GET my-applications`, `GET job/:jobId`, `GET recruiter/all`, `PATCH :id/status`, `GET :id/resume` |
| Chat | `GET/POST /api/conversations`, `GET/POST .../messages` |
| Notifications | `GET /api/notifications`, `PATCH mark-all-read`, etc. |
| Health | `GET /api/health` |

### Database — models & relationships

- **User** — auth + role-specific profile (seeker: skills/education/experience/resume; recruiter: company fields)
- **Job** — `recruiter` → User
- **Application** — `candidate`, `job`, `recruiter` → User/Job; unique (candidate, job)
- **Conversation** / **Message** — participants, optional job context
- **Notification** — recipient, sender, type, link

### Frontend — major pages

- **Public:** Landing, Login, Register, Job marketplace, Job details
- **Candidate:** Dashboard, Profile, Applications, Chat, Notifications
- **Recruiter:** Dashboard, Profile, Jobs list, Create/Edit job, Applicants pipeline, Chat, Notifications
- **Shared components:** Navbar, ProtectedRoute, JobCard, ApplyModal, ApplicantPipeline, ChatInterface

### Security mechanisms

- bcrypt passwords; JWT on protected routes; RBAC middleware; job/application ownership checks; multer file validation; helmet; CORS; resume download authorized per application; sanitized filenames for uploads

### Testing — flows verified

- Full recruiter + candidate lifecycle via `npm run test:api` (20 steps)
- Role denial (candidate creates job)
- Duplicate apply
- Pipeline SHORTLISTED → INTERVIEW → HIRED
- Chat + notifications + resume download (API)
- Cross-recruiter job edit denied
- Client production build

### Remaining limitations (honest)

1. **Port 5000 conflicts:** If another app uses 5000, point `PORT` / `VITE_API_URL` / `VITE_SOCKET_URL` to HireFlow’s actual port and confirm health shows `HireFlow API`.
2. **No automated browser E2E** (Cypress/Playwright); manual UI walkthrough recommended before demo.
3. **JWT secret fallback** in development only — must set strong `JWT_SECRET` in production.
4. **CORS** is loose; tighten for production deployment.
5. **In-memory MongoDB** is ephemeral; data lost on server restart when local Mongo is down.
6. **LICENSE** file referenced in README but not in repo.
7. **Chat/notifications** depend on Socket.IO connection; REST fallbacks exist for history.

---

## How to run verification locally

```bash
# Terminal 1 — backend (ensure port 5000 is free OR set PORT)
cd server
npm install
npm run dev

# Confirm HireFlow:
# curl http://localhost:5000/api/health  →  "service": "HireFlow API"

# Terminal 2 — tests (optional alternate port)
cd server
# set API_BASE=http://localhost:5001/api  if server not on 5000
npm run test:api

# Terminal 3 — frontend
cd client
npm install
npm run dev
```

---

*This document reflects the codebase and tests as of the audit completion pass.*
