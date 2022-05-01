import { TransactionStatus } from './../TransactionStatus';
import { stringToTransactionStatus } from "../TransactionStatus";

describe("stringToTransactionStatus", () => {
    test("should match value", () => {
        expect(stringToTransactionStatus("canceled")).toBe(TransactionStatus.CANCELED);
        expect(stringToTransactionStatus("CANCELED")).toBe(TransactionStatus.CANCELED);
        expect(stringToTransactionStatus("in_progress")).toBe(TransactionStatus.IN_PROGRESS);
        expect(stringToTransactionStatus("IN_PROGRESS")).toBe(TransactionStatus.IN_PROGRESS);
        expect(stringToTransactionStatus("done")).toBe(TransactionStatus.DONE);
        expect(stringToTransactionStatus("DONE")).toBe(TransactionStatus.DONE);
    });

    test("should return unknown", () => {
        expect(stringToTransactionStatus(null)).toBe(TransactionStatus.UNKNOWN);
        expect(stringToTransactionStatus(undefined)).toBe(TransactionStatus.UNKNOWN);
        expect(stringToTransactionStatus("")).toBe(TransactionStatus.UNKNOWN);
        expect(stringToTransactionStatus("aze")).toBe(TransactionStatus.UNKNOWN);
        // @ts-ignore
        expect(stringToTransactionStatus({})).toBe(TransactionStatus.UNKNOWN);
    });
});