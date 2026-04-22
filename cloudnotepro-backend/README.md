# CloudNotePro Backend

Express + MongoDB REST API for authentication, RBAC, and notes CRUD.

## Prerequisites

- Node.js 20+
- npm
- MongoDB (local) or Docker

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Fill required values:

| Variable | Required | Notes |
| --- | --- | --- |
| `PORT` | Yes | API port (`5000` by default) |
| `MONGO_URI` | Yes | Mongo connection URI |
| `JWT_SECRET` | Yes | Access token signing secret |
| `ACCESS_TOKEN_EXPIRY` | No | Access token TTL (default `1h`) |
| `RESET_JWT_SECRET` | Yes | Password-reset token signing secret |
| `BREVO_API_KEY` | Yes | Brevo transactional email API key |
| `CLIENT_RESET_URL` | Yes | Frontend reset URL (example: `http://localhost:3000/verify`) |

4. Start API:

```bash
npm start
```

Base URL: `http://localhost:5000`

## API usage (v1)

### Auth

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/getuser` (auth required)
- `PUT /api/v1/auth/changepassword` (auth required)
- `POST /api/v1/auth/mailreset`
- `GET /api/v1/auth/verify?token=...`
- `PUT /api/v1/auth/resetpassword`
- `GET /api/v1/auth/admin/proof` (auth + admin required)

### Notes

- `POST /api/v1/notes/add` (auth required)
- `GET /api/v1/notes/fetch` (auth required)
- `PUT /api/v1/notes/update/:id` (auth required)
- `DELETE /api/v1/notes/delete/:id` (auth required)

Auth-protected routes require header:

```http
auth-token: <jwt>
```

## API collection

Import `thunder-collection_CloudNotePro.json` in Thunder Client and set variables:

- `baseUrl`
- `userToken`
- `adminToken`
- `userId`
- `noteId`
- `resetToken`

Collection uses `/api/v1/*` routes and secret-free placeholders only.

## Docker Compose (API + Mongo)

From repository root:

```bash
docker compose up --build
```

This starts:

- API: `http://localhost:5000`
- MongoDB: `localhost:27017`

To stop:

```bash
docker compose down
```

To stop and remove Mongo volume:

```bash
docker compose down -v
```

### Troubleshooting

- `Missing required environment variables...`: ensure `cloudnotepro-backend/.env` exists and all required keys are set.
- API cannot reach Mongo: in compose mode, `MONGO_URI` must resolve to `mongodb://mongo:27017/cloudnotepro` (already overridden in `docker-compose.yml`).
- Port conflict on `5000` or `27017`: stop local services using those ports or remap ports in compose.

## Scalability note

Current structure is modular (routes/models/middleware/utils) and can scale by:

1. Splitting auth and notes into separate services behind an API gateway.
2. Adding Redis for token/session-adjacent caching and high-read note workloads.
3. Running stateless API replicas behind a load balancer with centralized logging/metrics.
4. Moving async tasks (email sending, audit logs) to a queue worker.

## Final smoke matrix (reviewer handoff)

Use this matrix for final submission verification across auth, CRUD, RBAC, reset, and docker startup.

| Area | Check | How to run | Expected result |
| --- | --- | --- | --- |
| Auth | Signup/Login | Thunder requests: `Signup`, `Login (User)` | `200`, `success: true`, JWT in `authtoken` |
| Auth | Protected profile | Thunder request: `Get User` with `auth-token={{userToken}}` | `200`, user object without password |
| Notes CRUD | Create/Read/Update/Delete | Thunder requests: `Add New Note` → `Fetch All Notes` → `Update Note` → `Delete Note` | All succeed (`200`) and reflect note state transitions |
| RBAC | Admin gate | Thunder request: `Admin Proof Endpoint` with `auth-token={{adminToken}}` and then user token | Admin returns `200`; non-admin returns `403` |
| Reset flow | Mail/Verify/Reset | Thunder requests: `Reset Password Mail` → `Verify Password Reset` → `Reset Password` | Mail endpoint responds generically, valid token verifies, reset succeeds |
| Docker | API + Mongo startup | From repo root: `docker compose up --build` | Mongo healthy, API reachable on `http://localhost:5000` |
| Docker | API connectivity | `curl http://localhost:5000/api/v1/auth/getuser` (without token) | `401` auth error response JSON |

### Captured status in this environment

- ✅ Thunder collection JSON parses successfully.
- ✅ Backend changed route/middleware files pass `node --check`.
- ⚠️ Dockerized startup/connectivity checks are **not executable here** because `docker` is unavailable in this runtime (`docker: command not found`).

## Submission verification checklist

- [ ] `.env` configured with all required variables.
- [ ] `npm start` runs API locally.
- [ ] Signup/login returns JWT and protected routes accept `auth-token`.
- [ ] Role claim exists in token and `/api/v1/auth/admin/proof` returns `200` for admin, `403` for non-admin.
- [ ] Notes CRUD works end-to-end.
- [ ] Reset flow endpoints (`mailreset`, `verify`, `resetpassword`) work with configured `CLIENT_RESET_URL`.
- [ ] Thunder collection imports and runs with placeholder variables.
- [ ] `docker compose up --build` starts API + Mongo successfully.

Go to [Frontend](https://github.com/Ankan-cyber/cloudnotepro-frontend)
