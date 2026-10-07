# PayLinkHub — Project Context

This repo contains the Credicorp Bank technical assessment: **PayLinkHub**, a payment-ecosystem aggregator.

## Stack
- **Backend**: Node.js + TypeScript + Fastify (or Express)
- **Frontend**: React + Vite + TypeScript
- **Monorepo**: pnpm/npm workspaces under `apps/api` and `apps/web`

## Goal
Build an HTTP service that orchestrates data from external upstreams with a canonical API contract, plus a small React panel that consumes it.

## Upstreams
- **CORE**: `https://dummyjson.com/users/{id}` — customer data. Strip `password`, `ssn`, `bank.cardNumber`, `crypto.wallet`.
- **PAGOS**: `https://dummyjson.com/carts/user/{id}` — transactions in USD.
- **FX**: `https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR,GBP` — exchange rates.
- **INESTABLE**: `httpbin.org/status/500` / `httpbin.org/delay/6` — simulate failure/slowness.

## Key rules
- Canonical endpoint: `GET /api/v1/dashboard/:customerId`.
- No raw pass-through of upstream payloads.
- Resilience: timeouts, retries only on 5xx/timeout, graceful degradation (`partial: true`, `warnings[]`, HTTP 200).
- Required docs: `README.md`, `AI-LOG.md`, `STATUS.md`, `.env.example`.
- Time-boxed 2-hour build: prioritize walking skeleton and honest scope reporting over completeness.

## Skill reference
Load `.claude/skills/paylinkhub-assessment.md` for full implementation guidance and prompts.
