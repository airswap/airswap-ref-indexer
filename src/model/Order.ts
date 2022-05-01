import { TransactionStatus } from './TransactionStatus.js';

export class Order {
    id: string;
    from: string;
    fromToken: string;
    toToken: string;
    amountFromToken: number;
    amountToToken: number;
    expirationDate: Date;
    status?: TransactionStatus;

    constructor(from: string, fromToken: string, toToken: string, amountFromToken: number, amountToToken: number, expirationDate: Date, status?: TransactionStatus, id?: string) {
        this.id = id;
        this.from = from;
        this.fromToken = fromToken;
        this.toToken = toToken;
        this.amountFromToken = amountFromToken;
        this.amountToToken = amountToToken;
        this.expirationDate = expirationDate;
        this.status = status;
    }
}