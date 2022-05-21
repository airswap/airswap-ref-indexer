import crypto from "crypto";
import { Order } from '../model/Order.js';
import { TransactionStatus } from '../model/TransactionStatus.js';
import { Database } from './Database.js';

export class InMemoryDatabase implements Database {
  database: Record<string, Order>;

  constructor() {
    this.database = {};
  }

  getOrderBy(fromToken: string, toToken: string, minFromToken: number, maxFromToken: number, minToToken: number, maxToToken: number): Promise<Record<string, Order>> {
    const orders = {};
    Object.values(this.database).filter((order: Order) => {
      let isFound = true;
      if (fromToken != undefined) { isFound = isFound && fromToken === order.fromToken }
      if (toToken != undefined) { isFound = isFound && toToken === order.toToken }
      if (minFromToken != undefined) { isFound = isFound && minFromToken >= order.amountFromToken }
      if (maxFromToken != undefined) { isFound = isFound && maxFromToken <= order.amountFromToken }
      if (minToToken != undefined) { isFound = isFound && minToToken >= order.amountToToken }
      if (maxToToken != undefined) { isFound = isFound && maxFromToken <= order.amountToToken }
    }).forEach((order) => {
      const orderId = order['id'];
      orders[`${orderId}`] = order;
    });

    return Promise.resolve(orders);
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

  async getOrders(): Promise<Record<string, Order>> {
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

  close() { }
}