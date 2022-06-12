export class AmountLimitFilter {
    min: number;
    max: number;

    constructor(min: number = 0, max: number = 0) {
        this.min = min;
        this.max = max;
    }
}