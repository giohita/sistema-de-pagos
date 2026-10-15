import type { Transaction } from "@paylinkhub/types";
import { getMongoDb } from "../persistence/mongo-client.js";
import type { ITransactionRepository } from "./transaction.repository.js";

interface TransactionDoc {
  _id: number;
  data: Transaction[];
}

export class MongoTransactionRepository implements ITransactionRepository {
  private collectionName = "transactions";

  async findByCustomerId(customerId: number): Promise<Transaction[]> {
    const db = await getMongoDb();
    const doc = await db
      .collection<TransactionDoc>(this.collectionName)
      .findOne({ _id: customerId } as any);
    return doc?.data ?? [];
  }

  async save(customerId: number, transactions: Transaction[]): Promise<Transaction[]> {
    const db = await getMongoDb();
    await db.collection<TransactionDoc>(this.collectionName).replaceOne(
      { _id: customerId } as any,
      { _id: customerId, data: transactions } as any,
      { upsert: true },
    );
    return transactions;
  }
}
