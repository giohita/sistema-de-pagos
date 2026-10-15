import type { Customer } from "@paylinkhub/types";
import { getMongoDb } from "../persistence/mongo-client.js";
import type { ICustomerRepository } from "./customer.repository.js";

interface CustomerDoc {
  _id: number;
  data: Customer;
}

export class MongoCustomerRepository implements ICustomerRepository {
  private collectionName = "customers";

  async findById(id: number): Promise<Customer | null> {
    const db = await getMongoDb();
    const doc = await db
      .collection<CustomerDoc>(this.collectionName)
      .findOne({ _id: id } as any);
    return doc?.data ?? null;
  }

  async save(customer: Customer): Promise<Customer> {
    const db = await getMongoDb();
    await db.collection<CustomerDoc>(this.collectionName).replaceOne(
      { _id: customer.id } as any,
      { _id: customer.id, data: customer } as any,
      { upsert: true },
    );
    return customer;
  }
}
