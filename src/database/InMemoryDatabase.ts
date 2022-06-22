import crypto from "crypto";
import { OtcOrder } from '../model/OtcOrder.js';
import { OrderResponse } from './../model/OrderResponse.js';
import { Database } from './Database.js';
import { Filters } from './filter/Filters.js';
import { RequestFilter } from './filter/RequestFilter.js';
import { SortField } from "./filter/SortField.js";
import { SortOrder } from "./filter/SortOrder.js";

const elementPerPage = 20;
export class InMemoryDatabase implements Database {
  database: Record<string, OtcOrder>;
  filters: Filters;

  constructor() {
    this.database = {};
    this.filters = new Filters();
  }

  getOrderBy(requestFilter: RequestFilter): Promise<OrderResponse> {
    const orders = {};
    const totalResults = Object.values(this.database).filter((otcOrder: OtcOrder) => {
      const order = otcOrder.order;
      let isFound = true;
      if (requestFilter.signerTokens != undefined) { isFound = isFound && requestFilter.signerTokens.indexOf(order.signerToken) !== -1; }
      if (requestFilter.senderTokens != undefined) { isFound = isFound && requestFilter.senderTokens.indexOf(order.senderToken) !== -1; }     
      if (requestFilter.minSenderAmount != undefined) { isFound = isFound && order.senderAmount >= requestFilter.minSenderAmount; }
      if (requestFilter.maxSenderAmount != undefined) { isFound = isFound && order.senderAmount <= requestFilter.maxSenderAmount; }
      if (requestFilter.minSignerAmount != undefined) { isFound = isFound && order.signerAmount >= requestFilter.minSignerAmount; }
      if (requestFilter.maxSignerAmount != undefined) { isFound = isFound && order.signerAmount <= requestFilter.maxSignerAmount; }
      if (requestFilter.maxAddedDate != undefined) {
        isFound = isFound && +otcOrder.addedOn >= requestFilter.maxAddedDate;
      }
      return isFound;
    })
      .sort((a: OtcOrder, b: OtcOrder) => {
        if (requestFilter.sortField == SortField.SIGNER_AMOUNT) {
          if (requestFilter.sortOrder == SortOrder.ASC) {
            return (a.order.signerAmount) - (b.order.signerAmount)
          } else {
            return (b.order.signerAmount) - (a.order.signerAmount)
          }
        }
        if (requestFilter.sortField == SortField.SENDER_AMOUNT) {
          if (requestFilter.sortOrder == SortOrder.ASC) {
            return (a.order.senderAmount) - (b.order.senderAmount)
          } else {
            return (b.order.senderAmount) - (a.order.senderAmount)
          }
        }
      });
    const totalResultsCount = totalResults.length;
    totalResults.slice((requestFilter.page - 1) * elementPerPage, requestFilter.page * elementPerPage)
      .forEach((OtcOrder) => {
        const orderId = OtcOrder['id'];
        orders[`${orderId}`] = OtcOrder;
      });

    return Promise.resolve(new OrderResponse(orders,  Math.ceil(totalResultsCount / elementPerPage)));
  }

  addOrder(otcOrder: OtcOrder) {
    this.database[otcOrder.id] = otcOrder;
    this.filters.addSignerToken(otcOrder.order.signerToken, otcOrder.order.signerAmount);
    this.filters.addSenderToken(otcOrder.order.senderToken, otcOrder.order.senderAmount);
    return Promise.resolve();
  }

  async addAll(orders: Record<string, OtcOrder>): Promise<void> {
    await Promise.all(Object.keys(orders).map(async id => {
      await this.addOrder(orders[id]);
    }));
    return Promise.resolve();
  }

  deleteOrder(id: string) {
    delete this.database[id];
    return Promise.resolve();
  }

  getOrder(id: string): Promise<OrderResponse> {
    const result = {};
    result[id] = this.database[id];
    if (this.database[id]) {
      return Promise.resolve(new OrderResponse(result, 1));
    }
    return Promise.resolve(new OrderResponse(null, 0));
  }

  async getOrders(): Promise<OrderResponse> {
    const size = Object.keys(this.database).length;
    return Promise.resolve(new OrderResponse(this.database, size == 0 ? 0 : Math.ceil(Object.keys(this.database).length / elementPerPage)));
  }

  getFilters(): Promise<Filters> {
    return Promise.resolve(this.filters);
  }

  orderExists(id: string): Promise<boolean> {
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
    this.filters = new Filters();
    return Promise.resolve();
  }

  close() { }
}