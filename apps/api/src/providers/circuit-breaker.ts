import { ProviderError } from "@paylinkhub/types";
import type { ProviderAlias } from "@paylinkhub/types";

export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitBreakerOptions {
  failureThreshold: number;
  recoveryTimeoutMs: number;
}

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private nextAttemptAt = 0;

  constructor(private alias: ProviderAlias, private options: CircuitBreakerOptions) {}

  getState(): CircuitState {
    return this.state;
  }

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() < this.nextAttemptAt) {
        throw new ProviderError("unavailable", this.alias);
      }
      this.state = "half-open";
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = "closed";
  }

  private onFailure(): void {
    this.failures += 1;
    if (this.failures >= this.options.failureThreshold) {
      this.state = "open";
      this.nextAttemptAt = Date.now() + this.options.recoveryTimeoutMs;
    }
  }
}
