import { IndexedOrderError } from '@airswap/libraries/build/src/Indexer.js';

export class ClientError extends IndexedOrderError {
    constructor(message: string) {
        super(message);
        this.code = 400;
    }
}