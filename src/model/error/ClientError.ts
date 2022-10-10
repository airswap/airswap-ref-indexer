import { IndexedOrderError } from '@airswap/libraries';

export class ClientError extends IndexedOrderError {
    constructor(message: string) {
        super(message);
        this.code = 400;
    }
}