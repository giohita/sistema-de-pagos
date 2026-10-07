import type { Dashboard, Summary, Transaction } from "@paylinkhub/types";
import { ProviderOrchestrator } from "./provider-orchestrator.js";

export class DashboardService {
  constructor(private orchestrator: ProviderOrchestrator) {}

  async buildDashboard(customerId: number): Promise<Dashboard> {
    const result = await this.orchestrator.run(customerId);

    const transactions = result.transactions || [];
    const fx = result.fx || { base: "USD", rates: { EUR: 0, GBP: 0 } };

    const convertedTransactions: Transaction[] = transactions.map((tx) => ({
      ...tx,
      totalEur: fx.rates.EUR ? Number((tx.totalUsd * fx.rates.EUR).toFixed(2)) : 0,
      totalGbp: fx.rates.GBP ? Number((tx.totalUsd * fx.rates.GBP).toFixed(2)) : 0,
    }));

    const summary: Summary = {
      count: convertedTransactions.length,
      totalUsd: convertedTransactions.reduce((sum, tx) => sum + tx.totalUsd, 0),
    };

    // Fallback mock customer for graceful degradation when CORE fails
    const customer =
      result.customer || {
        id: customerId,
        fullName: "Unknown customer",
        email: "-",
        phone: "-",
        address: { street: "-", city: "-", country: "-" },
      };

    return {
      customer,
      transactions: convertedTransactions,
      summary,
      fx,
      providers: result.providerHealth,
      partial: result.partial,
      warnings: result.warnings,
    };
  }
}
