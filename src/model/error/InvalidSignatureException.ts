import { IndexedOrderError } from "@airswap/libraries";

export class InvalidSignatureException extends IndexedOrderError {
    constructor() {
        super("Invalid signature");
        this.code = 400;
    }
}
