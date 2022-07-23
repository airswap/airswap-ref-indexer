import { IndexedOrderError } from "./IndexedOrderError.js";

export class AlreadyExistsError extends IndexedOrderError {
    constructor() {
        super("Already exists");
        this.code = 400;
    }
}