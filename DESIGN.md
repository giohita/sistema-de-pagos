# PayLinkHub — Diseño Técnico y Guía de Implementación

> **Proyecto**: Prueba Técnica Credicorp Bank — Desarrollador(a) de Ecosistema Digital y Pagos  
> **Stack**: React + Node/TypeScript monorepo (pnpm workspaces)  
> **Patrones**: OOP, Adapter, Repository, Hexagonal/Clean Architecture  
> **Caché**: TanStack Query en el frontend; backend sin caché pesado de negocio  
> **Persistencia**: MongoDB / Mongoose con índices únicos (o implementación en memoria para demo)

Este documento es la guía de diseño para quienes construyan y revisen el repositorio. Combina los requisitos de la prueba técnica con decisiones arquitectónicas deliberadas: orientación a objetos, adaptadores por proveedor, monorepo limpio, caché delegada al navegador y persistencia opcional con índices únicos.

---

## 1. Visión del sistema

**PayLinkHub** es un servicio de agregación de pagos con un mini panel de monitoreo. Expone un único endpoint canónico que orquesta datos de clientes y transacciones desde proveedores externos heterogéneos, los filtra, los mapea a un contrato propio y entrega:

- Datos del cliente.
- Últimas transacciones con montos en USD, EUR y GBP.
- Resumen agregado.
- Estado de salud de cada proveedor.
- Advertencias cuando la respuesta sea parcial.

El frontend es una sola pantalla React que consume el endpoint real, muestra la información a un operador bancario y refresca automáticamente los datos usando caché del lado del cliente.

---

## 2. Objetivos de diseño

| Objetivo | Cómo se cumple |
|----------|----------------|
| **Desacoplamiento de proveedores** | Cada upstream tiene un `Adapter` que implementa una interfaz común. El orquestador no conoce los contratos externos. |
| **Contrato canónico propio** | Modelos de dominio (`Customer`, `Transaction`, `Dashboard`) y DTOs estables compartidos entre backend y frontend. |
| **Resiliencia** | Timeouts, reintentos solo en 5xx/timeout, degradación elegante (`partial: true`, `warnings[]`, HTTP 200). |
| **No exponer datos sensibles** | El adapter `CORE` filtra explícitamente `password`, `ssn`, `bank.cardNumber` y `crypto.wallet`. |
| **Escalabilidad del caché** | El backend no mantiene caché de FX complejo; TanStack Query en el frontend maneja TTL, stale-while-revalidate y refresh automático. |
| **Persistencia de consultas** | MongoDB con índices únicos sobre `customer.id` y `customer.email` para evitar duplicados y auditar consultas upstream. |
| **Extensibilidad** | Nuevos proveedores se agregan implementando `IProviderAdapter`. Nuevos repositorios implementan `IRepository<T>`. |

---

## 3. Arquitectura general

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)              │
│  ┌────────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │ DashboardContainer │  │ TransactionsTable │  │ ProviderHealthBadge│   │
│  └────────┬───────┘  └────────┬─────────┘  └──────┬─────┘   │
│           │                   │                   │          │
│  ┌────────▼───────────────────▼───────────────────▼─────┐    │
│  │          TanStack Query (caché + refetch)           │    │
│  └──────────────────────┬─────────────────────────────┘    │
└─────────────────────────┼──────────────────────────────────┘
                          │ GET /api/v1/dashboard/:customerId
