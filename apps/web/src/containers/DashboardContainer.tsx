import { useState } from "react";
import { useDashboard } from "../hooks/useDashboard.js";
import { CustomerCard } from "../components/CustomerCard.js";
import { TransactionsTable } from "../components/TransactionsTable.js";
import { ProviderHealthBadge } from "../components/ProviderHealthBadge.js";
import { colors } from "../styles/colors.js";

interface DashboardContainerProps {
  customerId: number;
}

export function DashboardContainer({ customerId }: DashboardContainerProps) {
  const { data, isLoading, error } = useDashboard(customerId);
  const [filter, setFilter] = useState("");

  if (isLoading) {
    return (
      <div
        style={{
          padding: 48,
          textAlign: "center",
          color: colors.text.muted,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: `4px solid ${colors.surface.border}`,
            borderTopColor: colors.brand.orange,
            borderRadius: "50%",
            margin: "0 auto 16px",
            animation: "spin 1s linear infinite",
          }}
        />
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: 24,
          background: colors.semantic.error + "15",
          color: colors.semantic.error,
          border: `1px solid ${colors.semantic.error}44`,
          borderRadius: 12,
        }}
      >
        <strong>Error:</strong> {error.message}
      </div>
    );
  }

  if (!data) {
    return <p style={{ color: colors.text.muted }}>No data available.</p>;
  }

  const filteredTransactions = data.transactions.filter((tx) =>
    tx.title.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div>
      {data.partial && data.warnings.length > 0 && (
        <div
          style={{
            background: colors.semantic.warning + "18",
            border: `1px solid ${colors.semantic.warning}44`,
            color: colors.semantic.warning,
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 20 }}>⚠</span>
          <span>
            <strong>Partial data:</strong> {data.warnings.join(" ")}
          </span>
        </div>
      )}

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ color: colors.brand.navy, margin: "0 0 12px" }}>Customer</h2>
        <CustomerCard customer={data.customer} />
      </section>

      <section style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: 0, color: colors.brand.navy }}>Transactions</h2>
          <input
            type="text"
            placeholder="Filter by title..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              minWidth: 220,
              borderRadius: 8,
              border: `1px solid ${colors.surface.border}`,
              outline: "none",
              fontSize: 14,
            }}
          />
        </div>
        <TransactionsTable transactions={filteredTransactions} />
      </section>

      <section>
        <h2 style={{ color: colors.brand.navy, margin: "0 0 12px" }}>Provider Health</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {Object.entries(data.providers).map(([alias, health]) => (
            <ProviderHealthBadge key={alias} alias={alias} health={health} />
          ))}
        </div>
      </section>
    </div>
  );
}
