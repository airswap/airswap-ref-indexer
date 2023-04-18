import { IndexedOrder as IndexedOrderResponse, OrderResponse, RequestFilter, SortField, SortOrder } from '@airswap/types';
import crypto from "crypto";
import { computePagination } from '../mapper/pagination/index.js';
import { mapAnyToFullOrder } from '../mapper/mapAnyToFullOrder.js';
import { IndexedOrder } from '../model/IndexedOrder.js';
import { Database } from './Database.js';
import { Filters } from './filter/Filters.js';
import { FullOrderERC20 } from '@airswap/typescript';

const elementPerPage = 20;
export class InMemoryDatabase implements Database {
  database: Record<string, IndexedOrder>;
  filters: Filters;

  constructor() {
    this.database = {};
    this.filters = new Filters();
  }
  connect(databaseName: string, deleteOnStart: boolean): Promise<void> {
    return Promise.resolve();
  }

  getOrderERC20By(requestFilter: RequestFilter): Promise<OrderResponse<FullOrderERC20>> {
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
            //@ts-ignore
            return Number(a.order.approximatedSignerAmount - b.order.approximatedSignerAmount)
          }
          //@ts-ignore
          return Number(b.order.approximatedSignerAmount - a.order.approximatedSignerAmount)
        }
        if (requestFilter.sortOrder == SortOrder.ASC) {
          //@ts-ignore
          return Number(a.order.approximatedSenderAmount - b.order.approximatedSenderAmount)
        }
        //@ts-ignore
        return Number(b.order.approximatedSenderAmount - a.order.approximatedSenderAmount)
      });
    const totalResultsCount = totalResults.length;
    const orders: Record<string, IndexedOrderResponse<FullOrderERC20>> = totalResults
      .slice((requestFilter.page - 1) * elementPerPage, requestFilter.page * elementPerPage)
      .reduce((total, indexedOrder) => {
        const orderId = indexedOrder['hash'];
        if (orderId) {
          return { ...total, [orderId]: this.mapToIndexedOrderResponse(indexedOrder) };
        }
        console.warn("InMemoryDb - Defect Object:", indexedOrder);
        return { ...total };
      }, {});

    return Promise.resolve({
      orders,
      pagination:computePagination(elementPerPage, totalResultsCount, requestFilter.page),
      ordersForQuery:totalResultsCount
    });
  }

  addOrder(indexedOrder: IndexedOrder) {
    this.database[indexedOrder.hash!] = indexedOrder;
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

  deleteOrderERC20(nonce: string, signerWallet: string): Promise<void> {
    const orderToDelete = Object.values(this.database).find((indexedOrder: IndexedOrder) => {
      return indexedOrder.order.nonce === nonce && indexedOrder.order.signerWallet === signerWallet
    });
    if (orderToDelete && orderToDelete.hash) {
      delete this.database[orderToDelete.hash];
    }
    return Promise.resolve();
  }
  
  deleteExpiredOrderERC20(timestampInSeconds: number) {
    const hashToDelete: string[] = Object.keys(this.database).filter((key: string) => {
      return this.database[key].order.expiry < timestampInSeconds;
    });
    hashToDelete.forEach(hash => {
      delete this.database[hash];
    })
    return Promise.resolve();
  }

  getOrderERC20(hash: string): Promise<OrderResponse<FullOrderERC20>> {
    const result: Record<string, IndexedOrderResponse<FullOrderERC20>> = {};
    if (this.database[hash]) {
      result[hash] = this.mapToIndexedOrderResponse(this.database[hash]);
      return Promise.resolve({
        orders:result,
        pagination: computePagination(elementPerPage, 1),
        ordersForQuery:1
      });
    }
    return Promise.resolve({
      orders:result,
      pagination: computePagination(elementPerPage, 0),
      ordersForQuery:0
    });
  }

  async getOrdersERC20(): Promise<OrderResponse<FullOrderERC20>> {
    const size = Object.keys(this.database).length;
    const results: Record<string, IndexedOrderResponse<FullOrderERC20>> = {};
    Object.keys(this.database).forEach(key => {
      results[key] = this.mapToIndexedOrderResponse(this.database[key])
    })
    return Promise.resolve({
      orders:results,
      pagination: computePagination(size, size),
      ordersForQuery:size
    });
  }

  getFiltersERC20(): Promise<Filters> {
    return Promise.resolve(this.filters);
  }

  orderERC20Exists(hash: string): Promise<boolean> {
    return Promise.resolve(Object.keys(this.database).indexOf(hash) != -1);
  }

  generateHash(indexedOrder: IndexedOrder) {
    const lightenOrder = { ...indexedOrder.order };
    //@ts-ignore
    delete lightenOrder.approximatedSenderAmount
    //@ts-ignore
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

  close() {
    return Promise.resolve();
  }

  private mapToIndexedOrderResponse(indexedOrder: IndexedOrder): IndexedOrderResponse<FullOrderERC20> {
    return {
      hash: indexedOrder.hash,
      addedOn:indexedOrder.addedOn,
      order:mapAnyToFullOrder(indexedOrder.order)
    };
  }
}