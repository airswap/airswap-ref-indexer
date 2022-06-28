import { Pagination } from './Pagination.js';
import { Filters } from './../database/filter/Filters';
import { IndexedOrder } from './IndexedOrder';

export class OrderResponse {
    orders: Record<string, IndexedOrder>;
    pagination: Pagination;
    filters: Filters | undefined;
    entriesForQuery: number;

    constructor(orders: Record<string, IndexedOrder>, pagination: Pagination, entriesForQuery: number, filters?: Filters) {
        this.orders = orders;
        this.pagination = pagination;
        this.filters = filters;
        this.entriesForQuery = entriesForQuery;
    }
}