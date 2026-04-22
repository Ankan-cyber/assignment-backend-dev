# CloudNotePro Frontend

React frontend for CloudNotePro authentication and notes CRUD flows.

## Prerequisites

- Node.js 20+
- npm
- Backend API running on `http://localhost:5000` (default)

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Start frontend:

```bash
npm run start:frontend
```

App runs at: `http://localhost:3000`

## Backend API target

Frontend currently uses a hardcoded API host in `src/App.js`:

```js
const apiHost = "http://localhost:5000";
```

If backend runs on another host/port, update this value before starting frontend.

## Running frontend + backend together

From `cloudnotepro-frontend`:

```bash
npm start
```

This runs:

- `react-scripts start` (frontend)
- backend via `cd ../cloudnotepro-backend && npx nodemon`

## Docker compose note

Current compose setup in repository root provisions backend + Mongo only.  
Run frontend separately with `npm run start:frontend`.

## Feature coverage

- Signup and login
- Account view and password change
- Notes create/read/update/delete
- Password reset request + token verify + reset
- Admin proof trigger from account page

## Submission verification checklist

- [ ] Frontend starts on `localhost:3000`.
- [ ] User can signup/login and receives success/error toasts.
- [ ] Protected routes redirect unauthenticated users to auth page.
- [ ] Notes CRUD works against backend `/api/v1` endpoints.
- [ ] Password reset screens handle valid/invalid token flow.
- [ ] Account page shows user role and can call admin proof endpoint.

Go to [Backend](https://github.com/Ankan-cyber/cloudnotepro-backend)
