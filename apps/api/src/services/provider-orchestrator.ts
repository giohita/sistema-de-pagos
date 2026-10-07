import type {
  Customer,
  FxSnapshot,
  ProviderAlias,
  ProviderHealth,
  Transaction,
} from "@paylinkhub/types";
import {
  CoreProviderAdapter,
  FxProviderAdapter,
  InestableProviderAdapter,
  PagosProviderAdapter,
} from "../providers/index.js";
import type { IProviderAdapter, ProviderResult } from "../providers/provider.interface.js";

export interface OrchestratorResult {
  customer?: Customer;
  transactions?: Transaction[];
  fx?: FxSnapshot;
  providerHealth: Record<ProviderAlias, ProviderHealth>;
  partial: boolean;
  warnings: string[];
}

export class ProviderOrchestrator {
  private adapters: Array<IProviderAdapter<unknown, unknown>> = [
    new CoreProviderAdapter(),
    new PagosProviderAdapter(),
    new FxProviderAdapter(),
    new InestableProviderAdapter(),
  ];

  async run(customerId: number): Promise<OrchestratorResult> {
    const results = await Promise.allSettled(
      this.adapters.map(async (adapter) => {
        if (adapter.alias === "fx" || adapter.alias === "inestable") {
          return { alias: adapter.alias, result: await adapter.fetch(undefined) };
        }
        return {
          alias: adapter.alias,
          result: await adapter.fetch(customerId),
        };
      }),
    );

    let customer: Customer | undefined;
    let transactions: Transaction[] | undefined;
    let fx: FxSnapshot | undefined;
    const providerHealth: Record<ProviderAlias, ProviderHealth> = {
      core: { healthy: false },
      pagos: { healthy: false },
      fx: { healthy: false },
      inestable: { healthy: false },
    };
    const warnings: string[] = [];

    for (const settled of results) {
      if (settled.status === "rejected") {
        const alias = "inestable" as ProviderAlias; // fallback
        providerHealth[alias] = { healthy: false, error: "unexpected rejection" };
        warnings.push(`Provider '${alias}' failed unexpectedly.`);
        continue;
      }

      const { alias, result } = settled.value;
      const typed = result as ProviderResult<unknown>;

      if (typed.ok) {
        providerHealth[alias] = { healthy: true, latencyMs: typed.latencyMs };
        if (alias === "core") customer = typed.data as Customer;
        if (alias === "pagos") transactions = typed.data as Transaction[];
        if (alias === "fx") fx = typed.data as FxSnapshot;
      } else {
        providerHealth[alias] = {
          healthy: false,
          latencyMs: typed.latencyMs,
          error: typed.error?.message || "unknown error",
        };
        warnings.push(
          `Provider '${alias}' did not respond (${typed.error?.kind || "unknown"}); partial data returned.`,
        );
      }
    }

    const partial =
      !customer || !transactions || !fx || !providerHealth.inestable.healthy;

    return {
      customer,
      transactions,
      fx,
      providerHealth,
      partial,
      warnings,
    };
  }
}
