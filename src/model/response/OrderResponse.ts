import { FiltersResponse } from './../../database/filter/FiltersResponse';
import { Pagination } from './../Pagination.js';
import { IndexedOrderResponse } from './IndexedOrderResponse';

export class OrderResponse {
    orders: Record<string, IndexedOrderResponse>;
    pagination: Pagination;
    filters: FiltersResponse | undefined;
    ordersForQuery: number;

    constructor(orders: Record<string, IndexedOrderResponse>, pagination: Pagination, ordersForQuery: number, filters?: FiltersResponse) {
        this.orders = orders;
        this.pagination = pagination;
        this.filters = filters;
        this.ordersForQuery = ordersForQuery;
    }
}