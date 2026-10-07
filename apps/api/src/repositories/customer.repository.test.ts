import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { InMemoryCustomerRepository } from "./customer.repository.js";

describe("InMemoryCustomerRepository", () => {
  it("saves and finds a customer", async () => {
    const repo = new InMemoryCustomerRepository();
    const customer = {
      id: 1,
      fullName: "Terry Medhurst",
      email: "atuny0@sohu.com",
      phone: "+63 791 675 8914",
      address: { street: "1745 T Street Southeast", city: "Washington", country: "United States" },
    };

    await repo.save(customer);
    const found = await repo.findById(1);

    assert.deepEqual(found, customer);
  });

  it("rejects duplicate emails for different ids", async () => {
    const repo = new InMemoryCustomerRepository();
    await repo.save({
      id: 1,
      fullName: "A",
      email: "a@example.com",
      phone: "1",
      address: { street: "S", city: "C", country: "CO" },
    });

    await assert.rejects(
      repo.save({
        id: 2,
        fullName: "B",
        email: "a@example.com",
        phone: "2",
        address: { street: "S", city: "C", country: "CO" },
      }),
      /Duplicate email/,
    );
  });
});
