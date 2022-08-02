import { IndexedOrderError } from "./IndexedOrderError.js";

export class ClientError extends IndexedOrderError {
    constructor(message: string) {
        super(message);
        this.code = 400;
    }
}