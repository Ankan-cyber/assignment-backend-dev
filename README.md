# CloudNotePro (Assignment Monorepo)

CloudNotePro is a MERN-style assignment project with:

- **Backend**: Express + MongoDB API with JWT auth, RBAC, reset-password flow, and notes CRUD
- **Frontend**: React client for auth, account, notes, and reset flows

## Repository structure

- `cloudnotepro-backend/` — API server, models, middleware, routes, Thunder collection
- `cloudnotepro-frontend/` — React application
- `docker-compose.yml` — local API + Mongo startup

## Prerequisites

- Node.js 20+
- npm
- MongoDB (if not using Docker)
- Docker (optional, for compose workflow)

## Quick start

### 1. Backend

```bash
cd cloudnotepro-backend
npm install
cp .env.example .env
npm start
```

Backend base URL: `http://localhost:5000`

### 2. Frontend

```bash
cd cloudnotepro-frontend
npm install
npm run start:frontend
```

Frontend URL: `http://localhost:3000`

Frontend expects backend at `http://localhost:5000` (configured in `cloudnotepro-frontend/src/App.js`).

## Docker Compose (backend + mongo)

From repository root:

```bash
docker compose up --build
```

Services started:

- API on `http://localhost:5000`
- MongoDB on `localhost:27017`

Stop:

```bash
docker compose down
```

Remove Mongo data volume too:

```bash
docker compose down -v
```

## API highlights (`/api/v1`)

### Auth

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/getuser`
- `PUT /api/v1/auth/changepassword`
- `POST /api/v1/auth/mailreset`
- `GET /api/v1/auth/verify?token=...`
- `PUT /api/v1/auth/resetpassword`
- `GET /api/v1/auth/admin/proof` (admin-only)

### Notes

- `POST /api/v1/notes/add`
- `GET /api/v1/notes/fetch`
- `PUT /api/v1/notes/update/:id`
- `DELETE /api/v1/notes/delete/:id`

Protected routes require:

```http
auth-token: <jwt>
```

## API collection

Import:

- `cloudnotepro-backend/thunder-collection_CloudNotePro.json`

Set collection variables:

- `baseUrl`
- `userToken`
- `adminToken`
- `userId`
- `noteId`
- `resetToken`

## Frontend feature coverage

- Signup/login UI
- Protected account page + password change
- Notes CRUD UI
- Reset-password request/verify/reset UI
- Admin proof trigger from account page

## Scalability note (concise)

The backend is modular (routes/models/middleware/utils) and can scale by splitting bounded modules into services, adding Redis for cache-heavy reads, running stateless API replicas behind a load balancer, and moving email/audit work to background queues.

## Detailed docs

- Backend docs: `cloudnotepro-backend/README.md`
- Frontend docs: `cloudnotepro-frontend/README.md`
