import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FxCache } from "./fx-cache.js";

describe("FxCache", () => {
  it("returns null when empty", () => {
    const cache = new FxCache(60000);
    assert.equal(cache.get(), null);
  });

  it("returns cached value within TTL", () => {
    const cache = new FxCache(60000);
    const fx = { base: "USD", rates: { EUR: 0.9, GBP: 0.8 } };
    cache.set(fx);
    assert.deepEqual(cache.get(), fx);
  });

  it("returns null after TTL expires", () => {
    const cache = new FxCache(1);
    cache.set({ base: "USD", rates: { EUR: 0.9, GBP: 0.8 } });
    const start = Date.now();
    while (Date.now() - start < 5) {}
    assert.equal(cache.get(), null);
  });

  it("can be invalidated manually", () => {
    const cache = new FxCache(60000);
    cache.set({ base: "USD", rates: { EUR: 0.9, GBP: 0.8 } });
    cache.invalidate();
    assert.equal(cache.get(), null);
  });
});
