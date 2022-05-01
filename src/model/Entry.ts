import { TransactionStatus } from './TransactionStatus.js';

export class Entry {
    by: string;
    from: string;
    to: string;
    nb: number;
    price: number;
    status: TransactionStatus;

    constructor(by: string, from: string, to: string, nb: number, price: number, status: TransactionStatus) {
        this.by = by;
        this.from = from;
        this.to = to;
        this.nb = nb;
        this.price = price;
        this.status = status;
    }
}

