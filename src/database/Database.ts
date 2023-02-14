import { OrderResponse as OrderResponseERC20, RequestFilter } from '@airswap/libraries';
import { IndexedOrder as IndexedOrderERC20 } from '../model/IndexedOrder.js';
import { Filters } from './filter/Filters.js';

export interface Database {
    addOrder(IndexedOrderERC20: IndexedOrderERC20): Promise<void>;

    addAll(ordersERC20: Record<string, IndexedOrderERC20>): Promise<void>;

    deleteOrderERC20(nonce: string, signerWallet: string): Promise<void>;

    deleteExpiredOrderERC20(timestampInSeconds: number): Promise<void>;

    getOrderERC20(hash: string): Promise<OrderResponseERC20>;

    getOrdersERC20(): Promise<OrderResponseERC20>;

    getOrderERC20By(requestFilter: RequestFilter): Promise<OrderResponseERC20>;

    orderERC20Exists(hash: string): Promise<boolean>;

    generateHash(indexedOrderERC20: IndexedOrderERC20): string;

    getFiltersERC20(): Promise<Filters>;

    connect(databaseName: string, deleteOnStart: boolean): Promise<void>;

    close(): Promise<void>;

}