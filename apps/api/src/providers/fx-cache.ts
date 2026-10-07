import type { FxSnapshot } from "@paylinkhub/types";

interface CacheEntry {
  fx: FxSnapshot;
  expiresAt: number;
}

export class FxCache {
  private entry: CacheEntry | null = null;

  constructor(private ttlMs: number) {}

  get(): FxSnapshot | null {
    if (!this.entry) return null;
    if (Date.now() > this.entry.expiresAt) {
      this.entry = null;
      return null;
    }
    return this.entry.fx;
  }

  set(fx: FxSnapshot): void {
    this.entry = { fx, expiresAt: Date.now() + this.ttlMs };
  }

  invalidate(): void {
    this.entry = null;
  }
}
