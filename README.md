# 💼 HireFlow — Next-Generation Recruitment & Career Platform

HireFlow is a production-minded full-stack recruitment platform connecting **Job Seekers** and **Recruiters**. Designed with a modern, high-performance architecture, HireFlow eliminates black-box job applications through transparent applicant stage tracking, resume management, and realtime in-app recruiter-candidate communication.

---

## 🌟 Key Features

### 👤 For Job Seekers
- **Role Registration & Authentication**: Secure sign-up/login with bcrypt password hashing and JWT sessions.
- **Dynamic Job Marketplace**: Browse and filter opportunities by keyword, city, remote status, employment model (Full-Time, Part-Time, Contract, Internship, Remote), and experience level.
- **Dedicated Job View**: Comprehensive descriptions, tech stack tags, and hiring team details.
- **Rich Candidate Profile**: Maintain professional headlines, bios, skill tags, career experiences, and educational background.
- **Resume Upload & Management**: Upload and store resumes (PDF, DOC, DOCX up to 5MB) with Multer validation; reuse saved resumes or upload position-specific resumes during application.
- **Transparent Application Tracker**: View applications in real time categorized by status: `APPLIED` → `SHORTLISTED` → `INTERVIEW` → `HIRED` / `REJECTED`.
- **Live In-App Chat**: Direct messaging with recruiters via Socket.IO.
- **Realtime Notifications**: Instant notification toasts and center alerts for application status changes and new messages.

### 🏢 For Recruiters & Hiring Teams
- **Job Requisition Management**: Post, edit, close, and delete job openings with salary ranges, experience tiers, and skill prerequisites.
- **Visual Recruitment Pipeline**: Kanban-style applicant board grouped into 5 stages (`APPLIED`, `SHORTLISTED`, `INTERVIEW`, `HIRED`, `REJECTED`).
- **One-Click Candidate Progression**: Transition candidate stages with automatic real-time notification alerts sent to candidates.
- **Candidate Profiles & Resumes**: Inspect candidate details, cover letters, and securely download verified resume attachments.
- **Multi-Requisition Dashboard**: Key metric cards for active jobs, total candidates, ongoing interviews, and placements.
- **Company Branding**: Manage company bio, website, and headquarters location.
- **Direct Candidate Messaging**: Realtime messaging window with applicant and job context.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** & **Vite** — High-speed reactive UI development
- **Tailwind CSS** — Modern, responsive utility-first styling
- **React Router 6** — Declarative client-side routing with role guards
- **Axios** — HTTP client with Bearer token request and response interceptors
- **Lucide React** — Crisp icon system
- **Socket.IO Client** — Realtime bidirectional event communication

### Backend
- **Node.js** & **Express.js** — Modular RESTful backend API
- **MongoDB** & **Mongoose** — Document store with schema validation, indexing, and cascade handling
- **Socket.IO** — Room-based realtime chat and notifications
- **Multer** — Safe filesystem resume uploads with MIME and extension validation
- **JWT & bcryptjs** — Secure authentication and password hashing
- **Helmet & CORS** — Production security headers and origin management
- **MongoMemoryServer** — Automatic local in-memory fallback for zero-friction testing

---

## 📁 Project Architecture

