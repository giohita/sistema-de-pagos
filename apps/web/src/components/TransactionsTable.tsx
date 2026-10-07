import { colors } from "../styles/colors.js";

interface TransactionsTableProps {
  transactions: Array<{
    id: number;
    title: string;
    quantity: number;
    totalUsd: number;
    totalEur: number;
    totalGbp: number;
  }>;
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          color: colors.text.muted,
          background: colors.surface.card,
          borderRadius: 12,
          border: `1px dashed ${colors.surface.border}`,
        }}
      >
        No transactions found.
      </div>
    );
  }

  return (
    <div
      style={{
        overflow: "auto",
        borderRadius: 12,
        border: `1px solid ${colors.surface.border}`,
        background: colors.surface.card,
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
        <thead>
          <tr style={{ background: colors.brand.navy, color: colors.text.onDark }}>
            <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600 }}>Product</th>
            <th style={{ textAlign: "right", padding: "12px 16px", fontWeight: 600 }}>Qty</th>
            <th style={{ textAlign: "right", padding: "12px 16px", fontWeight: 600 }}>USD</th>
            <th style={{ textAlign: "right", padding: "12px 16px", fontWeight: 600 }}>EUR</th>
            <th style={{ textAlign: "right", padding: "12px 16px", fontWeight: 600 }}>GBP</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr
              key={tx.id}
              style={{
                borderBottom: `1px solid ${colors.surface.border}`,
                background: index % 2 === 0 ? colors.surface.card : colors.surface.hover,
              }}
            >
              <td style={{ padding: "12px 16px" }}>{tx.title}</td>
              <td style={{ textAlign: "right", padding: "12px 16px" }}>{tx.quantity}</td>
              <td style={{ textAlign: "right", padding: "12px 16px", fontWeight: 500 }}>${tx.totalUsd.toFixed(2)}</td>
              <td style={{ textAlign: "right", padding: "12px 16px" }}>€{tx.totalEur.toFixed(2)}</td>
              <td style={{ textAlign: "right", padding: "12px 16px" }}>£{tx.totalGbp.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
