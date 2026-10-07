import type {
  ProviderAlias,
  ProviderError,
  ProviderHealth,
} from "@paylinkhub/types";

export interface ProviderResult<T> {
  ok: boolean;
  data?: T;
  error?: ProviderError;
  latencyMs: number;
}

export interface IProviderAdapter<TRequest, TResult> {
  readonly alias: ProviderAlias;
  fetch(input: TRequest): Promise<ProviderResult<TResult>>;
  isHealthy(): Promise<ProviderHealth>;
}
