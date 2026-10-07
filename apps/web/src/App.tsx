import { DashboardContainer } from "./containers/DashboardContainer.js";
import { colors } from "./styles/colors.js";

export function App() {
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
        <DashboardContainer customerId={1} />
      </main>
    </div>
  );
}
