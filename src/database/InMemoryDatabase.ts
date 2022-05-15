import crypto from "crypto";
import { Database } from './Database.js';
import { TransactionStatus } from '../model/TransactionStatus.js';
import { Order } from '../model/Order.js';

export class InMemoryDatabase implements Database {
  database: Record<string, Order>;

  constructor() {
    this.database = {};
  }

  addOrder = (order: Order) => {
    this.database[order.id] = order;
  }

  addAll = (orders: Record<string, Order>) => {
    this.database = { ...orders };
  }

  editOrder = (id: string, status: TransactionStatus) => {
    this.database[id]!.status = status;
  }

  getOrder(id: string): Promise<Order> {
        return Promise.resolve(this.database[id]);
  }

  async getorders(): Promise<Record<string, Order>> {
    return Promise.resolve(this.database);
  }

  orderExists = (id: string): Promise<boolean> => {
    return Promise.resolve(Object.keys(this.database).indexOf(id) != -1);
  }

  generateId(order: Order) {
    const stringObject = JSON.stringify(order);
    const hashed = crypto.createHash("sha256").update(stringObject, "utf-8");
    return hashed.digest("hex");
  }
}