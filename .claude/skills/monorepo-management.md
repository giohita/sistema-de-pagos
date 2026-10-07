---
name: monorepo-management
description: Conventions for managing the PayLinkHub pnpm/npm workspaces monorepo: shared packages, scripts, dependency rules, and local development flow.
---

# Monorepo Management

PayLinkHub is a single-repo workspace with a Node/TypeScript backend (`apps/api`) and a React frontend (`apps/web`). Shared code lives in `packages/*`.

## 1. Workspace layout

```
sistema-de-pagos/
├── apps/
│   ├── api/              # Fastify + TypeScript backend
│   └── web/              # React + Vite + TypeScript frontend
├── packages/
│   ├── types/            # shared canonical domain types
│   ├── ts-config/        # shared tsconfig presets
│   └── eslint-config/    # shared lint rules (optional)
├── README.md
├── AI-LOG.md
├── STATUS.md
├── CLAUDE.md
├── .env.example
└── package.json          # root workspace definition
```

## 2. Package manager

Use **pnpm** with `pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

If pnpm is unavailable, npm workspaces are acceptable.

## 3. Root scripts

```json
{
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck",
    "clean": "pnpm -r clean"
  }
}
```

## 4. Shared packages

### `packages/types`

Contains pure TypeScript interfaces/classes used by both backend and frontend.

```ts
export interface Customer { ... }
export interface Transaction { ... }
export interface Dashboard { ... }
export type ProviderAlias = 'core' | 'pagos' | 'fx' | 'inestable';
```

Do not import runtime Node libraries here; keep it dependency-light.

### `packages/ts-config`

Shared `tsconfig.base.json` files:
- `base.json` — strict, ESNext, Node types.
- `node.json` — extends base, targets Node runtime.
- `react.json` — extends base, JSX preserve, DOM types.

## 5. Dependency rules

- Apps depend on `packages/*`.
- Backend depends on HTTP client, logger, validation, and (optionally) MongoDB driver or Mongoose.
- Frontend depends on React, Vite, TanStack Query, and shared types.
- No frontend packages in backend; no backend runtime in frontend.
- Environment variables live in each app’s `.env` and are documented in root `.env.example`.

## 6. Environment configuration

Each app reads its own `.env` (via `dotenv` or Vite's built-in loader). Root `.env.example` documents all variables.

Example variables:

```env
# API
API_PORT=3001
NODE_ENV=development
CORE_BASE_URL=https://dummyjson.com
PAGOS_BASE_URL=https://dummyjson.com
FX_BASE_URL=https://api.frankfurter.dev
INESTABLE_BASE_URL=https://httpbin.org
REQUEST_TIMEOUT_MS=2000
RETRY_MAX_ATTEMPTS=3
RETRY_BACKOFF_MS=500

# Web
VITE_API_BASE_URL=http://localhost:3001
VITE_DASHBOARD_REFRESH_MS=30000
```

## 7. Local development flow

```bash
# 1. Install
pnpm install

# 2. Configure
cp .env.example apps/api/.env
cp .env.example apps/web/.env

# 3. Run both apps
pnpm dev
```

Backend runs on `http://localhost:3001`.
Frontend runs on `http://localhost:5173` with a proxy to `/api`.

## 8. Build and deploy artifacts

- `apps/api/dist` is the server build.
- `apps/web/dist` is the static frontend build.
- Shared packages must be built first; root `build` runs topologically.

## 9. Adding a new package

1. Create folder under `packages/` with a `package.json`.
2. Add workspace glob to `pnpm-workspace.yaml` if needed (already covered by `packages/*`).
3. Add package dependency in consuming apps with `workspace:*`.
4. Re-run `pnpm install`.

## 10. When applying this skill

Use this skill when:
- Adding or modifying workspace packages.
- Setting up root scripts or CI commands.
- Configuring environment variables.
- Deciding where a dependency belongs.
- Troubleshooting cross-package TypeScript resolution.
