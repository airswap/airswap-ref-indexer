import { Order } from '@airswap/typescript';

export class OtcOrder {
    id: string;
    order: Order;
    addedOn: string;

    constructor(order: Order, addedOn: string, id?: string) {
        this.id = id;
        this.order = order;
        this.addedOn = addedOn;
    }
}