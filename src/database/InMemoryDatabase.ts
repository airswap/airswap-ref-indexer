import crypto from "crypto";
import { OtcOrder } from '../model/OtcOrder.js';
import { Database } from './Database.js';

export class InMemoryDatabase implements Database {
  database: Record<string, OtcOrder>;

  constructor() {
    this.database = {};
  }

  getOrderBy(signerToken?: string, senderToken?: string, minSignerAmount?: number, maxSignerAmount?: number, minSenderAmount?: number, maxSenderAmount?): Promise<Record<string, OtcOrder>> {
    const orders = {};
    Object.values(this.database).filter((OtcOrder: OtcOrder) => {
      const order = OtcOrder.order;
      let isFound = true;
      if (signerToken != undefined) { isFound = isFound && signerToken === order.signerToken }
      if (senderToken != undefined) { isFound = isFound && senderToken === order.senderToken }
      if (minSenderAmount != undefined) { isFound = isFound && +order.senderAmount >= minSenderAmount }
      if (maxSenderAmount != undefined) { isFound = isFound && order.senderAmount <= maxSenderAmount }
      if (minSignerAmount != undefined) { isFound = isFound && +order.signerAmount >= minSignerAmount }
      if (maxSignerAmount != undefined) { isFound = isFound && +order.signerAmount <= maxSignerAmount }
      return isFound;
    }).forEach((OtcOrder) => {
      const orderId = OtcOrder['id'];
      orders[`${orderId}`] = OtcOrder;
    });

    return Promise.resolve(orders);
  }

  addOrder = (OtcOrder: OtcOrder) => {
    this.database[OtcOrder.id] = OtcOrder;
    return Promise.resolve();
  }

  addAll = (orders: Record<string, OtcOrder>) => {
    this.database = { ...orders };
    return Promise.resolve();
  }

  deleteOrder = (id: string) => {
    this.database[id] = undefined;
    return Promise.resolve();
  }

  getOrder(id: string): Promise<Record<string, OtcOrder>> {
    const result = {};
    result[id] = this.database[id];
    return Promise.resolve(this.database[id] ? result : null);
  }

  async getOrders(): Promise<Record<string, OtcOrder>> {
    return Promise.resolve(this.database);
  }

  orderExists = (id: string): Promise<boolean> => {
    return Promise.resolve(Object.keys(this.database).indexOf(id) != -1);
  }

  generateId(otcOrder: OtcOrder) {
    const lightenOrder = otcOrder.order;
    const stringObject = JSON.stringify(lightenOrder);
    const hashed = crypto.createHash("sha256").update(stringObject, "utf-8");
    return hashed.digest("hex");
  }

  erase() {
    this.database = {};
    return Promise.resolve();
  }

  close() { }
}