```
HireFlow/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Navbar, Footer, Badge, Modal, LoadingSpinner, EmptyState, ToastAlert
│   │   │   ├── jobs/           # JobCard, ApplyModal
│   │   │   ├── applications/   # ApplicantPipeline (Kanban board)
│   │   │   └── chat/           # ChatInterface (two-column realtime chat)
│   │   ├── context/            # AuthContext, SocketContext, NotificationContext
│   │   ├── layouts/            # MainLayout, DashboardLayout
│   │   ├── pages/
│   │   │   ├── common/         # LandingPage, LoginPage, RegisterPage, JobMarketplacePage, JobDetailsPage
│   │   │   ├── candidate/      # DashboardPage, ProfilePage, ApplicationsPage, ChatPage, NotificationsPage
│   │   │   └── recruiter/      # DashboardPage, ProfilePage, JobsListPage, CreateJobPage, EditJobPage, ApplicantsPipelinePage, ChatPage, NotificationsPage
│   │   ├── routes/             # AppRoutes.jsx (Role-based route definitions)
│   │   ├── services/           # api.js, authService, jobService, applicationService, chatService, notificationService
│   │   ├── utils/              # constants.js (formatting, badges, status configs)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/             # db.js (MongoDB / Atlas / In-memory fallback)
│   │   ├── controllers/        # auth, user, job, application, conversation, notification
│   │   ├── middleware/         # auth.js, roles.js, upload.js, errorHandler.js
│   │   ├── models/             # User, Job, Application, Conversation, Message, Notification
│   │   ├── routes/             # authRoutes, userRoutes, jobRoutes, applicationRoutes, conversationRoutes, notificationRoutes
│   │   ├── sockets/            # socketHandler.js
│   │   ├── utils/              # token.js
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/resumes/        # Upload destination (.gitkeep)
│   ├── scripts/                # Automated API test suite
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hireflow
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
*(If a native local MongoDB server is not running on port 27017, the server will automatically spin up an in-memory dev database for testing and local exploration)*

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Running Locally

### 1. Prerequisites
- **Node.js** (v18+ or v20+)
- **npm** (v9+)

### 2. Backend Setup
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:5000` (or the port in `server/.env`). You will see:
```
🚀 HireFlow Server running on port 5000
📡 Client URL: http://localhost:5173
🩺 Health check: http://localhost:5000/api/health
```

In development, startup idempotently seeds demo recruiter and candidate accounts plus 28 categorized job listings. Sign in with `recruiter@hireflow.dev` or `candidate@hireflow.dev`; both use `Password123!`. Set `SEED_DEMO_DATA=false` in `server/.env` to disable automatic seeding. You can also run `npm run seed` from the project root to seed an existing development database.

**Troubleshooting:** If registration or login fails with unexpected validation errors, another app may be using port 5000. Confirm the health response includes `"service": "HireFlow API"`. If not, stop the conflicting process or set `PORT` in `server/.env` and matching `VITE_API_URL` / `VITE_SOCKET_URL` in `client/.env`. For integration tests on a non-default port: `API_BASE=http://localhost:PORT/api npm run test:api`.

### 3. Frontend Setup
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
The client will start on `http://localhost:5173`. Open your browser to explore HireFlow!

---

## 🧪 Automated Testing

HireFlow includes an automated integration test suite that tests the entire user lifecycle, authentication, role authorization, job creation, application submission, pipeline transitions, and messaging:

```bash
cd server
npm run test:api
```

---

## 🐳 Docker Deployment

To launch the full stack (Frontend, Backend, and MongoDB) with a single command:

```bash
export JWT_SECRET="replace-with-a-long-random-secret"
docker-compose up --build
```

On PowerShell, set it with `$env:JWT_SECRET = "replace-with-a-long-random-secret"` before running `docker-compose up --build`. Production deployments should also set `CLIENT_URL` to the exact public origin of the frontend.

- **Frontend**: `http://localhost` (Port 80)
- **Backend API**: `http://localhost:5000`
- **MongoDB**: `localhost:27017`

---

## 🔒 Security & Authorization

- **Password Security**: Salted password hashing with `bcryptjs`.
- **JWT Protection**: Tokens signed with HS256, verified on protected endpoints.
- **Role-Based Access Control (RBAC)**:
  - Candidates cannot create, edit, or delete job postings.
  - Recruiters cannot submit job applications.
  - Recruiters can only access and update applications for jobs they own.
- **Upload Validation**: Multer disk storage restricted to `.pdf`, `.doc`, `.docx` files under 5MB with sanitized naming to prevent path traversal.
- **CORS & Helmet**: Security headers enabled and origin whitelist enforcement.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
