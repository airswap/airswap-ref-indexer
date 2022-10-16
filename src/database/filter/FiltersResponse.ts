import { AmountLimitFilterResponse } from './AmountLimitFilterResponse.js';
import { Filters } from './Filters.js';

export class FiltersResponse {
    signerToken: Record<string, AmountLimitFilterResponse> = {};
    senderToken: Record<string, AmountLimitFilterResponse> = {};

    constructor(filters: Filters) {
        Object.keys(filters.senderToken).forEach(key => {
            this.senderToken[key] = new AmountLimitFilterResponse(filters.senderToken[key]);
        });
        Object.keys(filters.signerToken).forEach(key => {
            this.signerToken[key] = new AmountLimitFilterResponse(filters.signerToken[key]);
        });
    }
}