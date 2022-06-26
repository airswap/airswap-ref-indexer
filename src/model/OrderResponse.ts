import { Pagination } from './Pagination.js';
import { Filters } from './../database/filter/Filters';
import { IndexedOrder } from './IndexedOrder';

export class OrderResponse {
    orders: Record<string, IndexedOrder>;
    pagination: Pagination;
    filters: Filters;

    constructor(orders: Record<string, IndexedOrder>, pagination: Pagination, filters?: Filters) {
        this.orders = orders;
        this.pagination = pagination;
        this.filters = filters;
    }
}