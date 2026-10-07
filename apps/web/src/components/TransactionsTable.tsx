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
    return <p>No transactions found.</p>;
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#f0f0f0" }}>
          <th style={{ textAlign: "left", padding: 8 }}>Product</th>
          <th style={{ textAlign: "right", padding: 8 }}>Qty</th>
          <th style={{ textAlign: "right", padding: 8 }}>USD</th>
          <th style={{ textAlign: "right", padding: 8 }}>EUR</th>
          <th style={{ textAlign: "right", padding: 8 }}>GBP</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx) => (
          <tr key={tx.id} style={{ borderBottom: "1px solid #eee" }}>
            <td style={{ padding: 8 }}>{tx.title}</td>
            <td style={{ textAlign: "right", padding: 8 }}>{tx.quantity}</td>
            <td style={{ textAlign: "right", padding: 8 }}>${tx.totalUsd.toFixed(2)}</td>
            <td style={{ textAlign: "right", padding: 8 }}>€{tx.totalEur.toFixed(2)}</td>
            <td style={{ textAlign: "right", padding: 8 }}>£{tx.totalGbp.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
