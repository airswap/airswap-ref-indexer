import { IndexedOrderError } from '@airswap/libraries/build/src/Indexer.js';

export class NotFound extends IndexedOrderError {
    constructor(message: string) {
        super(message);
        this.code = 404;
    }
}