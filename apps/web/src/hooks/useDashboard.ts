import { useQuery } from "@tanstack/react-query";
import { fetchDashboard, type DashboardResponse } from "../services/api.js";

export function useDashboard(customerId: number) {
  return useQuery<DashboardResponse, Error>({
    queryKey: ["dashboard", customerId],
    queryFn: () => fetchDashboard(customerId),
  });
}
