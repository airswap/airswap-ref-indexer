export class AmountLimitFilter {
    min: number;
    max: number;

    constructor(min: number, max: number ) {
        this.min = min;
        this.max = max;
    }
}