import crypto from "crypto";
import { IndexedOrder } from '../model/IndexedOrder.js';
import { OrderResponse } from './../model/OrderResponse.js';
import { Database } from './Database.js';
import { Filters } from './filter/Filters.js';
import { RequestFilter } from './filter/RequestFilter.js';
import { SortField } from "./filter/SortField.js";
import { SortOrder } from "./filter/SortOrder.js";

const elementPerPage = 20;
export class InMemoryDatabase implements Database {
  database: Record<string, IndexedOrder>;
  filters: Filters;

  constructor() {
    this.database = {};
    this.filters = new Filters();
  }

  getOrderBy(requestFilter: RequestFilter): Promise<OrderResponse> {
    const orders = {};
    const totalResults = Object.values(this.database).filter((indexedOrder: IndexedOrder) => {
      const order = indexedOrder.order;
      let isFound = true;
      if (requestFilter.signerTokens != undefined) { isFound = isFound && requestFilter.signerTokens.indexOf(order.signerToken) !== -1; }
      if (requestFilter.senderTokens != undefined) { isFound = isFound && requestFilter.senderTokens.indexOf(order.senderToken) !== -1; }
      if (requestFilter.minSenderAmount != undefined) { isFound = isFound && order.approximatedSenderAmount >= requestFilter.minSenderAmount; }
      if (requestFilter.maxSenderAmount != undefined) { isFound = isFound && order.approximatedSenderAmount <= requestFilter.maxSenderAmount; }
      if (requestFilter.minSignerAmount != undefined) { isFound = isFound && order.approximatedSignerAmount >= requestFilter.minSignerAmount; }
      if (requestFilter.maxSignerAmount != undefined) { isFound = isFound && order.approximatedSignerAmount <= requestFilter.maxSignerAmount; }
      if (requestFilter.maxAddedDate != undefined) {
        isFound = isFound && +indexedOrder.addedOn >= requestFilter.maxAddedDate;
      }
      return isFound;
    })
      .sort((a: IndexedOrder, b: IndexedOrder) => {
        if (requestFilter.sortField == SortField.SIGNER_AMOUNT) {
          if (requestFilter.sortOrder == SortOrder.ASC) {
            return a.order.approximatedSignerAmount - b.order.approximatedSignerAmount
          } else {
            return b.order.approximatedSignerAmount - a.order.approximatedSignerAmount
          }
        }
        if (requestFilter.sortField == SortField.SENDER_AMOUNT) {
          if (requestFilter.sortOrder == SortOrder.ASC) {
            return a.order.approximatedSenderAmount - b.order.approximatedSenderAmount
          } else {
            return b.order.approximatedSenderAmount - a.order.approximatedSenderAmount
          }
        }
      });
    const totalResultsCount = totalResults.length;
    totalResults.slice((requestFilter.page - 1) * elementPerPage, requestFilter.page * elementPerPage)
      .forEach((IndexedOrder) => {
        const orderHash = IndexedOrder['hash'];
        orders[`${orderHash}`] = IndexedOrder;
      });

    return Promise.resolve(new OrderResponse(orders, Math.ceil(totalResultsCount / elementPerPage)));
  }

  addOrder(indexedOrder: IndexedOrder) {
    this.database[indexedOrder.hash] = indexedOrder;
    this.filters.addSignerToken(indexedOrder.order.signerToken, indexedOrder.order.approximatedSignerAmount);
    this.filters.addSenderToken(indexedOrder.order.senderToken, indexedOrder.order.approximatedSenderAmount);
    return Promise.resolve();
  }

  async addAll(orders: Record<string, IndexedOrder>): Promise<void> {
    await Promise.all(Object.keys(orders).map(async hash => {
      await this.addOrder(orders[hash]);
    }));
    return Promise.resolve();
  }

  deleteOrder(hash: string) {
    delete this.database[hash];
    return Promise.resolve();
  }

  getOrder(hash: string): Promise<OrderResponse> {
    const result = {};
    result[hash] = this.database[hash];
    if (this.database[hash]) {
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

  orderExists(hash: string): Promise<boolean> {
    return Promise.resolve(Object.keys(this.database).indexOf(hash) != -1);
  }

  generateHash(indexedOrder: IndexedOrder) {
    const lightenOrder = {...indexedOrder.order};
    delete lightenOrder.approximatedSenderAmount
    delete lightenOrder.approximatedSignerAmount
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