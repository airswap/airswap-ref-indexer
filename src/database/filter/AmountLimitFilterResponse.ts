import { AmountLimitFilter } from './AmountLimitFilter';

export class AmountLimitFilterResponse {
    min: string;
    max: string;

    constructor(amountLimitFilter: AmountLimitFilter) {
        this.min = String(amountLimitFilter.min);
        this.max = String(amountLimitFilter.max);
    }
}