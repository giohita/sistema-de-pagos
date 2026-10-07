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
| Caché FX | Parcial | No hay caché backend; el frontend usa TanStack Query con `staleTime: 30s` y refetch cada 30s. |
| Búsqueda/filtro | Hecho | Filtro por título sobre la tabla de transacciones. |
| Logs estructurados | Parcial | Fastify/pino loggea latencia y status por request; no hay log por proveedor individual. |
| Propuesta de innovación | Hecho | Detección de anomalías en transacciones agregadas, documentada en README y AI-LOG. |
| Circuit breaker | No hecho | Fuera de tiempo. Se agregaría con `opossum` o un state machine simple. |
| Boceto innovación | No hecho | Solo propuesta escrita; no diagrama. Se podría agregar un ASCII diagram en README. |
| Auto-refresh panel | Hecho | TanStack Query `refetchInterval: 30000`. |
| Patrón repositorio | Hecho | `ICustomerRepository` + implementación en memoria con índice único sobre email. |
| Test de mapeo canónico | Hecho | `mapCustomer` y `mapTransactions` tienen tests unitarios. |

## Resumen

- **P0 completos**: esqueleto, contrato canónico, orquestación, resiliencia, degradación, panel.
- **P1 parciales**: caché delegada al frontend, logs estructurados parciales, propuesta escrita.
- **P2 no hechos**: circuit breaker, boceto/diagrama. Test de mapeo y patrón repositorio ya están hechos.

La prioridad fue entregar un flujo vertical completo y honesto sobre intentar cubrir todo superficialmente.
