import { useState } from "react";
import { useDashboard } from "../hooks/useDashboard.js";
import { CustomerCard } from "../components/CustomerCard.js";
import { TransactionsTable } from "../components/TransactionsTable.js";
import { ProviderHealthBadge } from "../components/ProviderHealthBadge.js";

interface DashboardContainerProps {
  customerId: number;
}

export function DashboardContainer({ customerId }: DashboardContainerProps) {
  const { data, isLoading, error } = useDashboard(customerId);
  const [filter, setFilter] = useState("");

  if (isLoading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error.message}</p>;
  if (!data) return <p>No data available.</p>;

  const filteredTransactions = data.transactions.filter((tx) =>
    tx.title.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div>
      {data.partial && data.warnings.length > 0 && (
        <div
          style={{
            background: "#fff3cd",
            border: "1px solid #ffeeba",
            color: "#856404",
            padding: 12,
            borderRadius: 4,
            marginBottom: 16,
          }}
        >
          <strong>Partial data:</strong> {data.warnings.join(" ")}
        </div>
      )}

      <section style={{ marginBottom: 24 }}>
        <h2>Customer</h2>
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
            marginBottom: 12,
          }}
        >
          <h2 style={{ margin: 0 }}>Transactions</h2>
          <input
            type="text"
            placeholder="Filter by title..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: "6px 10px", minWidth: 200 }}
          />
        </div>
        <TransactionsTable transactions={filteredTransactions} />
      </section>

      <section>
        <h2>Provider Health</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {Object.entries(data.providers).map(([alias, health]) => (
            <ProviderHealthBadge key={alias} alias={alias} health={health} />
          ))}
        </div>
      </section>
    </div>
  );
}
