import { Filters } from './../database/filter/Filters';
import { IndexedOrder } from './IndexedOrder';

export class OrderResponse {
    orders: Record<string, IndexedOrder>;
    totalPages: number;
    filters: Filters;

    constructor(orders: Record<string, IndexedOrder>, totalPages: number, filters?: Filters) {
        this.orders = orders;
        this.totalPages = totalPages;
        this.filters = filters;
    }
}