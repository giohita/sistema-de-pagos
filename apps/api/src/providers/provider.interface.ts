import type {
  ProviderAlias,
  ProviderHealth,
} from "@paylinkhub/types";

import type { ProviderResult as SharedProviderResult } from "@paylinkhub/types";

export type ProviderResult<T> = SharedProviderResult<T>;

export interface IProviderAdapter<TRequest, TResult> {
  readonly alias: ProviderAlias;
  fetch(input: TRequest): Promise<ProviderResult<TResult>>;
  isHealthy(): Promise<ProviderHealth>;
}
