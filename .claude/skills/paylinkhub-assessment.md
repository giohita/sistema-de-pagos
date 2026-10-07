---
name: paylinkhub-assessment
description: Guide to build PayLinkHub, a 2-hour Credicorp Bank technical assessment — React + Node/TypeScript monorepo payment aggregator with resilient upstream integrations, canonical API contract, and a mini monitoring panel.
---

# PayLinkHub — Technical Assessment Build Guide

You are helping build **PayLinkHub**, a payment-ecosystem technical assessment for Credicorp Bank. The goal is a working React + Node/TypeScript monorepo that aggregates customer and transaction data from external upstreams, exposes a canonical REST API, and ships a small React panel that consumes it.

This is a **time-boxed (2-hour) demo project**. Prioritize walking skeletons, honest scope declarations, and clean integration logic over polish.

## 1. Project shape

Use a single-repo monorepo:

```
sistema-de-pagos/
├── apps/
│   ├── api/              # Node/TypeScript backend
│   └── web/              # React frontend (Vite)
├── packages/
│   └── types/            # shared canonical types (optional)
├── README.md
├── AI-LOG.md
├── STATUS.md
├── CLAUDE.md             # this skill/project context
├── .env.example
└── package.json          # root scripts: dev, build, lint
```

Preferred stacks:
- **Backend**: Node + TypeScript + Fastify (lightweight, good async/timeout support) or Express.
- **Frontend**: React + Vite + TypeScript. Keep styling minimal (Tailwind optional).
- **Package manager**: pnpm or npm with workspaces.

## 2. Upstream providers

Build adapters for these live endpoints. Never pass their raw payloads through.

| Alias      | Endpoint                                                                  | Provides                              | Notes                                                  |
|------------|---------------------------------------------------------------------------|----------------------------------------|--------------------------------------------------------|
| CORE       | `GET https://dummyjson.com/users/{id}`                                    | Customer: name, email, phone, address    | **Strip** `password`, `ssnn`, `bank.cardNumber`, `crypto.wallet`. |
| PAGOS      | `GET https://dummyjson.com/carts/user/{id}`                               | Transactions / carts in USD            | Nested structure; compute aggregates yourself.       |
| FX         | `GET https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR,GBP`     | Exchange rates EUR, GBP from USD       | Changes once a day; candidate for TTL cache.           |
| INESTABLE  | `GET https://httpbin.org/status/500` or `https://httpbin.org/delay/6`    | Simulated failure / slowness           | Demonstrate timeout, retry, circuit breaker.           |

If any upstream is unreachable, stub it locally and declare it in `AI-LOG.md`.

## 3. Canonical contract

Expose a single endpoint:

```
GET /api/v1/dashboard/:customerId
```

Sample response:

```json
{
  "customer": {
    "id": 1,
    "fullName": "Terry Medhurst",
    "email": "tmshawe@example.com",
    "phone": "+123456789",
    "address": {
      "street": "1745 T Street Southeast",
      "city": "Washington",
      "country": "United States"
    }
  },
  "transactions": [
    {
      "id": 1,
      "title": "iPhone 9",
      "quantity": 1,
      "totalUsd": 549,
      "totalEur": 510,
      "totalGbp": 430
    }
  ],
  "summary": {
    "count": 2,
    "totalUsd": 1198.5
  },
  "fx": {
    "base": "USD",
    "rates": { "EUR": 0.92, "GBP": 0.78 },
    "cached": false
  },
  "providers": {
    "core": { "healthy": true, "latencyMs": 120 },
    "pagos": { "healthy": true, "latencyMs": 95 },
    "fx": { "healthy": true, "latencyMs": 80 },
    "inestable": { "healthy": false, "error": "timeout after 2s" }
  },
  "partial": true,
  "warnings": [
    "Provider 'inestable' did not respond; partial data returned."
  ]
}
```

Rules:
- Fields from `CORE` must be renamed and sanitized; sensitive fields dropped.
- `partial: true` plus `warnings[]` whenever any upstream fails or degrades.
- `providers` health block tracks per-provider status and latency.
- HTTP status stays `200` for degraded success; only return `500` for genuine unhandled errors.

## 4. Resilience requirements

Implement or configure explicitly in code:

