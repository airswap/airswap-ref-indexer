import { DbOrderMarketPlace } from 'model/DbOrderTypes.js';

export class IndexedOrderMarkeplace {
    hash: string | undefined;
    order: DbOrderMarketPlace;
    addedOn: number;

    constructor(dbOrderMarketPlace: DbOrderMarketPlace, addedOn: number, hash?: string) {
        this.hash = hash;
        this.order = dbOrderMarketPlace;
        this.addedOn = addedOn;
    }
}