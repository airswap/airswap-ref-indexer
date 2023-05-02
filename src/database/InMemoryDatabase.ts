import { FullOrder, FullOrderERC20, IndexedOrder, OrderResponse, RequestFilterERC20, SortField, SortOrder, RequestFilter } from '@airswap/types';
import crypto from "crypto";
import { computePagination } from '../mapper/pagination/index.js';
import { Database } from './Database.js';
import { Filters } from './filter/Filters.js';
import { DbOrderERC20, DbOrder } from '../model/DbOrderTypes.js';
import { mapAnyToFullOrderERC20 } from '../mapper/mapAnyToFullOrderERC20.js';
import { mapAnyToFullOrder } from '../mapper/mapAnyToFullOrder.js';

const elementPerPage = 20;

export class InMemoryDatabase implements Database {
  erc20Database: Record<string, IndexedOrder<DbOrderERC20>>;
  orderDatabase: Record<string, IndexedOrder<DbOrder>>;
  filters: Filters;

  constructor() {
    this.erc20Database = {};
    this.orderDatabase = {};
    this.filters = new Filters();
  }

  connect(databaseName: string, deleteOnStart: boolean): Promise<void> {
    return Promise.resolve();
  }

  getOrdersERC20By(requestFilter: RequestFilterERC20): Promise<OrderResponse<FullOrderERC20>> {
    const totalResults = Object.values(this.erc20Database).filter((indexedOrder: IndexedOrder<DbOrderERC20>) => {
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
      .sort((a, b) => {
        if (requestFilter.sortField == SortField.SIGNER_AMOUNT) {
          if (requestFilter.sortOrder == SortOrder.ASC) {
            return Number(a.order.approximatedSignerAmount - b.order.approximatedSignerAmount)
          }
          return Number(b.order.approximatedSignerAmount - a.order.approximatedSignerAmount)
        }
        if (requestFilter.sortOrder == SortOrder.ASC) {
          return Number(a.order.approximatedSenderAmount - b.order.approximatedSenderAmount)
        }
        return Number(b.order.approximatedSenderAmount - a.order.approximatedSenderAmount)
      });
    const totalResultsCount = totalResults.length;
    const orders: Record<string, IndexedOrder<FullOrderERC20>> = totalResults
      .slice((requestFilter.page - 1) * elementPerPage, requestFilter.page * elementPerPage)
      .reduce((total, indexedOrder) => {
        const orderId = indexedOrder['hash'];
        if (orderId) {
          return { ...total, [orderId]: this.mapToERC20IndexedOrderResponse(indexedOrder) };
        }
        console.warn("InMemoryDb - Defect Object:", indexedOrder);
        return { ...total };
      }, {});

    return Promise.resolve({
      orders,
      pagination: computePagination(elementPerPage, totalResultsCount, requestFilter.page),
      ordersForQuery: totalResultsCount
    });
  }

  addOrderERC20(indexedOrder: IndexedOrder<DbOrderERC20>) {
    this.erc20Database[indexedOrder.hash!] = indexedOrder;
    const order = indexedOrder.order as DbOrderERC20;
    this.filters.addSignerToken(order.signerToken, order.approximatedSignerAmount);
    this.filters.addSenderToken(order.senderToken, order.approximatedSenderAmount);
    return Promise.resolve();
  }

  async addAllOrderERC20(orders: Record<string, IndexedOrder<DbOrderERC20>>): Promise<void> {
    await Promise.all(Object.keys(orders).map(async hash => {
      await this.addOrderERC20(orders[hash]);
    }));
    return Promise.resolve();
  }

  deleteOrderERC20(nonce: string, signerWallet: string): Promise<void> {
    const orderToDelete = Object.values(this.erc20Database).find((indexedOrder) => {
      const order = indexedOrder.order as DbOrderERC20
      return order.nonce === nonce && order.signerWallet === signerWallet
    });
    if (orderToDelete && orderToDelete.hash) {
      delete this.erc20Database[orderToDelete.hash];
    }
    return Promise.resolve();
  }

  deleteExpiredOrderERC20(timestampInSeconds: number) {
    const hashToDelete: string[] = Object.keys(this.erc20Database).filter((key: string) => {
      return this.erc20Database[key].order.expiry < timestampInSeconds;
    });
    hashToDelete.forEach(hash => {
      delete this.erc20Database[hash];
    })
    return Promise.resolve();
  }

  getOrderERC20(hash: string): Promise<OrderResponse<FullOrderERC20>> {
    const result: Record<string, IndexedOrder<FullOrderERC20>> = {};
    if (this.erc20Database[hash]) {
      result[hash] = this.mapToERC20IndexedOrderResponse(this.erc20Database[hash]);
      return Promise.resolve({
        orders: result,
        pagination: computePagination(elementPerPage, 1),
        ordersForQuery: 1
      });
    }
    return Promise.resolve({
      orders: result,
      pagination: computePagination(elementPerPage, 0),
      ordersForQuery: 0
    });
  }

  async getOrdersERC20(): Promise<OrderResponse<FullOrderERC20>> {
    const size = Object.keys(this.erc20Database).length;
    const results: Record<string, IndexedOrder<FullOrderERC20>> = {};
    Object.keys(this.erc20Database).forEach(key => {
      results[key] = this.mapToERC20IndexedOrderResponse(this.erc20Database[key])
    })
    return Promise.resolve({
      orders: results,
      pagination: computePagination(size, size),
      ordersForQuery: size
    });
  }

  getFiltersERC20(): Promise<Filters> {
    return Promise.resolve(this.filters);
  }

  orderERC20Exists(hash: string): Promise<boolean> {
    return Promise.resolve(Object.keys(this.erc20Database).indexOf(hash) != -1);
  }

  generateHash(indexedOrder: IndexedOrder<DbOrderERC20 | DbOrder>): string {
    const lightenOrder = { ...indexedOrder.order };
    //@ts-ignore
    delete lightenOrder.approximatedSenderAmount
    //@ts-ignore
    delete lightenOrder.approximatedSignerAmount
    const stringObject = JSON.stringify(lightenOrder);
    const hashed = crypto.createHash("sha256").update(stringObject, "utf-8");
    return hashed.digest("hex");
  }

  ////////////////////////////// Market Place 
  addOrder(indexedOrder: IndexedOrder<DbOrder>): Promise<void> {
    this.orderDatabase[indexedOrder.hash!] = indexedOrder;
    return Promise.resolve()
  }

  async addAllOrder(indexedOrders: Record<string, IndexedOrder<DbOrder>>): Promise<void> {
    await Promise.all(Object.keys(indexedOrders).map(async hash => {
      await this.addOrder(indexedOrders[hash]);
    }));
    return Promise.resolve();
  }

  deleteOrder(nonce: string, signerWallet: string): Promise<void> {
    const orderToDelete = Object.values(this.orderDatabase).find((indexedOrder) => {
      const order = indexedOrder.order as DbOrder
      return order.nonce === nonce
    });
    if (orderToDelete && orderToDelete.hash) {
      delete this.orderDatabase[orderToDelete.hash];
    }
    return Promise.resolve();
  }
  deleteExpiredOrder(timestampInSeconds: number): Promise<void> {
    const hashToDelete: string[] = Object.keys(this.orderDatabase).filter((key: string) => {
      return this.orderDatabase[key].order.expiry < timestampInSeconds;
    });
    hashToDelete.forEach(hash => {
      delete this.orderDatabase[hash];
    })
    return Promise.resolve();
  }

  getOrder(hash: string): Promise<OrderResponse<FullOrder>> {
    const result: Record<string, IndexedOrder<FullOrder>> = {};
    if (this.orderDatabase[hash]) {
      result[hash] = this.mapToIndexedOrderResponse(this.orderDatabase[hash]);
      return Promise.resolve({
        orders: result,
        pagination: computePagination(elementPerPage, 1),
        ordersForQuery: 1
      });
    }
    return Promise.resolve({
      orders: result,
      pagination: computePagination(elementPerPage, 0),
      ordersForQuery: 0
    });
  }

  getOrders(): Promise<OrderResponse<FullOrder>> {
    const size = Object.keys(this.orderDatabase).length;
    const results: Record<string, IndexedOrder<FullOrder>> = {};
    Object.keys(this.orderDatabase).forEach(key => {
      results[key] = this.mapToIndexedOrderResponse(this.orderDatabase[key])
    })
    return Promise.resolve({
      orders: results,
      pagination: computePagination(size, size),
      ordersForQuery: size
    });
  }

  getOrdersBy(requestFilter: RequestFilter): Promise<OrderResponse<FullOrder>> {
    const totalResults = Object.values(this.orderDatabase).filter((indexedOrder: IndexedOrder<DbOrder>) => {
      const order = indexedOrder.order;
      let isFound = true;
      if (requestFilter.signerAddress != undefined) { isFound = isFound && requestFilter.signerAddress.indexOf(order.signer.wallet) !== -1; }
      if (requestFilter.senderAddress != undefined) { isFound = isFound && requestFilter.senderAddress.indexOf(order.sender.wallet) !== -1; }
      return isFound;
    })
      .sort((a, b) => {
        if (requestFilter.sortField == SortField.SIGNER_AMOUNT) {
          if (requestFilter.sortOrder == SortOrder.ASC) {
            return Number(a.order.signer.approximatedAmount - b.order.signer.approximatedAmount)
          }
          return Number(b.order.signer.approximatedAmount - a.order.signer.approximatedAmount)
        }
        else if (requestFilter.sortField == SortField.SENDER_AMOUNT) {
          if (requestFilter.sortOrder == SortOrder.ASC) {
            return Number(a.order.sender.approximatedAmount - b.order.sender.approximatedAmount)
          }
          return Number(b.order.sender.approximatedAmount - a.order.sender.approximatedAmount)
        }
        if (requestFilter.sortOrder == SortOrder.ASC) {
          return Number(a.order.expiry - b.order.expiry)
        }
        return Number(b.order.expiry - a.order.expiry)
      });
    const totalResultsCount = totalResults.length;
    const orders: Record<string, IndexedOrder<FullOrder>> = totalResults
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
      pagination: computePagination(elementPerPage, totalResultsCount, requestFilter.page),
      ordersForQuery: totalResultsCount
    });
  }

  orderExists(hash: string): Promise<boolean> {
    return Promise.resolve(!!this.orderDatabase[hash])
  }

  /////////////////////////////
  erase() {
    this.erc20Database = {};
    this.orderDatabase = {};
    this.filters = new Filters();
    return Promise.resolve();
  }

  close() {
    return Promise.resolve();
  }

  private mapToERC20IndexedOrderResponse(indexedOrder: IndexedOrder<DbOrderERC20>): IndexedOrder<FullOrderERC20> {
    return {
      hash: indexedOrder.hash,
      addedOn: indexedOrder.addedOn,
      order: mapAnyToFullOrderERC20(indexedOrder.order)
    };
  }

  private mapToIndexedOrderResponse(indexedOrder: IndexedOrder<DbOrder>): IndexedOrder<FullOrder> {
    return {
      hash: indexedOrder.hash,
      addedOn: indexedOrder.addedOn,
      order: mapAnyToFullOrder(indexedOrder.order)
    };
  }
}