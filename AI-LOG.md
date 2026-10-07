# AI Log — PayLinkHub

## AI tools used

- **Claude Code** (terminal agent) — main implementation partner for scaffolding, backend, frontend, CI/CD, and documentation.
- **Claude.ai chat** — used for quick reasoning about architecture trade-offs (not for generating code directly).

## Stack choice

- **Backend**: Node.js + TypeScript + Fastify.
  - Fastify gives built-in async/await, JSON schema validation, pino logging, and excellent timeout handling without extra middleware.
  - TypeScript keeps the canonical contract type-safe across the monorepo.
  - Added an in-memory TTL FX cache and structured JSON logs per provider.
- **Frontend**: React + Vite + TypeScript + TanStack Query.
  - Vite is fast to start and ideal for a single-screen demo.
  - TanStack Query provides browser-side cache, stale-while-revalidate, and auto-refresh without backend complexity.
- **Monorepo**: pnpm workspaces.
  - Needed shared `packages/types` and `packages/ts-config` so backend and frontend use the same canonical types.

## Canonical contract decisions

| Source field | Decision | Rationale |
|--------------|----------|-----------|
| `firstName` + `lastName` | Mapped to `fullName` | Simpler downstream consumption. |
| `address.address` | Mapped to `address.street` | More natural naming. |
| `password`, `ssn`, `bank.cardNumber`, `crypto.wallet` | **Dropped** | These are deliberate traps from CORE and must not leave the API. |
| DummyJSON carts wrapper | Unwrapped from `{ carts }` | The endpoint returns an object, not a raw array. |
| FX rates | Stored as `base` + `rates` | Frankfurter shape mapped to a minimal contract. |
| Provider health | `healthy`, `latencyMs`, `error` | Gives operators visibility into each upstream. |

## Representative prompts

### Prompt 1 — scaffolding the backend

> "Create a TypeScript Fastify service with an endpoint GET /api/v1/dashboard/:customerId. It must call dummyjson.com/users/:id and dummyjson.com/carts/user/:id in parallel, map the results to a canonical contract, strip sensitive fields, and return 200 with partial:true if either provider fails. Use axios with per-request timeout and a retry policy only on 5xx or timeout."

**What it produced**: A single-file Express-style service with inline axios calls and no adapters.

**What I did**: Rejected the output. I wanted a clean Adapter + Orchestrator + Service separation, not inline fetch calls. I rewrote it with `IProviderAdapter`, `ProviderOrchestrator`, and `DashboardService`, and made retry logic live in `HttpClient` so it is reusable and testable.

### Prompt 2 — frontend panel

> "Build a small React panel in Vite that fetches the dashboard endpoint, displays the customer card, a transactions table in USD/EUR/GBP, and colored health badges for each provider. Add a search input that filters transactions by title."

**What it produced**: A functional single-file component.

**What I did**: Accepted the structure but split it into container/presentation components, added TanStack Query for caching and auto-refresh, and later applied Credicorp Bank brand colors.

## One thing AI did excellently

Generating the walking skeleton end-to-end (Fastify route + mock data + Vite React panel) in one coherent pass saved the first 30 minutes. It established the request/response shape immediately.

## One thing AI did poorly

The AI initially suggested adding `pino-pretty` as a Fastify logger transport. Under pnpm strict resolution this caused `unable to determine transport target for "pino-pretty"` at runtime because `pino-pretty` wasn't installed. I removed the transport and kept plain pino logging.

## Estimation of AI vs own code

- **AI-generated scaffolding and raw code**: ~60%
- **My edits, refactoring, architecture decisions, fixes, tests, docs**: ~40%

The AI accelerated the boilerplate; the Adapter/Orchestrator split, error taxonomy, retry policy, sensitive-field filtering, and documentation are my own decisions.

## Innovation proposal

**Anomaly detection on aggregated transactions.**

Problem: operators spend most of their time scrolling through transaction lists looking for exceptions.

Solution: persist normalized transactions, compute rolling per-customer percentiles (p50, p90, p99), and flag transactions that deviate significantly. Example rules:

- `amount > p99 * 1.5`
- `transaction_count_1h > p95 + 3`
- New endpoint: `GET /api/v1/customers/:id/alerts`
- New panel section: "Recent alerts" with severity badges.

Why it matters: reduces reactive fraud investigation and turns the dashboard into an exception-management tool.

Feasibility: can be built in a 2-week sprint. First iteration uses in-memory/MongoDB persistence of already-collected data; no new upstream integration required.

## Notes on working with Claude Code

- I used `CLAUDE.md` and `.claude/skills/` to keep the project context consistent across turns.
- I made frequent small commits to show progress, as the assessment values commit cadence over a single mega-commit.
