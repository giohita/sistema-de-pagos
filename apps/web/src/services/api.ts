const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export interface DashboardResponse {
  customer: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    address: { street: string; city: string; country: string };
  };
  transactions: Array<{
    id: number;
    title: string;
    quantity: number;
    totalUsd: number;
    totalEur: number;
    totalGbp: number;
  }>;
  summary: { count: number; totalUsd: number };
  fx: { base: string; rates: Record<string, number> };
  providers: Record<
    string,
    { healthy: boolean; latencyMs?: number; error?: string }
  >;
  partial: boolean;
  warnings: string[];
}

export async function fetchDashboard(customerId: number): Promise<DashboardResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/${customerId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
