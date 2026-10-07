import { colors } from "../styles/colors.js";

interface ProviderHealthBadgeProps {
  alias: string;
  health: { healthy: boolean; latencyMs?: number; error?: string };
}

export function ProviderHealthBadge({ alias, health }: ProviderHealthBadgeProps) {
  const isHealthy = health.healthy;
  const bg = isHealthy ? "#DCFCE7" : "#FEE2E2";
  const fg = isHealthy ? colors.semantic.success : colors.semantic.error;
  const dot = isHealthy ? colors.semantic.success : colors.semantic.error;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        borderRadius: 999,
        background: bg,
        color: fg,
        border: `1px solid ${fg}33`,
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: dot,
          boxShadow: `0 0 0 2px ${bg}, 0 0 0 3px ${dot}66`,
        }}
      />
      <span style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>{alias}</span>
      <span style={{ fontWeight: 600 }}>{isHealthy ? "HEALTHY" : "DEGRADED"}</span>
      {health.latencyMs !== undefined && (
        <span style={{ opacity: 0.8 }}>{health.latencyMs}ms</span>
      )}
      {health.error && (
        <span style={{ opacity: 0.85, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          ({health.error})
        </span>
      )}
    </div>
  );
}
