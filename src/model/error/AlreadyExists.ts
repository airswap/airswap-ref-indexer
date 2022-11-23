import { IndexedOrderError } from '@airswap/libraries/build/src/Indexer.js';

export class AlreadyExistsError extends IndexedOrderError {
    constructor() {
        super("Already exists");
        this.code = 400;
    }
}