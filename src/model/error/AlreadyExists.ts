import { IndexedOrderError } from "./IndexedOrderError";

export class AlreadyExistsError extends IndexedOrderError {
    constructor() {
        super("Already exists");
        this.code = 204;
    }
}