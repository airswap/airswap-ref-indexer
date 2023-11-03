import { FullOrder, OrderResponse, FullOrderERC20, IndexedOrder } from '@airswap/types';
import { DbOrderERC20, DbOrder, DbOrderFilter } from '../model/DbOrderTypes.js';

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

    getOrdersERC20By(orderFilter: DbOrderFilter): Promise<OrderResponse<FullOrderERC20>>;
    getOrdersBy(orderFilter: DbOrderFilter): Promise<OrderResponse<FullOrder>>;

    orderERC20Exists(hash: string): Promise<boolean>;
    orderExists(hash: string): Promise<boolean>;

    generateHashERC20(indexedOrderERC20: IndexedOrder<DbOrderERC20>): string;
    generateHash(indexedOrder: IndexedOrder<DbOrder>): string;

    getTokens(): Promise<string[]>;

    getLastCheckedBlock(address: string, chainId: number): Promise<number | void>;
    setLastCheckedBlock(address: string, chainId: number, block: number): Promise<void>;
    getAllChainIds(): Promise<number[]>;

    connect(databaseName: string, deleteOnStart: boolean, databasePath: string): Promise<void>;

    close(): Promise<void>;

}