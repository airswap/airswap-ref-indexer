import { FullOrder, FullOrderERC20, IndexedOrder, OrderResponse, OrderFilter, SortField, SortOrder } from '@airswap/types';
import crypto from "crypto";
import { Database } from './Database.js';
import { DbOrderERC20, DbOrder, DbOrderParty, DbOrderFilter } from '../model/DbOrderTypes.js';
import { mapAnyToFullOrderERC20 } from '../mapper/mapAnyToFullOrderERC20.js';
import { mapAnyToFullOrder } from '../mapper/mapAnyToFullOrder.js';

export class InMemoryDatabase implements Database {
  private erc20Database: Record<string, IndexedOrder<DbOrderERC20>>;
  private orderDatabase: Record<string, IndexedOrder<DbOrder>>;
  private tokens: string[];

  constructor() {
    this.erc20Database = {};
    this.orderDatabase = {};
    this.tokens = [];
  }

  connect(databaseName: string, deleteOnStart: boolean): Promise<void> {
    return Promise.resolve();
  }

  getOrdersERC20By(orderFilter: DbOrderFilter): Promise<OrderResponse<FullOrderERC20>> {
    const totalResults = Object.values(this.erc20Database).filter((indexedOrder: IndexedOrder<DbOrderERC20>) => {
      const order = indexedOrder.order;
      let isFound = true;
      if (orderFilter.signerTokens != undefined) { isFound = isFound && orderFilter.signerTokens.indexOf(order.signerToken) !== -1; }
      if (orderFilter.senderTokens != undefined) { isFound = isFound && orderFilter.senderTokens.indexOf(order.senderToken) !== -1; }
      if (orderFilter.signerWallet != undefined) { isFound = isFound && orderFilter.signerWallet === order.signerWallet; }
      if (orderFilter.senderWallet != undefined) { isFound = isFound && orderFilter.senderWallet === order.senderWallet; }
      if (orderFilter.senderMinAmount != undefined) { isFound = isFound && order.approximatedSenderAmount >= orderFilter.senderMinAmount; }
      if (orderFilter.senderMaxAmount != undefined) { isFound = isFound && order.approximatedSenderAmount <= orderFilter.senderMaxAmount; }
      if (orderFilter.signerMinAmount != undefined) { isFound = isFound && order.approximatedSignerAmount >= orderFilter.signerMinAmount; }
      if (orderFilter.signerMaxAmount != undefined) { isFound = isFound && order.approximatedSignerAmount <= orderFilter.signerMaxAmount; }
      if (orderFilter.orderNonce != undefined) { isFound = isFound && order.nonce == orderFilter.orderNonce; }
      return isFound;
    })
      .sort((a, b) => {
        if (orderFilter.sortField == SortField.SIGNER_AMOUNT) {
          if (orderFilter.sortOrder == SortOrder.ASC) {
            return Number(a.order.approximatedSignerAmount - b.order.approximatedSignerAmount)
          }
          return Number(b.order.approximatedSignerAmount - a.order.approximatedSignerAmount)
        }
        else if (orderFilter.sortField == SortField.SENDER_AMOUNT) {
          if (orderFilter.sortOrder == SortOrder.ASC) {
            return Number(a.order.approximatedSenderAmount - b.order.approximatedSenderAmount)
          }
          return Number(b.order.approximatedSenderAmount - a.order.approximatedSenderAmount)
        }
        else if (orderFilter.sortField == SortField.NONCE) {
          if (orderFilter.sortOrder == SortOrder.ASC) {
            return Number(a.order.nonce - b.order.nonce)
          }
          return Number(b.order.nonce - a.order.nonce)
        }
        if (orderFilter.sortOrder == SortOrder.ASC) {
          return Number(a.order.expiry - b.order.expiry)
        }
        return Number(b.order.expiry - a.order.expiry)
      });
    const totalResultsCount = totalResults.length;
    const orders: Record<string, IndexedOrder<FullOrderERC20>> = totalResults
      .slice(orderFilter.offset, orderFilter.offset + orderFilter.limit)
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
      pagination: { offset: orderFilter.offset, limit: orderFilter.limit, total: totalResultsCount },
    });
  }

  addOrderERC20(indexedOrder: IndexedOrder<DbOrderERC20>) {
    this.erc20Database[indexedOrder.hash!] = indexedOrder;
    const order = indexedOrder.order as DbOrderERC20;
    this.addToken(order.signerToken);
    this.addToken(order.senderToken);
    return Promise.resolve();
  }

  async addAllOrderERC20(orders: Record<string, IndexedOrder<DbOrderERC20>>): Promise<void> {
    await Promise.all(Object.keys(orders).map(async hash => {
      await this.addOrderERC20(orders[hash]);
    }));
    return Promise.resolve();
  }

  deleteOrderERC20(nonce: number, signerWallet: string): Promise<void> {
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
        pagination: { offset: 0, limit: 1, total: 1 },
      });
    }
    return Promise.resolve({
      orders: result,
      pagination: { offset: 0, limit: 1, total: 0 },
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
      pagination: { offset: 0, limit: -1, total: size },
    });
  }

  getTokens(): Promise<string[]> {
    return Promise.resolve(this.tokens);
  }

  private addToken(token: string) {
    if (!this.tokens.includes(token)) {
      this.tokens.push(token);
    }
  }

  orderERC20Exists(hash: string): Promise<boolean> {
    return Promise.resolve(Object.keys(this.erc20Database).indexOf(hash) != -1);
  }

  generateHashERC20(indexedOrderERC20: IndexedOrder<DbOrderERC20>): string {
    const lightenOrder: Partial<DbOrderERC20> = { ...indexedOrderERC20.order };
    if (lightenOrder.approximatedSenderAmount) {
      delete lightenOrder.approximatedSenderAmount
    }
    if (lightenOrder.approximatedSignerAmount) {
      delete lightenOrder.approximatedSignerAmount
    }
    const stringObject = JSON.stringify(lightenOrder);
    const hashed = crypto.createHash("sha256").update(stringObject, "utf-8");
    return hashed.digest("hex");
  }

  generateHash(indexedOrder: IndexedOrder<DbOrder>): string {
    const signer: Partial<DbOrderParty> = { ...indexedOrder.order.signer };
    const sender: Partial<DbOrderParty> = { ...indexedOrder.order.sender };
    delete signer.approximatedAmount
    delete sender.approximatedAmount
    const lightenOrder = { ...indexedOrder.order, signer, sender }
    const stringObject = JSON.stringify(lightenOrder);
    const hashed = crypto.createHash("sha256").update(stringObject, "utf-8");
    return hashed.digest("hex");
  }

  ////////////////////////////// Non ERC20
  addOrder(indexedOrder: IndexedOrder<DbOrder>): Promise<void> {
    this.orderDatabase[indexedOrder.hash!] = indexedOrder;
    this.addToken(indexedOrder.order.signer.token)
    this.addToken(indexedOrder.order.sender.token)
    return Promise.resolve()
  }

  async addAllOrder(indexedOrders: Record<string, IndexedOrder<DbOrder>>): Promise<void> {
    await Promise.all(Object.keys(indexedOrders).map(async hash => {
      await this.addOrder(indexedOrders[hash]);
    }));
    return Promise.resolve();
  }

  deleteOrder(nonce: number, signerWallet: string): Promise<void> {
    const orderToDelete = Object.values(this.orderDatabase).find((indexedOrder) => {
      const order = indexedOrder.order as DbOrder
      return order.nonce === nonce && order.signer.wallet === signerWallet
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
        pagination: { offset: 0, limit: 1, total: 1 },
      });
    }
    return Promise.resolve({
      orders: result,
      pagination: { offset: 0, limit: 1, total: 0 },
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
      pagination: { offset: 0, limit: -1, total: size },
    });
  }

  getOrdersBy(orderFilter: DbOrderFilter): Promise<OrderResponse<FullOrder>> {
    const totalResults = Object.values(this.orderDatabase).filter((indexedOrder: IndexedOrder<DbOrder>) => {
      const order = indexedOrder.order;
      let isFound = true;
      if (orderFilter.signerWallet != undefined) { isFound = isFound && order.signer.wallet == orderFilter.signerWallet; }
      if (orderFilter.senderWallet != undefined) { isFound = isFound && order.sender.wallet == orderFilter.senderWallet; }
      if (orderFilter.senderMinAmount != undefined) { isFound = isFound && order.sender.approximatedAmount >= orderFilter.senderMinAmount; }
      if (orderFilter.senderMaxAmount != undefined) { isFound = isFound && order.sender.approximatedAmount <= orderFilter.senderMaxAmount; }
      if (orderFilter.signerMinAmount != undefined) { isFound = isFound && order.signer.approximatedAmount >= orderFilter.signerMinAmount; }
      if (orderFilter.signerMaxAmount != undefined) { isFound = isFound && order.signer.approximatedAmount <= orderFilter.signerMaxAmount; }
      if (orderFilter.signerTokens != undefined) { isFound = isFound && orderFilter.signerTokens.indexOf(order.signer.token) !== -1; }
      if (orderFilter.senderTokens != undefined) { isFound = isFound && orderFilter.senderTokens.indexOf(order.sender.token) !== -1; }
      if (orderFilter.orderNonce != undefined) { isFound = isFound && order.nonce == orderFilter.orderNonce; }
      if (orderFilter.signerIds != undefined) { isFound = isFound && orderFilter.signerIds.indexOf(order.signer.id) !== -1; }
      if (orderFilter.senderIds != undefined) { isFound = isFound && orderFilter.senderIds.indexOf(order.sender.id) !== -1; }
      return isFound;
    })
      .sort((a, b) => {
        if (orderFilter.sortField == SortField.SIGNER_AMOUNT) {
          if (orderFilter.sortOrder == SortOrder.ASC) {
            return Number(a.order.signer.approximatedAmount - b.order.signer.approximatedAmount)
          }
          return Number(b.order.signer.approximatedAmount - a.order.signer.approximatedAmount)
        }
        else if (orderFilter.sortField == SortField.SENDER_AMOUNT) {
          if (orderFilter.sortOrder == SortOrder.ASC) {
            return Number(a.order.sender.approximatedAmount - b.order.sender.approximatedAmount)
          }
          return Number(b.order.sender.approximatedAmount - a.order.sender.approximatedAmount)
        }
        else if (orderFilter.sortField == SortField.NONCE) {
          if (orderFilter.sortOrder == SortOrder.ASC) {
            return Number(a.order.nonce - b.order.nonce)
          }
          return Number(b.order.nonce - a.order.nonce)
        }
        if (orderFilter.sortOrder == SortOrder.ASC) {
          return Number(a.order.expiry - b.order.expiry)
        }
        return Number(b.order.expiry - a.order.expiry)
      });
    const totalResultsCount = totalResults.length;
    const orders: Record<string, IndexedOrder<FullOrder>> = totalResults
      .slice(orderFilter.offset, orderFilter.offset + orderFilter.limit)
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
      pagination: { offset: orderFilter.offset, limit: orderFilter.limit, total: totalResultsCount },
    });
  }

  orderExists(hash: string): Promise<boolean> {
    return Promise.resolve(!!this.orderDatabase[hash])
  }

  /////////////////////////////
  erase() {
    this.erc20Database = {};
    this.orderDatabase = {};
    this.tokens = [];
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