- **Timeout per provider**: short, e.g., 1500–2500 ms.
- **Retries with backoff**: only on `5xx` and timeout. Never on `4xx`.
- **Parallel upstream calls**: use `Promise.all` / `Promise.allSettled` when possible.
- **Graceful degradation**: failed provider must not break the whole response.
- **P1/P2 circuit breaker** for `INESTABLE` (opossum or simple state machine).
- **P1 TTL cache** for FX rates (in-memory Map with TTL).

Document retry policy and circuit-breaker thresholds in `README.md`.

## 5. Frontend panel

One screen only. It must consume the real backend endpoint.

Display:
- Customer card (name, email, phone, address).
- Transactions table with totals in USD, EUR, GBP.
- A simple filter / search over the transaction table (P1).
- Provider health badges: green `HEALTHY` / red `DEGRADED`.
- Auto-refresh every 30 seconds (P2).

No login required. Keep UI functional, not pixel-perfect.

## 6. Required documentation

Create these files in the repo root:

| File            | Purpose                                                            |
|-----------------|--------------------------------------------------------------------|
| `README.md`     | Stack, install/run steps, sample curl, canonical JSON, decisions, limitations. |
| `AI-LOG.md`     | AI tools used, stack rationale, canonical mapping decisions, representative prompts, one rejected AI output (why), innovation proposal, % AI vs own code, one thing AI did well/badly. |
| `STATUS.md`     | Honest table: Requirement / Status (Hecho/Parcial/No hecho) / Note. |
| `CLAUDE.md`     | Context for Claude Code; keep concise.                            |
| `.env.example`  | Required env vars (upstream base URLs, ports, retry config, etc.).  |

## 7. Commit cadence

Follow the assessment rule: **esqueleto caminante** — a commit within 30 minutes where `/api/v1/dashboard/{customerId}` returns `200` end-to-end, even with mock data. Make small, frequent commits that show progress, not one mega-commit.

Suggested milestone commits:
1. `chore: monorepo setup with api + web`
2. `feat: walking skeleton returns 200 with mock data`
3. `feat: integrate CORE and PAGOS with canonical mapping`
4. `feat: add FX rates + in-memory TTL cache`
5. `feat: timeouts, retries, graceful degradation`
6. `feat: mini React panel consuming real endpoint`
7. `docs: README, AI-LOG, STATUS, .env.example`

## 8. Implementation priorities

### P0 — MUST (target ~90 min)
- Walking skeleton endpoint returns `200`.
- Canonical contract documented and implemented.
- Real orchestration of CORE + PAGOS.
- Timeouts + retries only on 5xx/timeout.
- Graceful degradation (`partial`, `warnings`, `200` response).
- Mini panel consuming the real endpoint.

### P1 — SHOULD (target ~40 min)
- FX TTL cache.
- Transaction search/filter in panel.
- Structured logs with latency/result per provider.
- Innovation proposal section in README.

### P2 — NICE (target ~20 min if time)
- Circuit breaker on INESTABLE.
- Innovation sketch/diagram.
- Panel auto-refresh.
- One canonical contract mapping test.

## 9. What to avoid

- Returning raw upstream payloads.
- Retrying on `4xx`.
- Hardcoding secrets or upstream URLs; use env vars.
- Mega-commits.
- Unstated scope: anything not done goes in `STATUS.md`.

## 10. Prompts you can reuse

Use these as representative prompts in `AI-LOG.md`:

> “Create a TypeScript Fastify service with an endpoint GET /api/v1/dashboard/:customerId. It must call dummyjson.com/users/:id and dummyjson.com/carts/user/:id in parallel, map the results to a canonical contract, strip sensitive fields, and return 200 with partial:true if either provider fails. Use axios with per-request timeout and a retry policy only on 5xx or timeout.”

> “Build a small React panel in Vite that fetches the dashboard endpoint, displays the customer card, a transactions table in USD/EUR/GBP, and colored health badges for each provider. Add a search input that filters transactions by title.”

> “Add an in-memory TTL cache for the FX rates from api.frankfurter.dev and expose whether the rate was cached in the dashboard response. Document the TTL in README.md.”

## 11. When finishing

- Run the full stack locally and verify the curl in README works.
- Ensure `STATUS.md` is honest and matches actual code.
- Push to GitHub public repo named `paylinkhub-[tu-nombre]` (or as instructed).
- End commits and PR descriptions with the standard attribution lines.
