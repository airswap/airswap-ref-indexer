export class IndexedOrder <T> {
    hash: string | undefined;
    order: T;
    addedOn: number;

    constructor(dbOrder: T, addedOn: number, hash?: string) {
        this.hash = hash;
        this.order = dbOrder;
        this.addedOn = addedOn;
    }
}