import type { FxSnapshot, ProviderAlias, ProviderHealth } from "@paylinkhub/types";
import { env } from "../config/env.js";
import { logProvider } from "../utils/logger.js";
import { FxCache } from "./fx-cache.js";
import { HttpClient } from "./http-client.js";
import type { IProviderAdapter, ProviderResult } from "./provider.interface.js";

interface FrankfurterLatest {
  base: string;
  rates: Record<string, number>;
}

export class FxProviderAdapter implements IProviderAdapter<void, FxSnapshot> {
  readonly alias: ProviderAlias = "fx";
  private http = new HttpClient(this.alias);
  private cache = new FxCache(env.cache.fxTtlMs);

  async fetch(): Promise<ProviderResult<FxSnapshot>> {
    const startedAt = Date.now();
    const cached = this.cache.get();
    if (cached) {
      logProvider({ provider: this.alias, outcome: "cached", latencyMs: 0 });
      return { ok: true, data: cached, latencyMs: 0, cached: true };
    }

    try {
      const raw = await this.http.request<FrankfurterLatest>({
        url: `${env.upstreams.fxBaseUrl}/v1/latest`,
        params: { base: "USD", symbols: "EUR,GBP" },
      });

      const fx: FxSnapshot = {
        base: raw.base,
        rates: {
          EUR: raw.rates.EUR,
          GBP: raw.rates.GBP,
        },
      };

      this.cache.set(fx);

      return { ok: true, data: fx, latencyMs: Date.now() - startedAt };
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
      await this.http.request({
        url: `${env.upstreams.fxBaseUrl}/v1/latest`,
        params: { base: "USD", symbols: "EUR,GBP" },
      });
      return { healthy: true, latencyMs: Date.now() - startedAt };
    } catch {
      return { healthy: false, latencyMs: Date.now() - startedAt };
    }
  }
}
