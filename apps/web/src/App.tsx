import { DashboardContainer } from "./containers/DashboardContainer.js";

export function App() {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>PayLinkHub — Monitoring Panel</h1>
      <DashboardContainer customerId={1} />
    </div>
  );
}
