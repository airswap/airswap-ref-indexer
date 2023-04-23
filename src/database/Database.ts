import { FullOrder, OrderResponse, RequestFilterERC20, IndexedOrder } from '@airswap/types';
import { Filters } from './filter/Filters.js';
import { FullOrderERC20, RequestFilter } from '@airswap/types';
import { DbOrderERC20, DbOrder } from '../model/DbOrderTypes.js';

export interface Database {
    addOrderERC20(indexedOrderERC20: IndexedOrder<DbOrderERC20>): Promise<void>;
    addOrder(indexedOrder: IndexedOrder<DbOrder>): Promise<void>;

    addAllOrderERC20(indexedOrdersERC20: Record<string, IndexedOrder<DbOrderERC20>>): Promise<void>;
    addAllOrder(indexedOrders:  Record<string, IndexedOrder<DbOrder>>): Promise<void>;

    deleteOrderERC20(nonce: string, signerWallet: string): Promise<void>;
    deleteOrder(nonce: string, signerWallet: string): Promise<void>;

    deleteExpiredOrderERC20(timestampInSeconds: number): Promise<void>;
    deleteExpiredOrder(timestampInSeconds: number): Promise<void>;

    getOrderERC20(hash: string): Promise<OrderResponse<FullOrderERC20>>;
    getOrder(hash: string): Promise<OrderResponse<FullOrder>>;

    getOrdersERC20(): Promise<OrderResponse<FullOrderERC20>>;
    getOrders(): Promise<OrderResponse<FullOrder>>;

    getOrderERC20By(requestFilter: RequestFilterERC20): Promise<OrderResponse<FullOrderERC20>>;
    getOrderBy(requestFilter: RequestFilter): Promise<OrderResponse<FullOrder>>;


    orderERC20Exists(hash: string): Promise<boolean>;
    orderExists(hash: string): Promise<boolean>;

    generateHash(indexedOrderERC20: IndexedOrder<DbOrderERC20 | DbOrder>): string;

    getFiltersERC20(): Promise<Filters>;

    connect(databaseName: string, deleteOnStart: boolean): Promise<void>;

    close(): Promise<void>;

}