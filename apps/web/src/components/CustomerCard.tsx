import { colors } from "../styles/colors.js";

interface CustomerCardProps {
  customer: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    address: { street: string; city: string; country: string };
  };
}

export function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <div
      style={{
        border: `1px solid ${colors.surface.border}`,
        borderRadius: 12,
        padding: 20,
        background: colors.surface.card,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <h3 style={{ margin: "0 0 16px", color: colors.brand.navy }}>{customer.fullName}</h3>
      <div style={{ display: "grid", gap: 8, color: colors.text.secondary }}>
        <p style={{ margin: 0 }}>
          <strong style={{ color: colors.text.primary }}>Email:</strong> {customer.email}
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: colors.text.primary }}>Phone:</strong> {customer.phone}
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: colors.text.primary }}>Address:</strong> {customer.address.street},{" "}
          {customer.address.city}, {customer.address.country}
        </p>
      </div>
    </div>
  );
}
