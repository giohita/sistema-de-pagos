import { env } from "../config/env.js";
import { closeMongoClient } from "../persistence/mongo-client.js";
import {
  InMemoryCustomerRepository,
  InMemoryTransactionRepository,
  MongoCustomerRepository,
  MongoTransactionRepository,
} from "./index.js";
import type { ICustomerRepository, ITransactionRepository } from "./index.js";

export interface Repositories {
  customerRepo: ICustomerRepository;
  transactionRepo: ITransactionRepository;
}

export function createRepositories(): Repositories {
  if (env.persistence.mode === "mongodb") {
    return {
      customerRepo: new MongoCustomerRepository(),
      transactionRepo: new MongoTransactionRepository(),
    };
  }

  return {
    customerRepo: new InMemoryCustomerRepository(),
    transactionRepo: new InMemoryTransactionRepository(),
  };
}

export async function closeRepositories(): Promise<void> {
  if (env.persistence.mode === "mongodb") {
    await closeMongoClient();
  }
}
