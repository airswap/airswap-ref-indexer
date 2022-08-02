import { IndexedOrderError } from "./IndexedOrderError.js";

export class NotFound extends IndexedOrderError {
    constructor(message: string) {
        super(message);
        this.code = 404;
    }
}