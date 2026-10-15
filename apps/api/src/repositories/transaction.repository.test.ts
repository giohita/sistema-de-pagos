import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { InMemoryTransactionRepository } from "./transaction.repository.js";

describe("InMemoryTransactionRepository", () => {
  it("saves and finds transactions by customer id", async () => {
    const repo = new InMemoryTransactionRepository();
    const txs = [
      { id: 1, title: "A", quantity: 1, totalUsd: 10, totalEur: 9, totalGbp: 8 },
      { id: 2, title: "B", quantity: 2, totalUsd: 20, totalEur: 18, totalGbp: 16 },
    ];

    await repo.save(1, txs);
    const found = await repo.findByCustomerId(1);

    assert.deepEqual(found, txs);
    assert.deepEqual(await repo.findByCustomerId(2), []);
  });
});