┌─────────────────────────▼──────────────────────────────────┐
│                        BACKEND (Fastify + TypeScript)      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              HTTP Controller / Route               │   │
│  └──────────────────────┬────────────────────────────┘   │
│                         │                                  │
│  ┌──────────────────────▼────────────────────────────┐     │
│  │           DashboardService (lógica de negocio)      │     │
│  └──────────────┬─────────────────────┬───────────────┘     │
│                 │                     │                     │
│  ┌──────────────▼─────┐  ┌───────────▼──────────┐  ┌──────▼───────┐
│  │ ProviderOrchestrator│  │ CustomerRepository    │  │ TransactionRepository │
│  └──────────┬──────────┘  └───────────────────────┘  └─────────────────────┘
│             │                                              │
│  ┌──────────▼──────────┐                        ┌────────▼─────────┐
│  │ Adapters: CORE,     │                        │ MongoDB / in-mem │
│  │ PAGOS, FX, INESTABLE│                        │ (índices únicos) │
│  └─────────────────────┘                        └──────────────────┘
└──────────────────────────────────────────────────────────────┘
```

### Flujo de una consulta

1. El frontend pide `GET /api/v1/dashboard/:customerId`.
2. El backend persiste/actualiza el cliente en el repositorio (upsert con índice único).
3. El `ProviderOrchestrator` ejecuta en paralelo los adapters `CORE`, `PAGOS`, `FX` e `INESTABLE`.
4. Cada adapter:
   - Llama a su upstream con timeout y retry policy.
   - Mapea la respuesta al modelo canónico.
   - Filtra campos sensibles (`CORE`).
   - Devuelve un `ProviderResult<T>` con latencia y error estructurado.
5. El servicio combina resultados. Si alguno falla, devuelve `partial: true` y `warnings[]`.
6. El frontend recibe el dashboard, lo cachea con TanStack Query y refresca cada 30 segundos.

---

## 4. Monorepo

El repositorio sigue una estructura de workspaces con `pnpm`.

```
paylinkhub-[nombre]/
├── apps/
│   ├── api/                    # Fastify + TypeScript
│   │   ├── src/
│   │   │   ├── config/         # env, logger, http client
│   │   │   ├── domain/         # modelos de negocio (Customer, Transaction, ...)
│   │   │   ├── providers/    # adapters + interfaces
│   │   │   ├── repositories/   # interfaces + implementaciones Mongo/in-mem
│   │   │   ├── services/       # DashboardService, ProviderOrchestrator
│   │   │   ├── routes/         # controladores HTTP
│   │   │   └── index.ts        # bootstrap del servidor
│   │   ├── tests/
│   │   ├── .env
│   │   └── package.json
│   └── web/                    # React + Vite + TypeScript
│       ├── src/
│       │   ├── components/     # UI presentacional
│       │   ├── containers/     # conectan con hooks de datos
│       │   ├── hooks/          # useDashboard, useTransactionsFilter
│       │   ├── services/       # cliente HTTP
│       │   ├── types/          # re-exporta desde @paylinkhub/types
│       │   └── main.tsx
│       ├── .env
│       └── package.json
├── packages/
│   ├── types/                  # tipos canónicos compartidos
│   ├── ts-config/              # tsconfig compartidos
│   └── eslint-config/          # reglas de lint compartidas
├── README.md
├── AI-LOG.md
├── STATUS.md
├── DESIGN.md                 # este documento
├── CLAUDE.md
├── .env.example
├── package.json
└── pnpm-workspace.yaml
```

### Dependencias entre workspaces

- `apps/api` → `@paylinkhub/types`, `@paylinkhub/ts-config`
- `apps/web` → `@paylinkhub/types`, `@paylinkhub/ts-config`
- `packages/*` no dependen de apps ni de librerías de runtime específicas.

---

## 5. Backend: dominio, adapters y persistencia

### 5.1 Interfaces principales

```ts
// ports
interface IProviderAdapter<TRequest, TResult> {
  readonly alias: ProviderAlias;
  fetch(input: TRequest): Promise<ProviderResult<TResult>>;
  isHealthy(): Promise<HealthStatus>;
}

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

### 5.2 Modelos de dominio (OOP)

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

class Dashboard {
  constructor(
    readonly customer: Customer,
    readonly transactions: Transaction[],
    readonly summary: Summary,
    readonly fx: FxSnapshot,
    readonly providers: Record<ProviderAlias, ProviderHealth>,
    readonly partial: boolean,
    readonly warnings: string[],
  ) {}
}
```

### 5.3 Adapters por proveedor

| Adapter | Upstream | Responsabilidad |
|---------|----------|-----------------|
| `CoreProviderAdapter` | `dummyjson.com/users/{id}` | Obtener cliente, renombrar y filtrar campos sensibles. |
| `PagosProviderAdapter` | `dummyjson.com/carts/user/{id}` | Obtener carritos, aplanar a transacciones, calcular totales en USD. |
| `FxProviderAdapter` | `api.frankfurter.dev/v1/latest` | Obtener tasa USD→EUR y USD→GBP. |
| `InestableProviderAdapter` | `httpbin.org/status/500` / `delay/6` | Proveedor de prueba para resiliencia. |

Cada adapter usa un `HttpClient` compartido configurado con:
- Timeout por request.
- Retry con backoff exponencial.
- Retry solo en `5xx`, `timeout` o `network`. Nunca en `4xx`.

### 5.4 Mapeo canónico del proveedor CORE (con filtro de sensibles)

Upstream responde:

```json
{
  "id": 1,
  "firstName": "Terry",
  "lastName": "Medhurst",
  "email": "atuny0@sohu.com",
  "phone": "+63 791 675 8914",
  "address": { "address": "1745 T Street Southeast", "city": "Washington", "country": "United States" },
  "password": "9uQFF1Lh",
  "ssn": "...",
  "bank": { "cardNumber": "..." },
  "crypto": { "wallet": "..." }
}
```

Mapeo a dominio:

```ts
{
  id: raw.id,
  fullName: `${raw.firstName} ${raw.lastName}`,
  email: raw.email,
  phone: raw.phone,
  address: {
    street: raw.address.address,
    city: raw.address.city,
    country: raw.address.country,
  }
}
```

> **Regla de oro**: nunca se devuelven `password`, `ssn`, `bank.cardNumber`, `crypto.wallet` ni ningún campo que no esté en el contrato canónico.

### 5.5 Persistencia

Para la demo se usa MongoDB con Mongoose o una implementación en memoria. El repositorio de clientes define índices únicos:

```ts
// Mongoose
const CustomerSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  fullName: String,
  phone: String,
  address: Object,
  lastUpstreamQueryAt: Date,
});

CustomerSchema.index({ id: 1 }, { unique: true });
CustomerSchema.index({ email: 1 }, { unique: true });
```

Propósito de la persistencia en esta prueba:
- Demostrar el patrón Repository.
- Evitar duplicados de clientes.
- Auditar la última consulta upstream por cliente.
- Permitir stubbing local sin cambiar el código de negocio.

### 5.6 Orquestación

```ts
class ProviderOrchestrator {
  constructor(private adapters: IProviderAdapter<any, any>[]) {}

  async run(customerId: number) {
    const settled = await Promise.allSettled(
      this.adapters.map(a => a.fetch(customerId))
    );

    // combina resultados, calcula health, genera warnings
  }
}
```

Reglas:
- `CORE` y `PAGOS` son P0: se ejecutan en paralelo.
- `FX` es P1: si falla, se puede devolver sin conversión o usar una tasa por defecto.
- `INESTABLE` es demostrativo: nunca bloquea el dashboard.

---

## 6. Frontend: panel y caché con TanStack Query

### 6.1 Pantalla única

El panel muestra:

1. **Tarjeta de cliente**: nombre, correo, teléfono, dirección.
2. **Tabla de transacciones**: producto, cantidad, total USD, EUR, GBP.
3. **Filtro de búsqueda**: filtra transacciones por título.
4. **Badges de salud de proveedores**: verde (healthy) / rojo (degraded).
5. **Indicador de datos parciales**: si `partial === true`, muestra `warnings[]`.
6. **Auto-refresh**: refetch cada 30 segundos.

### 6.2 Caché en el navegador

**Decisión**: no implementar caché pesado en el backend. El frontend usa **TanStack Query** (`@tanstack/react-query`) con la siguiente política:

```ts
const dashboardQuery = useQuery({
  queryKey: ['dashboard', customerId],
  queryFn: () => fetchDashboard(customerId),
  staleTime: 30_000,      // 30 segundos
  refetchInterval: 30_000, // auto-refresh cada 30s
  refetchOnWindowFocus: true,
  retry: 1,
});
```

Ventajas:
- Reduce llamadas al backend cuando el operador navega entre vistas.
- Permite stale-while-revalidate: datos inmediatos mientras se refrescan.
- Simplifica el backend: no hay invalidación de caché ni TTL distribuido.
- Se ajusta al requisito de FX: las tasas cambian una vez al día; 30 segundos de stale time es conservador para un panel operativo.

### 6.3 Componentes principales

```
web/src/
├── components/
│   ├── CustomerCard.tsx
│   ├── ProviderHealthBadge.tsx
│   ├── SummaryCard.tsx
│   └── TransactionsTable.tsx
├── containers/
│   └── DashboardContainer.tsx
├── hooks/
│   ├── useDashboard.ts
│   └── useTransactionsFilter.ts
└── services/
    └── api.ts
```

---

## 7. API canónica

### Endpoint

```
GET /api/v1/dashboard/:customerId
```

### Respuesta de éxito completo (HTTP 200)

```json
{
  "customer": {
    "id": 1,
    "fullName": "Terry Medhurst",
    "email": "atuny0@sohu.com",
    "phone": "+63 791 675 8914",
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
      "totalEur": 510.42,
      "totalGbp": 429.84
    }
  ],
  "summary": {
    "count": 1,
    "totalUsd": 549
  },
  "fx": {
    "base": "USD",
    "rates": { "EUR": 0.9297, "GBP": 0.7829 }
  },
  "providers": {
    "core": { "healthy": true, "latencyMs": 145 },
    "pagos": { "healthy": true, "latencyMs": 210 },
    "fx": { "healthy": true, "latencyMs": 320 },
    "inestable": { "healthy": false, "error": "timeout after 2000ms" }
  },
  "partial": true,
  "warnings": [
    "Provider 'inestable' did not respond; partial data returned."
  ]
}
```

### Respuesta parcial (HTTP 200, no 500)

Si un proveedor real falla, la API sigue respondiendo `200` con `partial: true` y `warnings[]`. Solo un error inesperado no manejado devuelve `500`.

---

## 8. Resiliencia y políticas

### 8.1 Timeout

```ts
const REQUEST_TIMEOUT_MS = 2000; // 2 segundos por proveedor
```

### 8.2 Reintentos

```ts
const RETRY_MAX_ATTEMPTS = 3;
const RETRY_BACKOFF_MS = 500;
// backoff exponencial: 500ms, 1000ms, 2000ms
```

Reintentar **solo** en:
- `timeout`
- `network`
- `5xx`

Nunca reintentar en `4xx`.

### 8.3 Circuit breaker (P2)

Para `INESTABLE`, opcionalmente un circuit breaker simple:

```ts
class CircuitBreaker {
  private failures = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private threshold = 3;
  private timeoutMs = 10_000;

  async execute<T>(fn: () => Promise<T>): Promise<T> { ... }
}
```

### 8.4 Degradación elegante

El `DashboardService` combina resultados. Si `FX` falla, las transacciones se devuelven solo en USD. Si `PAGOS` falla, `transactions: []` y `partial: true`.

---

## 9. Propuesta de innovación

**Detección de anomalías en transacciones agregadas**

Problema real: un operador bancario no solo necesita ver transacciones, sino detectar patrones sospechosos (monto atípico, frecuencia inusual, geolocalización inconsistente, múltiples transacciones en segundos).

Solución concreta: agregar un módulo `AnomalyDetector` que, usando los datos ya agregados, calcule estadísticas deslizantes por cliente y alerte cuando una transacción se desvíe significativamente de la media histórica.

Cómo abordarlo en un siguiente sprint:
1. Persistir transacciones normalizadas en MongoDB.
2. Calcular percentiles por cliente (`p50`, `p90`, `p99`).
3. Regla simple: si `monto > p99 * 1.5` o `frecuencia_1h > p95 + 3`, generar alerta.
4. Endpoint `GET /api/v1/customers/:id/alerts`.
5. Panel con sección “Alertas recientes” y badge de severidad.

Valor de negocio: reduce fraude y atención reactiva; el operador pasa de revisar listados a actuar sobre excepciones.

---

## 10. Variables de entorno

Documentadas en `.env.example`:

```env
# API
API_PORT=3001
NODE_ENV=development
LOG_LEVEL=info

CORE_BASE_URL=https://dummyjson.com
PAGOS_BASE_URL=https://dummyjson.com
FX_BASE_URL=https://api.frankfurter.dev
INESTABLE_BASE_URL=https://httpbin.org

REQUEST_TIMEOUT_MS=2000
RETRY_MAX_ATTEMPTS=3
RETRY_BACKOFF_MS=500

MONGODB_URI=mongodb://localhost:27017/paylinkhub
# o, para demo en memoria:
# PERSISTENCE_MODE=memory

# Web
VITE_API_BASE_URL=http://localhost:3001
VITE_DASHBOARD_REFRESH_MS=30000
```

---

## 11. Hoja de ruta de implementación

Orden sugerido de commits:

1. `chore: monorepo setup with api + web + shared types`
2. `feat: walking skeleton returns 200 with mock data`
3. `feat: add domain models and provider interfaces`
4. `feat: implement CORE and PAGOS adapters with canonical mapping`
5. `feat: add FX adapter and currency conversion`
6. `feat: add resilience (timeout, retry, graceful degradation)`
7. `feat: add MongoDB/in-memory repositories with unique indexes`
8. `feat: build React dashboard panel with TanStack Query`
9. `feat: transaction filter and provider health badges`
10. `docs: README, AI-LOG, STATUS, DESIGN`

---

## 12. Criterios de calidad y revisión

Antes de entregar, verificar:

- [ ] `GET /api/v1/dashboard/:customerId` responde `200`.
- [ ] El contrato canónico no expone campos sensibles.
- [ ] Los adapters están separados del orquestador.
- [ ] Los reintentos solo ocurren en 5xx/timeout.
- [ ] Un proveedor caído no devuelve `500`; devuelve `partial: true`.
- [ ] El panel consume el endpoint real y muestra datos útiles.
- [ ] TanStack Query maneja caché y auto-refresh.
- [ ] Existe `.env.example`, `README.md`, `AI-LOG.md`, `STATUS.md` y `DESIGN.md`.
- [ ] Los commits son pequeños y progresivos.

---

## 13. Documentación obligatoria relacionada

- `README.md` — instrucciones copy-paste para correr en local.
- `AI-LOG.md` — bitácora de uso de IA, stack rationale, prompts, rechazos y propuesta de innovación.
- `STATUS.md` — tabla honesta de qué está hecho, parcial o no hecho.
- `CLAUDE.md` — contexto del proyecto para Claude Code.
- `.env.example` — variables de entorno.

---

## 14. Notas para revisores

- El diseño prioriza **OOP + Adapter + Repository** para demostrar que el sistema puede crecer sin acoplamiento a proveedores externos.
- Se eligió **caché en el frontend** para no sobrecargar el backend con invalidación de caché; es suficiente para un panel operativo con refresco periódico.
- La persistencia es intencionalmente ligera (MongoDB o en memoria) y usa **índices únicos** para evitar duplicados de clientes.
- `INESTABLE` no es un proveedor de negocio real; es un mecanismo de demostración de resiliencia.
