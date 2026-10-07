interface ProviderHealthBadgeProps {
  alias: string;
  health: { healthy: boolean; latencyMs?: number; error?: string };
}

export function ProviderHealthBadge({ alias, health }: ProviderHealthBadgeProps) {
  const isHealthy = health.healthy;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 999,
        background: isHealthy ? "#d4edda" : "#f8d7da",
        color: isHealthy ? "#155724" : "#721c24",
        border: `1px solid ${isHealthy ? "#c3e6cb" : "#f5c6cb"}`,
        fontSize: 14,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: isHealthy ? "#28a745" : "#dc3545",
        }}
      />
      <span style={{ fontWeight: 600, textTransform: "uppercase" }}>{alias}</span>
      <span>{isHealthy ? "HEALTHY" : "DEGRADED"}</span>
      {health.latencyMs !== undefined && (
        <span style={{ opacity: 0.8 }}>{health.latencyMs}ms</span>
      )}
      {health.error && (
        <span style={{ opacity: 0.8 }}>({health.error})</span>
      )}
    </div>
  );
}
