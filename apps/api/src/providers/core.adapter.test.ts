import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mapCustomer } from "./core.adapter.js";

describe("mapCustomer", () => {
  it("maps DummyJSON user to canonical Customer", () => {
    const raw = {
      id: 1,
      firstName: "Terry",
      lastName: "Medhurst",
      email: "atuny0@sohu.com",
      phone: "+63 791 675 8914",
      address: {
        address: "1745 T Street Southeast",
        city: "Washington",
        country: "United States",
      },
      password: "9uQFF1Lh",
      ssn: "845-64-9012",
      bank: { cardNumber: "50380955204220685" },
      crypto: { wallet: "0xb9fc2fe63b2a6c3" },
    } as const;

    const customer = mapCustomer(raw);

    assert.equal(customer.id, 1);
    assert.equal(customer.fullName, "Terry Medhurst");
    assert.equal(customer.email, "atuny0@sohu.com");
    assert.equal(customer.address.city, "Washington");

    assert.ok(!(customer as any).password, "password must be stripped");
    assert.ok(!(customer as any).ssn, "ssn must be stripped");
    assert.ok(!(customer as any).bank, "bank must be stripped");
    assert.ok(!(customer as any).crypto, "crypto must be stripped");
  });
});
