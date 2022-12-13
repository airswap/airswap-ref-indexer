import { IndexedOrderError } from '@airswap/libraries';

export class NotFound extends IndexedOrderError {
    constructor(message: string) {
        super(message);
        this.code = 404;
    }
}