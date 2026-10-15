import type { Transaction } from "@paylinkhub/types";

export interface ITransactionRepository {
  save(customerId: number, transactions: Transaction[]): Promise<Transaction[]>;
  findByCustomerId(customerId: number): Promise<Transaction[]>;
}

export class InMemoryTransactionRepository implements ITransactionRepository {
  private store = new Map<number, Transaction[]>();

  async save(customerId: number, transactions: Transaction[]): Promise<Transaction[]> {
    this.store.set(customerId, transactions);
    return transactions;
  }

  async findByCustomerId(customerId: number): Promise<Transaction[]> {
    return this.store.get(customerId) ?? [];
  }
}
