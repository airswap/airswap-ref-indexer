import { SortField } from '../SortField';
import { toSortField } from "../SortField";

describe("toSortField", () => {
    test("should match value", () => {
        expect(toSortField("SENDER_AMOUNT")).toBe(SortField.SENDER_AMOUNT);
        expect(toSortField("sender_amount")).toBe(SortField.SENDER_AMOUNT);
        expect(toSortField("SIGNER_AMOUNT")).toBe(SortField.SIGNER_AMOUNT);
        expect(toSortField("signer_amount")).toBe(SortField.SIGNER_AMOUNT);
    });

    test("should return undefined", () => {
        expect(toSortField(null)).toBe(undefined);
        expect(toSortField(undefined)).toBe(undefined);
        expect(toSortField("")).toBe(undefined);
        expect(toSortField("aze")).toBe(undefined);
        // @ts-ignore
        expect(toSortField({})).toBe(undefined);
    });
});