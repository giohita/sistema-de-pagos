export interface Address {
  street: string;
  city: string;
  country: string;
}

export interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address: Address;
}

export interface Transaction {
  id: number;
  title: string;
  quantity: number;
  totalUsd: number;
  totalEur: number;
  totalGbp: number;
}

export interface Summary {
  count: number;
  totalUsd: number;
}

export interface FxSnapshot {
  base: string;
  rates: Record<string, number>;
}

export interface ProviderHealth {
  healthy: boolean;
  latencyMs?: number;
  error?: string;
}

export type ProviderAlias = "core" | "pagos" | "fx" | "inestable";

export interface Dashboard {
  customer: Customer;
  transactions: Transaction[];
  summary: Summary;
  fx: FxSnapshot;
  providers: Record<ProviderAlias, ProviderHealth>;
  partial: boolean;
  warnings: string[];
}

export interface ProviderResult<T> {
  ok: boolean;
  data?: T;
  error?: ProviderError;
  latencyMs: number;
}

export type ProviderErrorKind =
  | "timeout"
  | "network"
  | "http_5xx"
  | "http_4xx"
  | "mapping"
  | "unavailable";

export class ProviderError extends Error {
  constructor(
    readonly kind: ProviderErrorKind,
    readonly provider: ProviderAlias,
    readonly cause?: Error,
  ) {
    super(`${provider}: ${kind}`);
    this.name = "ProviderError";
  }

  isRetryable(): boolean {
    return (
      this.kind === "timeout" ||
      this.kind === "network" ||
      this.kind === "http_5xx"
    );
  }
}
