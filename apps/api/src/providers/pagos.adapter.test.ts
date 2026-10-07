import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mapTransactions } from "./pagos.adapter.js";

describe("mapTransactions", () => {
  it("unwraps carts and maps products to canonical transactions", () => {
    const carts = [
      {
        id: 1,
        products: [
          { id: 59, title: "Spring and summershoes", quantity: 2, price: 20, total: 40 },
          { id: 88, title: "TC Reusable Silicone Magic Washing Gloves", quantity: 1, price: 11, total: 11 },
        ],
      },
    ];

    const tx = mapTransactions(carts);

    assert.equal(tx.length, 2);
    assert.equal(tx[0].title, "Spring and summershoes");
    assert.equal(tx[0].totalUsd, 40);
    assert.equal(tx[0].totalEur, 0);
    assert.equal(tx[0].totalGbp, 0);
  });
});
