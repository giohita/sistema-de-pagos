import type { ProviderAlias, ProviderHealth } from "@paylinkhub/types";
import { env } from "../config/env.js";
import { HttpClient } from "./http-client.js";
import type { IProviderAdapter, ProviderResult } from "./provider.interface.js";

export class InestableProviderAdapter
  implements IProviderAdapter<void, { status: number }>
{
  readonly alias: ProviderAlias = "inestable";
  private http = new HttpClient(this.alias);

  async fetch(): Promise<ProviderResult<{ status: number }>> {
    const startedAt = Date.now();
    try {
      const status = await this.http.request({
        url: `${env.upstreams.inestableBaseUrl}/status/500`,
      });
      return {
        ok: true,
        data: { status: status as unknown as number },
        latencyMs: Date.now() - startedAt,
      };
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
        url: `${env.upstreams.inestableBaseUrl}/status/200`,
      });
      return { healthy: true, latencyMs: Date.now() - startedAt };
    } catch {
      return { healthy: false, latencyMs: Date.now() - startedAt };
    }
  }
}
