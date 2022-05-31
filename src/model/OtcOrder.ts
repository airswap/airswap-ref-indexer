import { Order } from '@airswap/typescript';

export class OtcOrder {
    id: string;
    order: Order;
    addedOn: number;

    constructor(order: Order, addedOn: number, id?: string) {
        this.id = id;
        this.order = order;
        this.addedOn = addedOn;
    }
}