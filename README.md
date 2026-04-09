# Next.js × OPA Authorization Demo

A working example of middleware-based authorization using Open Policy Agent.

## Architecture

```
Request
  ↓
middleware.ts          ← extracts identity, calls OPA, allow/deny
  ↓
OPA (:8181)            ← evaluates opa/policies/authz.rego
  ↓
Route Handler          ← zero auth logic, just business data
```

## Project Structure

```
├── middleware.ts              # The integration point — thin, declarative
├── lib/
│   ├── opa.ts                 # OPA REST client (fail-closed)
│   └── auth.ts                # Token → User resolution (replace with JWT decode)
├── opa/
│   └── policies/
│       └── authz.rego         # OPA policy — all authorization rules live here
├── app/
│   ├── api/
│   │   ├── dashboard/route.ts
│   │   ├── reports/route.ts
│   │   ├── reports/export/route.ts
│   │   └── admin/route.ts
│   └── page.tsx               # Interactive playground UI
└── docker-compose.yml
```

## Quick Start

### Option A: Docker Compose (recommended)

```bash
docker-compose up
```

Open http://localhost:3000

### Option B: Run separately

**1. Start OPA**
```bash
docker run -p 8181:8181 \
  -v $(pwd)/opa/policies:/policies \
  openpolicyagent/opa:latest run \
  --server --addr 0.0.0.0:8181 /policies
```

**2. Start Next.js**
```bash
npm install
npm run dev
```

Open http://localhost:3000

## Test Users

| Token              | Role    | Can access                                      |
|--------------------|---------|--------------------------------------------------|
| token-admin        | admin   | Everything                                       |
| token-editor       | editor  | dashboard, reports, reports/export (weekdays)   |
| token-viewer       | viewer  | dashboard, reports (read-only)                  |
| token-guest        | guest   | dashboard only                                  |
| token-viewer-plus  | viewer  | + reports:write (explicit permission grant)     |

## Test via curl

```bash
# Allowed
curl "http://localhost:3000/api/dashboard?token=token-viewer"

# Forbidden (viewer can't access admin)
curl "http://localhost:3000/api/admin?token=token-viewer"

# Forbidden (guest can't read reports)
curl "http://localhost:3000/api/reports?token=token-guest"

# Admin can do everything
curl "http://localhost:3000/api/admin?token=token-admin"

# Export requires reports:export (editor+ only, weekdays)
curl -X POST "http://localhost:3000/api/reports/export?token=token-editor"
```

## Query OPA Directly

```bash
# Check if viewer can read dashboard
curl -s -X POST http://localhost:8181/v1/data/authz \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user": { "id": "u3", "role": "viewer", "permissions": [] },
      "action": "dashboard:read"
    }
  }' | jq .

# Check if guest can access admin
curl -s -X POST http://localhost:8181/v1/data/authz \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user": { "id": "u4", "role": "guest", "permissions": [] },
      "action": "admin:read"
    }
  }' | jq .
```

## Key Design Decisions

**Fail closed**: if OPA is unreachable, requests are denied (lib/opa.ts).

**Declarative routes**: adding a new protected route is one line in `ROUTE_ACTIONS` in middleware.ts. Handlers never change.

**Separation of concerns**:
- `authz.rego` — what roles/permissions allow what actions (owned by platform/security team)
- `middleware.ts` — wires identity to OPA evaluation (owned by platform team)
- Route handlers — pure business logic, no auth awareness (owned by app team)

**Explicit grants**: `permissions[]` on the user object allows granting specific actions beyond what a role provides, without changing role definitions (see token-viewer-plus).
