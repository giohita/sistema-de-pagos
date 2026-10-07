# PayLinkHub

Payment ecosystem aggregator + monitoring panel for the Credicorp Bank technical assessment.

**Stack:** React + Node/TypeScript monorepo managed with pnpm workspaces.

- `apps/api` — Fastify backend that orchestrates upstream providers.
- `apps/web` — Vite + React panel that consumes the backend.
- `packages/types` — shared canonical domain types.
- `packages/ts-config` — shared TypeScript presets.

## What it does

`GET /api/v1/dashboard/:customerId` returns a canonical dashboard with:

- Customer data from `dummyjson.com/users/{id}`.
- Transactions from `dummyjson.com/carts/user/{id}`.
- FX conversion to EUR/GBP from `api.frankfurter.dev`.
- Provider health status and latency.
- `partial: true` + `warnings[]` when any upstream fails, while still returning HTTP 200.

Sensitive fields from the CORE provider (`password`, `ssn`, `bank.cardNumber`, `crypto.wallet`) are explicitly filtered out and never leave the API.

## Prerequisites

- Node.js >= 18
- pnpm >= 9

## Run locally

```bash
# 1. Clone and install
git clone https://github.com/giohita/sistema-de-pagos.git
cd sistema-de-pagos
pnpm install

# 2. Configure environment
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local

# 3. Run both apps
pnpm dev
```

- API: http://localhost:3001
- Panel: http://localhost:5173

## Example curl

```bash
curl http://localhost:3001/api/v1/dashboard/1
```

Example response (truncated):

```json
{
  "customer": {
    "id": 1,
    "fullName": "Emily Johnson",
    "email": "emily.johnson@x.dummyjson.com",
    "phone": "+81 965-431-3024",
    "address": { "street": "626 Main Street", "city": "Phoenix", "country": "United States" }
  },
  "transactions": [
    { "id": 162, "title": "Blue Frock", "quantity": 4, "totalUsd": 119.96, "totalEur": 107.33, "totalGbp": 90.85 }
  ],
  "summary": { "count": 4, "totalUsd": 13037.88 },
  "fx": { "base": "USD", "rates": { "EUR": 0.89469, "GBP": 0.75731 } },
  "providers": {
    "core": { "healthy": true, "latencyMs": 539 },
    "pagos": { "healthy": true, "latencyMs": 536 },
    "fx": { "healthy": true, "latencyMs": 423 },
    "inestable": { "healthy": false, "error": "inestable: http_5xx" }
  },
  "partial": true,
  "warnings": ["Provider 'inestable' did not respond (http_5xx); partial data returned."]
}
```

## Canonical contract

The API exposes a single canonical model independent of upstream formats:

```json
{
  "customer": { "id", "fullName", "email", "phone", "address" },
  "transactions": [ { "id", "title", "quantity", "totalUsd", "totalEur", "totalGbp" } ],
  "summary": { "count", "totalUsd" },
  "fx": { "base", "rates" },
  "providers": { "core", "pagos", "fx", "inestable": { "healthy", "latencyMs", "error" } },
  "partial": false,
  "warnings": []
}
```

## Key technical decisions

1. **Adapter pattern** — each upstream implements `IProviderAdapter`; the orchestrator doesn't know external formats.
2. **No pass-through** — CORE strips `password`, `ssn`, `bank.cardNumber`, `crypto.wallet`.
3. **Resilience** — per-provider timeout (2s), exponential backoff retry only on `5xx`/`timeout`/`network`, never on `4xx`.
4. **Graceful degradation** — upstream failures result in HTTP 200 with `partial: true` and `warnings[]`.
5. **Backend FX cache** — in-memory TTL cache for EUR/GBP rates to avoid hitting Frankfurter on every dashboard request.
6. **Frontend cache** — TanStack Query handles browser-side cache and 30s auto-refresh.
7. **Structured provider logs** — every upstream call logs provider alias, attempt, latency, and outcome as JSON.
8. **OOP + Repository** — domain models and repository interfaces for future persistence.

## Upstream providers

| Alias | Endpoint | Purpose |
|-------|----------|---------|
| CORE | `dummyjson.com/users/{id}` | Customer data |
| PAGOS | `dummyjson.com/carts/user/{id}` | Transactions in USD |
| FX | `api.frankfurter.dev/v1/latest` | EUR/GBP rates |
| INESTABLE | `httpbin.org/status/500` | Demonstrates retry + graceful degradation |

## Project scripts

```bash
pnpm dev       # run api + web in parallel
pnpm build     # build all packages and apps
pnpm typecheck # build shared types then typecheck all workspaces
pnpm test      # build shared types then run tests
pnpm lint      # run linters (placeholders currently)
```

## Architecture sketch

```
┌─────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│  React/Vite │────▶│  Fastify API         │────▶│  Provider        │
│  Panel      │     │  /api/v1/dashboard   │     │  Orchestrator    │
└─────────────┘     └──────────────────────┘     └──────────────────┘
                             │                           │
                             ▼                           ▼
                    ┌────────────────┐         ┌────────┬────────┬────────┬────────┐
                    │  Repository    │         │  CORE  │  PAGOS │   FX   │ INESTABLE
                    │  (in-memory)   │         │dummyjson dummyjson frankfurter httpbin
                    └────────────────┘         └────────┴────────┴────────┴────────┘
                                                          │
                                                   ┌──────┴──────┐
                                                   │  FX TTL     │
                                                   │  cache      │
                                                   └─────────────┘
```

## Limitations / what is not done

- ESLint and Vitest are not fully configured; scripts are placeholders.
- No persistent database in this demo; repository interfaces are ready for MongoDB/in-memory swap.
- Circuit breaker is implemented for INESTABLE but could be generalized to all providers.
- Authentication is not required by the assessment.
- The panel is intentionally simple; no pixel-perfect design system.

## Innovation proposal

**Anomaly detection on aggregated transactions.** Persist normalized transactions, compute per-customer percentiles, and surface high-risk activity (unusual amount, velocity, or frequency) to operators. This turns the panel from a passive list into an active exception-management tool and directly reduces fraud response time.

## License

MIT
