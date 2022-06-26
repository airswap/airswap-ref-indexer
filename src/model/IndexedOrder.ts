import { DbOrder } from 'model/DbOrder.js';

export class IndexedOrder {
    hash: string;
    order: DbOrder;
    addedOn: number;

    constructor(dbOrder: DbOrder, addedOn: number, hash?: string) {
        this.hash = hash;
        this.order = dbOrder;
        this.addedOn = addedOn;
    }
}