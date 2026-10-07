import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CircuitBreaker } from "./circuit-breaker.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("CircuitBreaker", () => {
  it("starts closed", () => {
    const cb = new CircuitBreaker("inestable", { failureThreshold: 3, recoveryTimeoutMs: 1000 });
    assert.equal(cb.getState(), "closed");
  });

  it("opens after threshold failures", async () => {
    const cb = new CircuitBreaker("inestable", { failureThreshold: 2, recoveryTimeoutMs: 1000 });
    await assert.rejects(cb.call(() => Promise.reject(new Error("boom"))));
    await assert.rejects(cb.call(() => Promise.reject(new Error("boom"))));
    assert.equal(cb.getState(), "open");
    await assert.rejects(cb.call(() => Promise.resolve("ok")));
  });

  it("closes again after success in half-open", async () => {
    const cb = new CircuitBreaker("inestable", { failureThreshold: 1, recoveryTimeoutMs: 50 });
    await assert.rejects(cb.call(() => Promise.reject(new Error("boom"))));
    assert.equal(cb.getState(), "open");
    await sleep(80);
    await cb.call(() => Promise.resolve("ok"));
    assert.equal(cb.getState(), "closed");
  });
});
