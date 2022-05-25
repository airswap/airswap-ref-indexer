import crypto from "crypto";
import { Order } from '../model/Order.js';
import { Database } from './Database.js';

export class InMemoryDatabase implements Database {
  database: Record<string, Order>;

  constructor() {
    this.database = {};
  }

  getOrderBy(signerToken?: string, senderToken?: string, minSignerAmount?: number, maxSignerAmount?: number, minSenderAmount?: number, maxSenderAmount?): Promise<Record<string, Order>> {
    const orders = {};
    Object.values(this.database).filter((order: Order) => {
      let isFound = true;
      if (signerToken != undefined) { isFound = isFound && signerToken === order.signerToken }
      if (senderToken != undefined) { isFound = isFound && senderToken === order.senderToken }
      if (minSenderAmount != undefined) { isFound = isFound && order.senderAmount >= minSenderAmount }
      if (maxSenderAmount != undefined) { isFound = isFound && order.senderAmount <= maxSenderAmount }
      if (minSignerAmount != undefined) { isFound = isFound && order.signerAmount >= minSignerAmount }
      if (maxSignerAmount != undefined) { isFound = isFound && order.signerAmount <= maxSignerAmount }
      return isFound;
    }).forEach((order) => {
      const orderId = order['id'];
      orders[`${orderId}`] = order;
    });

    return Promise.resolve(orders);
  }

  addOrder = (order: Order) => {
    this.database[order.id] = order;
    return Promise.resolve();
  }

  addAll = (orders: Record<string, Order>) => {
    this.database = { ...orders };
    return Promise.resolve();
  }

  deleteOrder = (id: string) => {
    this.database[id] = undefined;
    return Promise.resolve();
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
    const lightenOrder = this.extractData(order);
    const stringObject = JSON.stringify(lightenOrder);
    const hashed = crypto.createHash("sha256").update(stringObject, "utf-8");
    return hashed.digest("hex");
  }

  private extractData(order: Order) {
    const lightenOrder = new Order(
      order.signerWallet,
      order.signerToken,
      order.senderToken,
      order.senderAmount,
      order.signerAmount,
      order.expiry
    );
    return lightenOrder;
  }

  close() { }
}