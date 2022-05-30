import { Order } from '@airswap/typescript';


export class OtcOrder {
    id: string;
    order: Order;
    addedOn: number;

    constructor(unsignedOrder: Order, addedOn: number, id?: string) {
        this.id = id;
        this.order = unsignedOrder;
        this.addedOn = addedOn;
    }
}