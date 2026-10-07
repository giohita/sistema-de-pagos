import type { Customer } from "@paylinkhub/types";

export interface ICustomerRepository {
  findById(id: number): Promise<Customer | null>;
  save(customer: Customer): Promise<Customer>;
}

export class InMemoryCustomerRepository implements ICustomerRepository {
  private store = new Map<number, Customer>();
  private emails = new Set<string>();

  async findById(id: number): Promise<Customer | null> {
    return this.store.get(id) ?? null;
  }

  async save(customer: Customer): Promise<Customer> {
    if (this.emails.has(customer.email) && this.store.get(customer.id)?.email !== customer.email) {
      throw new Error(`Duplicate email: ${customer.email}`);
    }
    this.store.set(customer.id, customer);
    this.emails.add(customer.email);
    return customer;
  }
}
