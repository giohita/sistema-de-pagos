import type { Customer, ProviderAlias, ProviderHealth } from "@paylinkhub/types";
import { env } from "../config/env.js";
import { HttpClient } from "./http-client.js";
import type { IProviderAdapter, ProviderResult } from "./provider.interface.js";

interface DummyJsonUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    address: string;
    city: string;
    country: string;
  };
  password?: string;
  ssn?: string;
  bank?: { cardNumber?: string };
  crypto?: { wallet?: string };
}

export class CoreProviderAdapter implements IProviderAdapter<number, Customer> {
  readonly alias: ProviderAlias = "core";
  private http = new HttpClient(this.alias);

  async fetch(customerId: number): Promise<ProviderResult<Customer>> {
    const startedAt = Date.now();
    try {
      const raw = await this.http.request<DummyJsonUser>({
        url: `${env.upstreams.coreBaseUrl}/users/${customerId}`,
      });

      const customer: Customer = {
        id: raw.id,
        fullName: `${raw.firstName} ${raw.lastName}`,
        email: raw.email,
        phone: raw.phone,
        address: {
          street: raw.address.address,
          city: raw.address.city,
          country: raw.address.country,
        },
      };

      return { ok: true, data: customer, latencyMs: Date.now() - startedAt };
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
      await this.http.request({ url: `${env.upstreams.coreBaseUrl}/users/1` });
      return { healthy: true, latencyMs: Date.now() - startedAt };
    } catch {
      return { healthy: false, latencyMs: Date.now() - startedAt };
    }
  }
}
