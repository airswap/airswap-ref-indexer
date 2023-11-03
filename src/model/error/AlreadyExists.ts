import { IndexedOrderError } from "@airswap/libraries";

export class AlreadyExistsError extends IndexedOrderError {
    constructor() {
        super("Already exists");
        this.code = 400;
    }
}
