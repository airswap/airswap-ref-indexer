import { OrderResponse } from './../model/response/OrderResponse.js';
import { IndexedOrder } from '../model/IndexedOrder.js';
import { Filters } from './filter/Filters.js';
import { RequestFilter } from './filter/RequestFilter.js';

export interface Database {
    addOrder(IndexedOrder: IndexedOrder): Promise<void>;

    addAll(orders: Record<string, IndexedOrder>): Promise<void>;

    deleteOrder(hash: String): Promise<void>;

    getOrder(hash: string): Promise<OrderResponse>;

    getOrders(): Promise<OrderResponse>;

    getOrderBy(requestFilter: RequestFilter): Promise<OrderResponse>;

    orderExists(hash: string): Promise<boolean>;

    generateHash(indexedOrder: IndexedOrder): string;

    getFilters(): Promise<Filters>;
}