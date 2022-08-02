export abstract class IndexedOrderError extends Error {
    public code!: number;
    constructor(message: string) {
        super(message);
    }
}