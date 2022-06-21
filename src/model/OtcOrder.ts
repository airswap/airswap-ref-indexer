import { DbOrder } from 'model/DbOrder.js';

export class OtcOrder {
    id: string;
    order: DbOrder;
    addedOn: number;

    constructor(dbOrder: DbOrder, addedOn: number, id?: string) {
        this.id = id;
        this.order = dbOrder;
        this.addedOn = addedOn;
    }
}