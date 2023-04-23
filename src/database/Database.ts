import { FullOrder, OrderResponse, RequestFilterERC20 } from '@airswap/types';
import { IndexedOrderMarkeplace } from '../model/IndexedOrderMarkeplace.js';
import { IndexedOrder } from '../model/IndexedOrder.js';
import { Filters } from './filter/Filters.js';
import { FullOrderERC20, RequestFilterMarketPlace } from '@airswap/types';
import { DbOrderERC20, DbOrderMarketPlace } from '../model/DbOrderTypes.js';

export interface Database {
    addOrderERC20(indexedOrderERC20: IndexedOrder<DbOrderERC20>): Promise<void>;
    addOrderMarketPlace(indexedOrderMarketPlace: IndexedOrder<DbOrderMarketPlace>): Promise<void>;

    addAllOrderERC20(indexedOrdersERC20: Record<string, IndexedOrder<DbOrderERC20>>): Promise<void>;
    addAllOrderMarketPlace(indexedOrdersMarketPlace:  Record<string, IndexedOrderMarkeplace>): Promise<void>;

    deleteOrderERC20(nonce: string, signerWallet: string): Promise<void>;
    deleteOrderMarketplace(nonce: string, signerWallet: string): Promise<void>;

    deleteExpiredOrderERC20(timestampInSeconds: number): Promise<void>;
    deleteExpiredOrderMarketPlace(timestampInSeconds: number): Promise<void>;

    getOrderERC20(hash: string): Promise<OrderResponse<FullOrderERC20>>;
    getOrderMarketPlace(hash: string): Promise<OrderResponse<FullOrder>>;

    getOrdersERC20(): Promise<OrderResponse<FullOrderERC20>>;
    getOrdersMarketPlace(): Promise<OrderResponse<FullOrder>>;

    getOrderERC20By(requestFilter: RequestFilterERC20): Promise<OrderResponse<FullOrderERC20>>;
    getOrderMarketPlaceBy(requestFilter: RequestFilterMarketPlace): Promise<OrderResponse<FullOrder>>;


    orderERC20Exists(hash: string): Promise<boolean>;
    orderMarketPlaceExists(hash: string): Promise<boolean>;

    generateHash(indexedOrderERC20: IndexedOrder<DbOrderERC20 | DbOrderMarketPlace>): string;

    getFiltersERC20(): Promise<Filters>;

    connect(databaseName: string, deleteOnStart: boolean): Promise<void>;

    close(): Promise<void>;

}