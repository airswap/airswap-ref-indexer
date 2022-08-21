export class AmountLimitFilter {
    min: BigInt;
    max: BigInt;

    constructor(min: BigInt, max: BigInt ) {
        this.min = min;
        this.max = max;
    }
}