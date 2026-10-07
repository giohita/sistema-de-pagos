import type { ProviderAlias, ProviderHealth, Transaction } from "@paylinkhub/types";
import { env } from "../config/env.js";
import { HttpClient } from "./http-client.js";
import type { IProviderAdapter, ProviderResult } from "./provider.interface.js";

interface DummyJsonCart {
  id: number;
  products: Array<{
    id: number;
    title: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

interface DummyJsonCartsResponse {
  carts: DummyJsonCart[];
  total: number;
  skip: number;
  limit: number;
}

export function mapTransactions(carts: DummyJsonCart[]): Transaction[] {
  return carts.flatMap((cart) =>
    cart.products.map((product) => ({
      id: product.id,
      title: product.title,
      quantity: product.quantity,
      totalUsd: product.total,
      totalEur: 0,
      totalGbp: 0,
    })),
  );
}

export class PagosProviderAdapter
  implements IProviderAdapter<number, Transaction[]>
{
  readonly alias: ProviderAlias = "pagos";
  private http = new HttpClient(this.alias);

  async fetch(customerId: number): Promise<ProviderResult<Transaction[]>> {
    const startedAt = Date.now();
    try {
      const response = await this.http.request<DummyJsonCartsResponse>({
        url: `${env.upstreams.pagosBaseUrl}/carts/user/${customerId}`,
      });

      const transactions = mapTransactions(response.carts);

      return { ok: true, data: transactions, latencyMs: Date.now() - startedAt };
    } catch (error) {
      return {
        ok: false,
        error: error as any,
        latencyMs: Date.now() - startedAt,
      };
    }
  }

  async isHealthy(): Promise<ProviderHealth> {
    const startedAt = Date.now();
    try {
      await this.http.request({ url: `${env.upstreams.pagosBaseUrl}/carts/user/1` });
      return { healthy: true, latencyMs: Date.now() - startedAt };
    } catch {
      return { healthy: false, latencyMs: Date.now() - startedAt };
    }
  }
}
