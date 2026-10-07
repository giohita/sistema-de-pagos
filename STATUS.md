# STATUS — PayLinkHub Technical Assessment

Honest status of each requirement from the Credicorp Bank assessment.

| Requisito | Estado | Nota |
|-----------|--------|------|
| Esqueleto caminante | Hecho | Endpoint `/api/v1/dashboard/{customerId}` responde 200 desde el primer commit funcional. |
| Contrato canónico | Hecho | Documentado en README; modelo propio sin campos sensibles. |
| Orquestación CORE + PAGOS | Hecho | Ambos proveedores se llaman en paralelo con `Promise.allSettled`. |
| Timeouts + reintentos | Hecho | Timeout 2s por proveedor; retry exponencial solo en 5xx/timeout/network. |
| Degradación elegante | Hecho | Respuesta 200 con `partial: true` y `warnings[]` cuando falla un proveedor. |
| Mini panel | Hecho | React consume el endpoint real; muestra cliente, transacciones, salud. |
| Caché FX | Hecho | `FxCache` TTL en backend con 60s por defecto; también frontend TanStack Query. |
| Búsqueda/filtro | Hecho | Filtro por título sobre la tabla de transacciones. |
| Logs estructurados | Hecho | Fastify/pino por request + logs JSON por proveedor en `logProvider`. |
| Propuesta de innovación | Hecho | Detección de anomalías en transacciones agregadas, documentada en README y AI-LOG. |
| Circuit breaker | Hecho | `CircuitBreaker` state machine aplicado al proveedor INESTABLE; tests incluidos. |
| Boceto innovación | Hecho | Diagrama ASCII de arquitectura agregado a README. |
| Auto-refresh panel | Hecho | TanStack Query `refetchInterval: 30000`. |
| Patrón repositorio | Hecho | `ICustomerRepository` + implementación en memoria con índice único sobre email. |
| Test de mapeo canónico | Hecho | `mapCustomer` y `mapTransactions` tienen tests unitarios. |

## Resumen

- **P0 completos**: esqueleto, contrato canónico, orquestación, resiliencia, degradación, panel, caché FX, logs estructurados.
- **P1 completos**: propuesta escrita + boceto ASCII.
- **P2 completos**: circuit breaker, test de mapeo, patrón repositorio.

La prioridad fue entregar un flujo vertical completo y honesto sobre intentar cubrir todo superficialmente.
