import { useState } from "react";
import { DashboardContainer } from "./containers/DashboardContainer.js";
import { colors } from "./styles/colors.js";

const CUSTOMER_IDS = [1, 2, 3, 4, 5];

export function App() {
  const [customerId, setCustomerId] = useState(1);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.surface.background,
        color: colors.text.primary,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <header
        style={{
          background: colors.brand.navy,
          color: colors.text.onDark,
          padding: "16px 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
            PayLinkHub
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, opacity: 0.85 }}>
            Monitoring Panel — Credicorp Bank Ecosystem
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <label
            htmlFor="customer-select"
            style={{
              display: "block",
              marginBottom: 8,
              fontWeight: 600,
              color: colors.brand.navy,
            }}
          >
            Select customer
          </label>
          <select
            id="customer-select"
            value={customerId}
            onChange={(e) => setCustomerId(Number(e.target.value))}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: `1px solid ${colors.surface.border}`,
              fontSize: 14,
              minWidth: 220,
              background: "white",
              cursor: "pointer",
            }}
          >
            {CUSTOMER_IDS.map((id) => (
              <option key={id} value={id}>
                Customer {id}
              </option>
            ))}
          </select>
        </div>

        <DashboardContainer customerId={customerId} />
      </main>
    </div>
  );
}
