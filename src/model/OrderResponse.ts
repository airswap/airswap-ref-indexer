import { Filters } from './../database/filter/Filters';
import { OtcOrder } from './OtcOrder';

export class OrderResponse {
    orders: Record<string, OtcOrder>;
    totalPages: number;
    filters: Filters;

    constructor(orders: Record<string, OtcOrder>, totalPages: number, filters?: Filters) {
        this.orders = orders;
        this.totalPages = totalPages;
        this.filters = filters;
    }
}