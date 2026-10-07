---
name: design-system-patterns
description: Object-oriented design patterns and clean architecture conventions used across the PayLinkHub monorepo.
---

# Design System Patterns

This skill defines the architectural vocabulary used in PayLinkHub: object-oriented decomposition, the Adapter pattern for external providers, clean separation of concerns, and a minimal but consistent component model.

## 1. Guiding principles

- **Objects over anemic data**: model behavior, not only data shapes. A service is an object with a single responsibility.
- **Ports and Adapters (Hexagonal)**: the application core defines contracts (interfaces / abstract classes). External systems implement adapters behind those contracts.
- **Immutability by default**: return new objects, avoid mutating shared state.
- **Fail-safe defaults**: every operation that can fail returns a structured result or throws a domain error with a clear classification.
- **Single source of truth**: canonical models live in `packages/types` and are used by both backend and frontend.

## 2. Adapter pattern for upstreams

Each external provider is wrapped by an adapter implementing a common interface.

```ts
interface IProviderAdapter<TRequest, TResult> {
  readonly alias: ProviderAlias;
  fetch(input: TRequest): Promise<ProviderResult<TResult>>;
  isHealthy(): Promise<HealthStatus>;
}

interface ProviderResult<T> {
  ok: boolean;
  data?: T;
  error?: ProviderError;
  latencyMs: number;
}
```

Concrete adapters:
- `CoreProviderAdapter` — maps `dummyjson.com/users/{id}` to `Customer`.
- `PagosProviderAdapter` — maps `dummyjson.com/carts/user/{id}` to `Transaction[]`.
- `FxProviderAdapter` — maps `api.frankfurter.dev` to `FxRates`.
- `InestableProviderAdapter` — intentionally flaky provider for resilience demos.

Benefits:
- Swap a live provider for a stub without touching orchestration logic.
- Test each mapping in isolation.
- Add new providers by implementing the interface.

## 3. Domain objects

```ts
class Customer {
  constructor(
    readonly id: number,
    readonly fullName: string,
    readonly email: string,
    readonly phone: string,
    readonly address: Address,
  ) {}
}

class Transaction {
  constructor(
    readonly id: number,
    readonly title: string,
    readonly quantity: number,
    readonly totalUsd: number,
    readonly totalEur: number,
    readonly totalGbp: number,
  ) {}
}
```

## 4. Repository pattern for persistence

The backend uses repositories behind interfaces so the concrete store can be swapped.

```ts
interface ICustomerRepository {
  upsert(customer: Customer): Promise<Customer>;
  findById(id: number): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
}

interface ITransactionRepository {
  saveMany(customerId: number, transactions: Transaction[]): Promise<void>;
  findByCustomerId(customerId: number): Promise<Transaction[]>;
}
```

For this assessment, an in-memory or MongoDB/Mongoose implementation is acceptable. Unique indexes should be declared explicitly in the repository layer.

## 5. Service layer composition

High-level services compose adapters and repositories. They contain business logic, not HTTP details.

```ts
class DashboardService {
  constructor(
    private orchestrator: ProviderOrchestrator,
    private customerRepo: ICustomerRepository,
    private transactionRepo: ITransactionRepository,
  ) {}

  async buildDashboard(customerId: number): Promise<Dashboard> { ... }
}
```

## 6. Frontend component design

Keep components small and data-driven:
- Container components fetch data (via TanStack Query hooks).
- Presentational components receive props and render.
- Domain types from `packages/types` drive prop contracts.

Example naming:
- `CustomerCard`
- `TransactionsTable`
- `ProviderHealthBadge`
- `DashboardContainer`

## 7. Error taxonomy

Classify failures so the orchestrator can decide whether to retry or degrade.

```ts
type ProviderErrorKind = 'timeout' | 'network' | 'http_5xx' | 'http_4xx' | 'mapping' | 'unavailable';

class ProviderError extends Error {
  constructor(
    readonly kind: ProviderErrorKind,
    readonly provider: string,
    readonly cause?: Error,
  ) { super(...); }

  isRetryable(): boolean {
    return this.kind === 'timeout' || this.kind === 'network' || this.kind === 'http_5xx';
  }
}
```

## 8. When applying this skill

Use these patterns when:
- Implementing a new provider adapter.
- Adding persistence (MongoDB/in-memory).
- Writing a new service or repository.
- Designing a new frontend component.
- Refactoring raw fetch/axios code into structured adapters.
