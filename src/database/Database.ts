import { OrderResponse, RequestFilter } from '@airswap/libraries';
import { IndexedOrder } from '../model/IndexedOrder.js';
import { Filters } from './filter/Filters.js';

export interface Database {
    addOrder(IndexedOrder: IndexedOrder): Promise<void>;

    addAll(orders: Record<string, IndexedOrder>): Promise<void>;

    deleteOrder(nonce: string, signerWallet: string): Promise<void>;

    deleteExpiredOrder(timestampInSeconds: number): Promise<void>;

    getOrder(hash: string): Promise<OrderResponse>;

    getOrders(): Promise<OrderResponse>;

    getOrderBy(requestFilter: RequestFilter): Promise<OrderResponse>;

    orderExists(hash: string): Promise<boolean>;

    generateHash(indexedOrder: IndexedOrder): string;

    getFilters(): Promise<Filters>;

    connect(databaseName: string, deleteOnStart: boolean): Promise<void>;

    close(): Promise<void>;

}