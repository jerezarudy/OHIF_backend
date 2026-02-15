# ohif-dental-backend

Simple Node.js/Express backend for an OHIF dental demo.

## Features
- `POST /auth/login` issues a JWT (demo username/password via env vars)
- `GET /api/state` returns the saved JSON state for the authenticated user
- `PUT /api/state` stores a JSON state for the authenticated user (persisted to `data/state.json`)
- `GET /health` basic health check

## Requirements
- Node.js (ESM project; `"type": "module"` in `package.json`)

## Setup
```bash
npm install
```

## Run
```bash
npm run dev
```

By default it listens on `http://localhost:4010`.

## Configuration (env)
- `PORT` (default: `4010`)
- `JWT_SECRET` (default: `dev-only-change-me`) — set this in production
- `DEMO_USER` (default: `demo`)
- `DEMO_PASS` (default: `demo`)

## API usage (curl)
Login:
```bash
curl -sS -X POST http://localhost:4010/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"demo\",\"password\":\"demo\"}"
```

Save state:
```bash
TOKEN="..."; \
curl -sS -X PUT http://localhost:4010/api/state \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"state\":{\"hello\":\"world\"}}"
```

Load state:
```bash
TOKEN="..."; \
curl -sS http://localhost:4010/api/state \
  -H "Authorization: Bearer $TOKEN"
```

