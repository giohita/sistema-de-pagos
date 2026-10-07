export const env = {
  api: {
    port: Number(process.env.API_PORT || 3001),
    host: process.env.API_HOST || "0.0.0.0",
    logLevel: process.env.LOG_LEVEL || "info",
    allowedOrigins: process.env.ALLOWED_ORIGINS,
  },
  upstreams: {
    coreBaseUrl: process.env.CORE_BASE_URL || "https://dummyjson.com",
    pagosBaseUrl: process.env.PAGOS_BASE_URL || "https://dummyjson.com",
    fxBaseUrl: process.env.FX_BASE_URL || "https://api.frankfurter.dev",
    inestableBaseUrl: process.env.INESTABLE_BASE_URL || "https://httpbin.org",
  },
  resilience: {
    timeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 2000),
    maxAttempts: Number(process.env.RETRY_MAX_ATTEMPTS || 3),
    backoffMs: Number(process.env.RETRY_BACKOFF_MS || 500),
  },
  cache: {
    fxTtlMs: Number(process.env.FX_CACHE_TTL_MS || 60000),
  },
  circuitBreaker: {
    failureThreshold: Number(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || 3),
    recoveryTimeoutMs: Number(process.env.CIRCUIT_BREAKER_RECOVERY_MS || 10000),
  },
  persistence: {
    mode: process.env.PERSISTENCE_MODE || "memory",
    mongodbUri: process.env.MONGODB_URI,
  },
};
