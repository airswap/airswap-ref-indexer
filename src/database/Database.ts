import { OrderResponse } from './../model/OrderResponse.js';
import { OtcOrder } from '../model/OtcOrder.js';
import { Filters } from './filter/Filters.js';
import { RequestFilter } from './filter/RequestFilter.js';

export interface Database {
    addOrder(OtcOrder: OtcOrder): Promise<void>;

    addAll(orders: Record<string, OtcOrder>): Promise<void>;

    deleteOrder(id: String): Promise<void>;

    getOrder(id: string): Promise<OrderResponse>;

    getOrders(): Promise<OrderResponse>;

    getOrderBy(requestFilter: RequestFilter): Promise<OrderResponse>;

    orderExists(id: string): Promise<boolean>;

    generateId(otcOrder: OtcOrder): string;

    getFilters(): Promise<Filters>;
}