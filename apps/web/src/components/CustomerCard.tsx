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
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
        background: "#fafafa",
      }}
    >
      <p>
        <strong>Name:</strong> {customer.fullName}
      </p>
      <p>
        <strong>Email:</strong> {customer.email}
      </p>
      <p>
        <strong>Phone:</strong> {customer.phone}
      </p>
      <p>
        <strong>Address:</strong> {customer.address.street}, {customer.address.city},{" "}
        {customer.address.country}
      </p>
    </div>
  );
}
