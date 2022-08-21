import { Order } from '@airswap/typescript';

export class IndexedOrderResponse {
    hash: string | undefined;
    order: Order;
    addedOn: number;

    constructor(order: Order, addedOn: number, hash?: string) {
        this.hash = hash;
        this.order = order;
        this.addedOn = addedOn;
    }
}